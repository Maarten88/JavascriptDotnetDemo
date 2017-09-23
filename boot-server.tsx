import * as path from 'path';
import * as express from 'express';
import * as React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { Blog } from './components/blog';
import { blogs } from './store/blogs';

const App = () => {
    return(
        <div id="app">
            <Blog blogs={blogs} />
        </div>
    );
}

export function configure(app: express.Application) : express.Application
{
    app.get('/', function (_, res) { 

        res.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\"></head><body>");

        renderToNodeStream(<App />)
            .pipe(res, {end: false})
            .on('unpipe', () => {
                res.write("<script src=\"dist/client.js\"></script></body></html>");
                res.end();
            });
    });

    return app;
};
