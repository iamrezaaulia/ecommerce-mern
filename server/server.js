const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config({
	path: './config/index.env',
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

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
