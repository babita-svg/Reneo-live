import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app';

describe('Backend API /api/agora-token Security Controls', () => {
  it('returns 400 Bad Request when sessionId is missing', async () => {
    const res = await request(app)
      .post('/api/agora-token')
      .send({ channelName: 'test-channel' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('sessionId is required');
  });

  it('returns 500 when AGORA credentials are not configured on server', async () => {
    // If environment variables AGORA_APP_ID or AGORA_APP_CERTIFICATE are missing
    delete process.env.AGORA_APP_ID;
    delete process.env.AGORA_APP_CERTIFICATE;

    const res = await request(app)
      .post('/api/agora-token')
      .send({ sessionId: 'session-101', channelName: 'test-channel' });

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Agora RTC credentials missing');
  });

  it('returns 401 Unauthorized when authorization token is omitted', async () => {
    process.env.AGORA_APP_ID = 'test_app_id';
    process.env.AGORA_APP_CERTIFICATE = 'test_app_certificate';

    const res = await request(app)
      .post('/api/agora-token')
      .send({ sessionId: 'session-101', channelName: 'test-channel' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns healthcheck status 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Reneo Live Server');
  });
});
