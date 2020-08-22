require('dotenv').config({
	path: './index.env',
});
const mongoose = require('mongoose');

const connectDB = async () => {
	const MONGO_URL = process.env.MONGO_URL;
	const connection = await mongoose.connect(MONGO_URL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	});

	console.log(`mongoDB connected : ${connection.connection.host}`);
};

module.exports = connectDB;
