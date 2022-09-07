const express = require('express');
const app = express();
const cors = require("cors")
const path = require('path');
const fetch = require('node-fetch')

app.use(express.json());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const port = 3008;

var Iyzipay = require('iyzipay');
const { resolve } = require('path');
const { rejects } = require('assert');

var iyzipay = new Iyzipay({
    apiKey: 'sandbox-YRwKlL0HkpRi9zqQbAdoiCp8rgxzUsU3',
    secretKey: 'sandbox-frqtNgiAOIIzR8Y7hmcpDK2FAUaozgBj',
    uri: 'https://sandbox-api.iyzipay.com'
});

var str = ""
var Token
var AddressId
var CardLastFourDigits
var PaymentID


app.post("/buy", async (req, res) => {
    const { token, addressId, cardHolderName, cardNumber, cvv, month, year, threeds } = req.body;

    CardLastFourDigits = cardNumber.slice(-4)
    Token = token
    AddressId = addressId

    const data = {
        token: token,
        addressId: addressId
    }

    const addressResponse = await fetch("http://127.0.0.1:3002/getUserAddressById", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
    const addressData = await addressResponse.json();

    const cartResponse = await fetch("http://127.0.0.1:3002/getCartInfo", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
    const cartData = await cartResponse.json();


    const userResponse = await fetch("http://127.0.0.1:3002/getUserInfo", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
    const userData = await userResponse.json();

    var countryphoneNumber = '+90' + addressData.address.PhoneNumber

    var basket = []
    for (var i = 0; i < cartData.cartInfo.Items.length; i++) {
        basket[i] = {
            id: cartData.cartInfo.Items[i].Id,
            name: cartData.cartInfo.Items[i].Title,
            category1: 'DUMMY CATEGORY',
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: cartData.cartInfo.Items[i].TotalPrice
        }
    }

    const paymentBody = {
        token: token,
        buyerID: userData.userInfo.Id,
        addressID: addressId,
        totalPrice: cartData.cartInfo.TotalCartPrice 
    }
    const paymentResponse = await fetch("http://127.0.0.1:3002/createPayment", {
        method: 'POST',
        body: JSON.stringify(paymentBody),
        headers: { "Content-Type": "application/json" }
    })
    const paymentData = await paymentResponse.json();
    PaymentID = paymentData.paymentID

    const basePrice = parseFloat(cartData.cartInfo.TotalCartPrice)
    const iyzicoShare = 1.01
    const iyzicoFee = 0.2
    if (threeds === true) {
        var request = {
            conversationId: paymentData.paymentID,
            price: cartData.cartInfo.TotalCartPrice,
            paidPrice: cartData.cartInfo.TotalCartPrice,
            currency: Iyzipay.CURRENCY.TRY,
            installment: '1',
            basketId: cartData.cartInfo.Id,
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: 'http://localhost:3001/payment-callback', //EDIT THIS
            paymentCard: {
                cardHolderName: cardHolderName,
                cardNumber: cardNumber,
                expireMonth: month,
                expireYear: year,
                cvc: cvv,
                registerCard: '0'
            },
            buyer: {
                id: userData.userInfo.Id,
                name: userData.userInfo.Name,
                surname: userData.userInfo.Surname,
                gsmNumber: countryphoneNumber,
                email: userData.userInfo.Email,
                identityNumber: '74300864791', //DUMMY ID NUM
                registrationAddress: addressData.address.DetailedAddress,
                ip: '85.34.78.112', //DUMMY IP
                city: addressData.address.Province,
                country: 'Turkey',
            },
            shippingAddress: {
                contactName: addressData.address.Name + " " + addressData.address.Surname,
                city: addressData.address.Province,
                country: 'Turkey',
                address: addressData.address.DetailedAddress,
            },
            billingAddress: {
                contactName: addressData.address.Name + " " + addressData.address.Surname,
                city: addressData.address.Province,
                country: 'Turkey',
                address: addressData.address.DetailedAddress,
            },
            basketItems: basket
        };

        try {
            iyzipay.threedsInitialize.create(request, async function (err, result) {
                console.log(err, result);
                if (result.status === "success") {
                    var b64string = result.threeDSHtmlContent;
                    var buf = Buffer.from(b64string, 'base64');
                    str = buf.toString('utf-8');

                    const body = {
                        content: str
                    }
                    const threedsContent = await fetch("http://127.0.0.1:3001/purchase/3ds", {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: { "Content-Type": "application/json" }
                    })
                    const threedsContentResp = await threedsContent.json();

                    res.json({ html: str })

                } else {
                    res.json({ message: result.errorMessage })
                }
            });
        } catch (error) {
            console.log(error)
        }
    } else {
        console.log("wOut3DS")
        // console.log(name, surname, email, phoneNumber, cardHolderName, cardNumber, cvv, month, year, threeds)

        var request = {
            conversationId: paymentData.paymentID,
            price: cartData.cartInfo.TotalCartPrice,
            paidPrice: cartData.cartInfo.TotalCartPrice,
            currency: Iyzipay.CURRENCY.TRY,
            installment: '1',
            basketId: cartData.cartInfo.Id,
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            paymentCard: {
                cardHolderName: cardHolderName,
                cardNumber: cardNumber,
                expireMonth: month,
                expireYear: year,
                cvc: cvv,
                registerCard: '0'
            },
            buyer: {
                id: userData.userInfo.Id,
                name: userData.userInfo.Name,
                surname: userData.userInfo.Surname,
                gsmNumber: countryphoneNumber,
                email: userData.userInfo.Email,
                identityNumber: '74300864791', //DUMMY ID NUM
                registrationAddress: addressData.address.DetailedAddress,
                ip: '85.34.78.112', //DUMMY IP
                city: addressData.address.Province,
                country: 'Turkey',
            },
            shippingAddress: {
                contactName: addressData.address.Name + " " + addressData.address.Surname,
                city: addressData.address.Province,
                country: 'Turkey',
                address: addressData.address.DetailedAddress,
            },
            billingAddress: {
                contactName: addressData.address.Name + " " + addressData.address.Surname,
                city: addressData.address.Province,
                country: 'Turkey',
                address: addressData.address.DetailedAddress,
            },
            basketItems: basket
        };

        try {
            iyzipay.payment.create(request, async function (err, result) {
                console.log(err, result);
                if (result.status === "success") {
                    res.json({ message: "Payment Success" })

                    const orderBody = {
                        token: Token,
                        addressID: AddressId,
                        cardLastFourDigits: CardLastFourDigits
                    }
                    await fetch("http://127.0.0.1:3009/createOrder", {
                        method: 'POST',
                        body: JSON.stringify(orderBody),
                        headers: { "Content-Type": "application/json" }
                    })

                    const updatePayment = {
                        token: Token,
                        paymentID: PaymentID,
                        status: "success"
                    }
                    await fetch("http://127.0.0.1:3002/updatePaymentStatus", {
                        method: 'POST',
                        body: JSON.stringify(updatePayment),
                        headers: { "Content-Type": "application/json" }
                    })

                } else {
                    const updatePayment = {
                        token: Token,
                        paymentID: PaymentID,
                        status: "success"
                    }
                    await fetch("http://127.0.0.1:3002/updatePaymentStatus", {
                        method: 'POST',
                        body: JSON.stringify(updatePayment),
                        headers: { "Content-Type": "application/json" }
                    })

                    res.json({ message: result.errorMessage })
                }
            });
        } catch (error) {
            console.log(error)
        }
    }


})

app.post("/makeThreeDsPayment", async (req, res) => {
    console.log(req.body)
    if (req.body.status === "success") {
        iyzipay.threedsPayment.create({
            // conversationId: '123456789',
            // locale: Iyzipay.LOCALE.TR,
            paymentId: req.body.paymentId,
            conversationData: req.body.conversationData
        }, async function (err, result) {
            console.log(err, result);
            if (result.status === "success") {
                str = ''
                res.json({ "message": "success" })

                const body = {
                    content: str
                }
                
                    const orderBody = {
                        token: Token,
                        addressID: AddressId,
                        cardLastFourDigits: CardLastFourDigits
                    }
                    await fetch("http://127.0.0.1:3009/createOrder", {
                        method: 'POST',
                        body: JSON.stringify(orderBody),
                        headers: { "Content-Type": "application/json" }
                    })

                    const updatePayment = {
                        token: Token,
                        paymentID: PaymentID,
                        status: "success"
                    }
                    await fetch("http://127.0.0.1:3002/updatePaymentStatus", {
                        method: 'POST',
                        body: JSON.stringify(updatePayment),
                        headers: { "Content-Type": "application/json" }
                    })

            } else {
                str = ''

                const updatePayment = {
                    token: Token,
                    paymentID: PaymentID,
                    status: "fail"
                }
                await fetch("http://127.0.0.1:3002/updatePaymentStatus", {
                    method: 'POST',
                    body: JSON.stringify(updatePayment),
                    headers: { "Content-Type": "application/json" }
                })

                res.json({ "message": "fail" })

            }
        });
    } else {
        console.log(req.errorMessage)
        
        const updatePayment = {
            token: Token,
            paymentID: PaymentID,
            status: "fail"
        }
        await fetch("http://127.0.0.1:3002/updatePaymentStatus", {
            method: 'POST',
            body: JSON.stringify(updatePayment),
            headers: { "Content-Type": "application/json" }
        })

        str = ''
        res.json({ "message": "fail" })
    }
})

app.post("/binReq", async (req, res) => {
    const { cardNumber } = req.body
    const firstSixStr = String(cardNumber).slice(0, 6);
    const firstSixNum = Number(firstSixStr);

    iyzipay.binNumber.retrieve({
        // locale: Iyzipay.LOCALE.TR,
        // conversationId: '123456789',
        binNumber: firstSixNum
    }, function (err, result) {
        console.log("binRetreive")
        console.log(err, result);
    });

    iyzipay.installmentInfo.retrieve({
        // locale: Iyzipay.LOCALE.TR,
        // conversationId: '123456789',
        binNumber: firstSixNum,
        price: '100'
    }, function (err, result) {
        console.log("installmentInfo")
        console.log(err, result);
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});