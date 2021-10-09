const { join } = require("path");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const { createHash, randomBytes } = require("crypto");
const axios = require("axios");

function sha256(buffer) {
    return createHash("sha256").update(buffer).digest();
}

function base64(value) {
    return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function accountsFile(api, logger) {
    let result = {};

    logger.debug(join(api.storagePath, "simplisafe3auth.json"));

    if (existsSync(join(api.storagePath, "simplisafe3auth.json"))) {
        try {
            result = JSON.parse(readFileSync(join(api.storagePath, "simplisafe3auth.json")).toString());
        } catch (error) {
            result = {};
        }
    }

    result.codeVerifier = result.codeVerifier || base64(randomBytes(32));

    writeFileSync(join(api.storagePath, "simplisafe3auth.json"), JSON.stringify(result));

    return result;
}

function authenticate(api, logger, response) {
    logger.debug("authenticate");

    const accounts = accountsFile(api, logger);
    const builder = new URL("https://auth.simplisafe.com/authorize");

    builder.searchParams.append("client_id", "42aBZ5lYrVW12jfOuu3CQROitwxg9sN5");
    builder.searchParams.append("scope", "__SCOPE__");
    builder.searchParams.append("response_type", "code");
    builder.searchParams.append("redirect_uri", "com.simplisafe.mobile://auth.simplisafe.com/ios/com.simplisafe.mobile/callback");
    builder.searchParams.append("code_challenge_method", "S256");
    builder.searchParams.append("code_challenge", base64(sha256(accounts.codeVerifier)));
    builder.searchParams.append("audience", "__AUDIENCE__");
    builder.searchParams.append("auth0Client", "eyJuYW1lIjoiQXV0aDAuc3dpZnQiLCJlbnYiOnsiaU9TIjoiMTUuMCIsInN3aWZ0IjoiNS54In0sInZlcnNpb24iOiIxLjMzLjAifQ");

    let url = builder.toString()
    
    url = url.replace("__SCOPE__", "offline_access%20email%20openid%20https://api.simplisafe.com/scopes/user:platform");
    url = url.replace("__AUDIENCE__", "https://api.simplisafe.com/");

    logger.debug(url);

    return response.send({ success: true, url });
}

function token(api, config, logger, request, response) {
    logger.debug("token");

    const accounts = accountsFile(api, logger);

    axios.post("https://auth.simplisafe.com/oauth/token", {
        grant_type: "authorization_code",
        client_id: "42aBZ5lYrVW12jfOuu3CQROitwxg9sN5",
        code_verifier: accounts.codeVerifier,
        code: request.body.code,
        redirect_uri: "com.simplisafe.mobile://auth.simplisafe.com/ios/com.simplisafe.mobile/callback"
    }).then((token) => {
        accounts.accessToken = token.data.access_token;
        accounts.refreshToken = token.data.refresh_token;

        writeFileSync(join(api.storagePath, "simplisafe3auth.json"), JSON.stringify(accounts));
        config.set("refreshToken", accounts.refreshToken);

        response.send({ success: true, accessToken: accounts.accessToken, refreshToken: accounts.refreshToken });
    }).catch((error) => {
        logger.error(error.toString());

        response.send({ success: false });
    });
}

module.exports = (logger, config, api) => {
    api.registerRoute("authenticate", (_request, response) => authenticate(api, logger, response));
    api.registerRoute("token", (request, response) => token(api, config, logger, request, response));
};
