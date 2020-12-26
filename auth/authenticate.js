const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { reset } = require('nodemon');

const login = async(admin, pass, callback)=>{
    if(!admin){
        return callback({
            id: 'name',
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
            id: 'pass',
            title: 'Pogrešna lozinka!'
        });
    }
}
const twoStepLogin = async(admin, callback)=>{
    if(!admin) return callback(false);

    else return callback(null, {
            cookie: process.env.ADMIN_COOKIE_NAME,
            token: jwt.sign({id: admin.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'}),
            path: '/'
    });
}
const twoStep = async(admin, expires, callback)=>{
    if(!admin){
        return callback({
            id: 'name',
            title: 'Nepostojaće ime!'
        });
    }else{
        id = admin.id;
        return callback(null, {
            cookie: process.env.ADMIN_COOKIE_NAME,
            token: `${jwt.sign({id: admin.id}, process.env.TMP_TOKEN_SECRET, {expiresIn: expires})}${process.env.TMP_TOKEN_SECRET}${admin.name}`,
            path: '/admin/dva-koraka'
        });
    }
}
const changePass = async(admin, oldPass, newPass, callback)=>{
    if(!admin){
        return callback({
            id: 'name',
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
            id: 'oldpass',
            title: 'Pogrešna stara lozinka!'
        });
    }    
}
const resetPass = async(admin, newPass, callback)=>{
    if(!admin) return callback(false);

    else return callback(null, {
        cookie: process.env.ADMIN_COOKIE_NAME,
        hash: await bcrypt.hash(newPass, 10),
        path: '/22072019'
    })
}

module.exports = {
    login: login,
    twoStepLogin: twoStepLogin,
    changePass: changePass,    
    twoStep: twoStep,
    resetPass: resetPass
}