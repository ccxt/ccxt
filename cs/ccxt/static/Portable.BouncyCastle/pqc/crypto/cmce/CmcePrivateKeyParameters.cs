using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    public class CmcePrivateKeyParameters
        : CmceKeyParameters
    {
        private byte[] privateKey;

        public byte[] PrivateKey => Arrays.Clone(privateKey);

        public CmcePrivateKeyParameters(CmceParameters parameters, byte[] privateKey)
            : base(true, parameters)
        {
            this.privateKey = Arrays.Clone(privateKey);
        }

        public CmcePrivateKeyParameters(CmceParameters parameters, byte[] delta, byte[] C, byte[] g, byte[] alpha,
            byte[] s)
            : base(true, parameters)
        {
            int sk_size = delta.Length + C.Length + g.Length + alpha.Length + s.Length;
            privateKey = new byte[sk_size];
            int offset = 0;
            Array.Copy(delta, 0, privateKey, offset, delta.Length);
            offset += delta.Length;
            Array.Copy(C, 0, privateKey, offset, C.Length);
            offset += C.Length;
            Array.Copy(g, 0, privateKey, offset, g.Length);
            offset += g.Length;
            Array.Copy(alpha, 0, privateKey, offset, alpha.Length);
            offset += alpha.Length;
            Array.Copy(s, 0, privateKey, offset, s.Length);

        }

        public byte[] ReconstructPublicKey()
        {
            CmceEngine engine = Parameters.Engine;
            byte[] pk = new byte[engine.PublicKeySize];
            engine.GeneratePublicKeyFromPrivateKey(privateKey);
            return pk;
        }

        public byte[] GetEncoded()
        {
            return Arrays.Clone(privateKey);
        }

        public byte[] Delta => Arrays.CopyOfRange(privateKey, 0, 32);

        public byte[] C => Arrays.CopyOfRange(privateKey, 32, 32 + 8);

        public byte[] G => Arrays.CopyOfRange(privateKey, 40, 40 + Parameters.T * 2);

        public byte[] Alpha => Arrays.CopyOfRange(privateKey, 40 + Parameters.T * 2, privateKey.Length - 32);

        public byte[] S => Arrays.CopyOfRange(privateKey, privateKey.Length - 32, privateKey.Length);
    }
}
