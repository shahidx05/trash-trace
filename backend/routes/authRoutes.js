// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { loginUser, getMe } = require("../controllers/authController");

// Public Route → Login (Admin + Worker use same login)
router.post("/login", loginUser);

router.get("/me", auth, getMe); 

module.exports = router;
