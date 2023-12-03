$hoobs.config.setup();

const spinner = document.querySelector(".spinner");
const errormessage = document.querySelector(".error-message");

const fields = {
    login: document.querySelectorAll(".login"),
    validate: document.querySelectorAll(".validate"),
    email: document.querySelector("#email"),
    password: document.querySelector("#password"),
    token: document.querySelector("#token"),
    code: document.querySelector("#code")
};

spinner.style.display = "none";
errormessage.style.display = "none";

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

    for (let i = 0; i < fields.login.length; i += 1) {
        fields.login[i].style.display = "none";
    }

    spinner.style.display = "flex";
    errormessage.style.display = "none";

    const response = await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "login", { email, password });

    if (response.status === 401) {
        fields.token.value = response.token;

        spinner.style.display = "none";
        errormessage.style.display = "none";

        for (let i = 0; i < fields.login.length; i += 1) {
            fields.login[i].style.display = "none";
        }

        for (let i = 0; i < fields.validate.length; i += 1) {
            fields.validate[i].style.display = "flex";
        }

        fields.code.focus();
    } else if (response.status === 200) {
        await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "save", { token: response.token });

        $close(true);
    } else {
        spinner.style.display = "none";
        errormessage.textContent = "Invalid email or password";
        errormessage.style.display = "flex";

        for (let i = 0; i < fields.login.length; i += 1) {
            fields.login[i].style.display = "flex";
        }
    }
}

async function validate() {
    const code = fields.code.value;
    const token = fields.token.value;

    for (let i = 0; i < fields.validate.length; i += 1) {
        fields.validate[i].style.display = "none";
    }

    spinner.style.display = "flex";
    errormessage.style.display = "none";

    const response = await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "validate", { token, code });

    if (response.status === 200) {
        await $hoobs.plugin($bridge, "@balansse/homebridge-vivint", "save", { token: response.token });

        $close(true);
    } else {
        spinner.style.display = "none";
        errormessage.textContent = "Invalid code entered";
        errormessage.style.display = "flex";

        for (let i = 0; i < fields.validate.length; i += 1) {
            fields.validate[i].style.display = "flex";
        }
    }
}
