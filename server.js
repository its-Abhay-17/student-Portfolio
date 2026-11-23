require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const engine = require('ejs-mate');
const connectDB = require("./database/init");
const { contact: Contact, service } = require("./models/contact");
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});
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

function validateContact(body) {
  const values = {
    username: (body.username || "").trim(),
    phone: (body.phone || "").replace(/[\s-]/g, ""),
    email: (body.email || "").trim().toLowerCase(),
    message: (body.message || "").trim(),
  };

  const errors = {};

  if (values.username.length < 2 || values.username.length > 50)
    errors.username = "Name must be 2 to 50 characters.";

  if (!/^\+?[0-9]{10,15}$/.test(values.phone))
    errors.phone = "Enter a valid phone number (10 to 15 digits).";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Enter a valid email address.";

  if (values.message.length < 10 || values.message.length > 500)
    errors.message = "Message must be 10 to 500 characters.";

  return { values, errors };
}

app.get('/contact', (req, res) => {
  res.render('contact', { errors: {}, values: {} });
});

app.post('/contact', async (req, res) => {
  const { values, errors } = validateContact(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('contact', { errors, values });
  }

  try {
    await Contact.create(values);
  } catch (err) {
    console.error(err);
    return res.status(500).render('contact', {
      errors: { form: "Something went wrong. Please try again." },
      values,
    });
  }

  // Notify yourself. Separate try/catch so a mail failure
  // doesn't break the form after the data is already saved.
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: values.email,
      subject: `New portfolio message from ${values.username}`,
      text:
        `Name: ${values.username}\n` +
        `Email: ${values.email}\n` +
        `Phone: ${values.phone}\n\n` +
        `Message:\n${values.message}`,
    });
  } catch (err) {
    console.error("Email error:", err);
  }

  return res.render('contact-success', { values });
});

// Only listen when running locally
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`http://localhost:${port}`));
}

module.exports = app;