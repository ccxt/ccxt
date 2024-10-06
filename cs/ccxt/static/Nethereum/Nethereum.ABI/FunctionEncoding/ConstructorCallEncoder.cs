using System.Reflection;
using Nethereum.ABI.Model;
using Nethereum.Hex.HexConvertors.Extensions;

namespace Nethereum.ABI.FunctionEncoding
{
    public class ConstructorCallEncoder : ParametersEncoder
    {
        public string EncodeRequest<T>(T constructorInput, string contractByteCode)
        {
            var type = typeof(T);
            var encodedParameters = EncodeParametersFromTypeAttributes(type, constructorInput);
            return EncodeRequest(contractByteCode, encodedParameters.ToHex());
        }

        public string EncodeRequest(string contractByteCode, Parameter[] parameters, params object[] values)
        {
            var parametersEncoded = "";
            if (values != null)
                parametersEncoded = EncodeParameters(parameters, values).ToHex();

            return EncodeRequest(contractByteCode, parametersEncoded);
        }

        public string EncodeRequest(string contractByteCode, string encodedParameters)
        {
            ByteCodeLibraryLinker.EnsureDoesNotContainPlaceholders(contractByteCode);

            var prefix = "0x";

            if (contractByteCode.StartsWith(prefix))
                prefix = "";

            return prefix + contractByteCode + encodedParameters;
        }
    }
}