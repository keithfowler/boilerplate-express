import "reflect-metadata";
import { Container } from "inversify";
import { ILogger, Logger, COMMON_IDENTIFIERS } from '../common';
import { HomeController, AuthController, CONTROLLER_IDENTIFIERS } from '../controllers';
import { BootStrapper, Express, Auth } from '../loaders';
import { MainConfig } from '../config';

let container = new Container();

container.bind<MainConfig>(MainConfig).to(MainConfig);
container.bind<ILogger>(COMMON_IDENTIFIERS.LOGGER).to(Logger);
container.bind<Express>(Express).to(Express);
container.bind<Auth>(Auth).to(Auth);
container.bind<HomeController>(CONTROLLER_IDENTIFIERS.HOME_CONTROLLER).to(HomeController);
container.bind<AuthController>(CONTROLLER_IDENTIFIERS.AUTH_CONTROLLER).to(AuthController);

container.bind<BootStrapper>(BootStrapper).to(BootStrapper);
console.log(`###### ${String(CONTROLLER_IDENTIFIERS.HOME_CONTROLLER)} ######`);
export { container };