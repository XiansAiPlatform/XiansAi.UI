const BundleAnalyzerPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            // Optimize chunk splitting
            if (webpackConfig.mode === "production") {
                // Better minification
                webpackConfig.optimization.minimizer = [
                    new TerserPlugin({
                        terserOptions: {
                            parse: {
                                ecma: 11,
                            },
                            compress: {
                                ecma: 6,
                                warnings: false,
                                comparisons: false,
                                inline: 2,
                                drop_console: true, // Remove console.log in production
                            },
                            mangle: {
                                safari10: true,
                            },
                            output: {
                                ecma: 6,
                                comments: false,
                                ascii_only: true,
                            },
                        },
                        parallel: true,
                    }),
                ];

                // Add compression for output files
                webpackConfig.plugins.push(
                    new CompressionPlugin({
                        algorithm: "gzip",
                        test: /\.(js|css|html|svg)$/,
                        threshold: 10240, // Only compress files > 10KB
                        minRatio: 0.8,
                    })
                );

                // Configure optimization
                webpackConfig.optimization = {
                    ...webpackConfig.optimization,
                    runtimeChunk: "single",
                    splitChunks: {
                        chunks: "all",
                        maxInitialRequests: 10, // Allow more initial chunks
                        maxAsyncRequests: 10, // Allow more async chunks
                        minSize: 10000, // Smaller minimum size for chunks
                        maxSize: 250000, // Maximum size before splitting further (250KB)
                        cacheGroups: {
                            // React and related packages
                            react: {
                                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|react-is)[\\/]/,
                                name: "vendor-react",
                                priority: 30,
                            },
                            // MUI packages
                            mui: {
                                test: /[\\/]node_modules[\\/]@mui[\\/]/,
                                name: "vendor-mui",
                                priority: 25,
                            },
                            // Emotion packages (used by MUI)
                            emotion: {
                                test: /[\\/]node_modules[\\/]@emotion[\\/]/,
                                name: "vendor-emotion",
                                priority: 24,
                            },
                            // Auth-related packages
                            auth: {
                                test: /[\\/]node_modules[\\/](@auth0|@azure\/msal)[\\/]/,
                                name: "vendor-auth",
                                priority: 23,
                            },
                            // Mermaid and related visualization
                            viz: {
                                test: /[\\/]node_modules[\\/](mermaid|@mermaid-js)[\\/]/,
                                name: "vendor-viz",
                                priority: 22,
                            },
                            // Monaco editor (if used)
                            monaco: {
                                test: /[\\/]node_modules[\\/](@monaco-editor)[\\/]/,
                                name: "vendor-monaco",
                                priority: 21,
                            },
                            // Date handling
                            dates: {
                                test: /[\\/]node_modules[\\/](date-fns)[\\/]/,
                                name: "vendor-dates",
                                priority: 20,
                            },
                            // Common utilities (syntax highlighting, markdown, etc.)
                            utilities: {
                                test: /[\\/]node_modules[\\/](react-syntax-highlighter|react-markdown)[\\/]/,
                                name: "vendor-utilities",
                                priority: 19,
                            },
                            // Icons
                            icons: {
                                test: /[\\/]node_modules[\\/](react-icons)[\\/]/,
                                name: "vendor-icons",
                                priority: 18,
                            },
                            // Notifications/toasts
                            notifications: {
                                test: /[\\/]node_modules[\\/](react-toastify|react-hot-toast)[\\/]/,
                                name: "vendor-notifications",
                                priority: 17,
                            },
                            // Routing
                            routing: {
                                test: /[\\/]node_modules[\\/](react-router|react-router-dom|history)[\\/]/,
                                name: "vendor-routing",
                                priority: 16,
                            },
                            // Remaining vendor dependencies
                            vendors: {
                                test: /[\\/]node_modules[\\/]/,
                                name: "vendor-others",
                                priority: 10,
                                reuseExistingChunk: true,
                            },
                            // Common module code
                            common: {
                                test: /[\\/]src[\\/]modules[\\/]/,
                                name: "common",
                                minChunks: 2,
                                priority: 5,
                                reuseExistingChunk: true,
                            },
                            // Common components
                            components: {
                                test: /[\\/]src[\\/]components[\\/]/,
                                name: "components",
                                minChunks: 2,
                                priority: 4,
                                reuseExistingChunk: true,
                            },
                        },
                    },
                };
            }

            // Add Bundle Analyzer Plugin - only run when ANALYZE is set to true
            if (process.env.ANALYZE) {
                webpackConfig.plugins.push(
                    new BundleAnalyzerPlugin({
                        analyzerMode: "server",
                        analyzerPort: 8888,
                        openAnalyzer: true,
                    })
                );
            }

            // Suppress source map warnings from specific packages
            webpackConfig.ignoreWarnings = [
                // Ignore source map warnings from @auth0/auth0-spa-js and its dependencies
                /Failed to parse source map.*@auth0\/auth0-spa-js/,
                /Failed to parse source map.*dpop/,
            ];

            return webpackConfig;
        },
    },
    // Add additional performance settings
    babel: {
        presets: [],
        plugins: [],
        loaderOptions: (babelLoaderOptions) => {
            return babelLoaderOptions;
        },
    },
    // Disable source maps in production for better performance
    devServer: (devServerConfig) => {
        return devServerConfig;
    },
};
