import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import logging from './config/logging';
import config from './config/config';
import userRoutes from './routes/user';
import mongoose from 'mongoose';
import cors from 'cors';

const allowedList = ['http://localhost:3000'];

const options: cors.CorsOptions = {
    origin: allowedList
};

const NAMESPACE = 'Server';
const router = express();

// Connect to Mongo

mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info(NAMESPACE, 'Connected to mongoDB!');
    })
    .catch((err) => {
        logging.error(NAMESPACE, err.message, err);
    });

router.use(cors(options));

router.use((req, res, next) => {
    logging.info(NAMESPACE, `Method: [${req.method}], URL: [$Preq.url], IP: [${req.socket.remoteAddress}]`);

    res.on(`finish`, () => {
        logging.info(NAMESPACE, `Method: [${req.method}], URL: [$Preq.url], IP:[${req.socket.remoteAddress}], STATUS: [${res.statusCode}]`);
    });
    next();
});

// parsing request
// injections allows us to send nested json to our API.
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Rules for our API

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST PUT');
        return res.status(200).json();
    }
    next();
});

// Routes

router.use('/user', userRoutes);
// Error Handling

router.use((req, res, next) => {
    const error = new Error('Not Found');

    return res.status(404).json({
        message: error.message
    });
});

// Server
const httpServer = http.createServer(router);
httpServer.listen(config.server.PORT, () => logging.info(NAMESPACE, `Serving running on ${config.server.hostname} : ${config.server.PORT}`));
