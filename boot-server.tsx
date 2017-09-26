import * as path from 'path';
import * as express from 'express';
import * as React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { Blog } from './components/blog';
import { blogs } from './store/blogs';
import { Readable } from "stream";
import { WritableStreamBuffer } from 'stream-buffers';
import { createServerRenderer, RenderResult, RenderToStringResult } from 'aspnet-prerendering';

declare module "react-dom/server" {
    export function renderToNodeStream(element: React.ReactElement<any>): Readable;
}

const App = () => {
    return(
        <Blog blogs={blogs} />
    );
}

export function renderFunc(params: any) {
    return new Promise<RenderToStringResult>((resolve, reject) => {
      
        const writable = new WritableStreamBuffer();
        renderToNodeStream(<App />)
            .pipe(writable)
            .on('finish', () => {
                const html = writable.getContentsAsString('utf-8');
                resolve({ html });
            });
    });
}

// default export will be called by aspnet-prerenderer
export default createServerRenderer(renderFunc);
