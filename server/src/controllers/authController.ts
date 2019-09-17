import express, { Router, Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { injectable, inject } from "inversify";
import { ILogger, COMMON_IDENTIFIERS } from '../common';
import { Auth } from '../loaders';

@injectable()
export class AuthController {
    private _logger: ILogger;
    private _authModule: Auth;

    public constructor(@inject(COMMON_IDENTIFIERS.LOGGER) logger: ILogger, @inject(Auth) authModule: Auth) {
        this._logger = logger;
        this._authModule = authModule;
    }

    public async configure(app: express.Express) {
        const router = Router();

        router.post('/login', [
            check('username', 'Invalid username').not().isEmpty(),
            check('password', 'Invalid password').not().isEmpty()
        ], async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                this._logger.info('Validation failed')
                this._logger.info(`${errors.array()}`);

                return res.status(422).json({ errors: errors.array() });
            }

            const response = await this._authModule.login(req.body.username, req.body.password);

            if (response.errors) {
                this._logger.info('Invalid credentials')
                this._logger.info(response.errors);
                
                return res.status(401).json({ 'errorMessage': 'Invalid credentials', 'errors': response.errors });
            }

            res.status(200).json(response);
        });

        app.use('/svc/auth', router);
    }
}