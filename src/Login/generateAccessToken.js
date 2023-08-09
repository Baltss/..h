const jwt = require("jsonwebtoken")
require('dotenv').config({ path: '../.env' })

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}

module.exports = generateAccessToken
