using Newtonsoft.Json;
// using StarkSharp.Rpc.Utils;

namespace StarkSharp.Connectors.Components
{
    public class ContractInteraction
    {
        public string ContractAdress { get; set; }
        public string EntryPoint { get; set; }
        public string CallData { get; set; }

        public ContractInteraction(string _ContractAdress, string _EntryPoint, object _CallData)
        {
            // ContractAdress = _ContractAdress;
            // EntryPoint = StarknetOps.CalculateFunctionSelector(_EntryPoint);
            // CallData = JsonConvert.SerializeObject(_CallData);
        }

        public ContractInteraction(string _ContractAdress, string _EntryPoint, string _CallData)
        {
            // ContractAdress = _ContractAdress;
            // EntryPoint = StarknetOps.CalculateFunctionSelector(_EntryPoint);
            // CallData = _CallData;
        }
    }
}
