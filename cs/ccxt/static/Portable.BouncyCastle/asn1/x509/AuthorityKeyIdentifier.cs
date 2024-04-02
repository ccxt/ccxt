using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The AuthorityKeyIdentifier object.
     * <pre>
     * id-ce-authorityKeyIdentifier OBJECT IDENTIFIER ::=  { id-ce 35 }
     *
     *   AuthorityKeyIdentifier ::= Sequence {
     *      keyIdentifier             [0] IMPLICIT KeyIdentifier           OPTIONAL,
     *      authorityCertIssuer       [1] IMPLICIT GeneralNames            OPTIONAL,
     *      authorityCertSerialNumber [2] IMPLICIT CertificateSerialNumber OPTIONAL  }
     *
     *   KeyIdentifier ::= OCTET STRING
     * </pre>
     *
     */
    public class AuthorityKeyIdentifier
        : Asn1Encodable
    {
        public static AuthorityKeyIdentifier GetInstance(Asn1TaggedObject obj, bool explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		public static AuthorityKeyIdentifier GetInstance(object obj)
        {
            if (obj is AuthorityKeyIdentifier)
                return (AuthorityKeyIdentifier)obj;
            if (obj is X509Extension)
                return GetInstance(X509Extension.ConvertValueToObject((X509Extension)obj));
            if (obj == null)
                return null;
            return new AuthorityKeyIdentifier(Asn1Sequence.GetInstance(obj));
		}

        public static AuthorityKeyIdentifier FromExtensions(X509Extensions extensions)
        {
            return GetInstance(X509Extensions.GetExtensionParsedValue(extensions, X509Extensions.AuthorityKeyIdentifier));
        }

        private readonly Asn1OctetString keyidentifier;
        private readonly GeneralNames certissuer;
        private readonly DerInteger certserno;

        protected internal AuthorityKeyIdentifier(
            Asn1Sequence seq)
        {
            foreach (Asn1Encodable element in seq)
			{
                Asn1TaggedObject obj = Asn1TaggedObject.GetInstance(element);

				switch (obj.TagNo)
                {
				case 0:
					this.keyidentifier = Asn1OctetString.GetInstance(obj, false);
					break;
				case 1:
					this.certissuer = GeneralNames.GetInstance(obj, false);
					break;
				case 2:
					this.certserno = DerInteger.GetInstance(obj, false);
					break;
				default:
					throw new ArgumentException("illegal tag");
                }
            }
        }

		/**
         *
         * Calulates the keyidentifier using a SHA1 hash over the BIT STRING
         * from SubjectPublicKeyInfo as defined in RFC2459.
         *
         * Example of making a AuthorityKeyIdentifier:
         * <pre>
	     *   SubjectPublicKeyInfo apki = new SubjectPublicKeyInfo((ASN1Sequence)new ASN1InputStream(
		 *       publicKey.getEncoded()).readObject());
         *   AuthorityKeyIdentifier aki = new AuthorityKeyIdentifier(apki);
         * </pre>
         *
         **/
        public AuthorityKeyIdentifier(
            SubjectPublicKeyInfo spki)
            : this(spki, null, null)
        {
        }

        /**
         * create an AuthorityKeyIdentifier with the GeneralNames tag and
         * the serial number provided as well.
         */
        public AuthorityKeyIdentifier(
            SubjectPublicKeyInfo	spki,
            GeneralNames			name,
            BigInteger				serialNumber)
        {
            IDigest digest = new Sha1Digest();
            byte[] resBuf = new byte[digest.GetDigestSize()];
			byte[] bytes = spki.PublicKeyData.GetBytes();
            digest.BlockUpdate(bytes, 0, bytes.Length);
            digest.DoFinal(resBuf, 0);

			this.keyidentifier = new DerOctetString(resBuf);
            this.certissuer = name;
            this.certserno = serialNumber == null ? null : new DerInteger(serialNumber);
        }

        /**
		 * create an AuthorityKeyIdentifier with the GeneralNames tag and
		 * the serial number provided.
		 */
		public AuthorityKeyIdentifier(
			GeneralNames	name,
			BigInteger		serialNumber)
            : this((byte[])null, name, serialNumber)
		{
		}

		/**
		 * create an AuthorityKeyIdentifier with a precomputed key identifier
		 */
		public AuthorityKeyIdentifier(
			byte[] keyIdentifier)
            : this(keyIdentifier, null, null)
		{
		}

        /**
		 * create an AuthorityKeyIdentifier with a precomupted key identifier
		 * and the GeneralNames tag and the serial number provided as well.
		 */
		public AuthorityKeyIdentifier(
			byte[]			keyIdentifier,
			GeneralNames	name,
			BigInteger		serialNumber)
		{
			this.keyidentifier = keyIdentifier == null ? null : new DerOctetString(keyIdentifier);
			this.certissuer = name;
			this.certserno = serialNumber == null ? null : new DerInteger(serialNumber);
		}

		public byte[] GetKeyIdentifier()
        {
			return keyidentifier == null ? null : keyidentifier.GetOctets();
        }

		public GeneralNames AuthorityCertIssuer
		{
			get { return certissuer; }
		}

		public BigInteger AuthorityCertSerialNumber
        {
            get { return certserno == null ? null : certserno.Value; }
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(false, 0, keyidentifier);
            v.AddOptionalTagged(false, 1, certissuer);
            v.AddOptionalTagged(false, 2, certserno);
            return new DerSequence(v);
        }

		public override string ToString()
        {
            string keyID = (keyidentifier != null) ? Hex.ToHexString(keyidentifier.GetOctets()) : "null";

            return "AuthorityKeyIdentifier: KeyID(" + keyID + ")";
        }
    }
}
