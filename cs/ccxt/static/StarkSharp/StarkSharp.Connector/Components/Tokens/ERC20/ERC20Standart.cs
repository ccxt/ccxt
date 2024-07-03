using StarkSharp.Accounts;
using StarkSharp.Connectors.Components;

namespace StarkSharp.Components.Token.ERC20
{
    public class ERC20Standart : ERCStandart
    {
        public static ContractInteraction BalanceOf(string contractAddress, Account account) => 
            GenerateStandartData(contractAddress, "balance_of", new string[] { account.WalletAdress});

        public static ContractInteraction BalanceOf(string contractAddress, string walletAddress) => 
            GenerateStandartData(contractAddress, "balance_of", new string[] { walletAddress });

        public static ContractInteraction TransferToken(string contractAddress, string recipientAddress, string amount) => 
            GenerateStandartData(contractAddress, "transfer", new string[] { recipientAddress, amount, "0x00" });
    }
}
