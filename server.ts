import { configure } from './boot-server';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as webpack from 'webpack';
import * as path from 'path';
import webpackConfig from './webpack.config';
import * as express from 'express';

const port = (process.env.PORT || 8080);

const app = configure(express());

if (process.env.NODE_ENV !== 'production') {

    const config = webpackConfig(process.env);
    const compiler = webpack(config);
    
    app.use(webpackHotMiddleware(compiler));
    app.use(webpackDevMiddleware(compiler, {
        // noInfo: true
        publicPath: '/dist/'
    }));
} else {
    const publicPath = express.static(path.join(__dirname, 'wwwroot', 'dist'));
    app.use('/dist', publicPath);
}

app.listen(port)
console.log(`Listening at http://localhost:${port}`)