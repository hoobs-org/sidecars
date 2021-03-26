let interval, dialog;

$hoobs.config.setup();

async function update(token) {
    const config = await $hoobs.config.get();

    config.token = token;

    await $hoobs.config.update(config);

    if (interval) clearInterval(interval);
    if (dialog) dialog.close();

    window.removeEventListener("message", message);

    interval = null;
    dialog = null;

    if (typeof $close !== "undefined") {
        $close();
    } else {
        document.getElementById("account-linked").style.display = "flex";
    }
}

function message(event) {
    if (event.origin === "https://homebridge-gsh.iot.oz.nu") {
        try {
            const data = JSON.parse(event.data);

            if (data.token) update(data.token);
        } catch (_error) { /* NULL */ }
    }
}

window.addEventListener("message", message, false);

const horz = (window.screen.width / 2) - (760 / 2);
const vert = ((window.screen.height / 2) - (760 / 2)) / 2;

dialog = window.open(
    "https://homebridge-gsh.iot.oz.nu/link-account",
    "google-home",
    `toolbar=no,status=no,menubar=no,resizable=yes,width=760,height=760,top=${vert},left=${horz}`,
);

interval = setInterval(() => {
    dialog.postMessage("origin-check", "https://homebridge-gsh.iot.oz.nu");
}, 2000);
