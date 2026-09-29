// Raw keep-alive HTTPS GET baseline — no CCXT. java.net.http through the agent proxy.
import java.net.URI; import java.net.http.*; import java.util.*;
public class Raw {
  public static void main(String[] a) throws Exception {
    String url = "https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD";
    int n = a.length > 0 ? Integer.parseInt(a[0]) : 10;
    HttpClient c = HttpClient.newBuilder().proxy(java.net.ProxySelector.getDefault()).build();
    HttpRequest r = HttpRequest.newBuilder(URI.create(url)).GET().build();
    java.util.function.Supplier<Integer> get = () -> { try { return c.send(r, HttpResponse.BodyHandlers.ofByteArray()).body().length; } catch (Exception e) { throw new RuntimeException(e); } };
    for (int i = 0; i < 3; i++) get.get();
    List<String> t = new ArrayList<>(); int bytes = 0;
    for (int i = 0; i < n; i++) { long s = System.nanoTime(); bytes = get.get();
      t.add(String.format(Locale.ROOT, "%.2f", (System.nanoTime() - s) / 1e6)); Thread.sleep(250); }
    System.out.println("{\"lang\":\"Java\",\"samples\":[" + String.join(",", t) + "],\"bytes\":" + bytes + "}");
  }
}
