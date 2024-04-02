using System;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>Holder for a list of PgpOnePassSignature objects.</remarks>
    public class PgpOnePassSignatureList
		: PgpObject
    {
        private readonly PgpOnePassSignature[] sigs;

		public PgpOnePassSignatureList(
            PgpOnePassSignature[] sigs)
        {
			this.sigs = (PgpOnePassSignature[]) sigs.Clone();
        }

		public PgpOnePassSignatureList(
            PgpOnePassSignature sig)
        {
			this.sigs = new PgpOnePassSignature[]{ sig };
        }

		public PgpOnePassSignature this[int index]
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
