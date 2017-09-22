import * as webpack from 'webpack';
import * as path from 'path';

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
            'client': ['webpack-hot-middleware/client?name=client', './boot-client.tsx']
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
        plugins: [
            new webpack.HotModuleReplacementPlugin()
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
        node: {
            fs: 'empty',
            net: 'empty'
        }
    }
]}

export default config;