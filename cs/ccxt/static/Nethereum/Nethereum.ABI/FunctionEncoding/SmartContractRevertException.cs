using System;

namespace Nethereum.ABI.FunctionEncoding
{
    public class SmartContractRevertException : Exception
    {
        private const string ERROR_PREFIX = "Smart contract error: ";
        public string RevertMessage { get; set;}
        public string EncodedData { get; set; }
        public SmartContractRevertException(string message, string encodedData, Exception innerException = null) : base(ERROR_PREFIX + message, innerException)
        {
            this.RevertMessage = message;
            this.EncodedData = encodedData;
        }
    }

   
}