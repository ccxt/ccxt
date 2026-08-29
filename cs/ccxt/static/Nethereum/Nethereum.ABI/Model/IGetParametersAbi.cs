using System.Collections.Generic;

namespace Nethereum.ABI.Model
{
    public interface IGetParametersAbi
    {
        List<Parameter> GetParameters();
        void SetValue(string parameterName, object value);
        object GetValue(string parameterName);
    }
}