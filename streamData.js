const sendMessage = (frequency) => {
	// private IP of laptop
	const HOST = "192.168.1.5";
	const PORT = 8888;
	const echoURL = "wss://echo.websocket.org";

	const ws = new WebSocket(`ws://${HOST}:${PORT}`);

	ws.onopen = () => {
		console.log("opened connection, sending message...........");
		ws.send("hi to server");
	};

	ws.onmessage = (e) => {
		console.log(e.data);
	};
	ws.onerror = (e) => {
		console.log(e.message);
	};
	ws.onclose = (e) => {
		console.log("error!");
		console.log(e);
	};
};

export default sendMessage;
