const webpack = require("webpack");

module.exports = function override(config) {
    config.resolve.fallback = {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
    };
    
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
                                      Buffer: ['buffer', 'Buffer'],
                                      process: 'process/browser',
                                  }),
    ];
    
    return config;
};