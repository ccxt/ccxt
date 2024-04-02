using System;
using System.IO;

using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Cms;
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Crmf
{
    public class PkiArchiveControlBuilder
    {
        private CmsEnvelopedDataGenerator envGen;
        private CmsProcessableByteArray keyContent;

        /// <summary>
        ///Basic constructor - specify the contents of the PKIArchiveControl structure.
        /// </summary>
        /// <param name="privateKeyInfo">the private key to be archived.</param>
        /// <param name="generalName">the general name to be associated with the private key.</param>
        ///
        public PkiArchiveControlBuilder(PrivateKeyInfo privateKeyInfo, GeneralName generalName)
        {
            EncKeyWithID encKeyWithID = new EncKeyWithID(privateKeyInfo, generalName);

            try
            {
                this.keyContent = new CmsProcessableByteArray(CrmfObjectIdentifiers.id_ct_encKeyWithID, encKeyWithID.GetEncoded());
            }
            catch (IOException e)
            {
                throw new InvalidOperationException("unable to encode key and general name info", e);
            }

            this.envGen = new CmsEnvelopedDataGenerator();
        }

        ///<summary>Add a recipient generator to this control.</summary>       
        ///<param name="recipientGen"> recipient generator created for a specific recipient.</param>
        ///<returns>this builder object.</returns>       
        public PkiArchiveControlBuilder AddRecipientGenerator(RecipientInfoGenerator recipientGen)
        {
            envGen.AddRecipientInfoGenerator(recipientGen);
            return this;
        }
       
        /// <summary>Build the PKIArchiveControl using the passed in encryptor to encrypt its contents.</summary>
        /// <param name="contentEncryptor">a suitable content encryptor.</param>
        /// <returns>a PKIArchiveControl object.</returns>
        public PkiArchiveControl Build(ICipherBuilderWithKey contentEncryptor)
        {                                            
            CmsEnvelopedData envContent = envGen.Generate(keyContent, contentEncryptor);
            EnvelopedData envD = EnvelopedData.GetInstance(envContent.ContentInfo.Content);        
            return new PkiArchiveControl(new PkiArchiveOptions(new EncryptedKey(envD)));
        }
    }
}
