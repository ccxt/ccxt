namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Basic PGP packet tag types.</remarks>
    public enum PacketTag
    {
        Reserved =  0,								//  Reserved - a packet tag must not have this value
        PublicKeyEncryptedSession = 1,				// Public-Key Encrypted Session Key Packet
        Signature = 2,								// Signature Packet
        SymmetricKeyEncryptedSessionKey = 3,		// Symmetric-Key Encrypted Session Key Packet
        OnePassSignature = 4,						// One-Pass Signature Packet
        SecretKey = 5,								// Secret Key Packet
        PublicKey = 6,								// Public Key Packet
        SecretSubkey = 7,							// Secret Subkey Packet
        CompressedData = 8,							// Compressed Data Packet
        SymmetricKeyEncrypted = 9,					// Symmetrically Encrypted Data Packet
        Marker = 10,								// Marker Packet
        LiteralData = 11,							// Literal Data Packet
        Trust = 12,									// Trust Packet
        UserId = 13,								// User ID Packet
        PublicSubkey = 14,							// Public Subkey Packet
        UserAttribute = 17,							// User attribute
        SymmetricEncryptedIntegrityProtected = 18,	// Symmetric encrypted, integrity protected
        ModificationDetectionCode = 19,				// Modification detection code

        Experimental1 = 60,							// Private or Experimental Values
        Experimental2 = 61,
        Experimental3 = 62,
        Experimental4 = 63
    }
}
