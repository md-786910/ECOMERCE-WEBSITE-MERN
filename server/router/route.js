const express = require('express');
const router = express.Router()
const bcrypt = require('bcryptjs')
const request = require('request-promise')
const fs = require('fs')

const Razorpay = require('razorpay')

const path = require('path')
const shortId = require('shortid')



const userModel = require('../model/schema')
const isAuthenticate = require('../authenticate/authenticate')


// make own custom api amazon product
const api_key = "1a256cf5aa35208fec860a66c187d4e9"
router.get("/amazonProduct", async (req, res) => {
    res.json("welcome to amazon scraperapi")
})
router.get("/amazonProduct/:product", async (req, res) => {
    try {
        const { product } = req.params
        console.log(product)

        const response = await request(`https://api.scraperapi.com?api_key=${api_key}&autoparse=true&url=http://www.amazon.in/s?k=${product}`)

        res.status(200).json(JSON.parse(response))


        fs.writeFileSync("product.json", response, { encoding: "utf8" });

    } catch (error) {
        res.status(404).json({ msg: "error getting product" })
    }
})


// routing 
router.get('/', (req, res) => {
    // res.send(req.cookies.jwToken)

    const data = fs.readFileSync("product.json", "utf8");

    res.json(JSON.parse(data))

    fs.writeFileSync("product1.json", JSON.parse(data), "utf8")



})

router.get('/userLogout', async (req, res) => {
    try {

        res.clearCookie("jwToken", { path: "/" })


        res.status(200).json({ msg: "user successfully logout" })

    } catch (error) {
        res.status(404).json({ msg: "something went wrong" })
    }
})


router.get('/checkAuth', isAuthenticate, async (req, res) => {

    try {
        res.send(req.rootUser)
    } catch (error) {
        res.send("error")
    }
})


router.post('/register', async (req, res) => {
    try {

        console.log(req.body)

        let { name, email, phone, pass, conpass } = req.body

        if (!name || !email || !phone || !pass || !conpass) {
            res.status(404).json({ msg: "fill all the credentials" })

        }
        else {
            // check user already registered
            let checkUserAlreadyRegistered = await userModel.findOne({ email: email })

            if (checkUserAlreadyRegistered) {
                res.status(404).json({ msg: "user already registered" })
            }

            else {
                let saveDataBeforeDatabase = new userModel({ name, pass, phone, conpass, email })
                const finallySave = await saveDataBeforeDatabase.save()

                res.status(200).json({ msg: "user registered successfully", data: finallySave })

            }
        }


    } catch (error) {
        res.status(404).json({ msg: "user not registered" })
    }
})


router.post('/login', async (req, res) => {
    try {
        // console.log(req.rootUser)
        const { email, pass } = req.body

        if (email || pass) {

            const getExistingEmail = await userModel.findOne({ email: email })

            if (getExistingEmail) {

                let hasPassword = await bcrypt.compare(pass, getExistingEmail.pass)

                if (hasPassword) {

                    const token = await getExistingEmail.generateToken()
                    res.cookie("jwToken", token, {
                        expires: new Date(Date.now() + 225892000000),
                        httpOnly: true
                    })

                    res.status(200).json({ msg: "login successfully" })
                }
                else {
                    res.status(404).json({ msg: "invalid credentials" })

                }

            }
            else {
                res.status(404).json({ msg: "please fill valid credentials" })

            }
        }
        else {
            res.status(404).json({ msg: "please fill properly" })

        }

    } catch (error) {
        res.status(404).json({ msg: "invalid credentials" })

    }
})


// send message
router.post('/message', isAuthenticate, async (req, res) => {
    try {

        let id = await req.userId;
        const { name, email, message } = (req.body)



        let alreadyUser = await userModel.findOne({ _id: id })

        let messageGet = await alreadyUser.messageSend(name, email, message);

        res.status(200).json({ msg: "message send successfully" })


    } catch (error) {
        res.status(404).json({ msg: "message cant send properly" })

    }
})


router.post('/productCart', isAuthenticate, async (req, res) => {
    try {

        let id = await req.userId;
        const { name, price, color, image, size, starting_price } = (req.body)


        let alreadyUser = await userModel.findOne({ _id: id })

        // match product in cart


        let messageGet = await alreadyUser.setProduct(name, price, color, image, size, starting_price);
        res.status(200).json({ msg: "product add to cart successfully" })


    } catch (error) {
        res.status(404).json({ msg: "product not add to  successfully" })

    }
})


// send user information
router.post("/userInfo", isAuthenticate, async (req, res) => {
    try {

        let id = await req.userId;
        const { firstName, lastName, email, phone, country, postalCode, city, state, address } = (req.body)

        let alreadyUser = await userModel.findOne({ _id: id })

        // match product in cart


        let userInfo = await alreadyUser.setUserInfo(

            firstName, lastName, email, phone, country, postalCode, city, state, address
        );


        res.status(200).json({ msg: "user info add successfully" })

    } catch (error) {
        res.status(404).json({ msg: "error user info not send" })
    }
})

// deleted item from carts
router.post("/removItem", isAuthenticate, async (req, res) => {

    try {
        const id = req.body.id
        const reqId = req.userId
        // console.log(id)
        const findCartData = await userModel.findOne({ _id: reqId })
        // const rem = (findCartData.carts).filter((elem) => {
        //     return elem.id === id
        // })
        const rem = await findCartData.sendIdToRemovItem(id)
        // console.log(rem)
        await userModel.save()
        res.status(200).json({ msg: "item deleted successfully" })

    } catch (error) {
        res.status(404).json({ msg: "error item not deleted" })

    }
})


//*************************************************** */
// make payment request

router.get("/logo", async (req, res) => {
    try {
        res.status(200).sendFile(path.join(__dirname, "../image/logo.png"))
    } catch (error) {
        res.status(404).json({ msg: "logo not send" })
    }
})

router.post("/cartsFinallyOrders", async (req, res) => {
    try {
        const data = req.body;
        const id = req.body.id;
        // console.log(data)


        let alreadyUser = await userModel.findOne({ _id: id });

        const userOrders = await alreadyUser.setFinallyOrders(

            { ...data }
        )
        // console.log(userOrders)

        res.send("yes get it")
    } catch (error) {
        res.status(404).json({ msg: "logo not send" })
    }
})


const secretKey = "2e0TiXHTcHs252qDrcXUHOaQ"
const keyId = "rzp_test_MgNn5wEsqPADa4"

var razorpay = new Razorpay({
    key_id: keyId,
    key_secret: secretKey,
});


router.post("/razorpayMoney", async (req, res) => {
    const userDetail = req.body;
    // console.log(userDetail)
    const { firstName, id, lastName, phone, country, postalCode, city, state, address, price, email
    } = (req.body)

    userModel.findOne({ _id: id }).then((alreadyUser) => {

        alreadyUser.setOrders(
            firstName, lastName, phone, country, postalCode, city, state, address, price, email
        );


        // alreadyUser.carts[""];
        // alreadyUser.carts = [];

    }).catch((err) => {
        console.log('Error coming to set the orders details' + err)
    })

    const payment_capture = 1
    const amount = userDetail.price
    const currency = "INR"

    const options = {
        amount: (amount * 100),
        currency: currency,
        receipt: shortId.generate(),
        payment_capture: payment_capture,
    };

    const response = await razorpay.orders.create(options);
    // console.log(response)

    res.status(200).json({
        id: response.id,
        amount: response.amount,
        currency: response.currency,
        receipt: response.receipt,

    })

})

module.exports = router;