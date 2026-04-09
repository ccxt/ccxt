using System.Reflection;
using Nethereum.ABI.FunctionEncoding.Attributes;

namespace Nethereum.ABI.FunctionEncoding.AttributeEncoding
{
    public class ParameterAttributeValue
    {
        public ParameterAttribute ParameterAttribute { get; set; }
        public object Value { get; set; }
        public PropertyInfo PropertyInfo { get; set; }
    }
}