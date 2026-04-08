namespace Nethereum.ABI.Model
{
    public interface IGetErrorAbi
    {
        ErrorABI GetErrorAbi();
        void SetValue(string parameterName, object value);
        object GetValue(string parameterName);
    }

   
}