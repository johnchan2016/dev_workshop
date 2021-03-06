var jwt = require('jsonwebtoken');

module.exports = function(req,res,next) {
  var token = req.body.token || req.headers['x-access-token'] || req.cookies.token || req.session.token;
    if (token) {
    // verifies secret and checks exp
/*        jwt.verify(token, global.configs.jwtSecret, function(err, decoded) {
            if (err) { //failed verification.
                return res.json({"error": true});
            }
            req.decoded = decoded;
            next(); //no error, proceed
        });*/
        jwt.verify(token, req.session.secret, function(err, decoded) {
            if (err) { //failed verification.
                return res.json({"error": true});
            }
            req.decoded = decoded;
            next(); //no error, proceed
        });
    } else {
        // forbidden without token
        return res.status(403).send({
            "error": true
        });
    }
}


