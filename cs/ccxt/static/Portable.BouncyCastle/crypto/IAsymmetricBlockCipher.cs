using System;

namespace Org.BouncyCastle.Crypto
{
	/// <remarks>Base interface for a public/private key block cipher.</remarks>
	public interface IAsymmetricBlockCipher
    {
		/// <summary>The name of the algorithm this cipher implements.</summary>
        string AlgorithmName { get; }

		/// <summary>Initialise the cipher.</summary>
		/// <param name="forEncryption">Initialise for encryption if true, for decryption if false.</param>
		/// <param name="parameters">The key or other data required by the cipher.</param>
        void Init(bool forEncryption, ICipherParameters parameters);

		/// <returns>The maximum size, in bytes, an input block may be.</returns>
        int GetInputBlockSize();

		/// <returns>The maximum size, in bytes, an output block will be.</returns>
		int GetOutputBlockSize();

		/// <summary>Process a block.</summary>
		/// <param name="inBuf">The input buffer.</param>
		/// <param name="inOff">The offset into <paramref>inBuf</paramref> that the input block begins.</param>
		/// <param name="inLen">The length of the input block.</param>
		/// <exception cref="InvalidCipherTextException">Input decrypts improperly.</exception>
		/// <exception cref="DataLengthException">Input is too large for the cipher.</exception>
        byte[] ProcessBlock(byte[] inBuf, int inOff, int inLen);
    }
}
