using System;
using System.Collections.Generic;

using Org.BouncyCastle.Bcpg.Sig;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>Generator for signature subpackets.</remarks>
    public class PgpSignatureSubpacketGenerator
    {
        private readonly List<SignatureSubpacket> list = new List<SignatureSubpacket>();

        /// <summary>
        ///Base constructor, creates an empty generator.
        /// </summary>
        public PgpSignatureSubpacketGenerator()
        {
        }

        ///  <summary>
        ///  Constructor for pre-initialising the generator from an existing one.
        ///  </summary>
        ///  <param name="sigSubV">
        ///  sigSubV an initial set of subpackets.
        ///  </param>
        public PgpSignatureSubpacketGenerator(PgpSignatureSubpacketVector sigSubV)
        {
            if (sigSubV != null)
            {
                SignatureSubpacket[] subs = sigSubV.ToSubpacketArray();
                for (int i = 0; i != sigSubV.Count; i++)
                {
                    list.Add(subs[i]);
                }
            }
        }

        public void SetRevocable(
            bool	isCritical,
            bool	isRevocable)
        {
            list.Add(new Revocable(isCritical, isRevocable));
        }

		public void SetExportable(
            bool	isCritical,
            bool	isExportable)
        {
            list.Add(new Exportable(isCritical, isExportable));
        }

        public void SetFeature(
            bool    isCritical,
            byte    feature)
        {
            list.Add(new Features(isCritical, feature));
        }

        /// <summary>
		/// Add a TrustSignature packet to the signature. The values for depth and trust are largely
		/// installation dependent but there are some guidelines in RFC 4880 - 5.2.3.13.
		/// </summary>
		/// <param name="isCritical">true if the packet is critical.</param>
		/// <param name="depth">depth level.</param>
		/// <param name="trustAmount">trust amount.</param>
		public void SetTrust(
            bool	isCritical,
            int		depth,
            int		trustAmount)
        {
            list.Add(new TrustSignature(isCritical, depth, trustAmount));
        }

		/// <summary>
		/// Set the number of seconds a key is valid for after the time of its creation.
		/// A value of zero means the key never expires.
		/// </summary>
		/// <param name="isCritical">True, if should be treated as critical, false otherwise.</param>
		/// <param name="seconds">The number of seconds the key is valid, or zero if no expiry.</param>
        public void SetKeyExpirationTime(
            bool	isCritical,
            long	seconds)
        {
            list.Add(new KeyExpirationTime(isCritical, seconds));
        }

		/// <summary>
		/// Set the number of seconds a signature is valid for after the time of its creation.
		/// A value of zero means the signature never expires.
		/// </summary>
		/// <param name="isCritical">True, if should be treated as critical, false otherwise.</param>
		/// <param name="seconds">The number of seconds the signature is valid, or zero if no expiry.</param>
        public void SetSignatureExpirationTime(
            bool	isCritical,
            long	seconds)
        {
            list.Add(new SignatureExpirationTime(isCritical, seconds));
        }

		/// <summary>
		/// Set the creation time for the signature.
		/// <p>
		/// Note: this overrides the generation of a creation time when the signature
		/// is generated.</p>
		/// </summary>
		public void SetSignatureCreationTime(
			bool		isCritical,
			DateTime	date)
		{
			list.Add(new SignatureCreationTime(isCritical, date));
		}

		public void SetPreferredHashAlgorithms(
            bool	isCritical,
            int[]	algorithms)
        {
            list.Add(new PreferredAlgorithms(SignatureSubpacketTag.PreferredHashAlgorithms, isCritical, algorithms));
        }

		public void SetPreferredSymmetricAlgorithms(
            bool	isCritical,
            int[]	algorithms)
        {
            list.Add(new PreferredAlgorithms(SignatureSubpacketTag.PreferredSymmetricAlgorithms, isCritical, algorithms));
        }

		public void SetPreferredCompressionAlgorithms(
            bool	isCritical,
            int[]	algorithms)
        {
            list.Add(new PreferredAlgorithms(SignatureSubpacketTag.PreferredCompressionAlgorithms, isCritical, algorithms));
        }

		public void SetKeyFlags(
            bool	isCritical,
            int		flags)
        {
            list.Add(new KeyFlags(isCritical, flags));
        }

		public void SetSignerUserId(
            bool	isCritical,
            string	userId)
        {
            if (userId == null)
                throw new ArgumentNullException("userId");

			list.Add(new SignerUserId(isCritical, userId));
        }

        public void SetSignerUserId(
            bool    isCritical,
            byte[]  rawUserId)
        {
            if (rawUserId == null)
                throw new ArgumentNullException("rawUserId");

            list.Add(new SignerUserId(isCritical, false, rawUserId));
        }

        public void SetEmbeddedSignature(
			bool			isCritical,
			PgpSignature	pgpSignature)
		{
			byte[] sig = pgpSignature.GetEncoded();
			byte[] data;

			// TODO Should be >= ?
			if (sig.Length - 1 > 256)
			{
				data = new byte[sig.Length - 3];
			}
			else
			{
				data = new byte[sig.Length - 2];
			}

			Array.Copy(sig, sig.Length - data.Length, data, 0, data.Length);

			list.Add(new EmbeddedSignature(isCritical, false, data));
		}

		public void SetPrimaryUserId(
            bool	isCritical,
            bool	isPrimaryUserId)
        {
            list.Add(new PrimaryUserId(isCritical, isPrimaryUserId));
        }

		public void SetNotationData(
			bool	isCritical,
			bool	isHumanReadable,
			string	notationName,
			string	notationValue)
		{
			list.Add(new NotationData(isCritical, isHumanReadable, notationName, notationValue));
		}

		/// <summary>
		/// Sets revocation reason sub packet
		/// </summary>	    
		public void SetRevocationReason(bool isCritical, RevocationReasonTag reason,
			string description)
		{
			list.Add(new RevocationReason(isCritical, reason, description));
		}

		/// <summary>
		/// Sets revocation key sub packet
		/// </summary>	
		public void SetRevocationKey(bool isCritical, PublicKeyAlgorithmTag keyAlgorithm, byte[] fingerprint)
		{
			list.Add(new RevocationKey(isCritical, RevocationKeyTag.ClassDefault, keyAlgorithm, fingerprint));
		}

		/// <summary>
		/// Sets issuer key sub packet
		/// </summary>	
		public void SetIssuerKeyID(bool isCritical, long keyID)
		{
			list.Add(new IssuerKeyId(isCritical, keyID));
		}    

		public PgpSignatureSubpacketVector Generate()
        {
            return new PgpSignatureSubpacketVector(list.ToArray());
        }
    }
}
