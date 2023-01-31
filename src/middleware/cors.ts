import cors from 'cors';

const allowedList = ['http://localhost:3000'];

const options: cors.CorsOptions = {
    origin: allowedList
};

const CorsOps = () => {
    return cors(options);
};

export default CorsOps;
