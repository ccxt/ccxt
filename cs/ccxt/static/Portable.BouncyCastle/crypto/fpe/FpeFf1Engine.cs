using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Crypto.Fpe
{
    public class FpeFf1Engine
        : FpeEngine
    {
        public FpeFf1Engine()
            : this(AesUtilities.CreateEngine())
        {
        }

        public FpeFf1Engine(IBlockCipher baseCipher)
            : base(baseCipher)
        {
            if (IsOverrideSet(SP80038G.FPE_DISABLED) ||
                IsOverrideSet(SP80038G.FF1_DISABLED))
            {
                throw new InvalidOperationException("FF1 encryption disabled");
            }
        }

        public override void Init(bool forEncryption, ICipherParameters parameters)
        {
            this.forEncryption = forEncryption;
            this.fpeParameters = (FpeParameters)parameters;

            baseCipher.Init(!fpeParameters.UseInverseFunction, fpeParameters.Key);
        }

        protected override int EncryptBlock(byte[] inBuf, int inOff, int length, byte[] outBuf, int outOff)
        {
            byte[] enc;

            if (fpeParameters.Radix > 256)
            {
                if ((length & 1) != 0)
                    throw new ArgumentException("input must be an even number of bytes for a wide radix");

                ushort[] u16In = Pack.BE_To_UInt16(inBuf, inOff, length);
                ushort[] u16Out = SP80038G.EncryptFF1w(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(),
                    u16In, 0, u16In.Length);
                enc = Pack.UInt16_To_BE(u16Out, 0, u16Out.Length);
            }
            else
            {
                enc = SP80038G.EncryptFF1(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(), inBuf, inOff, length);
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
                ushort[] u16Out = SP80038G.DecryptFF1w(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(),
                    u16In, 0, u16In.Length);
                dec = Pack.UInt16_To_BE(u16Out, 0, u16Out.Length);
            }
            else
            {
                dec = SP80038G.DecryptFF1(baseCipher, fpeParameters.Radix, fpeParameters.GetTweak(), inBuf, inOff, length);
            }

            Array.Copy(dec, 0, outBuf, outOff, length);

            return length;
        }
    }
}
