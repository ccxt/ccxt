using System.Collections.Concurrent;
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

    //  Callers post a request and park on its completion; the owner thread below drains
    //  the channel in arrival order and is the only reader or writer of the pending
    //  order, the tokens and the timestamps. The channel is the whole hand-off.
    private readonly Handoff arrivals = new Handoff();

    private sealed class ThrottleRequest
    {
        public double cost;
        public readonly TaskCompletionSource<bool> completion = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    }

    //  in-box netstandard2.0 channel: producers never block, the owner parks in Take()
    private sealed class Handoff
    {
        private readonly BlockingCollection<ThrottleRequest> queue = new BlockingCollection<ThrottleRequest>();

        public void post(ThrottleRequest item)
        {
            this.queue.Add(item);
        }

        public ThrottleRequest next()
        {
            return this.queue.Take();
        }

        public bool tryNext(out ThrottleRequest item)
        {
            return this.queue.TryTake(out item);
        }
    }

    public Throttler(Dictionary<string, object> configInput)
    {
        // Convert the dictionary input to our typed config
        if (configInput != null)
        {
            config.RefillRate = configInput.TryGetValue("refillRate", out var refillRate) ? Convert.ToDouble(refillRate) : config.RefillRate;       // leaky bucket refill rate in tokens per second
            config.Delay = configInput.TryGetValue("delay", out var delay) ? Convert.ToDouble(delay) : config.Delay;                                // leaky bucket seconds before checking the queue after waiting
            config.Cost = configInput.TryGetValue("cost", out var cost) ? Convert.ToDouble(cost) : config.Cost;                                     // leaky bucket and rolling window
            config.Tokens = configInput.TryGetValue("tokens", out var tokens) ? Convert.ToDouble(tokens) : config.Tokens;                           // leaky bucket
            config.Capacity = configInput.TryGetValue("capacity", out var capacity) ? Convert.ToDouble(capacity) : config.Capacity;                 // leaky bucket
            config.Algorithm = configInput.TryGetValue("algorithm", out var algorithm) ? Convert.ToString(algorithm) : config.Algorithm;
            config.RateLimit = configInput.TryGetValue("rateLimit", out var rateLimit) ? Convert.ToDouble(rateLimit) : config.RateLimit;
            config.WindowSize = configInput.TryGetValue("windowSize", out var windowSize) ? Convert.ToDouble(windowSize) : config.WindowSize;       // rolling window size in milliseconds
            if (this.config.Algorithm != "leakyBucket"){
                this.config.MaxWeight = this.config.WindowSize / this.config.RateLimit;
            }
        }
        //  The owner runs for the lifetime of the instance, parked on the channel.
        Task.Factory.StartNew(this.loop, CancellationToken.None, TaskCreationOptions.LongRunning, TaskScheduler.Default);
    }

    /// <summary>
    /// Moves everything handed over so far into the owner's own pending order. Only the
    /// owner thread calls this, so the queue is drained by its single reader.
    /// </summary>
    private void fillPending(Queue<ThrottleRequest> pending)
    {
        pending.Enqueue(this.arrivals.next());
        ThrottleRequest arrived;
        while (this.arrivals.tryNext(out arrived))
        {
            pending.Enqueue(arrived);
        }
    }

    private void leakyBucketLoop()
    {
        var pending = new Queue<ThrottleRequest>();
        var lastTimestamp = milliseconds();
        var tokens = this.config.Tokens;
        while (true)
        {
            if (pending.Count == 0)
            {
                this.fillPending(pending);
            }
            var first = pending.Peek();
            var cost = first.cost;
            if (tokens >= 0)
            {
                tokens = tokens - cost;
                first.completion.TrySetResult(true);
                pending.Dequeue();
            }
            else
            {
                Thread.Sleep((int)(this.config.Delay * 1000));
                var current = milliseconds();
                var elapsed = current - lastTimestamp;
                lastTimestamp = current;
                tokens = Math.Min(tokens + ((double)this.config.RefillRate * elapsed), (double)this.config.Capacity);
            }
        }
    }

    private void rollingWindowLoop()
    {
        var pending = new Queue<ThrottleRequest>();
        var timestamps = new List<(long timestamp, double cost)>();
        while (true)
        {
            if (pending.Count == 0)
            {
                this.fillPending(pending);
            }
            var first = pending.Peek();
            var cost = first.cost;
            var now = milliseconds();
            var windowSize = this.config.WindowSize;
            timestamps.RemoveAll(t => now - t.timestamp >= windowSize);
            var totalCost = timestamps.Sum(t => t.cost);
            if (totalCost + cost <= this.config.MaxWeight)
            {
                timestamps.Add((now, cost));
                first.completion.TrySetResult(true);
                pending.Dequeue();
            }
            else if (timestamps.Count == 0)
            {
                //  a single cost above the whole window can never fit: grant it rather
                //  than leave the owner and every caller behind it waiting forever
                first.completion.TrySetResult(true);
                pending.Dequeue();
            }
            else
            {
                var earliest = timestamps[0].timestamp;
                var waitTime = (earliest + windowSize) - now;
                if (waitTime > 0)
                {
                    Thread.Sleep((int)waitTime);
                }
            }
        }
    }

    private void loop()
    {
        if (this.config.Algorithm == "leakyBucket")
        {
            this.leakyBucketLoop();
        }
        else
        {
            this.rollingWindowLoop();
        }
    }

    /// <summary>
    /// Hands one request to the owner and returns the task that completes when the slot
    /// is granted — the caller awaits it exactly as it awaited the task before.
    /// </summary>
    public Task<Task> throttle(object cost2)
    {
        var cost = (cost2 != null) ? Convert.ToDouble(cost2) : Convert.ToDouble(this.config.Cost);
        var request = new ThrottleRequest { cost = cost };
        this.arrivals.post(request);
        return Task.FromResult<Task>(request.completion.Task);
    }


    // move this elsewhere later
    private Dictionary<string, object> extend(object aa, object bb)
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
