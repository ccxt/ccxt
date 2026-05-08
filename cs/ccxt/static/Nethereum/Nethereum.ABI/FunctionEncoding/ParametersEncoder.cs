using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Nethereum.ABI.Encoders;
using Nethereum.ABI.FunctionEncoding.AttributeEncoding;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.ABI.Model;
using Nethereum.ABI.Util;
using Nethereum.Util;

namespace Nethereum.ABI.FunctionEncoding
{

    public class ParametersEncoder
    {
        private readonly IntTypeEncoder intTypeEncoder;
        private readonly AttributesToABIExtractor attributesToABIExtractor;

        public ParametersEncoder()
        {
            intTypeEncoder = new IntTypeEncoder();
            attributesToABIExtractor = new AttributesToABIExtractor();
        }

        public byte[] EncodeAbiTypes(ABIType[] abiTypes, params object[] values)
        {
            if ((values == null) && (abiTypes.Length > 0))
                throw new ArgumentNullException(nameof(values), "No values specified for encoding");

            if (values == null) return new byte[] { };

            if (values.Length > abiTypes.Length)
                throw new Exception("Too many arguments: " + values.Length + " > " + abiTypes.Length);

            var staticSize = 0;
            var dynamicCount = 0;
            // calculating static size and number of dynamic params
            for (var i = 0; i < values.Length; i++)
            {
                var abiType = abiTypes[i];
                var parameterSize = abiType.FixedSize;
                if (parameterSize < 0)
                {
                    dynamicCount++;
                    staticSize += 32;
                }
                else
                {
                    staticSize += parameterSize;
                }
            }

            var encodedBytes = new byte[values.Length + dynamicCount][];

            var currentDynamicPointer = staticSize;
            var currentDynamicCount = 0;
            for (var i = 0; i < values.Length; i++)
            {
                var abiType = abiTypes[i];
                if (abiType.IsDynamic())
                {
                   var  dynamicValueBytes = abiType.Encode(values[i]);
                
                    encodedBytes[i] = intTypeEncoder.EncodeInt(currentDynamicPointer);
                    encodedBytes[values.Length + currentDynamicCount] = dynamicValueBytes;
                    currentDynamicCount++;
                    currentDynamicPointer += dynamicValueBytes.Length;
                }
                else
                {
                    try
                    {
                        encodedBytes[i] = abiType.Encode(values[i]);
                    }
                    catch (Exception ex)
                    {
                        throw new AbiEncodingException(i, abiType, values[i],
                            $"An error occurred encoding abi value. Order: '{i + 1}', Type: '{abiType.Name}', Value: '{values[i] ?? "null"}'.  Ensure the value is valid for the abi type.",
                            ex);
                    }
                }
            }
            return ByteUtil.Merge(encodedBytes);
        }

        public byte[] EncodeParameters(Parameter[] parameters, params object[] values)
        {
            return EncodeAbiTypes(parameters.Select(x => x.ABIType).ToArray(), values);
        }

        public byte[] EncodeParametersFromTypeAttributes(Type type, object instanceValue)
        {
            var parameterObjects = GetParameterAttributeValues(type, instanceValue);
            var abiParameters = GetParametersInOrder(parameterObjects);
            var objectValues = GetValuesInOrder(parameterObjects);
            return EncodeParameters(abiParameters, objectValues);
        }

        public object[] GetValuesInOrder(List<ParameterAttributeValue> parameterObjects)
        {
            return parameterObjects.OrderBy(x => x.ParameterAttribute.Order).Select(x => x.Value).ToArray();
        }

        public Parameter[] GetParametersInOrder(List<ParameterAttributeValue> parameterObjects)
        {
            return parameterObjects.OrderBy(x => x.ParameterAttribute.Order)
                .Select(x => x.ParameterAttribute.Parameter)
                .ToArray();
        }

        public List<ParameterAttributeValue> GetParameterAttributeValues(Type type, object instanceValue)
        {
            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);
            var parameterObjects = new List<ParameterAttributeValue>();

            foreach (var property in properties)
            {
                var parameterAttribute = property.GetCustomAttribute<ParameterAttribute>(true);
#if DOTNET35
                    var propertyValue = property.GetValue(instanceValue, null);
#else
                var propertyValue = property.GetValue(instanceValue);
#endif

                attributesToABIExtractor.InitTupleComponentsFromTypeAttributes(property.PropertyType, parameterAttribute.Parameter.ABIType);

                if (parameterAttribute.Parameter.ABIType is TupleType tupleType)
                {
                    propertyValue = GetTupleComponentValuesFromTypeAttributes(property.PropertyType, propertyValue);
                }

                parameterObjects.Add(new ParameterAttributeValue
                {
                    ParameterAttribute = parameterAttribute,
                    Value = propertyValue
                });
            }

            return parameterObjects;
        }

        public object[] GetTupleComponentValuesFromTypeAttributes(Type type, object instanceValue)
        {
            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);

            var propertiesInOrder = properties.Where(x => x.IsDefined(typeof(ParameterAttribute), true))
                .OrderBy(x => x.GetCustomAttribute<ParameterAttribute>(true).Order);

            var parameterObjects = new List<object>();

            foreach (var property in propertiesInOrder)
            {
                var parameterAttribute = property.GetCustomAttribute<ParameterAttribute>(true);

#if DOTNET35
                var propertyValue = property.GetValue(instanceValue, null);
#else
                var propertyValue = property.GetValue(instanceValue);
#endif

                if (parameterAttribute.Parameter.ABIType is TupleType)
                {
                    propertyValue = GetTupleComponentValuesFromTypeAttributes(property.PropertyType, propertyValue);
                }

                parameterObjects.Add(propertyValue);
            }

            return parameterObjects.ToArray();
        }
 
    }
 }

   