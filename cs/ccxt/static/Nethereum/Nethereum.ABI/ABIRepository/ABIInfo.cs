
using Nethereum.ABI.ABIDeserialisation;
using Nethereum.ABI.Model;
using Newtonsoft.Json;
using System;

namespace Nethereum.ABI.ABIRepository
{
    public class ABIInfo
    {
        [JsonProperty("abi")]
        public string ABI { get; set; }

        [JsonProperty("contractName")]
        public string ContractName { get; set; }

        [JsonProperty("contractType")]
        public string ContractType { get; set; }

        [JsonProperty("address")]
        public string Address { get; set; }

        [JsonProperty("chainId")]
        public long? ChainId { get; set; }

        [JsonIgnore]
        public ContractABI ContractABI { get; set; }

        [JsonProperty("metadata")]
        public CompilationMetadata.CompilationMetadata Metadata { get; set; }

        public void InitialiseContractABI(bool force = false)
        {
            if (ContractABI == null || force == true)
            {
                if (!string.IsNullOrEmpty(ABI))
                {
                    ContractABI = ABIDeserialiserFactory.DeserialiseContractABI(ABI);
                }
                else
                {
                    if (Metadata?.Output?.Abi != null)
                    {
                        ABI = Metadata.Output.Abi.ToString(Formatting.None);
                        ContractABI = ABIDeserialiserFactory.DeserialiseContractABI(ABI);
                    }
                }

            }
        }

        public static ABIInfo FromCompilationMetadata(CompilationMetadata.CompilationMetadata compilationMetadata, string address, string contractName, string contractType, long? chainId)
        {
            var contractABIInformation = new ABIInfo();
            if (compilationMetadata == null) throw new ArgumentNullException(nameof(compilationMetadata));
            contractABIInformation.Metadata = compilationMetadata;
            contractABIInformation.InitialiseContractABI();
            contractABIInformation.ContractName = contractName;
            contractABIInformation.Address = address;
            contractABIInformation.ContractType = contractType;
            contractABIInformation.ChainId = chainId;
            return contractABIInformation;
        }

        public static ABIInfo FromABI(string abi, string address, string contractName, string contractType, long? chainId)
        {
            var contractABIInformation = new ABIInfo();
            if (abi == null) throw new ArgumentNullException(nameof(abi));
            contractABIInformation.ABI = abi;
            contractABIInformation.InitialiseContractABI();
            contractABIInformation.ContractName = contractName;
            contractABIInformation.Address = address;
            contractABIInformation.ContractType = contractType;
            contractABIInformation.ChainId = chainId;
            return contractABIInformation;
        }

        public static ABIInfo FromABI(string abi)
        {
            var contractABIInformation = new ABIInfo();
            if (abi == null) throw new ArgumentNullException(nameof(abi));
            contractABIInformation.ABI = abi;
            return contractABIInformation;
        }
    }
}
