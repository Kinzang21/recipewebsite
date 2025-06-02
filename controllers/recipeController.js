// controllers/recipeController.js

const Recipe = require('../models/recipeModel');
const upload = require('../middleware/upload');

module.exports = {
  // Home page: list all recipes (with search results if q provided)
  async getHome(req, res) {
    try {
      const recipes = await Recipe.getAllRecipes();
      res.render('index', {
        userId: req.session.userId || null,
        username: req.session.username || null,
        recipes,
        currentPage: 'home'    // ← mark that we're on "home"
      });
    } catch (err) {
      console.error(err);
      res.render('index', {
        userId: req.session.userId || null,
        username: req.session.username || null,
        recipes: [],
        error: 'Could not fetch recipes.',
        currentPage: 'home'
      });
    }
  },

  // Show "Add Recipe" form
  getAddRecipe(req, res) {
    if (!req.session.userId) return res.redirect('/login');
    res.render('add-recipe', {
      error: null,
      userId: req.session.userId,
      currentPage: 'add-recipe'
    });
  },

  // Handle "Add Recipe" form submit
  async postAddRecipe(req, res) {
    if (!req.session.userId) return res.redirect('/login');

    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.render('add-recipe', {
          error: 'Error uploading image: ' + err.message,
          userId: req.session.userId,
          currentPage: 'add-recipe'
        });
      }

      const userId = req.session.userId;
      const { title, ingredients, steps, cookingTime, category } = req.body;
      const imageUrl = req.file ? req.file.filename : null;

      // Basic validation
      if (!title || !ingredients || !steps || !cookingTime || !category) {
        return res.render('add-recipe', {
          error: 'All fields are required.',
          userId: req.session.userId,
          currentPage: 'add-recipe'
        });
      }

      try {
        await Recipe.createRecipe(
          userId,
          title.trim(),
          ingredients.trim(),
          steps.trim(),
          cookingTime.trim(),
          category.trim(),
          imageUrl
        );
        return res.redirect('/');
      } catch (err) {
        console.error(err);
        return res.render('add-recipe', { 
          error: 'Failed to add recipe.',
          userId: req.session.userId,
          currentPage: 'add-recipe'
        });
      }
    });
  },

  // View a single recipe's details
  async getRecipeDetails(req, res) {
    const recipeId = req.params.id;
    try {
      const recipe = await Recipe.getRecipeById(recipeId);
      if (!recipe) {
        return res.render('recipe-details', {
          userId: req.session.userId || null,
          username: req.session.username || null,
          error: 'Recipe not found.',
          recipe: null,
          currentPage: 'recipe-details'
        });
      }
      res.render('recipe-details', {
        userId: req.session.userId || null,
        username: req.session.username || null,
        recipe,
        currentPage: 'recipe-details'
      });
    } catch (err) {
      console.error(err);
      res.render('recipe-details', {
        userId: req.session.userId || null,
        username: req.session.username || null,
        error: 'Could not retrieve recipe.',
        recipe: null
      });
    }
  },

  // Show "Edit Recipe" form (only if the logged-in user is the owner)
  async getEditRecipe(req, res) {
    if (!req.session.userId) return res.redirect('/login');

    const recipeId = req.params.id;
    try {
      const recipe = await Recipe.getRecipeById(recipeId);
      if (!recipe) {
        return res.redirect('/');
      }
      // Ensure only the owner can edit
      if (recipe.user_id !== req.session.userId) {
        return res.redirect('/');
      }

      res.render('edit-profile-recipe', {
        userId: req.session.userId,
        username: req.session.username || null,
        recipe,
        error: null,
        currentPage: 'profile'
      });
    } catch (err) {
      console.error(err);
      return res.redirect('/');
    }
  },

  // Handle "Edit Recipe" submit
  async postEditRecipe(req, res) {
    if (!req.session.userId) return res.redirect('/login');

    upload.single('image')(req, res, async (err) => {
      if (err) {
        const recipe = await Recipe.getRecipeById(req.params.id);
        return res.render('edit-profile-recipe', {
          error: 'Error uploading image: ' + err.message,
          userId: req.session.userId,
          username: req.session.username || null,
          recipe,
          currentPage: 'profile'
        });
      }

      const recipeId = req.params.id;
      const { title, ingredients, steps, cookingTime, category } = req.body;
      
      try {
        const existingRecipe = await Recipe.getRecipeById(recipeId);
        if (!existingRecipe || existingRecipe.user_id !== req.session.userId) {
          return res.redirect('/');
        }

        const imageUrl = req.file ? req.file.filename : existingRecipe.image_url;

        if (!title || !ingredients || !steps || !cookingTime || !category) {
          return res.render('edit-profile-recipe', {
            error: 'All fields are required.',
            userId: req.session.userId,
            username: req.session.username || null,
            recipe: existingRecipe,
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
            error: 'Could not update (not found or not yours).',
            userId: req.session.userId,
            username: req.session.username || null,
            recipe: existingRecipe,
            currentPage: 'profile'
          });
        }

        return res.redirect(`/recipes/${recipeId}`);
      } catch (err) {
        console.error(err);
        const existing = await Recipe.getRecipeById(recipeId);
        return res.render('edit-profile-recipe', {
          error: 'Failed to update recipe.',
          userId: req.session.userId,
          username: req.session.username || null,
          recipe: existing,
          currentPage: 'profile'
        });
      }
    });
  },

  // Delete a recipe (only if logged in & owner)
  async deleteRecipe(req, res) {
    if (!req.session.userId) return res.redirect('/login');

    const recipeId = req.params.id;
    try {
      await Recipe.deleteRecipe(recipeId, req.session.userId);
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  },

  // Search route (q = query string parameter)
  async searchRecipes(req, res) {
    const { q } = req.query;
    try {
      const recipes = await Recipe.searchRecipes(q || '');
      res.render('index', {
        userId: req.session.userId || null,
        username: req.session.username || null,
        recipes
      });
    } catch (err) {
      console.error(err);
      res.render('index', {
        userId: req.session.userId || null,
        username: req.session.username || null,
        recipes: [],
        error: 'Search failed.'
      });
    }
  }
};
