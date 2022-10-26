const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

//AUTHENTICATION MIDDILEWARE
function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.json({ success: false, msg: "unauthorized request" });
  }
  let token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.json({ success: false, msg: "unauthorized request" });
  }
  jwt.verify(token, "ict", (err, payload) => {
    if (err) {
      res.json({ success: false, msg: "unauthorized request" });
    } else {
      req.user = payload;
      console.log(req.user);
      next();
    }
  });
}

//USER REGISTRATION
router.post("/register", async (req, res) => {
  const data = req.body;
  let newUser = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
  };

  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(newUser.password, salt);
  newUser.password = hash; //encrypting the password

  const user = new User(newUser);
  user.save((err, result) => {
    if (err) {
      res.json({ success: false, msg: "fail to add user" });
    } else {
      res.json({ success: true, msg: "User added successfully" });
    }
  });
});

//AUTHENTICATION OR LOGIN
router.post("/login", async (req, res) => {
  const userCred = {
    email: req.body.email,
    password: req.body.password,
  };
  let user = await User.findOne({ email: userCred.email }); //find the email in db

  if (!user) {
    res.json({ success: false, msg: "User is not Found" });
  } else {
    let isMatch = await bcrypt.compare(userCred.password, user.password); // checking the password
    if (!isMatch) {
      res.json({ success: false, msg: "Incorrect Password" });
    } else {
      payload = { id: user._id, email: user.email, name: user.name };
      let token = jwt.sign(payload, "ict");
      res.json({
        success: true,
        token: `Bearer ${token}`,
        user: { user: user.name, user: user.email },
      });
    }
  }
});

router.get("/profile", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
