import express, { Router, Request, Response, NextFunction } from 'express';
import { injectable, inject } from "inversify";
import { ILogger, COMMON_IDENTIFIERS } from '../common';

@injectable()
export class HomeController {
    private _logger: ILogger;

    public constructor(@inject(COMMON_IDENTIFIERS.LOGGER) logger: ILogger) {
        this._logger = logger;
    }

    public async configure(app: express.Express) {
        const router = Router();

        router.get('/', async (req: Request, res: Response) => {
            this._logger.info('Hit the home controller!');
            res.json({ 'Hello': 'World!' });
        });

        app.use('/svc/home', router);
    }
}