using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.BC;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Pqc.Asn1;
using Org.BouncyCastle.Pqc.Crypto.Cmce;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using Org.BouncyCastle.Pqc.Crypto.Picnic;
using Org.BouncyCastle.Pqc.Crypto.Saber;
using Org.BouncyCastle.Pqc.Crypto.Sike;
using Org.BouncyCastle.Pqc.Crypto.SphincsPlus;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Utilities
{
    public class PrivateKeyFactory
    {

        /// <summary> Create a private key parameter from a PKCS8 PrivateKeyInfo encoding.</summary>
        /// <param name="privateKeyInfoData"> the PrivateKeyInfo encoding</param>
        /// <returns> a suitable private key parameter</returns>
        /// <exception cref="IOException"> on an error decoding the key</exception>
        public static AsymmetricKeyParameter CreateKey(byte[] privateKeyInfoData)
        {
            return CreateKey(PrivateKeyInfo.GetInstance(Asn1Object.FromByteArray(privateKeyInfoData)));
        }

        /// <summary> Create a private key parameter from a PKCS8 PrivateKeyInfo encoding read from a stream</summary>
        /// <param name="inStr"> the stream to read the PrivateKeyInfo encoding from</param>
        /// <returns> a suitable private key parameter</returns>
        /// <exception cref="IOException"> on an error decoding the key</exception>
        public static AsymmetricKeyParameter CreateKey(Stream inStr)
        {
            return CreateKey(PrivateKeyInfo.GetInstance(new Asn1InputStream(inStr).ReadObject()));
        }


        /// <summary> Create a private key parameter from the passed in PKCS8 PrivateKeyInfo object.</summary>
        /// <param name="keyInfo"> the PrivateKeyInfo object containing the key material</param>
        /// <returns> a suitable private key parameter</returns>
        /// <exception cref="IOException"> on an error decoding the key</exception>
        public static AsymmetricKeyParameter CreateKey(PrivateKeyInfo keyInfo)
        {
            AlgorithmIdentifier algId = keyInfo.PrivateKeyAlgorithm;
            DerObjectIdentifier algOID = algId.Algorithm;

            if (algOID.Equals(PkcsObjectIdentifiers.IdAlgHssLmsHashsig))
            {
                byte[] keyEnc = Asn1OctetString.GetInstance(keyInfo.ParsePrivateKey()).GetOctets();
                DerBitString pubKey = keyInfo.PublicKeyData;

                if (Pack.BE_To_UInt32(keyEnc, 0) == 1)
                {
                    if (pubKey != null)
                    {
                        byte[] pubEnc = pubKey.GetOctets();

                        return LMSPrivateKeyParameters.GetInstance(Arrays.CopyOfRange(keyEnc, 4, keyEnc.Length),
                            Arrays.CopyOfRange(pubEnc, 4, pubEnc.Length));
                    }

                    return LMSPrivateKeyParameters.GetInstance(Arrays.CopyOfRange(keyEnc, 4, keyEnc.Length));
                }
            }

            if (algOID.On(BCObjectIdentifiers.pqc_kem_mceliece))
            {
                CmcePrivateKey cmceKey = CmcePrivateKey.GetInstance(keyInfo.ParsePrivateKey());
                CmceParameters spParams = PqcUtilities.McElieceParamsLookup(keyInfo.PrivateKeyAlgorithm.Algorithm);

                return new CmcePrivateKeyParameters(spParams, cmceKey.Delta, cmceKey.C, cmceKey.G, cmceKey.Alpha, cmceKey.S);
            }
            
            if (algOID.On(BCObjectIdentifiers.sphincsPlus))
            {
                byte[] keyEnc = Asn1OctetString.GetInstance(keyInfo.ParsePrivateKey()).GetOctets();
                SPHINCSPlusParameters spParams = SPHINCSPlusParameters.GetParams((uint)BigInteger.ValueOf(Pack.BE_To_UInt32(keyEnc, 0)).IntValue);

                return new SPHINCSPlusPrivateKeyParameters(spParams, Arrays.CopyOfRange(keyEnc, 4, keyEnc.Length));
            }
            if (algOID.On(BCObjectIdentifiers.pqc_kem_saber))
            {
                byte[] keyEnc = Asn1OctetString.GetInstance(keyInfo.ParsePrivateKey()).GetOctets();
                SABERParameters spParams = PqcUtilities.SaberParamsLookup(keyInfo.PrivateKeyAlgorithm.Algorithm);

                return new SABERPrivateKeyParameters(spParams, keyEnc);
            }
            if (algOID.On(BCObjectIdentifiers.picnic))
            {
                byte[] keyEnc = Asn1OctetString.GetInstance(keyInfo.ParsePrivateKey()).GetOctets();
                PicnicParameters picnicParams = PqcUtilities.PicnicParamsLookup(keyInfo.PrivateKeyAlgorithm.Algorithm);

                return new PicnicPrivateKeyParameters(picnicParams, keyEnc);
            }
            if (algOID.On(BCObjectIdentifiers.pqc_kem_sike))
            {
                byte[] keyEnc = Asn1OctetString.GetInstance(keyInfo.ParsePrivateKey()).GetOctets();
                SIKEParameters sikeParams = PqcUtilities.SikeParamsLookup(keyInfo.PrivateKeyAlgorithm.Algorithm);

                return new SIKEPrivateKeyParameters(sikeParams, keyEnc);
            }
            
            
            throw new Exception("algorithm identifier in private key not recognised");

        }
    }
}