import express from "express";
import authenticate from "../middleware/authHandler.js";
import * as questionController from "../controllers/questionController.js";
import * as answerController from "../controllers/answerController.js";

const router = express.Router();

// Public routes
router.get("/", questionController.getAllQuestions);
router.get("/:id", questionController.getQuestionById);
router.get("/:questionId/answers", answerController.getAnswersByQuestionId);

// Protected routes
router.post("/", authenticate, questionController.createQuestion);
router.put("/:id", authenticate, questionController.updateQuestion);
router.delete("/:id", authenticate, questionController.deleteQuestion);
router.post("/:id/upvote", authenticate, questionController.upvoteQuestion);
router.post("/:id/downvote", authenticate, questionController.downvoteQuestion);
router.post("/:questionId/answers", authenticate, answerController.createAnswer);

export default router;
