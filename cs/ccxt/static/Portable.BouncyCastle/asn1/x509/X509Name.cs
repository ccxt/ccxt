using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
    * <pre>
    *     RDNSequence ::= SEQUENCE OF RelativeDistinguishedName
    *
    *     RelativeDistinguishedName ::= SET SIZE (1..MAX) OF AttributeTypeAndValue
    *
    *     AttributeTypeAndValue ::= SEQUENCE {
    *                                   type  OBJECT IDENTIFIER,
    *                                   value ANY }
    * </pre>
    */
    public class X509Name
        : Asn1Encodable
    {
        /**
        * country code - StringType(SIZE(2))
        */
        public static readonly DerObjectIdentifier C = new DerObjectIdentifier("2.5.4.6");

        /**
        * organization - StringType(SIZE(1..64))
        */
        public static readonly DerObjectIdentifier O = new DerObjectIdentifier("2.5.4.10");

        /**
        * organizational unit name - StringType(SIZE(1..64))
        */
        public static readonly DerObjectIdentifier OU = new DerObjectIdentifier("2.5.4.11");

        /**
        * Title
        */
        public static readonly DerObjectIdentifier T = new DerObjectIdentifier("2.5.4.12");

        /**
        * common name - StringType(SIZE(1..64))
        */
        public static readonly DerObjectIdentifier CN = new DerObjectIdentifier("2.5.4.3");

        /**
        * street - StringType(SIZE(1..64))
        */
        public static readonly DerObjectIdentifier Street = new DerObjectIdentifier("2.5.4.9");

        /**
        * device serial number name - StringType(SIZE(1..64))
        */
        public static readonly DerObjectIdentifier SerialNumber = new DerObjectIdentifier("2.5.4.5");

        /**
        * locality name - StringType(SIZE(1..64))
        */
        public static readonly DerObjectIdentifier L = new DerObjectIdentifier("2.5.4.7");

        /**
        * state, or province name - StringType(SIZE(1..64))
        */
        public static readonly DerObjectIdentifier ST = new DerObjectIdentifier("2.5.4.8");

        /**
        * Naming attributes of type X520name
        */
        public static readonly DerObjectIdentifier Surname = new DerObjectIdentifier("2.5.4.4");
        public static readonly DerObjectIdentifier GivenName = new DerObjectIdentifier("2.5.4.42");
        public static readonly DerObjectIdentifier Initials = new DerObjectIdentifier("2.5.4.43");
        public static readonly DerObjectIdentifier Generation = new DerObjectIdentifier("2.5.4.44");
        public static readonly DerObjectIdentifier UniqueIdentifier = new DerObjectIdentifier("2.5.4.45");

        /**
         * businessCategory - DirectoryString(SIZE(1..128)
         */
        public static readonly DerObjectIdentifier BusinessCategory = new DerObjectIdentifier(
                                                                       "2.5.4.15");

        /**
         * postalCode - DirectoryString(SIZE(1..40)
         */
        public static readonly DerObjectIdentifier PostalCode = new DerObjectIdentifier(
                                                                 "2.5.4.17");

        /**
         * dnQualifier - DirectoryString(SIZE(1..64)
         */
        public static readonly DerObjectIdentifier DnQualifier = new DerObjectIdentifier(
                                                         "2.5.4.46");

        /**
         * RFC 3039 Pseudonym - DirectoryString(SIZE(1..64)
         */
        public static readonly DerObjectIdentifier Pseudonym = new DerObjectIdentifier(
                                                                "2.5.4.65");

        /**
         * RFC 3039 DateOfBirth - GeneralizedTime - YYYYMMDD000000Z
         */
        public static readonly DerObjectIdentifier DateOfBirth = new DerObjectIdentifier(
                                                                  "1.3.6.1.5.5.7.9.1");

        /**
         * RFC 3039 PlaceOfBirth - DirectoryString(SIZE(1..128)
         */
        public static readonly DerObjectIdentifier PlaceOfBirth = new DerObjectIdentifier(
                                                                   "1.3.6.1.5.5.7.9.2");

        /**
         * RFC 3039 DateOfBirth - PrintableString (SIZE(1)) -- "M", "F", "m" or "f"
         */
        public static readonly DerObjectIdentifier Gender = new DerObjectIdentifier(
                                                                   "1.3.6.1.5.5.7.9.3");

        /**
         * RFC 3039 CountryOfCitizenship - PrintableString (SIZE (2)) -- ISO 3166
         * codes only
         */
        public static readonly DerObjectIdentifier CountryOfCitizenship = new DerObjectIdentifier(
                                                                           "1.3.6.1.5.5.7.9.4");

        /**
         * RFC 3039 CountryOfCitizenship - PrintableString (SIZE (2)) -- ISO 3166
         * codes only
         */
        public static readonly DerObjectIdentifier CountryOfResidence = new DerObjectIdentifier(
                                                                         "1.3.6.1.5.5.7.9.5");

        /**
         * ISIS-MTT NameAtBirth - DirectoryString(SIZE(1..64)
         */
        public static readonly DerObjectIdentifier NameAtBirth =  new DerObjectIdentifier("1.3.36.8.3.14");

        /**
         * RFC 3039 PostalAddress - SEQUENCE SIZE (1..6) OF
         * DirectoryString(SIZE(1..30))
         */
        public static readonly DerObjectIdentifier PostalAddress = new DerObjectIdentifier("2.5.4.16");

        /**
         * RFC 2256 dmdName
         */
        public static readonly DerObjectIdentifier DmdName = new DerObjectIdentifier("2.5.4.54");

        /**
         * id-at-telephoneNumber
         */
        public static readonly DerObjectIdentifier TelephoneNumber = X509ObjectIdentifiers.id_at_telephoneNumber;

        /**
         * id-at-organizationIdentifier
         */
        public static readonly DerObjectIdentifier OrganizationIdentifier = X509ObjectIdentifiers.id_at_organizationIdentifier;

        /**
         * id-at-name
         */
        public static readonly DerObjectIdentifier Name = X509ObjectIdentifiers.id_at_name;

        /**
        * Email address (RSA PKCS#9 extension) - IA5String.
        * <p>Note: if you're trying to be ultra orthodox, don't use this! It shouldn't be in here.</p>
        */
        public static readonly DerObjectIdentifier EmailAddress = PkcsObjectIdentifiers.Pkcs9AtEmailAddress;

        /**
        * more from PKCS#9
        */
        public static readonly DerObjectIdentifier UnstructuredName = PkcsObjectIdentifiers.Pkcs9AtUnstructuredName;
        public static readonly DerObjectIdentifier UnstructuredAddress = PkcsObjectIdentifiers.Pkcs9AtUnstructuredAddress;

        /**
        * email address in Verisign certificates
        */
        public static readonly DerObjectIdentifier E = EmailAddress;

        /*
        * others...
        */
        public static readonly DerObjectIdentifier DC = new DerObjectIdentifier("0.9.2342.19200300.100.1.25");

        /**
        * LDAP User id.
        */
        public static readonly DerObjectIdentifier UID = new DerObjectIdentifier("0.9.2342.19200300.100.1.1");

        /**
        * determines whether or not strings should be processed and printed
        * from back to front.
        */
        public static bool DefaultReverse
        {
            get { lock (defaultReverse) return defaultReverse[0]; }
            set { lock (defaultReverse) defaultReverse[0] = value; }
        }

        private static readonly bool[] defaultReverse = { false };

        /**
        * default look up table translating OID values into their common symbols following
        * the convention in RFC 2253 with a few extras
        */
        private static readonly IDictionary<DerObjectIdentifier, string> DefaultSymbolsInternal =
            new Dictionary<DerObjectIdentifier, string>();
        public static readonly IDictionary<DerObjectIdentifier, string> DefaultSymbols =
            CollectionUtilities.ReadOnly(DefaultSymbolsInternal);

        /**
         * look up table translating OID values into their common symbols following the convention in RFC 2253
         */
        private static readonly IDictionary<DerObjectIdentifier, string> RFC2253SymbolsInternal =
            new Dictionary<DerObjectIdentifier, string>();
        public static readonly IDictionary<DerObjectIdentifier, string> RFC2253Symbols =
            CollectionUtilities.ReadOnly(RFC2253SymbolsInternal);

        /**
         * look up table translating OID values into their common symbols following the convention in RFC 1779
         *
         */
        private static readonly IDictionary<DerObjectIdentifier, string> RFC1779SymbolsInternal =
            new Dictionary<DerObjectIdentifier, string>();
        public static readonly IDictionary<DerObjectIdentifier, string> RFC1779Symbols =
            CollectionUtilities.ReadOnly(RFC1779SymbolsInternal);

        /**
        * look up table translating common symbols into their OIDS.
        */
        private static readonly IDictionary<string, DerObjectIdentifier> DefaultLookupInternal =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);
        public static readonly IDictionary<string, DerObjectIdentifier> DefaultLookup =
            CollectionUtilities.ReadOnly(DefaultLookupInternal);

        static X509Name()
        {
            DefaultSymbolsInternal.Add(C, "C");
            DefaultSymbolsInternal.Add(O, "O");
            DefaultSymbolsInternal.Add(T, "T");
            DefaultSymbolsInternal.Add(OU, "OU");
            DefaultSymbolsInternal.Add(CN, "CN");
            DefaultSymbolsInternal.Add(L, "L");
            DefaultSymbolsInternal.Add(ST, "ST");
            DefaultSymbolsInternal.Add(SerialNumber, "SERIALNUMBER");
            DefaultSymbolsInternal.Add(EmailAddress, "E");
            DefaultSymbolsInternal.Add(DC, "DC");
            DefaultSymbolsInternal.Add(UID, "UID");
            DefaultSymbolsInternal.Add(Street, "STREET");
            DefaultSymbolsInternal.Add(Surname, "SURNAME");
            DefaultSymbolsInternal.Add(GivenName, "GIVENNAME");
            DefaultSymbolsInternal.Add(Initials, "INITIALS");
            DefaultSymbolsInternal.Add(Generation, "GENERATION");
            DefaultSymbolsInternal.Add(UnstructuredAddress, "unstructuredAddress");
            DefaultSymbolsInternal.Add(UnstructuredName, "unstructuredName");
            DefaultSymbolsInternal.Add(UniqueIdentifier, "UniqueIdentifier");
            DefaultSymbolsInternal.Add(DnQualifier, "DN");
            DefaultSymbolsInternal.Add(Pseudonym, "Pseudonym");
            DefaultSymbolsInternal.Add(PostalAddress, "PostalAddress");
            DefaultSymbolsInternal.Add(NameAtBirth, "NameAtBirth");
            DefaultSymbolsInternal.Add(CountryOfCitizenship, "CountryOfCitizenship");
            DefaultSymbolsInternal.Add(CountryOfResidence, "CountryOfResidence");
            DefaultSymbolsInternal.Add(Gender, "Gender");
            DefaultSymbolsInternal.Add(PlaceOfBirth, "PlaceOfBirth");
            DefaultSymbolsInternal.Add(DateOfBirth, "DateOfBirth");
            DefaultSymbolsInternal.Add(PostalCode, "PostalCode");
            DefaultSymbolsInternal.Add(BusinessCategory, "BusinessCategory");
            DefaultSymbolsInternal.Add(TelephoneNumber, "TelephoneNumber");

            RFC2253SymbolsInternal.Add(C, "C");
            RFC2253SymbolsInternal.Add(O, "O");
            RFC2253SymbolsInternal.Add(OU, "OU");
            RFC2253SymbolsInternal.Add(CN, "CN");
            RFC2253SymbolsInternal.Add(L, "L");
            RFC2253SymbolsInternal.Add(ST, "ST");
            RFC2253SymbolsInternal.Add(Street, "STREET");
            RFC2253SymbolsInternal.Add(DC, "DC");
            RFC2253SymbolsInternal.Add(UID, "UID");

            RFC1779SymbolsInternal.Add(C, "C");
            RFC1779SymbolsInternal.Add(O, "O");
            RFC1779SymbolsInternal.Add(OU, "OU");
            RFC1779SymbolsInternal.Add(CN, "CN");
            RFC1779SymbolsInternal.Add(L, "L");
            RFC1779SymbolsInternal.Add(ST, "ST");
            RFC1779SymbolsInternal.Add(Street, "STREET");

            DefaultLookupInternal.Add("c", C);
            DefaultLookupInternal.Add("o", O);
            DefaultLookupInternal.Add("t", T);
            DefaultLookupInternal.Add("ou", OU);
            DefaultLookupInternal.Add("cn", CN);
            DefaultLookupInternal.Add("l", L);
            DefaultLookupInternal.Add("st", ST);
            DefaultLookupInternal.Add("serialnumber", SerialNumber);
            DefaultLookupInternal.Add("street", Street);
            DefaultLookupInternal.Add("emailaddress", E);
            DefaultLookupInternal.Add("dc", DC);
            DefaultLookupInternal.Add("e", E);
            DefaultLookupInternal.Add("uid", UID);
            DefaultLookupInternal.Add("surname", Surname);
            DefaultLookupInternal.Add("givenname", GivenName);
            DefaultLookupInternal.Add("initials", Initials);
            DefaultLookupInternal.Add("generation", Generation);
            DefaultLookupInternal.Add("unstructuredaddress", UnstructuredAddress);
            DefaultLookupInternal.Add("unstructuredname", UnstructuredName);
            DefaultLookupInternal.Add("uniqueidentifier", UniqueIdentifier);
            DefaultLookupInternal.Add("dn", DnQualifier);
            DefaultLookupInternal.Add("pseudonym", Pseudonym);
            DefaultLookupInternal.Add("postaladdress", PostalAddress);
            DefaultLookupInternal.Add("nameofbirth", NameAtBirth);
            DefaultLookupInternal.Add("countryofcitizenship", CountryOfCitizenship);
            DefaultLookupInternal.Add("countryofresidence", CountryOfResidence);
            DefaultLookupInternal.Add("gender", Gender);
            DefaultLookupInternal.Add("placeofbirth", PlaceOfBirth);
            DefaultLookupInternal.Add("dateofbirth", DateOfBirth);
            DefaultLookupInternal.Add("postalcode", PostalCode);
            DefaultLookupInternal.Add("businesscategory", BusinessCategory);
            DefaultLookupInternal.Add("telephonenumber", TelephoneNumber);
        }

        private readonly List<DerObjectIdentifier> ordering = new List<DerObjectIdentifier>();
        private readonly X509NameEntryConverter converter;

        private IList<string> values = new List<string>();
        private IList<bool> added = new List<bool>();
        private Asn1Sequence seq;

        /**
        * Return a X509Name based on the passed in tagged object.
        *
        * @param obj tag object holding name.
        * @param explicitly true if explicitly tagged false otherwise.
        * @return the X509Name
        */
        public static X509Name GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

        public static X509Name GetInstance(
            object obj)
        {
            if (obj is X509Name)
                return (X509Name)obj;
            if (obj == null)
                return null;
            return new X509Name(Asn1Sequence.GetInstance(obj));
        }

        protected X509Name()
        {
        }

        /**
        * Constructor from Asn1Sequence
        *
        * the principal will be a list of constructed sets, each containing an (OID, string) pair.
        */
        protected X509Name(Asn1Sequence seq)
        {
            this.seq = seq;

            foreach (Asn1Encodable asn1Obj in seq)
            {
                Asn1Set asn1Set = Asn1Set.GetInstance(asn1Obj.ToAsn1Object());

                for (int i = 0; i < asn1Set.Count; i++)
                {
                    Asn1Sequence s = Asn1Sequence.GetInstance(asn1Set[i].ToAsn1Object());

                    if (s.Count != 2)
                        throw new ArgumentException("badly sized pair");

                    ordering.Add(DerObjectIdentifier.GetInstance(s[0].ToAsn1Object()));

                    Asn1Object derValue = s[1].ToAsn1Object();
                    if (derValue is IAsn1String && !(derValue is DerUniversalString))
                    {
                        string v = ((IAsn1String)derValue).GetString();
                        if (v.StartsWith("#"))
                        {
                            v = "\\" + v;
                        }

                        values.Add(v);
                    }
                    else
                    {
                        values.Add("#" + Hex.ToHexString(derValue.GetEncoded()));
                    }

                    added.Add(i != 0);
                }
            }
        }

        /**
        * Constructor from a table of attributes with ordering.
        * <p>
        * it's is assumed the table contains OID/string pairs, and the contents
        * of the table are copied into an internal table as part of the
        * construction process. The ordering ArrayList should contain the OIDs
        * in the order they are meant to be encoded or printed in ToString.</p>
        */
        public X509Name(
            IList<DerObjectIdentifier> ordering,
            IDictionary<DerObjectIdentifier, string> attributes)
            : this(ordering, attributes, new X509DefaultEntryConverter())
        {
        }

        /**
        * Constructor from a table of attributes with ordering.
        * <p>
        * it's is assumed the table contains OID/string pairs, and the contents
        * of the table are copied into an internal table as part of the
        * construction process. The ordering ArrayList should contain the OIDs
        * in the order they are meant to be encoded or printed in ToString.</p>
        * <p>
        * The passed in converter will be used to convert the strings into their
        * ASN.1 counterparts.</p>
        */
        public X509Name(
            IList<DerObjectIdentifier> ordering,
            IDictionary<DerObjectIdentifier, string> attributes,
            X509NameEntryConverter	converter)
        {
            this.converter = converter;

            foreach (DerObjectIdentifier oid in ordering)
            {
                if (!attributes.TryGetValue(oid, out var attribute))
                    throw new ArgumentException("No attribute for object id - " + oid + " - passed to distinguished name");

                //object attribute = attributes[oid];
                //if (attribute == null)
                //{
                //    throw new ArgumentException("No attribute for object id - " + oid + " - passed to distinguished name");
                //}

                this.ordering.Add(oid);
                this.added.Add(false);
                this.values.Add(attribute); // copy the hash table
            }
        }

        /**
        * Takes two vectors one of the oids and the other of the values.
        */
        public X509Name(IList<DerObjectIdentifier> oids, IList<string> values)
            : this(oids, values, new X509DefaultEntryConverter())
        {
        }

        /**
        * Takes two vectors one of the oids and the other of the values.
        * <p>
        * The passed in converter will be used to convert the strings into their
        * ASN.1 counterparts.</p>
        */
        public X509Name(IList<DerObjectIdentifier> oids, IList<string> values, X509NameEntryConverter converter)
        {
            this.converter = converter;

            if (oids.Count != values.Count)
                throw new ArgumentException("'oids' must be same length as 'values'.");

            for (int i = 0; i < oids.Count; i++)
            {
                this.ordering.Add(oids[i]);
                this.values.Add(values[i]);
                this.added.Add(false);
            }
        }

        /**
        * Takes an X509 dir name as a string of the format "C=AU, ST=Victoria", or
        * some such, converting it into an ordered set of name attributes.
        */
        public X509Name(string dirName)
            : this(DefaultReverse, DefaultLookup, dirName)
        {
        }

        /**
        * Takes an X509 dir name as a string of the format "C=AU, ST=Victoria", or
        * some such, converting it into an ordered set of name attributes with each
        * string value being converted to its associated ASN.1 type using the passed
        * in converter.
        */
        public X509Name(string dirName, X509NameEntryConverter converter)
            : this(DefaultReverse, DefaultLookup, dirName, converter)
        {
        }

        /**
        * Takes an X509 dir name as a string of the format "C=AU, ST=Victoria", or
        * some such, converting it into an ordered set of name attributes. If reverse
        * is true, create the encoded version of the sequence starting from the
        * last element in the string.
        */
        public X509Name(bool reverse, string dirName)
            : this(reverse, DefaultLookup, dirName)
        {
        }

        /**
        * Takes an X509 dir name as a string of the format "C=AU, ST=Victoria", or
        * some such, converting it into an ordered set of name attributes with each
        * string value being converted to its associated ASN.1 type using the passed
        * in converter. If reverse is true the ASN.1 sequence representing the DN will
        * be built by starting at the end of the string, rather than the start.
        */
        public X509Name(bool reverse, string dirName, X509NameEntryConverter converter)
            : this(reverse, DefaultLookup, dirName, converter)
        {
        }

        /**
        * Takes an X509 dir name as a string of the format "C=AU, ST=Victoria", or
        * some such, converting it into an ordered set of name attributes. lookUp
        * should provide a table of lookups, indexed by lowercase only strings and
        * yielding a DerObjectIdentifier, other than that OID. and numeric oids
        * will be processed automatically.
        * <br/>
        * If reverse is true, create the encoded version of the sequence
        * starting from the last element in the string.
        * @param reverse true if we should start scanning from the end (RFC 2553).
        * @param lookUp table of names and their oids.
        * @param dirName the X.500 string to be parsed.
        */
        public X509Name(bool reverse, IDictionary<string, DerObjectIdentifier> lookup, string dirName)
            : this(reverse, lookup, dirName, new X509DefaultEntryConverter())
        {
        }

        private DerObjectIdentifier DecodeOid(string name, IDictionary<string, DerObjectIdentifier> lookup)
        {
            if (name.StartsWith("OID.", StringComparison.OrdinalIgnoreCase))
                return new DerObjectIdentifier(name.Substring("OID.".Length));

            if (name[0] >= '0' && name[0] <= '9')
                return new DerObjectIdentifier(name);

            if (lookup.TryGetValue(name, out var oid))
                return oid;

            throw new ArgumentException("Unknown object id - " + name + " - passed to distinguished name");
        }

        /**
        * Takes an X509 dir name as a string of the format "C=AU, ST=Victoria", or
        * some such, converting it into an ordered set of name attributes. lookUp
        * should provide a table of lookups, indexed by lowercase only strings and
        * yielding a DerObjectIdentifier, other than that OID. and numeric oids
        * will be processed automatically. The passed in converter is used to convert the
        * string values to the right of each equals sign to their ASN.1 counterparts.
        * <br/>
        * @param reverse true if we should start scanning from the end, false otherwise.
        * @param lookUp table of names and oids.
        * @param dirName the string dirName
        * @param converter the converter to convert string values into their ASN.1 equivalents
        */
        public X509Name(bool reverse, IDictionary<string, DerObjectIdentifier> lookup, string dirName,
            X509NameEntryConverter converter)
        {
            this.converter = converter;
            X509NameTokenizer nTok = new X509NameTokenizer(dirName);

            while (nTok.HasMoreTokens())
            {
                string token = nTok.NextToken();
                int index = token.IndexOf('=');

                if (index == -1)
                    throw new ArgumentException("badly formated directory string");

                string name = token.Substring(0, index);
                string value = token.Substring(index + 1);
                DerObjectIdentifier	oid = DecodeOid(name, lookup);

                if (value.IndexOf('+') > 0)
                {
                    X509NameTokenizer vTok = new X509NameTokenizer(value, '+');
                    string v = vTok.NextToken();

                    this.ordering.Add(oid);
                    this.values.Add(v);
                    this.added.Add(false);

                    while (vTok.HasMoreTokens())
                    {
                        string sv = vTok.NextToken();
                        int ndx = sv.IndexOf('=');

                        string nm = sv.Substring(0, ndx);
                        string vl = sv.Substring(ndx + 1);
                        this.ordering.Add(DecodeOid(nm, lookup));
                        this.values.Add(vl);
                        this.added.Add(true);
                    }
                }
                else
                {
                    this.ordering.Add(oid);
                    this.values.Add(value);
                    this.added.Add(false);
                }
            }

            if (reverse)
            {
//				this.ordering.Reverse();
//				this.values.Reverse();
//				this.added.Reverse();
                var o = new List<DerObjectIdentifier>();
                var v = new List<string>();
                var a = new List<bool>();
                int count = 1;

                for (int i = 0; i < this.ordering.Count; i++)
                {
                    if (!((bool) this.added[i]))
                    {
                        count = 0;
                    }

                    int index = count++;

                    o.Insert(index, this.ordering[i]);
                    v.Insert(index, this.values[i]);
                    a.Insert(index, this.added[i]);
                }

                this.ordering = o;
                this.values = v;
                this.added = a;
            }
        }

        /**
        * return an IList of the oids in the name, in the order they were found.
        */
        public IList<DerObjectIdentifier> GetOidList()
        {
            return new List<DerObjectIdentifier>(ordering);
        }

        /**
        * return an IList of the values found in the name, in the order they
        * were found.
        */
        public IList<string> GetValueList()
        {
            return GetValueList(null);
        }

        /**
         * return an IList of the values found in the name, in the order they
         * were found, with the DN label corresponding to passed in oid.
         */
        public IList<string> GetValueList(DerObjectIdentifier oid)
        {
            var v = new List<string>();
            for (int i = 0; i != values.Count; i++)
            {
                if (null == oid || oid.Equals(ordering[i]))
                {
                    string val = (string)values[i];
                    if (val.StartsWith("\\#"))
                    {
                        val = val.Substring(1);
                    }

                    v.Add(val);
                }
            }
            return v;
        }

        public override Asn1Object ToAsn1Object()
        {
            if (seq == null)
            {
                Asn1EncodableVector vec = new Asn1EncodableVector();
                Asn1EncodableVector sVec = new Asn1EncodableVector();
                DerObjectIdentifier lstOid = null;

                for (int i = 0; i != ordering.Count; i++)
                {
                    DerObjectIdentifier oid = (DerObjectIdentifier)ordering[i];
                    string str = (string)values[i];

                    if (lstOid == null
                        || ((bool)this.added[i]))
                    {
                    }
                    else
                    {
                        vec.Add(new DerSet(sVec));
                        sVec = new Asn1EncodableVector();
                    }

                    sVec.Add(
                        new DerSequence(
                            oid,
                            converter.GetConvertedValue(oid, str)));

                    lstOid = oid;
                }

                vec.Add(new DerSet(sVec));

                seq = new DerSequence(vec);
            }

            return seq;
        }

        /// <param name="other">The X509Name object to test equivalency against.</param>
        /// <param name="inOrder">If true, the order of elements must be the same,
        /// as well as the values associated with each element.</param>
        public bool Equivalent(
            X509Name	other,
            bool		inOrder)
        {
            if (!inOrder)
                return this.Equivalent(other);

            if (other == null)
                return false;

            if (other == this)
                return true;

            int orderingSize = ordering.Count;

            if (orderingSize != other.ordering.Count)
                return false;

            for (int i = 0; i < orderingSize; i++)
            {
                DerObjectIdentifier oid = (DerObjectIdentifier) ordering[i];
                DerObjectIdentifier oOid = (DerObjectIdentifier) other.ordering[i];

                if (!oid.Equals(oOid))
                    return false;

                string val = (string) values[i];
                string oVal = (string) other.values[i];

                if (!EquivalentStrings(val, oVal))
                    return false;
            }

            return true;
        }

        /**
         * test for equivalence - note: case is ignored.
         */
        public bool Equivalent(
            X509Name other)
        {
            if (other == null)
                return false;

            if (other == this)
                return true;

            int orderingSize = ordering.Count;

            if (orderingSize != other.ordering.Count)
            {
                return false;
            }

            bool[] indexes = new bool[orderingSize];
            int start, end, delta;

            if (ordering[0].Equals(other.ordering[0]))   // guess forward
            {
                start = 0;
                end = orderingSize;
                delta = 1;
            }
            else  // guess reversed - most common problem
            {
                start = orderingSize - 1;
                end = -1;
                delta = -1;
            }

            for (int i = start; i != end; i += delta)
            {
                bool found = false;
                DerObjectIdentifier  oid = (DerObjectIdentifier)ordering[i];
                string value = (string)values[i];

                for (int j = 0; j < orderingSize; j++)
                {
                    if (indexes[j])
                    {
                        continue;
                    }

                    DerObjectIdentifier oOid = (DerObjectIdentifier)other.ordering[j];

                    if (oid.Equals(oOid))
                    {
                        string oValue = (string)other.values[j];

                        if (EquivalentStrings(value, oValue))
                        {
                            indexes[j] = true;
                            found      = true;
                            break;
                        }
                    }
                }

                if (!found)
                {
                    return false;
                }
            }

            return true;
        }

        private static bool EquivalentStrings(string s1, string s2)
        {
            string v1 = Canonicalize(s1);
            string v2 = Canonicalize(s2);

            if (!v1.Equals(v2))
            {
                v1 = StripInternalSpaces(v1);
                v2 = StripInternalSpaces(v2);

                if (!v1.Equals(v2))
                    return false;
            }

            return true;
        }

        private static string Canonicalize(string s)
        {
            string v = s.ToLowerInvariant().Trim();

            if (v.StartsWith("#"))
            {
                Asn1Object obj = DecodeObject(v);
                if (obj is IAsn1String str)
                {
                    v = str.GetString().ToLowerInvariant().Trim();
                }
            }

            return v;
        }

        private static Asn1Object DecodeObject(string v)
        {
            try
            {
                return Asn1Object.FromByteArray(Hex.DecodeStrict(v, 1, v.Length - 1));
            }
            catch (IOException e)
            {
                throw new InvalidOperationException("unknown encoding in name: " + e.Message, e);
            }
        }

        private static string StripInternalSpaces(string str)
        {
            StringBuilder res = new StringBuilder();

            if (str.Length != 0)
            {
                char c1 = str[0];

                res.Append(c1);

                for (int k = 1; k < str.Length; k++)
                {
                    char c2 = str[k];
                    if (!(c1 == ' ' && c2 == ' '))
                    {
                        res.Append(c2);
                    }
                    c1 = c2;
                }
            }

            return res.ToString();
        }

        private void AppendValue(StringBuilder buf, IDictionary<DerObjectIdentifier, string> oidSymbols,
            DerObjectIdentifier oid, string val)
        {
            if (oidSymbols.TryGetValue(oid, out var sym))
            {
                buf.Append(sym);
            }
            else
            {
                buf.Append(oid.Id);
            }

            buf.Append('=');

            int index = buf.Length;

            buf.Append(val);

            int end = buf.Length;

            if (val.StartsWith("\\#"))
            {
                index += 2;
            }

            while (index != end)
            {
                if ((buf[index] == ',')
                || (buf[index] == '"')
                || (buf[index] == '\\')
                || (buf[index] == '+')
                || (buf[index] == '=')
                || (buf[index] == '<')
                || (buf[index] == '>')
                || (buf[index] == ';'))
                {
                    buf.Insert(index++, "\\");
                    end++;
                }

                index++;
            }
        }

        /**
        * convert the structure to a string - if reverse is true the
        * oids and values are listed out starting with the last element
        * in the sequence (ala RFC 2253), otherwise the string will begin
        * with the first element of the structure. If no string definition
        * for the oid is found in oidSymbols the string value of the oid is
        * added. Two standard symbol tables are provided DefaultSymbols, and
        * RFC2253Symbols as part of this class.
        *
        * @param reverse if true start at the end of the sequence and work back.
        * @param oidSymbols look up table strings for oids.
        */
        public string ToString(bool reverse, IDictionary<DerObjectIdentifier, string> oidSymbols)
        {
            var components = new List<StringBuilder>();

            StringBuilder ava = null;

            for (int i = 0; i < ordering.Count; i++)
            {
                if (added[i])
                {
                    ava.Append('+');
                    AppendValue(ava, oidSymbols, ordering[i], values[i]);
                }
                else
                {
                    ava = new StringBuilder();
                    AppendValue(ava, oidSymbols, ordering[i], values[i]);
                    components.Add(ava);
                }
            }

            if (reverse)
            {
                components.Reverse();
            }

            StringBuilder buf = new StringBuilder();

            if (components.Count > 0)
            {
                buf.Append(components[0].ToString());

                for (int i = 1; i < components.Count; ++i)
                {
                    buf.Append(',');
                    buf.Append(components[i].ToString());
                }
            }

            return buf.ToString();
        }

        public override string ToString()
        {
            return ToString(DefaultReverse, DefaultSymbols);
        }
    }
}
