let interval, dialog;

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
    if (event.origin === "https://homebridge-gsh.iot.oz.nu") {
        try {
            const data = JSON.parse(event.data);

            if (data.token) update(data.token);
        } catch (_error) { /* NULL */ }
    }
}

window.addEventListener("message", message, false);

const left = (window.screen.width / 2) - (760 / 2);
const top = ((window.screen.height / 2) - (760 / 2)) / 2;

dialog = window.open(
    "https://homebridge-gsh.iot.oz.nu/link-account",
    "google-home",
    `toolbar=no,status=no,menubar=no,resizable=yes,width=760,height=760,top=${top},left=${left}`,
);

interval = setInterval(() => { dialog.postMessage("origin-check", "https://homebridge-gsh.iot.oz.nu"); }, 2000);
