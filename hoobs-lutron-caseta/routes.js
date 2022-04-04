const { BridgeFinder, LeapClient, PairingClient } = require("lutron-leap");
const forge = require("node-forge");
const { config } = require("process");

function listen(client) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timed out")), 30000);

        client.once("message", (response) => {
            if (response.Body.Status.Permissions.includes("PhysicalAccess")) {
                clearTimeout(timeout);

                resolve();
            } else {
                reject(new Error(response));
            }
        });
    });
}

function generateKeyPair() {
    return new Promise((resolve, reject) => {
        forge.pki.rsa.generateKeyPair({ bits: 2048 }, (error, keyPair) => {
            if (error) {
                reject(error);
            } else {
                resolve(keyPair);
            }
        });
    });
}

function pair(client, csr) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("csr response timed out")), 5000);

        client.once("message", (response) => {
            clearTimeout(timeout);

            if (response.Header.StatusCode !== "200 OK") {
                reject(new Error("bad csr response"));
            } else {
                resolve(response);
            }
        });

        client.requestPair(forge.pki.certificationRequestToPem(csr));
    });
}

function connect(bridgeid, ipAddr, secrets) {
    return new Promise((resolve, reject) => {
        const client = new LeapClient(ipAddr, 8081, secrets.ca, secrets.key, secrets.cert);

        client.connect().then(() => {
            resolve({
                bridgeid,
                ca: secrets.ca,
                key: secrets.key,
                cert: secrets.cert,
            });
        }).catch((error) => reject(error));
    });
}

function associate(bridgeid, ipAddr) {
    return new Promise((resolve, reject) => {
        const client = new PairingClient(ipAddr, 8083);

        client.connect().then(() => {
            listen(client).then(() => {
                generateKeyPair().then((keys) => {
                    const csr = forge.pki.createCertificationRequest();

                    csr.publicKey = keys.publicKey;
                    csr.setSubject([{ name: "commonName", value: "homebridge-lutron-caseta-leap" }]);
                    csr.sign(keys.privateKey);

                    pair(client, csr).then((cert) => {
                        resolve({
                            bridgeid: bridgeid,
                            ca: cert.Body.SigningResult.RootCertificate,
                            cert: cert.Body.SigningResult.Certificate,
                            key: forge.pki.privateKeyToPem(keys.privateKey),
                        })
                    }).catch((error) => reject(error));
                }).catch((error) => reject(error));
            }).catch((error) => reject(error));
        }).catch((error) => reject(error));
    });
}

function search(config, logger, response) {
    const finder = new BridgeFinder();

    const timeout = setTimeout(() => {
        finder.destroy();

        response.send({ found: false, error: "search timeout" });
    }, 3 * 60 * 1000);

    finder.on("discovered", (results) => {
        finder.destroy();

        clearTimeout(timeout);

        const secrets = config.get("secrets") || [];
        const index = secrets.findIndex((entry) => entry.bridgeid.toUpperCase() === results.bridgeid.toUpperCase());

        if (index >= 0) {
            connect(results.bridgeid, results.ipAddr, secrets[index]);
        } else {
            logger.info(`bridge "${results.bridgeid}" found at ${results.ipAddr}`);

            associate(results.bridgeid, results.ipAddr).then((bridge) => {
                secrets.push(bridge);

                logger.info(`bridge "${results.bridgeid}" paired`);
                config.set("secrets", secrets);
                response.send({ success: true });

                resolve();
            }).catch((error) => {
                logger.error(error);

                response.send({ success: false, error: error.message });
            });
        }
    });

    finder.on("failed", () => {
        finder.destroy();

        clearTimeout(timeout);

        response.send({ success: false, error: "error in bridge" });
    });

    finder.beginSearching();
}

module.exports = (logger, config, api) => {
    api.registerRoute("search", (_request, response) => search(config, logger, response));
};
