const app = require('express').Router();
const controller = require('../../controllers/product.controller');
const { authenticateUser } = require('../../middleware');

app.get('/', controller.productList);
app.post('/', authenticateUser, controller.createProduct);
app.post('/upload', authenticateUser, controller.uploadProductImage);
app.get('/:id', controller.productListByUser);
app.patch('/:id', authenticateUser, controller.updateProduct);
app.delete('/:id', authenticateUser, controller.deleteProduct);

module.exports = app;
