import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Tag from "../models/Tag.js";
import User from "../models/User.js";
import { createAppError } from "../utils/createAppError.js";
import { handleVote } from "./voteService.js";

// Helper to resolve tag names to IDs (creates tags if missing)
async function resolveTagIds(tagString) {
	const tagNames = tagString
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);
	const tagIds = [];
	for (const name of tagNames) {
		let tag = await Tag.findOne({ name });
		if (!tag) {
			tag = await Tag.create({ name });
		}
		tagIds.push(tag._id);
	}
	return tagIds;
}

export async function getAllQuestionsService() {
	const questions = await Question.find()
		.populate("author", "name")
		.populate("tags", "name")
		.lean();
	if (!questions || questions.length === 0) {
		throw createAppError("No questions found", 404);
	}
	// Attach answerCount to each question
	const questionIds = questions.map(q => q._id);
	const answerCounts = await Answer.aggregate([
		{ $match: { questionId: { $in: questionIds } } },
		{ $group: { _id: "$questionId", count: { $sum: 1 } } }
	]);
	const countMap = {};
	answerCounts.forEach((ac) => {
		countMap[ac._id.toString()] = ac.count;
	});
	questions.forEach((q) => {
		q.answerCount = countMap[q._id.toString()] || 0;
	});
	return questions;
}

export async function getQuestionByIdService(id) {
	let question = await Question.findByIdAndUpdate(
		id,
		{ $inc: { views: 1 } },
		{ new: true }
	);
	if (!question) {
		throw createAppError("Question not found", 404);
	}
	question = await Question.findById(id)
		.populate("author", "name")
		.populate("tags", "name");
	const answers = await Answer.find({ questionId: id }).populate("author", "name");
	const qObj = question.toObject();
	qObj.answers = answers;
	return qObj;
}

export async function createQuestionService({ title, description, tags, author }) {
	const tagIds = await resolveTagIds(tags);
	const question = await Question.create({
		title,
		description,
		tags: tagIds,
		author
	});
	return await Question.findById(question._id)
		.populate("author", "name")
		.populate("tags", "name");
}

export async function updateQuestionService({ id, title, description, tags, loggedInUser }) {
	const question = await Question.findById(id);
	if (!question) {
		throw createAppError("Question not found", 404);
	}
	// Ownership or admin check
	if (question.author.toString() !== loggedInUser.id && !loggedInUser.isAdmin) {
		throw createAppError("Not authorized to update this question", 403);
	}
	const tagIds = await resolveTagIds(tags);
	question.title = title;
	question.description = description;
	question.tags = tagIds;
	await question.save();
	return await Question.findById(id)
		.populate("author", "name")
		.populate("tags", "name");
}

export async function deleteQuestionService({ id, loggedInUser }) {
	const question = await Question.findById(id);
	if (!question) {
		throw createAppError("Question not found", 404);
	}
	// Ownership or admin check
	if (question.author.toString() !== loggedInUser.id && !loggedInUser.isAdmin) {
		throw createAppError("Not authorized to delete this question", 403);
	}
	await Answer.deleteMany({ questionId: id });
	await question.deleteOne();
	return { message: "Question and its answers deleted" };
}

export async function upvoteQuestionService({ questionId, userId }) {
	const updated = await handleVote(Question, questionId, userId, "upvote");
	if (!updated) {
		throw createAppError("Unable to upvote question", 400);
	}
	return updated;
}

export async function downvoteQuestionService({ questionId, userId }) {
	const updated = await handleVote(Question, questionId, userId, "downvote");
	if (!updated) {
		throw createAppError("Unable to downvote question", 400);
	}
	return updated;
}