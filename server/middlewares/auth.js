require('dotenv').config({
	path: '../config/index.env',
});
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	/* get token from header */
	const token = req.header('x-auth-token');
	/* if no token */
	if (!token) {
		return res.status(401).json({
			message: 'no token',
		});
	}
	/* verify token */
	try {
		const JWT_SECRET = process.env.JWT_SECRET;
		const verifyToken = jwt.verify(token, JWT_SECRET);
		req.user = verifyToken.user;
		next();
	} catch (error) {
		console.log(error.message);
		res.status(401).json({
			message: 'invalid token',
		});
	}
};
