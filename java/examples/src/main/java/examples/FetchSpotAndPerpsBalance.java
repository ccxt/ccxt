package examples;

import io.github.ccxt.errors.InsufficientFunds;
import io.github.ccxt.exchanges.pro.Binance;

import java.util.HashMap;

public class FetchSpotAndPerpsBalance {

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {

        var exchange = new Binance();
        exchange.apiKey = "your api key";
        exchange.secret = "your secret";

        try {
            // since defaultType is spot by default fetchBalance returns spot balance at binance
            var spotBalance = exchange.fetchBalance();


            var params = new HashMap<String, Object>();
            params.put("type", "swap");
            var swapBalance = exchange.fetchBalance(params); // by providing type:swap in params we can easily fetch the swap balance
        } catch (Exception e) {
        }
    }
}
