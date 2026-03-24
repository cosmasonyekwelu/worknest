import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health is 200': (r) => r.status === 200,
  });

  const jobsRes = http.get(`${BASE_URL}/api/v1/jobs?limit=10&page=1`);
  check(jobsRes, {
    'jobs list ok': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
