#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WEBSITE_DIR = path.join(ROOT_DIR, 'website');
const DATA_DIR = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tracker-data.json');
const PORT = Number(process.argv[2] || process.env.PORT || 8000);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
};

async function ensureDataDir() {
    await fsp.mkdir(DATA_DIR, { recursive: true });
}

function sendJson(res, statusCode, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store',
    });
    res.end(body);
}

function sendText(res, statusCode, text) {
    res.writeHead(statusCode, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': Buffer.byteLength(text),
    });
    res.end(text);
}

async function readBody(req, maxBytes = 2 * 1024 * 1024) {
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
        total += chunk.length;
        if (total > maxBytes) throw new Error('Payload too large');
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
}

function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

async function handleApi(req, res, pathname) {
    if (pathname === '/api/health' && req.method === 'GET') {
        return sendJson(res, 200, { ok: true, service: 'rippedmechanics-backend' });
    }

    if (pathname === '/api/tracker-data' && req.method === 'GET') {
        if (!fs.existsSync(DATA_FILE)) {
            return sendJson(res, 404, { error: 'No tracker data found yet' });
        }
        try {
            const raw = await fsp.readFile(DATA_FILE, 'utf8');
            const payload = JSON.parse(raw);
            return sendJson(res, 200, payload);
        } catch (error) {
            return sendJson(res, 500, { error: `Failed to read tracker data: ${error.message}` });
        }
    }

    if (pathname === '/api/tracker-data' && (req.method === 'POST' || req.method === 'PUT')) {
        try {
            const rawBody = await readBody(req);
            const parsed = JSON.parse(rawBody || '{}');
            const data = isPlainObject(parsed?.data) ? parsed.data : parsed;
            if (!isPlainObject(data)) {
                return sendJson(res, 400, { error: 'Request body must be a JSON object or { data: object }' });
            }

            await ensureDataDir();
            const payload = {
                updatedAt: new Date().toISOString(),
                data,
            };
            await fsp.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
            return sendJson(res, 200, { ok: true, updatedAt: payload.updatedAt });
        } catch (error) {
            const status = error.message === 'Payload too large' ? 413 : 400;
            return sendJson(res, status, { error: error.message });
        }
    }

    return sendJson(res, 404, { error: 'API route not found' });
}

async function handleStatic(req, res, pathname) {
    let requestedPath = pathname === '/' ? '/index.html' : pathname;
    requestedPath = requestedPath.replace(/^\/+/, '/');

    const filePath = path.join(WEBSITE_DIR, requestedPath);
    if (!filePath.startsWith(WEBSITE_DIR)) {
        return sendText(res, 403, 'Forbidden');
    }

    try {
        let stat = await fsp.stat(filePath);
        let finalPath = filePath;

        if (stat.isDirectory()) {
            finalPath = path.join(filePath, 'index.html');
            stat = await fsp.stat(finalPath);
        }

        const ext = path.extname(finalPath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        const stream = fs.createReadStream(finalPath);
        res.writeHead(200, {
            'Content-Type': mime,
            'Content-Length': stat.size,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
        });
        stream.pipe(res);
        stream.on('error', () => sendText(res, 500, 'Internal server error'));
    } catch {
        sendText(res, 404, 'Not found');
    }
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith('/api/')) {
        return handleApi(req, res, pathname);
    }
    return handleStatic(req, res, pathname);
});

server.listen(PORT, async () => {
    await ensureDataDir();
    console.log(`RippedMechanics backend + website running at http://localhost:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
});
