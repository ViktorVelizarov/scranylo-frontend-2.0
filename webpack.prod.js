const { merge } = require("webpack-merge");
// Import the base webpack configuration which is common for both development and production environments.
const config  = require("./webpack.config.js");


module.exports = merge(config, {
  // Set the mode to 'production'. This option controls how webpack should optimize the build. When mode is set to 'production', webpack will minify the code and perform other optimizations to prepare the application for deployment.
  mode: "production",
});
