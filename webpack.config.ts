import * as webpack from 'webpack';
import * as path from 'path';
import * as UglifyJSPlugin from 'uglifyjs-webpack-plugin';

export default function(env: any = {}): webpack.Configuration[] {

    const debug = env.NODE_ENV !== "production";
    console.log('debug: ', debug) 
    
    return [{
        name: 'client',
        resolve: { 
            extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
        },
        devtool: debug ? "inline-source-map" : false,
        entry: {
            'main-client': ['./boot-client.tsx']
        },
        output: {
            filename: "[name].js",
            path: path.join(__dirname, 'wwwroot', 'dist'),
            publicPath: '/dist/'
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
            // new webpack.HotModuleReplacementPlugin()
        ] : [
            new webpack.DefinePlugin({
                'process.env':{
                    'NODE_ENV': JSON.stringify('production')
                }
            }),            
            new UglifyJSPlugin()
        ]
    },{
        name: 'server',
        target: 'node',
        resolve: { 
            extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
        },
        devtool: debug ? "inline-source-map" : false,
        entry: {
            'main-server': './boot-server.tsx'
        },
        output: {
            filename: "[name].js",
            path: path.join(__dirname, 'server', 'dist'),
            libraryTarget: 'commonjs'
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
        }
    }];
}
