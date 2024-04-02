using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Misc;
using Org.BouncyCastle.Asn1.Utilities;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Operators;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;
using Org.BouncyCastle.X509.Extension;

namespace Org.BouncyCastle.X509
{
    /// <summary>
    /// An Object representing an X509 Certificate.
    /// Has static methods for loading Certificates encoded in many forms that return X509Certificate Objects.
    /// </summary>
    public class X509Certificate
        : X509ExtensionBase
    //		, PKCS12BagAttributeCarrier
    {
        private class CachedEncoding
        {
            private readonly byte[] encoding;
            private readonly CertificateEncodingException exception;

            internal CachedEncoding(byte[] encoding, CertificateEncodingException exception)
            {
                this.encoding = encoding;
                this.exception = exception;
            }

            internal byte[] Encoding
            {
                get { return encoding; }
            }

            internal byte[] GetEncoded()
            {
                if (null != exception)
                    throw exception;

                if (null == encoding)
                    throw new CertificateEncodingException();

                return encoding;
            }
        }

        private readonly X509CertificateStructure c;
        //private Dictionary<> pkcs12Attributes = new Dictionary<>();
        //private List<> pkcs12Ordering = new List<>();
        private readonly string sigAlgName;
        private readonly byte[] sigAlgParams;
        private readonly BasicConstraints basicConstraints;
        private readonly bool[] keyUsage;

        private readonly object cacheLock = new object();
        private AsymmetricKeyParameter publicKeyValue;
        private CachedEncoding cachedEncoding;

        private volatile bool hashValueSet;
        private volatile int hashValue;

        protected X509Certificate()
        {
        }

        public X509Certificate(byte[] certData)
            : this(X509CertificateStructure.GetInstance(certData))
        {
        }

        public X509Certificate(X509CertificateStructure c)
        {
            this.c = c;

            try
            {
                this.sigAlgName = X509SignatureUtilities.GetSignatureName(c.SignatureAlgorithm);

                Asn1Encodable parameters = c.SignatureAlgorithm.Parameters;
                this.sigAlgParams = (null == parameters) ? null : parameters.GetEncoded(Asn1Encodable.Der);
            }
            catch (Exception e)
            {
                throw new CertificateParsingException("Certificate contents invalid: " + e);
            }

            try
            {
                Asn1OctetString str = GetExtensionValue(X509Extensions.BasicConstraints);
                if (str != null)
                {
                    basicConstraints = BasicConstraints.GetInstance(X509ExtensionUtilities.FromExtensionValue(str));
                }
            }
            catch (Exception e)
            {
                throw new CertificateParsingException("cannot construct BasicConstraints: " + e);
            }

            try
            {
                Asn1OctetString str = GetExtensionValue(X509Extensions.KeyUsage);
                if (str != null)
                {
                    DerBitString bits = DerBitString.GetInstance(X509ExtensionUtilities.FromExtensionValue(str));

                    byte[] bytes = bits.GetBytes();
                    int length = (bytes.Length * 8) - bits.PadBits;

                    keyUsage = new bool[(length < 9) ? 9 : length];

                    for (int i = 0; i != length; i++)
                    {
                        keyUsage[i] = (bytes[i / 8] & (0x80 >> (i % 8))) != 0;
                    }
                }
                else
                {
                    keyUsage = null;
                }
            }
            catch (Exception e)
            {
                throw new CertificateParsingException("cannot construct KeyUsage: " + e);
            }
        }

        //		internal X509Certificate(
        //			Asn1Sequence seq)
        //        {
        //            this.c = X509CertificateStructure.GetInstance(seq);
        //        }

        //		/// <summary>
        //        /// Load certificate from byte array.
        //        /// </summary>
        //        /// <param name="encoded">Byte array containing encoded X509Certificate.</param>
        //        public X509Certificate(
        //            byte[] encoded)
        //			: this((Asn1Sequence) new Asn1InputStream(encoded).ReadObject())
        //		{
        //        }
        //
        //        /// <summary>
        //        /// Load certificate from Stream.
        //        /// Must be positioned at start of certificate.
        //        /// </summary>
        //        /// <param name="input"></param>
        //        public X509Certificate(
        //            Stream input)
        //			: this((Asn1Sequence) new Asn1InputStream(input).ReadObject())
        //        {
        //        }

        public virtual X509CertificateStructure CertificateStructure
        {
            get { return c; }
        }

        /// <summary>
        /// Return true if the current time is within the start and end times nominated on the certificate.
        /// </summary>
        /// <returns>true id certificate is valid for the current time.</returns>
        public virtual bool IsValidNow
        {
            get { return IsValid(DateTime.UtcNow); }
        }

        /// <summary>
        /// Return true if the nominated time is within the start and end times nominated on the certificate.
        /// </summary>
        /// <param name="time">The time to test validity against.</param>
        /// <returns>True if certificate is valid for nominated time.</returns>
        public virtual bool IsValid(
            DateTime time)
        {
            return time.CompareTo(NotBefore) >= 0 && time.CompareTo(NotAfter) <= 0;
        }

        /// <summary>
        /// Checks if the current date is within certificate's validity period.
        /// </summary>
        public virtual void CheckValidity()
        {
            this.CheckValidity(DateTime.UtcNow);
        }

        /// <summary>
        /// Checks if the given date is within certificate's validity period.
        /// </summary>
        /// <exception cref="CertificateExpiredException">if the certificate is expired by given date</exception>
        /// <exception cref="CertificateNotYetValidException">if the certificate is not yet valid on given date</exception>
        public virtual void CheckValidity(
            DateTime time)
        {
            if (time.CompareTo(NotAfter) > 0)
                throw new CertificateExpiredException("certificate expired on " + c.EndDate.GetTime());
            if (time.CompareTo(NotBefore) < 0)
                throw new CertificateNotYetValidException("certificate not valid until " + c.StartDate.GetTime());
        }

        /// <summary>
        /// Return the certificate's version.
        /// </summary>
        /// <returns>An integer whose value Equals the version of the cerficate.</returns>
        public virtual int Version
        {
            get { return c.Version; }
        }

        /// <summary>
        /// Return a <see cref="Org.BouncyCastle.Math.BigInteger">BigInteger</see> containing the serial number.
        /// </summary>
        /// <returns>The Serial number.</returns>
        public virtual BigInteger SerialNumber
        {
            get { return c.SerialNumber.Value; }
        }

        /// <summary>
        /// Get the Issuer Distinguished Name. (Who signed the certificate.)
        /// </summary>
        /// <returns>And X509Object containing name and value pairs.</returns>
        //        public IPrincipal IssuerDN
        public virtual X509Name IssuerDN
        {
            get { return c.Issuer; }
        }

        /// <summary>
        /// Get the subject of this certificate.
        /// </summary>
        /// <returns>An X509Name object containing name and value pairs.</returns>
        //        public IPrincipal SubjectDN
        public virtual X509Name SubjectDN
        {
            get { return c.Subject; }
        }

        /// <summary>
        /// The time that this certificate is valid from.
        /// </summary>
        /// <returns>A DateTime object representing that time in the local time zone.</returns>
        public virtual DateTime NotBefore
        {
            get { return c.StartDate.ToDateTime(); }
        }

        /// <summary>
        /// The time that this certificate is valid up to.
        /// </summary>
        /// <returns>A DateTime object representing that time in the local time zone.</returns>
        public virtual DateTime NotAfter
        {
            get { return c.EndDate.ToDateTime(); }
        }

        /// <summary>
        /// Return the Der encoded TbsCertificate data.
        /// This is the certificate component less the signature.
        /// To Get the whole certificate call the GetEncoded() member.
        /// </summary>
        /// <returns>A byte array containing the Der encoded Certificate component.</returns>
        public virtual byte[] GetTbsCertificate()
        {
            return c.TbsCertificate.GetDerEncoded();
        }

        /// <summary>
        /// The signature.
        /// </summary>
        /// <returns>A byte array containg the signature of the certificate.</returns>
        public virtual byte[] GetSignature()
        {
            return c.GetSignatureOctets();
        }

        /// <summary>
		/// A meaningful version of the Signature Algorithm. (EG SHA1WITHRSA)
		/// </summary>
		/// <returns>A sting representing the signature algorithm.</returns>
		public virtual string SigAlgName
        {
            get { return sigAlgName; }
        }

        /// <summary>
        /// Get the Signature Algorithms Object ID.
        /// </summary>
        /// <returns>A string containg a '.' separated object id.</returns>
        public virtual string SigAlgOid
        {
            get { return c.SignatureAlgorithm.Algorithm.Id; }
        }

        /// <summary>
        /// Get the signature algorithms parameters. (EG DSA Parameters)
        /// </summary>
        /// <returns>A byte array containing the Der encoded version of the parameters or null if there are none.</returns>
        public virtual byte[] GetSigAlgParams()
        {
            return Arrays.Clone(sigAlgParams);
        }

        /// <summary>
        /// Get the issuers UID.
        /// </summary>
        /// <returns>A DerBitString.</returns>
        public virtual DerBitString IssuerUniqueID
        {
            get { return c.TbsCertificate.IssuerUniqueID; }
        }

        /// <summary>
        /// Get the subjects UID.
        /// </summary>
        /// <returns>A DerBitString.</returns>
        public virtual DerBitString SubjectUniqueID
        {
            get { return c.TbsCertificate.SubjectUniqueID; }
        }

        /// <summary>
        /// Get a key usage guidlines.
        /// </summary>
        public virtual bool[] GetKeyUsage()
        {
            return Arrays.Clone(keyUsage);
        }

        // TODO Replace with something that returns a list of DerObjectIdentifier
        public virtual IList<DerObjectIdentifier> GetExtendedKeyUsage()
        {
            Asn1OctetString str = GetExtensionValue(X509Extensions.ExtendedKeyUsage);

            if (str == null)
                return null;

            try
            {
                Asn1Sequence seq = Asn1Sequence.GetInstance(X509ExtensionUtilities.FromExtensionValue(str));

                var result = new List<DerObjectIdentifier>();
                foreach (DerObjectIdentifier oid in seq)
                {
                    result.Add(oid);
                }
                return result;
            }
            catch (Exception e)
            {
                throw new CertificateParsingException("error processing extended key usage extension", e);
            }
        }

        public virtual int GetBasicConstraints()
        {
            if (basicConstraints != null && basicConstraints.IsCA())
            {
                if (basicConstraints.PathLenConstraint == null)
                {
                    return int.MaxValue;
                }

                return basicConstraints.PathLenConstraint.IntValue;
            }

            return -1;
        }

        public virtual GeneralNames GetIssuerAlternativeNameExtension()
        {
            return GetAlternativeNameExtension(X509Extensions.IssuerAlternativeName);
        }

        public virtual GeneralNames GetSubjectAlternativeNameExtension()
        {
            return GetAlternativeNameExtension(X509Extensions.SubjectAlternativeName);
        }

        public virtual IList<IList<object>> GetIssuerAlternativeNames()
        {
            return GetAlternativeNames(X509Extensions.IssuerAlternativeName);
        }

        public virtual IList<IList<object>> GetSubjectAlternativeNames()
        {
            return GetAlternativeNames(X509Extensions.SubjectAlternativeName);
        }

        protected virtual GeneralNames GetAlternativeNameExtension(DerObjectIdentifier oid)
        {
            Asn1OctetString altNames = GetExtensionValue(oid);
            if (altNames == null)
                return null;

            Asn1Object asn1Object = X509ExtensionUtilities.FromExtensionValue(altNames);

            return GeneralNames.GetInstance(asn1Object);
        }

        protected virtual IList<IList<object>> GetAlternativeNames(DerObjectIdentifier oid)
        {
            var generalNames = GetAlternativeNameExtension(oid);
            if (generalNames == null)
                return null;

            var gns = generalNames.GetNames();

            var result = new List<IList<object>>(gns.Length);
            foreach (GeneralName gn in gns)
            {
                var entry = new List<object>(2);
                entry.Add(gn.TagNo);

                switch (gn.TagNo)
                {
                case GeneralName.EdiPartyName:
                case GeneralName.X400Address:
                case GeneralName.OtherName:
                    entry.Add(gn.GetEncoded());
                    break;
                case GeneralName.DirectoryName:
                    // TODO Styles
                    //entry.Add(X509Name.GetInstance(Rfc4519Style.Instance, gn.Name).ToString());
                    entry.Add(X509Name.GetInstance(gn.Name).ToString());
                    break;
                case GeneralName.DnsName:
                case GeneralName.Rfc822Name:
                case GeneralName.UniformResourceIdentifier:
                    entry.Add(((IAsn1String)gn.Name).GetString());
                    break;
                case GeneralName.RegisteredID:
                    entry.Add(DerObjectIdentifier.GetInstance(gn.Name).Id);
                    break;
                case GeneralName.IPAddress:
                    byte[] addrBytes = Asn1OctetString.GetInstance(gn.Name).GetOctets();
                    IPAddress ipAddress = new IPAddress(addrBytes);
                    entry.Add(ipAddress.ToString());
                    break;
                default:
                    throw new IOException("Bad tag number: " + gn.TagNo);
                }

                result.Add(entry);
            }
            return result;
        }

        protected override X509Extensions GetX509Extensions()
        {
            return c.Version >= 3
                ? c.TbsCertificate.Extensions
                : null;
        }

        /// <summary>
        /// Get the public key of the subject of the certificate.
        /// </summary>
        /// <returns>The public key parameters.</returns>
        public virtual AsymmetricKeyParameter GetPublicKey()
        {
            // Cache the public key to support repeated-use optimizations
            lock (cacheLock)
            {
                if (null != publicKeyValue)
                    return publicKeyValue;
            }

            AsymmetricKeyParameter temp = PublicKeyFactory.CreateKey(c.SubjectPublicKeyInfo);

            lock (cacheLock)
            {
                if (null == publicKeyValue)
                {
                    publicKeyValue = temp;
                }

                return publicKeyValue;
            }
        }

        /// <summary>
        /// Return the DER encoding of this certificate.
        /// </summary>
        /// <returns>A byte array containing the DER encoding of this certificate.</returns>
        /// <exception cref="CertificateEncodingException">If there is an error encoding the certificate.</exception>
        public virtual byte[] GetEncoded()
        {
            return Arrays.Clone(GetCachedEncoding().GetEncoded());
        }

        public override bool Equals(object other)
        {
            if (this == other)
                return true;

            X509Certificate that = other as X509Certificate;
            if (null == that)
                return false;

            if (this.hashValueSet && that.hashValueSet)
            {
                if (this.hashValue != that.hashValue)
                    return false;
            }
            else if (null == this.cachedEncoding || null == that.cachedEncoding)
            {
                DerBitString signature = c.Signature;
                if (null != signature && !signature.Equals(that.c.Signature))
                    return false;
            }

            byte[] thisEncoding = this.GetCachedEncoding().Encoding;
            byte[] thatEncoding = that.GetCachedEncoding().Encoding;

            return null != thisEncoding
                && null != thatEncoding
                && Arrays.AreEqual(thisEncoding, thatEncoding);
        }

        public override int GetHashCode()
        {
            if (!hashValueSet)
            {
                byte[] thisEncoding = this.GetCachedEncoding().Encoding;

                hashValue = Arrays.GetHashCode(thisEncoding);
                hashValueSet = true;
            }

            return hashValue;
        }

        //		public void setBagAttribute(
        //			DERObjectIdentifier oid,
        //			DEREncodable        attribute)
        //		{
        //			pkcs12Attributes.put(oid, attribute);
        //			pkcs12Ordering.addElement(oid);
        //		}
        //
        //		public DEREncodable getBagAttribute(
        //			DERObjectIdentifier oid)
        //		{
        //			return (DEREncodable)pkcs12Attributes.get(oid);
        //		}
        //
        //		public Enumeration getBagAttributeKeys()
        //		{
        //			return pkcs12Ordering.elements();
        //		}

        public override string ToString()
        {
            StringBuilder buf = new StringBuilder();

            buf.Append("  [0]         Version: ").Append(this.Version).AppendLine();
            buf.Append("         SerialNumber: ").Append(this.SerialNumber).AppendLine();
            buf.Append("             IssuerDN: ").Append(this.IssuerDN).AppendLine();
            buf.Append("           Start Date: ").Append(this.NotBefore).AppendLine();
            buf.Append("           Final Date: ").Append(this.NotAfter).AppendLine();
            buf.Append("            SubjectDN: ").Append(this.SubjectDN).AppendLine();
            buf.Append("           Public Key: ").Append(this.GetPublicKey()).AppendLine();
            buf.Append("  Signature Algorithm: ").Append(this.SigAlgName).AppendLine();

            byte[] sig = this.GetSignature();
            buf.Append("            Signature: ").Append(Hex.ToHexString(sig, 0, 20)).AppendLine();

            for (int i = 20; i < sig.Length; i += 20)
            {
                int len = System.Math.Min(20, sig.Length - i);
                buf.Append("                       ").Append(Hex.ToHexString(sig, i, len)).AppendLine();
            }

            X509Extensions extensions = c.TbsCertificate.Extensions;

            if (extensions != null)
            {
                var e = extensions.ExtensionOids.GetEnumerator();

                if (e.MoveNext())
                {
                    buf.Append("       Extensions: \n");
                }

                do
                {
                    DerObjectIdentifier oid = e.Current;
                    X509Extension ext = extensions.GetExtension(oid);

                    if (ext.Value != null)
                    {
                        Asn1Object obj = X509ExtensionUtilities.FromExtensionValue(ext.Value);

                        buf.Append("                       critical(").Append(ext.IsCritical).Append(") ");
                        try
                        {
                            if (oid.Equals(X509Extensions.BasicConstraints))
                            {
                                buf.Append(BasicConstraints.GetInstance(obj));
                            }
                            else if (oid.Equals(X509Extensions.KeyUsage))
                            {
                                buf.Append(KeyUsage.GetInstance(obj));
                            }
                            else if (oid.Equals(MiscObjectIdentifiers.NetscapeCertType))
                            {
                                buf.Append(new NetscapeCertType((DerBitString)obj));
                            }
                            else if (oid.Equals(MiscObjectIdentifiers.NetscapeRevocationUrl))
                            {
                                buf.Append(new NetscapeRevocationUrl((DerIA5String)obj));
                            }
                            else if (oid.Equals(MiscObjectIdentifiers.VerisignCzagExtension))
                            {
                                buf.Append(new VerisignCzagExtension((DerIA5String)obj));
                            }
                            else
                            {
                                buf.Append(oid.Id);
                                buf.Append(" value = ").Append(Asn1Dump.DumpAsString(obj));
                                //buf.Append(" value = ").Append("*****").AppendLine();
                            }
                        }
                        catch (Exception)
                        {
                            buf.Append(oid.Id);
                            //buf.Append(" value = ").Append(new string(Hex.encode(ext.getValue().getOctets()))).AppendLine();
                            buf.Append(" value = ").Append("*****");
                        }
                    }

                    buf.AppendLine();
                }
                while (e.MoveNext());
            }

            return buf.ToString();
        }

        /// <summary>
        /// Verify the certificate's signature using the nominated public key.
        /// </summary>
        /// <param name="key">An appropriate public key parameter object, RsaPublicKeyParameters, DsaPublicKeyParameters or ECDsaPublicKeyParameters</param>
        /// <returns>True if the signature is valid.</returns>
        /// <exception cref="Exception">If key submitted is not of the above nominated types.</exception>
        public virtual void Verify(
            AsymmetricKeyParameter key)
        {
            CheckSignature(new Asn1VerifierFactory(c.SignatureAlgorithm, key));
        }

        /// <summary>
        /// Verify the certificate's signature using a verifier created using the passed in verifier provider.
        /// </summary>
        /// <param name="verifierProvider">An appropriate provider for verifying the certificate's signature.</param>
        /// <returns>True if the signature is valid.</returns>
        /// <exception cref="Exception">If verifier provider is not appropriate or the certificate algorithm is invalid.</exception>
        public virtual void Verify(
            IVerifierFactoryProvider verifierProvider)
        {
            CheckSignature(verifierProvider.CreateVerifierFactory(c.SignatureAlgorithm));
        }

        protected virtual void CheckSignature(
            IVerifierFactory verifier)
        {
            if (!IsAlgIDEqual(c.SignatureAlgorithm, c.TbsCertificate.Signature))
                throw new CertificateException("signature algorithm in TBS cert not same as outer cert");

            Asn1Encodable parameters = c.SignatureAlgorithm.Parameters;

            IStreamCalculator streamCalculator = verifier.CreateCalculator();

            byte[] b = this.GetTbsCertificate();

            streamCalculator.Stream.Write(b, 0, b.Length);

            Platform.Dispose(streamCalculator.Stream);

            if (!((IVerifier)streamCalculator.GetResult()).IsVerified(this.GetSignature()))
            {
                throw new InvalidKeyException("Public key presented not for certificate signature");
            }
        }

        private CachedEncoding GetCachedEncoding()
        {
            lock (cacheLock)
            {
                if (null != cachedEncoding)
                    return cachedEncoding;
            }

            byte[] encoding = null;
            CertificateEncodingException exception = null;
            try
            {
                encoding = c.GetEncoded(Asn1Encodable.Der);
            }
            catch (IOException e)
            {
                exception = new CertificateEncodingException("Failed to DER-encode certificate", e);
            }

            CachedEncoding temp = new CachedEncoding(encoding, exception);

            lock (cacheLock)
            {
                if (null == cachedEncoding)
                {
                    cachedEncoding = temp;
                }

                return cachedEncoding;
            }
        }

        private static bool IsAlgIDEqual(AlgorithmIdentifier id1, AlgorithmIdentifier id2)
        {
            if (!id1.Algorithm.Equals(id2.Algorithm))
                return false;

            Asn1Encodable p1 = id1.Parameters;
            Asn1Encodable p2 = id2.Parameters;

            if ((p1 == null) == (p2 == null))
                return Platform.Equals(p1, p2);

            // Exactly one of p1, p2 is null at this point
            return p1 == null
                ? p2.ToAsn1Object() is Asn1Null
                : p1.ToAsn1Object() is Asn1Null;
        }
    }
}