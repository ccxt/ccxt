using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Cms
{
	/**
	* General class for generating a CMS authenticated-data message stream.
	* <p>
	* A simple example of usage.
	* <pre>
	*      CMSAuthenticatedDataStreamGenerator edGen = new CMSAuthenticatedDataStreamGenerator();
	*
	*      edGen.addKeyTransRecipient(cert);
	*
	*      ByteArrayOutputStream  bOut = new ByteArrayOutputStream();
	*
	*      OutputStream out = edGen.open(
	*                              bOut, CMSAuthenticatedDataGenerator.AES128_CBC, "BC");*
	*      out.write(data);
	*
	*      out.close();
	* </pre>
	* </p>
	*/
	public class CmsAuthenticatedDataStreamGenerator
		: CmsAuthenticatedGenerator
	{
		// TODO Add support
//		private object              _originatorInfo = null;
//		private object              _unprotectedAttributes = null;
		private int                 _bufferSize;
		private bool                _berEncodeRecipientSet;

		/**
		* base constructor
		*/
		public CmsAuthenticatedDataStreamGenerator()
		{
		}

		/**
		* constructor allowing specific source of randomness
		* @param rand instance of SecureRandom to use
		*/
		public CmsAuthenticatedDataStreamGenerator(
			SecureRandom rand)
			: base(rand)
		{
		}

		/**
		* Set the underlying string size for encapsulated data
		*
		* @param bufferSize length of octet strings to buffer the data.
		*/
		public void SetBufferSize(
			int bufferSize)
		{
			_bufferSize = bufferSize;
		}

		/**
		* Use a BER Set to store the recipient information
		*/
		public void SetBerEncodeRecipients(
			bool berEncodeRecipientSet)
		{
			_berEncodeRecipientSet = berEncodeRecipientSet;
		}

		/**
		* generate an enveloped object that contains an CMS Enveloped Data
		* object using the given provider and the passed in key generator.
		* @throws java.io.IOException
		*/
		private Stream Open(
			Stream				outStr,
			string				macOid,
			CipherKeyGenerator	keyGen)
		{
			// FIXME Will this work for macs?
			byte[] encKeyBytes = keyGen.GenerateKey();
			KeyParameter encKey = ParameterUtilities.CreateKeyParameter(macOid, encKeyBytes);

			Asn1Encodable asn1Params = GenerateAsn1Parameters(macOid, encKeyBytes);

			ICipherParameters cipherParameters;
			AlgorithmIdentifier macAlgId = GetAlgorithmIdentifier(
				macOid, encKey, asn1Params, out cipherParameters);

			Asn1EncodableVector recipientInfos = new Asn1EncodableVector();

			foreach (RecipientInfoGenerator rig in recipientInfoGenerators)
			{
				try
				{
					recipientInfos.Add(rig.Generate(encKey, rand));
				}
				catch (InvalidKeyException e)
				{
					throw new CmsException("key inappropriate for algorithm.", e);
				}
				catch (GeneralSecurityException e)
				{
					throw new CmsException("error making encrypted content.", e);
				}
			}

			// FIXME Only passing key at the moment
//			return Open(outStr, macAlgId, cipherParameters, recipientInfos);
			return Open(outStr, macAlgId, encKey, recipientInfos);
		}

		protected Stream Open(
			Stream        			outStr,
			AlgorithmIdentifier		macAlgId,
			ICipherParameters		cipherParameters,
			Asn1EncodableVector		recipientInfos)
		{
			try
			{
				//
				// ContentInfo
				//
				BerSequenceGenerator cGen = new BerSequenceGenerator(outStr);

				cGen.AddObject(CmsObjectIdentifiers.AuthenticatedData);

				//
				// Authenticated Data
				//
				BerSequenceGenerator authGen = new BerSequenceGenerator(
					cGen.GetRawOutputStream(), 0, true);

				authGen.AddObject(new DerInteger(AuthenticatedData.CalculateVersion(null)));

				Stream authRaw = authGen.GetRawOutputStream();
				Asn1Generator recipGen = _berEncodeRecipientSet
					?	(Asn1Generator) new BerSetGenerator(authRaw)
					:	new DerSetGenerator(authRaw);

				foreach (Asn1Encodable ae in recipientInfos)
				{
					recipGen.AddObject(ae);
				}

				recipGen.Close();

				authGen.AddObject(macAlgId);

				BerSequenceGenerator eiGen = new BerSequenceGenerator(authRaw);
				eiGen.AddObject(CmsObjectIdentifiers.Data);

				Stream octetOutputStream = CmsUtilities.CreateBerOctetOutputStream(
					eiGen.GetRawOutputStream(), 0, true, _bufferSize);

                IMac mac = MacUtilities.GetMac(macAlgId.Algorithm);
				// TODO Confirm no ParametersWithRandom needed
	            mac.Init(cipherParameters);
				Stream mOut = new TeeOutputStream(octetOutputStream, new MacSink(mac));

				return new CmsAuthenticatedDataOutputStream(mOut, mac, cGen, authGen, eiGen);
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
				throw new CmsException("exception decoding algorithm parameters.", e);
			}
		}

		/**
		* generate an enveloped object that contains an CMS Enveloped Data object
		*/
		public Stream Open(
			Stream	outStr,
			string	encryptionOid)
		{
			CipherKeyGenerator keyGen = GeneratorUtilities.GetKeyGenerator(encryptionOid);

			keyGen.Init(new KeyGenerationParameters(rand, keyGen.DefaultStrength));

			return Open(outStr, encryptionOid, keyGen);
		}

		/**
		* generate an enveloped object that contains an CMS Enveloped Data object
		*/
		public Stream Open(
			Stream	outStr,
			string	encryptionOid,
			int		keySize)
		{
			CipherKeyGenerator keyGen = GeneratorUtilities.GetKeyGenerator(encryptionOid);

			keyGen.Init(new KeyGenerationParameters(rand, keySize));

			return Open(outStr, encryptionOid, keyGen);
		}

		private class CmsAuthenticatedDataOutputStream
			: BaseOutputStream
		{
			private readonly Stream					macStream;
			private readonly IMac					mac;
			private readonly BerSequenceGenerator	cGen;
			private readonly BerSequenceGenerator	authGen;
			private readonly BerSequenceGenerator	eiGen;

			public CmsAuthenticatedDataOutputStream(
				Stream					macStream,
				IMac					mac,
				BerSequenceGenerator	cGen,
				BerSequenceGenerator	authGen,
				BerSequenceGenerator	eiGen)
			{
				this.macStream = macStream;
				this.mac = mac;
				this.cGen = cGen;
				this.authGen = authGen;
				this.eiGen = eiGen;
			}

            public override void Write(byte[] buffer, int offset, int count)
            {
                macStream.Write(buffer, offset, count);
            }

			public override void WriteByte(byte value)
			{
				macStream.WriteByte(value);
			}

            protected override void Dispose(bool disposing)
            {
                if (disposing)
                {
                    Platform.Dispose(macStream);

                    // TODO Parent context(s) should really be be closed explicitly

				    eiGen.Close();

				    // [TODO] auth attributes go here 
				    byte[] macOctets = MacUtilities.DoFinal(mac);
				    authGen.AddObject(new DerOctetString(macOctets));
				    // [TODO] unauth attributes go here

				    authGen.Close();
				    cGen.Close();
                }
                base.Dispose(disposing);
            }
		}
	}
}
