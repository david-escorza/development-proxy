import express from 'express';

const forwardRequest = async (req, res, upstream) => {
    logRequest(req);

    const targetFullUrl = new URL(req.originalUrl, upstream);
    try {
        let requestBody;
        let contentLength;

        if (req.method === 'POST') {
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
            host: new URL(upstream).host,
        };
        if (req.method === 'POST') {
            headers['Content-Length'] = contentLength;
        }

        const response = await fetch(targetFullUrl, {
            method: req.method,
            headers: headers,
            body: req.method === 'POST' ? requestBody : undefined,
            redirect: 'manual'
        });

        console.log('> RESPONSE STATUS:', response.status);

        if ([301, 302, 303, 307, 308].includes(response.status)) {
            const location = response.headers.get('Location');
            console.log('> redirect to:', location);
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
        console.error('> error forwarding request:', error);
        res.status(500).send('Internal Proxy Error');
    }
};

const logRequest = (req) => {
    console.log('=============================================');
    console.log('=============================================');
    console.log('METHOD:', req.method);
    console.log('PATH:', req.path);
    console.log('HEADERS:', req.headers);
    console.log('QUERY:', req.query);
    console.log('BODY:', req.body);
    console.log('');
}

export async function Proxy(port, upstream) {
    // Start promise
    let startPromiseResolve;
    const startPromise = new Promise(resolve => {
        startPromiseResolve = resolve;
    });
    const returnPromise = {
        port,
        upstreamUrl: upstream,
        close: () => {}
    }

    // Close promise
    let closePromiseResolve;
    const closePromise = new Promise(resolve => {
        closePromiseResolve = resolve;
    });

    // Proxy app
    const app = express();

    app.use(express.raw({ type: '*/*' }));
    app.use(express.json({limit: '200mb'}));
    app.use(express.urlencoded({ extended: true, limit: '200mb' }));

    app.all('*', (req, res) => {
        if (req.method === 'GET' || req.method === 'POST') {
            forwardRequest(req, res, upstream);
        } else {
            res.status(405).send('Method Not Allowed');
        }
    });

    const server = app.listen(port, (err) => {
        if (err) {
            console.error('> error starting proxy:', err);
            process.exit(1);
        }
        startPromiseResolve(returnPromise);
    });

    server.on('close', () => {
        console.error('> proxy closed');
        closePromiseResolve();
    })

    // Handle closing
    returnPromise.close = () => {
        server.close();
        return closePromise;
    }

    return startPromise;
}