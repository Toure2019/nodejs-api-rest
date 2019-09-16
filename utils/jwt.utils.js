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
    },
    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUserId: function(authorization) {
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if (jwtToken != null) 
                    userId = jwtToken.userId
            } catch (error) { }
        }
        return userId;
    }
}