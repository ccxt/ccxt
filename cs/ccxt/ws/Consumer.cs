using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ccxt.pro
{

    public interface IBaseStream
    {
        int MaxMessagesPerTopic { get; set; }
        void Produce(string topic, object payload, object error = null);
        void Close();
    }
    
    public class Metadata
    {
        public IBaseStream Stream { get; set; }
        public string Topic { get; set; }
        public int Index { get; set; }
        public List<Message> History { get; set; }
    }

    public class Message
    {
        public object Payload { get; set; }
        public object Error { get; set; }
        public Metadata Metadata { get; set; }
    }

    public delegate Task ConsumerFunction(Message message);

    public class Consumer
    {
        public ConsumerFunction Fn { get; private set; }
        public bool Synchronous { get; private set; }
        public int CurrentIndex { get; private set; }
        public bool Running { get; private set; }
        public Queue<Message> Backlog { get; private set; }

        public Consumer(ConsumerFunction fn, bool synchronous, int currentIndex)
        {
            Fn = fn;
            Synchronous = synchronous;
            CurrentIndex = currentIndex;
            Running = false;
            Backlog = new Queue<Message>();
        }

        public void Publish(Message message)
        {
            Backlog.Enqueue(message);
            Run();
        }

        private async void Run()
        {
            if (Running)
            {
                return;
            }

            Running = true;

            while (Backlog.Count > 0)
            {
                var message = Backlog.Dequeue();
                await HandleMessage(message);
            }

            Running = false;
        }

        private async Task HandleMessage(Message message)
        {
            if (message.Metadata.Index <= CurrentIndex)
            {
                return;
            }

            CurrentIndex = message.Metadata.Index;

            if (Synchronous)
            {
                // If synchronous, run and wait for the task to complete.
                await Fn(message);
            }
            else
            {
                // If not synchronous, fire and forget (but observe exceptions)
                var _ = Fn(message).ContinueWith(task => {
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
