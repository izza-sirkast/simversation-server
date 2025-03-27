const express = require("express");
const { getAllUsers, getByUsername, register, login, logout, getProfile } = require("../controllers/UserController.js");

// Midleware
const validateAuth = require("../middlewares/ValidateAuth.js");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/by-username/:username", validateAuth, getByUsername);

// Auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", getProfile);

module.exports = router;