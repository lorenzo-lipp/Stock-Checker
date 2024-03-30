'use strict';

const fetch = require("node-fetch");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const stockSchema = new Schema({
  "name": { type: String, required: true },
  "likesIPS": [{ type: String, required: true }],
  "likes": { type: Number, required: true }
}, {
    versionKey: false
  });
const Stock = mongoose.model('Stock', stockSchema);

async function getStock(stock) {
  if (stock.includes("TESTSTOCK")) return [stock, 1]; // Fake stock only for tests.
  
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
  const { symbol, latestPrice } = await response.json();
  return [symbol, latestPrice];
}

module.exports = function(app) {

  app.route('/api/stock-prices')
    .get(async function(req, res) {
      const IP = req.ip;
      const like = req.query.like == "true";
      const compare = Array.isArray(req.query.stock);
      const stocks = compare ? req.query.stock : [req.query.stock];
      const responseData = [];
      
      for (let i in stocks) {
        let stock = stocks[i];

        if (i >= 2) return res.send({ error: "too many stocks entered" });
        
        const [symbol, latestPrice] = await getStock(stock);
        
        if (symbol && latestPrice) {
          await Stock.findOne({ "name": symbol }, (err, doc) => {
            if (err) return { error: err };
            
            if (doc === null) {
              doc = new Stock({
                "name": symbol,
                "likes": 0,
                "likesIPS": []
              });
            }
            
            if (like) {              
              const totalLikes = doc.likes;
              let differentIPS = 0;
                
              for (let IPS of doc.likesIPS) {
                if (!bcrypt.compareSync(IP, IPS)) {
                  differentIPS++;
                }
              }
                
              if (differentIPS == totalLikes) {
                const hash = bcrypt.hashSync(IP, 4);
                
                doc.likes++;
                doc.likesIPS.push(hash);
              }
            }

            doc.save()
              .then((doc) => {
                responseData.push({ stock: symbol, price: latestPrice, likes: doc.likes  });
                if (i == stocks.length - 1) {
                  if (i == 0) { return res.send({ 
                    stockData: responseData[0]
                  })}
                  return res.send({
                    stockData: [{
                      stock: responseData[0].stock,
                      price: responseData[0].price,
                      rel_likes: responseData[0].likes - responseData[1].likes
                    }, {
                      stock: responseData[1].stock,
                      price: responseData[1].price,
                      rel_likes: responseData[1].likes - responseData[0].likes
                    }]
                  })
                };
              })
              .catch((err) => {
                responseData.push({ error: err });
              });
          });
        } else {
          return res.send({ error: "stock not found" });
        }
      }
    });
};
