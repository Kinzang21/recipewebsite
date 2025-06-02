// routes/recipeRoutes.js

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const methodOverride = require('method-override');

// This is needed to support `<form method="POST" action="/recipes/edit/123?_method=PUT">`
router.use(methodOverride('_method'));

// Home page (list all recipes; also handles search if '?q=' is given)
router.get('/', recipeController.getHome);

// Add a new recipe (forms)
router.get('/recipes/add', recipeController.getAddRecipe);
router.post('/recipes/add', recipeController.postAddRecipe);

// View recipe details
router.get('/recipes/:id', recipeController.getRecipeDetails);

// Edit an existing recipe
router.get('/recipes/edit/:id', recipeController.getEditRecipe);
router.put('/recipes/edit/:id', recipeController.postEditRecipe);

// Delete a recipe
router.delete('/recipes/delete/:id', recipeController.deleteRecipe);

// Search (just calls getHome under the hood, since `?q=` is sent to getHome)
// But if you want a separate path:
router.get('/search', recipeController.searchRecipes);

module.exports = router;
