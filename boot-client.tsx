import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Blog } from './components/blog';
import { blogs } from './store/blogs';

const app = document.getElementById("app");
(ReactDOM as any).hydrate(
    <Blog blogs={blogs} />, 
    app
);

if (module.hot) {
    module.hot.accept();
}