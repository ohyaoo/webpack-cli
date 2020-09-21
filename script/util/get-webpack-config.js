// 读取项目自定义配置文件
const fs = require('fs')
const path = require('path')

const workDir = process.cwd()

// eslint-disable-next-line func-names
module.exports = function () {
  const paths = ['webpack.config.js', 'webpack.js']
  let webpackPath = ''

  for (let i = 0; i < paths.length; i++) {
    const filePath = path.resolve(workDir, paths[i])
    if (fs.existsSync(filePath)) {
      webpackPath = filePath
      break
    }
  }

  if (webpackPath) {
    // eslint-disable-next-line global-require
    return require(webpackPath)
  }
}
