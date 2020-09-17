const express = require('express');
const router = express.Router();
const Post = require('./../models/post');
const About = require('./../models/about');
const authorize = require('../auth/authorize');

router.use('/poezija', require('./../routes/poetry'));
router.use('/admin', require('./../routes/admin'));

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
	res.render('about', {
		token: res.locals.token,
		data: await About.findOne()
	});
});
router.get('/pretraga', getToken, paginateResults(Post), (req, res)=>{	
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
router.get('/22072019', getToken, (req, res)=>{
	!res.locals.token ? res.render('admin/auth/login', {title: 'ADMIN'}) : res.redirect('/admin');
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
		
		const comment = {
			id: post.comments.length,
			date: `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`,
			user: req.body.user,
			username: req.body.username,
			comment: req.body.comment
		}
		try{
			await Post.findByIdAndUpdate(post.id, {
				$push: {comments: comment}
			});
			res.redirect(`/poezija/${req.params.slug}`)
		}catch(e){
			res.render('errors/500', {token: res.locals.token});
		}
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