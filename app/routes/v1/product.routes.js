const app = require('express').Router();
const controller = require('../../controllers/product.controller');
const { authenticateUser } = require('../../middleware');

app.get('/', controller.productList);
app.get('/cart/byuser/:id', authenticateUser, controller.listCartProductsByUser);
app.get('/cart/byuser/:userId/:id', authenticateUser, controller.singleCartProductsByUser);
app.post('/', authenticateUser, controller.createProduct);
app.post('/upload', authenticateUser, controller.uploadProductImage);
app.post('/cart', authenticateUser, controller.addProductToCart);
app.get('/:id', controller.productListByUser);
app.patch('/:id', authenticateUser, controller.updateProduct);
app.delete('/:id', authenticateUser, controller.deleteProduct);
app.delete('/cart/byuser/:userId/:id', authenticateUser, controller.removeProductFromCart);

module.exports = app;
