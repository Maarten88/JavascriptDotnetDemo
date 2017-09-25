import * as React from 'react';
import { Article, ArticleProps } from './article';

export function Blog({blogs} : {blogs: ArticleProps[]}) {
    return (
        <div className = "container">
            <h3 className="">Here are my blog posts</h3>
            <hr />
            { blogs.map((article, index) => <Article key={index} {...article} />)}
        </div>
    );
}