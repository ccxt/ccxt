using System;
using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>
    /// General class for reading a PGP object stream.
    /// <p>
    /// Note: if this class finds a PgpPublicKey or a PgpSecretKey it
    /// will create a PgpPublicKeyRing, or a PgpSecretKeyRing for each
    /// key found. If all you are trying to do is read a key ring file use
    /// either PgpPublicKeyRingBundle or PgpSecretKeyRingBundle.</p>
	/// </remarks>
	public class PgpObjectFactory
    {
        private readonly BcpgInputStream bcpgIn;

		public PgpObjectFactory(Stream inputStream)
        {
            this.bcpgIn = BcpgInputStream.Wrap(inputStream);
        }

        public PgpObjectFactory(byte[] bytes)
            : this(new MemoryStream(bytes, false))
        {
        }

		/// <summary>Return the next object in the stream, or null if the end is reached.</summary>
		/// <exception cref="IOException">On a parse error</exception>
        public PgpObject NextPgpObject()
        {
            PacketTag tag = bcpgIn.NextPacketTag();

            if ((int) tag == -1)
                return null;

            switch (tag)
            {
            case PacketTag.Signature:
            {
                var l = new List<PgpSignature>();

                while (bcpgIn.NextPacketTag() == PacketTag.Signature)
                {
                    try
                    {
                        l.Add(new PgpSignature(bcpgIn));
                    }
                    catch (UnsupportedPacketVersionException)
                    {
                        // Signatures of unsupported version MUST BE ignored
                        // see: https://tests.sequoia-pgp.org/#Detached_signatures_with_unknown_packets
                        continue;
                    }
                    catch (PgpException e)
                    {
                        throw new IOException("can't create signature object: " + e);
                    }
                }

                return new PgpSignatureList(l.ToArray());
            }
            case PacketTag.SecretKey:
                try
                {
                    return new PgpSecretKeyRing(bcpgIn);
                }
                catch (PgpException e)
                {
                    throw new IOException("can't create secret key object: " + e);
                }
            case PacketTag.PublicKey:
                return new PgpPublicKeyRing(bcpgIn);
			// TODO Make PgpPublicKey a PgpObject or return a PgpPublicKeyRing
			//case PacketTag.PublicSubkey:
			//	return PgpPublicKeyRing.ReadSubkey(bcpgIn);
            case PacketTag.CompressedData:
                return new PgpCompressedData(bcpgIn);
            case PacketTag.LiteralData:
                return new PgpLiteralData(bcpgIn);
            case PacketTag.PublicKeyEncryptedSession:
            case PacketTag.SymmetricKeyEncryptedSessionKey:
                return new PgpEncryptedDataList(bcpgIn);
            case PacketTag.OnePassSignature:
            {
                var l = new List<PgpOnePassSignature>();

                while (bcpgIn.NextPacketTag() == PacketTag.OnePassSignature)
                {
                    try
                    {
                        l.Add(new PgpOnePassSignature(bcpgIn));
                    }
                    catch (PgpException e)
                    {
						throw new IOException("can't create one pass signature object: " + e);
					}
                }

				return new PgpOnePassSignatureList(l.ToArray());
            }
            case PacketTag.Marker:
                return new PgpMarker(bcpgIn);
            case PacketTag.Experimental1:
            case PacketTag.Experimental2:
            case PacketTag.Experimental3:
            case PacketTag.Experimental4:
				return new PgpExperimental(bcpgIn);
            }

            throw new IOException("unknown object in stream " + bcpgIn.NextPacketTag());
        }

		/// <summary>
		/// Return all available objects in a list.
		/// </summary>
		/// <returns>An <c>IList</c> containing all objects from this factory, in order.</returns>
		public IList<PgpObject> AllPgpObjects()
		{
            var result = new List<PgpObject>();
			PgpObject pgpObject;
			while ((pgpObject = NextPgpObject()) != null)
			{
				result.Add(pgpObject);
			}
			return result;
		}

        /// <summary>
        /// Read all available objects, returning only those that are assignable to the specified type.
        /// </summary>
        /// <returns>An <see cref="IList{T}"/> containing the filtered objects from this factory, in order.</returns>
        public IList<T> FilterPgpObjects<T>()
            where T : PgpObject
        {
            var result = new List<T>();
            PgpObject pgpObject;
            while ((pgpObject = NextPgpObject()) != null)
            {
                if (pgpObject is T t)
                {
                    result.Add(t);
                }
            }
            return result;
        }
    }
}
