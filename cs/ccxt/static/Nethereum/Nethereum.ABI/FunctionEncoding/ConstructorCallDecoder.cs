using System;
using System.Linq;
using Nethereum.ABI.FunctionEncoding.Attributes;

namespace Nethereum.ABI.FunctionEncoding
{
    public class ConstructorCallDecoder : ParameterDecoder
    {
        public T DecodeConstructorParameters<T>(T deploymentObject, string data)
        {
            var swarmExtractor = new ByteCodeSwarmExtractor();
            if (swarmExtractor.HasSwarmAddress(data))
            {
                return DecodeConstructorParameters(deploymentObject, swarmExtractor.GetByteCodeIncludingSwarmAddressPart(data), data);
            }
            else
            {
                var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(typeof(T));
                if (properties.Any())
                {
                    throw new Exception(
                        "Data supplied does not include a swarm address, to locate the constructor parameters");
                }
                else
                {
                    return deploymentObject;
                }
            }
        }

        public T DecodeConstructorParameters<T>(string data) where T : new()
        {
            return DecodeConstructorParameters<T>(new T(), data);
        }

        public T DecodeConstructorParameters<T>(string deploymentByteCode, string data) where T : new()
        {
            return DecodeConstructorParameters(new T(), deploymentByteCode, data);
        }

        public T DecodeConstructorParameters<T>(T deploymentObject, string deploymentByteCode, string data)
        {
            if (!deploymentByteCode.StartsWith("0x")) deploymentByteCode = "0x" + deploymentByteCode;
            if (!data.StartsWith("0x")) data = "0x" + data;

            if ((data == "0x") || (data == deploymentByteCode)) return deploymentObject;
            if (data.StartsWith(deploymentByteCode))
                data = data.Substring(deploymentByteCode.Length);
            var type = typeof(T);
            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);
            return DecodeAttributes<T>(data, deploymentObject, properties.ToArray());
        }

    }
}