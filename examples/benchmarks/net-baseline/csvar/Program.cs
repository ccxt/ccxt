// Isolates which HttpClient setting costs CCXT's C# client its extra time.
// Four handler variants, interleaved round-robin in one process so they share
// the same network window.
using System; using System.Collections.Generic; using System.Diagnostics;
using System.Globalization; using System.Net; using System.Net.Http; using System.Threading.Tasks;

class CsVar {
  const string URL = "https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD";

  static HttpClient Make(string variant) {
    HttpMessageHandler h;
    switch (variant) {
      case "sockets-plain":
        h = new SocketsHttpHandler { PooledConnectionIdleTimeout = TimeSpan.FromSeconds(60), MaxConnectionsPerServer = 10 };
        break;
      case "sockets-gzip":
        h = new SocketsHttpHandler { PooledConnectionIdleTimeout = TimeSpan.FromSeconds(60), MaxConnectionsPerServer = 10,
                                     AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate };
        break;
      case "httpclienthandler-plain":
        h = new HttpClientHandler();
        break;
      default: // "ccxt" — exactly what cs/ccxt/base/Exchange.cs builds
        h = new HttpClientHandler { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate };
        break;
    }
    return new HttpClient(h);
  }

  static double Med(List<double> v) { v.Sort(); return v[v.Count / 2]; }

  static async Task Main(string[] a) {
    int n = a.Length > 0 ? int.Parse(a[0]) : 8, rounds = a.Length > 1 ? int.Parse(a[1]) : 4;
    var variants = new[] { "sockets-plain", "sockets-gzip", "httpclienthandler-plain", "ccxt" };
    var clients = new Dictionary<string, HttpClient>();
    var samples = new Dictionary<string, List<double>>();
    foreach (var v in variants) { clients[v] = Make(v); samples[v] = new List<double>(); }
    // warm every client so none pays a cold connection
    foreach (var v in variants) for (int i = 0; i < 5; i++) await clients[v].GetByteArrayAsync(URL);
    for (int r = 0; r < rounds; r++)
      foreach (var v in variants)
        for (int i = 0; i < n; i++) {
          var sw = Stopwatch.StartNew();
          var bytes = await clients[v].GetByteArrayAsync(URL);
          samples[v].Add(sw.Elapsed.TotalMilliseconds);
          await Task.Delay(200);
        }
    foreach (var v in variants)
      Console.WriteLine($"{v,-26} n={samples[v].Count,3}  med={Med(samples[v]).ToString("F1", CultureInfo.InvariantCulture),7} ms");
  }
}
