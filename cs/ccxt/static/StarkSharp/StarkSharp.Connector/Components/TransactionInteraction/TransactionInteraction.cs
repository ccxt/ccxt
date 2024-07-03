using Newtonsoft.Json;
// using StarkSharp.Rpc.Utils;
using System.Collections.Generic;

namespace StarkSharp.Connectors.Components
{
    public enum CairoVersion
    {
        Version0 = 0,
        Version1 = 1
    }
    public class TransactionInteraction
    {
        public string SenderAddress { get; set; }
        public string ContractAddress { get; set; }
        public string FunctionName { get; set; }
        public string[] FunctionArgs { get; set; }
        public CairoVersion CairoVersion { get; set; }
        public string MaxFee { get; set; }
        public string ChainId { get; set; }
        public string PrivateKey { get; set; }
        public string CallData { get; set; }
        public string EntryPoint { get; set; }
        public string Version { get; set; }
        public TransactionInteraction(string senderAddress, string contractAddress, string functionName, string[] functionArgs, CairoVersion cairoVersion, string maxFee, string chainId, string privateKey, string version)
        {
            SenderAddress = senderAddress;
            ContractAddress = contractAddress;
            // FunctionName = StarknetOps.CalculateFunctionSelector(functionName);
            FunctionArgs = functionArgs;
            CairoVersion = cairoVersion;
            MaxFee = maxFee;
            Version = version;
            ChainId = chainId;
            PrivateKey = privateKey;
        }
        public TransactionInteraction(string _EntryPoint, object _CallData, List<string> data)
        {
            // EntryPoint = StarknetOps.CalculateFunctionSelector(_EntryPoint);
            CallData = JsonConvert.SerializeObject(_CallData);
        }
    }
}