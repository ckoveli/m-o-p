const express = require('express');
const Post = require('./../models/post');
const router = express.Router();
const authorize = require('../auth/authorize');

router.use(express.static('assets'));

router.get('/', getToken, paginateResults(Post), (req, res)=>{
	res.render('poetry', {
		token: res.locals.token,
		posts: res.locals.paginatedResults.results,
		next: res.locals.paginatedResults.next,
		previous: res.locals.paginatedResults.previous,
		pageCount: res.locals.pageCount
	});
});
router.get('/:slug', getToken, async(req, res, next)=>{
	await Post.findOne({slug: req.params.slug}, (err, post)=>{
		if(err) return next();
		if(!post) return next();

		res.render('show/show-post', {
			sub: req.headers.cookie && req.headers.cookie.includes('_sub') ? true : false,
			token: res.locals.token,
			data: post,
			repliesCount: ()=>{
				let cnt = 0;

				for(let i=0; i<post.comments.length; i++){
					cnt += post.comments[i].replies !== undefined ? post.comments[i].replies.length>0 ? post.comments[i].replies.length : 0 : 0;
				} 
				return cnt;
			}
		});
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
	
		const results = {}
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
			results.results = await model.find({type: 'poetry'}).sort({createdAt: 'desc'}).limit(limit).skip(startIndex).exec();
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

module.exports = router;