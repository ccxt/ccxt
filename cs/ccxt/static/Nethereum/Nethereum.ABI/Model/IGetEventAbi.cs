namespace Nethereum.ABI.Model
{
    public interface  IGetEventAbi
    {
        EventABI GetEventAbi();
        void SetValue(string parameterName, object value);
        object GetValue(string parameterName);
    }

   
}