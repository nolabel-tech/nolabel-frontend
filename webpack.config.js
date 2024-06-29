const Dotenv = require('dotenv-webpack');

module.exports = {
  // Ваша существующая конфигурация Webpack
  plugins: [
    new Dotenv()
  ]
};