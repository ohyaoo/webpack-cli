/** 可根据项目配置部分 该文件提供 所有默认配置，以及一些可配置的通用路径 * */
const path = require('path')
const _fs = require('fs')
const _argJson = require('minimist')(process.argv.slice(2))

/** 基础路径 * */
const basePath = path.join(__dirname, '../')

/** package文件读取 * */
const pkgPath = path.join(basePath, 'package.json')
const pkg = (0, _fs.existsSync)(pkgPath) ? require(pkgPath) : {}

/** 其他插件 * */
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/** 是否是最终打包 * */
const isDist = process.env.REACT_WEBPACK_ENV === 'dist'

// 可根据项目情况自行配置的部分,其他部分不建议修改
// BEGIN ==================================================================

/** 打包静态资源输出目录名称 * */
const staticPath = 'assets'

/** 默认入口文件名 * */
const entryJsName = 'index'

/** 合并的外部包 * */
// const vendorJs = ['react', 'react-router', 'react-intl']

/** HTML页面使用的静态资源路径
 * 注意:
 *  此处是个绝对路径,为保证每个资源路径正确
 *  请根据发布网站根目录位置填写第一个值
 *  例如发布的根目录位置为 https://www.xxx.com/website/
 *  则 const publicPath = isDist ? '/website/' : '/'
 * */
const publicPath = ''

/** 源码路径 * */
const srcPath = path.join(basePath, 'src') // 源码目录,该目录根路径下至少需要包含 index.html 与 index.js 两个文件
const stylesPath = path.join(srcPath, 'theme/styles') // 源码样式目录
const staticFilesPath = path.join(srcPath, 'static') // 静态文件目录

/** 别名 * */
const alias = {
  '~': srcPath,
  '@': staticFilesPath,
}
// END ===============================================================

/** 默认端口号 * */
// const defaultPort = _argJson.port || 8080

/** 入口文件 */
const mainJs = [path.join(srcPath, 'index.js')]

/** 入口文件组 * */
const entryJs = {
  [entryJsName]: mainJs,
  // vendor: vendorJs
}
if (!isDist) {
  mainJs.unshift('webpack-hot-middleware/client')
}

/** 输出的主js文件名称规则(webpack-dev-server下不能使用chunkhash) * */
const fileName = isDist
  ? `${staticPath}/[name]-[chunkhash].js`
  : `${staticPath}/[name]-[hash].js`

/** 引用时可省略的后缀 * */
const extensions = ['.js', '.jsx', '.less', '.scss', '.sass']

/** 其他路径 * */
const nodeModulesPath = path.join(basePath, 'node_modules') // node_modules路径
const stylesPathAll = [stylesPath, nodeModulesPath] // 源码样式路径,node_modules路径

/** webpack打包输出 * */
const output = {
  path: path.join(basePath, '../webapp'),
  filename: fileName,
  // chunkFilename: staticPath + '/[id].chunk-[chunkhash].js',
  publicPath,
}

/** 样式提取配置 * */
const extractCSS = new MiniCssExtractPlugin({
  filename: `${staticPath}/[name]-[chunkhash].css`,
  allChunks: true,
  ignoreOrder: true, // 先忽略组件引入顺序不一致导致的该样式引入顺序不一致告警
})

/** 页面生成配置 * */
const indexHtml = new HtmlWebpackPlugin({
  title: '\u200E',
  description: pkg.description || '',
  filename: 'index.html',
  template: path.join(srcPath, 'index.html'),
  inject: true,
  hash: false,
  minify: {
    removeComments: isDist, // 移除HTML中的注释
    collapseWhitespace: isDist, // 删除空白符与换行符
  },
  // chunksSortMode: 'manual' // chunks排序-手动
  chunks: ['react', 'vendor', 'common', entryJsName],
})

/** Loaders * */
const defaultModules = {
  rules: [
    {
      test: /\.(js|jsx)$/,
      enforce: 'pre',
      loader: 'eslint-loader',
      include: srcPath,
      options: {
        fix: true,
      },
    },
    {
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      include: [srcPath],
    },
    {
      test: /\.css$/,
      exclude: stylesPathAll,
      use: [
        isDist
          ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          }
          : 'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[name]__[local]-[hash:base64:5]',
            },
            importLoaders: 1,
          },
        },
        'postcss-loader',
      ],
    },
    {
      test: /\.css$/,
      include: stylesPathAll,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    },
    {
      test: /\.scss$/,
      exclude: stylesPathAll,
      use: [
        isDist
          ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          }
          : 'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[local]-[hash:base64:5]',
            },
            importLoaders: 1,
          },
        },
        'postcss-loader',
        {
          loader: 'sass-loader',
          options: {
            outputStyle: 'expanded',
          },
        },
      ],
    },
    {
      test: /\.scss$/,
      include: stylesPathAll,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            outputStyle: 'expanded',
          },
        },
      ],
    },
    {
      test: /\.less/,
      include: stylesPathAll,
      use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
    },
    {
      test: /\.(ttf|eot|woff|woff2|svg)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 1,
            name: `${staticPath}/font-[hash].[ext]`,
          },
        },
      ],
    },
    {
      test: /\.(png|jpg|gif)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: `${staticPath}/img-[hash].[ext]`,
          },
        },
      ],
    },
    {
      test: /\.(mp4|ogg)$/,
      use: [
        {
          loader: 'file-loader',
          options: {},
        },
      ],
    },
  ],
}

// 默认使用的插件
const plugins = [
  extractCSS, // 提取公共css插件
  // new CSSSplitWebpackPlugin({ size: 4000 }),
  indexHtml, // 生成HTML插件
]

if (_argJson.analyze === 'true') {
  // eslint-disable-next-line global-require
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      generateStatsFile: true,
      statsOptions: { source: false },
    })
  )
}

/** 输出 * */
module.exports = {
  base: {
    // 基础配置构成
    output,
    resolve: {
      extensions,
      alias,
    },
    module: defaultModules,
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            name: 'vendor',
            priority: 5,
          },
          react: {
            test: /react[-.*]/,
            chunks: 'initial',
            name: 'react',
            priority: 10,
          },
          common: {
            chunks: 'async',
            minChunks: 2,
            name: 'common',
          },
        },
      },
      runtimeChunk: 'single',
    },
  },
  entryJs, // 入口文件组
  entryJsName, // 入口文件名
  plugins, // 默认插件
}
