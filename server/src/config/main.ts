import { injectable } from "inversify";
import { config } from 'dotenv';
config();

@injectable()
export class MainConfig {
    public expressPort: number = parseInt(<string>process.env.EXPRESS_PORT, 10);
    public dbConnUrl: string = <string>process.env.DB_CONN_URL;
    public dbUserName: string = <string>process.env.DB_USERNAME;
    public dbPassword: string = <string>process.env.DB_PASSWORD;
    public jwtSecret: string = <string>process.env.JWT_SECRET;
    public jwtTokenExpiration: number = parseInt(<string>process.env.JWT_TOKEN_EXPIRATION, 10);
}