using Newtonsoft.Json;
using StarkSharp.Connectors.Components;

namespace StarkSharp.Components.Token
{
    public class ERCStandart
    {
        public static ContractInteraction GenerateStandartData(string contractAddress, string entryPoint, string[] callData)
        {
            string callDataString = JsonConvert.SerializeObject(callData);
            return new ContractInteraction(contractAddress, entryPoint, callDataString);
        }
    }
}
