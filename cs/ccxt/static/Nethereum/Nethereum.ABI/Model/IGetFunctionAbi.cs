namespace Nethereum.ABI.Model
{
    public interface IGetFunctionAbi
    {
        FunctionABI GetFunctionAbi();
        void SetValue(string parameterName, object value);
        object GetValue(string parameterName);
    }

   
}