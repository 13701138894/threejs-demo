// 地球细胞核空间特效
let { merge } = require('webpack-merge')
let base = require('../webpack.base')

module.exports = merge(base,{
    entry: './src/earth_nucleus.js'
})