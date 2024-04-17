using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;

using Org.BouncyCastle.Utilities;
using NetUtils = Org.BouncyCastle.Utilities.Net;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The GeneralName object.
     * <pre>
     * GeneralName ::= CHOICE {
     *      otherName                       [0]     OtherName,
     *      rfc822Name                      [1]     IA5String,
     *      dNSName                         [2]     IA5String,
     *      x400Address                     [3]     ORAddress,
     *      directoryName                   [4]     Name,
     *      ediPartyName                    [5]     EDIPartyName,
     *      uniformResourceIdentifier       [6]     IA5String,
     *      iPAddress                       [7]     OCTET STRING,
     *      registeredID                    [8]     OBJECT IDENTIFIER}
     *
     * OtherName ::= Sequence {
     *      type-id    OBJECT IDENTIFIER,
     *      value      [0] EXPLICIT ANY DEFINED BY type-id }
     *
     * EDIPartyName ::= Sequence {
     *      nameAssigner            [0]     DirectoryString OPTIONAL,
     *      partyName               [1]     DirectoryString }
     * </pre>
     */
    public class GeneralName
        : Asn1Encodable, IAsn1Choice
    {
        public const int OtherName					= 0;
        public const int Rfc822Name					= 1;
        public const int DnsName					= 2;
        public const int X400Address				= 3;
        public const int DirectoryName				= 4;
        public const int EdiPartyName				= 5;
        public const int UniformResourceIdentifier	= 6;
        public const int IPAddress					= 7;
        public const int RegisteredID				= 8;

		internal readonly Asn1Encodable	obj;
        internal readonly int			tag;

		public GeneralName(
            X509Name directoryName)
        {
            this.obj = directoryName;
            this.tag = 4;
        }

		/**
         * When the subjectAltName extension contains an Internet mail address,
         * the address MUST be included as an rfc822Name. The format of an
         * rfc822Name is an "addr-spec" as defined in RFC 822 [RFC 822].
         *
         * When the subjectAltName extension contains a domain name service
         * label, the domain name MUST be stored in the dNSName (an IA5String).
         * The name MUST be in the "preferred name syntax," as specified by RFC
         * 1034 [RFC 1034].
         *
         * When the subjectAltName extension contains a URI, the name MUST be
         * stored in the uniformResourceIdentifier (an IA5String). The name MUST
         * be a non-relative URL, and MUST follow the URL syntax and encoding
         * rules specified in [RFC 1738].  The name must include both a scheme
         * (e.g., "http" or "ftp") and a scheme-specific-part.  The scheme-
         * specific-part must include a fully qualified domain name or IP
         * address as the host.
         *
         * When the subjectAltName extension contains a iPAddress, the address
         * MUST be stored in the octet string in "network byte order," as
         * specified in RFC 791 [RFC 791]. The least significant bit (LSB) of
         * each octet is the LSB of the corresponding byte in the network
         * address. For IP Version 4, as specified in RFC 791, the octet string
         * MUST contain exactly four octets.  For IP Version 6, as specified in
         * RFC 1883, the octet string MUST contain exactly sixteen octets [RFC
         * 1883].
         */
        public GeneralName(
            Asn1Object	name,
			int			tag)
        {
            this.obj = name;
            this.tag = tag;
        }

		public GeneralName(
            int				tag,
            Asn1Encodable	name)
        {
            this.obj = name;
            this.tag = tag;
        }

		/**
		 * Create a GeneralName for the given tag from the passed in string.
		 * <p>
		 * This constructor can handle:
		 * <ul>
		 * <li>rfc822Name</li>
		 * <li>iPAddress</li>
		 * <li>directoryName</li>
		 * <li>dNSName</li>
		 * <li>uniformResourceIdentifier</li>
		 * <li>registeredID</li>
		 * </ul>
		 * For x400Address, otherName and ediPartyName there is no common string
		 * format defined.
		 * </p><p>
		 * Note: A directory name can be encoded in different ways into a byte
		 * representation. Be aware of this if the byte representation is used for
		 * comparing results.
		 * </p>
		 *
		 * @param tag tag number
		 * @param name string representation of name
		 * @throws ArgumentException if the string encoding is not correct or
		 *             not supported.
		 */
		public GeneralName(
            int		tag,
            string	name)
        {
			this.tag = tag;

			if (tag == Rfc822Name || tag == DnsName || tag == UniformResourceIdentifier)
			{
				this.obj = new DerIA5String(name);
			}
			else if (tag == RegisteredID)
			{
				this.obj = new DerObjectIdentifier(name);
			}
			else if (tag == DirectoryName)
			{
				this.obj = new X509Name(name);
			}
			else if (tag == IPAddress)
			{
				byte[] enc = toGeneralNameEncoding(name);
				if (enc == null)
					throw new ArgumentException("IP Address is invalid", "name");

				this.obj = new DerOctetString(enc);
			}
			else
			{
				throw new ArgumentException("can't process string for tag: " + tag, "tag");
			}
		}

		public static GeneralName GetInstance(
            object obj)
        {
            if (obj == null || obj is GeneralName)
            {
                return (GeneralName) obj;
            }

            if (obj is Asn1TaggedObject)
            {
                Asn1TaggedObject	tagObj = (Asn1TaggedObject) obj;
                int					tag = tagObj.TagNo;

				switch (tag)
				{
                    case EdiPartyName:
                    case OtherName:
                    case X400Address:
                        return new GeneralName(tag, Asn1Sequence.GetInstance(tagObj, false));

                    case DnsName:
                    case Rfc822Name:
                    case UniformResourceIdentifier:
                        return new GeneralName(tag, DerIA5String.GetInstance(tagObj, false));

					case DirectoryName:
						return new GeneralName(tag, X509Name.GetInstance(tagObj, true));
					case IPAddress:
						return new GeneralName(tag, Asn1OctetString.GetInstance(tagObj, false));
					case RegisteredID:
						return new GeneralName(tag, DerObjectIdentifier.GetInstance(tagObj, false));

                    default:
                        throw new ArgumentException("unknown tag: " + tag);
				}
	        }

            if (obj is byte[])
	        {
	            try
	            {
	                return GetInstance(Asn1Object.FromByteArray((byte[])obj));
	            }
	            catch (IOException)
	            {
	                throw new ArgumentException("unable to parse encoded general name");
	            }
	        }

			throw new ArgumentException("unknown object in GetInstance: " + Platform.GetTypeName(obj), "obj");
		}

		public static GeneralName GetInstance(
            Asn1TaggedObject	tagObj,
            bool				explicitly)
        {
            return GetInstance(Asn1TaggedObject.GetInstance(tagObj, true));
        }

		public int TagNo
		{
			get { return tag; }
		}

		public Asn1Encodable Name
		{
			get { return obj; }
		}

		public override string ToString()
		{
			StringBuilder buf = new StringBuilder();
			buf.Append(tag);
			buf.Append(": ");

			switch (tag)
			{
				case Rfc822Name:
				case DnsName:
				case UniformResourceIdentifier:
					buf.Append(DerIA5String.GetInstance(obj).GetString());
					break;
				case DirectoryName:
					buf.Append(X509Name.GetInstance(obj).ToString());
					break;
				default:
					buf.Append(obj.ToString());
					break;
			}

			return buf.ToString();
		}

		private byte[] toGeneralNameEncoding(
			string ip)
		{
			if (NetUtils.IPAddress.IsValidIPv6WithNetmask(ip) || NetUtils.IPAddress.IsValidIPv6(ip))
			{
				int slashIndex = ip.IndexOf('/');

				if (slashIndex < 0)
				{
					byte[] addr = new byte[16];
					int[]  parsedIp = parseIPv6(ip);
					copyInts(parsedIp, addr, 0);

					return addr;
				}
				else
				{
					byte[] addr = new byte[32];
					int[]  parsedIp = parseIPv6(ip.Substring(0, slashIndex));
					copyInts(parsedIp, addr, 0);
					string mask = ip.Substring(slashIndex + 1);
					if (mask.IndexOf(':') > 0)
					{
						parsedIp = parseIPv6(mask);
					}
					else
					{
						parsedIp = parseMask(mask);
					}
					copyInts(parsedIp, addr, 16);

					return addr;
				}
			}
			else if (NetUtils.IPAddress.IsValidIPv4WithNetmask(ip) || NetUtils.IPAddress.IsValidIPv4(ip))
			{
				int slashIndex = ip.IndexOf('/');

				if (slashIndex < 0)
				{
					byte[] addr = new byte[4];

					parseIPv4(ip, addr, 0);

					return addr;
				}
				else
				{
					byte[] addr = new byte[8];

					parseIPv4(ip.Substring(0, slashIndex), addr, 0);

					string mask = ip.Substring(slashIndex + 1);
					if (mask.IndexOf('.') > 0)
					{
						parseIPv4(mask, addr, 4);
					}
					else
					{
						parseIPv4Mask(mask, addr, 4);
					}

					return addr;
				}
			}

			return null;
		}

		private void parseIPv4Mask(string mask, byte[] addr, int offset)
		{
			int maskVal = int.Parse(mask);

			for (int i = 0; i != maskVal; i++)
			{
				addr[(i / 8) + offset] |= (byte)(1 << (i % 8));
			}
		}

		private void parseIPv4(string ip, byte[] addr, int offset)
		{
			foreach (string token in ip.Split('.', '/'))
			{
				addr[offset++] = (byte)int.Parse(token);
			}
		}

		private int[] parseMask(string mask)
		{
			int[] res = new int[8];
			int maskVal = int.Parse(mask);

			for (int i = 0; i != maskVal; i++)
			{
				res[i / 16] |= 1 << (i % 16);
			}
			return res;
		}

		private void copyInts(int[] parsedIp, byte[] addr, int offSet)
		{
			for (int i = 0; i != parsedIp.Length; i++)
			{
				addr[(i * 2) + offSet] = (byte)(parsedIp[i] >> 8);
				addr[(i * 2 + 1) + offSet] = (byte)parsedIp[i];
			}
		}

		private int[] parseIPv6(string ip)
		{
			if (Platform.StartsWith(ip, "::"))
			{
				ip = ip.Substring(1);
			}
			else if (Platform.EndsWith(ip, "::"))
			{
				ip = ip.Substring(0, ip.Length - 1);
			}

			IEnumerable<string> split = ip.Split(':');
			var sEnum = split.GetEnumerator();

			int index = 0;
			int[] val = new int[8];

			int doubleColon = -1;

			while (sEnum.MoveNext())
			{
				string e = sEnum.Current;

				if (e.Length == 0)
				{
					doubleColon = index;
					val[index++] = 0;
				}
				else
				{
					if (e.IndexOf('.') < 0)
					{
						val[index++] = int.Parse(e, NumberStyles.AllowHexSpecifier);
					}
					else
					{
						string[] tokens = e.Split('.');

						val[index++] = (int.Parse(tokens[0]) << 8) | int.Parse(tokens[1]);
						val[index++] = (int.Parse(tokens[2]) << 8) | int.Parse(tokens[3]);
					}
				}
			}

			if (index != val.Length)
			{
				Array.Copy(val, doubleColon, val, val.Length - (index - doubleColon), index - doubleColon);
				for (int i = doubleColon; i != val.Length - (index - doubleColon); i++)
				{
					val[i] = 0;
				}
			}

			return val;
		}

		public override Asn1Object ToAsn1Object()
        {
            // directoryName is explicitly tagged as it is a CHOICE
            bool isExplicit = (tag == DirectoryName);

            return new DerTaggedObject(isExplicit, tag, obj);
        }
    }
}
