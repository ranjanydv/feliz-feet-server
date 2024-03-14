// const { Op } = require('sequelize');

const {
  sequelize,
  Sequelize,
  product: Product,
  cart_products: CartProducts,
  cart: Cart,
} = require('../models');
const CartValidator = require('../validators/cart.validator');


async function getCartByUser(req, res, next) {
  try {
    const { query, currentUser, params } = req;
    const validator = new CartValidator({}, 'list');

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

      // Initialize an empty responseData object
      let responseData = {
        products: []
      };
      const cartExists = await Cart.findOne({ where: { user_id: params.id } });
      // console.log(cartExists);
      const { count, rows: data } = await CartProducts.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
      });
      // console.log(count, data);
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch cart items', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function addProductToCart(req, res, next) {
  try {
    const { body } = req;
    const productExists = await Product.findOne({ where: { id: body.product_id } });
    if (!productExists) {
      return res.status(400).send({ status: 400, message: 'Product Does Not Exist!!!' });
    }

    // Check if product already exists in user's cart
    const productAlreadyInCart = await CartProducts.findOne({
      where: {
        cart_id: body.cart_id,
        product_id: body.product_id,
      }
    });
    if (productAlreadyInCart) {
      return res.status(409).send({ status: 409, message: 'Product Already In Cart!' });
    }

    const data = {
      'user_id': body.user_id,
      'cart_id': body.cart_id,
      'product_id': body.product_id,
      'product_quantity': body.product_quantity,
      'product_rate': body.product_rate,
      'product_amount': body.product_amount,
    };

    const cartData = await CartProducts.create(data);
    res.status(201).send({ message: 'Added to Cart', cartItem: cartData, });
  } catch (error) {
    next(error);
  }
}


async function removeProductFromCart(req, res, next) {
  try {
    const { params } = req;
    console.log(params);
    const productExistsInCart = await CartProducts.findOne({
      where: {
        product_id: params.productId,
        user_id: req.authData.user_id,
      }
    });
    if (!productExistsInCart) {
      return res.status(400).send({ status: 400, message: 'Product does not exist in cart!' });
    }

    await CartProducts.destroy({
      where: {
        product_id: params.productId,
        user_id: req.authData.user_id,
      }
    });
    return res.status(200).json({ message: 'Product removed from cart' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCartByUser,
  addProductToCart,
  removeProductFromCart
};