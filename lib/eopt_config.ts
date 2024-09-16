// Everything in this object is read-only in order to mitigate risks associated with global state.
export interface EoptConfigImmutable {
    readonly session_cookie_password: string,
    readonly server_self_url: string,
}

const EoptConfig: EoptConfigImmutable = (() => {
    const config = {
        session_cookie_password: process.env.EOPT_SESSION_SECRET!,
        server_self_url: process.env.EOPT_SERVER_SELF_URL!,
    };

    if (config.session_cookie_password === undefined) {
        throw new Error("EOPT_SESSION_SECRET must be set in the environment");
    }
    if (config.server_self_url === undefined) {
        throw new Error("EOPT_SERVER_SELF_URL must be set in the environment");
    }

    return config;
})();

export default EoptConfig;

