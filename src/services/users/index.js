import express from "express";
import UsersModel from "./model.js";
import createError from "http-errors";
import { checkUserMiddleware, checkVdalidationResult } from "./validation.js";
import { sendEmail } from "../../lib/sendEmail.js";

const usersRouter = express.Router();

usersRouter.post(
	"/register",
	checkUserMiddleware,
	checkVdalidationResult,
	async (req, res, next) => {
		try {
			const newUser = new UsersModel(req.body);
			const savedUser = await newUser.save();

			res.send(savedUser);
		} catch (error) {
			next(error);
		}
	}
);

usersRouter.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const user = await UsersModel.checkCredencials(email, password);
		if (user) {
			res.send({ message: "Credentials are OK!" });
		} else {
			next(createError(401, "Credentials are not valid!"));
		}
	} catch (error) {
		next(error);
	}
});

usersRouter.get("/", async (req, res, next) => {
	try {
		const users = await UsersModel.find();
		res.send(users);
	} catch (error) {
		next(error);
	}
});

usersRouter.get("/:userId", async (req, res, next) => {
	try {
		const user = await UsersModel.findById(req.params.userId);
		if (user) {
			res.send(user);
		} else {
			next(createError(404, `User with id ${req.params.userId} not found`));
		}
	} catch (error) {
		next(error);
	}
});

usersRouter.put("/:userId", async (req, res, next) => {
	try {
		const updateUser = await UsersModel.findByIdAndUpdate(
			req.params.userId,
			req.body,
			{ new: true }
		);
		if (updateUser) {
			res.send(updateUser);
		} else {
			next(createError(404, `User with id ${req.params.userId} not found`));
		}
	} catch (error) {
		next(error);
	}
});

usersRouter.delete("/:userId", async (req, res, next) => {
	try {
		const deleteUser = await UsersModel.findByIdAndDelete(req.params.userId);
		if (deleteUser) {
			res.status(204).send();
		} else {
			next(createError(404, `Blog with id ${req.params.blogId} not found!`));
		}
	} catch (error) {
		next(error);
	}
});

// SEND EMAIL

usersRouter.post("/email", async (req, res, next) => {
	try {
		const { email } = req.body;

		await sendEmail(email);
		res.send({ message: "Email sent sucessfully, check your box!" });
	} catch (error) {
		next(error);
	}
});

export default usersRouter;
