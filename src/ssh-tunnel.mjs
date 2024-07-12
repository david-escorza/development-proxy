import { spawn } from 'child_process';

let sshProcess;

export const SSHTunnel = {
	start(subdomain, port) {
		return new Promise((resolve, reject) => {
			sshProcess = spawn('ssh', ['-R', `${subdomain}.serveo.net:80:localhost:${port}`, 'serveo.net']);

			sshProcess.stdout.on('data', (data) => {
				console.log(`SSH stdout: ${data}`);
				if (data.toString().includes('Allocated port')) {
					resolve();
				}
			});

			sshProcess.stderr.on('data', (data) => {
				console.error(`SSH stderr: ${data}`);
				if (data.toString().includes('Warning:')) {
					resolve();
				}
			});

			sshProcess.on('error', (error) => {
				console.error(`SSH process error: ${error}`);
				reject(error);
			});

			sshProcess.on('close', (code) => {
				console.log(`SSH process exited with code ${code}`);
				if (code !== 0) {
					reject(new Error(`SSH process exited with code ${code}`));
				}
			});
		});
	},

	stop() {
		return new Promise((resolve, reject) => {
			if (sshProcess) {
				sshProcess.on('close', (code) => {
					console.log(`SSH tunnel closed with code ${code}`);
					resolve();
				});
				sshProcess.kill('SIGTERM'); // or 'SIGINT'
			} else {
				resolve();
			}
		});
	}
};
