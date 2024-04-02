using System;

using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>General class to contain a private key for use with other OpenPGP objects.</remarks>
    public class PgpPrivateKey
    {
        private readonly long keyID;
        private readonly PublicKeyPacket publicKeyPacket;
        private readonly AsymmetricKeyParameter privateKey;

        /// <summary>
		/// Create a PgpPrivateKey from a keyID, the associated public data packet, and a regular private key.
		/// </summary>
		/// <param name="keyID">ID of the corresponding public key.</param>
        /// <param name="publicKeyPacket">the public key data packet to be associated with this private key.</param>
        /// <param name="privateKey">the private key data packet to be associated with this private key.</param>
        public PgpPrivateKey(
            long                    keyID,
            PublicKeyPacket         publicKeyPacket,
            AsymmetricKeyParameter	privateKey)
        {
			if (!privateKey.IsPrivate)
				throw new ArgumentException("Expected a private key", "privateKey");

            this.keyID = keyID;
            this.publicKeyPacket = publicKeyPacket;
            this.privateKey = privateKey;
        }

        /// <summary>The keyId associated with the contained private key.</summary>
        public long KeyId
        {
			get { return keyID; }
        }

        /// <summary>The public key packet associated with this private key, if available.</summary>
        public PublicKeyPacket PublicKeyPacket
        {
            get { return publicKeyPacket; }
        }

        /// <summary>The contained private key.</summary>
        public AsymmetricKeyParameter Key
        {
			get { return privateKey; }
        }
    }
}
