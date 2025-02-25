using Nethereum.ABI.FunctionEncoding.Attributes;
using System.Numerics;

namespace Nethereum.ABI.EIP712
{
    //Interface placeholder for any domain type including any optional fields
    public interface IDomain
    {

    }

    [Struct("EIP712Domain")]
    public class DomainWithVerifyingContract : IDomain
    {

        [Parameter("address", "verifyingContract", 1)]
        public virtual string VerifyingContract { get; set; }

    }

    [Struct("EIP712Domain")]
    public class DomainWithNameVersionAndChainId: IDomain
    {
        [Parameter("string", "name", 1)]
        public virtual string Name { get; set; }

        [Parameter("string", "version", 2)]
        public virtual string Version { get; set; }

        [Parameter("uint256", "chainId", 3)]
        public virtual BigInteger? ChainId { get; set; }

    }



    [Struct("EIP712Domain")]
    public class DomainWithChainIdAndVerifyingContract : IDomain
    {
        [Parameter("uint256", "chainId", 1)]
        public virtual BigInteger? ChainId { get; set; }

        [Parameter("address", "verifyingContract", 2)]
        public virtual string VerifyingContract { get; set; }

    }


    [Struct("EIP712Domain")]
    public class Domain:IDomain
    {
        [Parameter("string", "name", 1)]
        public virtual string Name { get; set; }

        [Parameter("string", "version", 2)]
        public virtual string Version { get; set; }

        [Parameter("uint256", "chainId", 3)]
        public virtual BigInteger? ChainId { get; set; }

        [Parameter("address", "verifyingContract", 4)]
        public virtual string VerifyingContract { get; set; }
       
    }

    [Struct("EIP712Domain")]
    public class DomainWithSalt:Domain
    {
        [Parameter("bytes32", "salt", 5)]
        public virtual byte[] Salt { get; set; }
    }
}