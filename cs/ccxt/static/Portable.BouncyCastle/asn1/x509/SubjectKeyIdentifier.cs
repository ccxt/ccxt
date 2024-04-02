using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The SubjectKeyIdentifier object.
     * <pre>
     * SubjectKeyIdentifier::= OCTET STRING
     * </pre>
     */
    public class SubjectKeyIdentifier
        : Asn1Encodable
    {
		public static SubjectKeyIdentifier GetInstance(Asn1TaggedObject obj, bool explicitly)
        {
            return GetInstance(Asn1OctetString.GetInstance(obj, explicitly));
        }

		public static SubjectKeyIdentifier GetInstance(object obj)
        {
            if (obj is SubjectKeyIdentifier)
                return (SubjectKeyIdentifier)obj;
            if (obj is SubjectPublicKeyInfo)
                return new SubjectKeyIdentifier((SubjectPublicKeyInfo)obj);
            if (obj is X509Extension)
                return GetInstance(X509Extension.ConvertValueToObject((X509Extension)obj));
            if (obj == null)
                return null;
            return new SubjectKeyIdentifier(Asn1OctetString.GetInstance(obj));
        }

        public static SubjectKeyIdentifier FromExtensions(X509Extensions extensions)
        {
            return GetInstance(X509Extensions.GetExtensionParsedValue(extensions, X509Extensions.SubjectKeyIdentifier));
        }

        private readonly byte[] keyIdentifier;

        public SubjectKeyIdentifier(
            byte[] keyID)
        {
			if (keyID == null)
				throw new ArgumentNullException("keyID");

			this.keyIdentifier = Arrays.Clone(keyID);
        }

		public SubjectKeyIdentifier(
            Asn1OctetString keyID)
            : this(keyID.GetOctets())
        {
        }

		/**
		 * Calculates the keyIdentifier using a SHA1 hash over the BIT STRING
		 * from SubjectPublicKeyInfo as defined in RFC3280.
		 *
		 * @param spki the subject public key info.
		 */
		public SubjectKeyIdentifier(
			SubjectPublicKeyInfo spki)
		{
			this.keyIdentifier = GetDigest(spki);
		}

		public byte[] GetKeyIdentifier()
		{
            return Arrays.Clone(keyIdentifier);
		}

        public override Asn1Object ToAsn1Object()
		{
			return new DerOctetString(GetKeyIdentifier());
		}

		/**
		 * Return a RFC 3280 type 1 key identifier. As in:
		 * <pre>
		 * (1) The keyIdentifier is composed of the 160-bit SHA-1 hash of the
		 * value of the BIT STRING subjectPublicKey (excluding the tag,
		 * length, and number of unused bits).
		 * </pre>
		 * @param keyInfo the key info object containing the subjectPublicKey field.
		 * @return the key identifier.
		 */
		public static SubjectKeyIdentifier CreateSha1KeyIdentifier(
			SubjectPublicKeyInfo keyInfo)
		{
			return new SubjectKeyIdentifier(keyInfo);
		}

		/**
		 * Return a RFC 3280 type 2 key identifier. As in:
		 * <pre>
		 * (2) The keyIdentifier is composed of a four bit type field with
		 * the value 0100 followed by the least significant 60 bits of the
		 * SHA-1 hash of the value of the BIT STRING subjectPublicKey.
		 * </pre>
		 * @param keyInfo the key info object containing the subjectPublicKey field.
		 * @return the key identifier.
		 */
		public static SubjectKeyIdentifier CreateTruncatedSha1KeyIdentifier(
			SubjectPublicKeyInfo keyInfo)
		{
			byte[] dig = GetDigest(keyInfo);
			byte[] id = new byte[8];

			Array.Copy(dig, dig.Length - 8, id, 0, id.Length);

			id[0] &= 0x0f;
			id[0] |= 0x40;

			return new SubjectKeyIdentifier(id);
		}

		private static byte[] GetDigest(
			SubjectPublicKeyInfo spki)
		{
            IDigest digest = new Sha1Digest();
            byte[] resBuf = new byte[digest.GetDigestSize()];

			byte[] bytes = spki.PublicKeyData.GetBytes();
            digest.BlockUpdate(bytes, 0, bytes.Length);
            digest.DoFinal(resBuf, 0);
            return resBuf;
		}
	}
}
