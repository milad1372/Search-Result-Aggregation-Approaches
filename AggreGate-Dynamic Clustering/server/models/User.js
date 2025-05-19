const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

// Import schema from Artwork.js
const artworkSchema = require("./Artwork");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    savedArtworks: [artworkSchema],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// Hash user password
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// Custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// When we query a user, we'll also get another field called `artworkCount` with the number of saved artworks we have
userSchema.virtual("artworkCount").get(function () {
  return this.savedArtworks.length;
});

const User = model("User", userSchema);

module.exports = User;
