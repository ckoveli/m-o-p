const express = require('express');
const router = express.Router();
const Admin = require('../../models/admin');
const Post = require('./../../models/post');
const authenticate = require('./../../auth/authenticate');
const authorize = require('./../../auth/authorize');
const slugify = require('slugify');
const methodOverride = require('method-override');
const { compareSync } = require('bcrypt');
const { remove } = require('./../../models/post');
const { render } = require('ejs');
const mailer = require('../../services/mailer');
const renderer = require('../../services/renderer');

let twoStepCode;

router.use(express.static('assets'));
router.use(express.json({limit: '5mb'}));
router.use(express.urlencoded({extended: false}));
router.use(methodOverride('_method'));
router.use('/mejl', getToken, require('../../routes/admin/mail'));

router.route('/').get(getToken, async(req, res)=>{
	const admin = await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]});
	res.render('admin/admin', {
		partial: '_profile.ejs',
		title: admin.profile.title,
		body: admin.profile.body
	});
}).post(getToken, async(req, res)=>{

	await renderer.adminPage('admin/admin_page/', req, (result)=>{
		res.status(200).json({
			html: result.html,
			css: result.css
		})
	});;
});
router.post('/objavi', getToken, async(req, res)=>{
	let post = new Post({
		date: req.body.date,
		type: req.body.type,
		title: req.body.title,
		subtitle: req.body.subtitle,
		preview: req.body.preview,
		body: req.body.body,
		picture: req.body.picture,
		commentsEnabled: req.body.commentsEnabled,
		slug: slugify(req.body.title, {lower: true, strict: true})
	});
	try{
		post = await post.save();
		mailer.info('post', {
			slug: post.slug,
			post: post.title
		});
		res.status(200).json({slug: post.slug}).end();
	}catch(e){
		console.log(e);
	}
});
router.post('/lozinka', getToken, async(req, res)=>{
	let admin = await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]});

	authenticate.changePass(admin, req.body.oldpass, req.body.newpass, async(err, result)=>{
		if(err) return res.status(401).json({error: {title: err.title, id: err.id}}).end();

		admin.pass = result.hash;
		try{
			admin = await admin.save();
			
			res.clearCookie(result.cookie);
			delete admin;
			res.status(301).json({
				path: result.path
			}).end();
		}catch(e){
			console.log(e);
		}
	});
});
router.route('/zaboravljena-lozinka').get((req, res, next)=>{
	if(req.headers.cookie){
		if(req.headers.cookie.includes(';')){
			authorize.twoStep(req.headers.cookie.split(';')[1].split('=')[1], async(err, result)=>{
				if(err) return next();
		
				else return await Admin.findOne({name: result.name}, async(err, admin)=>{
					if(err || !admin) return next();
					
					if(admin.security.securityQuestion == true && (admin.security.securityQuestionQuestion !== '' && admin.security.securityQuestionAnswer !== '')){
						return res.render('admin/auth/two-step', {
							timer: '',
							name: admin.name,
							mail: admin.mail,
							title: await renderer.twoStep('question', '_title', {title: 'Da biste nastavili, odgovorite na sledeće pitanje:'}),
							form: await renderer.twoStep('question', '_form', {
								target: '/admin/resetovanje-lozinke/',
								name: admin.name,
								mail: admin.mail,
								securityQuestionQuestion: admin.security.securityQuestionQuestion
							})
						});
					}else{
						return res.render('admin/auth/two-step', {
							timer: '<div id="timer"></div>',
							name: admin.name,
							mail: admin.mail,
							title: await renderer.twoStep('code', '_title', {title: 'Unesite jednokratni verifikacioni kod poslat na vašu imejl adresu da biste nastavili.'}),
							form: await renderer.twoStep('code', '_form', {
								target: '/admin/resetovanje-lozinke/',
								name: admin.name,
								mail: admin.mail,
								time: req.headers.cookie.split(';')[0].split('=')[1] == '0' ? 59 : req.headers.cookie.split(';')[0].split('=')[1]
							})
						});
					}
				});
			});
		}else{
			authorize.twoStep(req.headers.cookie.split('=')[1], async(err, result)=>{
				if(err) return next();
		
				else return await Admin.findOne({name: result.name}, async(err, admin)=>{
					if(err || !admin) return next();
					
					if(admin.security.securityQuestion == true && (admin.security.securityQuestionQuestion !== '' && admin.security.securityQuestionAnswer !== '')){
						return res.render('admin/auth/two-step', {
							timer: '',
							name: admin.name,
							mail: admin.mail,
							title: await renderer.twoStep('question', '_title', {title: 'Da biste nastavili, odgovorite na sledeće pitanje:'}),
							form: await renderer.twoStep('question', '_form', {
								target: '/admin/resetovanje-lozinke/',
								securityQuestionQuestion: admin.security.securityQuestionQuestion
							})
						});
					}else{
						return res.render('admin/auth/two-step', {
							timer: '<div id="timer"></div>',
							name: admin.name,
							mail: admin.mail,
							title: await renderer.twoStep('code', '_title', {title: 'Unesite jednokratni verifikacioni kod poslat na vašu imejl adresu da biste nastavili.'}),
							form: await renderer.twoStep('code', '_form', {
								target: '/admin/resetovanje-lozinke/',
								name: admin.name,
								mail: admin.mail,
								time: 59
							})
						});
					}
				});
			});
		}
	}else return next();
}).post(async(req, res)=>{
	if(req.headers.cookie && req.headers.cookie.includes('timer')) res.clearCookie('timer', {path: '/admin'});

	await Admin.findOne({name: req.body.name}, (err, admin)=>{
		if(err || !admin){ 
			return res.status(401).json({error: {title: 'Nepostojće ime!', id: 'name'}}).end();
		}else{
			if(req.body.mail !== admin.mail[0]){
				return res.status(401).json({error: {title: 'Pogrešan imejl!', id: 'mail'}}).end();
			}else{
				authenticate.twoStep(admin, '60s', (err, result)=>{
					if(err) return res.status(401).json({error: {title: err.title, id: err.id}}).end();

					else{
						res.cookie(result.cookie, result.token);
						res.status(200).json({path: result.path}).end();
						if(admin.security.securityCode == true){
							twoStepCode = require('crypto').randomBytes(2).toString('hex');
							mailer.info('two-step', {code: twoStepCode});
						}
						return;
					} 
				});
			}
		}
	});
});
router.route('/resetovanje-lozinke/:code').get(async(req, res, next)=>{
	if(req.headers.cookie){
		await Admin.findOne({name: req.headers.cookie.split(process.env.TMP_TOKEN_SECRET)[1]}, async(err, admin)=>{
			if(err) return next();

			if(req.params.code == twoStepCode){
				authorize.twoStep(req.headers.cookie.split('=')[1], (err)=>{
					if(err) return next();
	
					else authenticate.twoStep(admin, '120s', (err, result)=>{
						if(err) return next();

						res.cookie(result.cookie, result.token);
						res.render('admin/auth/password');
					});
				});
			}
			if(req.params.code == admin.security.securityQuestionAnswer){
				authorize.twoStep(req.headers.cookie.split('=')[1], (err)=>{
					if(err) return next();

					else authenticate.twoStep(admin, '120s', (err, result)=>{
						if(err) return next();

						res.cookie(result.cookie, result.token);
						res.render('admin/auth/password');
					});
				});
			}else return next();
		});
	}else return next();
}).post((req, res, next)=>{
	if(req.headers.cookie){
		if(req.params.code == twoStepCode){
			authorize.twoStep(req.headers.cookie.split('=')[1], async(err, result)=>{
				if(err) return next();

				else return await Admin.findOne({name: req.headers.cookie.split(process.env.TMP_TOKEN_SECRET)[1]}, (err, admin)=>{
					if(err) return next();

					else authenticate.resetPass(admin, req.body.newpass, async(err, result)=>{
						if(err) return next();
						
						else{
							admin.pass = result.hash;
							try{
								admin = await admin.save();
								
								res.clearCookie(result.cookie);
								delete admin;
								delete twoStepCode;
								res.redirect(result.path);
							}catch(e){
								console.log(e);
							}
						}						
					});
				});
			});	
		}else return next();
	}else return next();
});
router.put('/uredi/:id', getToken, async(req, res, next)=>{
	if(req.params.id == 'about'){
		let admin = await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]});

		admin.about.title = req.body.newTitle,
		admin.about.subtitle = req.body.newSubtitle,
		admin.about.body = req.body.newBody,
		admin.about.picture = req.body.newPicture
		try{
			admin = await admin.save();
			res.status(200).json({
				html: await renderer.contentUpdater('admin_page', 'manage-posts/edit/_about', {token: res.locals.token, data: admin.about})
			}).end();
		}catch(e){
			console.log(e);
		}return;
	}
	await Post.findById(req.params.id, async(err, post)=>{
		if(err) return next();
		if(!post) return next();
	
		post.title = req.body.newTitle;
		post.subtitle = req.body.newSubtitle;
		post.body = req.body.newBody;
		post.preview = req.body.newPreview;
		post.picture = req.body.newPicture;
		post.commentsEnabled = req.body.newCommentsEnabled;
		try{
			post = await post.save();
			res.json({slug: post.slug});
		}catch(e){
			console.log(e);
		}
	});
});
router.put('/settings', getToken, async(req, res, next)=>{
	if(req.body.setting == 'settings/_notifications'){
		await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]}, async(err, admin)=>{
			if(err) throw err;
			
			admin.notifications.receiveNotifications = req.body.receiveNotifications;
			admin.notifications.comments = req.body.comments;
			admin.notifications.myReplies = req.body.myReplies;
			admin.notifications.otherReplies = req.body.otherReplies;
			admin.notifications.registeredUsers = req.body.registeredUsers;
			admin.notifications.usersReceiveNotifications = req.body.usersReceiveNotifications;
			admin.mail = req.body.notificationsMail;
		
			try{
				admin = await admin.save();
				res.status(200).end();
			}catch(e){
				console.log(e)
			}
		});
	}
	if(req.body.setting == 'settings/_security'){
		await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]}, async(err, admin)=>{
			if(err) throw err;

			admin.security.twoStepVerification = req.body.twoStepVerification;
			admin.security.securityCode = req.body.securityCode;
			admin.security.securityQuestion = req.body.securityQuestion;
			admin.security.securityQuestionQuestion = req.body.securityQuestionQuestion;
			admin.security.securityQuestionAnswer = req.body.securityQuestionAnswer;

			try{
				admin = await admin.save();
				res.status(200).end();
			}catch(e){
				console.log(e);
			}
		});
	}
	if(req.body.setting == 'settings/_profile'){
		await Admin.findOne({name: req.headers.cookie.split(process.env.ADMIN_COOKIE_SEPARATOR)[1]}, async(err, admin)=>{
			if(err) throw err;

			admin.profile.title = req.body.title;
			admin.profile.body = req.body.body;

			try{
				admin = await admin.save();
				res.status(200).end();
			}catch(e){
				console.log(e);
			}
		});
	}
});
router.delete('/objave/:id', getToken, async(req, res)=>{
	await Post.findByIdAndDelete(req.params.id);

	const posts = await Post.find().sort({createdAt: 'desc'});

	res.status(200).json({
		data: await renderer.contentUpdater('admin_page', 'manage-posts/_manage', {
			data: posts, 
			postCount: posts.length
		})
	}).end();
});
router.delete('/komentar/:id', getToken, async(req, res)=>{
	const postId = req.params.id.split(',')[0],
	commentId = req.params.id.split(',')[1];
	
	await Post.findById(postId, async(err, post)=>{
		if(err) return next();
		if(!post) return next();

		let removeIndex = await post.comments.map(function(item){return item.id}).indexOf(commentId);

		post.comments.splice(removeIndex, 1);
		try{
			post = await post.save();
			res.status(200).json({
				partial: await renderer.contentUpdater('admin_page', 'manage-posts/edit/_edit', {
					data: post
				}),
				comCount: await renderer.contentUpdater('admin_page', 'manage-posts/edit/comment/_com-count', {
					commentCount: post.comments.length,
					repliesCount: ()=>{
						let cnt = 0;
			
						for(let i=0; i<post.comments.length; i++){
							cnt += post.comments[i].replies !== undefined ? post.comments[i].replies.length>0 ? post.comments[i].replies.length : 0 : 0;
						} 
						return cnt;
					}
				})
			}).end();		
		}catch(e){
			console.log(e);
		}
	});
});
router.delete('/odgovor/:id', getToken, async(req, res)=>{
	const postId = req.params.id.split(',')[0],
	commentId = req.params.id.split(',')[1],
	replyId = req.params.id.split(',')[2];
	
	await Post.findById(postId, async(err, post)=>{
		if(err) return next();
		if(!post) return next();

		let removeIndex = await post.comments.map(function(item){return item.id}).indexOf(commentId);

		post.comments[removeIndex].replies.splice(replyId, 1);
		post.markModified('comments');
		try{
			post = await post.save();
			res.status(200).json({
				partial: await renderer.contentUpdater('admin_page', 'manage-posts/edit/reply/_rep-count', {
					dataId: postId,
					comment: post.comments[removeIndex],
					commentId: commentId
				}),
				comCount: await renderer.contentUpdater('admin_page', 'manage-posts/edit/comment/_com-count', {
					commentCount: post.comments.length,
					repliesCount: ()=>{
						let cnt = 0;
			
						for(let i=0; i<post.comments.length; i++){
							cnt += post.comments[i].replies !== undefined ? post.comments[i].replies.length>0 ? post.comments[i].replies.length : 0 : 0;
						} 
						return cnt;
					}
				})
			}).end();
		}catch(e){
			console.log(e);
		}
	});
});
router.post('/prijava', async(req, res)=>{
	let admin = await Admin.findOne({name: req.body.name});

	authenticate.login(admin, req.body.pass, (err, result)=>{
		if(err) return res.status(401).json({error: {title: err.title, id: err.id}}).end();
		
		res.cookie(result.cookie, `${result.token};${req.body.name}`);
		res.locals.name = req.body.name;
		delete admin;
		res.status(200).json({path: result.path}).end();
	});
});
router.post('/odjava', getToken, (req, res)=>{
	res.clearCookie(res.locals.cookie);
	res.redirect(res.locals.path);
});
router.use(getToken, (req, res)=>{
	res.status(404).render('errors/404', {token: res.locals.token});
});

function getToken(req, res, next){
	authorize.verifyAdminStrict(req.headers.cookie, (err, result)=>{
		if(err) return res.status(err.code).render(err.path, {token: err.token});

		res.locals.token = err ? err.token : result.token;
		res.locals.cookie = result.cookie;
		res.locals.path = result.path;
		next();
	});
}

module.exports = router;