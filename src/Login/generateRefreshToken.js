const jwt = require("jsonwebtoken")
require('dotenv').config({ path: '../.env' })

function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20m" })
}

module.exports = generateRefreshToken
