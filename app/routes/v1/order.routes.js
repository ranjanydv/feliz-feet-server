const app = require('express').Router();
const controller = require('../../controllers/order.controller');
const { authenticateUser } = require('../../middleware');

app.get('/', controller.getOrders);
app.get('/cart/byuser/:id', authenticateUser, controller.getOrdersByUser);
app.get('/cart/byproduct/:id', authenticateUser, controller.getOrdersByProduct);
// app.get('/cart/byuser/:userId/:id', authenticateUser, controller.singleCartProductsByUser);
app.post('/', authenticateUser, controller.createOrder);
// app.post('/upload', authenticateUser, controller.uploadProductImage);
// app.post('/cart', authenticateUser, controller.addProductToCart);
// app.get('/:id', controller.productListByUser);
// app.patch('/:id', authenticateUser, controller.updateProduct);
// app.delete('/:id', authenticateUser, controller.deleteProduct);
// app.delete('/cart/byuser/:userId/:id', authenticateUser, controller.removeProductFromCart);

module.exports = app;
