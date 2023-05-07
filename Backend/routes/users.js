const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
	const userList = await User.find().select("-passwordHash");

	if (!userList) {
		res.status(500).json({ success: false });
	}
	res.send(userList);
});

router.get("/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-passwordHash");

		if (!user) {
			return res
				.status(404)
				.json({ message: "The user with the given ID was not found." });
		}

		res.status(200).send(user);
	} catch (error) {
		console.error(error);
		res.status(500).send("Server Error");
	}
});

router.post("/", async (req, res) => {
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		color: req.body.color,
		passwordHash: bcrypt.hashSync(req.body.password, 10),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});
	user = await user.save();

	if (!user) return res.status(404).send("the user cannot be created!");

	res.status(200).send(user);
});

router.put("/:id", async (req, res) => {
	try {
		const userExist = await User.findById(req.params.id);
		let newPassword;
		if (req.body.password) {
			newPassword = bcrypt.hashSync(req.body.password, 10);
		} else {
			newPassword = userExist.passwordHash;
		}

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				email: req.body.email,
				color: req.body.color,
				passwordHash: newPassword,
				phone: req.body.phone,
				isAdmin: req.body.isAdmin,
				apartment: req.body.apartment,
				zip: req.body.zip,
				city: req.body.city,
				country: req.body.country,
			},
			{ new: true }
		);

		if (!user) return res.status(404).send("the user cannot be created!");

		res.send(user);
	} catch (error) {
		console.error(error);
		res.status(500).send("Server Error");
	}
});

router.delete("/:id", (req, res) => {
	User.findByIdAndRemove(req.params.id)
		.then((user) => {
			if (user) {
				return res
					.status(200)
					.json({ success: true, message: "the user is deleted" });
			} else {
				return res
					.status(404)
					.json({ success: false, message: "user not found" });
			}
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/login", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		const secret = process.env.secret;
		if (!user) {
			return res.status(400).send("The user not found");
		}

		if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
			const token = jwt.sign(
				{
					userId: user.id,
					isAdmin: user.isAdmin,
				},
				secret,
				{ expiresIn: "1d" }
			);
			return res.status(200).send({ user: user.email, token: token });
		} else {
			return res.status(400).send("password is wrong");
		}
	} catch (error) {
		return res.status(500).send({ error: error });
	}
});

router.get(`/get/count`, async (req, res) => {
	const userCount = await User.countDocuments();

	if (!userCount) res.status(500).json({ success: false });
	res.send({ userCount: userCount });
});

module.exports = router;
