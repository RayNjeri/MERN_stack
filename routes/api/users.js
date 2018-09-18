const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/Users');
const keys = require('../../config/keys');

router.get('/test', (req, res) =>
  res.json({
    message: 'users works'
  })
);

//create user
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200',
        r: 'pg',
        default: 'mm'
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log('error'));
        });
      });
    }
  });
});

//Login user
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ email: 'User Not Found' });
      }
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(401).send({
          message: 'Incorrect password'
        });
      }
      const secretKey = keys.SecretKey;
      const token = jwt.sign(
        { id: user.id, name: user.name, avatar: user.avatar },
        secretKey,
        { expiresIn: '3600' }
      );
      return res.status(200).send({
        message: 'Success',
        token: 'Bearer ' + token
      });
    })
    .catch(() => {
      res.status(401).send({
        message: 'Invalid login credentials'
      });
    });
});

module.exports = router;
