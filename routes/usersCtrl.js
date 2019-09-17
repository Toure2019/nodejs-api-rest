// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

// Routes
module.exports = {
    register: function(req, res) {
        // PARAMS
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var bio = req.body.bio;

        if (email == null || username == null || password == null) {
            res.status(400).json({ 'error': 'Missing parametters' });
        }

        // TODO: verify pseudo length, mail regex, password etc.
        if (username.length >= 13 || username.length <= 4) {
            return res.status(400).json({ 'error': 'Wrong username (must length 5-12)' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'Email is not valid' });
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'password invalid (must be lengtg 4-8 and include 1 number at'})
        }

        // La fonction ".waterfall" permet d'exécuter des fonctions en cascade
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['email'],
                    where: {email: email}
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'erreur': 'Unable to verify user' });
                })
            },
            function(userFound, done) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                        done(null, userFound, bcryptedPassword);
                    });
                } else {
                    return res.status(409).json({ 'error': 'User already exist !' });
                }
            },
            function(userFound, bcryptedPassword, done) {
                var newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    bio: bio,
                    isAdmin: 0
                })
                .then(function(newUser) {
                    done(newUser);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'Cannot add user !' });
                })
            }

        ], function(newUser) {
            if (newUser) {
                return res.status(201).json({
                    'userId': newUser.id
                });
            } else {
                return res.status(500).json({ 'error': 'Cannot add user !!' });
            }
        });
    },

    login: function(req, res) {
        // PARAMS
        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({ 'error': 'Missing parameters' });
        }

        // TODO: Verify email regex & password length
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    where: {email: email}
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
            }, function(userFound, done) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function(errBcrypt, resBcrypt) {
                        done(null, userFound, resBcrypt);
                    })
                } else {
                    res.status(404).json({ 'error': 'user not exists in DB :)' });
                }
            }, function(userFound, resBcrypt, done) {
                if (resBcrypt) {
                    done(userFound);
                } else {
                    res.status(403).json({ 'error': 'invalid password ?' });
                }
            }
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json({
                    'userId': userFound.id,
                    'token': jwtUtils.generateTokenForUser(userFound)
                });
            } else {
                return res.status(500).json({ 'error': 'Cannont log on user' });
            }
        });
    },

    getUserProfile: function(req, res) {
        // Get auth hearder
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) 
            return res.status(400).json({ 'error': 'Wrong token' });

        models.User.findOne({
            attributes: ['id', 'email', 'username', 'bio'],
            where: {id: userId}
        })
        .then(function(user) {
            if (user) {
                res.status(201).json(user);
            } else {
                res.status(404).json({ 'error': 'User not found' }); 
            }
        })
        .catch(function(err) {
            res.status(500).json({ 'error': 'Cannot fetch user' });
        });
    },

    updateUserProfile: function(req, res) {
        // Getting auth header
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
    
        // Params
        var bio = req.body.bio;
    
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['id', 'bio'],
                    where: { id: userId }
                })
                .then(function (userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
            },
            function(userFound, done) {
                if(userFound) {
                    userFound.update({
                        bio: (bio ? bio : userFound.bio)
                    }).then(function() {
                        done(userFound);
                    }).catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update user' });
                    });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
        ],  
        function(userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update user profile' });
            }
        });
    }
}