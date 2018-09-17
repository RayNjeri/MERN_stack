const express = require('express');
const mongoose = require('mongoose');
const app = express();

const db = require('./config/keys').mongoURI;

mongoose
  .connect(db)
  .then(() => console.log('DB connected'))
  .catch(err => console.log('err', err));

app.get('/', (req, res) => res.send('Hello world'));

const port = process.env.port || 8000;

app.listen(port, () => console.log(`server running on port ${port}`));
