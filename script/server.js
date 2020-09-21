const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const open = require('open')
const path = require('path')
const args = require('minimist')(process.argv.slice(2))

// 项目配置
const getWebpackConfig = require('./util/get-webpack-config')()
const webpackDevConfig = require('./webpack.dev')
const webpackProConfig = require('./webpack.pro')

/** package文件读取 * */
const packageConfig = path.join(__dirname, '../package.json')

const port = packageConfig.port || 3000

// 初始化一个启动器
const app = express()

// 根据环境配置执行webpack微服务器
if (args.env) {
  let webpackConfig = {
    ...(args.env === 'pro' ? webpackProConfig : webpackDevConfig),
  }

  console.log(getWebpackConfig)
  if (typeof getWebpackConfig === 'function') {
    webpackConfig = getWebpackConfig({ ...webpackConfig })
  } else if (getWebpackConfig) {
    webpackConfig = getWebpackConfig
  }
  console.log(webpackConfig)
  const compiler = webpack(webpackConfig)
  app.use(express.static(path.join(__dirname, '../')))

  // 服务器
  app.use(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: '',
    })
  )

  // 热加载
  app.use(webpackHotMiddleware(compiler))
}

app.listen(port, (err) => {
  if (err) {
    console.log(err)
    return
  }
  const uri = `http://localhost:${port}`
  console.log(`Listening at ${uri}\n`)
  open(uri)
})
