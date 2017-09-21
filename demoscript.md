# Demo script

### Setup typescript and webpack

terminal:

    yarn init

terminal:

    yarn add typescript webpack @types/webpack ts-node awesome-typescript-loader

editor: create tsconfig.json:

    {
        "include": [
        ],
        "compilerOptions": {
            "baseUrl": "./",
            "allowJs": false,
            "jsx": "react",
            "module": "commonjs",
            "target": "es5"
        }
    }

editor: create webpack.config.ts


- package.json: 
    - add script `"build": "webpack --config webpack.config.ts"` 
    - add script `"watch": "webpack --config webpack.config.ts --watch"` 

### Create react app

terminal:

    yarn add react@next react-dom@next @types/react @types/react-dom

editor: new file index.html
- basic html head and body
- add styling: `<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">`
- add `<div id="app"></div>`
- add `<script src="dist/client.js"></script>`

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

### Setup node server with hot module reloading
