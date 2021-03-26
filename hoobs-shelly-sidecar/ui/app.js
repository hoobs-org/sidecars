let interval, dialog;

$hoobs.config.setup();

(async () => {
    const config = await $hoobs.config.get();
    const domain = $hoobs.config.host.domain();
    const port = (config.admin || {}).port || 8181;

    window.location.href = `http://${domain}:${port}`;
})();
