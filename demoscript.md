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
