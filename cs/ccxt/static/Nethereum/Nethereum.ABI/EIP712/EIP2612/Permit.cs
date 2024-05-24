using Nethereum.ABI.FunctionEncoding.Attributes;
using System.Numerics;

namespace Nethereum.ABI.EIP712.EIP2612
{
    [Struct("Permit")]
    public class Permit
    {
        [Parameter("address", "owner", 1)]
        public string Owner { get; set; }

        [Parameter("address", "spender", 2)]
        public string Spender { get; set; }

        [Parameter("uint256", "value", 3)]
        public BigInteger Value { get; set; }

        [Parameter("uint256", "nonce", 4)]
        public BigInteger Nonce { get; set; }

        [Parameter("uint256", "deadline", 5)]
        public BigInteger Deadline { get; set; }

    }

}
