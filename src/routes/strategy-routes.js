const router = require('koa-router')();
const controllers = require('../controllers');

//const router = new KoaRouter()

module.exports = router
    .get('/api/strategy/get', controllers.strategy.getStrategy)
    .post('/api/strategy/create', controllers.strategy.createStrategy)
    .post('/api/strategy/update', controllers.strategy.updateStrategy)
    .post('/api/strategy/set', controllers.strategy.setStrategy)
    .post('/api/strategy/remove', controllers.strategy.remove)
    .post('/api/strategy/unbind', controllers.strategy.unbind)