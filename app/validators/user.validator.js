const Joi = require("joi");
const { joiErrorParser } = require("../lib/common");

const listSchema = Joi.object({
  page: Joi.number(),
  limit: Joi.number(),
  query: Joi.string(),
});

const createSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  phone: Joi.string(),
});

const updateSchema = Joi.object({
  id: Joi.number().required(),
  username: Joi.string(),
  password: Joi.string(),
  state: Joi.number(),
  role:Joi.number(),
  token: Joi.string(),
  phone: Joi.string(),
});

const updatePwdSchema = Joi.object({
  id: Joi.number().required(),
  password: Joi.string().required(),
});

const updateState = Joi.object({
  token: Joi.string().required(),
  state: Joi.number(),
});

const updateRole = Joi.object({
  // token: Joi.string().required(),
  role: Joi.number(),
});

const findSchema = Joi.object({
  id: Joi.any().required(),
});



class UserValidation {
  constructor(context = {}, type) {
    this.context = context;
    this.type = type;
  }
  validate(data) {
    let schema;
    switch (this.type) {
      case "list": {
        schema = listSchema;
        break;
      }
      case "byId": {
        schema = findSchema;
        break;
      }
      case "create": {
        schema = createSchema;
        break;
      }
      case "update": {
        schema = updateSchema;
        break;
      }
      case "updatePwd": {
        schema = updatePwdSchema;
        break;
      }
      case "updateRole": {
        schema = updateRole;
        break;
      }
      case "banStatus": {
        schema = updateState;
        break;
      }
      case "delete": {
        schema = findSchema;
        break;
      }
      default:
        break;
    }

    const { error, value } = schema.validate(data);
    if (error) {
      this.value = {};
      this.errors = this.constructErrors(error);
      return false;
    }
    this.value = value;
    this.errors = [];
    return true;
  }

  constructErrors(error) {
    return error.details.map((err) => joiErrorParser(err));
  }
}

module.exports = UserValidation;
