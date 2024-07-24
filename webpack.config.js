const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
var WebpackObfuscator = require("webpack-obfuscator");
const webpack = require("webpack");
const dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();

module.exports = {
  // Specify the entry point files of the app
  entry: {
    popup: "./src/popup.js",
    background: "./src/background.js",
    content: "./src/content.js",
  },
  // Configure the output path and filename
  output: {
    path: path.resolve(__dirname, "dist"), // Destination folder for the build files
    filename: "[name].js", // Output filenames will match the entry point names
  },
  // Define how different types of modules will be treated
  module: {
    rules: [
      // Transpile JS and JSX files using Babel
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      // Process CSS files
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  // Set up webpack plugins
  plugins: [
    // Inject environment variables into the bundled code
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    // Generate an HTML file for the popup, based on the template
    new HtmlWebpackPlugin({
      template: "./src/popup.html",
      filename: "popup.html",
    }),
    // Copy all static assets from the public directory into the dist directory
    new CopyPlugin({
      patterns: [{ from: "public" }],
    }),
    // Code obfuscator plugin, make code less readable in the build to make it harder to steal the code
    // new WebpackObfuscator(
    //   {
    //     rotateStringArray: true,
    //     stringArray: false,
    //     compact: true,
    //     splitStrings: true,
    //     debugProtection: true,
    //   },
    //   ["popups.js"]
    // ),
  ],
};
