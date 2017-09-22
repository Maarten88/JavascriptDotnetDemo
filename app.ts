import * as path from 'path';
import * as express from 'express';

export const appFunc = () => {
    const app = express();
    const indexPath = path.join(__dirname, './wwwroot/index.html');
    const publicPath = express.static(path.join(__dirname, './wwwroot'));

    app.use('/wwwroot', publicPath);
    app.get('/', function (_, res) { res.sendFile(indexPath) });

    return app;
};
