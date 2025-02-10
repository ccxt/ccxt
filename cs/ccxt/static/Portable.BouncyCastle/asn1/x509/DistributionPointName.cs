using System;
using System.Text;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The DistributionPointName object.
     * <pre>
     * DistributionPointName ::= CHOICE {
     *     fullName                 [0] GeneralNames,
     *     nameRelativeToCRLIssuer  [1] RDN
     * }
     * </pre>
     */
    public class DistributionPointName
        : Asn1Encodable, IAsn1Choice
    {
        internal readonly Asn1Encodable	name;
        internal readonly int			type;

		public const int FullName					= 0;
        public const int NameRelativeToCrlIssuer	= 1;

		public static DistributionPointName GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1TaggedObject.GetInstance(obj, true));
        }

		public static DistributionPointName GetInstance(
            object obj)
        {
            if (obj == null || obj is DistributionPointName)
            {
                return (DistributionPointName) obj;
            }

			if (obj is Asn1TaggedObject)
            {
                return new DistributionPointName((Asn1TaggedObject) obj);
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

        public DistributionPointName(
            int				type,
            Asn1Encodable	name)
        {
            this.type = type;
            this.name = name;
        }

		public DistributionPointName(
			GeneralNames name)
			:	this(FullName, name)
		{
		}

		public int PointType
        {
			get { return type; }
        }

		public Asn1Encodable Name
        {
			get { return name; }
        }

		public DistributionPointName(
            Asn1TaggedObject obj)
        {
            this.type = obj.TagNo;

			if (type == FullName)
            {
                this.name = GeneralNames.GetInstance(obj, false);
            }
            else
            {
                this.name = Asn1Set.GetInstance(obj, false);
            }
        }

		public override Asn1Object ToAsn1Object()
        {
            return new DerTaggedObject(false, type, name);
        }

		public override string ToString()
		{
			StringBuilder buf = new StringBuilder();
			buf.AppendLine("DistributionPointName: [");
			if (type == FullName)
			{
				AppendObject(buf, "fullName", name.ToString());
			}
			else
			{
				AppendObject(buf, "nameRelativeToCRLIssuer", name.ToString());
			}
			buf.AppendLine("]");
			return buf.ToString();
		}

		private void AppendObject(StringBuilder buf, string name, string val)
		{
			string indent = "    ";
			buf.Append(indent);
			buf.Append(name);
			buf.AppendLine(":");
			buf.Append(indent);
			buf.Append(indent);
			buf.Append(val);
            buf.AppendLine();
        }
    }
}
