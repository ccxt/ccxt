using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;
using System.Net;

namespace ccxt;

using dict = Dictionary<string, object>;
using System.Net.WebSockets;
using System.Data;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
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
            this.tcs = new TaskCompletionSource<object>(); // reset
            this.task = this.tcs.Task;
        }

        public void reject(object data)
        {
            this.tcs.SetException(new Exception(data.ToString()));
            this.tcs = new TaskCompletionSource<object>(); // reset
            this.task = this.tcs.Task;
        }

        public TaskAwaiter<object> GetAwaiter()
        {
            return tcs.Task.GetAwaiter();
        }
    }


}