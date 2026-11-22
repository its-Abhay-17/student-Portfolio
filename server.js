require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const engine = require('ejs-mate');
const connectDB = require("./database/init");
const { contact,service } = require('./models/contact'); // see note below

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to DB on each request (cached, so it's cheap after the first one)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).send("Database connection failed");
  }
});

app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));

app.get('/service', async (req, res) => {
  try {
    const allServices = await service.find({});
    return res.render('service', { allServices });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error fetching services");
  }
});

app.get('/contact', (req, res) => res.render('contact'));

app.post('/contact', async (req, res) => {
  try {
    const { username, phone, email, message } = req.body;
    await contact.create({ username, phone, email, message });
    return res.redirect('/home');
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error: " + err.message);
  }
});

// Only listen when running locally
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`http://localhost:${port}`));
}

module.exports = app;