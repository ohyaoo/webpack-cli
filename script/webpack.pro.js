const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const defaultSettings = require('./webpack.common')

module.exports = {
  ...defaultSettings.base,
  entry: defaultSettings.entryJs,
  plugins: defaultSettings.plugins.concat([
    new webpack.DefinePlugin({
      // 全局变量
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.SDP_ENV': JSON.stringify(
        process.env.SDP_ENV || process.env.NPM_ENV
      ),
    }),
    new UglifyJsPlugin({
      // 压缩
      sourceMap: true
    })
  ]),
  mode: 'production'
}
