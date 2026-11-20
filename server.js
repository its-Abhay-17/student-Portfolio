require("dotenv").config();
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const engine = require('ejs-mate');
const connectDB = require("./database/init");
const { service } = require('./models/contact');
const Contact = require("./models/contact");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname, 'public')));

// read form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//app.get('/home', (req, res) => res.render('home'));
app.get('/home', (req,res)=>{
  console.log("home page")
  res.render('home')
})
app.get('/about', (req, res) => res.render('about'));

app.get('/service', async (req, res) => {
  try {
    const allServices = await service.find({});
    console.log("here is service page", allServices);
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
    await Contact.create({ username, phone, email, message });
    console.log("Saved:", { username, phone, email, message });
    return res.redirect('/home');
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error: " + err.message);
  }
});

// Connect to MongoDB first, then start the server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

startServer();
