const http = require('http');

const request = (url, opts = {}) =>
  new Promise((resolve, reject) => {
    const body = opts.body ? JSON.stringify(opts.body) : null;
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const r = http.request(url, { method: opts.method || 'GET', headers }, (resp) => {
      let raw = '';
      resp.on('data', (c) => (raw += c));
      resp.on('end', () => {
        try {
          resolve({ status: resp.statusCode, body: raw ? JSON.parse(raw) : {} });
        } catch (e) {
          resolve({ status: resp.statusCode, body: raw });
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });

(async () => {
  try {
    console.log('--- Employee permission smoke tests ---');
    const empEmail = 'empperms' + Date.now() + '@example.com';
    const empPass = 'Employee123!';

    // create employee user
    let r = await request('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      body: { name: 'Perm Employee', email: empEmail, password: empPass, role: 'Employee' },
    });
    console.log('register', r.status);

    // create admin user to create Employee doc
    const adminEmail = 'permadmin' + Date.now() + '@example.com';
    const adminPass = 'Admin123!';
    r = await request('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      body: { name: 'Perm Admin', email: adminEmail, password: adminPass, role: 'Admin' },
    });
    console.log('admin register', r.status);

    r = await request('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: adminPass },
    });
    const adminToken = r.body && r.body.token;
    console.log('admin login', r.status);

    // create employee record via admin
    r = await request('http://127.0.0.1:5000/api/employees', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: { name: 'Perm Employee', email: empEmail, department: 'HR', createLogin: false },
    });
    console.log('create employee record', r.status);

    // login as employee
    r = await request('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      body: { email: empEmail, password: empPass },
    });
    console.log('login', r.status);
    const token = r.body && r.body.token;
    if (!token) {
      console.error('No token; aborting');
      return;
    }
    const auth = { Authorization: 'Bearer ' + token };

    const endpointsAllowed = [
      ['GET', '/api/dashboard'],
      ['GET', '/api/tasks'],
      ['GET', '/api/attendance'],
      ['POST', '/api/attendance', { employee: null, date: new Date().toISOString().slice(0, 10), checkIn: '09:00' }],
      ['GET', '/api/leaves'],
      ['POST', '/api/leaves', { startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), reason: 'Test', type: 'Paid' }],
      ['GET', '/api/salary'],
      ['GET', '/api/auth/profile'],
      ['GET', '/api/notifications'],
    ];

    for (const e of endpointsAllowed) {
      const method = e[0];
      const path = e[1];
      const body = e[2] || null;
      const resp = await request('http://127.0.0.1:5000' + path, { method, headers: Object.assign({}, { 'Content-Type': 'application/json' }, auth), body });
      console.log(method, path, '->', resp.status);
    }

    const endpointsAdmin = [
      ['POST', '/api/employees', { name: 'X', email: 'x' + Date.now() + '@ex.com', department: 'Ops', createLogin: false }],
      ['GET', '/api/employees'],
      ['POST', '/api/departments', { name: 'D' + Date.now() }],
      ['PUT', '/api/attendance/000000000000000000000000', { status: 'Present' }],
      ['PUT', '/api/settings', { monthlyLeaveLimit: 1 }],
    ];

    for (const e of endpointsAdmin) {
      const method = e[0];
      const path = e[1];
      const body = e[2] || null;
      const resp = await request('http://127.0.0.1:5000' + path, { method, headers: Object.assign({}, { 'Content-Type': 'application/json' }, auth), body });
      console.log(method, path, '->', resp.status);
    }
  } catch (err) {
    console.error(err);
  }
})();
