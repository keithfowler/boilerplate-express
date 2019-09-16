import { injectable, inject } from "inversify";
import express from 'express';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { MainConfig } from '../config';
import { ILogger, COMMON_IDENTIFIERS } from '../common/';
import { User, IUser } from '../models';

@injectable()
export class Auth {
    private _jwtSecret: string;
    private _jwtExpiration: number;
    private _logger: ILogger;

    public constructor(@inject(MainConfig) mainConfig: MainConfig, @inject(COMMON_IDENTIFIERS.LOGGER) logger: ILogger) {
        this._jwtSecret = mainConfig.jwtSecret;
        this._jwtExpiration = mainConfig.jwtTokenExpiration;
        this._logger = logger;
    }

    public initialize(): express.Handler {
        passport.use('jwt', this._getStrategy());

        return passport.initialize();
    }

    public async stubUser() {
        try {
            const checkUser = await User.findOne({ 'username': 'admin' }).exec();

            if (checkUser === null) {
                const user = new User({ username: 'admin', password: 'password' });

                await user.save();
            }
        } catch (err) {
            this._logger.error(err);
        }
    }

    public authenticate = (callback: ((...args: any[]) => any) | undefined) => passport.authenticate('jwt', { session: false, failWithError: true }, callback);

    public async login(username: string, password: string): Promise<any> {
        try {
            const user = await User.findOne({ 'username': username });

            if (user === null) { throw new Error('User not found'); }

            const success = await user.comparePassword(password);
            if (success === false) { throw new Error(); }

            return this._genToken(user);
        } catch (err) {
            this._logger.error(err);
            return {
                errors: err
            };
        }
    }

    private _genToken(user: IUser): Object {
        const expires = moment().utc().add({ days: this._jwtExpiration }).unix();
        const token = jwt.sign({
            exp: expires,
            username: user.username
        }, this._jwtSecret);

        return {
            token: token,
            expires: moment.unix(expires).format(),
            userId: user._id
        };
    }

    private _getStrategy(): Strategy {
        const params = {
            secretOrKey: this._jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            passReqToCallback: true
        };

        return new Strategy(params, async (req: any, payload: any, done: any) => {
            try {
                const user = await User.findOne({ 'username': payload.username });
                if (user === null) {
                    return done(null, false, { message: 'The user in the token was not found' });
                }

                return done(null, { _id: user._id, username: user.username });
            } catch (err) {
                this._logger.error(err);
                return done(err);
            }
        });
    }
}