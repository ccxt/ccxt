using System;

using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>
	/// General class to handle JCA key pairs and convert them into OpenPGP ones.
	/// <p>
	/// A word for the unwary, the KeyId for an OpenPGP public key is calculated from
	/// a hash that includes the time of creation, if you pass a different date to the
	/// constructor below with the same public private key pair the KeyIs will not be the
	/// same as for previous generations of the key, so ideally you only want to do
	/// this once.
	/// </p>
	/// </remarks>
    public class PgpKeyPair
    {
        private readonly PgpPublicKey	pub;
        private readonly PgpPrivateKey	priv;

		public PgpKeyPair(
            PublicKeyAlgorithmTag	algorithm,
            AsymmetricCipherKeyPair	keyPair,
            DateTime				time)
			: this(algorithm, keyPair.Public, keyPair.Private, time)
        {
        }

		public PgpKeyPair(
            PublicKeyAlgorithmTag	algorithm,
            AsymmetricKeyParameter	pubKey,
            AsymmetricKeyParameter	privKey,
            DateTime				time)
        {
            this.pub = new PgpPublicKey(algorithm, pubKey, time);
			this.priv = new PgpPrivateKey(pub.KeyId, pub.PublicKeyPacket, privKey);
        }

		/// <summary>Create a key pair from a PgpPrivateKey and a PgpPublicKey.</summary>
		/// <param name="pub">The public key.</param>
		/// <param name="priv">The private key.</param>
        public PgpKeyPair(
            PgpPublicKey	pub,
            PgpPrivateKey	priv)
        {
            this.pub = pub;
            this.priv = priv;
        }

		/// <summary>The keyId associated with this key pair.</summary>
        public long KeyId
        {
            get { return pub.KeyId; }
        }

		public PgpPublicKey PublicKey
        {
			get { return pub; }
        }

		public PgpPrivateKey PrivateKey
        {
			get { return priv; }
        }
    }
}
