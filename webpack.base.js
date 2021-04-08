const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'development',
    // entry: './src/index.js',
    output: {
        filename: 'js/bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'eval-source-map',
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebPackPlugin({
            template: path.join(__dirname, './index.html'),
            filename: 'index.html',
            minify: false, 
        }),
        new MiniCssExtractPlugin({
            filename: 'css/main.css'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: './public', to: './public'}
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpg|gig)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        esModule: false,
                        limit: 1*1024,
                        outputPath: '/img/',
                        
                    }
                }
            }
        ]
    },
    devServer: {
        port: 4000,
        progress: true,
        contentBase: './dist',
        open: true,
        compress: true
    }
}