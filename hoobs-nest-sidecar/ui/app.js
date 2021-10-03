$hoobs.config.setup();

function step(section) {
    const fields = document.querySelectorAll(".item");

    for (let i = 0; i < fields.length; i += 1) {
        fields[i].style.display = "none";
    }

    if (section) {
        const current = document.querySelectorAll(`.${section}`);

        for (let i = 0; i < current.length; i += 1) {
            current[i].style.display = "flex";
        }
    }
}

async function login() {
    step();

    const response = (await $hoobs.plugin($bridge, $plugin, "redirect")) || {};
    const horz = (window.screen.width / 2) - (760 / 2);
    const vert = ((window.screen.height / 2) - (760 / 2)) / 2;

    if (response.url) {
        $open(response.url, `toolbar=no,status=no,menubar=no,resizable=yes,width=760,height=760,top=${vert},left=${horz}`);

        step("answer");
    }
}

async function answer() {
    step();

    const refresh = (await $hoobs.plugin($bridge, $plugin, "token", { code: document.querySelector("#code").value })).token;

    if (refresh) {
        await $hoobs.plugin($bridge, $plugin, "save", { field: "refreshToken", token: refresh });

        $close(true);
    } else {
        console.log(response);

        step("login");
    }
}

step("login");
