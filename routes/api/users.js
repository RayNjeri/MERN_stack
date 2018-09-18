const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const User = require('../../models/Users');

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

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: 'User Not Found' });
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        res.json({ message: 'Login successfully' });
      } else {
        return res.status(400).json({ password: 'Password Incorrect!' });
      }
    });
  });
});

module.exports = router;
