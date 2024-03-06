const { Op } = require('sequelize');

const {
  product: Product,
  sequelize,
  Sequelize,
  user: User,
  order: Order,
  order_products: OrderProducts,
  cart: Cart,
  ProductImage
} = require('../models');
const ProductValidation = require('../validators/product.validator');
const OrderValidator = require('../validators/order.validator');

async function getOrders(req, res, next) {
  try {
    const { query, currentUser } = req;
    const validator = new OrderValidator({}, 'list');

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
      const { count, rows: data } = await Order.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
        include: [{ model: OrderProducts, as: 'products' }],
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch orders', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function getOrdersByUser(req, res, next) {
  try {
    const { query, currentUser, params } = req;
    const validator = new OrderValidator({}, 'list');

    if (validator.validate(query, params)) {
      const { page = 0, limit = 0, query = '' } = validator.value;
      const offset = (page - 1) * limit;
      const condition = { user_id: params.id };
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
      const { count, rows: data } = await Order.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
        include: [{ model: OrderProducts, as: 'products' }],
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch orders', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function getOrdersByProduct(req, res, next) {
  try {
    const { query, currentUser, params } = req;
    const validator = new OrderValidator({}, 'list');

    if (validator.validate(query, params)) {
      const { page = 0, limit = 0, query = '' } = validator.value;
      const offset = (page - 1) * limit;
      const condition = { user_id: params.id };
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
      const { count, rows: data } = await Order.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch orders', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}


async function createOrder(req, res, next) {
  try {
    const { body } = req;

    const data = {
      user_id: body.user_id,
      total_amount: body.total_amount,
      // total_amount: 5465.12,
    };

    // Initialize an empty responseData object
    let responseData = {
      user_id: body.user_id,
      total_amount: body.total_amount,
      products: []
    };
    const createdOrder = await Order.create(data);
    if (createdOrder) responseData.orderdetails = createdOrder;
    for (const product of body.products) {
      const productData = {
        'user_id': body.user_id,
        'order_id': createdOrder.id,
        'product_id': product.product_id,
        'product_quantity': product.product_quantity,
        'product_rate': product.product_rate,
        'product_amount': product.product_amount,
      };
      const createdOrderProducts = await OrderProducts.create(productData);
      responseData.products.push(createdOrderProducts);
    }
    res.status(201).send({ message: 'Order Placed', order: responseData, });
  } catch (error) {
    next(error);
    res.status(500).json({ status: 400, error: error.message, message: 'Something went wrong' });
  }
}


module.exports = {
  getOrders,
  getOrdersByUser,
  getOrdersByProduct,
  createOrder,
};