const ejs = require('ejs');
const Admin = require('../models/admin');
const Post = require('../models/post');

const loginPage = async(type, callback)=>{
    switch(type){
        case 'login':
            callback({
                html: await renderPartials('admin/auth/_login', {}),
                css: 'css/partials/admin/auth/_login.css'
            })
            break;
        case 'forgot':
            callback({
                html: await renderPartials('admin/auth/_forgot-password', {}),
                css: 'css/partials/admin/auth/_forgot-password.css'
            })
            break;
    }
}

const adminPage = async(path, req, callback)=>{
    switch(req.body.partial){
		case 'manage-posts/_publish':
			callback({
				html: await renderPartials(path+req.body.partial, {}),
				css: 'css/partials/admin/admin_page/manage-posts/_publish.css'
			})
			break;
		case 'manage-posts/_manage':            
            const posts = await Post.find().sort({createdAt: 'desc'});
            callback({
                html: await renderPartials(path+req.body.partial, {
                    data: posts,
                    postCount: posts.length	
                }),
                css: 'css/partials/admin/admin_page/manage-posts/_manage.css',
            });
			break;
		case 'manage-posts/edit/_edit':
            await Post.findById(req.body.id, async(err, post)=>{
                if(err) throw err;

                else callback({
                    html: await renderPartials(path+req.body.partial, {
                        data: post,
                        commentCount: post.comments.length,
                        repliesCount: ()=>{
                            let cnt = 0;
                
                            for(let i=0; i<post.comments.length; i++){
                                cnt += post.comments[i].replies !== undefined ? post.comments[i].replies.length>0 ? post.comments[i].replies.length : 0 : 0;
                            } 
                            return cnt;
                        }
                    }),
                    css: 'css/partials/admin/admin_page/manage-posts/edit/_edit.css'
                })
            });
            break;
        case 'manage-posts/edit/_about':
            let admin = await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]})
            callback({
                html: await renderPartials(path+req.body.partial, {
                    data: admin.about
                }),
                css: 'css/partials/admin/admin_page/manage-posts/edit/_about.css'
            })
            break;
        case 'settings/profile/_profile':
            await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]}, async(err, admin)=>{
                if(err) throw err;

                else callback({
                    html: await renderPartials(path+req.body.partial, {}),
                    css: 'css/partials/admin/admin_page/settings/profile/_profile.css'
                });
            });
            break;
		case 'settings/notifications/_notifications':
            await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]}, async(err, admin)=>{
                if(err) throw err;

                else callback({
                    html: await renderPartials(path+req.body.partial, {
                        receiveNotifications: admin.notifications.receiveNotifications,
                        comments: admin.notifications.comments,
                        myReplies: admin.notifications.myReplies,
                        otherReplies: admin.notifications.otherReplies,
                        registeredUsers: admin.notifications.registeredUsers,
                        usersReceiveNotifications: admin.notifications.usersReceiveNotifications,
                        mail: admin.mail
                    }),
                    css: 'css/partials/admin/admin_page/settings/notifications/_notifications.css'
                });
            });
			break;
		case 'settings/security/_security':
            await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]}, async(err, admin)=>{
                if(err) throw err;

                else callback({
                    html: await renderPartials(path+req.body.partial, {
                        twoStepVerification: admin.security.twoStepVerification,
                        securityCode: admin.security.securityCode,
                        securityQuestion: admin.security.securityQuestion,
                        securityQuestionQuestion: admin.security.securityQuestionQuestion,
                        securityQuestionAnswer: admin.security.securityQuestionAnswer
                    }),
                    css: 'css/partials/admin/admin_page/settings/security/_security.css'
                });
            });
			break;
		case 'settings/security/_change-pass':
            callback({
                html: await renderPartials(path+req.body.partial, {}),
				css: 'css/partials/admin/admin_page/settings/security/_change-pass.css'
            });
			break;
		default:
            callback({
                html: await renderPartials(path+req.body.partial, {})
            });
	}
}

const twoStep = async(type, file, options)=>{
    switch(type){
        case 'question':
            if(file == '_title'){
                return await renderPartials(`admin/auth/two-step/${type}/${file}`, options);
            }
            if(file == '_form'){
                return await renderPartials(`admin/auth/two-step/${type}/${file}`, options);
            }
            break;
        case 'code':
            if(file == '_title'){
                return await renderPartials(`admin/auth/two-step/${type}/${file}`, options);
            }
            if(file == '_form'){
                return await renderPartials(`admin/auth/two-step/${type}/${file}`, options);
            }
            break;
    }
}

const contentUpdater = async(type, file, options)=>{
    switch(type){
        case 'admin_page':
            return await renderPartials(`update-content/admin/${type}/${file}`, options);
            break;
        case 'show':
            return await renderPartials(`update-content/${type}/${file}`, options);
            break;
    }
}

async function renderPartials(file, options){
    let partial;
    ejs.renderFile(`views/partials/${file}.ejs`, options, (err, data)=>{
        if(err) throw err;

        try{
            partial = data;
        }catch(e){
            console.log(e);
        }
    });
    return partial;
}

module.exports = {
    loginPage: loginPage,
    adminPage: adminPage,
    twoStep: twoStep,
    contentUpdater: contentUpdater,
}