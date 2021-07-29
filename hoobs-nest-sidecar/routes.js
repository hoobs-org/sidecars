const axios = require("axios");
const querystring = require("querystring");

function redirect(_logger, _config, _api, _request, response) {
    return response.send({ url: `https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?${querystring.stringify({
        access_type: "offline",
        response_type: "code",
        scope: "openid profile email https://www.googleapis.com/auth/nest-account",
        redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
        client_id: "733249279899-1gpkq9duqmdp55a7e5lft1pr2smumdla.apps.googleusercontent.com",
    })}` });
}

async function token(_logger, _config, _api, request, response) {
    try {
        return response.send({
            token: ((await axios({
                method: "POST",
                timeout: 10 * 1000,
                url: "https://oauth2.googleapis.com/token",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
                },
                data: querystring.stringify({
                    code: request.body.code,
                    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
                    client_id: "733249279899-1gpkq9duqmdp55a7e5lft1pr2smumdla.apps.googleusercontent.com",
                    grant_type: "authorization_code",
                }),
            })).data || {}).refresh_token,
        });
    } catch (error) {
        if ((error || {}).message) {
            return response.send({ error: error.message });
        } else {
            return response.send({ error: "unhandled" });
        }
    }
}

async function access(_logger, _config, _api, request, response) {
    try {
        return response.send({
            token: ((await axios({
                method: "POST",
                timeout: 10 * 1000,
                url: "https://oauth2.googleapis.com/token",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
                },
                data: querystring.stringify({
                    refresh_token: request.body.token,
                    client_id: "733249279899-1gpkq9duqmdp55a7e5lft1pr2smumdla.apps.googleusercontent.com",
                    grant_type: 'refresh_token',
                }),
            })).data || {}).access_token,
        });
    } catch (error) {
        if ((error || {}).message) {
            return response.send({ error: error.message });
        } else {
            return response.send({ error: "unhandled" });
        }
    }
}

function save(config, request, response) {
    config.set(request.body.field, request.body.token);
    response.send({ success: true });
}

module.exports = (logger, config, api) => {
    api.registerRoute("redirect", (request, response) => redirect(logger, config, api, request, response));
    api.registerRoute("access", (request, response) => access(logger, config, api, request, response));
    api.registerRoute("token", (request, response) => token(logger, config, api, request, response));
    api.registerRoute("save", (request, response) => save(config, request, response));
};
