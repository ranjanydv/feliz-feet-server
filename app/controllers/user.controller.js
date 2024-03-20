const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { user: User, Sequelize } = require("../models");
const UserValidation = require("../validators/user.validator");
const createTokenUser = require("../utils/createTokenUser");
const config = require("../config/auth.config");

async function userList(req, res, next) {
  try {
    const { query, currentUser } = req;
    const validator = new UserValidation({}, "list");

    if (validator.validate(query)) {
      const { page = 0, limit = 0, query = "" } = validator.value;
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
        where: condition,
        order: [["created_at", "DESC"]],
        ...clause,
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({
        status: 400,
        message: "Could not fetch user list",
        errors: validator.errors,
      });
    }
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const { params } = req;
    const validator = new UserValidation({}, "byId");
    if (validator.validate({ ...params })) {
      const response = await User.findById(params.id);
      res.json(response);
    } else {
      res.status(400);
      res.json({
        status: 400,
        message: "Could not fetch user",
        errors: validator.errors,
      });
    }
  } catch (error) {
    next(error);
  }
}

const showCurrentUser = async (req, res) => {
  console.log(req.authData);
  const user = await User.findOne({
    where: {
      id: req.authData.user_id,
    },
    attributes: { exclude: ["password"] },
  });
  res.status(200).json({ message: "User fetched successfully", user });
};

async function upgradeToSeller(req, res, next) {
  try {
    const { body, params, authData } = req;
    const databaseUser = await User.findById(authData.user_id);
    if (databaseUser.role === 2) {
      res
        .status(400)
        .json({ status: 400, message: "Cannot demote Admin to seller" });
      return;
    }
    if (databaseUser.role === 0) {
      await User.update({ role: 1 }, { where: { id: authData.user_id } });
      const updatedUser = await User.findById(authData.user_id);
      const token = createTokenUser(updatedUser);
      res.status(200).send({
        id: updatedUser.id,
        username: updatedUser.username,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role,
        state: updatedUser.state,
        phone_number: updatedUser.phone,
        street_address: updatedUser.street_address,
        city: updatedUser.city,
        province: updatedUser.province,
        zip_code: updatedUser.zip_code,
        accessToken: token,
        expiresIn: config.tokenTTL,
      });
    } else {
      res.status(400).json({ status: 400, message: "Already a seller" });
    }
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { body, params } = req;
    const validator = new UserValidation({}, "update");
    if (validator.validate({ ...params, ...body })) {
      const user = { ...validator.value };
      console.log(user);
      if (user.role) {
        // if (user.role === 0)
        const data = await User.update(
          { role: user.role },
          { where: { id: user.id } }
        );
        res.json(data);
      }
    } else {
      res.status(400);
      res.json({
        status: 400,
        message: "Could not update user",
        errors: validator.errors,
      });
    }
  } catch (error) {
    next(error);
  }
}

async function banUser(req, res, next) {
  try {
    const { params } = req;
    console.log(params.id);
    const userExists = await User.findById(params.id);
    if (!userExists) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    const data = await User.update({ state: 0 }, { where: { id: params.id } });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { body, params, authData } = req;
    const validator = new UserValidation({}, "update");

    if (validator.validate({ ...params, ...body })) {
      const user = { ...validator.value };
      if (authData.role !== 2) {
        if (authData.user_id != params.id) {
          return res.status(401).json({ status: 401, message: "Unauthorized" });
        }
      }

      const userExists = await User.findById(params.id);
      if (!userExists) {
        return res.status(404).json({ status: 404, message: "User not found" });
      }

      const data = {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        street_address: user.street_address,
        city: user.city,
        province: user.province,
        zip_code: user.zip_code,
      };

      await User.update(data, { where: { id: params.id } });
      const updatedUser = await User.findById(params.id);
      const token = createTokenUser(updatedUser);
      res.status(200).send({
        id: updatedUser.id,
        username: updatedUser.username,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role,
        state: updatedUser.state,
        phone_number: updatedUser.phone,
        street_address: updatedUser.street_address,
        city: updatedUser.city,
        province: updatedUser.province,
        zip_code: updatedUser.zip_code,
        accessToken: token,
        expiresIn: config.tokenTTL,
      });
    } else {
      res.status(400);
      res.json({
        status: 400,
        message: "Could not update user",
        errors: validator.errors,
      });
    }
  } catch (error) {
    next(error);
  }
}

const updateUserPassword = async (req, res, next) => {
  try {
    const { body, params } = req;
    const validator = new UserValidation({}, "updatePwd");
    if (validator.validate({ ...params, ...body })) {
      const user = { ...validator.value };
      const databaseUser = await User.findById(params.id);
      if (!databaseUser) {
        res.status(404).json({ status: 404, message: "User not found" });
      }

      const isMatch = await bcrypt.compareSync(
        user.currentPassword,
        databaseUser.password
      );
      if (!isMatch) {
        res
          .status(400)
          .json({ status: 400, message: "Old password does not match" });
      }

      const hashedPassword = await bcrypt.hash(user.newPassword, 10);

      const data = await User.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );
      res.status(200).json(data);
    } else {
      res.status(400).json({
        status: 400,
        message: "Could not update user password",
        errors: validator.errors,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userList,
  getUser,
  upgradeToSeller,
  updateUserRole,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  banUser,
};
