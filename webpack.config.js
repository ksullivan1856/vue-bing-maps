const path = require('path');
const webpack = require('webpack');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const {
    version: pVersion,
    author: pAuthor,
    license: pLicense
} = require('./package.json');

const bannerOptions = {
    entryOnly: true,
    banner: `Vue Bing Maps v${pVersion}, hash:[hash].  Created by ${pAuthor}. License ${pLicense}`
};

const config = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'vue-bing-maps.js',
        publicPath: './dist',
        library: 'VueBingMaps'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': path.join(__dirname, './src/')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: false,
                    loaders: {
                        js: 'babel-loader'
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader?cacheDirectory=true'
                }
            }
        ]
    }
};

const browserConfig = Object.assign({}, config, {
    plugins: [
        new VueLoaderPlugin(),
        new webpack.BannerPlugin(bannerOptions)
    ],
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: './dist',
        filename: 'vue-bing-maps.js',
        library: 'VueBingMaps',
        libraryTarget: 'umd'
    }
});

const packageConfig = Object.assign({}, config, {
    plugins: [
        new StatsWriterPlugin({
            filename: '../stats.json',
            fields: null
        }),
        new VueLoaderPlugin(),
        new webpack.BannerPlugin(bannerOptions)
    ],
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: './dist',
        filename: 'index.js',
        library: 'VueBingMaps',
        libraryTarget: 'umd'
    }
});

module.exports = [ browserConfig, packageConfig ];