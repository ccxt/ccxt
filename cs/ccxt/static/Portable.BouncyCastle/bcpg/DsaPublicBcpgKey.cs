using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Bcpg
{
    /// <remarks>Base class for a DSA public key.</remarks>
    public class DsaPublicBcpgKey
        : BcpgObject, IBcpgKey
    {
        private readonly MPInteger p, q, g, y;

        /// <param name="bcpgIn">The stream to read the packet from.</param>
        public DsaPublicBcpgKey(
            BcpgInputStream bcpgIn)
        {
            this.p = new MPInteger(bcpgIn);
            this.q = new MPInteger(bcpgIn);
            this.g = new MPInteger(bcpgIn);
            this.y = new MPInteger(bcpgIn);
        }

        public DsaPublicBcpgKey(
            BigInteger	p,
            BigInteger	q,
            BigInteger	g,
            BigInteger	y)
        {
            this.p = new MPInteger(p);
            this.q = new MPInteger(q);
            this.g = new MPInteger(g);
            this.y = new MPInteger(y);
        }

        /// <summary>The format, as a string, always "PGP".</summary>
        public string Format
        {
            get { return "PGP"; }
        }

        /// <summary>Return the standard PGP encoding of the key.</summary>
        public override byte[] GetEncoded()
        {
            try
            {
                return base.GetEncoded();
            }
            catch (Exception)
            {
                return null;
            }
        }

        public override void Encode(
            BcpgOutputStream bcpgOut)
        {
            bcpgOut.WriteObjects(p, q, g, y);
        }

        public BigInteger G
        {
            get { return g.Value; }
        }

        public BigInteger P
        {
            get { return p.Value; }
        }

        public BigInteger Q
        {
            get { return q.Value; }
        }

        public BigInteger Y
        {
            get { return y.Value; }
        }
    }
}
