using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Fpe
{
    /// <summary>Base class for format-preserving encryption.</summary>
    public abstract class FpeEngine
    {
        protected readonly IBlockCipher baseCipher;

        protected bool forEncryption;
        protected FpeParameters fpeParameters;

        protected FpeEngine(IBlockCipher baseCipher)
        {
            this.baseCipher = baseCipher;
        }

        /// <summary>
        /// Process length bytes from inBuf, writing the output to outBuf.
        /// </summary>
        /// <returns>number of bytes output.</returns>
        /// <param name="inBuf">input data.</param>  
        /// <param name="inOff">offset in input data to start at.</param>  
        /// <param name="length">number of bytes to process.</param>  
        /// <param name="outBuf">destination buffer.</param>  
        /// <param name="outOff">offset to start writing at in destination buffer.</param>  
        public virtual int ProcessBlock(byte[] inBuf, int inOff, int length, byte[] outBuf, int outOff)
        {
            if (fpeParameters == null)
                throw new InvalidOperationException("FPE engine not initialized");
            if (length < 0)
                throw new ArgumentException("cannot be negative", "length");
            if (inBuf == null)
                throw new ArgumentNullException("inBuf");
            if (outBuf == null)
                throw new ArgumentNullException("outBuf");

            Check.DataLength(inBuf, inOff, length, "input buffer too short");
            Check.OutputLength(outBuf, outOff, length, "output buffer too short");

            if (forEncryption)
            {
                return EncryptBlock(inBuf, inOff, length, outBuf, outOff);
            }
            else
            {
                return DecryptBlock(inBuf, inOff, length, outBuf, outOff);
            }
        }

        protected static bool IsOverrideSet(string propName)
        {
            string propValue = Platform.GetEnvironmentVariable(propName);

            return propValue != null && Platform.EqualsIgnoreCase("true", propValue);
        }

        /// <summary>
        /// Initialize the FPE engine for encryption/decryption.
        /// </summary>
        /// <returns>number of bytes output.</returns>
        /// <param name="forEncryption">true if initialising for encryption, false otherwise.</param>  
        /// <param name="parameters ">the key and other parameters to use to set the engine up.</param>  
        public abstract void Init(bool forEncryption, ICipherParameters parameters);

        protected abstract int EncryptBlock(byte[] inBuf, int inOff, int length, byte[] outBuf, int outOff);

        protected abstract int DecryptBlock(byte[] inBuf, int inOff, int length, byte[] outBuf, int outOff);
    }
}
