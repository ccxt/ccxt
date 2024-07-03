using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StarkSharp.Base.Net
{
    public class NetNetworks
    {
        public const string MAINNET = "mainnet";
        public const string TESTNET = "testnet";
        public const string TESTNET2 = "testnet2";

        public class CustomGatewayUrls
        {
            public string FeederGatewayUrl { get; set; }
            public string GatewayUrl { get; set; }
        }

        public static string NetAddressFromNet(string net)
        {
            Dictionary<string, string> addresses = new Dictionary<string, string>
            {
                { MAINNET, "https://alpha-mainnet.starknet.io" },
                { TESTNET, "https://alpha4.starknet.io" },
                { TESTNET2, "https://alpha4-2.starknet.io" }
            };

            return addresses.TryGetValue(net, out var address) ? address : net;
        }

        public static string DefaultTokenAddressForNetwork(string net)
        {
            string[] predefinedNets = { MAINNET, TESTNET, TESTNET2 };

            if (!Array.Exists(predefinedNets, n => n == net))
            {
                throw new ArgumentException("Argument token_address must be specified when using a custom net address");
            }

            return Constants.FEE_CONTRACT_ADDRESS;
        }
    }

    public static class Constants
    {
        public const string FEE_CONTRACT_ADDRESS = "YOUR_FEE_CONTRACT_ADDRESS_HERE";
    }
}
