import packageJson from './package.json' with { type: 'json' };
import { Proxy } from './src/proxy.mjs';
import { SSHTunnel } from './src/ssh-tunnel.mjs';
import { SetupShutdown } from './src/shutdown.mjs';
import { LocalTunnel } from './src/localtunnel.mjs';

console.log(`Dev-Proxy v${packageJson.version}`);

const port = process.env.PROXY_PORT || 3000;
const subdomain = process.env.PROXY_SUBDOMAIN || 'dg1-proxy-api';
const upstreamUrl = process.env.PROXY_UPSTREAM;
const provider = process.env.PROXY_PROVIDER;

if (!upstreamUrl) {
	console.error('Error: PROXY_UPSTREAM environment variable is required');
	process.exit(1);
}

(async () => {
	try {
		// Proxy
		const proxy = await Proxy(port, upstreamUrl);
		console.log(` * proxy port: ${proxy.port}`);
		console.log(` * proxy upstream: ${proxy.upstreamUrl}`);

		if (provider === 'localtunnel') {
			// Tunnel
			const tunnel = await LocalTunnel(port, subdomain);
			console.log(` * tunnel url: ${tunnel.url}`);

			// Shutdown
			SetupShutdown(async () => {
				console.log('> closing tunnel ...');
				console.log('> closing proxy ...');
				await tunnel.close();
				await proxy.close();

				process.exit(1);
			});
		}

		if (provider === 'serveo') {
			// Tunnel
			await SSHTunnel.start(subdomain, port);
			console.log('SSH tunnel started successfully.');

			// Shutdown
			SetupShutdown(async () => {
				console.log('> closing tunnel ...');
				await SSHTunnel.stop();
				console.log('> closing proxy ...');
				await proxy.close();

				process.exit(1);
			});

		}


		console.log(`...`);
		console.log(``);
	} catch (error) {
		console.error('Failed to start SSH tunnel:', error);
		process.exit(1);
	}
})();
