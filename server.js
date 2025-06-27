// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('DB Error:', err));

// File storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Define Mongoose model
const Application = mongoose.model('Application', {
  fullname: String,
  id_number: String,
  email: String,
  phone: String,
  school: String,
  documents: [String]
});

// Route to handle form
app.post('/apply', upload.array('documents'), async (req, res) => {
  try {
    const documentPaths = req.files.map(file => file.path);
    const newApp = new Application({
      ...req.body,
      documents: documentPaths
    });
    await newApp.save();
    res.json({ message: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
