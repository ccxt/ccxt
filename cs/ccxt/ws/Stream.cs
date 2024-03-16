namespace ccxt.pro;

using System;
using System.Collections.Generic;
using System.Linq;

public class Stream : IBaseStream
{
    public int MaxMessagesPerTopic { get; set; }

    private Dictionary<string, List<Message>> topics;
    private Dictionary<string, List<Consumer>> consumers;

    public Stream(int? maxMessagesPerTopic = null)
    {
        Init(maxMessagesPerTopic);
    }

    private void Init(int? maxMessagesPerTopic = null)
    {
        MaxMessagesPerTopic = maxMessagesPerTopic ?? 0;
        topics = new Dictionary<string, List<Message>>();
        consumers = new Dictionary<string, List<Consumer>>();
    }

    public void produce(object topic2, object payload, object error = null)
    {
        string topic = topic2 as String;
        if (!topics.ContainsKey(topic))
        {
            topics[topic] = new List<Message>();
        }

        var messages = topics[topic];
        var index = GetLastIndex(topic) + 1;

        var message = new Message
        {
            Payload = payload,
            Error = error,
            Metadata = new Metadata
            {
                Stream = this,
                Topic = topic,
                Index = index,
                History = messages.ToList(), // Creates a shallow copy
            },
        };

        if (MaxMessagesPerTopic > 0 && messages.Count >= MaxMessagesPerTopic)
        {
            messages.RemoveAt(0);
        }

        messages.Add(message);

        if (consumers.ContainsKey(topic))
        {
            foreach (var consumer in consumers[topic])
            {
                consumer.publish(message);
            }
        }
    }

    public void subscribe(object topic2, object consumerFn2, object synchronous2)
    {
        var synchronous = synchronous2 as bool? ?? true;
        var topic = topic2 as String;
        var consumerFn = consumerFn2 as ConsumerFunction;
        if (consumerFn == null) {
            throw new Exception("Consumer function is required");   
        }
        var consumer = new Consumer(consumerFn, synchronous, GetLastIndex(topic));

        if (!consumers.ContainsKey(topic))
        {
            consumers[topic] = new List<Consumer>();
        }

        consumers[topic].Add(consumer);
    }

    public void unsubscribe(object topic2, ConsumerFunction consumerFn)
    {
        string topic = topic2 as String;
        if (consumers.ContainsKey(topic))
        {
            consumers[topic] = consumers[topic].Where(consumer => !consumer.Fn.Equals(consumerFn)).ToList();
        }
    }

    public List<Message> GetMessageHistory(string topic)
    {
        return topics.ContainsKey(topic) ? topics[topic] : new List<Message>();
    }

    public int GetLastIndex(string topic)
    {
        if (topics.ContainsKey(topic) && topics[topic].Count > 0)
        {
            return topics[topic].Last().Metadata.Index;
        }

        return -1;
    }

    public void close()
    {
        Init(MaxMessagesPerTopic);
    }
}
