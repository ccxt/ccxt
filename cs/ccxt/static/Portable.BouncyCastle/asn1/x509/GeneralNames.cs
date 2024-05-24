using System;
using System.Text;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
	public class GeneralNames
		: Asn1Encodable
	{
        private static GeneralName[] Copy(GeneralName[] names)
        {
            return (GeneralName[])names.Clone();
        }

        public static GeneralNames GetInstance(object obj)
		{
            if (obj is GeneralNames)
                return (GeneralNames)obj;
            if (obj == null)
                return null;
            return new GeneralNames(Asn1Sequence.GetInstance(obj));
		}

		public static GeneralNames GetInstance(Asn1TaggedObject obj, bool explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

        public static GeneralNames FromExtensions(X509Extensions extensions, DerObjectIdentifier extOid)
        {
            return GetInstance(X509Extensions.GetExtensionParsedValue(extensions, extOid));
        }

        private readonly GeneralName[] names;

        /// <summary>Construct a GeneralNames object containing one GeneralName.</summary>
		/// <param name="name">The name to be contained.</param>
		public GeneralNames(
			GeneralName name)
		{
			names = new GeneralName[]{ name };
		}

        public GeneralNames(
            GeneralName[] names)
        {
            this.names = Copy(names);
        }

		private GeneralNames(
			Asn1Sequence seq)
		{
			this.names = new GeneralName[seq.Count];

			for (int i = 0; i != seq.Count; i++)
			{
				names[i] = GeneralName.GetInstance(seq[i]);
			}
		}

		public GeneralName[] GetNames()
		{
            return Copy(names);
		}

		/**
		 * Produce an object suitable for an Asn1OutputStream.
		 * <pre>
		 * GeneralNames ::= Sequence SIZE {1..MAX} OF GeneralName
		 * </pre>
		 */
		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(names);
		}

		public override string ToString()
		{
			StringBuilder buf = new StringBuilder();
			buf.AppendLine("GeneralNames:");
			foreach (GeneralName name in names)
			{
				buf.Append("    ")
				   .Append(name)
				   .AppendLine();
			}
			return buf.ToString();
		}
	}
}
