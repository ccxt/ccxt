namespace ccxt;

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

// One dedicated thread per exchange owns every piece of ws state: the cache maps and
// the handler bodies that mutate them. Callers hand work over a queue and wait for the
// reply, so the state is only ever touched by this thread and nothing guards it with a
// lock. Work posted from the owner itself runs inline.
public sealed class WsOwner
{
    private static readonly ThreadLocal<WsOwner> running = new ThreadLocal<WsOwner>();

    private readonly BlockingCollection<OwnerOp> queue = new BlockingCollection<OwnerOp>();
    private readonly Lazy<Thread> thread;
    private readonly string name;

    public WsOwner(string name = "ccxt-ws-owner")
    {
        this.name = name;
        this.thread = new Lazy<Thread>(this.startLoop);
    }

    /// True when the caller is this owner's own thread: its work must not be re-posted.
    public bool IsOwner
    {
        get { return ReferenceEquals(running.Value, this); }
    }

    /// Run work on the owner and hand its result back to the caller.
    public object Ask(Func<object> work)
    {
        if (this.IsOwner)
        {
            return work();
        }
        var _ = this.thread.Value; // the loop is up before anything is queued into it
        var reply = new TaskCompletionSource<object>(TaskCreationOptions.RunContinuationsAsynchronously);
        this.queue.Add(new OwnerOp(work, reply));
        return reply.Task.GetAwaiter().GetResult();
    }

    private Thread startLoop()
    {
        var loop = new Thread(this.consume) { IsBackground = true, Name = this.name };
        loop.Start();
        return loop;
    }

    private void consume()
    {
        running.Value = this;
        try
        {
            foreach (var op in this.queue.GetConsumingEnumerable())
            {
                try
                {
                    var result = op.work();
                    if (op.reply != null)
                    {
                        op.reply.TrySetResult(result);
                    }
                }
                catch (Exception e)
                {
                    // an asker must see the failure in its own call; a posted op has
                    // nobody to report to and must not take the owner down
                    if (op.reply != null)
                    {
                        op.reply.TrySetException(e);
                    }
                }
            }
        }
        finally
        {
            running.Value = null;
        }
    }

#nullable disable
    private readonly struct OwnerOp
    {
        public readonly Func<object> work;
        public readonly TaskCompletionSource<object> reply;

        public OwnerOp(Func<object> work, TaskCompletionSource<object> reply)
        {
            this.work = work;
            this.reply = reply;
        }
    }
#nullable restore
}
