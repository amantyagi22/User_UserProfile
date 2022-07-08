const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const UserProfile = require("../models/UserProfile");
// All users
router.get("/all", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
//Add a User
router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  try {
    const { name, email } = req.body;
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    const newProfile = new UserProfile({
      _id: user._id,
      img: "avatar.jpeg",
    });
    const profile = await newProfile.save();
    res.status(200).json({
      message: "User successfully registered",
      id: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Email already exist", err: err });
  }
});
//Login the user
router.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return { status: "error", error: "Invalid login" };
  }
  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (isPasswordValid) {
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      `${process.env.SECRET_TOKEN}`
    );
    return res.json({ status: "ok", userid: user._id, jwttoken: token });
  } else {
    return res.json({ status: "error", message: "Password is not valid" });
  }
});

//Update the logged in user
router.put("/update/:id", async (req, res) => {
  const token = req.headers.token;
  try {
    const decoded = jwt.verify(token, `${process.env.SECRET_TOKEN}`);
    const email = decoded.email;
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    res.status(200).json({ message: "Updated details", user: user });
  } catch (err) {
    return res.status(500).json({ messsage: "Invalid Token", error: err });
  }
});

module.exports = router;
