import { appFunc } from './boot-server';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as webpack from 'webpack';
import * as path from 'path';
import webpackConfig from './webpack.config';

const port = (process.env.PORT || 8080);
const app = appFunc();

if (process.env.NODE_ENV !== 'production') {

    const config = webpackConfig(process.env);
    const compiler = webpack(config);
    
    app.use(webpackHotMiddleware(compiler as any));
    app.use(webpackDevMiddleware(compiler, {
        // noInfo: true
        publicPath: config[0].output.publicPath
    }));
}

app.listen(port)
console.log(`Listening at http://localhost:${port}`)