const app = require('express').Router();
const controller = require('../../controllers/product.controller');
const { authenticateUser } = require('../../middleware');

app.get('/', controller.productList);
app.get('/:url', controller.singleProduct);
app.get('/byId/:id', controller.singleProductById);
app.post('/', authenticateUser, controller.createProduct);
app.post('/upload', authenticateUser, controller.uploadProductImage);
app.get('/byuser/:id', controller.productListByUser);
app.patch('/:id', authenticateUser, controller.updateProduct);
app.delete('/:id', authenticateUser, controller.deleteProduct);
app.get('/images/:imageName', controller.getImage);

module.exports = app;
