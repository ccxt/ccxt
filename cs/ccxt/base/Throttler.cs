using System.Globalization;

namespace ccxt;

using dict = Dictionary<string, object>;
public class Throttler
{

    private dict config = new dict();
    private Queue<(Task, double)> queue = new Queue<(Task, double)>();
    private readonly object queueLock = new object();

    private bool running = false;
    private List<(long timestamp, double cost)> timestamps = new List<(long, double)>();

    public Throttler(dict config)
    {
        this.config = new Dictionary<string, object>()
        {
            {"refillRate",1.0},
            {"delay", 0.001},
            {"cost", 1.0},
            {"tokens", 0},
            {"maxLimiterRequests", 2000},
            {"capacity", 1.0},
            {"algorithm", "leakyBucket"},
            {"rateLimit", 0.0},
            {"windowSize", 60000.0},
            // maxWeight should be set in config parameter for rolling window algorithm
        };
        this.config = extend(this.config, config);

    }

    private async Task leakyBucketLoop()
    {
        var lastTimestamp = milliseconds();
        while (this.running)
        {
            // do we need this check here?
            lock (queueLock)
            {
                if (this.queue.Count == 0)
                {
                    this.running = false;
                    continue;
                }
            }
            (Task, double) first;
            lock (queueLock)
            {
                first = this.queue.Peek();
            }
            var task = first.Item1;
            var cost = first.Item2;
            var tokensAsString = Convert.ToString(this.config["tokens"], CultureInfo.InvariantCulture);
            var floatTokens = double.Parse(tokensAsString, CultureInfo.InvariantCulture);
            if (floatTokens >= 0)
            {
                this.config["tokens"] = floatTokens - cost;
                await Task.Delay(0);
                if (task != null)
                {
                    if (task.Status == TaskStatus.Created)
                    {
                        task.Start();
                    }
                }
                lock (queueLock)
                {
                    this.queue.Dequeue();

                    if (this.queue.Count == 0)
                    {
                        this.running = false;
                    }
                }
            }
            else
            {
                await Task.Delay((int)((double)this.config["delay"] * 1000));
                var current = milliseconds();
                var elapsed = current - lastTimestamp;
                lastTimestamp = current;
                var tokens = (double)this.config["tokens"] + ((double)this.config["refillRate"] * elapsed);
                this.config["tokens"] = Math.Min(tokens, (int)this.config["capacity"]);
            }
        }

    }

    private async Task rollingWindowLoop()
    {
        while (this.running)
        {
            lock (queueLock)
            {
                if (this.queue.Count == 0)
                {
                    this.running = false;
                    continue;
                }
            }
            (Task, double) first;
            lock (queueLock)
            {
                first = this.queue.Peek();
            }
            var task = first.Item1;
            var cost = first.Item2;
            var now = milliseconds();
            timestamps = timestamps.Where(t => now - t.timestamp < Convert.ToDouble(this.config["windowSize"])).ToList();
            var totalCost = timestamps.Sum(t => t.cost);
            if (totalCost + cost <= Convert.ToDouble(this.config["maxWeight"]))
            {
                timestamps.Add((now, cost));
                await Task.Delay(0);
                if (task != null && task.Status == TaskStatus.Created)
                {
                    task.Start();
                }
                lock (queueLock)
                {
                    this.queue.Dequeue();
                    if (this.queue.Count == 0) this.running = false;
                }
            }
            else
            {
                var earliest = timestamps[0].timestamp;
                var waitTime = (earliest + Convert.ToDouble(this.config["windowSize"])) - now;
                if (waitTime > 0)
                {
                    await Task.Delay((int)waitTime);
                }
            }
        }
    }

    private async Task loop()
    {
        if (this.config["algorithm"].ToString() == "leakyBucket")
        {
            await leakyBucketLoop();
        }
        else
        {
            await rollingWindowLoop();
        }
    }

    public async Task<Task> throttle(object cost2)
    {
        var cost = (cost2 != null) ? Convert.ToDouble(cost2) : Convert.ToDouble(this.config["cost"]);
        var t = new Task(() => { });
        lock (queueLock)
        {
            if (this.queue.Count > (int)this.config["maxLimiterRequests"])
            {
                throw new Exception("throttle queue is over maxLimiterRequests (" + this.config["maxLimiterRequests"].ToString() + "), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526");
            }
            this.queue.Enqueue((t, cost));
        }
        if (!this.running)
        {
            this.running = true;
            // Task.Run(() => { this.loop(); });
            this.loop();
        }
        return t;
    }

    // move this elsewhere later
    private dict extend(object aa, object bb)
    {

        var a = (dict)aa;
        var b = (dict)bb;
        var keys = new List<string>(b.Keys);
        foreach (string key in keys)
        {
            a[(string)key] = b[key];
        }
        return a;
    }

    public long milliseconds()
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        long unixTimeMilliseconds = now.ToUnixTimeMilliseconds();
        return unixTimeMilliseconds;
    }

}
