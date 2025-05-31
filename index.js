const { faker, tr } = require('@faker-js/faker');
const mysql=require("mysql2");
const express=require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

const connection=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"Jaga@2025",
  database:"delta_app"
});

let getRandomUser = () =>{
  return [
     faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
     faker.internet.password(),
  ];
};

app.get("/",(req,res)=>{
  let q=`select count(*) from user`;
  try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    let count=result[0]["count(*)"];
    res.render("home.ejs",{count});
  });
}catch(err){
  console.log(err);
  res.send("error in db")
}
 
});
app.get("/user",(req,res)=>{
  let q=`select * from user`;
  try{
  connection.query(q,(err,users)=>{
    if(err) throw err;

    res.render("show.ejs",{users});
  });
}catch(err){
  console.log(err);
  res.send("error in db")
}

});
app.get("/user/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`select * from user where id='${id}'`;
   try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    let user=result[0];
    res.render("edit.ejs",{user});
  });
}catch(err){
  console.log(err);
  res.send("error in db")
}
  
});

app.patch("/user/:id",(req,res)=>{
  let {id}=req.params;
  let{password:formPass,username:newUsername}=req.body;
  let q=`select * from user where id='${id}'`;
  try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    let user=result[0];
    if(formPass!=user.password){
      res.send("wrong password");
    }else{
      let q2=`UPDATE user SET username='${newUsername}' where id='${id}'`;
      connection.query(q2,(err,result)=>{
        if(err) throw err;
        res.redirect("/user");
      })
    }
  });
}catch(err){
  console.log(err);
  res.send("error in db");
}
});

app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
});

app.post("/user/new",(req,res)=>{
  let {username,email,password}=req.body;
  let id=faker.string.uuid();
  let q=`insert into user values('${id}','${username}','${email}','${password}')`;
  console.log(q);
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      res.redirect("/user");
    });
  }
    catch(err){
      res.send("some error occured")
    }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});



app.listen(8080,()=>{
  console.log("server is running on port 8080");
});
