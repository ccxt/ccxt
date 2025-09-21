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
    private Dictionary<string, int> topicIndexes;
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
        this.activeWatchFunctions = new List<Dictionary<string, object>>();
        this.topicIndexes = new Dictionary<string, int>();
    }

    public void produce(object topic2, object payload, object error = null)
    {
        string topic = topic2 as String;
        if (!topics.ContainsKey(topic))
        {
            topics[topic] = new List<Message>();
        }
        if (!topicIndexes.ContainsKey(topic))
        {
            topicIndexes[topic] = -1;
        }
        topicIndexes[topic] += 1;
        var index = topicIndexes[topic];
        var messages = topics[topic];

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

        if (messages.Count > maxMessagesPerTopic)
        {
            messages.RemoveAt(0);
        }
        if (maxMessagesPerTopic != 0)
        {
            messages.Add(message);
        }

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

    public void subscribe(object topic2, object consumerFn2, object params2 = null)
    {
        var topic = topic2 as String;
        var paramsDict = params2 as Dictionary<string, object> ?? new Dictionary<string, object>();
        var synchronous = paramsDict.ContainsKey("synchronous") ? (bool)paramsDict["synchronous"] : true;
        var consumerMaxBacklogSize = paramsDict.ContainsKey("consumerMaxBacklogSize") ? (int)paramsDict["consumerMaxBacklogSize"] : 1000;

        // Check if consumerFn2 is already a ConsumerFunction
        ConsumerFunction consumerFn = consumerFn2 as ConsumerFunction;

        // If it's not a ConsumerFunction, check if it's a Func<Message, Task>
        if (consumerFn == null && consumerFn2 is Func<Message, Task> func)
        {
            // Convert Func<Message, Task> to ConsumerFunction
            consumerFn = new ConsumerFunction(func.Invoke);
        }
        else if (consumerFn == null && consumerFn2 is Action<Message> action)
        {
            // Convert Action<Message> (void-returning) to ConsumerFunction
            consumerFn = new ConsumerFunction((msg) => { action.Invoke(msg); return Task.CompletedTask; });
        }
        if (consumerFn == null)
        {
            Console.WriteLine("Consumer function is required");
            throw new Exception("Consumer function is required");
        }
        var consumer = new Consumer(consumerFn, GetLastIndex(topic), new ConsumerOptions 
        { 
            synchronous = synchronous,
            maxBacklogSize = consumerMaxBacklogSize
        });

        if (!consumers.ContainsKey(topic))
        {
            consumers[topic] = new List<Consumer>();
        }

        consumers[topic].Add(consumer);
        if (this.verbose)
        {
            Console.WriteLine($"Subscribed Consumer {consumerFn.Method.Name} to {topic}, synchronous: {synchronous}, maxBacklogSize: {consumerMaxBacklogSize}");
        }
    }

    public bool unsubscribe(object topic2, ConsumerFunction consumerFn)
    {
        string topic = topic2 as String;
        if (consumers.ContainsKey(topic))
        {
            consumers[topic] = consumers[topic].Where(consumer => !consumer.fn.Equals(consumerFn)).ToList();
            if (this.verbose)
            {
                Console.WriteLine($"Unsubscribed {consumerFn.Method.Name} from {topic}.");
            }
            return true;
        }
        else
        {
            if (this.verbose)
            {
                Console.WriteLine($"Unable to unsubscribe {consumerFn.Method.Name} from {topic}. Consumer not found.");
            }
            return false;
        }
    }

    public List<Message> GetMessageHistory(string topic)
    {
        return topics.ContainsKey(topic) ? topics[topic] : new List<Message>();
    }

    public int GetLastIndex(string topic)
    {
        if (topicIndexes.ContainsKey(topic))
        {
            return topicIndexes[topic];
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
