using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.ABI.Model;

namespace Nethereum.ABI.FunctionEncoding
{
    public class EventTopicDecoder : ParameterDecoder
    {
        private readonly bool _isAnonymousEvent;

        public EventTopicDecoder() : this(false)
        {
        }

        public EventTopicDecoder(bool isAnonymousEvent)
        {
            _isAnonymousEvent = isAnonymousEvent;
        }

        public T DecodeTopics<T>(object[] topics, string data) where T : new()
        {
            var result = new T();
            return DecodeTopics<T>(result, topics, data);
        }

        public List<ParameterOutput> DecodeDefaultTopics(EventABI eventABI, object[] topics, string data)
        {
            return DecodeDefaultTopics(eventABI.InputParameters, topics, data);
        }

        public List<ParameterOutput> DecodeDefaultTopics(Parameter[] inputParameters, object[] topics, string data)
        {
            var parameterOutputs = new List<ParameterOutput>();

            var indexedParameters = inputParameters.Where(x => x.Indexed == true).OrderBy(x => x.Order).ToArray();
            var dataParameters = inputParameters.Where(x => x.Indexed == false).OrderBy(x => x.Order).ToArray();

            // Take one off topics count to skip signature
            var topicCount = (topics.Length - 1);
            var indexedPropertiesCount = indexedParameters.Length;

            if (indexedPropertiesCount != (topicCount))
                throw new Exception($"Number of indexes don't match the number of topics. Indexed Properties {indexedPropertiesCount}, Topics : {topicCount}");

            var topicNumber = 0;
            foreach (var topic in topics)
            {
                //skip the first one as it is the signature
                if (topicNumber > 0)
                {
                    var parameter = indexedParameters[topicNumber - 1];

                    //skip dynamic types as the topic value is the sha3 keccak
                    if (!parameter.ABIType.IsDynamic())
                    {
                        parameterOutputs.Add(DecodeDefaultData(topic.ToString(), parameter).FirstOrDefault());
                    }
                    else
                    {
                        var parameterOutput = new ParameterOutput() { Parameter = parameter, Result = topic.ToString() };
                        parameterOutputs.Add(parameterOutput);
                    }
                }
                topicNumber = topicNumber + 1;
            }
            parameterOutputs.AddRange(DecodeDefaultData(data, dataParameters.ToArray()));
            return parameterOutputs;
        }

        public T DecodeTopics<T>(T eventDTO, object[] topics, string data)
        {
            var type = typeof(T);

            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);

            var indexedProperties = properties.Where(x => x.GetCustomAttribute<ParameterAttribute>(true).Parameter.Indexed == true).OrderBy(x => x.GetCustomAttribute<ParameterAttribute>(true).Order).ToArray();
            var dataProperties = properties.Where(x => x.GetCustomAttribute<ParameterAttribute>(true).Parameter.Indexed == false).OrderBy(x => x.GetCustomAttribute<ParameterAttribute>(true).Order).ToArray();

            // Take one off topics count to skip signature if event is not anonymous
            var topicCount = !_isAnonymousEvent ? (topics.Length - 1) : topics.Length;
            var indexedPropertiesCount = indexedProperties.Length;

            if (indexedPropertiesCount != (topicCount))
                throw new Exception($"Number of indexes don't match the number of topics. Indexed Properties {indexedPropertiesCount}, Topics : {topicCount}");

            var topicNumber = 0;
            foreach (var topic in topics)
            {
                //skip the first one as it is the signature for not anonymous events
                if (!_isAnonymousEvent && topicNumber == 0)
                {
                    topicNumber = topicNumber + 1;
                    continue;
                }

                var property = _isAnonymousEvent ? indexedProperties[topicNumber] : indexedProperties[topicNumber - 1];
                var attribute = property.GetCustomAttribute<ParameterAttribute>(true);
                //skip dynamic types as the topic value is the sha3 keccak
                if (!attribute.Parameter.ABIType.IsDynamic())
                {
                    eventDTO = DecodeAttributes(topic.ToString(), eventDTO, property);
                }
                else
                {
                    if (property.PropertyType != typeof(string))
                        throw new Exception(
                            "Indexed Dynamic Types (string, arrays) value is the Keccak SHA3 of the value, the property type of " +
                            property.Name + " should be a string");
#if DOTNET35
                        property.SetValue(eventDTO, topic.ToString(), null);
#else
                    property.SetValue(eventDTO, topic.ToString());
#endif
                }

                topicNumber = topicNumber + 1;
            }
            eventDTO = DecodeAttributes(data, eventDTO, dataProperties.ToArray());
            return eventDTO;
        }
    }
}
