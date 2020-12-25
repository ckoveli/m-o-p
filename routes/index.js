const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const Post = require('./../models/post');
const authorize = require('../auth/authorize');
const { render } = require('ejs');
const mailer = require('../services/mailer');
const renderer = require('../services/renderer');

router.use('/poezija', require('./../routes/poetry'));
router.use('/admin', require('./../routes/admin/admin'));

router.get('/', getToken, paginateResults(Post), (req, res)=>{
	res.render('index', {
		token: res.locals.token,
		posts: res.locals.paginatedResults.results,
		next: res.locals.paginatedResults.next,
		previous: res.locals.paginatedResults.previous,
		pageCount: res.locals.pageCount
	});
});
router.get('/o-meni', getToken, async(req, res,)=>{
	const admin = await Admin.findOne({name: 'artvel'});
	res.render('about', {
		token: res.locals.token,
		data: admin.about
	});
});
router.get('/pretraga', getToken, paginateResults(Post), (req, res, next)=>{	
	if(req.query.q == null) return next();

	const allSpace = arr => arr.every(val => val === ' ');
	if(allSpace(Array.from(req.query.q)) == true) return res.redirect('/');

	res.render('search', {
		token: res.locals.token,
		value: req.query.q,
		posts: res.locals.paginatedResults.results,
		next: res.locals.paginatedResults.next,
		previous: res.locals.paginatedResults.previous,
		pageCount: res.locals.pageCount
	});
});
router.route('/22072019').get(getToken, (req, res)=>{
	!res.locals.token ? res.render('admin/auth/login') : res.redirect('/admin');
}).post(async(req, res)=>{
	await renderer.loginPage(req.body.partial, (result)=>{
		res.status(200).json({
			html: result.html,
			css: result.css
		}).end();
	})
});

