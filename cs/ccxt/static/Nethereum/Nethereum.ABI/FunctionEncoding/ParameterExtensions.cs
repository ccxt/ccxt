using Nethereum.ABI.Model;

namespace Nethereum.ABI.FunctionEncoding
{
    public static class ParameterExtensions
    {
        public static string GetParameterNameUsingDefaultIfNotSet(this Parameter parameter)
        {
            if(!string.IsNullOrEmpty(parameter.Name)) return parameter.Name;
            return "param_" + parameter.Order + "_" + parameter.Type;
        }
    }
}