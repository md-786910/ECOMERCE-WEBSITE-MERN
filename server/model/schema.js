const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    pass: String,
    conpass: String,

    messages: [
        {
            name: {
                type: String,
            },
            email: {
                type: String,
            },
            message: {
                type: String,
            }
        }
    ],
    carts: [
        {
            name: {
                type: String,
            },
            price: {
                type: Number,
            },

            color: {
                type: String,
            },
            size: {
                type: String,
            },
            image: {
                type: String,
            }
        }
    ],

    cartsOrder: [
        {
            name: {
                type: String,
            },
            price: {
                type: Number,
            },

            color: {
                type: String,
            },
            size: {
                type: String,
            },
            image: {
                type: String,
            }
        }
    ],
    orders: [

        {
            price: {
                type: Number,
                required: true,
            },
            email: {
                type: String,
            },
            firstName: {
                type: String,
            },

            lastName: {
                type: String,
            },
            phone: {
                type: String,
            },
            country: {
                type: String,
            },
            address: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            postalCode: {
                type: Number
            },


        }
    ]
    ,
    information: [
        {
            firstName: {
                type: String,
            },
            email: {
                type: String,
            },
            lastName: {
                type: String,
            },
            phone: {
                type: String,
            },
            country: {
                type: String,
            },
            address: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            postalCode: {
                type: Number
            }

        }
    ],

    tokens: [
        {
            token: {
                type: Array,

            }
        }

    ]
})



// middle ware
userSchema.pre("save", async function (next) {

    if (this.isModified('pass')) {
        this.pass = await bcrypt.hash(this.pass, 12)
        this.conpass = await bcrypt.hash(this.conpass, 12)
    }
    next()
})


// generate token
userSchema.methods.generateToken = async function () {
    try {

        let token = await jwt.sign({ id: this._id }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token })
        await this.save()
        return token

    } catch (error) {
        console.log(error);
    }
}

// message send
userSchema.methods.messageSend = async function (name, email, message) {
    try {
        this.messages = this.messages.concat({ message: message, name: name, email: email })
        await this.save()
        return this.messages

    } catch (error) {
        console.log(error);
    }
}

// send setUserInfo information
userSchema.methods.setUserInfo = async function (firstName, lastName, email, phone, country, postalCode, city, state, address) {
    try {

        this.information = this.information.concat({ firstName: firstName, lastName: lastName, email: email, phone: phone, country: country, postalCode: postalCode, city: city, state: state, address: address })

        await this.save()

        return this.information

    } catch (error) {
        console.log(error);
    }
}

// send orders information
userSchema.methods.setOrders = async function (firstName, lastName, phone, country, postalCode, city, state, address, price, email) {
    try {
        console.log(firstName, lastName, phone, country, postalCode, city, state, address, price, email)

        this.orders = this.orders.concat({ firstName: firstName, lastName: lastName, phone: phone, country: country, price: price, postalCode: postalCode, city: city, state: state, address: address, email: email })

        await this.save()

        return this.orders

    } catch (error) {
        console.log(error);
    }
}



//product cart add
userSchema.methods.setProduct = async function (name, price, size, image, color, starting_price) {
    try {

        this.carts = this.carts.concat({ name: name, price: price, color: color, size: size, image: image, starting_price: starting_price })

        await this.save()

        return this.carts

    } catch (error) {
        console.log(error);
    }
}

// //product cart orders add
userSchema.methods.setFinallyOrders = async function (props) {
    try {
        // console.log(name, price, color, image, size)
        console.log(props)
        console.log("this is run")
        props.userOrdersDetails.map(async (elem) => {
            this.cartsOrder = this.cartsOrder.concat({
                name: elem.name, price: elem.price, color: elem.color, image: elem.image, size: elem.size
            })
            await this.save()
            return this.carts
        })



    } catch (error) {
        console.log(error);
    }
}


// remove cart items
userSchema.methods.sendIdToRemovItem = async function (id) {

    try {
        // console.log(this.carts.find({ _id: id }))

        this.carts = this.carts.filter((elem, index) => index != id)
        await this.save()
        // return this.carts
    } catch (error) {
        console.log("error ins schema side");
    }

}

const userModel = new mongoose.model("userModel", userSchema)

module.exports = userModel