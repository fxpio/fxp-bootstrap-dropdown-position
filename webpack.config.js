/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Encore = require('@symfony/webpack-encore');

module.exports = Encore
    .setOutputPath('build/')
    .setPublicPath('/build')
    .disableSingleRuntimeChunk()
    .autoProvidejQuery()
    .enableSourceMaps(!Encore.isProduction())
    .cleanupOutputBeforeBuild()
    .enableLessLoader()
    .addLoader(
        {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['@babel/preset-env'],
            },
        }
    )
    .addEntry('main', './examples/main.js')
    .addEntry('main-scroller', './examples/main-scroller.js')
    .copyFiles({
        from: './examples',
        to: '[name].[ext]',
        pattern: /.html$/
    })
    .getWebpackConfig()
;
