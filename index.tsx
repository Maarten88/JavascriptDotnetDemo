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
