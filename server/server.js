require('dotenv').config({
	path: './config/index.env',
});

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const connectDB = require('./config/db');
connectDB();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

/* routes */
app.use('/api/user/', require('./routes/auth.route'));

app.get('/', (req, res) => {
	res.send('Halo');
});

/* Page Not Found */
app.use((req, res) => {
	res.status(404).json({
		message: 'Maaf! Halaman tidak dapat ditemukan.',
	});
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
