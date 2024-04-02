using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.Cms.Ecc;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
	internal class KeyAgreeRecipientInfoGenerator : RecipientInfoGenerator
	{
		private static readonly CmsEnvelopedHelper Helper = CmsEnvelopedHelper.Instance;

		private DerObjectIdentifier			keyAgreementOID;
		private DerObjectIdentifier			keyEncryptionOID;
		private IList<X509Certificate>      recipientCerts;
		private AsymmetricCipherKeyPair		senderKeyPair;

		internal KeyAgreeRecipientInfoGenerator()
		{
		}

		internal DerObjectIdentifier KeyAgreementOID
		{
			set { this.keyAgreementOID = value; }
		}

		internal DerObjectIdentifier KeyEncryptionOID
		{
			set { this.keyEncryptionOID = value; }
		}

		internal IEnumerable<X509Certificate> RecipientCerts
		{
			set { this.recipientCerts = new List<X509Certificate>(value); }
		}

		internal AsymmetricCipherKeyPair SenderKeyPair
		{
			set { this.senderKeyPair = value; }
		}

		public RecipientInfo Generate(KeyParameter contentEncryptionKey, SecureRandom random)
		{
			byte[] keyBytes = contentEncryptionKey.GetKey();

			AsymmetricKeyParameter senderPublicKey = senderKeyPair.Public;
			ICipherParameters senderPrivateParams = senderKeyPair.Private;


			OriginatorIdentifierOrKey originator;
			try
			{
				originator = new OriginatorIdentifierOrKey(
					CreateOriginatorPublicKey(senderPublicKey));
			}
			catch (IOException e)
			{
				throw new InvalidKeyException("cannot extract originator public key: " + e);
			}


			Asn1OctetString ukm = null;
			if (keyAgreementOID.Id.Equals(CmsEnvelopedGenerator.ECMqvSha1Kdf))
			{
				try
				{
					IAsymmetricCipherKeyPairGenerator ephemKPG =
						GeneratorUtilities.GetKeyPairGenerator(keyAgreementOID);
					ephemKPG.Init(
						((ECPublicKeyParameters)senderPublicKey).CreateKeyGenerationParameters(random));

					AsymmetricCipherKeyPair ephemKP = ephemKPG.GenerateKeyPair();

					ukm = new DerOctetString(
						new MQVuserKeyingMaterial(
							CreateOriginatorPublicKey(ephemKP.Public), null));

					senderPrivateParams = new MqvPrivateParameters(
						(ECPrivateKeyParameters)senderPrivateParams,
						(ECPrivateKeyParameters)ephemKP.Private,
						(ECPublicKeyParameters)ephemKP.Public);
				}
				catch (IOException e)
				{
					throw new InvalidKeyException("cannot extract MQV ephemeral public key: " + e);
				}
				catch (SecurityUtilityException e)
				{
					throw new InvalidKeyException("cannot determine MQV ephemeral key pair parameters from public key: " + e);
				}
			}


			DerSequence paramSeq = new DerSequence(
				keyEncryptionOID,
				DerNull.Instance);
			AlgorithmIdentifier keyEncAlg = new AlgorithmIdentifier(keyAgreementOID, paramSeq);


			Asn1EncodableVector recipientEncryptedKeys = new Asn1EncodableVector();
			foreach (X509Certificate recipientCert in recipientCerts)
			{
				TbsCertificateStructure tbsCert;
				try
				{
					tbsCert = TbsCertificateStructure.GetInstance(
						Asn1Object.FromByteArray(recipientCert.GetTbsCertificate()));
				}
				catch (Exception)
				{
					throw new ArgumentException("can't extract TBS structure from certificate");
				}

				// TODO Should there be a SubjectKeyIdentifier-based alternative?
				IssuerAndSerialNumber issuerSerial = new IssuerAndSerialNumber(
					tbsCert.Issuer, tbsCert.SerialNumber.Value);
				KeyAgreeRecipientIdentifier karid = new KeyAgreeRecipientIdentifier(issuerSerial);

				ICipherParameters recipientPublicParams = recipientCert.GetPublicKey();
				if (keyAgreementOID.Id.Equals(CmsEnvelopedGenerator.ECMqvSha1Kdf))
				{
					recipientPublicParams = new MqvPublicParameters(
						(ECPublicKeyParameters)recipientPublicParams,
						(ECPublicKeyParameters)recipientPublicParams);
				}

				// Use key agreement to choose a wrap key for this recipient
				IBasicAgreement keyAgreement = AgreementUtilities.GetBasicAgreementWithKdf(
					keyAgreementOID, keyEncryptionOID.Id);
				keyAgreement.Init(new ParametersWithRandom(senderPrivateParams, random));
				BigInteger agreedValue = keyAgreement.CalculateAgreement(recipientPublicParams);

				int keyEncryptionKeySize = GeneratorUtilities.GetDefaultKeySize(keyEncryptionOID) / 8;
				byte[] keyEncryptionKeyBytes = X9IntegerConverter.IntegerToBytes(agreedValue, keyEncryptionKeySize);
				KeyParameter keyEncryptionKey = ParameterUtilities.CreateKeyParameter(
					keyEncryptionOID, keyEncryptionKeyBytes);

				// Wrap the content encryption key with the agreement key
				IWrapper keyWrapper = Helper.CreateWrapper(keyEncryptionOID.Id);
				keyWrapper.Init(true, new ParametersWithRandom(keyEncryptionKey, random));
				byte[] encryptedKeyBytes = keyWrapper.Wrap(keyBytes, 0, keyBytes.Length);

	        	Asn1OctetString encryptedKey = new DerOctetString(encryptedKeyBytes);

				recipientEncryptedKeys.Add(new RecipientEncryptedKey(karid, encryptedKey));
			}

			return new RecipientInfo(new KeyAgreeRecipientInfo(originator, ukm, keyEncAlg,
				new DerSequence(recipientEncryptedKeys)));
		}

		private static OriginatorPublicKey CreateOriginatorPublicKey(
			AsymmetricKeyParameter publicKey)
		{
			SubjectPublicKeyInfo spki = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(publicKey);
			return new OriginatorPublicKey(
                new AlgorithmIdentifier(spki.AlgorithmID.Algorithm, DerNull.Instance),
				spki.PublicKeyData.GetBytes());
		}
	}
}
