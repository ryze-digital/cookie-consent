import fs from 'fs';

if (fs.existsSync('dist')) {
    fs.rmdirSync('dist', { recursive: true });
}