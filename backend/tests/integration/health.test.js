const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/health - Foundation Health Check Endpoint', () => {
  it('should return 200 with standard healthcheck data envelope', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'ok');
    expect(response.body.data).toHaveProperty('service', 'placement-tracker-backend');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('database');
    expect(response.body).toHaveProperty('error', null);
  });

  it('should return 404 with standard error envelope for undefined endpoints', async () => {
    const response = await request(app).get('/api/undefined-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('data', null);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'RESOURCE_NOT_FOUND');
  });
});
