'use strict';

// Environment Variables
require('dotenv').config();

// Application Dependencies
const superagent = require('superagent');
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

//Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors());

//Application Middleware
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));


// API routes
app.get('/makeup', getform);
app.post('/makeup', findProduct);
app.post('/select', productSelect);
app.post('/save', saveProduct);
app.get('/', getproduct);
app.get('/product/:product_id', oneProduct);
app.post('/update', getUpdateForm)
app.put('/update/:product_id', updateSaved);
app.delete('/delete/:product_id', deleteProduct);
app.get('/contact',getContact);
// app.post('/contact',sendEmail)
//////////////////////////////////////
function getContact(req,res){
    res.render('pages/contact');
}


function getform(req, res) {
    res.render('pages/form1');
}

function findProduct(req, res) {
    let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${req.body.brand}&product_type=${req.body.product_type}`
    return superagent.get(url)
        .then(data => {
            let products = data.body.map(product => {
                return new MakeUp(product)
            })
            res.render('pages/show', { searchResults: products })
            console.log(products)
        })
        .catch(error => errorHandler(error, res));

}


function productSelect(req, res) {
    let { name, brand, image_link, category, price, description, product_link } = req.body;
    res.render('pages/index', { product: req.body })
    // console.log(req.body);
}


function productSelect(req, res) {
    let { name, brand, image_link, category, price, description, product_link } = req.body;
    res.render('pages/index', { product: req.body })
    // console.log(req.body);
}

function saveProduct(req, res) {
    let { name, brand, image_link, category, price, description, product_link } = req.body;
    let SQL = 'INSERT INTO goods(name,brand,image_link,category,price,description,product_link ) VALUES ($1, $2, $3, $4, $5, $6, $7);'
    let values = [name, brand, image_link, category, price, description, product_link];
    // console.log(values);

    client.query(SQL, values)
        .then(() => {
            res.redirect('/')
        })
        .catch(error => errorHandler(error, res));

}

function getproduct(req, res) {
    let SQL = `SELECT * FROM goods;`;
    client.query(SQL)
        .then(results => {
            res.render('pages/favorite', { searchResults: results.rows })

        })
}

function oneProduct(req, res) {
    let SQL = 'SELECT * FROM goods WHERE id=$1';
    let values = [req.params.product_id];
    client.query(SQL, values)
        .then(resu => {
            res.render('pages/details', { product: resu.rows })
        })
        .catch(error => errorHandler(error, res));

}

function getUpdateForm(req, res) {
    res.render('pages/edit', { product: req.body });
    // console.log(req.body);
}

function updateSaved(req, res) {
    let { name, brand, image_link, category, price, description, product_link } = req.body;
    //get the data from the form
    let SQL = `UPDATE goods SET name=$1, brand=$2, image_link=$3, category=$4, price=$5, description=$6, product_link=$7 WHERE id=$8 `
    let values = [name, brand, image_link, category, price, description, product_link, req.params.product_id];

    client.query(SQL, values)
        .then(() => { res.redirect('/') })
        .catch(error => errorHandler(error, res));

}

function deleteProduct(req, res) {
    let SQL = `DELETE FROM goods WHERE id=$1;`;
    let values = [req.params.product_id];
    client.query(SQL, values)
        .then(res.redirect('/'))
        .catch(error => errorHandler(error, res));

}

function MakeUp(data) {
    this.id = data.id;
    this.brand = data.brand;
    this.product_type = data.product_type || '';
    this.name = data.name;
    this.price = data.price || '';
    this.image_link = data.image_link;
    this.product_link = data.product_link || '';
    this.website_link = data.website_link || '';
    this.description = data.description || '';
    this.category = data.category || '';
    this.rating = data.rating;
    // this.hex= data.product_colors.data.hex_value;
    // this.color=data.product_colors.data.colour_name;
    //  this.product_colors=data.product_colors;

}

// var player = require('play-sound')
// player.play('./media/WhatsApp Audio 2020-01-13 at 17.45.43.mp3');

////////error
function errorHandler(err, res) {
    // console.log(err);
    res.status(500).send('some thing error');
}

app.use('*', (request, response) => {
    response.status(404).render('pages/error');
});

app.use((error, request, response) => {
    if (response) response.status(500).render('pages/error');
});
////////
client.connect()
    .then(
        app.listen(PORT, () => console.log(`app listen to ${PORT}`)));