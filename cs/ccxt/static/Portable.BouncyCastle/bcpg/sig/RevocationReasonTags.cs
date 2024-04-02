namespace Org.BouncyCastle.Bcpg
{
    public enum RevocationReasonTag
		: byte
    {
		NoReason = 0,					// No reason specified (key revocations or cert revocations)
		KeySuperseded = 1,				// Key is superseded (key revocations)
		KeyCompromised = 2,				// Key material has been compromised (key revocations)
		KeyRetired = 3,					// Key is retired and no longer used (key revocations)
		UserNoLongerValid = 32,			// User ID information is no longer valid (cert revocations)

		// 100-110 - Private Use
	}
}
