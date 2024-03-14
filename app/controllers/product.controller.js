const { Op } = require('sequelize');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }).single('file');
const fs = require('fs');
const path = require('path');


const { product: Product, sequelize, Sequelize, user: User, product_image: ProductImage } = require('../models');
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
        include: [{ model: ProductImage, as: 'image' }],
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
        include: [{ model: ProductImage, as: 'image' }],
      });
      return res.json({ count, data });
    } else {
      res.status(400).json({ status: 400, message: 'Could not fetch user list', errors: validator.errors });
    }
  } catch (error) {
    next(error);
  }
}

async function singleProduct(req, res, next) {
  try {
    const { params } = req;

    const product = await Product.findOne({
      where: {
        url: params.url
      },
      include: [{ model: ProductImage, as: 'image' }],
    });

    if (!product) return res.status(404).send({ status: 404, message: 'Product Not Found' });
    return res.status(200).json({ product });

  } catch (error) {
    next(error);
  }

}
async function singleProductById(req, res, next) {
  try {
    const { params } = req;

    const product = await Product.findOne({
      where: {
        id: params.id
      },
      include: [{ model: ProductImage, as: 'image' }],
    });

    if (!product) return res.status(404).send({ status: 404, message: 'Product Not Found' });
    return res.status(200).json({ product });

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
        console.log(file);
        const productImage = await ProductImage.create(data);
        res.status(201).json({ status: 200, message: 'Product Image Created', productImage });
      }
    });
  } catch (error) {
    next(error);
  }
}

// app.get('/images/:imageName', (req, res) => {
async function getImage(req,res,next) {
  const imagePath = path.join(__dirname, '../../uploads', req.params.imageName);
  console.log(imagePath);
   fs.readFile(imagePath, (err, data) => {
    if (err) {
      res.status(404).json({ error: 'Image not found' });
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(data);
    }
  });
  // const imageStream = fs.createReadStream(imagePath);
  // imageStream.on('error', () => res.status(404).json({ error: 'Image not founds' }));
  // imageStream.pipe(res);
};


module.exports = {
  createProduct,
  productList,
  productListByUser,
  singleProduct,
  singleProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getImage
};