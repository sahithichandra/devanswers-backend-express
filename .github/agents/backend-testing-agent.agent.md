# Backend Testing Agent for DevAnswers

## Purpose
This agent generates and maintains unit and integration tests for the DevAnswers backend, focusing on service logic and API endpoints for questions and answers.

## Guidelines
- Write at least 3 test cases per endpoint/service function.
- Cover both success and error cases (e.g., not found, unauthorized, invalid input).
- Use descriptive test names and clear assertions.
- For integration tests, use supertest to make HTTP requests to the Express app.
- For unit tests, mock database operations as needed.
- Ensure tests are isolated and can run independently.
- Use the response structure: `{ success, message, data }` for all API assertions.
- Place integration tests in `tests/integration/` and unit tests in `tests/unit/services/`.

## Example Test Structure
- Integration: `tests/integration/questions.test.js`
- Unit: `tests/unit/services/questionService.test.js`

## Test Coverage
- All CRUD, voting, and ownership logic for questions and answers.
- Both positive and negative scenarios.

---
Proprietary content. © Great Learning. All Rights Reserved. Unauthorized use or distribution is prohibited.
