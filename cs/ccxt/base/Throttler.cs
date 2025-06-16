using System.Globalization;

namespace ccxt;

using dict = Dictionary<string, object>;

public class ThrottlerConfig
{
    public double RefillRate { get; set; } = 1.0;
    public double Delay { get; set; } = 0.001;
    public double Cost { get; set; } = 1.0;
    public double Tokens { get; set; } = 0.0;
    public int MaxLimiterRequests { get; set; } = 2000;
    public double Capacity { get; set; } = 1.0;
    public string Algorithm { get; set; } = "leakyBucket";
    public double RateLimit { get; set; } = 0.0;
    public double WindowSize { get; set; } = 60000.0;
    public double MaxWeight { get; set; }
}

public class Throttler
{
    private ThrottlerConfig config = new ThrottlerConfig();
    private Queue<(Task, double)> queue = new Queue<(Task, double)>();
    private readonly object queueLock = new object();

    private bool running = false;
    private List<(long timestamp, double cost)> timestamps = new List<(long, double)>();

    public Throttler(Dictionary<string, object> configInput)
    {
        // Convert the dictionary input to our typed config
        if (configInput != null)
        {
            config.RefillRate = configInput.TryGetValue("refillRate", out var refillRate) ? Convert.ToDouble(refillRate) : config.RefillRate;
            config.Delay = configInput.TryGetValue("delay", out var delay) ? Convert.ToDouble(delay) : config.Delay;
            config.Cost = configInput.TryGetValue("cost", out var cost) ? Convert.ToDouble(cost) : config.Cost;
            config.Tokens = configInput.TryGetValue("tokens", out var tokens) ? Convert.ToDouble(tokens) : config.Tokens;
            config.MaxLimiterRequests = configInput.TryGetValue("maxLimiterRequests", out var maxRequests) ? Convert.ToInt32(maxRequests) : config.MaxLimiterRequests;
            config.Capacity = configInput.TryGetValue("capacity", out var capacity) ? Convert.ToDouble(capacity) : config.Capacity;
            config.Algorithm = configInput.TryGetValue("algorithm", out var algorithm) ? Convert.ToString(algorithm) : config.Algorithm;
            config.RateLimit = configInput.TryGetValue("rateLimit", out var rateLimit) ? Convert.ToDouble(rateLimit) : config.RateLimit;
            config.WindowSize = configInput.TryGetValue("windowSize", out var windowSize) ? Convert.ToDouble(windowSize) : config.WindowSize;
            config.MaxWeight = configInput.TryGetValue("maxWeight", out var maxWeight) ? Convert.ToDouble(maxWeight) : config.MaxWeight;
        }
    }

    private async Task leakyBucketLoop()
    {
        var lastTimestamp = milliseconds();
        while (this.running)
        {
            // do we need this check here?
            if (this.queue.Count == 0)
            {
                this.running = false;
                continue;
            }
            var first = this.queue.Peek();
            var task = first.Item1;
            var cost = first.Item2;
            var floatTokens = Convert.ToDouble(this.config.Tokens);
            if (floatTokens >= 0)
            {
                this.config.Tokens = floatTokens - cost;
                await Task.Delay(0);
                if (task != null)
                {
                    if (task.Status == TaskStatus.Created)
                    {
                        task.Start();
                    }
                }
                this.queue.Dequeue();

                if (this.queue.Count == 0)
                {
                    this.running = false;
                }
            }
            else
            {
                await Task.Delay((int)((double)this.config.Delay * 1000));
                var current = milliseconds();
                var elapsed = current - lastTimestamp;
                lastTimestamp = current;
                var tokens = (double)this.config.Tokens + ((double)this.config.RefillRate * elapsed);
                this.config.Tokens = Math.Min(tokens, (double)this.config.Capacity);
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
            var windowSize = Convert.ToDouble(this.config.WindowSize);
            timestamps.RemoveAll(t => now - t.timestamp >= windowSize);
            var totalCost = timestamps.Sum(t => t.cost);
            if (totalCost + cost <= Convert.ToDouble(this.config.MaxWeight))
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
                if (timestamps.Count <= 0)
                {
                    continue;
                }
                var earliest = timestamps[0].timestamp;
                var waitTime = (earliest + windowSize) - now;
                if (waitTime > 0)
                {
                    await Task.Delay((int)waitTime);
                }
            }
        }
    }

    private async Task loop()
    {
        if (this.config.Algorithm == "leakyBucket")
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
        var cost = (cost2 != null) ? Convert.ToDouble(cost2) : Convert.ToDouble(this.config.Cost);
        var t = new Task(() => { });
        lock (queueLock)
        {
            if (this.queue.Count > (int)this.config.MaxLimiterRequests)
            {
                throw new Exception("throttle queue is over maxLimiterRequests (" + this.config.MaxLimiterRequests.ToString() + "), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526");
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
