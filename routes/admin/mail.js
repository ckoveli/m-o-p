const express = require('express');
const router = express.Router();
const mailer = require('../../services/mailer');
const renderer = require('../../services/renderer');

router.get('/', (req, res)=>{
    res.render('admin/mail/mail', {mode: req.headers.cookie && req.headers.cookie.includes('dark') ? ' class="dark"' : ''});
});

module.exports = router;