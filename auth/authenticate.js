const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async(admin, pass, callback)=>{
    if(!admin){
        return callback({
            path: 'admin/auth/login',
            title: 'Nepostojaće ime!'
        });
    }
    if(await bcrypt.compare(pass, admin.pass)){
        return callback(null, {
            cookie: process.env.ADMIN_COOKIE_NAME,
            token: jwt.sign({id: admin.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'}),
            path: '/'
        });
    }else{
        return callback({
            path: 'admin/auth/login',
            title: 'Pogrešna lozinka!'
        });
    }
}
const changePass = async(admin, oldPass, newPass, callback)=>{
    if(!admin){
        return callback({
            path: 'admin/auth/password',
            title: 'Nepostojaće ime!'
        });
    }
    if(await bcrypt.compare(oldPass, admin.pass)){
        return callback(null, {
            cookie: process.env.ADMIN_COOKIE_NAME,
            hash: await bcrypt.hash(newPass, 10),
            path: '/22072019'
        });
	}else{
        return callback({
            path: 'admin/auth/password',
            title: 'Pogrešna stara lozinka!'
        });
    }    
}

module.exports = {
    login: login,
    changePass: changePass
}