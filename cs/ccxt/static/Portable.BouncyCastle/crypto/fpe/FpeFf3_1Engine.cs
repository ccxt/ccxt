using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Fpe
{
    public class FpeFf3_1Engine
        : FpeEngine
    {
        public FpeFf3_1Engine()
            : this(AesUtilities.CreateEngine())
        {
        }

        public FpeFf3_1Engine(IBlockCipher baseCipher)
            : base(baseCipher)
        {
            if (IsOverrideSet(SP80038G.FPE_DISABLED))
            {
                throw new InvalidOperationException("FPE disabled");
            }
        }

        public override void Init(bool forEncryption, ICipherParameters parameters)
        {
            this.forEncryption = forEncryption;
            this.fpeParameters = (FpeParameters)parameters;

            baseCipher.Init(!fpeParameters.UseInverseFunction, new KeyParameter(Arrays.Reverse(fpeParameters.Key.GetKey())));

            if (fpeParameters.GetTweak().Length != 7)
                throw new ArgumentException("tweak should be 56 bits");
        }

        protected override int EncryptBlock(byte[] inBuf, int inOff, int length, byte[] outBuf, int outOff)
        {
            byte[] enc;

            if (fpeParameters.Radix > 256)
            {
                if ((length & 1) != 0)
                    throw new ArgumentException("input must be an even number of bytes for a wide radix");

                ushort[] u16In = Pack.BE_To_UInt16(inBuf, inOff, length);
                ushort[] u16Out = SP80038G.EncryptFF3_1w(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(),
                    u16In, 0, u16In.Length);
                enc = Pack.UInt16_To_BE(u16Out, 0, u16Out.Length);
            }
            else
            {
                enc = SP80038G.EncryptFF3_1(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(), inBuf, inOff, length);
            }

            Array.Copy(enc, 0, outBuf, outOff, length);

            return length;
        }

        protected override int DecryptBlock(byte[] inBuf, int inOff, int length, byte[] outBuf, int outOff)
        {
            byte[] dec;

            if (fpeParameters.Radix > 256)
            {
                if ((length & 1) != 0)
                    throw new ArgumentException("input must be an even number of bytes for a wide radix");

                ushort[] u16In = Pack.BE_To_UInt16(inBuf, inOff, length);
                ushort[] u16Out = SP80038G.DecryptFF3_1w(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(),
                    u16In, 0, u16In.Length);
                dec = Pack.UInt16_To_BE(u16Out, 0, u16Out.Length);
            }
            else
            {
                dec = SP80038G.DecryptFF3_1(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(), inBuf, inOff, length);
            }

            Array.Copy(dec, 0, outBuf, outOff, length);

            return length;
        }
    }
}
