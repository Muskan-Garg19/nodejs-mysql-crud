const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const port = 8080;
const methodOverride = require('method-override');
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_PASSWORD,
  password: process.env.DB_NAME
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ]
}


//Home page.
app.get("/", (req, res) => {
  let q = 'SELECT count(*) FROM user';
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      res.render("home.ejs", { result });
    })
  } catch {
    console.log(err);
    res.send("Some error!");
  }
})


//show users
app.get("/user", (req, res) => {
  let q = "SELECT id,username,email FROM USER";
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      res.render("show.ejs", { result });
    })
  }
  catch (err) {
    console.log(err);
    res.send("Some error occured");
  }
})


//edit route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id= "${id}"`;
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let userData = result[0];
      res.render("edit.ejs", { userData });
    })
  }
  catch (err) {
    res.render("Some error occured");
  }
})


//update route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUserName } = req.body;
  let q = `SELECT * FROM user WHERE id="${id}"`;

  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let user = result[0];
      if (formPass != user.password) {
        res.send("Wrong passWord");
      }
      else {
        let q2 = `UPDATE user SET username="${newUserName}" WHERE id="${id}"`;
        try {
          connection.query(q2, (err, result) => {
            if (err) {
              throw err;
            }
            res.redirect("/user");
          })
        }
        catch (err) {
          res.send("Some error occured during changes..");
        }
      }
    });
  }
  catch (err) {
    res.send("some error in DB");
    console.log(err);
  }
})


app.get("/user/new", (req, res) => {
  res.render("new.ejs");
})

app.post("/user", (req, res) => {
  const newId = uuidv4();
  let { username, email, password } = req.body;
  let q = `INSERT INTO user (id,username,email,password) VALUES (?,?,?,?)`;
  let data = [newId, username, email, password];
  try {
    connection.query(q, data, (err, result) => {
      if (err) {
        throw err;
      }
      res.redirect("user");
    })
  }
  catch (err) {
    res.send("Any error occured during insertion");
  }
})


app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let q = `DELETE FROM user WHERE id="${id}"`;
  try{
    connection.query(q,(err,result)=>{
      if(err){
        throw err;
      }
      res.redirect("/user");
    })
  }
  catch(err){
    res.send("Any error occured during the deletion..");
  }
})


app.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
})

