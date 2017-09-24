# Demo script

Prerequisites: 
- nodejs 8 (current): https://nodejs.org/en/download/current/
- yarn (improved npm): https://yarnpkg.com/lang/en/docs/install/

### Setup typescript and webpack

terminal: create package.json javascript project file, add typescript compiler and webpack build tool to the project

    yarn init
    yarn add typescript webpack @types/webpack ts-node awesome-typescript-loader

editor: create tsconfig.json:

    {
        "include": [
        ],
        "compilerOptions": {
            "allowJs": false,
            "jsx": "react",
            "module": "commonjs",
            "target": "es5"
        }
    }

editor: create webpack.config.ts to configure typescript compilation in the build process

    import * as webpack from 'webpack';
    import * as path from 'path';

    const config: webpack.Configuration = {  
        resolve: { extensions: [ '.js', '.jsx', '.ts', '.tsx' ] },
        entry: {
            'client': './index.tsx'
        },
        output: {
            filename: "[name].js",
            path: path.join(__dirname, 'wwwroot/dist'),
            publicPath: '/dist/'
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

- package.json: 
    - add script `"build": "webpack --config webpack.config.ts"` 
    - add script `"watch": "webpack --config webpack.config.ts --watch"` 

### Create react app

terminal:

    yarn add react@next react-dom@next @types/react @types/react-dom

editor: new file index.html

    <html>
        <head>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
        </head>
        <body>
            <div id="app"></div>
            <script src="dist/client.js"></script>
        </body>
    </html>

editor: new file index.tsx

    import * as React from 'react';
    import * as ReactDOM from 'react-dom';

    function Article({title, content} : {title: string, content: string}) {
        return (
            <article className="container">
                <h1>{title}</h1>
                <p>{content}</p>
            </article>
        );
    }

    const app = document.getElementById("app");
    ReactDOM.render(
        <Article title="Hello Title" content="Hello Content" />, 
        app
    );

Open index.html in a browser and see that it works. Run `yarn watch`, than change some code and refresh to see that it was compiled.

### Setup node server with hot module reloading

Terminal: install webpack dev server:

    yarn add webpack-dev-server
    yarn global add webpack-dev-server

We can now run `webpack-dev-server --content-base wwwroot` and see that on edits, our page gets reloaded. Go to http://localhost:8080/webpack-dev-server/index.html to see it.

we can also run

    webpack-dev-server --content-base wwwroot --inline --hot

and go to http://localhost:8080 to see our app without the iframe.

Edit the scripts section in packages.json to easily start a development session:

    "scripts": {
        ...
        "dev": "./node_modules/.bin/webpack-dev-server --content-base wwwroot --inline --hot"
    }


Improve our typescript compilation. We want es2017 modules that can be hot-reloaded. This is also also needed for tree shaking.

Terminal:

    yarn add @types/webpack-env

Editor: create tsconfig.client.json:

    {
        "include": [
        ],
        "compilerOptions": {
            "allowJs": false,
            "jsx": "react",
            "module": "esnext",
            "target": "es5",
            "types": [
                "webpack-env"
            ],
            "typeRoots": [
                "node_modules",
                "node_modules/@types"
            ]
        }
    }


Improve our webpack.config.ts to use this typescript config, and also configure it to enable development and debug builds:

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

Now improve hot module reloading to avoid a complete screen refresh. In index.tsx, add:

    if (module.hot) {
        module.hot.accept();
    }

Run `yarn dev` and edit index.tsx to see hot module replacement working. Comment out these lines and make an edit to see the difference.

Now expand the app a little bit. Make a folder `components` and put the Article component there. Also make a Blog component that returns a list of Article components.
Make a `store` folder and put a blogs.ts file there that exports an array of article items, and pass those into the Blog component.

The compiled javascript output is around 3Mb. It has embedded sourcemaps and is uncompressed. Lets make a production build. Edit the scripts section in packages.json to add the production build:

    "scripts": {
        ...
        "prod": "webpack --config webpack.config.ts -p --env.NODE_ENV=production",
    }

Run `yarn prod` and see that our production build creates a 116kb package.

### Setup server rendering

To enable serverside rendering we need a server process where we can execute our javascript serverside. We will configure node with express to run our application on the server. First we'll create the equivalent of webpack-dev-server.

Terminal: add express node server

    yarn add express @types/express
    yarn add webpack-hot-middleware @types/webpack-hot-middleware @types/webpack-dev-middleware

Editor: create express server application app.ts:

    import * as path from 'path';
    import * as express from 'express';

    export const appFunc = () => {
        const app = express();
        const indexPath = path.join(__dirname, './wwwroot/index.html');
        const publicPath = express.static(path.join(__dirname, './wwwroot'));

        app.use('/wwwroot', publicPath);
        app.get('/', function (_, res) { res.sendFile(indexPath) });

        return app;
    };

Create the express server.ts:

    import { appFunc } from './app';
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
        
        const distPath = path.join(__dirname, './wwwroot/dist')
        app.use(webpackHotMiddleware(compiler));
        app.use(webpackDevMiddleware(compiler, {
            // noInfo: true
            publicPath: config.output.publicPath
        }));
    }

    app.listen(port)
    console.log(`Listening at http://localhost:${port}`)

Modify webpack.config.ts for hot module reloading:

        ...
        entry: {
            'client': ['webpack-hot-middleware/client', './index.tsx']
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

Now run it: `yarn dev`. We now have exactly the same behaviour as before: our page loads and supports hot module replacement. The difference is that we now have a server process that we can use for serverside rendering.

### Setup serverside rendering of react components
(Using React 16)

We are going to use the very newest version of React, React 'Fiber', or version 16. It is still very new, and some typescript typings are still missing.
But it does serverside rendering faster and with cleaner html code than the current version of React, which is why I wanted to use it.

We are going to make a serverside version of our application, the root of which is in `client.tsx`. We are going to rename that file to `boot-client.tsx`, and make a new `boot-server.tsx` that will also render our react components, only we'll do it server-side, inside node.

We'll have to hack the type definitions into our code, or use the "any" type.

First we create boot-server.tsx:

    import * as path from 'path';
    import * as express from 'express';
    import * as React from 'react';
    import { renderToNodeStream } from 'react-dom/server';
    import { Blog } from './components/blog';
    import { blogs } from './store/blogs';
    import { Readable } from "stream";

    declare module "react-dom/server" {
        export function renderToNodeStream(element: React.ReactElement<any>): Readable;
    }

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

This code writes the first half of our index.html to the response stream, then pipes the serverside rendered React application to the response, and when finished it adds the closing part of the page, that also references the clientside script. React 16 makes it possible to attach its clientside version to the serverside rendered html for which there is a new clientside method, called 'hydrate'.

We refactor server.js a little bit to call our new boot-server, instead of sending the static file index.html:

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
        
        app.use(webpackHotMiddleware(compiler as any));
        app.use(webpackDevMiddleware(compiler, {
            publicPath: '/dist/'
        }));
    } else {
        const publicPath = express.static(path.join(__dirname, './wwwroot/dist'));
        app.use('/dist', publicPath);
    }

    app.listen(port)
    console.log(`Listening at http://localhost:${port}`)

This code will start the express server in either development or production mode.


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

Now we have two root files for our application: boot-server.tsx will execute in node, and boot-client will execute in the users' browser. We can compile the two files with the same settings, but that would lead to 'lowest common denominator' settings. Node 8+ can execute modern javascript syntax, including classes, async, spread en deconstruction. But it can't do native es2015 module import, it only works with commonjs modules.
In the browser we can't do this. Although 85% of all browsers now support modern javascript, most websites want to support a higher percentage of users. It is possible to polyfill missing functions, but not unsupported syntax. So we need to compile the clientside code to es5.

To make this possible, we add a tsconfig.client.json and configure it for the browser:

    {
        "include": [
        ],
        "compilerOptions": {
            "baseUrl": "./",
            "allowJs": true,
            "jsx": "react",
            "module": "esnext",
            "target": "es5",
            "types": [
                "webpack-env"
            ],
            "typeRoots": [
                "./node_modules/@types"
            ]
        }
    }

tsconfig.json is now used for the node server:

    {
        // this tsconfig is for typescript running in node, and ts-node
        // vscode will also use this configuration for intellisense
        "include": [
        ],
        "compilerOptions": {
            "baseUrl": ".",
            "allowJs": false,
            "jsx": "react",
            "module": "commonjs",
            "target": "es2017", // because we run this in node 8+
            "types": [
                "node"
            ],
            "typeRoots": [
                "node_modules/@types"
            ]
        }
    }

Our webpack.config.ts now needs to return two compiler targets: one for the browser and another one for the server. There is also a development and a production setting that is passed around. It gets quite complex:

    import * as webpack from 'webpack';
    import * as path from 'path';
    import * as UglifyJSPlugin from 'uglifyjs-webpack-plugin';

    const config : (env: any) => webpack.Configuration[] = (env = {}) => {

        const debug = env.NODE_ENV !== "production";
        console.log('debug: ', debug) 
        
        return [{
            name: 'client',
            resolve: { 
                extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
            },
            devtool: debug ? "inline-source-map" : false,
            entry: {
                'client': debug ? ['webpack-hot-middleware/client?name=client', './boot-client.tsx'] : ['./boot-client.tsx']
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
            ],
            node: {
                fs: 'empty',
                child_process: 'empty',
            }
        },
        {
            name: 'server',
            resolve: { 
                extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
            },
            devtool: debug ? "inline-source-map" : false,
            entry: {
                'server': './boot-server.tsx'
            },
            output: {
                filename: "[name].js",
                path: path.resolve(__dirname, 'server/dist')
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
            ] : [
                new webpack.DefinePlugin({
                    'process.env':{
                        'NODE_ENV': JSON.stringify('production')
                    }
                }),            
                new UglifyJSPlugin({
                    sourceMap: true,
                    parallel: {
                        cache: true,
                        workers: 2
                    },
                    uglifyOptions: {
                        mangle: false,
                        ecma: 8,
                        compress: false
                    }
                })
            ],
            node: {
                fs: 'empty',
                net: 'empty'
            }
        }
    ]}

    export default config;


All of this has gotten quite complex. If there is a problem, how do we fix it? We need to be able to do some debugging. First, we'll add a script entry to package.json:

    "debug": "./node_modules/.bin/ts-node --inspect=9229 --debug-brk server.ts"

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