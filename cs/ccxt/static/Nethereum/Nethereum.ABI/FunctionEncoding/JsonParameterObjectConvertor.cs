using Nethereum.ABI.Model;
using Nethereum.Hex.HexConvertors.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;

namespace Nethereum.ABI.FunctionEncoding
{
    public static class JsonParameterObjectConvertor
    {
        public static object[] ConvertToFunctionInputParameterValues(this JToken jObject, FunctionABI function)
        {
            return ConvertToFunctionInputParameterValues(jObject, function.InputParameters);
        }

        public static object[] ConvertToFunctionInputParameterValues(this JToken jObject, Parameter[] parameters)
        {
            var output = new List<object>();
            var parametersInOrder = parameters.OrderBy(x => x.Order);
            foreach (var parameter in parametersInOrder)
            {
                var abiType = parameter.ABIType;
                var jToken = jObject[parameter.GetParameterNameUsingDefaultIfNotSet()];

                AddJTokenValueInputParameters(output, abiType, jToken);
            }

            return output.ToArray();
        }

        private static void AddJTokenValueInputParameters(List<object> inputParameters, ABIType abiType, JToken jToken)
        {
            var tupleAbi = abiType as TupleType;
            if (tupleAbi != null)
            {
                var tupleValue = jToken;
                inputParameters.Add(ConvertToFunctionInputParameterValues(tupleValue, tupleAbi.Components));
            }

            var arrayAbi = abiType as ArrayType;
            if (arrayAbi != null)
            {
                var array = (JArray)jToken;
                var elementType = arrayAbi.ElementType;
                var arrayOutput = new List<object>();
                foreach (var element in array)
                {
                    AddJTokenValueInputParameters(arrayOutput, elementType, element);
                }
                inputParameters.Add(arrayOutput);
            }

            if (abiType is Bytes32Type || abiType is BytesType)
            {
                var bytes = jToken.ToObject<string>().HexToByteArray();
                inputParameters.Add(bytes);
            }

            if (abiType is StringType || abiType is AddressType)
            {
                inputParameters.Add(jToken.ToObject<string>());
            }

            if (abiType is IntType)
            {
                inputParameters.Add(BigInteger.Parse(jToken.ToObject<string>()));
            }

            if (abiType is BoolType)
            {
                inputParameters.Add(jToken.ToObject<bool>());
            }
        }
    }
}
