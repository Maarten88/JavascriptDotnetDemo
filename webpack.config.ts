import * as webpack from 'webpack';
import * as path from 'path';

const config : (env: any) => webpack.Configuration = (env = {}) => {

    const debug = env.NODE_ENV !== "production";
    console.log('debug: ', debug) 
    
    return {
        resolve: { 
            extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
        },
        devtool: debug ? "inline-source-map" : false,
        entry: {
            'client': './index.tsx'
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
        }
    };
}

export default config;