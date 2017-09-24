import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Blog } from './components/blog';
import { blogs } from './store/blogs';

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

if (module.hot) {
    module.hot.accept();
}