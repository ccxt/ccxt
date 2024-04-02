using System;
using System.IO;

using Org.BouncyCastle.Math.EC.Rfc8032;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public sealed class Ed25519PrivateKeyParameters
        : AsymmetricKeyParameter
    {
        public static readonly int KeySize = Ed25519.SecretKeySize;
        public static readonly int SignatureSize = Ed25519.SignatureSize;

        private readonly byte[] data = new byte[KeySize];

        private Ed25519PublicKeyParameters cachedPublicKey;

        public Ed25519PrivateKeyParameters(SecureRandom random)
            : base(true)
        {
            Ed25519.GeneratePrivateKey(random, data);
        }

        public Ed25519PrivateKeyParameters(byte[] buf)
            : this(Validate(buf), 0)
        {
        }

        public Ed25519PrivateKeyParameters(byte[] buf, int off)
            : base(true)
        {
            Array.Copy(buf, off, data, 0, KeySize);
        }

        public Ed25519PrivateKeyParameters(Stream input)
            : base(true)
        {
            if (KeySize != Streams.ReadFully(input, data))
                throw new EndOfStreamException("EOF encountered in middle of Ed25519 private key");
        }

        public void Encode(byte[] buf, int off)
        {
            Array.Copy(data, 0, buf, off, KeySize);
        }

        public byte[] GetEncoded()
        {
            return Arrays.Clone(data);
        }

        public Ed25519PublicKeyParameters GeneratePublicKey()
        {
            lock (data)
            {
                if (null == cachedPublicKey)
                {
                    byte[] publicKey = new byte[Ed25519.PublicKeySize];
                    Ed25519.GeneratePublicKey(data, 0, publicKey, 0);
                    cachedPublicKey = new Ed25519PublicKeyParameters(publicKey, 0);
                }

                return cachedPublicKey;
            }
        }

        public void Sign(Ed25519.Algorithm algorithm, byte[] ctx, byte[] msg, int msgOff, int msgLen,
            byte[] sig, int sigOff)
        {
            Ed25519PublicKeyParameters publicKey = GeneratePublicKey();

            byte[] pk = new byte[Ed25519.PublicKeySize];
            publicKey.Encode(pk, 0);

            switch (algorithm)
            {
            case Ed25519.Algorithm.Ed25519:
            {
                if (null != ctx)
                    throw new ArgumentException("ctx");

                Ed25519.Sign(data, 0, pk, 0, msg, msgOff, msgLen, sig, sigOff);
                break;
            }
            case Ed25519.Algorithm.Ed25519ctx:
            {
                Ed25519.Sign(data, 0, pk, 0, ctx, msg, msgOff, msgLen, sig, sigOff);
                break;
            }
            case Ed25519.Algorithm.Ed25519ph:
            {
                if (Ed25519.PrehashSize != msgLen)
                    throw new ArgumentException("msgLen");

                Ed25519.SignPrehash(data, 0, pk, 0, ctx, msg, msgOff, sig, sigOff);
                break;
            }
            default:
            {
                throw new ArgumentException("algorithm");
            }
            }
        }

        private static byte[] Validate(byte[] buf)
        {
            if (buf.Length != KeySize)
                throw new ArgumentException("must have length " + KeySize, "buf");

            return buf;
        }
    }
}
