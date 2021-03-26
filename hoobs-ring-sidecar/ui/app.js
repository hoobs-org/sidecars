const fields = {
    login: document.querySelectorAll(".login"),
    validate: document.querySelectorAll(".validate"),
    username: document.querySelector("#email"),
    password: document.querySelector("#password"),
    verification: document.querySelector("#code")
};

for (let i = 0; i < fields.login.length; i += 1) {
    fields.login[i].style.display = "flex";
}

for (let i = 0; i < fields.validate.length; i += 1) {
    fields.validate[i].style.display = "none";
}

fields.username.focus();

async function login() {
    const username = fields.username.value;
    const password = fields.password.value;
    const verification = fields.verification.value;

    const response = await $hoobs.plugin($bridge, "homebridge-ring", "login", { username, password, verification});

    if (response.error) alert("Invalid Username or Password");

    if (response.status === 412) {
        for (let i = 0; i < fields.login.length; i += 1) {
            fields.login[i].style.display = "none";
        }

        for (let i = 0; i < fields.validate.length; i += 1) {
            fields.validate[i].style.display = "flex";
        }

        fields.verification.focus();
    }

    if (response.refresh_token) {
        await $hoobs.plugin($bridge, "homebridge-ring", "save", { token: response.refresh_token });

        $close(true);
    }
}
