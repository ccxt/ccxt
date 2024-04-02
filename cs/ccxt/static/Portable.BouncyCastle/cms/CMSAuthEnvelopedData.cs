using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Cms
{
	/**
	* containing class for an CMS AuthEnveloped Data object
	*/
	internal class CmsAuthEnvelopedData
	{
		internal RecipientInformationStore recipientInfoStore;
		internal ContentInfo contentInfo;

		private OriginatorInfo      originator;
		private AlgorithmIdentifier authEncAlg;
		private Asn1Set             authAttrs;
		private byte[]              mac;
		private Asn1Set             unauthAttrs;
	
		public CmsAuthEnvelopedData(
			byte[] authEnvData)
			: this(CmsUtilities.ReadContentInfo(authEnvData))
		{
		}

		public CmsAuthEnvelopedData(
			Stream authEnvData)
			: this(CmsUtilities.ReadContentInfo(authEnvData))
		{
		}

		public CmsAuthEnvelopedData(
			ContentInfo contentInfo)
		{
			this.contentInfo = contentInfo;

			AuthEnvelopedData authEnvData = AuthEnvelopedData.GetInstance(contentInfo.Content);

			this.originator = authEnvData.OriginatorInfo;

			//
	        // read the recipients
	        //
	        Asn1Set recipientInfos = authEnvData.RecipientInfos;

			//
			// read the auth-encrypted content info
			//
			EncryptedContentInfo authEncInfo = authEnvData.AuthEncryptedContentInfo;
			this.authEncAlg = authEncInfo.ContentEncryptionAlgorithm;
			CmsSecureReadable secureReadable = new AuthEnvelopedSecureReadable(this);

			//
			// build the RecipientInformationStore
			//
			this.recipientInfoStore = CmsEnvelopedHelper.BuildRecipientInformationStore(
				recipientInfos, secureReadable);

			// FIXME These need to be passed to the AEAD cipher as AAD (Additional Authenticated Data)
			this.authAttrs = authEnvData.AuthAttrs;
			this.mac = authEnvData.Mac.GetOctets();
			this.unauthAttrs = authEnvData.UnauthAttrs;
		}

		private class AuthEnvelopedSecureReadable : CmsSecureReadable
		{
			private readonly CmsAuthEnvelopedData parent;

			internal AuthEnvelopedSecureReadable(CmsAuthEnvelopedData parent)
			{
				this.parent = parent;
			}

			public AlgorithmIdentifier Algorithm
			{
				get { return parent.authEncAlg; }
			}

			public object CryptoObject
			{
				get { return null; }
			}

			public CmsReadable GetReadable(KeyParameter key)
			{
				// TODO Create AEAD cipher instance to decrypt and calculate tag ( MAC)
				throw new CmsException("AuthEnveloped data decryption not yet implemented");

//				RFC 5084 ASN.1 Module
//				-- Parameters for AlgorithmIdentifier
//				
//				CCMParameters ::= SEQUENCE {
//				  aes-nonce         OCTET STRING (SIZE(7..13)),
//				  aes-ICVlen        AES-CCM-ICVlen DEFAULT 12 }
//				
//				AES-CCM-ICVlen ::= INTEGER (4 | 6 | 8 | 10 | 12 | 14 | 16)
//				
//				GCMParameters ::= SEQUENCE {
//				  aes-nonce        OCTET STRING, -- recommended size is 12 octets
//				  aes-ICVlen       AES-GCM-ICVlen DEFAULT 12 }
//				
//				AES-GCM-ICVlen ::= INTEGER (12 | 13 | 14 | 15 | 16)
			}            
		}
	}
}
