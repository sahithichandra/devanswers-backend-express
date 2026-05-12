import Answer from "../models/answer.js";
import Question from "../models/question.js";
import User from "../models/user.js";
import { createAppError } from "../utils/createAppError.js";
import { handleVote } from "./voteService.js";

export async function getAnswersByQuestionIdService(questionId) {
	const answers = await Answer.find({ questionId })
		.populate("author", "name");
	if (!answers || answers.length === 0) {
		throw createAppError("No answers found for this question", 404);
	}
	return answers;
}

export async function createAnswerService({ questionId, answerText, author }) {
	// Ensure question exists
	const question = await Question.findById(questionId);
	if (!question) {
		throw createAppError("Question not found", 404);
	}
	const answer = await Answer.create({ questionId, answerText, author });
	return await Answer.findById(answer._id).populate("author", "name");
}

export async function updateAnswerService({ answerId, answerText, loggedInUser }) {
	const answer = await Answer.findById(answerId);
	if (!answer) {
		throw createAppError("Answer not found", 404);
	}
	// Ownership or admin check
	if (answer.author.toString() !== loggedInUser.id && !loggedInUser.isAdmin) {
		throw createAppError("Not authorized to update this answer", 403);
	}
	answer.answerText = answerText;
	await answer.save();
	return await Answer.findById(answerId).populate("author", "name");
}

export async function deleteAnswerService({ answerId, loggedInUser }) {
	const answer = await Answer.findById(answerId);
	if (!answer) {
		throw createAppError("Answer not found", 404);
	}
	// Ownership or admin check
	if (answer.author.toString() !== loggedInUser.id && !loggedInUser.isAdmin) {
		throw createAppError("Not authorized to delete this answer", 403);
	}
	await answer.deleteOne();
	return { message: "Answer deleted" };
}

export async function upvoteAnswerService({ answerId, userId }) {
	const updated = await handleVote(Answer, answerId, userId, "upvote");
	if (!updated) {
		throw createAppError("Unable to upvote answer", 400);
	}
	return updated;
}

export async function downvoteAnswerService({ answerId, userId }) {
	const updated = await handleVote(Answer, answerId, userId, "downvote");
	if (!updated) {
		throw createAppError("Unable to downvote answer", 400);
	}
	return updated;
}