const express = require("express");
const bcrypt = require("bcrypt");
const { json } = require("express");

const app = express();

const users = [];

app.set("view-engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      res.redirect("/secret_list");
    } else {
      res.redirect("signin_error");
    }
  } catch {
    res.status(500).send();
  }
  console.log(user);
});

app.get("/signin_error", (req, res) => {
  res.render("signin_error.ejs");
});

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
      res.status(500).send();
    }
    console.log(users);
  } else {
    res.redirect("/signup_error");
  }
});

app.get("/signup_error", (req, res) => {
  res.render("signup_error.ejs");
});

app.get("/secret_list", (req, res) => {
  res.render("secret_list.ejs");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
