const { merge } = require("webpack-merge");
// Import the base webpack configuration which is common for both development and production environments.
const config = require("./webpack.config.js");

// Export a new configuration object which is a merge of the base configuration and a development-specific configuration.
module.exports = merge(config, {
  // Set the mode to 'development'. This option controls how webpack should optimize the build. When mode is set to 'development', webpack will not minify the code and will add more comments in the output files for easier debugging.
  mode: "development",
  // The devtool option controls how source maps are generated. In this case, 'inline-source-map' is used which is good for development as it provides original source code in the source map which helps in debugging.
  devtool: "inline-source-map",
});
