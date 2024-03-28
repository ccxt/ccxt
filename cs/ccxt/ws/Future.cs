
namespace ccxt;

using System.Runtime.CompilerServices;

public partial class Exchange
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
            this.tcs.SetResult(data);
            // this.tcs = new TaskCompletionSource<object>(); // reset
            // this.task = this.tcs.Task;
        }

        public void reject(object data)
        {
            this.tcs.SetException(new Exception(data.ToString()));
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
                    else if (task.IsCompletedSuccessfully)
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