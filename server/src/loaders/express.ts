import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import { injectable, inject } from "inversify";
import { ILogger, COMMON_IDENTIFIERS } from '../common';
import { HomeController, AuthController, CONTROLLER_IDENTIFIERS } from '../controllers';
import { Auth } from './auth';

console.log(CONTROLLER_IDENTIFIERS);
@injectable()
export class Express {
    public app: express.Express;
    private _logger: ILogger;
    private _authModule: Auth;
    private _homeController: HomeController;
    private _authController: AuthController;

    public constructor(@inject(COMMON_IDENTIFIERS.LOGGER) logger: ILogger, @inject(Auth) authModule: Auth, @inject(CONTROLLER_IDENTIFIERS.HOME_CONTROLLER) homeController: HomeController, @inject(CONTROLLER_IDENTIFIERS.AUTH_CONTROLLER) authController: AuthController) {
        this.app = express();
        this._logger = logger;
        this._authModule = authModule;
        this._homeController = homeController;
        this._authController = authController;
    }

    public async setup() {
        this.app.use(bodyParser.json());

        if (process.env.NODE_ENV === 'production') {
            this.app.use('/',
                express.static(path.join(__dirname, 'client'), { maxAge: 31557600000, index: 'index.html' })
            );
        } else {
            await this._authModule.stubUser();
            this._logger.info('admin user stubbed');

            this.app.use(errorHandler());
        }

        this.app.use(this._authModule.initialize());

        this.app.all('/svc/*', (req, res, next) => {
            if (req.path.includes('/svc/auth/login')) { return next(); }

            return this._authModule.authenticate((err, user, info) => {
                if (err) { return next(err); }
                if (!user) {
                    if (info.name === 'TokenExpiredError') {
                        return res.status(401).json({ message: 'Your token has expired. Please generate a new one' });
                    } else {
                        return res.status(401).json({ message: info.message });
                    }
                }

                this.app.set('user', user);

                return next();
            })(req, res, next);
        });

        await this._homeController.configure(this.app);
        await this._authController.configure(this.app);
    }
}