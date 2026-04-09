using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>Interface for classes implementing the Digital Signature Algorithm</summary>
    public interface IDsa
    {
        /// <summary>The algorithm name.</summary>
		string AlgorithmName { get; }

        /// <summary>Initialise the signer for signature generation or signature verification.</summary>
        /// <param name="forSigning">true if we are generating a signature, false otherwise.</param>
        /// <param name="parameters">key parameters for signature generation.</param>
        void Init(bool forSigning, ICipherParameters parameters);

        /// <summary>Sign the passed in message (usually the output of a hash function).</summary>
        /// <param name="message">the message to be signed.</param>
        /// <returns>two big integers representing the r and s values respectively.</returns>
        BigInteger[] GenerateSignature(byte[] message);

        /// <summary>The order of the group that the r, s values in signatures belong to.</summary>
        BigInteger Order { get; }

        /// <summary>Verify the message message against the signature values r and s.</summary>
        /// <param name="message">the message that was supposed to have been signed.</param>
        /// <param name="r">the r signature value.</param>
        /// <param name="s">the s signature value.</param>
        bool VerifySignature(byte[] message, BigInteger  r, BigInteger s);
    }
}
