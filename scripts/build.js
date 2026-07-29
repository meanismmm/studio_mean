const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const client = path.join(dist, 'client');
const server = path.join(dist, 'server');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(client, { recursive: true });
fs.mkdirSync(server, { recursive: true });
for (const name of ['index.html', 'css', 'js']) fs.cpSync(path.join(root, name), path.join(client, name), { recursive: true });
fs.copyFileSync(path.join(root, 'worker', 'index.js'), path.join(server, 'index.js'));
console.log('Built dist/client and dist/server/index.js');
