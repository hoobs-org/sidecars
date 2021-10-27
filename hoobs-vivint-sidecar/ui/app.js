$hoobs.config.setup();

const fields = {
    login: document.querySelectorAll(".login"),
    validate: document.querySelectorAll(".validate"),
    email: document.querySelector("#email"),
    password: document.querySelector("#password"),
    token: document.querySelector("#token"),
    code: document.querySelector("#code")
};

for (let i = 0; i < fields.login.length; i += 1) {
    fields.login[i].style.display = "flex";
}

for (let i = 0; i < fields.validate.length; i += 1) {
    fields.validate[i].style.display = "none";
}

fields.email.focus();

async function login() {
    const email = fields.email.value;
    const password = fields.password.value;

    const response = await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "login", { email, password, verification });

    if (response.error) {
        alert("Invalid Username or Password");
    } else if (response.status === 401) {
        fields.token.value = response.token;

        for (let i = 0; i < fields.login.length; i += 1) {
            fields.login[i].style.display = "none";
        }

        for (let i = 0; i < fields.validate.length; i += 1) {
            fields.validate[i].style.display = "flex";
        }

        fields.verification.focus();
    } else if (response.status === 200) {
        await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "save", { token: response.token });

        $close(true);
    }
}

async function validate() {
    const code = fields.verification.value;
    const token = fields.token.value;

    const response = await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "validate", { token, code });

    if (response.error) {
        alert("Invalid Verification Code");
    } else if (response.status === 200) {
        await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "save", { token: response.token });

        $close(true);
    }
}
