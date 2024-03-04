const { Op } = require('sequelize');

const { user: User, Sequelize } = require('../models');
const UserValidation = require('../validators/user.validator');
const { authenticateAccount } = require('../middleware/authentication');


async function userList(req, res, next) {
  try {
    const { query, currentUser } = req;
    const validator = new UserValidation({}, 'list');

    if (validator.validate(query)) {
      const { page = 0, limit = 0, query = '' } = validator.value;
      const offset = (page - 1) * limit;
      const condition = {};
      const clause = {};
      if (limit) {
        clause.limit = limit;
      }
      if (offset) {
        clause.offset = offset;
      }
      if (query) {
        condition.username = {
          [Op.like]: `%${query}%`,
        };
      }
      const { count, rows: data } = await User.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch user list', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}


async function getUser(req, res, next) {
  try {
    const { params } = req;
    const validator = new UserValidation({}, 'byId');
    if (validator.validate({ ...params })) {
      const response = await User.findById(params.id);
      res.json(response);
    } else {
      res.status(400);
      res.json({ status: 400, message: 'Could not fetch user', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function upgradeToSeller(req, res, next) {
  try {
    const { body, params } = req;
    const validator = new UserValidation({}, 'update');
    if (validator.validate({ ...params, ...body })) {
      const user = { ...validator.value };
      const databaseUser = await User.findById(params.id);
      if (user.role) {
        if (databaseUser.role === 2) {
          res.status(400).json({ status: 400, message: 'Cannot demote Admin to seller' });
          return;
        }
        if (databaseUser.role === 0) {
          const data = await User.update({ role: 1 }, { where: { id: user.id } });
          res.status(200).json(data);
        } else {
          res.status(400).json({ status: 400, message: 'Already a seller' });
        }
      }
    } else {
      res.status(400).json({ status: 400, message: 'Could not update user role', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { body, params } = req;
    const validator = new UserValidation({}, 'update');
    if (validator.validate({ ...params, ...body })) {
      const user = { ...validator.value };
      console.log(user);
      if (user.role) {
        // if (user.role === 0)
        const data = await User.update({ role: user.role }, { where: { id: user.id } });
        res.json(data);
      }
    } else {
      res.status(400);
      res.json({ status: 400, message: 'Could not update user', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  userList, getUser, upgradeToSeller, updateUserRole,
};