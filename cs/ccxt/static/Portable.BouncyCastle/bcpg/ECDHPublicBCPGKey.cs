using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Math.EC;

namespace Org.BouncyCastle.Bcpg
{
    /// <remarks>Base class for an ECDH Public Key.</remarks>
    public class ECDHPublicBcpgKey
        : ECPublicBcpgKey
    {
        private byte reserved;
        private HashAlgorithmTag hashFunctionId;
        private SymmetricKeyAlgorithmTag symAlgorithmId;

        /// <param name="bcpgIn">The stream to read the packet from.</param>
        public ECDHPublicBcpgKey(
            BcpgInputStream bcpgIn)
            : base(bcpgIn)
        {
            int length = bcpgIn.ReadByte();
            byte[] kdfParameters =  new byte[length];
            if (kdfParameters.Length != 3)
                throw new InvalidOperationException("kdf parameters size of 3 expected.");

            bcpgIn.ReadFully(kdfParameters);

            reserved = kdfParameters[0];
            hashFunctionId = (HashAlgorithmTag)kdfParameters[1];
            symAlgorithmId = (SymmetricKeyAlgorithmTag)kdfParameters[2];

            VerifyHashAlgorithm();
            VerifySymmetricKeyAlgorithm();
        }

        public ECDHPublicBcpgKey(
            DerObjectIdentifier oid,
            ECPoint point,
            HashAlgorithmTag hashAlgorithm,
            SymmetricKeyAlgorithmTag symmetricKeyAlgorithm)
            : base(oid, point)
        {
            reserved = 1;
            hashFunctionId = hashAlgorithm;
            symAlgorithmId = symmetricKeyAlgorithm;

            VerifyHashAlgorithm();
            VerifySymmetricKeyAlgorithm();
        }

        public virtual byte Reserved
        {
            get { return reserved; }
        }

        public virtual HashAlgorithmTag HashAlgorithm
        {
            get { return hashFunctionId; }
        }

        public virtual SymmetricKeyAlgorithmTag SymmetricKeyAlgorithm
        {
            get { return symAlgorithmId; }
        }

        public override void Encode(
            BcpgOutputStream bcpgOut)
        {
            base.Encode(bcpgOut);
            bcpgOut.WriteByte(0x3);
            bcpgOut.WriteByte(reserved);
            bcpgOut.WriteByte((byte)hashFunctionId);
            bcpgOut.WriteByte((byte)symAlgorithmId);
        }

        private void VerifyHashAlgorithm()
        {
            switch ((HashAlgorithmTag)hashFunctionId)
            {
            case HashAlgorithmTag.Sha256:
            case HashAlgorithmTag.Sha384:
            case HashAlgorithmTag.Sha512:
                break;
            default:
                throw new InvalidOperationException("Hash algorithm must be SHA-256 or stronger.");
            }
        }

        private void VerifySymmetricKeyAlgorithm()
        {
            switch ((SymmetricKeyAlgorithmTag)symAlgorithmId)
            {
            case SymmetricKeyAlgorithmTag.Aes128:
            case SymmetricKeyAlgorithmTag.Aes192:
            case SymmetricKeyAlgorithmTag.Aes256:
                break;
            default:
                throw new InvalidOperationException("Symmetric key algorithm must be AES-128 or stronger.");
            }
        }
    }
}
