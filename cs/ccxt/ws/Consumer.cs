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

    public class Consumer
    {
        public ConsumerFunction fn { get; private set; }
        public bool synchronous { get; private set; }
        public int currentIndex { get; private set; }
        public bool running { get; private set; }
        public Queue<Message> backlog { get; private set; }

        public Consumer(ConsumerFunction fn, bool synchronous, int currentIndex)
        {
            this.fn = fn;
            this.synchronous = synchronous;
            this.currentIndex = currentIndex;
            this.running = false;
            this.backlog = new Queue<Message>();
        }

        public void publish(Message message)
        {
            backlog.Enqueue(message);
            Run();
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
            if (message.metadata.index <= currentIndex)
            {
                return;
            }

            currentIndex = message.metadata.index;

            if (synchronous)
            {
                // If synchronous, run and wait for the task to complete.
                await fn(message);
            }
            else
            {
                // If not synchronous, fire and forget (but observe exceptions)
                var _ = fn(message).ContinueWith(task => {
                    if (task.Exception != null)
                    {
                        // Log or handle the exception as needed
                        Console.WriteLine(task.Exception);
                    }
                }, TaskContinuationOptions.OnlyOnFaulted);
            }
        }
    }
}
