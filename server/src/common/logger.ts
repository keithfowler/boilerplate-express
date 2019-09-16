import winston from 'winston';
import { injectable } from "inversify";
import { ILogger } from './interfaces/logger';

@injectable()
export class Logger implements ILogger {
    private _logger: winston.Logger;

    public constructor() {
        //TODO: Inject config
        const transports = [];
        if (process.env.NODE_ENV !== 'development') {
            transports.push(
                new winston.transports.Console()
            );
        } else {
            transports.push(
                new winston.transports.Console()
            );
        }

        this._logger = winston.createLogger({
            level: 'debug',//config.logs.level,
            levels: winston.config.npm.levels,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
            ),
            transports
        });
    }

    public error(message: string): void {
        this._logger.error(message);
    }

    public warn(message: string): void {
        this._logger.warn(message);
    }

    public info(message: string): void {
        this._logger.info(message);
    }

    public debug(message: string): void {
        this._logger.debug(message);
    }

    public verbose(message: string): void {
        this._logger.verbose(message);
    }
}