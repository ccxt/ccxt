using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public sealed class TrustedAuthority
    {
        private readonly short m_identifierType;
        private readonly object m_identifier;

        public TrustedAuthority(short identifierType, object identifier)
        {
            if (!IsCorrectType(identifierType, identifier))
                throw new ArgumentException("not an instance of the correct type", "identifier");

            this.m_identifierType = identifierType;
            this.m_identifier = identifier;
        }

        public short IdentifierType
        {
            get { return m_identifierType; }
        }

        public object Identifier
        {
            get { return m_identifier; }
        }

        public byte[] GetCertSha1Hash()
        {
            return Arrays.Clone((byte[])m_identifier);
        }

        public byte[] GetKeySha1Hash()
        {
            return Arrays.Clone((byte[])m_identifier);
        }

        public X509Name X509Name
        {
            get
            {
                CheckCorrectType(Tls.IdentifierType.x509_name);
                return (X509Name)m_identifier;
            }
        }

        /// <summary>Encode this <see cref="TrustedAuthority"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(m_identifierType, output);

            switch (m_identifierType)
            {
            case Tls.IdentifierType.cert_sha1_hash:
            case Tls.IdentifierType.key_sha1_hash:
            {
                byte[] sha1Hash = (byte[])m_identifier;
                output.Write(sha1Hash, 0, sha1Hash.Length);
                break;
            }
            case Tls.IdentifierType.pre_agreed:
            {
                break;
            }
            case Tls.IdentifierType.x509_name:
            {
                X509Name dn = (X509Name)m_identifier;
                byte[] derEncoding = dn.GetEncoded(Asn1Encodable.Der);
                TlsUtilities.WriteOpaque16(derEncoding, output);
                break;
            }
            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }

        /// <summary>Parse a <see cref="TrustedAuthority"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="TrustedAuthority"/> object.</returns>
        /// <exception cref="IOException"/>
        public static TrustedAuthority Parse(Stream input)
        {
            short identifier_type = TlsUtilities.ReadUint8(input);
            object identifier;

            switch (identifier_type)
            {
            case Tls.IdentifierType.cert_sha1_hash:
            case Tls.IdentifierType.key_sha1_hash:
            {
                identifier = TlsUtilities.ReadFully(20, input);
                break;
            }
            case Tls.IdentifierType.pre_agreed:
            {
                identifier = null;
                break;
            }
            case Tls.IdentifierType.x509_name:
            {
                byte[] derEncoding = TlsUtilities.ReadOpaque16(input, 1);
                Asn1Object asn1 = TlsUtilities.ReadAsn1Object(derEncoding);
                X509Name x509Name = X509Name.GetInstance(asn1);
                TlsUtilities.RequireDerEncoding(x509Name, derEncoding);
                identifier = x509Name;
                break;
            }
            default:
                throw new TlsFatalAlert(AlertDescription.decode_error);
            }

            return new TrustedAuthority(identifier_type, identifier);
        }

        private void CheckCorrectType(short expectedIdentifierType)
        {
            if (m_identifierType != expectedIdentifierType || !IsCorrectType(expectedIdentifierType, m_identifier))
                throw new InvalidOperationException("TrustedAuthority is not of type "
                    + Tls.IdentifierType.GetName(expectedIdentifierType));
        }

        private static bool IsCorrectType(short identifierType, object identifier)
        {
            switch (identifierType)
            {
            case Tls.IdentifierType.cert_sha1_hash:
            case Tls.IdentifierType.key_sha1_hash:
                return IsSha1Hash(identifier);
            case Tls.IdentifierType.pre_agreed:
                return identifier == null;
            case Tls.IdentifierType.x509_name:
                return identifier is X509Name;
            default:
                throw new ArgumentException("unsupported IdentifierType", "identifierType");
            }
        }

        private static bool IsSha1Hash(object identifier)
        {
            return identifier is byte[] && ((byte[])identifier).Length == 20;
        }
    }
}
