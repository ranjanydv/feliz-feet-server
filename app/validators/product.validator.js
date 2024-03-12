const Joi = require("joi");
const { joiErrorParser } = require("../lib/common");

const listSchema = Joi.object({
  page: Joi.number(),
  limit: Joi.number(),
  query: Joi.string(),
});

const createSchema = Joi.object({
  name: Joi.string(),
  url: Joi.string().required(),
  description: Joi.string(),
  brand: Joi.string().required(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
  offer_price: Joi.number(),
  state: Joi.string().required(),
  image_id: Joi.string(),
  user_id: Joi.string().required(),
});

const updateSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string(),
  url: Joi.string(),
  brand: Joi.string(),
  description: Joi.string(),
  quantity: Joi.number(),
  price: Joi.number(),
  offer_price: Joi.number(),
  state: Joi.string(),
  image_id: Joi.string(),
  user_id: Joi.string(),
});


const updateState = Joi.object({
  id: Joi.string().required(),
  state: Joi.number().required(),
});


const findSchema = Joi.object({
  id: Joi.any().required(),
});



class ProductValidation {
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
      case "updateState": {
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

module.exports = ProductValidation;
