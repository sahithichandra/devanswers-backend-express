import * as questionService from "../services/questionService.js";
import * as answerService from "../services/answerService.js";

export async function getAllQuestions(req, res) {
	const questions = await questionService.getAllQuestionsService();
	res.json({
		success: true,
		message: "Questions fetched successfully",
		data: questions,
	});
}

export async function getQuestionById(req, res) {
	const { id } = req.params;
	const question = await questionService.getQuestionByIdService(id);
	res.json({
		success: true,
		message: "Question fetched successfully",
		data: question,
	});
}

export async function createQuestion(req, res) {
	const { title, description, tags } = req.body;
	const author = req.user.id;
	const question = await questionService.createQuestionService({
		title,
		description,
		tags,
		author,
	});
	res.status(201).json({
		success: true,
		message: "Question created successfully",
		data: question,
	});
}

export async function updateQuestion(req, res) {
	const { id } = req.params;
	const { title, description, tags } = req.body;
	const updated = await questionService.updateQuestionService({
		id,
		title,
		description,
		tags,
		loggedInUser: req.user,
	});
	res.json({
		success: true,
		message: "Question updated successfully",
		data: updated,
	});
}

export async function deleteQuestion(req, res) {
	const { id } = req.params;
	await questionService.deleteQuestionService({
		id,
		loggedInUser: req.user,
	});
	res.json({
		success: true,
		message: "Question and its answers deleted",
	});
}

export async function upvoteQuestion(req, res) {
	const { id } = req.params;
	const userId = req.user.id;
	const updated = await questionService.upvoteQuestionService({
		questionId: id,
		userId,
	});
	res.json({
		success: true,
		message: "Question upvoted successfully",
		data: updated,
	});
}

export async function downvoteQuestion(req, res) {
	const { id } = req.params;
	const userId = req.user.id;
	const updated = await questionService.downvoteQuestionService({
		questionId: id,
		userId,
	});
	res.json({
		success: true,
		message: "Question downvoted successfully",
		data: updated,
	});
}

export async function getAnswersByQuestionId(req, res) {
	const { questionId } = req.params;
	const answers = await answerService.getAnswersByQuestionIdService(questionId);
	res.json({
		success: true,
		message: "Answers fetched successfully",
		data: answers,
	});
}
