const request = require('supertest');  // Library for making HTTP requests
const app = require('../app');  // Path to your Express app

test('GET /users returns a list of users', async () => {
  const response = await request(app).get('/users');
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual(expectedUserList); // Expected response data
});
