using System.Globalization;

namespace ccxt;

using dict = Dictionary<string, object>;
public class Throttler
{

    private dict config = new dict();
    private Queue<(Task, double)> queue = new Queue<(Task, double)>();

    private bool running = false;

    public Throttler(dict config)
    {
        this.config = new Dictionary<string, object>()
        {
            {"refillRate",1.0},
            {"delay", 0.001},
            {"cost", 1.0},
            {"tokens", 0},
            {"maxCapacity", 2000},
            {"capacity", 1.0},
        };
        this.config = extend(this.config, config);

    }

    private async Task loop()
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
            var floatTokens = double.Parse(this.config["tokens"].ToString(), CultureInfo.InvariantCulture);
            if (floatTokens >= 0)
            {
                this.config["tokens"] = floatTokens - cost;
                await Task.Delay(0);
                task.Start();
                this.queue.Dequeue();

                if (this.queue.Count == 0)
                {
                    this.running = false;
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

    public async Task<Task> throttle(object cost2)
    {
        var cost = (cost2 != null) ? double.Parse(cost2.ToString(), CultureInfo.InvariantCulture) : this.config["cost"];
        if (this.queue.Count > (int)this.config["maxCapacity"])
        {
            throw new Exception("throttle queue is over maxCapacity (" + this.config["maxCapacity"].ToString() + "), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526");
        }
        var t = new Task(() => { });
        this.queue.Enqueue((t, (double)cost));
        if (!this.running)
        {
            this.running = true;
            await this.loop();
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
