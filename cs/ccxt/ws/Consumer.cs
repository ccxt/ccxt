using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ccxt.pro
{

    public interface IBaseStream
    {
        int maxMessagesPerTopic { get; set; }
        void produce(object topic, object payload, object error = null);
        void close();
    }
    
    public class Metadata
    {
        public IBaseStream stream { get; set; }
        public string topic { get; set; }
        public int index { get; set; }
        public List<Message> history { get; set; }
    }

    public class Message
    {
        public object payload { get; set; }
        public object error { get; set; }
        public Metadata metadata { get; set; }
    }

    public delegate Task ConsumerFunction(Message message);

    public class ConsumerOptions
    {
        public bool synchronous { get; set; } = false;
    }

    public class Consumer
    {
        private const int MAX_BACKLOG_SIZE = 10;  // Maximum number of messages in backlog
        
        public ConsumerFunction fn { get; private set; }
        public bool synchronous { get; private set; }
        public int currentIndex { get; private set; }
        public bool running { get; private set; }
        public Queue<Message> backlog { get; private set; }

        public Consumer(ConsumerFunction fn, int currentIndex = 0, ConsumerOptions options = null)
        {
            this.fn = fn;
            this.synchronous = options?.synchronous ?? false;
            this.currentIndex = currentIndex;
            this.running = false;
            this.backlog = new Queue<Message>();
        }

        public void publish(Message message)
        {
            if (message == null)
            {
                Console.WriteLine("Warning: Attempted to publish null message to Consumer");
                return;
            }
            backlog.Enqueue(message);
            if (backlog.Count > MAX_BACKLOG_SIZE)
            {
                Console.WriteLine($"Warning: WebSocket consumer backlog is too large ({backlog.Count} messages). This might indicate a performance issue or message processing bottleneck. Dropping oldest message.");
                backlog.Dequeue();
            }
            if (!running)
            {
                Run();
            }
        }

        private async void Run()
        {
            if (running)
            {
                return;
            }

            running = true;

            while (backlog.Count > 0)
            {
                var message = backlog.Dequeue();
                await HandleMessage(message);
            }

            running = false;
        }

        private async Task HandleMessage(Message message)
        {
            if (message == null || message.metadata == null)
            {
                Console.WriteLine("Warning: Received null message or null metadata in Consumer.HandleMessage");
                return;
            }
            
            if (message.metadata.index <= currentIndex)
            {
                return;
            }

            currentIndex = message.metadata.index;
            var stream = message.metadata.stream;
            var fn = this.fn;
            Action<Exception> produceError = (Exception err) => {
                // Wrap the error in a suitable object if needed, here just passing the message
                stream.produce("errors", message, err.Message);
            };
            if (synchronous)
            {
                try
                {
                    await fn(message);
                }
                catch (Exception err)
                {
                    produceError(err);
                }
            }
            else
            {
                try
                {
                    var _ = fn(message).ContinueWith(task => {
                        if (task.Exception != null)
                        {
                            produceError(task.Exception.InnerException ?? task.Exception);
                        }
                    }, TaskContinuationOptions.OnlyOnFaulted);
                }
                catch (Exception err)
                {
                    produceError(err);
                }
            }
        }
    }
}
