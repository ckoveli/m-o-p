const jwt = require('jsonwebtoken');

function parseToken(cookie){
    return cookie.split(`${process.env.ADMIN_COOKIE_NAME}=`)[1];
}

const admin = (cookie, callback)=>{
    const token = cookie && parseToken(cookie);

    if(token == null) return callback(false);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err)=>{
        if(err) return callback(false);

        else return callback(true);
	});
}
const strict = (cookie, callback)=>{
    const token = cookie && parseToken(cookie);

    if(token == null) return callback({
        code: '404',
        path: `errors/404`,
        token: false
    });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err)=>{
        if(err){
            return callback({
                code: '404',
                path: `errors/404`,
                token: false
            });
        }else return callback(null, {
            cookie: process.env.ADMIN_COOKIE_NAME,
            path: '/',
            token: true
        });
	});
}

module.exports = {
    verifyAdmin: admin,
    verifyAdminStrict: strict
}