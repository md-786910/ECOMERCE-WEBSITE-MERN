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
    orders: [

        {
            order: {
                type: Number
            }
        }
    ]
    ,

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

        console.log(name, email, message)


        this.messages = this.messages.concat({ message: message, name: name, email: email })

        await this.save()
        return this.messages

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

const userModel = new mongoose.model("userModel", userSchema)

module.exports = userModel