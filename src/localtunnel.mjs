import localtunnel from 'localtunnel';

export async function LocalTunnel(port, subdomain) {
    let closePromiseResolve;
    const closePromise = new Promise(resolve => {
        closePromiseResolve = resolve;
    });

    const tunnel = await localtunnel({ port, subdomain });

    tunnel.on('close', () => {
        console.log('> tunnel closed');
        closePromiseResolve();
    });

    tunnel.on('error', (err) => {
        console.error('> tunnel error:', err);
        process.exit(1);
    });

    return {
        url: tunnel.url,
        close: () => {
            tunnel.close();
            return closePromise;
        }
    };
}
