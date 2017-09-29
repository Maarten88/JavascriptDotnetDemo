### 3: Setup server rendering with React 16

To enable serverside rendering we need a server process where we can execute our javascript serverside. We will configure node with express to run our application on the server. First we'll create the equivalent of webpack-dev-server.

Terminal: add express node server, webpack middleware and the stream-buffers utility package

    yarn add express @types/express
    yarn add webpack-hot-middleware @types/webpack-hot-middleware @types/webpack-dev-middleware
    yarn add stream-buffers @types/stream-buffers

We are going to use the very newest version of React, React 'Fiber', or version 16. It is still very new, and some typescript typings are still missing.
But it does serverside rendering faster and with cleaner html code than the current version of React, which is why I wanted to use it. To get it working with typescript, we'll have to hack the type definitions into our code, or use the "any" type.

Editor: create express server application server.ts:

    import * as webpackDevMiddleware from 'webpack-dev-middleware';
    import * as webpackHotMiddleware from 'webpack-hot-middleware';
    import * as webpack from 'webpack';
    import * as path from 'path';
    import webpackConfig from './webpack.config';
    import * as express from 'express';
    import { renderFunc } from './boot-server';

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
        
        renderFunc({}).then(renderResult => {
            res.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\"></head><body><div id=\"app\">");
            res.write(renderResult.html);
            res.write("</div><script src=\"/dist/main-client.js\"></script></body></html>");
            res.end();
        })
    });    


    app.listen(port)
    console.log(`Listening at http://localhost:${port}`)

We are going to make a serverside version of our application, the root of which is in `client.tsx`. We are going to rename that file to `boot-client.tsx`, and make a new `boot-server.tsx` that will also render our react components, only we'll do it server-side, inside node. This file will render our application html code into a string, that will be returned as a promise to server.ts.

Editor: boot-server.tsx

    import * as path from 'path';
    import * as express from 'express';
    import * as React from 'react';
    import { renderToNodeStream } from 'react-dom/server';
    import { Blog } from './components/blog';
    import { blogs } from './store/blogs';
    import { Readable } from "stream";
    import { WritableStreamBuffer } from 'stream-buffers';

    declare module "react-dom/server" {
        export function renderToNodeStream(element: React.ReactElement<any>): Readable;
    }

    const App = () => {
        return(
            <Blog blogs={blogs} />
        );
    }

    interface RenderResult {
        html: string;
    }

    export function renderFunc(params: any) {
        return new Promise<RenderResult>((resolve, reject) => {
        
                    const writable = new WritableStreamBuffer();
                    renderToNodeStream(<App />)
                        .pipe(writable)
                        .on('finish', () => {
                            const html = writable.getContentsAsString('utf-8');
                            resolve({ html });
                        });
                });
    }

The serverside renderer uses the new renderToNodeStream() function, that efficiently streams the result from React server rendering into a buffer. When it it done, the stream is read into a string and the promise resolves.

We have used a Promise here, but our server compilation does not know that, so we'll have to teach it via tsconfig.json. We'll use a native Promise by specifying es2017 target (meaning typescript will leave it alone):

    "target": "es2017", // because we run this in node 8+

React 16 has a special function to pickup serverside rendered html code and continue clientside, called hydrate(). Like renderToNodeStream, it is also not yet added to the React typings, so we'll declare it inline.

Update boot-client.tsx with the foollowing code:

    declare module 'react-dom' {
        function hydrate<P>(
            element: React.ReactElement<P>,
            container: Element | null,
            callback?: (component?: React.Component<P, React.ComponentState> | Element) => any
        ): React.Component<P, React.ComponentState> | Element | void;
    }

    const app = document.getElementById("app");

    ReactDOM.hydrate(
        <Blog blogs={blogs} />, 
        app
    );


Modify webpack.config.ts for hot module reloading according to the docs (https://github.com/glenjamin/webpack-hot-middleware):

        ...
        entry: {
            'main-client': ['webpack-hot-middleware/client', './boot-client.tsx']
        },
        ...
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        ],


Update the dev script in package.json:

    "scripts": {
        ...
        "dev": "./node_modules/.bin/ts-node server.ts"
    }

Now run it: `yarn dev`. We now have exactly the same behaviour as before: our page loads and supports hot module replacement. The difference is that we now have a server process does serverside rendering of our react application. SEO is happy now.

All of this has gotten quite complex. If there is a problem, how do we fix it? We need to be able to do some debugging. First, we'll add a script entry to package.json:

    "debug": "./node_modules/.bin/ts-node --inspect=9229 --inspect-brk server.ts"

Add the Debugger for Chrome extension to vscode and relaunch it. Now go to the debug tab and edit the launch settings:

    {
        "version": "0.2.0",
        "configurations": [
            {
                "name": "Debug Server Rendering",
                "type": "node",
                "request": "launch",
                "cwd": "${workspaceRoot}",
                "runtimeExecutable": "yarn",
                "runtimeArgs": [
                    "run", "debug"
                ],
                "port": 9229
            },
            {
                "name": "Launch in Chrome",
                "type": "chrome",
                "request": "launch",
                "url": "http://localhost:8080/",
                "webRoot": "${workspaceRoot}"
            }           
        ]
    }

This configures both web and server debugging, and you can directly edit source files. You'll have to restart node to run updated server code, but clientside code will automatically reload.

It is possible to debug code running in nodejs from vscode, but it can also be done from Chrome. Run `yarn debug`, open the page on http://localhost:8080 from a terminal and open chrome developer tools (F12), then find the `Open dedicated DevTools for nodejs` icon in the upper left corner, and click it. Or enter chrome:inspect in the navigation bar. Because we entered inspect-brk as a startup parameter, the debugger will break on the first line that is hit, which in our case is ts-node that will compile our typescript code before running it.
