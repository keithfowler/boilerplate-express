import http from 'http';
import { injectable, inject } from "inversify";
import mongoose from 'mongoose';
import { MainConfig } from '../config';
import { ILogger, COMMON_IDENTIFIERS } from '../common';
import { Express } from './express';

@injectable()
export class BootStrapper {
    private _mainConfig: MainConfig;
    private _logger: ILogger;
    private _express: Express;

    constructor(@inject(MainConfig) mainConfig: MainConfig, @inject(COMMON_IDENTIFIERS.LOGGER) logger: ILogger, @inject(Express) express: Express) {
        this._mainConfig = mainConfig;
        this._logger = logger;
        this._express = express;
    }

    public async execute() {
        mongoose.Promise = global.Promise;
        const connOptions: any = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        };

        if (process.env.NODE_ENV !== 'development') {
            connOptions['auth'] = {
                user: this._mainConfig.dbUserName,
                password: this._mainConfig.dbPassword
            };
        }

        await mongoose.connect(this._mainConfig.dbConnUrl, connOptions);
        await this._express.setup();

        const expressPort = this._mainConfig.expressPort;
        http.createServer(this._express.app).listen(expressPort, () => {
            this._logger.info(`App is running at http://localhost:${expressPort} in ${this._express.app.get('env')} mode`);
            this._logger.info('Press CTRL-C to stop\n');
        });
    }
}