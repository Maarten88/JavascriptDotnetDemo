import { ReactElement } from 'react';
import { Readable } from "stream";

declare module "react-dom/server" {
    export function renderToNodeStream(element: ReactElement<any>): Readable;
    export function renderToStaticNodeStream(element: ReactElement<any>): Readable;
}