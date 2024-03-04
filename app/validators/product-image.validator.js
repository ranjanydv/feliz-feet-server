const Joi = require("joi");
const { joiErrorParser } = require("../lib/common");

const listSchema = Joi.object({
  page: Joi.number(),
  limit: Joi.number(),
  query: Joi.string(),
});

const createSchema = Joi.object({
  file: Joi.string(),
});

const findSchema = Joi.object({
  id: Joi.any().required(),
});


class ProductImageValidation {
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

module.exports = ProductImageValidation;
