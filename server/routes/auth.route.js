require('dotenv').config({
	path: '../config/index.env',
});

const router = require('express').Router();
const jwt = require('jsonwebtoken'); /* generate user token  */
const bcrypt = require('bcryptjs'); /* encrypt password */
const {
	check,
	validationResult,
} = require('express-validator'); /* check validation for request */
const gravatar = require('gravatar'); /* get image user from email */

const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

/* Register user */
/* @routes  POST api/user/register */
/* @access  public */

router.post(
	'/register',
	[
		/* Validation */
		check('name', 'name is required').not().isEmpty(),
		check('email', 'input a valid email').isEmail(),
		check('password', 'input a password with 6 or more characters').isLength({
			min: 6,
		}),
	],
	async (req, res) => {
		/* if errors */

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}
		/* get name, email and password from request */
		const { name, email, password } = req.body;
		try {
			/* check user if already exist */
			let user = await User.findOne({ email });
			if (user) {
				return res.status(400).json({
					errors: [{ message: 'user already exist' }],
				});
			}
			/* check user if NOT already exist */
			/* first, get image from email (gravatar) */
			const avatar = gravatar.url(email, {
				size: '200',
				rating: 'pg',
				default: 'mm',
			});

			/* create new user */
			user = new User({
				name,
				email,
				password,
				avatar,
			});

			/* encrypt password */
			const salt = await bcrypt.genSalt(10);
			/* save password */
			user.password = await bcrypt.hash(password, salt);
			/* save user in database */
			await user.save();
			/* payload to generate token */
			const payload = {
				user: { id: user.id },
			};

			const JWT_SECRET = process.env.JWT_SECRET;
			jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
				if (err) throw err;
				res.json({ token });
			});
		} catch (error) {
			console.log(error.message);
			res.status(500).send('server error');
		}
	}
);

/* Login user */
/* @routes  POST api/user/login */
/* @access  public */

router.post(
	'/login',
	[
		/* Validation */
		check('email', 'input a valid email').isEmail(),
		check('password', 'password is required').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		/* if errors */

		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}
		/* if good, get email and password from req.body */

		const { email, password } = req.body;
		try {
			/* find user */
			let user = await User.findOne({ email });
			/* if user not found in database */
			if (!user) {
				res.status(400).json({
					errors: [{ message: 'invalid credentials' }],
				});
			}
			/* if user found in database then compare password first */
			const passwordMatchDatabase = await bcrypt.compare(
				password,
				user.password
			);
			/* if password not match */
			if (!passwordMatchDatabase) {
				res.status(400).json({
					errors: [{ message: 'invalid password' }],
				});
			}

			const payload = {
				user: { id: user.id },
			};

			const JWT_SECRET = process.env.JWT_SECRET;
			jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
				if (err) throw err;
				res.json({ token });
			});
		} catch (error) {
			console.log(error.message);
			res.status(500).send('server error');
		}
	}
);

/* Get user information */
/* @routes  GET api/user */
/* @access  public */

router.get('/', authMiddleware, async (req, res, next) => {
	try {
		/* get information user by id */
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

module.exports = router;
