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
const StringReplacePlugin = require('string-replace-webpack-plugin')
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
    path: path.resolve(__dirname, 'dist/assets')
    // by default: publicPath = ''
    // publicPath: ''
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
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  },
  mode: 'production',
  context: path.resolve(__dirname, 'client'),
  devtool: false,
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  module: {
    rules: [
      {
        test: /.html$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /COMMITHASH/gi,
              replacement: () => gitRevisionPlugin.commithash()
            }
          ]
        })
      },
      {
        test: /\.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /COMMITHASH/gi,
              replacement: () => gitRevisionPlugin.commithash()
            }
          ]
        })
      },
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
              plugins: [require('autoprefixer')(), require('cssnano')()]
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
              plugins: [require('autoprefixer')(), require('cssnano')()]
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
            loader: 'url-loader',
            options: {
              limit: 8192,
              mimetype: 'application/font-woff',
              name: 'fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              mimetype: 'application/octet-stream',
              name: 'fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              mimetype: 'image/svg+xml',
              name: 'images/[name].[ext]'
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new StringReplacePlugin(),

    new webpack.LoaderOptionsPlugin({
      test: /\.js$/,
      options: {
        eslint: {
          configFile: path.resolve(__dirname, '.eslintrc'),
          cache: false
        }
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
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
    new CopyWebpackPlugin([
      {
        from: 'html.js',
        to: 'html.js',
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
