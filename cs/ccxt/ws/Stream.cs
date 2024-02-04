namespace ccxt;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// Define type aliases for clarity, if needed
public class Metadata
{
    public string Topic { get; private set; }
    public int Index { get; private set; }

    public Metadata(string topic, int index)
    {
        Topic = topic;
        Index = index;
    }
}

public class Message
{
    public object Payload { get; private set; }
    public object Error { get; private set; }
    public Metadata Metadata { get; private set; }

    public Message(object payload, object error, string topic, int index)
    {
        Payload = payload;
        Error = error;
        Metadata = new Metadata(topic, index);
    }
}

public delegate Task ConsumerFunction(Message message);

public class Consumer
{
    public ConsumerFunction Fn { get; private set; }
    public bool Synchronous { get; private set; }
    public int CurrentIndex { get; set; }

    public Consumer(ConsumerFunction fn, bool synchronous, int currentIndex)
    {
        Fn = fn;
        Synchronous = synchronous;
        CurrentIndex = currentIndex;
    }
}

public class Stream
{
    private Dictionary<string, List<Message>> topics = new Dictionary<string, List<Message>>();
    private Dictionary<string, List<Consumer>> consumers = new Dictionary<string, List<Consumer>>();
    private int? maxMessagesPerTopic;

    public Stream(int? maxMessagesPerTopic = null)
    {
        this.maxMessagesPerTopic = maxMessagesPerTopic;
    }

    public void Produce(string topic, object payload, object error = null)
    {
        if (!topics.ContainsKey(topic))
            topics[topic] = new List<Message>();

        var index = GetLastIndex(topic) + 1;
        var message = new Message(payload, error, topic, index);

        if (maxMessagesPerTopic.HasValue && topics[topic].Count >= maxMessagesPerTopic.Value)
            topics[topic].RemoveAt(0);

        topics[topic].Add(message);
        NotifyConsumers(topic).ConfigureAwait(false);
    }

    public void Subscribe(string topic, ConsumerFunction consumerFn, bool synchronous = true)
    {
        var consumer = new Consumer(consumerFn, synchronous, GetLastIndex(topic) + 1);
        if (!consumers.ContainsKey(topic))
            consumers[topic] = new List<Consumer>();
        consumers[topic].Add(consumer);
    }

    public void Unsubscribe(string topic, ConsumerFunction consumerFn)
    {
        if (consumers.ContainsKey(topic))
            consumers[topic].RemoveAll(c => c.Fn == consumerFn);
    }

    public List<Message> GetMessageHistory(string topic)
    {
        if (topics.ContainsKey(topic))
            return topics[topic];
        return new List<Message>();
    }

    private int GetLastIndex(string topic)
    {
        if (topics.ContainsKey(topic) && topics[topic].Count > 0)
            return topics[topic][^1].Metadata.Index;
        return -1;
    }

    private async Task NotifyConsumers(string topic)
    {
        if (!consumers.ContainsKey(topic))
            return;

        foreach (var consumer in consumers[topic])
        {
            if (consumer.Synchronous)
                await HandleConsumer(consumer, topic);
            else
                _ = HandleConsumer(consumer, topic); // Fire and forget for asynchronous consumers
        }
    }

    private async Task HandleConsumer(Consumer consumer, string topic)
    {
        var messages = GetMessageHistory(topic);
        foreach (var message in messages)
        {
            if (message.Metadata.Index <= consumer.CurrentIndex)
                continue;
            try
            {
                if (consumer.Synchronous)
                    await consumer.Fn(message);
                else
                    consumer.Fn(message).ConfigureAwait(false);
            }
            catch (Exception e)
            {
                Produce("errors", null, e);
            }
        }
    }

    public async Task Close()
    {
        // TODO: cancel tasks
        this.topics = new Dictionary<string, List<Message>>();
        this.consumers = new Dictionary<string, List<Consumer>>();
    }
}
