import * as answerService from "../services/answerService.js";

export async function getAnswersByQuestionId(req, res) {
	const { questionId } = req.params;
	const answers = await answerService.getAnswersByQuestionIdService(questionId);
	res.json({
		success: true,
		message: "Answers fetched successfully",
		data: answers,
	});
}

export async function createAnswer(req, res) {
	const { questionId } = req.params;
	const { answerText } = req.body;
	const author = req.user.id;
	const answer = await answerService.createAnswerService({
		questionId,
		answerText,
		author,
	});
	res.status(201).json({
		success: true,
		message: "Answer created successfully",
		data: answer,
	});
}

export async function updateAnswer(req, res) {
	const { answerId } = req.params;
	const { answerText } = req.body;
	const updated = await answerService.updateAnswerService({
		answerId,
		answerText,
		loggedInUser: req.user,
	});
	res.json({
		success: true,
		message: "Answer updated successfully",
		data: updated,
	});
}

export async function deleteAnswer(req, res) {
	const { answerId } = req.params;
	await answerService.deleteAnswerService({
		answerId,
		loggedInUser: req.user,
	});
	res.json({
		success: true,
		message: "Answer deleted successfully",
	});
}

export async function upvoteAnswer(req, res) {
	const { answerId } = req.params;
	const userId = req.user.id;
	const updated = await answerService.upvoteAnswerService({
		answerId,
		userId,
	});
	res.json({
		success: true,
		message: "Answer upvoted successfully",
		data: updated,
	});
}

export async function downvoteAnswer(req, res) {
	const { answerId } = req.params;
	const userId = req.user.id;
	const updated = await answerService.downvoteAnswerService({
		answerId,
		userId,
	});
	res.json({
		success: true,
		message: "Answer downvoted successfully",
		data: updated,
	});
}