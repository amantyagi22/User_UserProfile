const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const UserProfileSchema = new Schema({
  userId: {
    type: String,
  },
  img: {
    type: String,
    required: true,
  },
  myOrder: {
    type: [String],
    default: [],
  },
});

module.exports = model("UserProfile", UserProfileSchema);
