
namespace ccxt;

using System.Runtime.CompilerServices;

public partial class BaseExchange
{

    public class Future
    {
        public TaskCompletionSource<object> tcs = null;

        public Task<object> task = null;
        public Future()
        {
            this.tcs = new TaskCompletionSource<object>();
            this.task = this.tcs.Task;
        }

        public void resolve(object data = null)
        {
            // TrySetResult is atomically settle-once: losers of a concurrent
            // resolve/reject race become no-ops, with no lock held while awaiter
            // continuations run inline on the settling thread
            this.tcs.TrySetResult(data);
        }

        public void reject(object data)
        {
            // var callSite = new System.Diagnostics.StackTrace(1, true).GetFrame(0);
            // var msg = (callSite?.GetFileName() ?? "Unknown" ) + " " + (callSite?.GetFileLineNumber() ?? 0) + " " + (callSite?.GetMethod()?.Name ?? "Unknown");
            // System.Diagnostics.Debug.WriteLine($"Future.reject called with: {data} (Type: {data?.GetType().Name ?? "null"})" + " ::: " + msg);
            
            Exception exception;
            
            if (data is Exception ex)
            {
                exception = ex;
            }
            else if (data == null)
            {
                exception = new Exception("Future rejected with null data");
            }
            else
            {
                exception = new Exception($"Future rejected: {data?.ToString() ?? "null"} (Type: {data?.GetType().Name ?? "null"})\n");
            }
            // TrySetException is atomically settle-once: a teardown or close-path
            // reject racing a message-handler resolve becomes a no-op instead of
            // throwing InvalidOperationException on the completed task
            this.tcs.TrySetException(exception);
            // this.tcs = new TaskCompletionSource<object>(); // reset
            // this.task = this.tcs.Task;
        }

        public TaskAwaiter<object> GetAwaiter()
        {
            return tcs.Task.GetAwaiter();
        }

        public static Future race(params Future[] futures)
        {
            var future = new Future();
            foreach (var f in futures)
            {
                f.task.ContinueWith((task) =>
                {
                    if (task.IsFaulted)
                    {
                        future.reject(task.Exception);
                    }
                    else if (task.IsCompleted)
                    {
                        future.resolve(task.Result);
                    }
                    else
                    {
                        future.reject(task.Exception);
                    }
                });
            }
            return future;
        }
    }
}