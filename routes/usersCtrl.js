// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');

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

        models.User.findOne({
            attributes: ['email'],
            where: { email: email }
        })
        .then(function(userFound) {
            if (!userFound) {
                bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                    var newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0
                    })
                    .then(function(newUser) {
                        return res.status(201).json({
                            'userId': newUser.id 
                        });
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'Cannot add user' });
                    });
                });
            } else {
                return res.status(409).json({ 'error': 'user already exists !' });
            }

        })
        .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
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

        models.User.findOne({
            // attributes: ['email'], /* On Supprime cette ligne car on veut sélectionner tous les attributs */
            where: {email: email}
        })
        .then(function(userFound) {
            if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBcrypt, resBcrypt) {
                    if (resBcrypt) {
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });
                    } else {
                        return res.status(403).json({ 'error': 'invalid password' });
                    }
                })
            } else {
                return res.status(404).json({ 'error': 'User not exists in DB !' });
            }
        })
        .catch(function(err) {
            return res.status(500).json({ 'error': 'Unable to verify user' });
        });
    }
}