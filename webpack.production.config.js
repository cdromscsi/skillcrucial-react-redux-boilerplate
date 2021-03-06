/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')
const glob = require('glob')
require('dotenv').config()
const webpack = require('webpack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const uuidv4 = require('uuid/v4')

const gitRevisionPlugin = new GitRevisionPlugin()

const PATHS = {
  client: path.join(__dirname, 'client')
}

const config = {
  entry: ['./main.js', './assets/scss/main.scss'],
  resolve: {
    alias: {
      d3: 'd3/index.js'
    }
  },
  output: {
    filename: 'js/bundle.js',
    chunkFilename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist/assets')
    // by default: publicPath = ''
    // publicPath: ''
  },
  mode: 'production',
  context: path.resolve(__dirname, 'client'),
  devtool: false,
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
        }
      })
    ]
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              // by default: sourceMap = false
              // sourceMap: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('autoprefixer')()
              ]
            }
          }
        ]
      },
      {
        test: /\.txt$/i,
        use: 'raw-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              // by default: sourceMap = false
              // sourceMap: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('autoprefixer')()
              ]
            }
          },
          {
            loader: 'sass-loader'
            // query supported but has been deprecated
            // query: {
            //   sourceMap: false
            // }
            // sourceMap default: depends on the compiler.devtool value
            // options: {
            //   sourceMap: false
            // }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100,
              mimetype: 'image/png',
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      test: /\.js$/,
      options: {
        eslint: {
          configFile: path.resolve(__dirname, '.eslintrc'),
          cache: false
        }
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].css',
      ignoreOrder: false
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.client}/**/*`, { nodir: true })
    }),
    new CopyWebpackPlugin([{ from: 'assets/images', to: 'images' }]),
    new CopyWebpackPlugin([{ from: 'assets/fonts', to: 'fonts' }]),

    new CopyWebpackPlugin([{ from: 'vendors', to: 'vendors' }]),
    new CopyWebpackPlugin([{ from: 'assets/manifest.json', to: 'manifest.json' }]),
    new CopyWebpackPlugin([{ from: 'assets/robots.txt', to: 'robots.txt' }]),

    new CopyWebpackPlugin([
      {
        from: 'html.js',
        to: '../html.js',
        transform: (content) => {
          return content.toString().replace(/COMMITHASH/g, uuidv4())
        }
      }
    ]),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    })
  ]
}

module.exports = config
