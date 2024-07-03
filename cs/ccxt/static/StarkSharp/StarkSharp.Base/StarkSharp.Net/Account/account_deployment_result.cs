using StarkSharp.Base.Net.Transaction;
using System;

namespace StarkSharp.Accounts
{
    public class AccountDeploymentResult : BaseTransaction
    {
        public Account Account { get; }
        public AccountDeploymentResult(Account account)
            : base()
        {
            Account = account ?? throw new ArgumentNullException(nameof(account), "Parameter account cannot be None in AccountDeploymentResult.");
        }
    }
}
