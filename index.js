require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

const routes = require('./routes/routes')

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})


const app = express();

app.use(express.json());

app.use('/api', routes)

database.once('connected', () => {
    console.log('Database Connected');
    app.listen(3000, () => {
        console.log(`Server Started at ${3000}`)
    })
})