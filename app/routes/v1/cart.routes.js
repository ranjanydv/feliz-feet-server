const app = require('express').Router();
const controller = require('../../controllers/cart.controller');
const { authenticateUser } = require('../../middleware');

app.get('/byuser/:id', controller.getCartByUser);
app.post("/",controller.addProductToCart)
// app.get('/cart/byuser/:id', authenticateUser, controller.getOrdersByUser);
// app.get('/cart/byproduct/:id', authenticateUser, controller.getOrdersByProduct);
// app.patch('/:id', authenticateUser, controller.updateOrder);
// app.patch('/cancel/:id', authenticateUser, controller.cancelOrder);
app.delete("/byuser/:userId/:id",controller.removeProductFromCart)

module.exports = app;
