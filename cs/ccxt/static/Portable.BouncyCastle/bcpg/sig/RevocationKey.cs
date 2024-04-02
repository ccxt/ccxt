using System;
using System.Text;

namespace Org.BouncyCastle.Bcpg
{
    /// <summary>
    /// Represents revocation key OpenPGP signature sub packet.
    /// </summary>
    public class RevocationKey
		: SignatureSubpacket
    {
		// 1 octet of class, 
		// 1 octet of public-key algorithm ID, 
		// 20 octets of fingerprint
		public RevocationKey(
			bool	isCritical,
            bool    isLongLength,
            byte[]  data)
			: base(SignatureSubpacketTag.RevocationKey, isCritical, isLongLength, data)
		{
		}

        public RevocationKey(
			bool					isCritical,
			RevocationKeyTag		signatureClass,
			PublicKeyAlgorithmTag	keyAlgorithm,
			byte[]					fingerprint)
			: base(SignatureSubpacketTag.RevocationKey, isCritical, false,
				CreateData(signatureClass, keyAlgorithm, fingerprint))
		{
		}

		private static byte[] CreateData(
			RevocationKeyTag		signatureClass,
			PublicKeyAlgorithmTag	keyAlgorithm,
			byte[]					fingerprint)
		{
			byte[] data = new byte[2 + fingerprint.Length];
			data[0] = (byte)signatureClass;
			data[1] = (byte)keyAlgorithm;
			Array.Copy(fingerprint, 0, data, 2, fingerprint.Length);
			return data;
		}

		public virtual RevocationKeyTag SignatureClass
		{
			get { return (RevocationKeyTag)this.GetData()[0]; }
		}

		public virtual PublicKeyAlgorithmTag Algorithm
		{
			get { return (PublicKeyAlgorithmTag)this.GetData()[1]; }
		}

        public virtual byte[] GetFingerprint()
		{
			byte[] data = this.GetData();
			byte[] fingerprint = new byte[data.Length - 2];
			Array.Copy(data, 2, fingerprint, 0, fingerprint.Length);
			return fingerprint;
		}
    }
}
