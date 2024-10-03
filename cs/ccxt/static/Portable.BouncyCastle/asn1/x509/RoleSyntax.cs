using System;
using System.Text;

namespace Org.BouncyCastle.Asn1.X509
{
	/**
	* Implementation of the RoleSyntax object as specified by the RFC3281.
	*
	* <pre>
	* RoleSyntax ::= SEQUENCE {
	*                 roleAuthority  [0] GeneralNames OPTIONAL,
	*                 roleName       [1] GeneralName
	*           }
	* </pre>
	*/
	public class RoleSyntax
		: Asn1Encodable
	{
		private readonly GeneralNames	roleAuthority;
		private readonly GeneralName	roleName;

		/**
		 * RoleSyntax factory method.
		 * @param obj the object used to construct an instance of <code>
		 * RoleSyntax</code>. It must be an instance of <code>RoleSyntax
		 * </code> or <code>Asn1Sequence</code>.
		 * @return the instance of <code>RoleSyntax</code> built from the
		 * supplied object.
		 * @throws java.lang.ArgumentException if the object passed
		 * to the factory is not an instance of <code>RoleSyntax</code> or
		 * <code>Asn1Sequence</code>.
		 */
		public static RoleSyntax GetInstance(
			object obj)
		{
			if (obj is RoleSyntax)
				return (RoleSyntax)obj;

			if (obj != null)
				return new RoleSyntax(Asn1Sequence.GetInstance(obj));

			return null;
		}

		/**
		* Constructor.
		* @param roleAuthority the role authority of this RoleSyntax.
		* @param roleName    the role name of this RoleSyntax.
		*/
		public RoleSyntax(
			GeneralNames	roleAuthority,
			GeneralName		roleName)
		{
			if (roleName == null
				|| roleName.TagNo != GeneralName.UniformResourceIdentifier
				|| ((IAsn1String) roleName.Name).GetString().Equals(""))
			{
				throw new ArgumentException("the role name MUST be non empty and MUST " +
					"use the URI option of GeneralName");
			}

			this.roleAuthority = roleAuthority;
			this.roleName = roleName;
		}

		/**
		* Constructor. Invoking this constructor is the same as invoking
		* <code>new RoleSyntax(null, roleName)</code>.
		* @param roleName    the role name of this RoleSyntax.
		*/
		public RoleSyntax(
			GeneralName roleName)
			: this(null, roleName)
		{
		}

		/**
		* Utility constructor. Takes a <code>string</code> argument representing
		* the role name, builds a <code>GeneralName</code> to hold the role name
		* and calls the constructor that takes a <code>GeneralName</code>.
		* @param roleName
		*/
		public RoleSyntax(
			string roleName)
			: this(new GeneralName(GeneralName.UniformResourceIdentifier,
				(roleName == null)? "": roleName))
		{
		}

		/**
		* Constructor that builds an instance of <code>RoleSyntax</code> by
		* extracting the encoded elements from the <code>Asn1Sequence</code>
		* object supplied.
		* @param seq    an instance of <code>Asn1Sequence</code> that holds
		* the encoded elements used to build this <code>RoleSyntax</code>.
		*/
		private RoleSyntax(
			Asn1Sequence seq)
		{
			if (seq.Count < 1 || seq.Count > 2)
			{
				throw new ArgumentException("Bad sequence size: " + seq.Count);
			}

			for (int i = 0; i != seq.Count; i++)
			{
				Asn1TaggedObject taggedObject = Asn1TaggedObject.GetInstance(seq[i]);
				switch (taggedObject.TagNo)
				{
					case 0:
						roleAuthority = GeneralNames.GetInstance(taggedObject, false);
						break;
					case 1:
						roleName = GeneralName.GetInstance(taggedObject, true);
						break;
					default:
						throw new ArgumentException("Unknown tag in RoleSyntax");
				}
			}
		}

		/**
		* Gets the role authority of this RoleSyntax.
		* @return    an instance of <code>GeneralNames</code> holding the
		* role authority of this RoleSyntax.
		*/
		public GeneralNames RoleAuthority
		{
			get { return this.roleAuthority; }
		}

		/**
		* Gets the role name of this RoleSyntax.
		* @return    an instance of <code>GeneralName</code> holding the
		* role name of this RoleSyntax.
		*/
		public GeneralName RoleName
		{
			get { return this.roleName; }
		}

		/**
		* Gets the role name as a <code>java.lang.string</code> object.
		* @return    the role name of this RoleSyntax represented as a
		* <code>string</code> object.
		*/
		public string GetRoleNameAsString()
		{
			return ((IAsn1String) this.roleName.Name).GetString();
		}

		/**
		* Gets the role authority as a <code>string[]</code> object.
		* @return the role authority of this RoleSyntax represented as a
		* <code>string[]</code> array.
		*/
		public string[] GetRoleAuthorityAsString()
		{
			if (roleAuthority == null)
			{
				return new string[0];
			}

			GeneralName[] names = roleAuthority.GetNames();
			string[] namesString = new string[names.Length];
			for(int i = 0; i < names.Length; i++)
			{
				Asn1Encodable asn1Value = names[i].Name;
				if (asn1Value is IAsn1String)
				{
					namesString[i] = ((IAsn1String) asn1Value).GetString();
				}
				else
				{
					namesString[i] = asn1Value.ToString();
				}
			}

			return namesString;
		}

		/**
		* Implementation of the method <code>ToAsn1Object</code> as
		* required by the superclass <code>ASN1Encodable</code>.
		*
		* <pre>
		* RoleSyntax ::= SEQUENCE {
		*                 roleAuthority  [0] GeneralNames OPTIONAL,
		*                 roleName       [1] GeneralName
		*           }
		* </pre>
		*/
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(false, 0, roleAuthority);
            v.Add(new DerTaggedObject(true, 1, roleName));
            return new DerSequence(v);
        }

		public override string ToString()
		{
			StringBuilder buff = new StringBuilder("Name: " + this.GetRoleNameAsString() +
				" - Auth: ");

			if (this.roleAuthority == null || roleAuthority.GetNames().Length == 0)
			{
				buff.Append("N/A");
			}
			else
			{
				string[] names = this.GetRoleAuthorityAsString();
				buff.Append('[').Append(names[0]);
				for(int i = 1; i < names.Length; i++)
				{
					buff.Append(", ").Append(names[i]);
				}
				buff.Append(']');
			}

			return buff.ToString();
		}
	}
}
