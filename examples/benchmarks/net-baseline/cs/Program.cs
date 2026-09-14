// Raw keep-alive HTTPS GET baseline — no CCXT. HttpClient through the agent proxy.
using System; using System.Diagnostics; using System.Globalization; using System.Net; using System.Net.Http; using System.Threading.Tasks;
class Raw {
  static async Task Main(string[] a) {
    var url = "https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD";
    int n = a.Length > 0 ? int.Parse(a[0]) : 10;
    var h = new SocketsHttpHandler { PooledConnectionIdleTimeout = TimeSpan.FromSeconds(60), MaxConnectionsPerServer = 10 };
    var pv = Environment.GetEnvironmentVariable("HTTPS_PROXY");
    if (!string.IsNullOrEmpty(pv)) { h.Proxy = new WebProxy(pv); h.UseProxy = true; }
    var c = new HttpClient(h);
    Func<Task<int>> get = async () => (await c.GetByteArrayAsync(url)).Length;
    for (int i = 0; i < 3; i++) await get();
    var t = new System.Collections.Generic.List<string>(); int bytes = 0;
    for (int i = 0; i < n; i++) { var sw = Stopwatch.StartNew(); bytes = await get();
      t.Add(sw.Elapsed.TotalMilliseconds.ToString("F2", CultureInfo.InvariantCulture)); await Task.Delay(250); }
    Console.WriteLine("{\"lang\":\"C#\",\"samples\":[" + string.Join(",", t) + "],\"bytes\":" + bytes + "}");
  }
}
