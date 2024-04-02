using System;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>A list of PGP signatures - normally in the signature block after literal data.</remarks>
    public class PgpSignatureList
		: PgpObject
    {
        private readonly PgpSignature[] sigs;

		public PgpSignatureList(
            PgpSignature[] sigs)
        {
            this.sigs = (PgpSignature[]) sigs.Clone();
        }

		public PgpSignatureList(
            PgpSignature sig)
        {
			this.sigs = new PgpSignature[]{ sig };
        }

		public PgpSignature this[int index]
		{
			get { return sigs[index]; }
		}

		public int Count
		{
			get { return sigs.Length; }
		}

		public bool IsEmpty
        {
			get { return (sigs.Length == 0); }
        }
    }
}
