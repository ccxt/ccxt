using Nethereum.ABI.FunctionEncoding;
using Nethereum.Hex.HexConvertors.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethereum.ABI.Model
{
    public static class ModelExtensions
    {
        public static FunctionABI FindFunctionABI(this ContractABI contractABI, string signature) 
        {
            foreach (var functionABI in contractABI.Functions)
            {
                if (functionABI.IsSignatureForFunction(signature))
                {
                    return functionABI;
                }
            }
            return null;
        }

        public static bool HasTheSameSignatureValues(this FunctionABI first, FunctionABI other)
        {
            if (first.Sha3Signature.ToLowerInvariant() != other.Sha3Signature.ToLowerInvariant()) return false;
            if(first.Name != other.Name) return false;
            if(!first.InputParameters.AreTheSameSignatureValues(other.InputParameters)) return false;
            if (!first.OutputParameters.AreTheSameSignatureValues(other.OutputParameters)) return false;
            return true;
        }

        public static bool HasTheSameSignatureValues(this EventABI first, EventABI other)
        {
            if (!SignatureEncoder.AreSignaturesTheSame(first.Sha3Signature, other.Sha3Signature)) return false;
            if (first.Name != other.Name) return false;
            if (!first.InputParameters.AreTheSameSignatureValues(other.InputParameters)) return false;
            return true;
        }

        public static bool HasTheSameSignatureValues(this ErrorABI first, ErrorABI other)
        {
            if (!SignatureEncoder.AreSignaturesTheSame(first.Sha3Signature, other.Sha3Signature)) return false;
            if (first.Name != other.Name) return false;
            if (!first.InputParameters.AreTheSameSignatureValues(other.InputParameters)) return false;
            return true;
        }

        public static bool AreTheSameSignatureValues(this IEnumerable<Parameter> first, IEnumerable<Parameter> other)
        {   
            if (first.Count() != other.Count()) return false;
            foreach (var parameter in first)
            {
                var otherParameter = other.FirstOrDefault(x => x.Name == parameter.Name);
                if(otherParameter == null) return false;
                if(!parameter.HasTheSameSignatureValues(otherParameter)) return false;
            }
            return true;
        }

        public static bool HasTheSameSignatureValues(this Parameter parameter, Parameter other)
        {
            if (parameter.Order != other.Order) return false;
            if (parameter.ABIType != other.ABIType) return false;
            if (parameter.Indexed != other.Indexed) return false;
            return true;
        }

        public static FunctionABI FindFunctionABIFromInputData(this ContractABI contractABI, string inputData)
        {
            if (!SignatureEncoder.ValiInputDataSignature(inputData)) return null;
            var signature = SignatureEncoder.GetSignatureFromData(inputData);
            return contractABI.FindFunctionABI(signature); 
        }

        public static List<ParameterOutput> DecodeInputDataToDefault(this FunctionABI functionABI, string inputData)
        {
            var functionCallDecoder = new FunctionCallDecoder();
            return functionCallDecoder.DecodeInput(functionABI, inputData);
        }

        public static List<ParameterOutput> DecodeOutputDataToDefault(this FunctionABI functionABI, string outputData)
        {
            var functionCallDecoder = new FunctionCallDecoder();
            return functionCallDecoder.DecodeDefaultData(outputData.HexToByteArray(), functionABI.OutputParameters);
        }

        public static JObject DecodeOutputToJObject(this FunctionABI functionABI, string data)
        {
            return DecodeOutputDataToDefault(functionABI, data).ConvertToJObject();
        }

        public static List<ParameterOutput> DecodeErrorDataToDefault(this ErrorABI errorABI, string data)
        {
            var functionCallDecoder = new FunctionCallDecoder();
            return functionCallDecoder.DecodeError(errorABI, data);
        }

        public static JObject DecodeErrorDataToDefaultToJObject(this ErrorABI errorABI, string data)
        {
            return DecodeErrorDataToDefault(errorABI, data).ConvertToJObject();
        }

        public static JObject DecodeInputToJObject(this FunctionABI functionABI, string inputData)
        {
            return DecodeInputDataToDefault(functionABI, inputData).ConvertToJObject();
        }

        public static EventABI FindEventABI(this ContractABI contractABI, string signature)
        {
            foreach (var eventABI in contractABI.Events)
            {
                if (eventABI.IsSignatureForEvent(signature))
                {
                    return eventABI;
                }
            }
            return null;
        }

        public static ErrorABI FindErrorABI(this ContractABI contractABI, string signature)
        {
            foreach (var errorAbi in contractABI.Errors)
            {
                if (errorAbi.IsSignatureForError(signature))
                {
                    return errorAbi;
                }
            }
            return null;
        }

        public static bool IsDataForFunction(this FunctionABI functionABI, string data)
        {
            if (!SignatureEncoder.ValiInputDataSignature(data)) return false;
            var sha3Signature = SignatureEncoder.GetSignatureFromData(data);
            return SignatureEncoder.AreSignaturesTheSame(functionABI.Sha3Signature, sha3Signature);
        }

        public static bool IsSignatureForFunction(this FunctionABI functionABI, string sha3Signature)
        {
            return SignatureEncoder.AreSignaturesTheSame(functionABI.Sha3Signature, sha3Signature);
        }

        public static bool IsSignatureForEvent(this EventABI eventABI, string sha3Signature)
        {
            return SignatureEncoder.AreSignaturesTheSame(eventABI.Sha3Signature, sha3Signature);
        }

        public static bool IsSignatureForError(this ErrorABI errorABI, string sha3Signature)
        {
            return SignatureEncoder.AreSignaturesTheSame(errorABI.Sha3Signature, sha3Signature);
        }
    }
}
