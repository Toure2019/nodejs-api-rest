// Imports 
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = 'YOUSSOUFtoure1986ADAMAimran2018BETENINdosso1985mr&mmeToure2017' 

// Exported functions
module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h' /* Le Token ne sera valable que pendant 1h */
        });
    }
}