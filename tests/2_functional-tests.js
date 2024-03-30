const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let likes;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.property(res.body.stockData, "stock");
        assert.strictEqual(res.body.stockData.stock, "GOOG");
        assert.property(res.body.stockData, "price");
        assert.isNumber(res.body.stockData.price);
        assert.property(res.body.stockData, "likes");
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=TESTSTOCK&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.property(res.body.stockData, "stock");
        assert.equal(res.body.stockData.stock, "TESTSTOCK");
        assert.property(res.body.stockData, "price");
        assert.isNumber(res.body.stockData.price);
        assert.property(res.body.stockData, "likes");
        assert.isNumber(res.body.stockData.likes);
        assert.isAbove(res.body.stockData.likes, 0);
        likes = res.body.stockData.likes;
        done();
      });
  });

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=TESTSTOCK&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.property(res.body.stockData, "stock");
        assert.equal(res.body.stockData.stock, "TESTSTOCK");
        assert.property(res.body.stockData, "price");
        assert.isNumber(res.body.stockData.price);
        assert.property(res.body.stockData, "likes");
        assert.isNumber(res.body.stockData.likes);
        assert.equal(res.body.stockData.likes, likes);
        done();
      });
  });

  test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], "stock");
        assert.property(res.body.stockData[1], "stock");
        assert.equal(res.body.stockData[0].stock, "GOOG");
        assert.equal(res.body.stockData[1].stock, "MSFT");
        assert.property(res.body.stockData[0], "price");
        assert.property(res.body.stockData[1], "price");
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "rel_likes");
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });

  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=TESTSTOCK&stock=TESTSTOCK2&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], "stock");
        assert.property(res.body.stockData[1], "stock");
        assert.equal(res.body.stockData[0].stock, "TESTSTOCK");
        assert.equal(res.body.stockData[1].stock, "TESTSTOCK2");
        assert.property(res.body.stockData[0], "price");
        assert.property(res.body.stockData[1], "price");
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "rel_likes");
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        assert.equal(res.body.stockData[0].rel_likes, 0);
        assert.equal(res.body.stockData[1].rel_likes, 0);
        done();
      });
  })
});
