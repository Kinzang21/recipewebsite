// models/recipeModel.js

const pool = require('./db');

module.exports = {
  // CREATE a new recipe
  async createRecipe(userId, title, ingredients, steps, cookingTime, category, imageUrl) {
    const result = await pool.query(
      `INSERT INTO recipes (user_id, title, ingredients, steps, cooking_time, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, title, ingredients, steps, cookingTime, category, imageUrl]
    );
    return result.rows[0];
  },

  // READ all recipes (reverse‐chronological), including owner's username
  async getAllRecipes() {
    const result = await pool.query(
      `SELECT
         recipes.*,
         users.username
       FROM recipes
       JOIN users ON recipes.user_id = users.id
       ORDER BY recipes.created_at DESC`
    );
    return result.rows;
  },

  // READ a single recipe by its ID (plus owner's username)
  async getRecipeById(recipeId) {
    const result = await pool.query(
      `SELECT
         recipes.*,
         users.username
       FROM recipes
       JOIN users ON recipes.user_id = users.id
       WHERE recipes.id = $1`,
      [recipeId]
    );
    return result.rows[0];
  },

  // UPDATE an existing recipe (only its owner can do this; caller must check userId)
  async updateRecipe(id, userId, title, ingredients, steps, cookingTime, category, imageUrl) {
    const result = await pool.query(
      `UPDATE recipes
       SET title = $1,
           ingredients = $2,
           steps = $3,
           cooking_time = $4,
           category = $5,
           image_url = $6
       WHERE id = $7
         AND user_id = $8
       RETURNING *`,
      [title, ingredients, steps, cookingTime, category, imageUrl, id, userId]
    );
    return result.rows[0]; // undefined if no row was updated (e.g. wrong user)
  },

  // DELETE an existing recipe (only if user_id matches)
  async deleteRecipe(id, userId) {
    await pool.query(
      `DELETE FROM recipes
       WHERE id = $1
         AND user_id = $2`,
      [id, userId]
    );
  },

  // SEARCH by title OR category (case‐insensitive)
  async searchRecipes(keyword) {
    const q = `%${keyword.toLowerCase()}%`;
    const result = await pool.query(
      `SELECT
         recipes.*,
         users.username
       FROM recipes
       JOIN users ON recipes.user_id = users.id
       WHERE LOWER(recipes.title) LIKE $1
          OR LOWER(recipes.category) LIKE $1
       ORDER BY recipes.created_at DESC`,
      [q]
    );
    return result.rows;
  },

  // (Optional) LIST recipes by category
  async getRecipesByCategory(category) {
    const q = category.toLowerCase();
    const result = await pool.query(
      `SELECT
         recipes.*,
         users.username
       FROM recipes
       JOIN users ON recipes.user_id = users.id
       WHERE LOWER(recipes.category) = $1
       ORDER BY recipes.created_at DESC`,
      [q]
    );
    return result.rows;
  }
};
