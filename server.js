// IMPORTS

require("dotenv").config();

const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const express = require("express");
const { json } = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();

const users = [];

app.set("view-engine", "ejs");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/static"));

// SIGN IN SERVICE

app.get("/", (req, res) => {
  res.render("signin.ejs");
});

app.post("/", async (req, res) => {
  const user = users.find((user) => user.email === req.body.email);

  if (user == null) {
    res.redirect("signin_error");
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign(user, process.env.MY_SECRET);
      res.cookie("token", token, { httpOnly: true });
      res.redirect("/secret_list");
    } else {
      res.redirect("signin_error");
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/signin_error", (req, res) => {
  res.render("signin_error.ejs");
});

// SIGN UP SERVICE

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  if (
    !users.some((user) => user.email === req.body.email) &&
    req.body.password === req.body.confirm_password
  ) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      users.push({
        id: Date.now().toString(),
        email: req.body.email,
        password: hashedPassword,
      });
      res.redirect("/");
    } catch {
      res.status(500).send("Error");
    }
    console.log(users);
  } else {
    res.redirect("/signup_error");
  }
});

app.get("/signup_error", (req, res) => {
  res.render("signup_error.ejs");
});

// SECRET LIST SERVICE

app.get("/secret_list", authMiddleware, (req, res) => {
  res.render("secret_list.ejs");
});

function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (token == null) {
    res.redirect("/");
  }

  try {
    jwt.verify(token, process.env.MY_SECRET);
    next();
  } catch {
    res.clearCookie("token");
    res.render("forgotten_password.ejs");
  }
}

// FORGOTTEN PASSWORD SERVICE

app.get("/forgotten_password", (req, res) => {
  res.render("forgotten_password.ejs");
});

app.post("/forgotten_password", (req, res) => {});

function sendEmail(req, res, next) {
  const transporter = nodemailer.createTransport({
    host: "smtp.online.net",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    name: "shdl.fr",
  });

  const mailOptions = {
    from: '"Evil League of Evil" <evilleagueofevil@evilmail.com>',
    to: req.body.email,
    subject: "Reset your password",
    text: "Here is the link to reset your password: ",
    html: "Here is the link to reset your password: ",
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      res.status(500).send("Error");
    } else {
      res.render("email_sent.ejs");
    }
  });
}

// PORT

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
