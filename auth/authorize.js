const jwt = require('jsonwebtoken');

function parseToken(cookie){
    return cookie.includes(process.env.ADMIN_COOKIE_NAME) ? cookie.split(`${process.env.ADMIN_COOKIE_NAME}=`)[1].split(process.env.ADMIN_COOKIE_SEPARATOR)[0] : null;
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
const twoStep = (cookie, callback)=>{
    const token = cookie && cookie.split(process.env.TMP_TOKEN_SECRET)[0];
    const name = cookie && cookie.split(process.env.TMP_TOKEN_SECRET)[1];

    if(token == null) return callback(false);

    jwt.verify(token, process.env.TMP_TOKEN_SECRET, (err)=>{
        if(err) return callback(false, {name: name});

        return callback(null, {name: name})
    });
}
module.exports = {
    verifyAdmin: admin,
    verifyAdminStrict: strict,
    twoStep: twoStep
}