router.put('/komentar/:slug', async(req, res, next)=>{
	const date = new Date();
	const month = new Array();
	month[0] = 'Januar';
	month[1] = 'Februar';
	month[2] = 'Mart';
	month[3] = 'April';
	month[4] = 'Maj';
	month[5] = 'Jun';
	month[6] = 'Jul';
	month[7] = 'Avgust';
	month[8] = 'Septembar';
	month[9] = 'Oktobar';
	month[10] = 'Novembar';
	month[11] = 'Decembar';

	await Post.findOne({slug: req.params.slug}, async(err, post)=>{
		if(err) return next();
		if(!post) return next();

		const type = req.body.token == 'true' ? 'admin' : 'user';
		
		const comment = {
			id: post.comments.length,
			type: type,
			date: `${date.getDate()}. ${month[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`,
			user: req.body.user,
			username: req.body.username,
			comment: req.body.comment,
			replies: []
		}
		res.status(200).json({
			partial: await renderer.contentUpdater('show', 'comment/_comment', {
				token: req.body.token,
				comment: comment,
				id: post.comments.length,
				slug: req.params.slug
			}),
			comCount: await renderer.contentUpdater('show', 'comment/_com-count', {
				commentCount: post.comments.length+1,
				repliesCount: ()=>{
					let cnt = 0;
		
					for(let i=0; i<post.comments.length; i++){
						cnt += post.comments[i].replies !== undefined ? post.comments[i].replies.length>0 ? post.comments[i].replies.length : 0 : 0;
					} 
					return cnt;
				}
			})
		}).end();
		try{
			await Post.findByIdAndUpdate(post.id, {
				$push: {comments: comment}
			});
			if(req.body.token == 'false'){
				// mailer.info('comment', {
				// 	token: req.body.token,
				// 	post: post.title,
				// 	slug: req.params.slug,
				// 	username: req.body.username,
				// 	comment: req.body.comment,
				// 	date: `${date.getDate()}. ${month[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
				// });
			}
		}catch(e){
			res.render('errors/500', {token: res.locals.token});
		}
	});
});
router.put('/odgovor/:slug', async(req, res, next)=>{	
	const date = new Date();
	const month = new Array();
	month[0] = 'Januar';
	month[1] = 'Februar';
	month[2] = 'Mart';
	month[3] = 'April';
	month[4] = 'Maj';
	month[5] = 'Jun';
	month[6] = 'Jul';
	month[7] = 'Avgust';
	month[8] = 'Septembar';
	month[9] = 'Oktobar';
	month[10] = 'Novembar';
	month[11] = 'Decembar';

	await Post.findOne({slug: req.params.slug}, async(err, post)=>{
		if(err) return next();
		if(!post) return next();

		if(post.comments[req.body.commentId].replies == undefined) post.comments[req.body.commentId].replies = [];

		const type = req.body.token == 'true' ? 'admin' : 'user';
	
		const reply = {
			id: post.comments[req.body.commentId].replies == undefined ? 0 : post.comments[req.body.commentId].replies.length,
			type: type,
			date: `${date.getDate()}. ${month[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`,
			user: req.body.user,
			username: req.body.username,
			reply: req.body.reply
		}
	
		post.comments[req.body.commentId].replies.push(reply);

		res.status(200).json({
			partial: await renderer.contentUpdater('show', 'reply/_reply', {
				token: req.body.token,
				reply: reply,
				commentId: req.body.commentId,
				replyId: post.comments[req.body.commentId].replies.length,
				slug: req.params.slug
			}),
			comCount: await renderer.contentUpdater('show', 'comment/_com-count', {
				commentCount: post.comments.length,
				repliesCount: ()=>{
					let cnt = 0;
		
					for(let i=0; i<post.comments.length; i++){
						cnt += post.comments[i].replies !== undefined ? post.comments[i].replies.length>0 ? post.comments[i].replies.length : 0 : 0;
					} 
					return cnt;
				}
			}),
			repCount: await renderer.contentUpdater('show', 'reply/_rep-count', {
				repliesCount: post.comments[req.body.commentId].replies.length,
				commentId: req.body.commentId
			}),
			lastReply: post.comments[req.body.commentId].replies.length
		});

		post.markModified('comments');
	
		try{
			post = await post.save();

			if(req.body.token == 'false'){
				// mailer.info('reply', {
				// 	token: req.body.token,
				// 	post: post.title,
				// 	slug: req.params.slug,
				// 	commentUsername: type == 'admin' ? null : post.comments[req.body.commentId].username,
				// 	commentType: post.comments[req.body.commentId].type,
				// 	comment: post.comments[req.body.commentId].comment,
				// 	replyType: post.comments[req.body.commentId].type,
				// 	username: req.body.username,
				// 	reply: req.body.reply,
				// 	date: `${date.getDate()}. ${month[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
				// });
			}
		}catch(e){
			console.log(e)
			res.render('errors/500', {token: res.locals.token});
		}
	});
});
router.put('/prijava-na-obavestenja', async(req, res)=>{
	await Admin.findOne({name: 'artvel'}, async(err, admin)=>{
		if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email)){
			admin.followers = []
			const exists = admin.followers.some(el => el.email === req.body.email);
			if(!exists){
				let id = require('crypto').randomBytes(4).toString('hex');
				admin.followers.push({
					id: id,
					email: req.body.email
				});
				admin.followers = []
				try{
					admin = await admin.save();
					console.log(admin.followers)
					res.status(200).json({
						html: '<div class="title" style="border-bottom: none;"><p>Hvala na prijavljivanju!</p></div>',
						cookie: `_sub=${id}; expires=${new Date(2147483647 * 1000).toUTCString()},`
					}).end();
					// mailer.info('subscribe', {
					// 	email: req.body.email,
					// 	date: `Danas` 
					// });
				}catch(e){
					console.log(e);
				}
			}else{
				res.status(200).json({error: {
					html: '<div class="title" style="border-bottom: none;"><p>Hvala na prijavljivanju!</p></div>',
					cookie: `_sub=${id}; expires=${new Date(2147483647 * 1000).toUTCString()},`
				}}).end();
			}
		}else res.status(400).json({error: {
			msg: 'Uneta imejl adresa je nevažeća.'
		}}).end();
	});
});
router.use(getToken, (req, res)=>{
	res.status(404).render('errors/404', {token: res.locals.token});	
});

function paginateResults(model){
	return async (req, res, next)=>{
		const page = parseInt(req.query.page) || 1,
		limit = 9;
	
		const startIndex = (page - 1) * limit,
		endIndex = page * limit;
	
		const results = {};
		if(endIndex< await model.countDocuments().exec()){
			results.next = {
				page: page+1,
				limit: limit
			}
		}
		if(startIndex>0){
			results.previous = {
				page: page-1,
				limit: limit
			}
		}
		try{
			if(!req.query.q){
				results.results = await model.find().sort({createdAt: 'desc'}).limit(limit).skip(startIndex).exec();
			}else{
				const regex = new RegExp(escRegExp(req.query.q), 'gi');
				results.results = await model.find({title: regex}).sort({createdAt: 'desc'}).limit(limit).skip(startIndex).exec();
			}
			res.locals.paginatedResults = results;
			res.locals.pageCount = Math.ceil(((await model.countDocuments().exec())/limit));
			next();
		}catch(e){
			res.render('errors/500', {token: res.locals.token});
		}
	}
}
function getToken(req, res, next){
	authorize.verifyAdmin(req.headers.cookie, (result)=>{
		res.locals.token = result;
		next();
	});
}
function escRegExp(query){
	if(query == undefined) return;
	else return query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;