```java
package examples;

import io.github.ccxt.errors.InsufficientFunds;
import io.github.ccxt.exchanges.pro.Binance;

import java.util.HashMap;
import java.util.concurrent.ExecutionException;

public class CreateOrderWithParams {

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {

        var exchange = new Binance();
        exchange.apiKey = "your api key";
        exchange.secret = "your secret";

        try {
            var params = new HashMap<String, Object>();
            params.put("clientOrderId", "myMarketOrder");
            params.put("postOnly", true); // add your custom params here
            var order = exchange.createOrder("ETH/USDT", "market", "buy", 500.0, null, params);
            System.out.println("here:::" + order.id);
        } catch (InsufficientFunds e) {
        }
    }
}

```
