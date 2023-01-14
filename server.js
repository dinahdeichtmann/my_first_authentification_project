const express = require("express");
const bcrypt = require("bcrypt");
const { json } = require("express");

const app = express();

const users = [];

app.set("view-engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { name: "Dinah" });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  const user = users.find((user) => user.email === req.body.email);

  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (bcrypt.compare(req.body.password, user.password)) {
      res.send("Success");
    } else {
      res.send("Not allowed");
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});

app.listen(3000);
