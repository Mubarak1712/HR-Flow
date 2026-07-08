const http = require('http');

function request(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : {} });
          } catch (err) {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const loginRes = await request('/api/auth/login', 'POST', {
    email: 'verify@example.com',
    password: 'Password123!',
  });
  const token = loginRes.body.token;
  console.log('LOGIN', loginRes.status, loginRes.body.message);

  const createRes = await request(
    '/api/employees',
    'POST',
    {
      name: 'Live Employee',
      email: 'live.employee@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 60000,
      role: 'Employee',
    },
    token
  );
  console.log('CREATE', createRes.status, JSON.stringify(createRes.body));
  const createdId = createRes.body.employee && (createRes.body.employee._id || createRes.body.employee.id);

  const listRes = await request('/api/employees', 'GET', null, token);
  console.log('LIST', listRes.status, listRes.body.message, Array.isArray(listRes.body.employees) ? listRes.body.employees.length : 'n/a');

  const getRes = await request(`/api/employees/${createdId}`, 'GET', null, token);
  console.log('GET', getRes.status, JSON.stringify(getRes.body));

  const updateRes = await request(`/api/employees/${createdId}`, 'PUT', { position: 'Senior Developer' }, token);
  console.log('UPDATE', updateRes.status, JSON.stringify(updateRes.body));

  const deleteRes = await request(`/api/employees/${createdId}`, 'DELETE', null, token);
  console.log('DELETE', deleteRes.status, JSON.stringify(deleteRes.body));
})();
