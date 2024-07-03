using StarkSharp.Base.Cairo;
using StarkSharp.Base.Net.Hash;
using StarkSharp.Base.Net.Transaction;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static StarkSharp.Base.Net.Models.NetModel;
using static StarkSharp.Base.Net.Transaction.BaseTransactionComponent;

namespace StarkSharp.Base.Net
{
    public abstract class NetClient
    {
        public abstract NetNetworks net { get;  }

        public abstract StarknetBlock GetBlock(NetHash? blockHash = null, int? blockNumber = null);

        public abstract BlockTransactionTraces TraceBlockTransactions(NetHash? blockHash = null, int? blockNumber = null);

        public abstract BlockStateUpdate GetStateUpdate(NetHash? blockHash = null, int? blockNumber = null);

        public abstract int GetStorageAt(NetHash contractAddress, int key, NetHash? blockHash = null, int? blockNumber = null);

        public abstract BaseTransaction GetTransaction(NetHash txHash);

        public async Task<TransactionReceipt> GetTransactionReceipt(NetHash txHash)
        {
            var receipt = new TransactionReceipt
            {
                Id = 1,
                Jsonrpc = "2.0",
                Method = "starknet_getTransactionReceipt",
                Params = new List<string> { txHash.ToString() }
            };

            return receipt;
        }

        public async Task<TransactionReceipt> WaitForTx(NetHash txHash, bool? waitForAccept = null, float checkInterval = 2, int retries = 500)
        {
            if (checkInterval <= 0)
                throw new ArgumentException("Argument checkInterval has to be greater than 0.");
            if (retries <= 0)
                throw new ArgumentException("Argument retries has to be greater than 0.");
            if (waitForAccept is not null)
                Console.WriteLine("Parameter `waitForAccept` has been deprecated - since Starknet 0.12.0, transactions in a PENDING block have status ACCEPTED_ON_L2.");

            while (true)
            {
                try
                {
                    TransactionReceipt txReceipt = await this.GetTransactionReceipt(txHash);

                    var deprecatedStatus = BaseTransactionComponent.StatusToFinalityExecution(txReceipt.status);
                    var statusType = ConvertStringToStatusType(txReceipt.status.ToString());

                    var executionStatus = statusType.ExecutionStatus;
                    var finalityStatus = statusType.FinalityStatus;

                    if (executionStatus == TransactionExecutionStatus.REJECTED)
                        throw new TransactionRejectedError(message: txReceipt.rejectionReason);

                    if (executionStatus == TransactionExecutionStatus.REVERTED)
                        throw new TransactionRevertedError(message: txReceipt.revertError);

                    if (executionStatus == TransactionExecutionStatus.SUCCEEDED)
                        return txReceipt;

                    if (new[] { TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionFinalityStatus.ACCEPTED_ON_L1 }.Contains(finalityStatus))
                        return txReceipt;


                    retries -= 1;
                    if (retries == 0)
                        throw new TransactionNotReceivedError();

                    await Task.Delay((int)(checkInterval * 1000));
                }
                catch (TaskCanceledException)
                {
                    throw new TransactionNotReceivedError();
                }
                catch (ClientError ex)
                {
                    if ("Transaction hash not found" != ex.Message)
                        throw;
                    retries -= 1;
                    if (retries == 0)
                        throw new TransactionNotReceivedError();

                    await Task.Delay((int)(checkInterval * 1000));
                }
            }
        }
        private StatusType ConvertStringToStatusType(string status)
        {
            if (Enum.TryParse<StatusEnumType>(status, out var statusEnum))
            {
                var statusType = new StatusType();
                switch (statusEnum)
                {
                    case StatusEnumType.Status1:
                        statusType.ExecutionStatus = TransactionExecutionStatus.SUCCEEDED;
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(statusEnum), statusEnum, null);
                }
                return statusType;
            }

            throw new ArgumentException("Invalid status value.");
        }
        public abstract EstimatedFee EstimateFee(AccountTransaction tx, NetHash? blockHash = null, int? blockNumber = null);

        public abstract List<int> CallContract(NetCall call, NetHash? blockHash = null, int? blockNumber = null);

        public async Task<SentTransactionResponse> SendTransaction(NetInvoke transaction)
        {
            return await this._sendTransaction(transaction);
        }
        public abstract DeployAccountTransactionResponse DeployAccount(DeployAccount transaction);

        public abstract DeclareTransactionResponse Declare(Declare transaction);

        public abstract Task<int> GetClassHashAt(NetHash contractAddress, NetHash? blockHash = null, int? blockNumber = null);

        public abstract Task<CairoContract> GetCairoContractAt(NetHash contractAddress, NetHash? blockHash = null, int? blockNumber = null);

        public abstract Task<CairoContract> GetCairoContractByHash(NetHash classHash);

        public abstract Task<SierraCairoContract> GetSierraCairoContractAt(NetHash contractAddress, NetHash? blockHash = null, int? blockNumber = null);

        public abstract Task<SierraCairoContract> GetSierraCairoContractByHash(NetHash classHash);

        protected abstract Task<SentTransactionResponse> _sendTransaction(NetInvoke transaction);
    }
}
