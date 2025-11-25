package cli;
import io.github.ccxt.exchanges.Binance;
public class Main {
    public static void main(String[] args) {
        System.out.println("CCXT CLI is running");

        var exchange = new Binance();
        System.out.println("Exchange ID: " + exchange.id);
    }
}