require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { urlencoded } = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const port = process.env.PORT || 2000;

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});

app.set('view engine', 'ejs');

app.use(express.static('assets'));
app.use(express.json({limit: '5mb'}));
app.use(urlencoded({extended: false}));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use('/', require('./routes/index'));

app.listen(port, ()=> console.log(`\nServer started on port ${port}\n`));