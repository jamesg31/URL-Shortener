const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

const urlRoutes = require('./routes/url');

app.use(bodyParser.urlencoded({extended: false}));

app.use(urlRoutes);

app.listen(80);