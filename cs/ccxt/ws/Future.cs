
namespace ccxt;

using System.Runtime.CompilerServices;

public partial class Exchange
{

    public class Future
    {
        public TaskCompletionSource<object> tcs = null;

        private static readonly Object obj = new Object();

        public Task<object> task = null;
        public Future()
        {
            this.tcs = new TaskCompletionSource<object>();
            this.task = this.tcs.Task;
        }

        public void resolve(object data = null)
        {
            lock (obj)
            {
                if (!this.tcs.Task.IsCompleted)
                {
                    if (this.tcs.Task.Status == TaskStatus.RanToCompletion)
                    {
                        return;
                    }
                    this.tcs.SetResult(data);
                }
                // this.tcs = new TaskCompletionSource<object>(); // reset
                // this.task = this.tcs.Task;
            }
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
            this.tcs.SetException(exception);
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