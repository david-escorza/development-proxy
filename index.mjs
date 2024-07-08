import express from 'express';
import crypto from 'crypto';

const app = express()
app.use(express.raw({ type: '*/*' }));
app.use(express.json({limit: '200mb'}))
app.use(express.urlencoded({ extended: true, limit: '200mb' }))

const port = 3000
const apiUrl = 'http://api.dg1.test'

app.get('/openid/login', async (req, res) => {
    logRequest(req);

    const targetFullUrl = new URL(req.originalUrl, apiUrl);
    try {
        const response = await fetch(targetFullUrl, {
            method: 'GET'
        });
        const responseBody = await response.text();
        res.status(response.status);
        res.set({
            ...response.headers,
            'content-length': responseBody.length
        });
        res.send(responseBody);
    } catch (error) {
        console.error('Error forwarding request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/openid/authorize', async (req, res) => {
    logRequest(req);

    const targetFullUrl = new URL(req.originalUrl, apiUrl);
    try {
        const response = await fetch(targetFullUrl, {
            method: 'POST',
            headers: {
                ...req.headers,
                host: new URL(apiUrl).host,
                'Content-Length': Buffer.byteLength(req.body)
            },
            body: req.body, // Directly use req.body
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