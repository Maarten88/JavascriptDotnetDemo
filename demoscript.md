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
