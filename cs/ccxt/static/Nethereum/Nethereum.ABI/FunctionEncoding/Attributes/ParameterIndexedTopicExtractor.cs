using System;
using System.Collections.Generic;
using System.Reflection;
using Nethereum.ABI.FunctionEncoding.AttributeEncoding;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{
    public static class ParameterIndexedTopicExtractor
    {
        public static List<ParameterAttributeIndexedTopics> GetParameterIndexedTopics(Type type, object instanceValue)
        {
            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);
            var parameterObjects = new List<ParameterAttributeIndexedTopics>();

            foreach (var property in properties)
            {
                var parameterAttribute = property.GetCustomAttribute<ParameterAttribute>(true);

                if (parameterAttribute.Parameter.Indexed)
                {
                    parameterObjects.Add(new ParameterAttributeIndexedTopics
                    {
                        ParameterAttribute  = parameterAttribute,
                        PropertyInfo = property
                    });
                }
            }
            return parameterObjects;
        }
    }
}