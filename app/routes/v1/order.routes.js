const app = require('express').Router();
const controller = require('../../controllers/order.controller');
const { authenticateUser } = require('../../middleware');

app.get('/', controller.getOrders);
app.get('/byuser/:id', controller.getOrdersByUser);
app.get('/byproduct/:id', controller.getOrdersByProduct);
app.post('/', authenticateUser, controller.createOrder);
app.patch('/:id', authenticateUser, controller.updateOrder);
app.patch('/cancel/:id', authenticateUser, controller.cancelOrder);

module.exports = app;
