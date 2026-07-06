package examples;

import io.github.ccxt.errors.InsufficientFunds;
import io.github.ccxt.exchanges.pro.Binance;

import java.util.HashMap;
import java.util.concurrent.ExecutionException;
public class CreateOrderAsyncWithExceptionHandling {

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {

        var exchange = new Binance();
        exchange.apiKey = "your api key";
        exchange.secret = "your secret";

        exchange.enableDemoTrading(true); // enabling demo trading

        try {
            var params = new HashMap<String, Object>();
            params.put("clientOrderId", "myMarketOrder");
            var order = exchange.createOrderAsync("ETH/USDT", "market", "buy", 500.0, null, params).get();
            System.out.println("here:::" + order.id);
        } catch (ExecutionException | InterruptedException e) {
            Throwable cause = e.getCause();

            if (cause instanceof InsufficientFunds) {
                System.out.println("Order failed: InsufficientFunds");
            } else {
                System.out.println("Async exception: " + cause);
            }
        }
    }
}
