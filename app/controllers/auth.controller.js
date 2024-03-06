const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('../config/auth.config');
const { user: User, Sequelize,cart:Cart } = require('../models');
const UserValidator = require('../validators/user.validator');

// const Op = Sequelize.Op;


// Prepare user for data entry
function prepareUser(body) {
  const user = { ...body };
  user.password = bcrypt.hashSync(body.password, 8);
  user.role = 0;
  user.state = 1;
  return user;
}

// register function
async function signUp(req, res, next) {
  try {
    const { body } = req;
    const validator = new UserValidator({}, 'create');

    if (!validator.validate(body)) {
      return res.status(400).send({ status: 400, message: validator.errors });
    }
    const user = prepareUser(body);
    const userExist = await User.findOne({
      where: { username: user.username },
    });
    if (userExist) {
      return res.status(409).send({ status: 409, message: 'Account Already Exist!' });
    }

    // Make the first user ADMIN by default
    const userList = await User.findAndCountAll({})
    if (userList.count === 0) {
      user.role = 2;
    }

    // Rest of the users will be assigned USER Role by Default
    const userData = await User.create(user);
    if(userData){
      const createdCartForUser = await Cart.create({user_id:userData.id})
    }
    res.status(201).send({ message: 'User account Created', user: userData,cart:"Cart Initialized" });
  } catch (error) {
    next(error);
  }
}


// Sign In Function
async function signIn(req, res) {
  try {

    const user = await User.findOne({
      where: { username: req.body.username },
    });
    if (!user) {
      return res.status(401).send({ status: 401, message: 'User not found' });
    }

    if (user.state === 0) {
      return res.status(403).send({ status: 403, message: 'Account Banned' });
    }

    const isValidPassword = await bcrypt.compareSync(req.body.password, user.password);
    if (!isValidPassword) {
      return res.status(403).send({ status: 403, accessToken: null, message: 'Invalid Credentials' });
    }
    const token = jwt.sign(
      {
        user_id: user.id,
        role: user.role,
        username: user.username,
      },
      config.secret,
      { expiresIn: config.tokenTTL },
    );
    res.status(200).send({
      id: user.id,
      username: user.username,
      accessToken: token,
      expiresIn: config.tokenTTL,
      role: user.role,
      state: user.state,
    });
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}

module.exports = {
  signUp,
  signIn
};