// middleware/authMiddleware.js

module.exports = {
  isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.redirect('/login');
  }
};
