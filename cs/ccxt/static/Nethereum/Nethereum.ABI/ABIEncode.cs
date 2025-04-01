using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using Nethereum.ABI.Decoders;
using Nethereum.ABI.FunctionEncoding;
using Nethereum.ABI.Model;
using Nethereum.ABI.Util;
using Nethereum.Util;

namespace Nethereum.ABI
{
    public class ABIEncode
    {

        public byte[] GetSha3ABIEncodedPacked(params ABIValue[] abiValues)
        {
            return new Sha3Keccack().CalculateHash(GetABIEncodedPacked(abiValues));
        }

        public byte[] GetSha3ABIEncodedPacked(params object[] values)
        {
            return new Sha3Keccack().CalculateHash(GetABIEncodedPacked(values));
        }

        public byte[] GetSha3ABIEncoded(params ABIValue[] abiValues)
        {
            return new Sha3Keccack().CalculateHash(GetABIEncoded(abiValues));
        }

        public byte[] GetSha3ABIEncoded(params object[] values)
        {
            return new Sha3Keccack().CalculateHash(GetABIEncoded(values));
        }

        public byte[] GetSha3ABIParamsEncodedPacked<T>(T input)
        {
            return new Sha3Keccack().CalculateHash(GetABIParamsEncodedPacked<T>(input));
        }

        public byte[] GetSha3ABIParamsEncoded<T>(T input)
        {
            return new Sha3Keccack().CalculateHash(GetABIParamsEncoded<T>(input));
        }

        public byte[] GetABIEncodedPacked(params ABIValue[] abiValues)
        {
            var result = new List<byte>();
            foreach (var abiValue in abiValues)
            {
                result.AddRange(abiValue.ABIType.EncodePacked(abiValue.Value));
            }
            return result.ToArray();
        }


        public byte[] GetABIEncoded(params ABIValue[] abiValues)
        {
            var parameters = new List<Parameter>();
            var values = new List<object>();
            var order = 1;
            foreach (var abiValue in abiValues)
            {
                parameters.Add(new Parameter(abiValue.ABIType.Name, order));
                values.Add(abiValue.Value);
                order = order + 1;
            }

            return new ParametersEncoder().EncodeParameters(parameters.ToArray(), values.ToArray());
        }

        public byte[] GetABIEncoded(params object[] values)
        {
            return GetABIEncoded(ConvertValuesToDefaultABIValues(values).ToArray());
        }

        public byte[] GetABIParamsEncodedPacked<T>(T input)
        {
            var type = typeof(T);
            var parametersEncoder = new ParametersEncoder();
            var parameterObjects = parametersEncoder.GetParameterAttributeValues(type, input).OrderBy(x => x.ParameterAttribute.Order);

            var result = new List<byte>();

            foreach (var abiParameter in parameterObjects)
            {
                var abiType = abiParameter.ParameterAttribute.Parameter.ABIType;
                var value = abiParameter.Value;

                result.AddRange(abiType.EncodePacked(value));
                
            }
            return result.ToArray();
        }

        public byte[] GetABIParamsEncoded<T>(T input)
        {
            var type = typeof(T);
            return new ParametersEncoder().EncodeParametersFromTypeAttributes(type, input);
        }

        private List<ABIValue> ConvertValuesToDefaultABIValues(params object[] values)
        {
            var abiValues = new List<ABIValue>();
            foreach (var value in values)
            {
                if (value is BigInteger bigIntValue)
                {
                    if (bigIntValue >= 0)
                    {
                        abiValues.Add(new ABIValue(new IntType("uint256"), bigIntValue));
                    }
                    else
                    {
                        abiValues.Add(new ABIValue(new IntType("int256"), bigIntValue));
                    }
                }


                if (value.IsNumber())
                {
                    var bigInt = BigInteger.Parse(value.ToString());
                    if (bigInt >= 0)
                    {
                        abiValues.Add(new ABIValue(new IntType("uint256"), value));
                    }
                    else
                    {
                        abiValues.Add(new ABIValue(new IntType("int256"), value));
                    }
                }

                if (value is string)
                {
                    abiValues.Add(new ABIValue(new StringType(), value));
                }

                if (value is bool)
                {
                    abiValues.Add(new ABIValue(new BoolType(), value));
                }

                if (value is byte[])
                {
                    abiValues.Add(new ABIValue(new BytesType(), value));
                }
            }

            return abiValues;
        }

        public byte[] GetABIEncodedPacked(params object[] values)
        {
            var abiValues = ConvertValuesToDefaultABIValues(values);
            return GetABIEncodedPacked(abiValues.ToArray());
        }

        /// <summary>
        /// If you have multiple parameters encoded use a custom type with Parameter attributes to decode them, similar to a FunctionMessage
        /// </summary>
        public T DecodeEncodedComplexType<T>(byte[] encoded)
        {
            var tupleDecoder = new TupleTypeDecoder();
            return tupleDecoder.DecodeComplexType<T>(encoded);
        }

        public BigInteger DecodeEncodedBigInteger(byte[] encoded)
        {
            var intTypeDecoder = new IntTypeDecoder();
            return intTypeDecoder.Decode<BigInteger>(encoded);
        }

        public string DecodeEncodedAddress(byte[] encoded)
        {
            var decoder = new AddressTypeDecoder();
            return decoder.Decode<string>(encoded);
        }

        public bool DecodeEncodedBoolean(byte[] encoded)
        {
            var decoder = new BoolTypeDecoder();
            return decoder.Decode<bool>(encoded);
        }

        public string DecodeEncodedString(byte[] encoded)
        {
            var decoder = new StringBytes32Decoder();
            return decoder.Decode(encoded);
        }

    }
}