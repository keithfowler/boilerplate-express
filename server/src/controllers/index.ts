const CONTROLLER_IDENTIFIERS = {
    HOME_CONTROLLER: Symbol.for("HomeController"),
    AUTH_CONTROLLER: Symbol.for("AuthController")
};

export { CONTROLLER_IDENTIFIERS }
export * from './homeController';
export * from './authController';