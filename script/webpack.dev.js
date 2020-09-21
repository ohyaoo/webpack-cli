const webpack = require('webpack')
const defaultSettings = require('./webpack.common')

let entryJsMain = defaultSettings.entryJs[defaultSettings.entryJsName]
if (!entryJsMain.unshift) {
  entryJsMain = [entryJsMain]
}
entryJsMain.unshift('webpack-hot-middleware/client?reload=true')

defaultSettings.entryJs[defaultSettings.entryJsName] = entryJsMain

module.exports = {
  ...defaultSettings.base,
  entry: defaultSettings.entryJs,
  cache: true,
  devtool: 'inline-source-map',
  plugins: defaultSettings.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.SDP_ENV': JSON.stringify(
        process.env.SDP_ENV || process.env.NPM_ENV
      ),
    }),
    new webpack.HotModuleReplacementPlugin(), // 热替换
  ]),
  mode: 'development',
}
