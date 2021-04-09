// 图片胶卷螺旋特效
let { merge } = require('webpack-merge')
let base = require('../webpack.base')

module.exports = merge(base,{
    entry: './src/love_balloon.js'
})