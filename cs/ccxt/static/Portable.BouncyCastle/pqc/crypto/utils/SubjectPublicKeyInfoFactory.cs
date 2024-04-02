using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Pqc.Asn1;
using Org.BouncyCastle.Pqc.Crypto.Cmce;
using Org.BouncyCastle.Pqc.Crypto.Picnic;
using Org.BouncyCastle.Pqc.Crypto.Saber;
using Org.BouncyCastle.Pqc.Crypto.Sike;
using Org.BouncyCastle.Pqc.Crypto.SphincsPlus;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Utilities
{
    
    /// <summary>
    /// A factory to produce Public Key Info Objects.
    /// </summary>
    public class SubjectPublicKeyInfoFactory
    {
        private SubjectPublicKeyInfoFactory()
        {
        }

        /// <summary>
        /// Create a Subject Public Key Info object for a given public key.
        /// </summary>
        /// <param name="publicKey">One of ElGammalPublicKeyParameters, DSAPublicKeyParameter, DHPublicKeyParameters, RsaKeyParameters or ECPublicKeyParameters</param>
        /// <returns>A subject public key info object.</returns>
        /// <exception cref="Exception">Throw exception if object provided is not one of the above.</exception>
        public static SubjectPublicKeyInfo CreateSubjectPublicKeyInfo(
            AsymmetricKeyParameter publicKey)
        {
            if (publicKey == null)
                throw new ArgumentNullException("publicKey");
            if (publicKey.IsPrivate)
                throw new ArgumentException("Private key passed - public key expected.", "publicKey");
            
            if (publicKey is SPHINCSPlusPublicKeyParameters)
            {
                SPHINCSPlusPublicKeyParameters parameters = (SPHINCSPlusPublicKeyParameters)publicKey;

                byte[] encoding = parameters.GetEncoded();

                AlgorithmIdentifier algorithmIdentifier = new AlgorithmIdentifier(PqcUtilities.SphincsPlusOidLookup(parameters.GetParameters()));
                return new SubjectPublicKeyInfo(algorithmIdentifier, new DerOctetString(encoding));
            }
            if (publicKey is CmcePublicKeyParameters)
            {
                CmcePublicKeyParameters key = (CmcePublicKeyParameters)publicKey;

                byte[] encoding = key.GetEncoded();

                AlgorithmIdentifier algorithmIdentifier = new AlgorithmIdentifier(PqcUtilities.McElieceOidLookup(key.Parameters));

                // https://datatracker.ietf.org/doc/draft-uni-qsckeys/
                return new SubjectPublicKeyInfo(algorithmIdentifier, new CmcePublicKey(encoding));
            }
            if (publicKey is SABERPublicKeyParameters)
            {
                SABERPublicKeyParameters parameters = (SABERPublicKeyParameters)publicKey;

                byte[] encoding = parameters.GetEncoded();

                AlgorithmIdentifier algorithmIdentifier = new AlgorithmIdentifier(PqcUtilities.SaberOidLookup(parameters.GetParameters()));

                // https://datatracker.ietf.org/doc/draft-uni-qsckeys/
                return new SubjectPublicKeyInfo(algorithmIdentifier, new DerSequence(new DerOctetString(encoding)));
            }
            if (publicKey is PicnicPublicKeyParameters)
            {
                PicnicPublicKeyParameters parameters = (PicnicPublicKeyParameters)publicKey;

                byte[] encoding = parameters.GetEncoded();

                AlgorithmIdentifier algorithmIdentifier = new AlgorithmIdentifier(PqcUtilities.PicnicOidLookup(parameters.Parameters));
                return new SubjectPublicKeyInfo(algorithmIdentifier, new DerOctetString(encoding));
            }
            if (publicKey is SIKEPublicKeyParameters)
            {
                SIKEPublicKeyParameters parameters = (SIKEPublicKeyParameters)publicKey;

                byte[] encoding = parameters.GetEncoded();

                AlgorithmIdentifier algorithmIdentifier = new AlgorithmIdentifier(PqcUtilities.SikeOidLookup(parameters.GetParameters()));
                return new SubjectPublicKeyInfo(algorithmIdentifier, new DerOctetString(encoding));
            }
            
            throw new ArgumentException("Class provided no convertible: " + Platform.GetTypeName(publicKey));

        }
        
        private static void ExtractBytes(
            byte[]		encKey,
            int			offset,
            BigInteger	bI)
        {
            byte[] val = bI.ToByteArray();
            int n = (bI.BitLength + 7) / 8;

            for (int i = 0; i < n; ++i)
            {
                encKey[offset + i] = val[val.Length - 1 - i];
            }
        }


        private static void ExtractBytes(byte[] encKey, int size, int offSet, BigInteger bI)
        {
            byte[] val = bI.ToByteArray();
            if (val.Length < size)
            {
                byte[] tmp = new byte[size];
                Array.Copy(val, 0, tmp, tmp.Length - val.Length, val.Length);
                val = tmp;
            }

            for (int i = 0; i != size; i++)
            {
                encKey[offSet + i] = val[val.Length - 1 - i];
            }
        }

    }
}