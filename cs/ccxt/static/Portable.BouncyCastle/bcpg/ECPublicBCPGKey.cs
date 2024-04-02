using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;

namespace Org.BouncyCastle.Bcpg
{
    /// <remarks>Base class for an EC Public Key.</remarks>
    public abstract class ECPublicBcpgKey
        : BcpgObject, IBcpgKey
    {
        internal DerObjectIdentifier oid;
        internal BigInteger point;

        /// <param name="bcpgIn">The stream to read the packet from.</param>
        protected ECPublicBcpgKey(
            BcpgInputStream bcpgIn)
        {
            this.oid = DerObjectIdentifier.GetInstance(Asn1Object.FromByteArray(ReadBytesOfEncodedLength(bcpgIn)));
            this.point = new MPInteger(bcpgIn).Value;
        }

        protected ECPublicBcpgKey(
            DerObjectIdentifier oid,
            ECPoint point)
        {
            this.point = new BigInteger(1, point.GetEncoded(false));
            this.oid = oid;
        }

        protected ECPublicBcpgKey(
            DerObjectIdentifier oid,
            BigInteger encodedPoint)
        {
            this.point = encodedPoint;
            this.oid = oid;
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
            catch (IOException)
            {
                return null;
            }
        }

        public override void Encode(
            BcpgOutputStream bcpgOut)
        {
            byte[] oid = this.oid.GetEncoded();
            bcpgOut.Write(oid, 1, oid.Length - 1);

            MPInteger point = new MPInteger(this.point);
            bcpgOut.WriteObject(point);
        }

        public virtual BigInteger EncodedPoint
        {
            get { return point; }
        }

        public virtual DerObjectIdentifier CurveOid
        {
            get { return oid; }
        }

        protected static byte[] ReadBytesOfEncodedLength(
            BcpgInputStream bcpgIn)
        {
            int length = bcpgIn.ReadByte();
            if (length < 0)
                throw new EndOfStreamException();
            if (length == 0 || length == 0xFF)
                throw new IOException("future extensions not yet implemented");
            if (length > 127)
                throw new IOException("unsupported OID");

            byte[] buffer = new byte[length + 2];
            bcpgIn.ReadFully(buffer, 2, buffer.Length - 2);
            buffer[0] = (byte)0x06;
            buffer[1] = (byte)length;

            return buffer;
        }
    }
}
