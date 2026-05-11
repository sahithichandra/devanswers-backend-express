import { describe, it, expect, vi, beforeEach } from "vitest";
import * as questionService from "../../../src/services/questionService.js";
import Question from "../../../src/models/Question.js";
import Answer from "../../../src/models/Answer.js";
import Tag from "../../../src/models/Tag.js";
import { createAppError } from "../../../src/utils/createAppError.js";

vi.mock("../../../src/models/Question.js");
vi.mock("../../../src/models/Answer.js");
vi.mock("../../../src/models/Tag.js");

// Helper to reset mocks
function resetAllMocks() {
  vi.clearAllMocks();
}

describe("Question Service", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("getAllQuestionsService", () => {
    it("returns all questions with answerCount", async () => {
      Question.find.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([
          { _id: "q1", title: "Q1", author: { name: "A" }, tags: [] },
        ]),
      });
      Answer.aggregate.mockResolvedValue([{ _id: "q1", count: 2 }]);
      const result = await questionService.getAllQuestionsService();
      expect(result[0].answerCount).toBe(2);
    });
    it("throws 404 if no questions", async () => {
      Question.find.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      });
      await expect(questionService.getAllQuestionsService()).rejects.toThrow("No questions found");
    });
  });

  describe("getQuestionByIdService", () => {
    it("returns question with answers", async () => {
      // Mock Mongoose chainable populate
      const mockPopulate = vi.fn().mockReturnThis();
      const mockQuestion = {
        populate: mockPopulate,
        toObject: () => ({ _id: "q1", title: "Q1" })
      };
      Question.findByIdAndUpdate.mockReturnValueOnce(mockQuestion);
      Question.findById.mockReturnValueOnce({
        populate: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue(mockQuestion)
      });
      Answer.find.mockReturnValueOnce({ populate: vi.fn().mockResolvedValue([{ _id: "a1" }]) });
      const result = await questionService.getQuestionByIdService("q1");
      expect(result.answers).toBeDefined();
    });
    it("throws 404 if not found", async () => {
      // The service checks for null after findByIdAndUpdate
      Question.findByIdAndUpdate.mockReturnValueOnce(null);
      await expect(questionService.getQuestionByIdService("badid")).rejects.toThrow("Question not found");
    });
  });

  describe("createQuestionService", () => {
    it("creates and returns a question", async () => {
      Tag.findOne.mockResolvedValue({ _id: "t1", name: "js" });
      Question.create.mockResolvedValue({ _id: "q1" });
      // Mock chainable populate for findById
      const mockPopulate = vi.fn().mockReturnThis();
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        _id: "q1",
        title: "Q1"
      };
      // The service calls .populate().populate(), so we need to return the same object
      Question.findById.mockReturnValueOnce({
        populate: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue(mockQuery)
      });
      const result = await questionService.createQuestionService({ title: "Q1", description: "desc", tags: "js", author: "u1" });
      expect(result._id).toBe("q1");
    });
  });

  describe("updateQuestionService", () => {
    it("updates and returns a question if owner", async () => {
      // Mock author as object with toString
      const mockAuthor = { toString: () => "u1" };
      Question.findById.mockResolvedValueOnce({
        author: mockAuthor,
        save: vi.fn(),
        _id: "q1",
      });
      Tag.findOne.mockResolvedValue({ _id: "t1", name: "js" });
      // Mock chainable populate for findById
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        _id: "q1",
        title: "Q1"
      };
      Question.findById.mockReturnValueOnce({
        populate: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue(mockQuery)
      });
      const result = await questionService.updateQuestionService({ id: "q1", title: "Q1", description: "desc", tags: "js", loggedInUser: { id: "u1", isAdmin: false } });
      expect(result._id).toBe("q1");
    });
    it("throws 404 if not found", async () => {
      Question.findById.mockResolvedValue(null);
      await expect(questionService.updateQuestionService({ id: "badid", title: "", description: "", tags: "", loggedInUser: { id: "u1", isAdmin: false } })).rejects.toThrow("Question not found");
    });
    it("throws 403 if not owner or admin", async () => {
      Question.findById.mockResolvedValue({ author: "u2" });
      await expect(questionService.updateQuestionService({ id: "q1", title: "", description: "", tags: "", loggedInUser: { id: "u1", isAdmin: false } })).rejects.toThrow("Not authorized");
    });
  });

  describe("deleteQuestionService", () => {
    it("deletes question and answers if owner", async () => {
      Question.findById.mockResolvedValue({ author: "u1", deleteOne: vi.fn() });
      Answer.deleteMany.mockResolvedValue({});
      const result = await questionService.deleteQuestionService({ id: "q1", loggedInUser: { id: "u1", isAdmin: false } });
      expect(result.message).toMatch(/deleted/);
    });
    it("throws 404 if not found", async () => {
      Question.findById.mockResolvedValue(null);
      await expect(questionService.deleteQuestionService({ id: "badid", loggedInUser: { id: "u1", isAdmin: false } })).rejects.toThrow("Question not found");
    });
    it("throws 403 if not owner or admin", async () => {
      Question.findById.mockResolvedValue({ author: "u2" });
      await expect(questionService.deleteQuestionService({ id: "q1", loggedInUser: { id: "u1", isAdmin: false } })).rejects.toThrow("Not authorized");
    });
  });
});
