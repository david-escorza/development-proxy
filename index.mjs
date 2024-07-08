import express from 'express';
import crypto from 'crypto';

const app = express()
app.use(express.raw({ type: '*/*' }));
app.use(express.json({limit: '200mb'}))
app.use(express.urlencoded({ extended: true, limit: '200mb' }))

const port = 3000
const apiUrl = 'http://api.dg1.test'

const forwardRequest = async (req, res, method) => {
    logRequest(req);

    const targetFullUrl = new URL(req.originalUrl, apiUrl);
    try {
        let requestBody;
        let contentLength;

        if (method === 'POST') {
            if (Buffer.isBuffer(req.body)) {
                requestBody = req.body;
                contentLength = req.body.length;
            } else if (typeof req.body === 'string') {
                requestBody = req.body;
                contentLength = Buffer.byteLength(req.body);
            } else {
                requestBody = JSON.stringify(req.body);
                contentLength = Buffer.byteLength(requestBody);
            }
        }

        const headers = {
            ...req.headers,
            host: new URL(apiUrl).host,
        };
        if (method === 'POST') {
            headers['Content-Length'] = contentLength;
        }

        const response = await fetch(targetFullUrl, {
            method: method,
            headers: headers,
            body: method === 'POST' ? requestBody : undefined,
            redirect: 'manual'
        });

        console.log('RESPONSE STATUS:', response.status);

        if ([301, 302, 303, 307, 308].includes(response.status)) {
            const location = response.headers.get('Location');
            console.log('Redirect to:', location);
            res.redirect(response.status, location);
        } else {
            const responseBody = await response.text();
            res.status(response.status);
            res.set({
                ...response.headers,
                'content-length': responseBody.length
            });
            res.send(responseBody);
        }
    } catch (error) {
        console.error('Error forwarding request:', error);
        res.status(500).send('Internal Server Error');
    }
};

app.all('*', (req, res) => {
    if (req.method === 'GET' || req.method === 'POST') {
        forwardRequest(req, res, req.method);
    } else {
        res.status(405).send('Method Not Allowed');
    }
});

app.listen(port, () => {
    console.log(`Proxy listening on port ${port}`)
});

const logRequest = (req) => {
    console.log('');
    console.log('METHOD:', req.method);
    console.log('PATH:', req.path);
    console.log('HEADERS:', req.headers);
    console.log('QUERY:', req.query);
    console.log('BODY:', req.body);
}