using ccxt;
using ccxt.pro;
namespace Tests;


public partial class BaseTest
{
        // Test case for producing a message
        public void testProduce()
        {
            var stream = new ccxt.pro.Stream(5);
            string topic = "topic1";
            object payload = "Hello, world!";
            object error = null;
            stream.produce(topic, payload, error);
            var messages = stream.GetMessageHistory(topic);
            Assert(isEqual(getArrayLength(messages), 1), "Message was not produced");
            Assert(isEqual(getValue(getValue(messages, 0), "payload"), payload), "Incorrect payload");
            Assert(isEqual(getValue(getValue(messages, 0), "error"), error), "Incorrect error");
        }
        // Test case for subscribing to a topic
        public void testSubscribe()
        {
            var stream = new ccxt.pro.Stream();
            string topic = "topic1";
            object receivedMessage = false;
            ccxt.pro.ConsumerFunction consumerFn = async (ccxt.pro.Message message) =>
            {
                receivedMessage = true;
                Assert(isEqual(message.payload, "Hello, world!"), "Incorrect payload");
            };
            stream.subscribe(topic, consumerFn);
            stream.produce(topic, "Hello, world!");
            Assert(receivedMessage, "Consumer did not receive the message");
        }
        // Test case for unsubscribing from a topic
        public void testUnsubscribe()
        {
            var stream = new ccxt.pro.Stream();
            string topic = "topic1";
            object receivedMessage = false;
            ccxt.pro.ConsumerFunction consumerFn = async (ccxt.pro.Message message) =>
            {
                receivedMessage = true;
            };
            stream.subscribe(topic, consumerFn);
            stream.unsubscribe(topic, consumerFn);
            stream.produce(topic, "Hello, world!");
            Assert(!isTrue(receivedMessage), "Consumer should not receive the message");
        }
        // Test case for closing the stream
        public void testClose()
        {
            var stream = new ccxt.pro.Stream();
            string topic = "topic1";
            object receivedMessage = false;
            ccxt.pro.ConsumerFunction consumerFn = async (ccxt.pro.Message message) =>
            {
                receivedMessage = true;
            };
            stream.subscribe(topic, consumerFn);
            stream.close();
            stream.produce(topic, "Hello, world!");
            Assert(!isTrue(receivedMessage), "Consumer should not receive the message");
        }
        // Test sync case
        public void testSyncConsumerFunction()
        {
            var stream = new ccxt.pro.Stream();
            string topic = "topic1";
            object payload = "hello world";
            ccxt.pro.ConsumerFunction syncConsumer = async (ccxt.pro.Message message) =>
            {
                Assert(message.payload == payload);
            };
            stream.subscribe(topic, syncConsumer);
            // Produce message
            stream.produce(topic, payload);
        }
        // Test async case
        public void testAsyncConsumerFunction()
        {
            var stream = new ccxt.pro.Stream();
            string topic = "topic1";
            object payload = "hello world";
            ccxt.pro.ConsumerFunction asyncConsumer = async (ccxt.pro.Message message) =>
            {
                Assert(message.payload == payload);
            };
            stream.subscribe(topic, asyncConsumer);
            // Produce message
            stream.produce(topic, payload);
        }
        // Run the tests
        public void testStream()
        {
            testProduce();
            testSubscribe();
            testUnsubscribe();
            testClose();
            testSyncConsumerFunction();
            testAsyncConsumerFunction();
        }
}
