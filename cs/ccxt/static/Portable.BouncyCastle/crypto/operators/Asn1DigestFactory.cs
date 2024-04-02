using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Operators
{
    public class Asn1DigestFactory : IDigestFactory
    {
        public static Asn1DigestFactory Get(DerObjectIdentifier oid)
        {
            return new Asn1DigestFactory(DigestUtilities.GetDigest(oid), oid);          
        }

        public static Asn1DigestFactory Get(string mechanism)
        {
            DerObjectIdentifier oid = DigestUtilities.GetObjectIdentifier(mechanism);
            return new Asn1DigestFactory(DigestUtilities.GetDigest(oid), oid);
        }

        private readonly IDigest mDigest;
        private readonly DerObjectIdentifier mOid;

        public Asn1DigestFactory(IDigest digest, DerObjectIdentifier oid)
        {
            this.mDigest = digest;
            this.mOid = oid;
        }    

        public virtual object AlgorithmDetails
        {
            get { return new AlgorithmIdentifier(mOid); }
        }

        public virtual int DigestLength
        {
            get { return mDigest.GetDigestSize(); }
        }

        public virtual IStreamCalculator CreateCalculator()
        {
            return new DfDigestStream(mDigest);
        }
    }

    internal class DfDigestStream : IStreamCalculator
    {
        private readonly DigestSink mStream;

        public DfDigestStream(IDigest digest)
        {          
            this.mStream = new DigestSink(digest);
        }

        public Stream Stream
        {
            get { return mStream; }
        }

        public object GetResult()
        {
            byte[] result = new byte[mStream.Digest.GetDigestSize()];
            mStream.Digest.DoFinal(result, 0);
            return new SimpleBlockResult(result);
        }
    }
}
