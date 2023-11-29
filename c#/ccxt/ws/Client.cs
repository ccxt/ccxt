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
    public class WebSocketClient
    {
        public string url; // Replace with your WebSocket server URL
        public ClientWebSocket webSocket = new ClientWebSocket();

        public Dictionary<string, Future> futures = new Dictionary<string, Future>();
        public Dictionary<string, object> subscriptions = new Dictionary<string, object>();
        public Dictionary<string, object> rejections = new Dictionary<string, object>();

        public bool verbose = false;
        public bool isConnected = false;
        public bool startedConnecting = false;
        private ManualResetEvent waitHandle = new ManualResetEvent(false);

        public TaskCompletionSource<bool> connected = null;

        public delegate void handleMessageDelegate(WebSocketClient client, object messageContent);

        public delegate void onCloseDelegate(WebSocketClient client, object error = null);

        public delegate void onErrorDelegate(WebSocketClient client, object error = null);

        public handleMessageDelegate handleMessage = null;

        public onCloseDelegate onClose = null;

        public onErrorDelegate onError = null;

        public object lastPong = null;

        public object keepAlive = null;

        public bool error = false;

        public WebSocketClient(string url, handleMessageDelegate handleMessage, bool isVerbose = false)
        {
            this.url = url;
            var tcs = new TaskCompletionSource<bool>();
            this.connected = tcs;
            this.handleMessage = handleMessage;
            this.verbose = isVerbose;
        }

        public Future future(object messageHash2)
        {
            var messageHash = messageHash2.ToString();
            // var tcs = new TaskCompletionSource<object>();
            // this.futures[messageHash] = tcs;
            // return tcs.Task;
            if (!this.futures.ContainsKey(messageHash))
            {
                // var tcs = new TaskCompletionSource<object>();
                var future = new Future();
                this.futures[messageHash] = future;
                // return future.task;
                return future;
            }
            else
            {
                // return (Task<object>)this.futures[messageHash].task;
                return this.futures[messageHash];
            }
        }

        public void resolve(object content, object messageHash2)
        {
            var messageHash = messageHash2.ToString();
            if (this.futures.ContainsKey(messageHash))
            {
                var future = this.futures[messageHash];
                this.futures.Remove(messageHash); // this order matters
                future.resolve(content);
            }
        }

        public void reject(object content, object messageHash2 = null)
        {
            if (messageHash2 != null)
            {
                var messageHash = messageHash2.ToString();
                if (this.futures.ContainsKey(messageHash))
                {
                    var future = this.futures[messageHash];
                    this.futures.Remove(messageHash); // this order matters
                    future.reject(content);
                }
            }

        }

        public void reset(object message2)
        {
            // stub implement this later
        }

        public Task connect(int backoffDelay = 0)
        {
            if (!this.startedConnecting)
            {
                this.startedConnecting = true;
                Task.Run(async () => Connect());
            }
            return this.connected.Task;
        }

        public void Connect()
        {
            var tcs = this.connected;
            // Run the connection logic in a background task
            Task.Run(async () =>
            {
                try
                {
                    await webSocket.ConnectAsync(new Uri(url), CancellationToken.None);
                    if (this.verbose)
                    {
                        Console.WriteLine("WebSocket connected!");
                    }
                    Task.Run(async () =>
                    {
                        Receiving(webSocket);
                    });
                    // tcs.SetResult(true); // Mark the task as complete upon successful connection
                    tcs.SetResult(true);
                }
                catch (Exception ex)
                {
                    tcs.SetException(ex); // Set the exception if something goes wrong
                }
            });

            // return tcs.Task;
        }

        public async Task send(object message)
        {
            var jsonMessage = Exchange.Json(message).ToString();
            if (this.verbose)
            {
                Console.WriteLine($"Sending message: {jsonMessage}");
            }
            var bytes = Encoding.UTF8.GetBytes(jsonMessage);
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            await this.webSocket.SendAsync(arraySegment,
                                WebSocketMessageType.Text,
                                true,
                                CancellationToken.None);
        }

        private static async Task Sending(ClientWebSocket webSocket)
        {
            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    Console.Write("Enter message to send: ");
                    string message = Console.ReadLine();

                    if (!string.IsNullOrEmpty(message))
                    {
                        var bytes = Encoding.UTF8.GetBytes(message);
                        await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sending error: {ex.Message}");
            }
        }

        private async Task Receiving(ClientWebSocket webSocket)
        {
            var buffer = new byte[1024 * 4 * 10];
            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        var deserializedMessages = JsonHelper.Deserialize(message);

                        if (this.verbose) // remove || true
                        {
                            Console.WriteLine($"On message: {message}");
                        }

                        this.handleMessage(this, deserializedMessages);

                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        this.onClose(this, null);
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                    }
                }
            }
            catch (Exception ex)
            {
                if (this.verbose)
                {
                    Console.WriteLine($"Receiving error: {ex.Message}");
                }
                this.onError(this, ex);
            }
        }
    }

}