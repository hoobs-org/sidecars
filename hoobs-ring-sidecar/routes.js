const axios = require("axios");

async function login(logger, _config, _api, request, response) {
    let results;

    try {
        results = await axios.post("https://oauth.ring.com/oauth/token", {
            client_id: "ring_official_android",
            scope: "client",
            grant_type: "password",
            password: request.body.password,
            username: request.body.username,
        },
        { headers: { "content-type": "application/json", "2fa-support": "true", "2fa-code": request.body.verification || "" } });

        return response.send(results.data);
    } catch (error) {
        if (error.response && error.response.status === 412) {
            return response.send({ status: 412 });
        }

        if (error.response && error.response.data) {
            return response.send(error.response.data);
        }

        logger.error("ring login failed");
        logger.error(error.message);

        return response.send({ error });
    }
}

module.exports = (logger, config, api) => {
    api.registerRoute("login", (request, response) => login(logger, config, api, request, response));
};
