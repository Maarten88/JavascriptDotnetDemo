### 2: Setup node server with hot module reloading

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


Editing a file refreshes the page. But webpack can do it much nicer: it can reload individual javascript files. To get that, we'll need to change our typescript compilation a liitle bit. We want es2017 modules that can be hot-reloaded. This is also also needed for tree shaking.

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
            "sourceMap": true,
            "types": [
                "webpack-env"
            ],
            "typeRoots": [
                "node_modules/@types"
            ]
        }
    }


Improve our webpack.config.ts to use this typescript config:

            ...
            use: {
                loader: "awesome-typescript-loader",
                options: {
                    configFileName: "tsconfig.client.json"
                }
            }
            ...



Now improve hot module reloading to avoid a complete screen refresh. In index.tsx, add:

    if (module.hot) {
        module.hot.accept();
    }

Run `yarn dev` and edit index.tsx to see hot module replacement working. Comment out these lines and make an edit to see the difference.

Now it's really easy to expand the app a little bit. Make a folder `components` and put the Article component there. Also make a Blog component that returns a list of Article components.
Make a `store` folder and put a blogs.ts file there that exports an array of article items, and pass those into the Blog component.


### Optional: configure production build
The compiled javascript output is over 2Mb, and we only wrote a few lines of code. The output has embedded sourcemaps and is uncompressed. It contains the development build of React. Lets make a production build.

Configure webpack.config.ts to add a production build:

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


Edit the scripts section in packages.json to add the production build:

    "scripts": {
        ...
        "prod": "webpack --config webpack.config.ts -p --env.NODE_ENV=production",
    }

Run `yarn prod` and see that our production build creates a 116kb package.

