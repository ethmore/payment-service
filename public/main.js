const form = document.getElementById("form");
form.addEventListener("submit", submitFunc);

function submitFunc(e) {
    e.preventDefault();
    const name = document.getElementById("name");
    const surname = document.getElementById("surname");
    const email = document.getElementById("email");
    const phoneNumber = document.getElementById("phoneNumber");
    const cardHolderName = document.getElementById("cardHolderName");
    const cardNumber = document.getElementById("cardNumber");
    const cvv = document.getElementById("cvv");
    const month = document.getElementById("month");
    const year = document.getElementById("year");
    const threeds = document.getElementById("threeds");

    const data = {
        name: name.value,
        surname: surname.value,
        email: email.value,
        phoneNumber: phoneNumber.value,
        cardHolderName: cardHolderName.value,
        cardNumber: cardNumber.value,
        cvv: cvv.value,
        month: month.value,
        year: year.value,
        threeds: threeds.checked,
    }

    if (threeds.checked === true) {
        fetch("/buy", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        }).then(response => response.json())
            .then(data => {
                if (data.message === "Odeme Basarili") {
                    document.getElementById("info").innerText = data.message
                    name.value = null
                    surname.value = null
                    email.value = null
                    phoneNumber.value = null
                    cardHolderName.value = null
                    cardNumber.value = null
                    cvv.value = null
                    month.value = null
                    year.value = null
                    threeds.checked = null
                    window.location.href = "http://localhost:3003/3ds";

                } else {
                    document.getElementById("info").innerText = data.message
                    window.location.href = "http://localhost:3003/3ds";
                }
            })
            .catch((err) => ("Error occured", err));
    } else {
        fetch("/buy", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        }).then(response => response.json())
            .then(data => {
                if (data.message === "Odeme Basarili") {
                    document.getElementById("info").innerText = data.message
                    name.value = null
                    surname.value = null
                    email.value = null
                    phoneNumber.value = null
                    cardHolderName.value = null
                    cardNumber.value = null
                    cvv.value = null
                    month.value = null
                    year.value = null
                    threeds.checked = null
                    window.location.href = "http://localhost:3003/success";

                } else {
                    document.getElementById("info").innerText = data.message
                }
            })
            .catch((err) => ("Error occured", err));
    }


}

const cardNum = document.getElementById("cardNumber");
form.addEventListener('blur', binReq);

function binReq(e) {
    e.preventDefault();

    const cardNumber = document.getElementById("cardNumber");

    const data = {
        cardNumber: cardNumber.value,
    }

    fetch("/binReq", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    }).then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                // alert(data.message)
                document.getElementById("info2").innerText = data.message
                cardNumber.value = null


            } else {
                document.getElementById("info").innerText = data.message
            }
        })
        .catch((err) => ("Error occured", err));
}



