namespace ccxt.pro;

using System;
using System.Collections.Generic;
using System.Linq;

public class Stream : IBaseStream
{
    public int maxMessagesPerTopic { get; set; }

    public bool verbose { get; set; }
    private Dictionary<string, List<Message>> topics;
    private Dictionary<string, List<Consumer>> consumers;
    public List<Dictionary<string, object>> activeWatchFunctions;
    public Stream(int? maxMessagesPerTopic = null, bool? verbose = null)
    {
        Init(maxMessagesPerTopic, verbose);
    }

    private void Init(int? maxMessagesPerTopic = null, bool? verbose = null)
    {
        this.maxMessagesPerTopic = maxMessagesPerTopic ?? 0;
        this.verbose = verbose ?? false;
        this.topics = new Dictionary<string, List<Message>>();
        this.consumers = new Dictionary<string, List<Consumer>>();
        if (verbose.HasValue && verbose.Value)
        {
            Console.WriteLine("Stream initialized");
        }
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
            payload = payload,
            error = error,
            metadata = new Metadata
            {
                stream = this,
                topic = topic,
                index = index,
                history = messages.ToList(), // Creates a shallow copy
            },
        };

        if (maxMessagesPerTopic > 0 && messages.Count >= maxMessagesPerTopic)
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
        if (this.verbose)
        {
            Console.WriteLine($"Published message to topic: {topic}");
        }
    }

    public void subscribe(object topic2, object consumerFn2, object synchronous2)
    {
        var synchronous = synchronous2 as bool? ?? true;
        var topic = topic2 as String;
        var consumerFn = consumerFn2 as ConsumerFunction;
        if (consumerFn == null)
        {
            Console.WriteLine("Consumer function is required");
            throw new Exception("Consumer function is required");
        }
        var consumer = new Consumer(consumerFn, synchronous, GetLastIndex(topic));

        if (!consumers.ContainsKey(topic))
        {
            consumers[topic] = new List<Consumer>();
        }

        consumers[topic].Add(consumer);
        if (this.verbose)
        {
            Console.WriteLine($"Subscribed Consumer {consumerFn.Method.Name} to {topic}");
        }
    }

    public void unsubscribe(object topic2, ConsumerFunction consumerFn)
    {
        string topic = topic2 as String;
        if (consumers.ContainsKey(topic))
        {
            consumers[topic] = consumers[topic].Where(consumer => !consumer.fn.Equals(consumerFn)).ToList();
            if (this.verbose)
            {
                Console.WriteLine($"Unsubscribed {consumerFn.Method.Name} from {topic}.");
            }
        }
        else
        {
            if (this.verbose)
            {
                Console.WriteLine($"Unable to unsubscribe {consumerFn.Method.Name} from {topic}. Consumer not found.");
            }
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
            return topics[topic].Last().metadata.index;
        }

        return -1;
    }

    public void addWatchFunction(string watchFn, List<object> args)
    {
        this.activeWatchFunctions.Add(new Dictionary<string, object> { { "method", watchFn }, { "args", args } });
    }

    public void close()
    {
        if (this.verbose)
        {
            Console.WriteLine("Closed Stream");
        }
        Init(maxMessagesPerTopic);
    }
}
