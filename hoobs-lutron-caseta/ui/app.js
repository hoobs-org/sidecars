$hoobs.config.setup();

function scan() {
    document.getElementById("scanning").style.display = "block";
    document.getElementById("retry").style.display = "none";

    $hoobs.plugin(window.$bridge, "homebridge-lutron-caseta-leap", "search").then((response) => {
        if (response.success) {
            document.getElementById("scanning").style.display = "none";
            document.getElementById("retry").style.display = "none";

            $close(true);
        } else {
            document.getElementById("scanning").style.display = "none";
            document.getElementById("retry").style.display = "block";

            console.log(response);
        }
    }).catch((error) => {
        document.getElementById("scanning").style.display = "none";
        document.getElementById("retry").style.display = "block";

        console.log(error);
    });
}

scan();
