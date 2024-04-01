const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const detectPort = require('detect-port');
const cors = require('cors');
const Joi = require('joi'); // Import Joi

const app = express();

app.use(cors()); // Enable CORS
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/', // Adjust as necessary
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Define Joi schema to validate incoming data
const gameSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(5).required(),
  items: Joi.array().items(Joi.string()).required(), // Expecting items as an array of strings
  // Note: Image validation is handled separately by Multer
});

// Endpoint for adding a new game
app.post('/add-game', upload.single('itemImage'), (req, res) => {
  // Validate incoming data with Joi
  const { error, value } = gameSchema.validate({
    name: req.body.name,
    description: req.body.description,
    items: req.body['items[]'] ? req.body['items[]'].split(',') : [],
  });

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const filePath = path.join(__dirname, 'videogame.json');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading games file:', err);
      return res.status(500).send('Error reading games data.');
    }
    
    let games = JSON.parse(data);
    games.push({
      name: value.name,
      image: req.file ? req.file.filename : 'default.png', // Fallback to a default image if necessary
      description: value.description,
      items: value.items,
    });
    
    fs.writeFile(filePath, JSON.stringify(games, null, 2), err => {
      if (err) {
        console.error('Error writing games file:', err);
        return res.status(500).send('Error saving new game.');
      }
      res.json({ message: 'Game added successfully' });
    });
  });
});

const PORT = process.env.PORT || 3000;

detectPort(PORT, (err, availablePort) => {
  if (err) {
    console.error('Error detecting port:', err);
    return;
  }

  if (PORT === availablePort) {
    console.log(`Port ${PORT} is available. Starting server on this port.`);
  } else {
    console.warn(`Port ${PORT} is in use. Server starting on an alternative port ${availablePort}.`);
  }

  app.listen(availablePort, () => {
    console.log(`Server is running on port ${availablePort}`);
  });
});
