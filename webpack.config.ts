import * as webpack from 'webpack';
import * as path from 'path';
import * as UglifyJSPlugin from 'uglifyjs-webpack-plugin';

const config : (env: any) => webpack.Configuration = (env = {}) => {

    const debug = env.NODE_ENV !== "production";
    console.log('debug: ', debug) 
    
    return {
        resolve: { 
            extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
        },
        devtool: debug ? "inline-source-map" : false,
        entry: {
            'main-client': debug ? ['webpack-hot-middleware/client', './boot-client.tsx'] : ['./boot-client.tsx']
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
        ]
    }
}

export default config;