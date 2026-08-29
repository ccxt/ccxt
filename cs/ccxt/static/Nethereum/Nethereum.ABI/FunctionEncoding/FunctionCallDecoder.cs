using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.ABI.Model;
using Nethereum.Hex.HexConvertors.Extensions;

namespace Nethereum.ABI.FunctionEncoding
{
    public class FunctionCallDecoder : ParameterDecoder
    {
        public bool IsDataForFunction(FunctionABI functionABI, string data)
        {
            return SignatureEncoder.IsDataForSignature(functionABI.Sha3Signature, data);
        }

        public bool IsDataForError(ErrorABI errorABI, string data)
        {
            return SignatureEncoder.IsDataForSignature(errorABI.Sha3Signature, data);
        }

        public List<ParameterOutput> DecodeInput(FunctionABI functionABI, string data)
        {
            return DecodeFunctionInput(functionABI.Sha3Signature, data,
                functionABI.InputParameters);
        }

        public List<ParameterOutput> DecodeError(ErrorABI errorABI, string data)
        {
            return DecodeFunctionInput(errorABI.Sha3Signature, data,
                errorABI.InputParameters);
        }

       

        public List<ParameterOutput> DecodeFunctionInput(string sha3Signature, string data,
            params Parameter[] parameters)
        {
            sha3Signature = sha3Signature.EnsureHexPrefix();
            data = data.EnsureHexPrefix();

            if (!SignatureEncoder.IsDataForSignature(sha3Signature, data)) return null;

            if (data.StartsWith(sha3Signature))
                data = data.Substring(sha3Signature.Length); //4 bytes?
            return DecodeDefaultData(data, parameters);
        }

        public T DecodeFunctionInput<T>(string sha3Signature, string data) where T : new()
        {
            return DecodeFunctionInput(new T(), sha3Signature, data);
        }

        public T DecodeFunctionInput<T>(T functionInput, string sha3Signature, string data)
        {
            sha3Signature = sha3Signature.EnsureHexPrefix();
            data = data.EnsureHexPrefix();

            if ((data == "0x") || (data == sha3Signature)) return functionInput;

            if (data.StartsWith(sha3Signature))
                data = data.Substring(sha3Signature.Length);

            var type = typeof(T);
            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);
            DecodeAttributes(data, functionInput, properties.ToArray());
            return functionInput;
        }

        public TError DecodeFunctionCustomError<TError>(TError error, string signature, string encodedErrorData)
        {
            return DecodeFunctionInput(error, signature, encodedErrorData);
        }


        public ErrorFunction DecodeFunctionError(string output)
        {
            if (ErrorFunction.IsErrorData(output))
            {
                return DecodeFunctionInput<ErrorFunction>(ErrorFunction.ERROR_FUNCTION_ID, output);
            }

            return null;
        }

        public string DecodeFunctionErrorMessage(string output)
        {
            var error = DecodeFunctionError(output);
            return error?.Message;
        }

        public void ThrowIfErrorOnOutput(string output, Exception innerException = null)
        {
            var error = DecodeFunctionError(output);
            if(error != null)
            {
                throw new SmartContractRevertException(error.Message, output, innerException);
            }
        }

        public T DecodeFunctionOutput<T>(string output) where T : new()
        {
            if (output == "0x") return default(T);
            ThrowIfErrorOnOutput(output);
            var result = new T();
            DecodeFunctionOutput(result, output);
            return result;
        }

        public T DecodeFunctionOutput<T>(T functionOutputResult, string output)
        {
            if (output == "0x")
                return functionOutputResult;
            ThrowIfErrorOnOutput(output);
            var type = typeof(T);

            var function = FunctionOutputAttribute.GetAttribute<T>();
            if (function == null)
                throw new ArgumentException($"Unable to decode to '{typeof(T).Name}' because the type does not apply attribute '[{nameof(FunctionOutputAttribute)}]'.");

            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);
            DecodeAttributes(output, functionOutputResult, properties.ToArray());

            return functionOutputResult;
        }

        /// <summary>
        ///     Decodes the output of a function using either a FunctionOutputAttribute  (T)
        ///     or the parameter casted to the type T, only one outputParameter should be used in this scenario.
        /// </summary>
        public T DecodeOutput<T>(string output, params Parameter[] outputParameter) where T : new()
        {
            if (output == "0x") return default(T);
            ThrowIfErrorOnOutput(output);
            var function = FunctionOutputAttribute.GetAttribute<T>();

            if (function == null)
            {
                if (outputParameter != null)
                {
                    if (outputParameter.Length > 1)
                        throw new Exception(
                            "Only one output parameter supported to be decoded this way, use a FunctionOutputAttribute or define each outputparameter");

                    return DecodeSimpleTypeOutput<T>(outputParameter[0], output);
                }

                return default(T);
            }
            return DecodeFunctionOutput<T>(output);
        }

        public T DecodeSimpleTypeOutput<T>(Parameter outputParameter, string output)
        {
            if (output == "0x") return default(T);
            ThrowIfErrorOnOutput(output);
            if (outputParameter != null)
            {
                outputParameter.DecodedType = typeof(T);
                var parmeterOutput = new ParameterOutput
                {
                    
                    Parameter = outputParameter
                };

                if (outputParameter.ABIType is TupleType tupleType)
                {
                    if (typeof(T) == typeof(List<ParameterOutput>))
                    {
                        var results = DecodeOutput(output, parmeterOutput);

                        if (results.Any())
                            return (T)results[0].Result;
                    }
                    else
                    {
                        return (T) DecodeAttributes(output.HexToByteArray().Skip(32).ToArray(), typeof(T));
                    }
                }
                else
                {
                    var results = DecodeOutput(output, parmeterOutput);
                    if (results.Any())
                        return (T)results[0].Result;
                }
            }

            return default(T);
        }
    }
}