let interval, dialog;

function search() {
    const query = (window.location.search || "").split("&").map((entry) => {
        const pairs = entry.split("=");

        return {
            key: pairs.shift(),
            value: pairs.shift(),
        }
    });

    const results = {};

    for (let i = 0; i < query.length; i += 1) {
        results[query[i].key] = query[i].value;
    }

    return results;
}

function update(token) {
    if (interval) clearInterval(interval);
    if (dialog) dialog.close();

    window.removeEventListener("message", message);

    interval = null;
    dialog = null;

    $value = token;

    $close();
}

function message(event) {
    if (event.origin === "https://homebridge-honeywell.iot.oz.nu") {
        try {
            const data = JSON.parse(event.data);

            if (data.token) update(data.token);
        } catch (_error) { /* NULL */ }
    }
}

const query = search();

$hoobs.config.setup(query.token)

window.addEventListener("message", message, false);

const horz = (window.screen.width / 2) - (760 / 2);
const vert = ((window.screen.height / 2) - (760 / 2)) / 2;
const key = window.$config ? encodeURIComponent(window.$config.consumerKey) : "";
const secret = window.$config ? encodeURIComponent(window.$config.consumerSecret) : "";

dialog = window.open(
    `https://homebridge-honeywell.iot.oz.nu?consumerKey=${key}&consumerSecret=${secret}`,
    "honeywell",
    `toolbar=no,status=no,menubar=no,resizable=yes,width=760,height=760,top=${vert},left=${horz}`,
);

interval = setInterval(() => {
    dialog.postMessage("origin-check", "https://homebridge-honeywell.iot.oz.nu");
}, 2000);
