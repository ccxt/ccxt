using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /// <remarks>A class that provides a basic DESede (or Triple DES) engine.</remarks>
    public class DesEdeEngine
        : DesEngine
    {
        private int[] workingKey1, workingKey2, workingKey3;
        private bool forEncryption;

        /**
        * initialise a DESede cipher.
        *
        * @param forEncryption whether or not we are for encryption.
        * @param parameters the parameters required to set up the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public override void Init(
            bool				forEncryption,
            ICipherParameters	parameters)
        {
            if (!(parameters is KeyParameter))
                throw new ArgumentException("invalid parameter passed to DESede init - " + Platform.GetTypeName(parameters));

            byte[] keyMaster = ((KeyParameter)parameters).GetKey();
            if (keyMaster.Length != 24 && keyMaster.Length != 16)
                throw new ArgumentException("key size must be 16 or 24 bytes.");

            this.forEncryption = forEncryption;

            byte[] key1 = new byte[8];
            Array.Copy(keyMaster, 0, key1, 0, key1.Length);
            workingKey1 = GenerateWorkingKey(forEncryption, key1);

            byte[] key2 = new byte[8];
            Array.Copy(keyMaster, 8, key2, 0, key2.Length);
            workingKey2 = GenerateWorkingKey(!forEncryption, key2);

            if (keyMaster.Length == 24)
            {
                byte[] key3 = new byte[8];
                Array.Copy(keyMaster, 16, key3, 0, key3.Length);
                workingKey3 = GenerateWorkingKey(forEncryption, key3);
            }
            else        // 16 byte key
            {
                workingKey3 = workingKey1;
            }
        }

        public override string AlgorithmName
        {
            get { return "DESede"; }
        }

        public override int GetBlockSize()
        {
            return BLOCK_SIZE;
        }

        public override int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {
            if (workingKey1 == null)
                throw new InvalidOperationException("DESede engine not initialised");

            Check.DataLength(input, inOff, BLOCK_SIZE, "input buffer too short");
            Check.OutputLength(output, outOff, BLOCK_SIZE, "output buffer too short");

            uint hi32 = Pack.BE_To_UInt32(input, inOff);
            uint lo32 = Pack.BE_To_UInt32(input, inOff + 4);

            if (forEncryption)
            {
                DesFunc(workingKey1, ref hi32, ref lo32);
                DesFunc(workingKey2, ref hi32, ref lo32);
                DesFunc(workingKey3, ref hi32, ref lo32);
            }
            else
            {
                DesFunc(workingKey3, ref hi32, ref lo32);
                DesFunc(workingKey2, ref hi32, ref lo32);
                DesFunc(workingKey1, ref hi32, ref lo32);
            }

            Pack.UInt32_To_BE(hi32, output, outOff);
            Pack.UInt32_To_BE(lo32, output, outOff + 4);

            return BLOCK_SIZE;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (workingKey1 == null)
                throw new InvalidOperationException("DESede engine not initialised");

            Check.DataLength(input, BLOCK_SIZE, "input buffer too short");
            Check.OutputLength(output, BLOCK_SIZE, "output buffer too short");

            uint hi32 = Pack.BE_To_UInt32(input);
            uint lo32 = Pack.BE_To_UInt32(input[4..]);

            if (forEncryption)
            {
                DesFunc(workingKey1, ref hi32, ref lo32);
                DesFunc(workingKey2, ref hi32, ref lo32);
                DesFunc(workingKey3, ref hi32, ref lo32);
            }
            else
            {
                DesFunc(workingKey3, ref hi32, ref lo32);
                DesFunc(workingKey2, ref hi32, ref lo32);
                DesFunc(workingKey1, ref hi32, ref lo32);
            }

            Pack.UInt32_To_BE(hi32, output);
            Pack.UInt32_To_BE(lo32, output[4..]);

            return BLOCK_SIZE;
        }
#endif
    }
}
