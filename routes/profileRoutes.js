// routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isLoggedIn } = require('../middleware/authMiddleware');

// Profile page – show user info + list of that user’s recipes
router.get('/profile', isLoggedIn, profileController.getProfile);

// Edit a user’s recipe from the profile page
router.get('/profile/recipes/:id/edit', isLoggedIn, profileController.getEditRecipe);
router.post('/profile/recipes/:id/edit', isLoggedIn, profileController.postEditRecipe);

module.exports = router;
