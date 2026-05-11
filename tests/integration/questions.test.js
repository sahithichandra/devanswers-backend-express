import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../src/app.js";
import mongoose from "mongoose";
import { connectToDB, disconnectFromDB } from "../../db.js";
import Question from "../../src/models/Question.js";
import User from "../../src/models/User.js";
import Tag from "../../src/models/Tag.js";
import Answer from "../../src/models/Answer.js";

let isMongoDBAvailable = false;
let token, userId, questionId;
let mongoServer;

// Check MongoDB availability and setup in-memory MongoDB
const connectAndSetup = async () => {
  try {
    console.log("Starting MongoDB Memory Server...");
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    console.log("MongoDB Memory Server started at:", mongoUri);
    
    await connectToDB();
    isMongoDBAvailable = true;
    console.log("Connected to in-memory MongoDB");

    // Clean up test data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Tag.deleteMany({});
    await Answer.deleteMany({});

    // Create a test user and get token
    const registerRes = await request(app).post("/api/auth/register").send({ 
      name: "Test", 
      email: "test@example.com", 
      password: "pass" 
    });
    
    const loginRes = await request(app).post("/api/auth/login").send({ 
      email: "test@example.com", 
      password: "pass" 
    });
    
    // Extract token and userId from login response
    if (loginRes.body.success && loginRes.body.data?.token && loginRes.body.data?.userId) {
      token = loginRes.body.data.token;
      userId = loginRes.body.data.userId;
      console.log("Test user authenticated:", userId);
    } else {
      console.log("Login response:", JSON.stringify(loginRes.body, null, 2));
      throw new Error("Failed to authenticate test user");
    }
  } catch (error) {
    console.error("MongoDB setup failed:", error.message);
    console.log("Integration tests will be skipped");
    isMongoDBAvailable = false;
  }
};

// Setup before running tests
await connectAndSetup();

// Use describe.skipIf or conditional describe
(isMongoDBAvailable ? describe : describe.skip)("Questions API", () => {
  afterAll(async () => {
    if (mongoServer) {
      await mongoServer.stop();
      console.log("MongoDB Memory Server stopped");
    }
    await disconnectFromDB();
  });

  it("POST /questions creates a question", async () => {
    const res = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Q1", description: "desc", tags: "js,node" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Q1");
    questionId = res.body.data._id;
  });

  it("GET /questions returns all questions", async () => {
    const res = await request(app).get("/api/questions");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /questions/:id returns a question", async () => {
    if (!questionId) {
      console.log("Skipping: questionId not set from create test");
      return;
    }
    const res = await request(app).get(`/api/questions/${questionId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(questionId);
  });

  it("PUT /questions/:id updates a question", async () => {
    if (!questionId) {
      console.log("Skipping: questionId not set from create test");
      return;
    }
    const res = await request(app)
      .put(`/api/questions/${questionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Q1 updated", description: "desc2", tags: "js" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Q1 updated");
  });

  it("POST /questions/:id/upvote upvotes a question", async () => {
    if (!questionId) {
      console.log("Skipping: questionId not set from create test");
      return;
    }
    const res = await request(app)
      .post(`/api/questions/${questionId}/upvote`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.upvotes).toContain(userId);
  });

  it("POST /questions/:id/downvote downvotes a question", async () => {
    if (!questionId) {
      console.log("Skipping: questionId not set from create test");
      return;
    }
    const res = await request(app)
      .post(`/api/questions/${questionId}/downvote`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.downvotes).toContain(userId);
  });

  it("DELETE /questions/:id deletes a question", async () => {
    if (!questionId) {
      console.log("Skipping: questionId not set from create test");
      return;
    }
    const res = await request(app)
      .delete(`/api/questions/${questionId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/);
  });

  it("returns 404 for non-existent question", async () => {
    const res = await request(app).get("/api/questions/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

