```java
package examples;

import io.github.ccxt.errors.InsufficientFunds;
import io.github.ccxt.exchanges.pro.Binance;

import java.util.HashMap;

public class CreatePerpsOrder {

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {

        var exchange = new Binance();
        exchange.apiKey = "your api key";
        exchange.secret = "your secret";

        try {
            var params = new HashMap<String, Object>();
            var symbol = "BTC/USDT:USDT"; // linear swap using ccxt terminology
            var order = exchange.createOrder(symbol, "market", "buy", 500.0, null, params);
            System.out.println("here:::" + order.id);
        } catch (InsufficientFunds e) {
        }
    }
}

```
