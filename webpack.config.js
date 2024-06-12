const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require("dotenv-webpack");
const CopyPlugin = require("copy-webpack-plugin");

const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = (env, { mode }) => {
  const isProduction = mode === "production";

  return {
    mode,
    entry: [
      path.join(__dirname, "src", "index.tsx"),
      path.join(__dirname, "src", "index.css"),
    ],

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"],
      modules: ["node_modules"],
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        zlib: require.resolve("browserify-zlib"),
        stream: require.resolve("stream-browserify"),
        vm: require.resolve("vm-browserify"),
        url: require.resolve("url"),
      },
    },

    output: {
      publicPath: "/",
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "js/[name].[chunkhash].js" : "js/[name].js",
      chunkFilename: isProduction ? "js/[name].[chunkhash].js" : "js/[name].js",
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.?(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
              plugins: [
                [
                  "babel-plugin-styled-components",
                  {
                    minify: isProduction,
                    transpileTemplateLiterals: isProduction,
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.(sc|c)ss$/i,
          exclude: [/node_modules/],
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",

            {
              loader: "css-loader",
              options: {
                modules: true,
                sourceMap: true,
                importLoaders: 3,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      "postcss-preset-env",
                      {
                        autoprefixer: {
                          grid: true,
                          flexbox: true,
                        },
                      },
                    ],
                  ],
                },
              },
            },
            {
              loader: "resolve-url-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true, // <-- !!IMPORTANT!!
                sassOptions: {
                  outputStyle: "compressed",
                  includePaths: [path.resolve(__dirname, "src", "sass")],
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jp(e*)g|gif|webp|avif|svg)$/,
          use: {
            loader: "file-loader",
            options: {
              name: "img/[name].[ext]",
            },
          },
        },
        {
          test: /\.(sc|c)ss$/,
          include: [/node_modules/],
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "public", "index.html"),
        minify: isProduction,
        hash: isProduction,
        cache: isProduction,
        showErrors: !isProduction,
      }),

      new Dotenv({
        systemvars: true,
      }),
      new MiniCssExtractPlugin(),

      new CopyPlugin({
        patterns: [
          {
            from: "public/favicon.ico",
            to: ".",
          },
          {
            from: "public/robots.txt",
            to: ".",
          },
          {
            from: "public/manifest.json",
            to: ".",
          },
        ],
      }),

      new webpack.ProvidePlugin({
        grapesjs: "grapesjs",
        Buffer: ["buffer", "Buffer"],
      }),
    ].concat(
      !env.analyze
        ? []
        : [
            new BundleAnalyzerPlugin({
              analyzerHost: "localhost",
              analyzerPort: 3006,
              reportTitle: "Template - Analyze Bundle Sizes",
            }),
          ]
    ),

    optimization: {
      minimize: isProduction,
      mergeDuplicateChunks: true,
      removeEmptyChunks: true,
      sideEffects: true,
      //   minimizer: [
      //     new ESBuildMinifyPlugin({
      //       target: 'es2015',
      //     }),
      //   ],
      splitChunks: {
        chunks: "all",
        // cacheGroups: {
        //   vendors: {
        //     test: /[\\/]node_modules[\\/]/,
        //     chunks: 'all',
        //     enforce: true,
        //     name: (module) => {
        //       const [, match] = module.context.match(
        //         /[\\/]node_modules[\\/](.*?)([\\/]([^\\/]*)([\\/]([^\\/]*))?([\\/]([^\\/]*))?|$)/
        //       );

        //       return `vendors/${match.replace('@', '')}`;
        //     },
        //   },
        // },
      },
    },

    performance: {
      maxEntrypointSize: Infinity,
      maxAssetSize: 1024 ** 2,
    },

    devtool: isProduction ? "source-map" : "inline-source-map",

    devServer: {
      host: "0.0.0.0",
      port: 3001,
      //   server: 'https',
      historyApiFallback: true,
    },
  };
};
