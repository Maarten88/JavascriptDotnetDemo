import * as path from 'path';
import * as express from 'express';
import * as React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { Blog } from './components/blog';
import { blogs } from './store/blogs';
import { Readable } from "stream";
import { WritableStreamBuffer } from 'stream-buffers';

declare module "react-dom/server" {
    export function renderToNodeStream(element: React.ReactElement<any>): Readable;
}

const App = () => {
    return(
        <Blog blogs={blogs} />
    );
}

interface RenderResult {
    html: string;
}

export function renderFunc(params: any) {
    return new Promise<RenderResult>((resolve, reject) => {
      
                const writable = new WritableStreamBuffer();
                renderToNodeStream(<App />)
                    .pipe(writable)
                    .on('finish', () => {
                        const html = writable.getContentsAsString('utf-8');
                        resolve({ html });
                    });
            });
}