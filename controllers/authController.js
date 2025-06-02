// controllers/authController.js

const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

module.exports = {
  // Show registration form
  getRegister(req, res) {
    res.render('signup', { error: null });
  },

  // Handle registration form submit
  async postRegister(req, res) {
    const { username, email, password, password2 } = req.body;

    // 1) All fields required
    if (!username || !email || !password || !password2) {
      return res.render('signup', { error: 'All fields are required.' });
    }

    // 2) Passwords must match
    if (password !== password2) {
      return res.render('signup', { error: 'Passwords do not match.' });
    }

    try {
      // 3) Check if email is already used
      const existingUser = await User.findUserByEmail(email);
      if (existingUser) {
        return res.render('signup', { error: 'Email is already registered.' });
      }

      // 4) Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 5) Create the user
      const newUser = await User.createUser(username, email, hashedPassword);

      // 6) Log them in by setting session
      req.session.userId = newUser.id;
      req.session.username = newUser.username;

      return res.redirect('/');
    } catch (err) {
      console.error(err);
      return res.render('signup', { error: 'Something went wrong. Please try again.' });
    }
  },

  // Show login form
  getLogin(req, res) {
    res.render('login', { error: null });
  },

  // Handle login submit
  async postLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', { error: 'Both email and password are required.' });
    }

    try {
      // 1) Find user by email
      const user = await User.findUserByEmail(email);
      if (!user) {
        return res.render('login', { error: 'Invalid email or password.' });
      }

      // 2) Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render('login', { error: 'Invalid email or password.' });
      }

      // 3) Log them in
      req.session.userId = user.id;
      req.session.username = user.username;

      return res.redirect('/');
    } catch (err) {
      console.error(err);
      return res.render('login', { error: 'Something went wrong. Please try again.' });
    }
  },

  // Logout handler
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error(err);
      res.redirect('/');
    });
  }
};
