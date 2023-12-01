const axios = require("axios");

async function login(logger, request, response) {
    let results;
    let refresh;

    try {
        results = await axios.post("https://www.vivintsky.com/api/login", {
            username: request.body.email,
            password: request.body.password,
            persist_session: true,
        });

        refresh = results.headers["set-cookie"].filter((cookie) => cookie.startsWith("s="))[0];
        if (refresh) {
            refresh = refresh.split(";")[0];
        }
    } catch (error) {
        logger.error("vivint login failed");
        logger.error(error.message);

        return response.send({ error });
    }

    try {
        results = await axios.get("https://www.vivintsky.com/api/authuser", { headers: { "Cookie": refresh } });

        let newRefreshToken = results.headers["set-cookie"].filter((cookie) => cookie.startsWith("s="))[0];
        if (newRefreshToken) {
            newRefreshToken = newRefreshToken.split(";")[0];
        }

        return response.send({ status: results.status, token: newRefreshToken });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            let newRefreshToken = error.response.headers["set-cookie"].filter((cookie) => cookie.startsWith("s="))[0];
                if (newRefreshToken) {
                    newRefreshToken = newRefreshToken.split(";")[0];
                }
            return response.send({ status: 401, token: newRefreshToken });
        }

        logger.error("vivint login failed");
        logger.error(error.message);

        return response.send({ error });
    }
}

async function validate(logger, request, response) {
    let results;

    try {
        results = await axios.post("https://www.vivintsky.com/platform-user-api/v0/platformusers/2fa/validate", {
            code: request.body.code,
            persist_session: true,
        },
        { headers: { "Cookie": request.body.token } });

        return response.send({ status: results.status, token: request.body.token });
    } catch (error) {
        logger.error("vivint login failed");
        logger.error(error.message);

        return response.send({ error });
    }
}

function save(config, request, response) {
    config.set("refreshToken", request.body.token);
    response.send({ success: true });
}

module.exports = (logger, config, api) => {
    api.registerRoute("login", (request, response) => login(logger, request, response));
    api.registerRoute("validate", (request, response) => validate(logger, request, response));
    api.registerRoute("save", (request, response) => save(config, request, response));
};
