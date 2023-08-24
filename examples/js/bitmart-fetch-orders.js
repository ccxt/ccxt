import ccxt from "../../js/ccxt.js";
async function bitmartFetchOrders() {
	const cex = new ccxt.bitmart({
		enableRateLimit: true,
		apiKey: "",
		secret:
			"",
		uid: "",
		precisionMode: 3,
	});
	const orders = await cex.fetchOrders();
	console.log(orders);
}
bitmartFetchOrders();
