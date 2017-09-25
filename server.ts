import { createServerRenderer } from './boot-server';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as webpack from 'webpack';
import * as path from 'path';
import webpackConfig from './webpack.config';
import * as express from 'express';

const port = (process.env.PORT || 8080);

const app = express();

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

app.get('/', function (_, res) { 
    
    createServerRenderer({}).then(renderResult => {
        res.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\"></head><body>");
        res.write(renderResult.html);
        res.write("<script src=\"dist/client.js\"></script></body></html>");
        res.end();
    })
});    


app.listen(port)
console.log(`Listening at http://localhost:${port}`)