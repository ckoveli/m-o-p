const express = require('express');
const router = express.Router();
const Post = require('./../models/post');
const About = require('./../models/about');
const authenticate = require('./../auth/authenticate');
const authorize = require('./../auth/authorize');
const { urlencoded } = require('express');
const slugify = require('slugify');
const methodOverride = require('method-override');
const { compareSync } = require('bcrypt');
const { remove } = require('./../models/post');

router.use(express.static('assets'));
router.use(express.json({limit: '5mb'}));
router.use(urlencoded({extended: false}));
router.use(methodOverride('_method'));

router.get('/', getToken, (req, res)=>{
	res.render('admin/admin');
});
router.route('/objavi').get(getToken, (req, res)=>{
	res.render('admin/publish');
}).post(getToken, async(req, res)=>{
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
		res.json({slug: post.slug});
	}catch(e){
		console.log(e);
	}
});
router.get('/uredi', getToken, async(req, res, next)=>{
	if(req.query.e == 'about'){
		res.render('admin/edit/e-about', {
			data: await About.findOne()
		});
		return;
	}
	await Post.findById(req.query.e, (err, post)=>{
		if(err) return next();
		if(!post) return next();
		
		res.render('admin/edit/e-post', {
			data: post
		});
	});	
});
router.route('/lozinka').get(getToken, (req, res)=>{
	res.render('admin/auth/password', {title: 'PROMENI LOZINKU'});
}).post(getToken, async(req, res)=>{
	admin = await require('./../models/admin').findOne({name: req.body.name});

	authenticate.changePass(admin, req.body.oldpass, req.body.newpass, async(err, result)=>{
		if(err) return res.render(err.path, {title: err.title});

		admin.pass = result.hash;
		try{
			admin = await admin.save();
			
			res.clearCookie(result.cookie);
			res.redirect(result.path);
			delete admin;
		}catch(e){
			console.log(e);
		}
	});
});
router.get('/objave', getToken, async(req, res)=>{
	const posts = await Post.find().sort({createdAt: 'desc'});
	res.render('admin/manage-posts', {data: posts});
});
router.put('/uredi/:id', getToken, async(req, res, next)=>{
	if(req.params.id == 'about'){
		let about = await About.findOne();

		about.title = req.body.newTitle,
		about.subtitle = req.body.newSubtitle,
		about.body = req.body.newBody,
		about.picture = req.body.newPicture
		try{
			about = await about.save();
			res.sendStatus(200);
		}catch(e){
			console.log(e);
		}return;
	}
	await Post.findById(req.params.id, async(err, post)=>{
		if(err) return next();
		if(!post) return next();
	
		post.title = req.body.newTitle;
		post.subtitle = req.body.newSubtitle;
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
router.delete('/objave/:id', getToken, async(req, res)=>{
	await Post.findByIdAndDelete(req.params.id);
	res.redirect('/admin/objave');
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
			res.redirect(`/admin/uredi?e=${postId}`);
		}catch(e){
			console.log(e)
		}
	});
});
router.post('/prijava', async(req, res)=>{
	admin = await require('./../models/admin').findOne({name: req.body.name});

	authenticate.login(admin, req.body.pass, (err, result)=>{
		if(err) return res.render(err.path, {title: err.title});
		
		res.cookie(result.cookie, result.token);
		res.redirect(result.path);
		delete admin;
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