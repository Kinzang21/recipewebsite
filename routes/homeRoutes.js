const express = require('express');

const router = express.Router();

// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Home page route (after login)
router.get('/home', isLoggedIn, (req, res) => {
    res.render('home', { user: req.session.user });
});

router.get('/', (req, res) => {
  if (req.session.user) {
    res.render('home', {
      userId: req.session.user.id,
      username: req.session.user.username
    });
  } else {
    res.render('home');
  }
});

module.exports = router;
