//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Replace the uri string with your connection string.
// below is the cloud version
// const uri =
//   "mongodb+srv://mongoKen:dolly@cluster0.w10yz.mongodb.net/userDB?retryWrites=true&w=majority";

// below is the local version
const uri =
  "mongodb://admin:admin123@192.168.0.21:27017/userDB?authSource=admin&readPreference=primary&ssl=false&directConnection=true";

// below is the short local version
//  const uri = "mongodb://admin:admin123@192.168.0.21:27017/userDB";

mongoose.set("strictQuery", false);
mongoose.connect(uri, { useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const secret = process.env.SECRET;

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", function (req, res) {
  const userName = req.body.username;
  const password = req.body.password;

  User.findOne({ email: userName }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log(`Server started on Port ${port}...`);
});
