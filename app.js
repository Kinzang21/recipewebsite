const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const multer = require('multer');

require('dotenv').config();
const app = express();

// ─── Configure “public/uploads” as a static folder ───
// So uploaded images in “public/uploads/…” are served automatically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─── Multer Storage Setup ───
// We'll store in "public/uploads" using the recipe's filename with timestamp
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    // e.g. "recipe_<timestamp>_<originalname>"
    const ts = Date.now();
    // Ensure we preserve extension:
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `recipe_${ts}_${basename}${ext}`);
  }
});

// Only accept image files
function fileFilter (req, file, cb) {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'), false);
  }
}

// Initialize multer:
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5 MB
});

// ─── Make "upload" available to routes ───
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const profileRoutes = require('./routes/profileRoutes');

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public")); // for CSS/images

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET, // use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

app.use(flash());

// Make userId and flash messages available in all views
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});
app.use((req, res, next) => {
  res.locals.username = req.session.username || "Guest";
  next();
});

// Mount routes
app.use(authRoutes);
app.use(recipeRoutes);
app.use(profileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
