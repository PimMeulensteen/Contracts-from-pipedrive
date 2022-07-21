require('dotenv').config({ path: __dirname + '/.env' })


const express = require('express');
const path = require('path');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const api = require('./api');
const config = require('./config');
const User = require('./db/user');
const ConfigDB = require('./db/config')


var spell = require('spell-it')('nl');
const fs = require('fs');
const https = require('https');
const credentials = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

User.createTable();
ConfigDB.createTable();

const app = express();
const port = 3000;

passport.use(
    'pipedrive',
    new OAuth2Strategy({
        authorizationURL: 'https://oauth.pipedrive.com/oauth/authorize',
        tokenURL: 'https://oauth.pipedrive.com/oauth/token',
        clientID: config.clientID || '',
        clientSecret: config.clientSecret || '',
        callbackURL: config.callbackURL || ''
    }, async (accessToken, refreshToken, profile, done) => {
        const userInfo = await api.getUser(accessToken);
        const user = await User.add(
            userInfo.data.name,
            accessToken,
            refreshToken
        );

        done(null, { user });
    }
    )
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(async (req, res, next) => {
    req.user = await User.getById(1);
    next();
});


// Authentication
app.get('/auth/pipedrive', passport.authenticate('pipedrive'));
app.get('/auth/pipedrive/callback', passport.authenticate('pipedrive', {
    session: false,
    failureRedirect: '/',
    successRedirect: '/'
}));



app.get('/', async (req, res) => {
    if (req.user.length < 1) {
        return res.redirect('/auth/pipedrive');
    }

    try {
        const deals = await api.getDeals(req.user[0].access_token);

        res.render('overview', {
            name: req.user[0].username,
            deals: deals.data
        });
    } catch (error) {
        return res.send(error.message);
    }
});

// Create the contract
app.get('/create/', async (req, res) => {
    // Ensure pipedrive is linked.
    if (req.user.length < 1) {
        return res.redirect('/auth/pipedrive');
    }

    // Get deal data.
    let id = req.query.selectedIds;
    console.log("Try get data.")
    let data = await api.getDeal(req.user[0].access_token, id);
    console.log("Data: found, now trying product data");
    let product_data = await api.getDealProducts(req.user[0].access_token, id);
    console.log("Product data: found, now trying deal fields");


    let zegge = JSON.stringify(data);
    zegge = spell(JSON.parse(zegge).data.weighted_value)
    console.log(data);

    console.log(product_data)
    console.log("\n" * 5)
    return res.render('create', { data, product_data, zegge })
}
);


let httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, "0.0.0.0", () => console.log(`🟢 App has started. \n🔗 Live URL: https://77.175.252.253/`));