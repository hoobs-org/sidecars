const frame = document.getElementById("auth");

frame.addEventListener("load", () => {
    if (frame.contentWindow && frame.contentWindow.location && frame.contentWindow.location.protocol.startsWith("login.callback.url")) {
        const query = frame.contentWindow.location.search.replace("?", "").split("&");
        const parameters = {};

        for (let i = 0; i < query.length; i += 1) {
            parameters[query[i].split("=")[0]] = query[i].split("=")[1];
        }

        $hoobs.plugin($bridge, "homebridge-simplisafe3", "token", { code: parameters.code }).then(() => $close(true));
    }
});

$hoobs.config.setup();

$hoobs.plugin(window.$bridge, "homebridge-simplisafe3", "authenticate").then((response) => {
    if (response.success) frame.src = response.url;
});
