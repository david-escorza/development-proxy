let _shouldShutDown = false;

const handleShutdownSignal = () => {
    console.log('');
    console.info('> received signal to shutdown');
    _shouldShutDown = true;
};

const shouldShutdown = () => {
    return _shouldShutDown;
}

export function SetupShutdown(handler) {
    const handle = () => {
        handleShutdownSignal();
        if (handler) {
            handler();
        }
    };
    
    process.on('SIGTERM', handle);
    process.on('SIGHUP', handle);
    process.on('SIGINT', handle);

    return shouldShutdown;
}