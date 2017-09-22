import * as path from 'path';
import * as express from 'express';
import * as React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { Blog } from './components/blog';
import { blogs } from './store/blogs';
import { ReactElement } from 'react';

type RenderToNodeStreamFunc = (element: ReactElement<any>) => any;

export const appFunc = () => {
    const app = express();
    const indexPath = path.join(__dirname, './wwwroot/index.html');
    const publicPath = express.static(path.join(__dirname, './wwwroot'));

    app.get('/', function (_, res) { 

        // write opening <html> <head> <body> tags streamed
        renderToNodeStream(<Blog blogs={blogs} />)
            .pipe(res)
            .on('end', () => {
                // write the rest of the page, </body>, </html>
                res.end();
            })

    });

    return app;
};
