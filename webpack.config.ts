import * as webpack from 'webpack';
import * as path from 'path';
import * as UglifyJSPlugin from 'uglifyjs-webpack-plugin';

const config : (env: any) => webpack.Configuration[] = (env = {}) => {

    const debug = env.NODE_ENV !== "production";
    console.log('debug: ', debug) 
    
    return [{
        name: 'client',
        resolve: { 
            extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
        },
        devtool: debug ? "inline-source-map" : false,
        entry: {
            'client': debug ? ['webpack-hot-middleware/client?name=client', './boot-client.tsx'] : ['./boot-client.tsx']
        },
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, 'wwwroot/dist'),
            publicPath: '/dist/'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: "awesome-typescript-loader",
                        options: {
                            configFileName: "tsconfig.client.json"
                        }
                    }
                }
            ]
        },
        plugins: debug ? [
            new webpack.HotModuleReplacementPlugin()
        ] : [
            new webpack.DefinePlugin({
                'process.env':{
                    'NODE_ENV': JSON.stringify('production')
                }
            }),            
            new UglifyJSPlugin()
        ],
        node: {
            fs: 'empty',
            child_process: 'empty',
        }
    },
    {
        name: 'server',
        resolve: { 
            extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
        },
        devtool: debug ? "inline-source-map" : false,
        entry: {
            'server': './boot-server.tsx'
        },
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, 'server/dist')
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: "awesome-typescript-loader",
                        options: {
                            configFileName: "tsconfig.json"
                        }
                    }
                }
            ]
        },
        plugins: debug ? [
        ] : [
            new webpack.DefinePlugin({
                'process.env':{
                    'NODE_ENV': JSON.stringify('production')
                }
            }),            
            new UglifyJSPlugin({
                sourceMap: true,
                parallel: {
                    cache: true,
                    workers: 2
                },
                uglifyOptions: {
                    mangle: false,
                    ecma: 8,
                    compress: false
                }
            })
        ],
        node: {
            fs: 'empty',
            net: 'empty'
        }
    }
]}

export default config;