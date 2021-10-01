const jwt = require("jsonwebtoken")
const userModel = require("../model/schema")

const isAuthenticate = async (req, res, next) => {
    try {
        let token = req.cookies.jwToken;

        const verifyToken = await jwt.verify(token, process.env.SECRET_KEY)
        if (verifyToken) {
            const rootUser = await userModel.findOne({ id: verifyToken._id, "tokens.token": token })
            req.token = token
            req.rootUser = rootUser
            req.userId = rootUser._id
            next()
        }
        else {
            res.status(404).send("invalid token rootUser")

        }
    } catch (error) {
        res.status(404).send("invalid token")
    }
}


module.exports = isAuthenticate