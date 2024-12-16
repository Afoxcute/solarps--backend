const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const api = require('./api');
const app = express();


db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to the database!');
    })
    .catch(err => {
        console.log('Cannot connect to the database!', err);
        process.exit();
    });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let corsOptions;

if (process.env.NODE_ENV === 'production') {

    console.log('running in production mode')
    corsOptions = {
        origin: 'https://solarps.myappa.tech',
        credentials: true,
        optionSuccessStatus: 200
    };
} else {
    console.log('running in development mode')
    corsOptions = {
        origin: 'http://localhost:3000',
        credentials: true,
        optionSuccessStatus: 200
    };
}

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello world')
})
app.use('/api', api);
module.exports = app;
