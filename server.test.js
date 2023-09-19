const request = require('supertest');
const app = require('./server');

describe('GET /api/search', () => {
  it('responds with JSON data and 200 status code', async () => {
    const response = await request(app).get('/api/search?term=test&entity=song');
    
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('application/json');
  });

  it('responds with an array of search results', async () => {
    const response = await request(app).get('/api/search?term=test&entity=song');
    
    expect(Array.isArray(response.body)).toBe(true);
  });
});
