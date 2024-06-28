const WebSocketClient = (() => {
    let instance;
    const WS_URL = process.env.REACT_APP_WS_URL;

    function createInstance() {
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('WebSocket Client Connected');
        };

        socket.onclose = (event) => {
            console.log('WebSocket Client Disconnected', event);
            if (event.code !== 1000) {
                console.error('WebSocket closed with error:', event);
            }
        };

        socket.onerror = (error) => {
            console.log('WebSocket Client Error', error);
        };

        socket.onmessage = (event) => {
            console.log('WebSocket Client Message', event.data);
        };

        return socket;
    }

    return {
        getInstance: () => {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        },
    };
})();

export default WebSocketClient;
