using System;
using System.Diagnostics;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Pqc.Crypto.Ntru.Owcpa;
using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru
{
    /// <summary>
    /// NTRU secret encapsulation extractor.
    /// </summary>
    public class NtruKemExtractor : IEncapsulatedSecretExtractor
    {
        private readonly NtruParameters _parameters;
        private readonly NtruPrivateKeyParameters _ntruPrivateKey;

        public NtruKemExtractor(NtruPrivateKeyParameters ntruPrivateKey)
        {
            _parameters = ntruPrivateKey.Parameters;
            _ntruPrivateKey = ntruPrivateKey;
        }


        public byte[] ExtractSecret(byte[] encapsulation)
        {
            Debug.Assert(_ntruPrivateKey != null);

            NtruParameterSet parameterSet = _parameters.ParameterSet;

            byte[] sk = _ntruPrivateKey.PrivateKey;
            int i, fail;
            byte[] rm;
            byte[] buf = new byte[parameterSet.PrfKeyBytes + parameterSet.NtruCiphertextBytes()];

            NtruOwcpa owcpa = new NtruOwcpa(parameterSet);
            OwcpaDecryptResult owcpaResult = owcpa.Decrypt(encapsulation, _ntruPrivateKey.PrivateKey);
            rm = owcpaResult.Rm;
            fail = owcpaResult.Fail;

            Sha3Digest sha3256 = new Sha3Digest(256);

            byte[] k = new byte[sha3256.GetDigestSize()];

            sha3256.BlockUpdate(rm, 0, rm.Length);
            sha3256.DoFinal(k, 0);

            /* shake(secret PRF key || input ciphertext) */
            for (i = 0; i < parameterSet.PrfKeyBytes; i++)
            {
                buf[i] = sk[i + parameterSet.OwcpaSecretKeyBytes()];
            }

            for (i = 0; i < parameterSet.NtruCiphertextBytes(); i++)
            {
                buf[parameterSet.PrfKeyBytes + i] = encapsulation[i];
            }

            sha3256.Reset();
            sha3256.BlockUpdate(buf, 0, buf.Length);
            sha3256.DoFinal(rm, 0);

            Cmov(k, rm, (byte)fail);

            byte[] sharedKey = new byte[parameterSet.SharedKeyBytes];
            Array.Copy(k, 0, sharedKey, 0, parameterSet.SharedKeyBytes);

            Array.Clear(k, 0, k.Length);

            return sharedKey;
        }

        private static void Cmov(byte[] r, byte[] x, byte b)
        {
            b = (byte)(~b + 1);
            for (int i = 0; i < r.Length; i++)
            {
                r[i] ^= (byte)(b & (x[i] ^ r[i]));
            }
        }

        public int EncapsulationLength => _parameters.ParameterSet.NtruCiphertextBytes();
    }
}