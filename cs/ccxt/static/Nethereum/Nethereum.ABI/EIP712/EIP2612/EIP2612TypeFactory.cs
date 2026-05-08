using Nethereum.ABI.FunctionEncoding.Attributes;
using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;

namespace Nethereum.ABI.EIP712.EIP2612
{
    /// <summary>
    /// The type factory creates a new TypeDefinition to work with EIP2612.
    /// https://eips.ethereum.org/EIPS/eip-2612
    /// ERC-20 approvals via secp256k1 signatures
    /// This ERC extends the ERC-20 standard with a new function permit, which allows users to modify the allowance mapping using a signed message, instead of through msg.sender.
    /// 
    /// </summary>
    public static class EIP2612TypeFactory
    {
        public static TypedData<Domain> GetTypedDefinition()
        {
            return new TypedData<Domain>
            {
                Domain = new Domain
                {
                    Name = null,
                    Version = "1",
                    ChainId = 1,
                    VerifyingContract = null
                },
                Types = MemberDescriptionFactory.GetTypesMemberDescription(typeof(Domain), typeof(Permit)),
                PrimaryType = nameof(Permit),
            };
        }
    }

}
