// controllers/profileController.js

const Recipe = require('../models/recipeModel');
const User = require('../models/userModel');
const upload = require('../middleware/upload');

module.exports = {
  // Show logged-in user's profile + their recipes
  async getProfile(req, res) {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    try {
      const user = await User.findUserById(req.session.userId);
      if (!user) {
        return res.redirect('/login');
      }

      // Fetch recipes for that user
      const all = await Recipe.getAllRecipes();
      const ownRecipes = all.filter((r) => r.user_id === req.session.userId);

      res.render('profile', {
        userId: req.session.userId,
        username: user.username,
        recipes: ownRecipes,
        currentPage: 'profile'
      });
    } catch (err) {
      console.error(err);
      return res.redirect('/');
    }
  },

  // Show "Edit This Recipe" form in the profile area
  async getEditRecipe(req, res) {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const recipeId = req.params.id;
    try {
      const recipe = await Recipe.getRecipeById(recipeId);
      if (!recipe || recipe.user_id !== req.session.userId) {
        return res.redirect('/profile');
      }

      res.render('edit-profile-recipe', {
        error: null,
        recipe,
        userId: req.session.userId,
        username: req.session.username || null,
        currentPage: 'profile'
      });
    } catch (err) {
      console.error(err);
      return res.redirect('/profile');
    }
  },

  // Handle the actual update from profile
  async postEditRecipe(req, res) {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    upload.single('image')(req, res, async (err) => {
      if (err) {
        const recipe = await Recipe.getRecipeById(req.params.id);
        return res.render('edit-profile-recipe', {
          error: 'Error uploading image: ' + err.message,
          recipe,
          userId: req.session.userId,
          username: req.session.username || null,
          currentPage: 'profile'
        });
      }

      const recipeId = req.params.id;
      const { title, ingredients, steps, cookingTime, category } = req.body;

      try {
        const existingRecipe = await Recipe.getRecipeById(recipeId);
        if (!existingRecipe || existingRecipe.user_id !== req.session.userId) {
          return res.redirect('/profile');
        }

        const imageUrl = req.file ? req.file.filename : existingRecipe.image_url;

        if (!title || !ingredients || !steps || !cookingTime || !category) {
          return res.render('edit-profile-recipe', {
            error: 'All fields are required.',
            recipe: existingRecipe,
            userId: req.session.userId,
            username: req.session.username || null,
            currentPage: 'profile'
          });
        }

        const updated = await Recipe.updateRecipe(
          recipeId,
          req.session.userId,
          title.trim(),
          ingredients.trim(),
          steps.trim(),
          cookingTime.trim(),
          category.trim(),
          imageUrl
        );

        if (!updated) {
          return res.render('edit-profile-recipe', {
            error: 'Update failed.',
            recipe: existingRecipe,
            userId: req.session.userId,
            username: req.session.username || null,
            currentPage: 'profile'
          });
        }

        return res.redirect('/profile');
      } catch (err) {
        console.error(err);
        const existing = await Recipe.getRecipeById(recipeId);
        return res.render('edit-profile-recipe', {
          error: 'Failed to update recipe.',
          recipe: existing,
          userId: req.session.userId,
          username: req.session.username || null,
          currentPage: 'profile'
        });
      }
    });
  }
};
