using StarkSharp.Base.Net.Exception;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StarkSharp.Base.Net.Transaction
{
    public class BaseTransactionComponent
    {
        public class TransactionReceipt
        {
            public int Id { get; set; }
            public string Jsonrpc { get; set; }
            public string Method { get; set; }
            public List<string> Params { get; set; }
            public TransactionFinalityStatus? finalityStatus { get; set; }
            public TransactionExecutionStatus? executionStatus { get; set; }
            public BaseTransactionComponent.StatusType status { get; set; }
            public string rejectionReason { get; set; }
            public string revertError { get; set; }
        }

        public enum TransactionFinalityStatus
        {
            ACCEPTED_ON_L1,
            ACCEPTED_ON_L2,
            Unknown
        }

        public enum TransactionExecutionStatus
        {
            SUCCEEDED,
            REJECTED,
            REVERTED,
            Status1Execution,
            Status2Execution,
            Unknown
        }

        public class SentTransactionResponse { }
        public class EstimatedFee { }

        public class NetCall { }

        public class NetInvoke { }

        public class TransactionRejectedError : NetException
        {
            public TransactionRejectedError(string message) : base(message) { }
        }

        public class TransactionRevertedError : NetException
        {
            public TransactionRevertedError(string message) : base(message) { }
        }

        public class TransactionNotReceivedError : NetException
        {
            public TransactionNotReceivedError() : base("Transaction not received within the given retries.") { }
        }

        public static (TransactionFinalityStatus, TransactionExecutionStatus) StatusToFinalityExecution(StatusType status)
        {
            TransactionFinalityStatus finalityStatus;
            TransactionExecutionStatus executionStatus;

            switch (status.ExecutionStatus)
            {
                case TransactionExecutionStatus.SUCCEEDED:
                    executionStatus = TransactionExecutionStatus.SUCCEEDED;
                    break;
                case TransactionExecutionStatus.REJECTED:
                    executionStatus = TransactionExecutionStatus.REJECTED;
                    break;
                case TransactionExecutionStatus.REVERTED:
                    executionStatus = TransactionExecutionStatus.REVERTED;
                    break;
                default:
                    executionStatus = TransactionExecutionStatus.Unknown;
                    break;
            }

            switch (status.FinalityStatus)
            {
                case TransactionFinalityStatus.ACCEPTED_ON_L1:
                    finalityStatus = TransactionFinalityStatus.ACCEPTED_ON_L1;
                    break;
                case TransactionFinalityStatus.ACCEPTED_ON_L2:
                    finalityStatus = TransactionFinalityStatus.ACCEPTED_ON_L2;
                    break;
                default:
                    finalityStatus = TransactionFinalityStatus.Unknown;
                    break;
            }

            return (finalityStatus, executionStatus);
        }

        public enum FinalityStatus { Status1Finality, Status2Finality, Unknown }
        public enum ExecutionStatus { Status1Execution, Status2Execution, Unknown }
        public enum StatusEnumType
        {
            Status1,
            Status2
        }
        public class StatusType
        {
            public TransactionExecutionStatus ExecutionStatus { get; set; }
            public TransactionFinalityStatus FinalityStatus { get; set; }
        }
    }
}
