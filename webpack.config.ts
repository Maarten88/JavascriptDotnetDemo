import * as webpack from 'webpack';
import * as path from 'path';

const config: webpack.Configuration = {  
    resolve: { extensions: [ '.js', '.jsx', '.ts', '.tsx' ] },
    entry: {
        'client': './index.tsx'
    },
    output: {
        filename: "[name].js",
        path: path.join(__dirname, 'wwwroot/dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "awesome-typescript-loader"
            }
        ]
    }
};

export default config;