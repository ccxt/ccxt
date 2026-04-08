using System.Collections.Generic;
using System.Reflection;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{
    public class ParameterAttributeIndexedTopics
    {
        public ParameterAttributeIndexedTopics()
        {
            Topics = new List<object>();
        }
        public ParameterAttribute ParameterAttribute { get; set; }
        public List<object> Topics { get; set; }
        public PropertyInfo PropertyInfo { get; set; }

        public object[] GetTopicValues()
        {
            if (Topics == null || Topics.Count == 0) return null;
            return Topics.ToArray();
        }
    }
}