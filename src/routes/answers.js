import express from "express";
import authenticate from "../middleware/authHandler.js";
import * as answerController from "../controllers/answerController.js";

const router = express.Router();

// Protected routes
router.put("/:answerId", authenticate, answerController.updateAnswer);
router.delete("/:answerId", authenticate, answerController.deleteAnswer);
router.post("/:answerId/upvote", authenticate, answerController.upvoteAnswer);
router.post("/:answerId/downvote", authenticate, answerController.downvoteAnswer);

export default router;
