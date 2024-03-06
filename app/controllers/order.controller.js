const { Op } = require('sequelize');

const {
  sequelize,
  Sequelize,
  order: Order,
  order_products: OrderProducts,
  cart: Cart,
} = require('../models');
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

    // TODO: Remove Products from Cart
    res.status(201).send({ message: 'Order Placed', order: responseData, });
  } catch (error) {
    next(error);
    res.status(500).json({ status: 400, error: error.message, message: 'Something went wrong' });
  }
}

async function updateOrder(req, res, next) {
  try {
    const { body, params } = req;
    const orderExits = await Order.findOne({
      where: {
        id: params.id,
        [Op.and]: [
          { state: { [Op.ne]: 2 } },
          { state: { [Op.ne]: 3 } }
        ],
      }
    });
    if (!orderExits) return res.status(400).json({ status: 400, message: 'Cannot update order' });
    const orderData = {
      state: body.state
    };
    await Order.update(orderData, { where: { id: params.id } });
    res.status(200).json({ message: 'Order updated' });
  } catch (error) {
    next(error);
    res.status(500).json({ status: 400, message: 'Something went wrong' });
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { params } = req;
    const orderExits = await Order.findOne({
      where: {
        id: params.id,
        [Op.and]: [
          { state: { [Op.ne]: 2 } },
        ],
      }
    });
    if (!orderExits) return res.status(400).json({ status: 400, message: 'Cannot cancel order' });
    const orderData = {
      state: 3
    };
    await Order.update(orderData, { where: { id: params.id } });
    res.status(200).json({ message: 'Order Cancelled' });
  } catch (error) {
    next(error);
    res.status(500).json({ status: 400, message: 'Something went wrong' });
  }
}

module.exports = {
  getOrders,
  getOrdersByUser,
  getOrdersByProduct,
  createOrder,
  updateOrder,
  cancelOrder
};