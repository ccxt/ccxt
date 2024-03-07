using System;
using System.Linq;
using System.Text;
using Nethereum.ABI.Model;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Util;

namespace Nethereum.ABI.FunctionEncoding
{
    public class SignatureEncoder
    {
        private readonly Sha3Keccack sha3Keccack;

        public static string ConvertToStringKey(string signature)
        {
            signature = signature.EnsureHexPrefix();
            return signature.ToLower();
        }
        public static bool IsDataForSignature(string sha3Signature, string data)
        {
            sha3Signature = ConvertToStringKey(sha3Signature);
            if (sha3Signature.Length < 10) return false; //not a valid signature length
            data = data.EnsureHexPrefix();

            if (data == "0x") return false;

            if (data.IsTheSameHex(sha3Signature)) return true;

            if (data.ToLower().StartsWith(sha3Signature.ToLower())) return true;

            return false;
        }

        public static bool AreSignaturesTheSame(string sha3Signature, string otherSignature)
        {
            return sha3Signature.IsTheSameHex(otherSignature);
        }

        public static bool ValiSignatureLengthFunction(string sha3Signature)
        {
            sha3Signature = sha3Signature.EnsureHexPrefix();
            return sha3Signature.Length == 10;
        }
        public static string GetSignatureFromData(string data)
        {
            if (string.IsNullOrEmpty(data)) throw new Exception("Invalid data cannot be null");

            data = data.EnsureHexPrefix();
            if (data.Length < 10) throw new Exception("Invalid data cannot be less than 4 bytes or 8 hex characters");
            return data.Substring(0, 10);
        }

        public static bool ValiInputDataSignature(string data)
        {
            if (string.IsNullOrEmpty(data)) return false;
            data = data.EnsureHexPrefix();
            if (data.Length < 10) return false;
            return true;
        }

        public SignatureEncoder()
        {
            sha3Keccack = new Sha3Keccack();
        }

        public string GenerateSha3Signature(string name, Parameter[] parameters)
        {
            var signature = GenerateSignature(name, parameters);
            return sha3Keccack.CalculateHash(signature);
        }

        public string GenerateSha3Signature(string name, Parameter[] parameters, int numberOfFirstBytes)
        {
            return GenerateSha3Signature(name, parameters).Substring(0, numberOfFirstBytes*2);
        }

        public virtual string GenerateSignature(string name, Parameter[] parameters)
        {
            var signature = new StringBuilder();
            signature.Append(name);
            signature.Append(GenerateParametersSignature(parameters));
            return signature.ToString();
        }

        public virtual string GenerateParametersSignature(Parameter[] parameters)
        {
            var signature = new StringBuilder();
            signature.Append("(");
            if (parameters != null)
            {
                var paramslist = parameters.OrderBy(x => x.Order).Select(GenerateParameteSignature).ToArray();
                var paramNames = string.Join(",", paramslist);
                signature.Append(paramNames);
            }
            signature.Append(")");
            return signature.ToString();
        }

        public virtual string GenerateParameteSignature(Parameter parameter)
        {
            if(parameter.ABIType is TupleType tupleType)
            {
                return GenerateParametersSignature(tupleType.Components);
            }

            var arrayType = parameter.ABIType as ArrayType;

            while (arrayType != null)
            {
                if (arrayType.ElementType is TupleType arrayTupleType)
                {
                    return GenerateParametersSignature(arrayTupleType.Components) + parameter.ABIType.CanonicalName.Replace("tuple", "");
                }
                else
                {
                    arrayType = arrayType.ElementType as ArrayType;
                }
            }

            return parameter.ABIType.CanonicalName;
        }
    }
}