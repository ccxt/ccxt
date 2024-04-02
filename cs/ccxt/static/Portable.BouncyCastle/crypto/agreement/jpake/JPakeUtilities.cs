using System;
using System.Text;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Agreement.JPake
{
    /// <summary>
    /// Primitives needed for a J-PAKE exchange.
    /// 
    /// The recommended way to perform a J-PAKE exchange is by using
    /// two JPAKEParticipants.  Internally, those participants
    /// call these primitive operations in JPakeUtilities.
    /// 
    /// The primitives, however, can be used without a JPAKEParticipant if needed.
    /// </summary>
    public abstract class JPakeUtilities
    {
        public static readonly BigInteger Zero = BigInteger.Zero;
        public static readonly BigInteger One = BigInteger.One;

        /// <summary>
        /// Return a value that can be used as x1 or x3 during round 1.
        /// The returned value is a random value in the range [0, q-1].
        /// </summary>
        public static BigInteger GenerateX1(BigInteger q, SecureRandom random)
        {
            BigInteger min = Zero;
            BigInteger max = q.Subtract(One);
            return BigIntegers.CreateRandomInRange(min, max, random);
        }

        /// <summary>
        /// Return a value that can be used as x2 or x4 during round 1.
        /// The returned value is a random value in the range [1, q-1].
        /// </summary>
        public static BigInteger GenerateX2(BigInteger q, SecureRandom random)
        {
            BigInteger min = One;
            BigInteger max = q.Subtract(One);
            return BigIntegers.CreateRandomInRange(min, max, random);
        }

        /// <summary>
        /// Converts the given password to a BigInteger
        /// for use in arithmetic calculations.
        /// </summary>
        public static BigInteger CalculateS(char[] password)
        {
            return new BigInteger(Encoding.UTF8.GetBytes(password));
        }

        /// <summary>
        /// Calculate g^x mod p as done in round 1.
        /// </summary>
        public static BigInteger CalculateGx(BigInteger p, BigInteger g, BigInteger x)
        {
            return g.ModPow(x, p);
        }

        /// <summary>
        /// Calculate ga as done in round 2.
        /// </summary>
        public static BigInteger CalculateGA(BigInteger p, BigInteger gx1, BigInteger gx3, BigInteger gx4)
        {
            // ga = g^(x1+x3+x4) = g^x1 * g^x3 * g^x4 
            return gx1.Multiply(gx3).Multiply(gx4).Mod(p);
        }

        /// <summary>
        /// Calculate x2 * s as done in round 2.
        /// </summary>
        public static BigInteger CalculateX2s(BigInteger q, BigInteger x2, BigInteger s)
        {
            return x2.Multiply(s).Mod(q);
        }

        /// <summary>
        /// Calculate A as done in round 2. 
        /// </summary>
        public static BigInteger CalculateA(BigInteger p, BigInteger q, BigInteger gA, BigInteger x2s)
        {
            // A = ga^(x*s)
            return gA.ModPow(x2s, p);
        }

        /// <summary>
        /// Calculate a zero knowledge proof of x using Schnorr's signature.
        /// The returned array has two elements {g^v, r = v-x*h} for x.
        /// </summary>
        public static BigInteger[] CalculateZeroKnowledgeProof(BigInteger p, BigInteger q, BigInteger g,
            BigInteger gx, BigInteger x, string participantId, IDigest digest, SecureRandom random)
        {
            /* Generate a random v, and compute g^v */
            BigInteger vMin = Zero;
            BigInteger vMax = q.Subtract(One);
            BigInteger v = BigIntegers.CreateRandomInRange(vMin, vMax, random);

            BigInteger gv = g.ModPow(v, p);
            BigInteger h = CalculateHashForZeroKnowledgeProof(g, gv, gx, participantId, digest); // h

            return new BigInteger[]
            {
                gv,
                v.Subtract(x.Multiply(h)).Mod(q) // r = v-x*h
            };
        }

        private static BigInteger CalculateHashForZeroKnowledgeProof(BigInteger g, BigInteger gr, BigInteger gx,
            string participantId, IDigest digest)
        {
            digest.Reset();

            UpdateDigestIncludingSize(digest, g);

            UpdateDigestIncludingSize(digest, gr);

            UpdateDigestIncludingSize(digest, gx);

            UpdateDigestIncludingSize(digest, participantId);

            byte[] output = DigestUtilities.DoFinal(digest);

            return new BigInteger(output);
        }

        /// <summary>
        /// Validates that g^x4 is not 1.
        /// throws CryptoException if g^x4 is 1
        /// </summary>
        public static void ValidateGx4(BigInteger gx4)
        {
            if (gx4.Equals(One))
                throw new CryptoException("g^x validation failed.  g^x should not be 1.");
        }

        /// <summary>
        /// Validates that ga is not 1.
        /// 
        /// As described by Feng Hao...
        /// Alice could simply check ga != 1 to ensure it is a generator.
        /// In fact, as we will explain in Section 3, (x1 + x3 + x4 ) is random over Zq even in the face of active attacks.
        /// Hence, the probability for ga = 1 is extremely small - on the order of 2^160 for 160-bit q.
        /// 
        /// throws CryptoException if ga is 1
        /// </summary>
        public static void ValidateGa(BigInteger ga)
        {
            if (ga.Equals(One))
                throw new CryptoException("ga is equal to 1.  It should not be.  The chances of this happening are on the order of 2^160 for a 160-bit q.  Try again.");
        }

        /// <summary>
        /// Validates the zero knowledge proof (generated by
        /// calculateZeroKnowledgeProof(BigInteger, BigInteger, BigInteger, BigInteger, BigInteger, string, Digest, SecureRandom)
        /// is correct.
        /// 
        /// throws CryptoException if the zero knowledge proof is not correct
        /// </summary>
        public static void ValidateZeroKnowledgeProof(BigInteger p, BigInteger q, BigInteger g,
            BigInteger gx, BigInteger[] zeroKnowledgeProof, string participantId, IDigest digest)
        {
            /* sig={g^v,r} */
            BigInteger gv = zeroKnowledgeProof[0];
            BigInteger r = zeroKnowledgeProof[1];

            BigInteger h = CalculateHashForZeroKnowledgeProof(g, gv, gx, participantId, digest);
            if (!(gx.CompareTo(Zero) == 1 && // g^x > 0
                gx.CompareTo(p) == -1 && // g^x < p
                gx.ModPow(q, p).CompareTo(One) == 0 && // g^x^q mod q = 1
                /*
                 * Below, I took a straightforward way to compute g^r * g^x^h,
                 * which needs 2 exp. Using a simultaneous computation technique
                 * would only need 1 exp.
                 */
                g.ModPow(r, p).Multiply(gx.ModPow(h, p)).Mod(p).CompareTo(gv) == 0)) // g^v=g^r * g^x^h
            {
                throw new CryptoException("Zero-knowledge proof validation failed");
            }
        }

        /// <summary>
        /// Calculates the keying material, which can be done after round 2 has completed.
        /// A session key must be derived from this key material using a secure key derivation function (KDF).
        /// The KDF used to derive the key is handled externally (i.e. not by JPAKEParticipant).
        /// 
        /// KeyingMaterial = (B/g^{x2*x4*s})^x2
        /// </summary>
        public static BigInteger CalculateKeyingMaterial(BigInteger p, BigInteger q, 
            BigInteger gx4, BigInteger x2, BigInteger s, BigInteger B)
        {
            return gx4.ModPow(x2.Multiply(s).Negate().Mod(q), p).Multiply(B).ModPow(x2, p);
        }

        /// <summary>
        /// Validates that the given participant ids are not equal.
        /// (For the J-PAKE exchange, each participant must use a unique id.)
        ///
        /// Throws CryptoException if the participantId strings are equal.
        /// </summary>
        public static void ValidateParticipantIdsDiffer(string participantId1, string participantId2)
        {
            if (participantId1.Equals(participantId2))
            {
                throw new CryptoException(
                    "Both participants are using the same participantId ("
                        + participantId1
                        + "). This is not allowed. "
                        + "Each participant must use a unique participantId.");
            }
        }

        /// <summary>
        /// Validates that the given participant ids are equal.
        /// This is used to ensure that the payloads received from
        /// each round all come from the same participant.
        /// </summary>
        public static void ValidateParticipantIdsEqual(string expectedParticipantId, string actualParticipantId)
        {
            if (!expectedParticipantId.Equals(actualParticipantId))
            {
                throw new CryptoException(
                    "Received payload from incorrect partner ("
                        + actualParticipantId
                        + "). Expected to receive payload from "
                        + expectedParticipantId
                        + ".");
            }
        }

        /// <summary>
        /// Validates that the given object is not null.
        /// throws NullReferenceException if the object is null.
        /// </summary>
        /// <param name="obj">object in question</param>
        /// <param name="description">name of the object (to be used in exception message)</param>
        public static void ValidateNotNull(object obj, string description)
        {
            if (obj == null)
                throw new ArgumentNullException(description);
        }

        /// <summary>
        /// Calculates the MacTag (to be used for key confirmation), as defined by
        /// <a href="http://csrc.nist.gov/publications/nistpubs/800-56A/SP800-56A_Revision1_Mar08-2007.pdf">NIST SP 800-56A Revision 1</a>,
        /// Section 8.2 Unilateral Key Confirmation for Key Agreement Schemes.
        ///
        /// MacTag = HMAC(MacKey, MacLen, MacData)
        /// MacKey = H(K || "JPAKE_KC")
        /// MacData = "KC_1_U" || participantId || partnerParticipantId || gx1 || gx2 || gx3 || gx4
        ///
        /// Note that both participants use "KC_1_U" because the sender of the round 3 message
        /// is always the initiator for key confirmation.
        ///
        /// HMAC = {@link HMac} used with the given {@link Digest}
        /// H = The given {@link Digest}
        /// MacLen = length of MacTag
        /// </summary>
        public static BigInteger CalculateMacTag(string participantId, string partnerParticipantId,
            BigInteger gx1, BigInteger gx2, BigInteger gx3, BigInteger gx4, BigInteger keyingMaterial, IDigest digest)
        {
            byte[] macKey = CalculateMacKey(keyingMaterial, digest);

            HMac mac = new HMac(digest);
            mac.Init(new KeyParameter(macKey));
            Arrays.Fill(macKey, (byte)0);

            /*
             * MacData = "KC_1_U" || participantId_Alice || participantId_Bob || gx1 || gx2 || gx3 || gx4.
             */
            UpdateMac(mac, "KC_1_U");
            UpdateMac(mac, participantId);
            UpdateMac(mac, partnerParticipantId);
            UpdateMac(mac, gx1);
            UpdateMac(mac, gx2);
            UpdateMac(mac, gx3);
            UpdateMac(mac, gx4);

            byte[] macOutput = MacUtilities.DoFinal(mac);

            return new BigInteger(macOutput);
        }

        /// <summary>
        /// Calculates the MacKey (i.e. the key to use when calculating the MagTag for key confirmation).
        /// 
        /// MacKey = H(K || "JPAKE_KC")
        /// </summary>
        private static byte[] CalculateMacKey(BigInteger keyingMaterial, IDigest digest)
        {
            digest.Reset();

            UpdateDigest(digest, keyingMaterial);
            /*
             * This constant is used to ensure that the macKey is NOT the same as the derived key.
             */
            UpdateDigest(digest, "JPAKE_KC");

            return DigestUtilities.DoFinal(digest);
        }

        /// <summary>
        /// Validates the MacTag received from the partner participant.
        /// 
        /// throws CryptoException if the participantId strings are equal.
        /// </summary>
        public static void ValidateMacTag(string participantId, string partnerParticipantId,
            BigInteger gx1, BigInteger gx2, BigInteger gx3, BigInteger gx4,
            BigInteger keyingMaterial, IDigest digest, BigInteger partnerMacTag)
        {
            /*
             * Calculate the expected MacTag using the parameters as the partner
             * would have used when the partner called calculateMacTag.
             * 
             * i.e. basically all the parameters are reversed.
             * participantId <-> partnerParticipantId
             *            x1 <-> x3
             *            x2 <-> x4
             */
            BigInteger expectedMacTag = CalculateMacTag(partnerParticipantId, participantId, gx3, gx4, gx1, gx2, keyingMaterial, digest);

            if (!expectedMacTag.Equals(partnerMacTag))
            {
                throw new CryptoException(
                    "Partner MacTag validation failed. "
                        + "Therefore, the password, MAC, or digest algorithm of each participant does not match.");
            }
        }

        private static void UpdateDigest(IDigest digest, BigInteger bigInteger)
        {
            UpdateDigest(digest, BigIntegers.AsUnsignedByteArray(bigInteger));
        }

        private static void UpdateDigest(IDigest digest, string str)
        {
            UpdateDigest(digest, Encoding.UTF8.GetBytes(str));
        }

        private static void UpdateDigest(IDigest digest, byte[] bytes)
        {
            digest.BlockUpdate(bytes, 0, bytes.Length);
            Arrays.Fill(bytes, (byte)0);
        }

        private static void UpdateDigestIncludingSize(IDigest digest, BigInteger bigInteger)
        {
            UpdateDigestIncludingSize(digest, BigIntegers.AsUnsignedByteArray(bigInteger));
        }

        private static void UpdateDigestIncludingSize(IDigest digest, string str)
        {
            UpdateDigestIncludingSize(digest, Encoding.UTF8.GetBytes(str));
        }

        private static void UpdateDigestIncludingSize(IDigest digest, byte[] bytes)
        {
            digest.BlockUpdate(IntToByteArray(bytes.Length), 0, 4);
            digest.BlockUpdate(bytes, 0, bytes.Length);
            Arrays.Fill(bytes, (byte)0);
        }

        private static void UpdateMac(IMac mac, BigInteger bigInteger)
        {
            UpdateMac(mac, BigIntegers.AsUnsignedByteArray(bigInteger));
        }

        private static void UpdateMac(IMac mac, string str)
        {
            UpdateMac(mac, Encoding.UTF8.GetBytes(str));
        }

        private static void UpdateMac(IMac mac, byte[] bytes)
        {
            mac.BlockUpdate(bytes, 0, bytes.Length);
            Arrays.Fill(bytes, (byte)0);
        }

        private static byte[] IntToByteArray(int value)
        {
            return Pack.UInt32_To_BE((uint)value);
        }
    }
}
