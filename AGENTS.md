# DevAnswers Backend Agent Instructions

## Project Overview
DevAnswers is a Q&A platform for developers. This backend provides RESTful APIs for questions, answers, voting, and user authentication. The codebase uses Express, Mongoose, and custom error handling. Authentication and tag scaffolding are provided.

## Implementation Guidelines
- All service and controller functions must be async.
- Use the provided `createAppError` utility for error handling (404, 403, 400, etc.).
- Populate referenced fields (author, tags) as required.
- For ownership checks, allow if the user is the owner or has `role: 'admin'`.
- Accept tags as comma-separated strings, resolve to tag IDs, and create tags if missing.
- For voting, use `voteService.handleVote` and throw a 400 error if the operation fails.
- Controllers should not handle errors directly; let them propagate to error middleware.
- All successful responses must have the structure:
  ```json
  {
    "success": true,
    "message": "Descriptive success message",
    "data": {} // or []
  }
  ```
- For create endpoints, respond with status 201 and include the created resource in `data`.
- Use the `authenticate` middleware for protected routes.

## File Responsibilities
- `src/services/questionService.js`: All question CRUD, voting, and ownership logic.
- `src/services/answerService.js`: All answer CRUD, voting, and ownership logic.
- `src/controllers/questionController.js`: Maps request/response for questions.
- `src/controllers/answerController.js`: Maps request/response for answers.
- `src/routes/questions.js`: Public and protected question/answer endpoints.
- `src/routes/answers.js`: Protected answer endpoints.
- `src/routes/index.js`: Mounts all routers.
- `tests/unit/services/questionService.test.js`: Unit tests for question service.
- `tests/integration/questions.test.js`: Integration tests for questions API.

## Testing
- Write at least 3 test cases per endpoint/service function.
- Cover both success and error cases.
- Use a custom agent for test generation: `.github/agents/backend-testing-agent.agent.md`.

## Conventions
- Use async/await for all DB operations.
- Use Mongoose population for referenced fields.
- Always check for resource existence and permissions before mutating data.
- Use descriptive messages in all responses and errors.

---
Proprietary content. © Great Learning. All Rights Reserved. Unauthorized use or distribution is prohibited.
