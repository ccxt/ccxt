using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Cms
{
	class CmsEnvelopedHelper
	{
		internal static readonly CmsEnvelopedHelper Instance = new CmsEnvelopedHelper();

		private static readonly IDictionary<string, int> KeySizes = new Dictionary<string, int>();
		private static readonly IDictionary<string, string> BaseCipherNames = new Dictionary<string, string>();

		static CmsEnvelopedHelper()
		{
			KeySizes.Add(CmsEnvelopedGenerator.DesEde3Cbc, 192);
			KeySizes.Add(CmsEnvelopedGenerator.Aes128Cbc, 128);
			KeySizes.Add(CmsEnvelopedGenerator.Aes192Cbc, 192);
			KeySizes.Add(CmsEnvelopedGenerator.Aes256Cbc, 256);

			BaseCipherNames.Add(CmsEnvelopedGenerator.DesEde3Cbc,  "DESEDE");
			BaseCipherNames.Add(CmsEnvelopedGenerator.Aes128Cbc,  "AES");
			BaseCipherNames.Add(CmsEnvelopedGenerator.Aes192Cbc,  "AES");
			BaseCipherNames.Add(CmsEnvelopedGenerator.Aes256Cbc,  "AES");
		}

		private string GetAsymmetricEncryptionAlgName(
			string encryptionAlgOid)
		{
			if (Asn1.Pkcs.PkcsObjectIdentifiers.RsaEncryption.Id.Equals(encryptionAlgOid))
			{
				return "RSA/ECB/PKCS1Padding";
			}

			return encryptionAlgOid;
		}

		internal IBufferedCipher CreateAsymmetricCipher(
			string encryptionOid)
		{
			string asymName = GetAsymmetricEncryptionAlgName(encryptionOid);
			if (!asymName.Equals(encryptionOid))
			{
				try
				{
					return CipherUtilities.GetCipher(asymName);
				}
				catch (SecurityUtilityException)
				{
					// Ignore
				}
			}
			return CipherUtilities.GetCipher(encryptionOid);
		}

		internal IWrapper CreateWrapper(
			string encryptionOid)
		{
			try
			{
				return WrapperUtilities.GetWrapper(encryptionOid);
			}
			catch (SecurityUtilityException)
			{
				return WrapperUtilities.GetWrapper(GetAsymmetricEncryptionAlgName(encryptionOid));
			}
		}

		internal string GetRfc3211WrapperName(string oid)
		{
			if (oid == null)
				throw new ArgumentNullException(nameof(oid));

			if (!BaseCipherNames.TryGetValue(oid, out var alg))
				throw new ArgumentException("no name for " + oid, nameof(oid));

			return alg + "RFC3211Wrap";
		}

		internal int GetKeySize(string oid)
		{
			if (oid == null)
				throw new ArgumentNullException(nameof(oid));

			if (!KeySizes.TryGetValue(oid, out var keySize))
				throw new ArgumentException("no keysize for " + oid, "oid");

			return keySize;
		}

		internal static RecipientInformationStore BuildRecipientInformationStore(
			Asn1Set recipientInfos, CmsSecureReadable secureReadable)
		{
			var infos = new List<RecipientInformation>();
			for (int i = 0; i != recipientInfos.Count; i++)
			{
				RecipientInfo info = RecipientInfo.GetInstance(recipientInfos[i]);

				ReadRecipientInfo(infos, info, secureReadable);
			}
			return new RecipientInformationStore(infos);
		}

		private static void ReadRecipientInfo(IList<RecipientInformation> infos, RecipientInfo info,
			CmsSecureReadable secureReadable)
		{
			Asn1Encodable recipInfo = info.Info;
			if (recipInfo is KeyTransRecipientInfo)
			{
				infos.Add(new KeyTransRecipientInformation((KeyTransRecipientInfo)recipInfo, secureReadable));
			}
			else if (recipInfo is KekRecipientInfo)
			{
				infos.Add(new KekRecipientInformation((KekRecipientInfo)recipInfo, secureReadable));
			}
			else if (recipInfo is KeyAgreeRecipientInfo)
			{
				KeyAgreeRecipientInformation.ReadRecipientInfo(infos, (KeyAgreeRecipientInfo)recipInfo, secureReadable);
			}
			else if (recipInfo is PasswordRecipientInfo)
			{
				infos.Add(new PasswordRecipientInformation((PasswordRecipientInfo)recipInfo, secureReadable));
			}
		}

		internal class CmsAuthenticatedSecureReadable : CmsSecureReadable
		{
			private AlgorithmIdentifier algorithm;
			private IMac mac;
			private CmsReadable readable;

			internal CmsAuthenticatedSecureReadable(AlgorithmIdentifier algorithm, CmsReadable readable)
			{
				this.algorithm = algorithm;
				this.readable = readable;
			}

			public AlgorithmIdentifier Algorithm
			{
				get { return this.algorithm; }
			}

			public object CryptoObject
			{
				get { return this.mac; }
			}

			public CmsReadable GetReadable(KeyParameter sKey)
			{
                string macAlg = this.algorithm.Algorithm.Id;
//				Asn1Object sParams = this.algorithm.Parameters.ToAsn1Object();

				try
				{
					this.mac = MacUtilities.GetMac(macAlg);

					// FIXME Support for MAC algorithm parameters similar to cipher parameters
//						ASN1Object sParams = (ASN1Object)macAlg.getParameters();
//
//						if (sParams != null && !(sParams instanceof ASN1Null))
//						{
//							AlgorithmParameters params = CMSEnvelopedHelper.INSTANCE.createAlgorithmParameters(macAlg.getObjectId().getId(), provider);
//
//							params.init(sParams.getEncoded(), "ASN.1");
//
//							mac.init(sKey, params.getParameterSpec(IvParameterSpec.class));
//						}
//						else
					{
						mac.Init(sKey);
					}

//						Asn1Object asn1Params = asn1Enc == null ? null : asn1Enc.ToAsn1Object();
//
//						ICipherParameters cipherParameters = sKey;
//
//						if (asn1Params != null && !(asn1Params is Asn1Null))
//						{
//							cipherParameters = ParameterUtilities.GetCipherParameters(
//							macAlg.Algorithm, cipherParameters, asn1Params);
//						}
//						else
//						{
//							string alg = macAlg.Algorithm.Id;
//							if (alg.Equals(CmsEnvelopedDataGenerator.DesEde3Cbc)
//								|| alg.Equals(CmsEnvelopedDataGenerator.IdeaCbc)
//								|| alg.Equals(CmsEnvelopedDataGenerator.Cast5Cbc))
//							{
//								cipherParameters = new ParametersWithIV(cipherParameters, new byte[8]);
//							}
//						}
//
//						mac.Init(cipherParameters);
				}
				catch (SecurityUtilityException e)
				{
					throw new CmsException("couldn't create cipher.", e);
				}
				catch (InvalidKeyException e)
				{
					throw new CmsException("key invalid in message.", e);
				}
				catch (IOException e)
				{
					throw new CmsException("error decoding algorithm parameters.", e);
				}

				try
				{
					return new CmsProcessableInputStream(
						new TeeInputStream(
							readable.GetInputStream(),
							new MacSink(this.mac)));
				}
				catch (IOException e)
				{
					throw new CmsException("error reading content.", e);
				}
			}
		}

		internal class CmsEnvelopedSecureReadable : CmsSecureReadable
		{
			private AlgorithmIdentifier algorithm;
			private IBufferedCipher cipher;
			private CmsReadable readable;

			internal CmsEnvelopedSecureReadable(AlgorithmIdentifier algorithm, CmsReadable readable)
			{
				this.algorithm = algorithm;
				this.readable = readable;
			}

			public AlgorithmIdentifier Algorithm
			{
				get { return this.algorithm; }
			}

			public object CryptoObject
			{
				get { return this.cipher; }
			}

			public CmsReadable GetReadable(KeyParameter sKey)
			{
				try
				{
                    this.cipher = CipherUtilities.GetCipher(this.algorithm.Algorithm);

					Asn1Encodable asn1Enc = this.algorithm.Parameters;
					Asn1Object asn1Params = asn1Enc == null ? null : asn1Enc.ToAsn1Object();

					ICipherParameters cipherParameters = sKey;

					if (asn1Params != null && !(asn1Params is Asn1Null))
					{
						cipherParameters = ParameterUtilities.GetCipherParameters(
                            this.algorithm.Algorithm, cipherParameters, asn1Params);
					}
					else
					{
                        string alg = this.algorithm.Algorithm.Id;
						if (alg.Equals(CmsEnvelopedDataGenerator.DesEde3Cbc)
							|| alg.Equals(CmsEnvelopedDataGenerator.IdeaCbc)
							|| alg.Equals(CmsEnvelopedDataGenerator.Cast5Cbc))
						{
							cipherParameters = new ParametersWithIV(cipherParameters, new byte[8]);
						}
					}

					cipher.Init(false, cipherParameters);
				}
				catch (SecurityUtilityException e)
				{
					throw new CmsException("couldn't create cipher.", e);
				}
				catch (InvalidKeyException e)
				{
					throw new CmsException("key invalid in message.", e);
				}
				catch (IOException e)
				{
					throw new CmsException("error decoding algorithm parameters.", e);
				}

				try
				{
					return new CmsProcessableInputStream(
						new CipherStream(readable.GetInputStream(), cipher, null));
				}
				catch (IOException e)
				{
					throw new CmsException("error reading content.", e);
				}
			}
		}
	}
}