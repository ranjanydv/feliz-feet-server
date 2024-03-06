const { Op } = require('sequelize');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }).single('file');

const { product: Product, sequelize, Sequelize, user: User, product_image: ProductImage, cart: Cart } = require('../models');
const ProductValidation = require('../validators/product.validator');


async function productList(req, res, next) {
  try {
    const { query, currentUser } = req;
    const validator = new ProductValidation({}, 'list');

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
      const { count, rows: data } = await Product.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
        include: [{ model: ProductImage, as: 'productImage' }],
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch user list', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function productListByUser(req, res, next) {
  try {
    const { query, currentUser, params } = req;
    const validator = new ProductValidation({}, 'list');

    if (validator.validate(query, params)) {
      const { page = 0, limit = 0, query = '' } = validator.value;
      console.log('QUERY: ', query);
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
      const { count, rows: data } = await Product.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
        include: [{ model: ProductImage, as: 'productImage' }],
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch user list', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { body } = req;
    const validator = new ProductValidation({}, 'create');

    if (!validator.validate(body)) {
      return res.status(400).send({ status: 400, message: validator.errors });
    }
    // Check if user is seller or admin
    const productUser = await User.findById(body.user_id);
    if (!productUser) return res.status(400).send({ status: 400, message: 'Unknown User' });
    if (productUser.role === 0) return res.status(400).send({ status: 400, message: 'Not a Seller' });

    const productExists = await Product.findOne({
      where: { url: body.url },
    });
    if (productExists) {
      return res.status(409).send({ status: 409, message: 'Product with URL Already Exist!' });
    }

    const productData = await Product.create(body);
    res.status(201).send({ message: 'Product Created', product: productData, });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { body, params } = req;
    const validator = new ProductValidation({}, 'update');
    if (validator.validate({ ...params, ...body })) {
      const product = { ...validator.value };

      // Only the Seller can update the product
      const productUser = await User.findById(body.user_id);
      if (!productUser) return res.status(400).send({ status: 400, message: 'Unknown User' });
      if (productUser.role === 0) return res.status(400).send({ status: 400, message: 'Cannot Update Product' });

      // check if entered url exists in database
      const databaseProduct = await Product.findOne({
        where: {
          id: { [Op.not]: params.id }, // So it does not check the URL of the editing product
          url: body.url
        }
      });
      if (databaseProduct) return res.status(409).send({ status: 409, message: 'Product with URL Already Exist!' });

      const data = await Product.update(product, { where: { id: product.id } });
      res.status(200).send({ data, product });
    } else {
      res.status(400);
      res.json({ status: 400, message: 'Could not update product', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { params } = req;
    const productId = params.id;
    const validator = new ProductValidation({}, 'delete');

    if (!validator.validate({ ...params })) {
      return res.status(400).json({ status: 400, message: 'Validation failed', errors: validator.errors });
    }
    const databaseProduct = await Product.findById(params.id);

    // Start a transaction
    await sequelize.transaction(async (t) => {
      await Product.destroy({ where: { id: productId } }, { transaction: t });
      await ProductImage.destroy({ where: { id: databaseProduct.image_id } }, { transaction: t });
    }, { autocommit: false }).then(async () => {
      res.json({
        status: 200,
        message: 'Product and its image has been deleted successfully',
      });
    });
  } catch (error) {
    // 3. Specific error handling:
    if (error instanceof Sequelize.ForeignKeyConstraintError) {
      // Check for associated product & purchase
      let errorMessage = 'Cannot delete product due to associated records in: ';

      // const product = await Product.findAll({ where: { supplier_id: params.id } });
      // const purchase = await Purchase.findAll({ where: { supplier_id: params.id } });
      //
      // let associatedTables = [];
      //
      // // Check constraints and add to the associatedTables array
      // if (product.length > 0) associatedTables.push('products');
      // if (purchase.length > 0) associatedTables.push('purchases');
      //
      // if (associatedTables.length > 1) {
      //   let last = associatedTables.pop();
      //   errorMessage += associatedTables.join(', ') + ' and ' + last;
      // } else {
      //   errorMessage += associatedTables[0];
      // }
      // errorMessage += '.';
      //

      return res.status(400).json({
        status: 400,
        message: errorMessage
      });
    } else {
      // Handle other unexpected errors by passing them to the next middleware.
      next(error);
    }
  }
}

async function uploadProductImage(req, res, next) {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.log(err);
        res.status(400).send('File has some error');
      } else {
        const file = req.file;
        const data = {
          file: `${file.filename}`,
        };
        const productImage = await ProductImage.create(data);
        res.status(201).json({ status: 200, message: 'Product Image Created', productImage });
      }
    });
  } catch (error) {
    next(error);
  }
}


async function listCartProductsByUser(req, res, next) {
  try {
    const { query, currentUser, params } = req;
    const validator = new ProductValidation({}, 'list');

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

      const { count, rows: data } = await Cart.findAndCountAll({
        where: condition, order: [['updated_at', 'DESC']], ...clause,
        include: [{ model: Product, as: 'product' }],
      });
      if (count === 0) res.status(200).json({ message: 'Cart is empty' });
      return res.json({ count, data });
    }
  } catch (error) {
    next(error);
  }
}

async function singleCartProductsByUser(req, res, next) {
  try {
    const { params } = req;
    const cartItem = await Cart.findOne({
      where: {
        id: params.id,
        user_id: params.userId,
      },
      include: [{ model: Product, as: 'product' }]
    });
    if (!cartItem) return res.status(404).send({ status: 400, message: 'Cart Item not found' });
    return res.status(200).json({ cartItem });
  } catch (error) {
    next(error);
  }
}

async function addProductToCart(req, res, next) {
  try {
    const { body } = req;
    const productExists = await Product.findById(body.product_id);
    if (!productExists) {
      return res.status(400).send({ status: 400, message: 'Product Does Not Exist!!!' });
    }
    const data = {
      user_id: body.user_id,
      quantity: body.quantity,
      price: body.price,
      product_id: body.product_id,
    };

    const cartData = await Cart.create(data);
    res.status(201).send({ message: 'Added to Cart', product: cartData, });
  } catch (error) {
    next(error);
  }
}

async function removeProductFromCart(req, res, next) {
  try {
    const { params } = req;
    const isUserCart = await Cart.findById(params.id);
    if (isUserCart) {
      const cartUserId = isUserCart.user_id.toString();
      if (cartUserId !== params.userId) {
        return res.status(400).send({ status: 400, message: 'Not Your Product', });
      }
    }
    const result = await Cart.destroy({ where: { id: params.id } });
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}


module.exports = {
  createProduct,
  productList,
  productListByUser,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  listCartProductsByUser,
  singleCartProductsByUser,
  addProductToCart,
  removeProductFromCart,
};