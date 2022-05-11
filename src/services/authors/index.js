import express from "express";
import AuthorsModel from "./model.js";
import BlogModel from "./model.js";
import createError from "http-errors";
import { checkAuthorMiddleware, checkVdalidationResult } from "./validation.js";
import query2Mongo from "query-to-mongo";

const authorsRouter = express.Router();

authorsRouter.post(
	"/",
	checkAuthorMiddleware,
	checkVdalidationResult,
	async (req, res) => {
		try {
			const newAuthor = new AuthorsModel(req.body);
			const savedAuthor = await newAuthor.save();

			res.send(savedAuthor);
		} catch (error) {
			next(error);
		}
	}
);

authorsRouter.get("/", async (req, res) => {
	try {
		const mongoQuery = query2Mongo(req.query);

		const total = await AuthorsModel.countDocuments(mongoQuery.criteria);

		if (!mongoQuery.options.skip) mongoQuery.options.skip = 0;

		if (!mongoQuery.options.limit || mongoQuery.options.limit > 10)
			mongoQuery.options.limit = 20;

		const authors = await AuthorsModel.find(
			mongoQuery.criteria,
			mongoQuery.options.fields
		)
			.skip(mongoQuery.options.skip)
			.limit(mongoQuery.options.limit)
			.sort(mongoQuery.options.sort);

		res.send({
			links: mongoQuery.links(`${process.env.Blogs_API}/blogPosts`, total),
			total,
			totalPages: Math.ceil(total / mongoQuery.options.limit),
			authors,
		});
	} catch (error) {
		next(error);
	}
});

// BLOGS
// Extra Features
// GET /authors/:id/blogPosts/ => get all the posts for an author with a given ID
authorsRouter.get("/:authorId/blogPosts", async (req, res) => {
	try {
		const blog = await BlogModel.findById(req.params.authorId);
		if (blog) {
			res.send(blog);
		} else {
			next(createError(404`User with id ${req.params.userId} not found`));
		}
	} catch (error) {
		next(error);
	}
});

authorsRouter.get("/:authorId", async (req, res) => {
	try {
		const author = await AuthorsModel.findById(req.params.authorId);
		if (author) {
			res.send(author);
		} else {
			next(createError(404`User with id ${req.params.userId} not found`));
		}
	} catch (error) {
		next(error);
	}
});

authorsRouter.put("/:authorId", async (req, res) => {
	try {
		const updateAuthor = await AuthorsModel.findByIdAndUpdate(
			req.params.authorId,
			req.body,
			{ new: true }
		);
		if (updateAuthor) {
			res.send(updateAuthor);
		} else {
			next(createError(404`User with id ${req.params.userId} not found`));
		}
	} catch (error) {
		next(error);
	}
});

authorsRouter.delete("/:authorId", async (req, res) => {
	try {
		const deleteAuthors = await AuthorsModel.findByIdAndDelete(
			req.params.authorId
		);
		if (deleteAuthors) {
			res.status(204).send();
		} else {
			next(createError(404`User with id ${req.params.userId} not found`));
		}
	} catch (error) {
		next(error);
	}
});

export default authorsRouter;
