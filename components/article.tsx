import * as React from 'react';

export interface ArticleProps {
    title: string; 
    content: string;
}

export function Article(props: ArticleProps) {
    return (
        <article>
            <h1>{props.title}</h1>
            <p>{props.content}</p>
        </article>
    );
}