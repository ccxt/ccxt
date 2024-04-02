using System;
using System.Collections.Generic;
using System.Text;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Asn1.X500.Style;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Pkix
{
    public class PkixNameConstraintValidator
    {
        private static readonly DerObjectIdentifier SerialNumberOid = X509Name.SerialNumber;

        private ISet<Asn1Sequence> excludedSubtreesDN = new HashSet<Asn1Sequence>();

        private ISet<string> excludedSubtreesDns = new HashSet<string>();

        private ISet<string> excludedSubtreesEmail = new HashSet<string>();

        private ISet<string> excludedSubtreesUri = new HashSet<string>();

        private ISet<byte[]> excludedSubtreesIP = new HashSet<byte[]>();

        private ISet<OtherName> excludedSubtreesOtherName = new HashSet<OtherName>();

        private ISet<Asn1Sequence> permittedSubtreesDN;

        private ISet<string> permittedSubtreesDns;

        private ISet<string> permittedSubtreesEmail;

        private ISet<string> permittedSubtreesUri;

        private ISet<byte[]> permittedSubtreesIP;

        private ISet<OtherName> permittedSubtreesOtherName;

        public PkixNameConstraintValidator()
        {
        }

        private static bool WithinDNSubtree(
            Asn1Sequence dns,
            Asn1Sequence subtree)
        {
            if (subtree.Count < 1 || subtree.Count > dns.Count)
                return false;

            int start = 0;
            Rdn subtreeRdnStart = Rdn.GetInstance(subtree[0]);
            for (int j = 0; j < dns.Count; j++)
            {
                start = j;
                Rdn dnsRdn = Rdn.GetInstance(dns[j]);
                if (IetfUtilities.RdnAreEqual(subtreeRdnStart, dnsRdn))
                    break;
            }

            if (subtree.Count > dns.Count - start)
                return false;

            for (int j = 0; j < subtree.Count; ++j)
            {
                // both subtree and dns are a ASN.1 Name and the elements are a RDN
                Rdn subtreeRdn = Rdn.GetInstance(subtree[j]);
                Rdn dnsRdn = Rdn.GetInstance(dns[start + j]);

                // check if types and values of all naming attributes are matching, other types which are not restricted are allowed, see https://tools.ietf.org/html/rfc5280#section-7.1

                // Two relative distinguished names
                //   RDN1 and RDN2 match if they have the same number of naming attributes
                //   and for each naming attribute in RDN1 there is a matching naming attribute in RDN2.
                //   NOTE: this is checking the attributes in the same order, which might be not necessary, if this is a problem also IETFUtils.rDNAreEqual mus tbe changed.
                // use new RFC 5280 comparison, NOTE: this is now different from with RFC 3280, where only binary comparison is used
                // obey RFC 5280 7.1
                // special treatment of serialNumber for GSMA SGP.22 RSP specification
                if (subtreeRdn.Count == 1 && dnsRdn.Count == 1
                    && subtreeRdn.GetFirst().GetType().Equals(SerialNumberOid)
                    && dnsRdn.GetFirst().GetType().Equals(SerialNumberOid))
                {
                    if (!Platform.StartsWith(dnsRdn.GetFirst().Value.ToString(), subtreeRdn.GetFirst().Value.ToString()))
                        return false;
                }
                else if (!IetfUtilities.RdnAreEqual(subtreeRdn, dnsRdn))
                {
                    return false;
                }
            }

            return true;
        }

        public void CheckPermittedDN(Asn1Sequence dn)
        {
            CheckPermittedDirectory(permittedSubtreesDN, dn);
        }

        public void CheckExcludedDN(Asn1Sequence dn)
        {
            CheckExcludedDirectory(excludedSubtreesDN, dn);
        }

        private ISet<Asn1Sequence> IntersectDN(ISet<Asn1Sequence> permitted, ISet<GeneralSubtree> dns)
        {
            var intersect = new HashSet<Asn1Sequence>();
            foreach (GeneralSubtree subtree1 in dns)
            {
                Asn1Sequence dn1 = Asn1Sequence.GetInstance(subtree1.Base.Name);
                if (permitted == null)
                {
                    if (dn1 != null)
                    {
                        intersect.Add(dn1);
                    }
                }
                else
                {
                    foreach (var dn2 in permitted)
                    {
                        if (WithinDNSubtree(dn1, dn2))
                        {
                            intersect.Add(dn1);
                        }
                        else if (WithinDNSubtree(dn2, dn1))
                        {
                            intersect.Add(dn2);
                        }
                    }
                }
            }
            return intersect;
        }

        private ISet<Asn1Sequence> UnionDN(ISet<Asn1Sequence> excluded, Asn1Sequence dn)
        {
            if (excluded.Count < 1)
            {
                if (dn == null)
                    return excluded;

                excluded.Add(dn);
                return excluded;
            }

            var union = new HashSet<Asn1Sequence>();

            foreach (var subtree in excluded)
            {
                if (WithinDNSubtree(dn, subtree))
                {
                    union.Add(subtree);
                }
                else if (WithinDNSubtree(subtree, dn))
                {
                    union.Add(dn);
                }
                else
                {
                    union.Add(subtree);
                    union.Add(dn);
                }
            }

            return union;
        }

        private ISet<OtherName> IntersectOtherName(ISet<OtherName> permitted, ISet<GeneralSubtree> otherNames)
        {
            var intersect = new HashSet<OtherName>();
            foreach (GeneralSubtree subtree1 in otherNames)
            {
                OtherName otherName1 = OtherName.GetInstance(subtree1.Base.Name);
                if (otherName1 == null)
                    continue;

                if (permitted == null)
                {
                    intersect.Add(otherName1);
                }
                else
                {
                    foreach (OtherName otherName2 in permitted)
                    {
                        IntersectOtherName(otherName1, otherName2, intersect);
                    }
                }
            }
            return intersect;
        }

        private void IntersectOtherName(OtherName otherName1, OtherName otherName2, ISet<OtherName> intersect)
        {
            if (otherName1.Equals(otherName2))
            {
                intersect.Add(otherName1);
            }
        }

        private ISet<OtherName> UnionOtherName(ISet<OtherName> permitted, OtherName otherName)
        {
            var union = permitted != null ? new HashSet<OtherName>(permitted) : new HashSet<OtherName>();
            union.Add(otherName);
            return union;
        }

        private ISet<string> IntersectEmail(ISet<string> permitted, ISet<GeneralSubtree> emails)
        {
            var intersect = new HashSet<string>();
            foreach (GeneralSubtree subtree1 in emails)
            {
                string email = ExtractNameAsString(subtree1.Base);

                if (permitted == null)
                {
                    if (email != null)
                    {
                        intersect.Add(email);
                    }
                }
                else
                {
                    foreach (string _permitted in permitted)
                    {
                        IntersectEmail(email, _permitted, intersect);
                    }
                }
            }
            return intersect;
        }

        private ISet<string> UnionEmail(ISet<string> excluded, string email)
        {
            if (excluded.Count < 1)
            {
                if (email == null)
                    return excluded;

                excluded.Add(email);
                return excluded;
            }

            var union = new HashSet<string>();
            foreach (string _excluded in excluded)
            {
                UnionEmail(_excluded, email, union);
            }
            return union;
        }

        /**
         * Returns the intersection of the permitted IP ranges in
         * <code>permitted</code> with <code>ip</code>.
         *
         * @param permitted A <code>Set</code> of permitted IP addresses with
         *                  their subnet mask as byte arrays.
         * @param ips       The IP address with its subnet mask.
         * @return The <code>Set</code> of permitted IP ranges intersected with
         *         <code>ip</code>.
         */
        private ISet<byte[]> IntersectIP(ISet<byte[]> permitted, ISet<GeneralSubtree> ips)
        {
            var intersect = new HashSet<byte[]>();
            foreach (GeneralSubtree subtree in ips)
            {
                byte[] ip = Asn1OctetString.GetInstance(subtree.Base.Name).GetOctets();
                if (permitted == null)
                {
                    if (ip != null)
                    {
                        intersect.Add(ip);
                    }
                }
                else
                {
                    foreach (byte[] _permitted in permitted)
                    {
                        intersect.UnionWith(IntersectIPRange(_permitted, ip));
                    }
                }
            }
            return intersect;
        }

        /**
         * Returns the union of the excluded IP ranges in <code>excluded</code>
         * with <code>ip</code>.
         *
         * @param excluded A <code>Set</code> of excluded IP addresses with their
         *                 subnet mask as byte arrays.
         * @param ip       The IP address with its subnet mask.
         * @return The <code>Set</code> of excluded IP ranges unified with
         *         <code>ip</code> as byte arrays.
         */
        private ISet<byte[]> UnionIP(ISet<byte[]> excluded, byte[] ip)
        {
            if (excluded.Count < 1)
            {
                if (ip == null)
                    return excluded;

                excluded.Add(ip);
                return excluded;
            }

            var union = new HashSet<byte[]>();
            foreach (byte[] _excluded in excluded)
            {
                union.UnionWith(UnionIPRange(_excluded, ip));
            }
            return union;
        }

        /**
         * Calculates the union if two IP ranges.
         *
         * @param ipWithSubmask1 The first IP address with its subnet mask.
         * @param ipWithSubmask2 The second IP address with its subnet mask.
         * @return A <code>Set</code> with the union of both addresses.
         */
        private ISet<byte[]> UnionIPRange(byte[] ipWithSubmask1, byte[] ipWithSubmask2)
        {
            var set = new HashSet<byte[]>();
            // difficult, adding always all IPs is not wrong
            if (Arrays.AreEqual(ipWithSubmask1, ipWithSubmask2))
            {
                set.Add(ipWithSubmask1);
            }
            else
            {
                set.Add(ipWithSubmask1);
                set.Add(ipWithSubmask2);
            }
            return set;
        }

        /**
         * Calculates the interesction if two IP ranges.
         *
         * @param ipWithSubmask1 The first IP address with its subnet mask.
         * @param ipWithSubmask2 The second IP address with its subnet mask.
         * @return A <code>Set</code> with the single IP address with its subnet
         *         mask as a byte array or an empty <code>Set</code>.
         */
        private ISet<byte[]> IntersectIPRange(byte[] ipWithSubmask1, byte[] ipWithSubmask2)
        {
            if (ipWithSubmask1.Length != ipWithSubmask2.Length)
            {
                //Collections.EMPTY_SET;
                return new HashSet<byte[]>();
            }

            byte[][] temp = ExtractIPsAndSubnetMasks(ipWithSubmask1, ipWithSubmask2);
            byte[] ip1 = temp[0];
            byte[] subnetmask1 = temp[1];
            byte[] ip2 = temp[2];
            byte[] subnetmask2 = temp[3];

            byte[][] minMax = MinMaxIPs(ip1, subnetmask1, ip2, subnetmask2);
            byte[] min;
            byte[] max;
            max = Min(minMax[1], minMax[3]);
            min = Max(minMax[0], minMax[2]);

            // minimum IP address must be bigger than max
            if (CompareTo(min, max) == 1)
            {
                //return Collections.EMPTY_SET;
                return new HashSet<byte[]>();
            }
            // OR keeps all significant bits
            byte[] ip = Or(minMax[0], minMax[2]);
            byte[] subnetmask = Or(subnetmask1, subnetmask2);

            //return new HashSet( ICollectionsingleton(IpWithSubnetMask(ip, subnetmask));
            var hs = new HashSet<byte[]>();
            hs.Add(IpWithSubnetMask(ip, subnetmask));

            return hs;
        }

        /**
         * Concatenates the IP address with its subnet mask.
         *
         * @param ip         The IP address.
         * @param subnetMask Its subnet mask.
         * @return The concatenated IP address with its subnet mask.
         */
        private byte[] IpWithSubnetMask(byte[] ip, byte[] subnetMask)
        {
            int ipLength = ip.Length;
            byte[] temp = new byte[ipLength * 2];
            Array.Copy(ip, 0, temp, 0, ipLength);
            Array.Copy(subnetMask, 0, temp, ipLength, ipLength);
            return temp;
        }

        /**
         * Splits the IP addresses and their subnet mask.
         *
         * @param ipWithSubmask1 The first IP address with the subnet mask.
         * @param ipWithSubmask2 The second IP address with the subnet mask.
         * @return An array with two elements. Each element contains the IP address
         *         and the subnet mask in this order.
         */
        private byte[][] ExtractIPsAndSubnetMasks(
            byte[] ipWithSubmask1,
            byte[] ipWithSubmask2)
        {
            int ipLength = ipWithSubmask1.Length / 2;
            byte[] ip1 = new byte[ipLength];
            byte[] subnetmask1 = new byte[ipLength];
            Array.Copy(ipWithSubmask1, 0, ip1, 0, ipLength);
            Array.Copy(ipWithSubmask1, ipLength, subnetmask1, 0, ipLength);

            byte[] ip2 = new byte[ipLength];
            byte[] subnetmask2 = new byte[ipLength];
            Array.Copy(ipWithSubmask2, 0, ip2, 0, ipLength);
            Array.Copy(ipWithSubmask2, ipLength, subnetmask2, 0, ipLength);
            return new byte[][]{ ip1, subnetmask1, ip2, subnetmask2 };
        }

        /**
         * Based on the two IP addresses and their subnet masks the IP range is
         * computed for each IP address - subnet mask pair and returned as the
         * minimum IP address and the maximum address of the range.
         *
         * @param ip1         The first IP address.
         * @param subnetmask1 The subnet mask of the first IP address.
         * @param ip2         The second IP address.
         * @param subnetmask2 The subnet mask of the second IP address.
         * @return A array with two elements. The first/second element contains the
         *         min and max IP address of the first/second IP address and its
         *         subnet mask.
         */
        private byte[][] MinMaxIPs(
            byte[] ip1,
            byte[] subnetmask1,
            byte[] ip2,
            byte[] subnetmask2)
        {
            int ipLength = ip1.Length;
            byte[] min1 = new byte[ipLength];
            byte[] max1 = new byte[ipLength];

            byte[] min2 = new byte[ipLength];
            byte[] max2 = new byte[ipLength];

            for (int i = 0; i < ipLength; i++)
            {
                min1[i] = (byte)(ip1[i] & subnetmask1[i]);
                max1[i] = (byte)(ip1[i] & subnetmask1[i] | ~subnetmask1[i]);

                min2[i] = (byte)(ip2[i] & subnetmask2[i]);
                max2[i] = (byte)(ip2[i] & subnetmask2[i] | ~subnetmask2[i]);
            }

            return new byte[][]{ min1, max1, min2, max2 };
        }

        private bool IsOtherNameConstrained(OtherName constraint, OtherName otherName)
        {
            return constraint.Equals(otherName);
        }

        private bool IsOtherNameConstrained(ISet<OtherName> constraints, OtherName otherName)
        {
            foreach (OtherName constraint in constraints)
            {
                if (IsOtherNameConstrained(constraint, otherName))
                    return true;
            }

            return false;
        }

        private void CheckPermittedOtherName(ISet<OtherName> permitted, OtherName name)
        {
            if (permitted != null && !IsOtherNameConstrained(permitted, name))
                throw new PkixNameConstraintValidatorException("Subject OtherName is not from a permitted subtree.");
        }

        private void CheckExcludedOtherName(ISet<OtherName> excluded, OtherName name)
        {
            if (IsOtherNameConstrained(excluded, name))
                throw new PkixNameConstraintValidatorException("OtherName is from an excluded subtree.");
        }

        private bool IsEmailConstrained(string constraint, string email)
        {
            string sub = email.Substring(email.IndexOf('@') + 1);
            // a particular mailbox
            if (constraint.IndexOf('@') != -1)
            {
                if (string.Equals(email, constraint, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            // on particular host
            else if (constraint[0] != '.')
            {
                if (string.Equals(sub, constraint, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            // address in sub domain
            else if (WithinDomain(sub, constraint))
            {
                return true;
            }
            return false;
        }

        private bool IsEmailConstrained(ISet<string> constraints, string email)
        {
            foreach (string constraint in constraints)
            {
                if (IsEmailConstrained(constraint, email))
                    return true;
            }

            return false;
        }

        private void CheckPermittedEmail(ISet<string> permitted, string email)
        {
            if (permitted != null
                && !(email.Length == 0 && permitted.Count < 1)
                && !IsEmailConstrained(permitted, email))
            {
                throw new PkixNameConstraintValidatorException(
                    "Subject email address is not from a permitted subtree.");
            }
        }

        private void CheckExcludedEmail(ISet<string> excluded, string email)
        {
            if (IsEmailConstrained(excluded, email))
                throw new PkixNameConstraintValidatorException("Email address is from an excluded subtree.");
        }

        private bool IsDnsConstrained(string constraint, string dns)
        {
            return WithinDomain(dns, constraint) || Platform.EqualsIgnoreCase(dns, constraint);
        }

        private bool IsDnsConstrained(ISet<string> constraints, string dns)
        {
            foreach (var constraint in constraints)
            {
                if (IsDnsConstrained(constraint, dns))
                    return true;
            }

            return false;
        }

        private void CheckPermittedDns(ISet<string> permitted, string dns)
        {
            if (permitted != null
                && !(dns.Length == 0 && permitted.Count < 1)
                && !IsDnsConstrained(permitted, dns))
            {
                throw new PkixNameConstraintValidatorException("DNS is not from a permitted subtree.");
            }
        }

        private void CheckExcludedDns(ISet<string> excluded, string dns)
        {
            if (IsDnsConstrained(excluded, dns))
                throw new PkixNameConstraintValidatorException("DNS is from an excluded subtree.");
        }

        private bool IsDirectoryConstrained(ISet<Asn1Sequence> constraints, Asn1Sequence directory)
        {
            foreach (var constraint in constraints)
            {
                if (WithinDNSubtree(directory, constraint))
                    return true;
            }

            return false;
        }

        private void CheckPermittedDirectory(ISet<Asn1Sequence> permitted, Asn1Sequence directory)
        {
            if (permitted != null
                && !(directory.Count == 0 && permitted.Count < 1)
                && !IsDirectoryConstrained(permitted, directory))
            {
                throw new PkixNameConstraintValidatorException(
                    "Subject distinguished name is not from a permitted subtree");
            }
        }

        private void CheckExcludedDirectory(ISet<Asn1Sequence> excluded, Asn1Sequence directory)
        {
            if (IsDirectoryConstrained(excluded, directory))
            {
                throw new PkixNameConstraintValidatorException(
                    "Subject distinguished name is from an excluded subtree");
            }
        }

        private bool IsUriConstrained(string constraint, string uri)
        {
            string host = ExtractHostFromURL(uri);

            if (Platform.StartsWith(constraint, "."))
            {
                // in sub domain or domain
                return WithinDomain(host, constraint);
            }

            // a host
            return Platform.EqualsIgnoreCase(host, constraint);
        }

        private bool IsUriConstrained(ISet<string> constraints, string uri)
        {
            foreach (string constraint in constraints)
            {
                if (IsUriConstrained(constraint, uri))
                    return true;
            }

            return false;
        }

        private void CheckPermittedUri(ISet<string> permitted, string uri)
        {
            if (permitted != null
                && !(uri.Length == 0 && permitted.Count < 1)
                && !IsUriConstrained(permitted, uri))
            {
                throw new PkixNameConstraintValidatorException("URI is not from a permitted subtree.");
            }
        }

        private void CheckExcludedUri(ISet<string> excluded, string uri)
        {
            if (IsUriConstrained(excluded, uri))
                throw new PkixNameConstraintValidatorException("URI is from an excluded subtree.");
        }

        /**
         * Checks if the IP address <code>ip</code> is constrained by
         * <code>constraint</code>.
         *
         * @param constraint The constraint. This is an IP address concatenated with
         *                   its subnetmask.
         * @param ip         The IP address.
         * @return <code>true</code> if constrained, <code>false</code>
         *         otherwise.
         */
        private bool IsIPConstrained(byte[] constraint, byte[] ip)
        {
            int ipLength = ip.Length;
            if (ipLength != (constraint.Length / 2))
                return false;

            byte[] subnetMask = new byte[ipLength];
            Array.Copy(constraint, ipLength, subnetMask, 0, ipLength);

            byte[] permittedSubnetAddress = new byte[ipLength];

            byte[] ipSubnetAddress = new byte[ipLength];

            // the resulting IP address by applying the subnet mask
            for (int i = 0; i < ipLength; i++)
            {
                permittedSubnetAddress[i] = (byte)(constraint[i] & subnetMask[i]);
                ipSubnetAddress[i] = (byte)(ip[i] & subnetMask[i]);
            }

            return Arrays.AreEqual(permittedSubnetAddress, ipSubnetAddress);
        }

        private bool IsIPConstrained(ISet<byte[]> constraints, byte[] ip)
        {
            foreach (byte[] constraint in constraints)
            {
                if (IsIPConstrained(constraint, ip))
                    return true;
            }

            return false;
        }

        /**
         * Checks if the IP <code>ip</code> is included in the permitted ISet
         * <code>permitted</code>.
         *
         * @param permitted A <code>Set</code> of permitted IP addresses with
         *                  their subnet mask as byte arrays.
         * @param ip        The IP address.
         * @throws PkixNameConstraintValidatorException
         *          if the IP is not permitted.
         */
        private void CheckPermittedIP(ISet<byte[]> permitted, byte[] ip)
        {
            if (permitted != null
                && !(ip.Length == 0 && permitted.Count < 1)
                && !IsIPConstrained(permitted, ip))
            {
                throw new PkixNameConstraintValidatorException("IP is not from a permitted subtree.");
            }
        }

        /**
         * Checks if the IP <code>ip</code> is included in the excluded ISet
         * <code>excluded</code>.
         *
         * @param excluded A <code>Set</code> of excluded IP addresses with their
         *                 subnet mask as byte arrays.
         * @param ip       The IP address.
         * @throws PkixNameConstraintValidatorException
         *          if the IP is excluded.
         */
        private void CheckExcludedIP(ISet<byte[]> excluded, byte[] ip)
        {
            if (IsIPConstrained(excluded, ip))
                throw new PkixNameConstraintValidatorException("IP is from an excluded subtree.");
        }

        private bool WithinDomain(string testDomain, string domain)
        {
            string tempDomain = domain;
            if (Platform.StartsWith(tempDomain, "."))
            {
                tempDomain = tempDomain.Substring(1);
            }

            string[] domainParts = tempDomain.Split('.'); // Strings.split(tempDomain, '.');
            string[] testDomainParts = testDomain.Split('.'); // Strings.split(testDomain, '.');

            // must have at least one subdomain
            if (testDomainParts.Length <= domainParts.Length)
                return false;

            int d = testDomainParts.Length - domainParts.Length;
            for (int i = -1; i < domainParts.Length; i++)
            {
                if (i == -1)
                {
                    if (testDomainParts[i + d].Length < 1)
                    {
                        return false;
                    }
                }
                else if (!Platform.EqualsIgnoreCase(testDomainParts[i + d], domainParts[i]))
                {
                    return false;
                }
            }
            return true;
        }

        /**
         * The common part of <code>email1</code> and <code>email2</code> is
         * added to the union <code>union</code>. If <code>email1</code> and
         * <code>email2</code> have nothing in common they are added both.
         *
         * @param email1 Email address constraint 1.
         * @param email2 Email address constraint 2.
         * @param union  The union.
         */
        private void UnionEmail(string email1, string email2, ISet<string> union)
        {
            // email1 is a particular address
            if (email1.IndexOf('@') != -1)
            {
                string _sub = email1.Substring(email1.IndexOf('@') + 1);
                // both are a particular mailbox
                if (email2.IndexOf('@') != -1)
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(_sub, email2))
                    {
                        union.Add(email2);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(_sub, email2))
                    {
                        union.Add(email2);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
            }
            // email1 specifies a domain
            else if (Platform.StartsWith(email1, "."))
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email1.IndexOf('@') + 1);
                    if (WithinDomain(_sub, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2) || Platform.EqualsIgnoreCase(email1, email2))
                    {
                        union.Add(email2);
                    }
                    else if (WithinDomain(email2, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                else
                {
                    if (WithinDomain(email2, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
            }
            // email specifies a host
            else
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email1.IndexOf('@') + 1);
                    if (Platform.EqualsIgnoreCase(_sub, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2))
                    {
                        union.Add(email2);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
            }
        }

        private void UnionUri(string email1, string email2, ISet<string> union)
        {
            // email1 is a particular address
            if (email1.IndexOf('@') != -1)
            {
                string _sub = email1.Substring(email1.IndexOf('@') + 1);
                // both are a particular mailbox
                if (email2.IndexOf('@') != -1)
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(_sub, email2))
                    {
                        union.Add(email2);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(_sub, email2))
                    {
                        union.Add(email2);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);

                    }
                }
            }
            // email1 specifies a domain
            else if (Platform.StartsWith(email1, "."))
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email1.IndexOf('@') + 1);
                    if (WithinDomain(_sub, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2) || Platform.EqualsIgnoreCase(email1, email2))
                    {
                        union.Add(email2);
                    }
                    else if (WithinDomain(email2, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                else
                {
                    if (WithinDomain(email2, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
            }
            // email specifies a host
            else
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email1.IndexOf('@') + 1);
                    if (Platform.EqualsIgnoreCase(_sub, email1))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2))
                    {
                        union.Add(email2);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        union.Add(email1);
                    }
                    else
                    {
                        union.Add(email1);
                        union.Add(email2);
                    }
                }
            }
        }

        private ISet<string> IntersectDns(ISet<string> permitted, ISet<GeneralSubtree> dnss)
        {
            var intersect = new HashSet<string>();
            foreach (GeneralSubtree subtree in dnss)
            {
                string dns = ExtractNameAsString(subtree.Base);
                if (permitted == null)
                {
                    if (dns != null)
                    {
                        intersect.Add(dns);
                    }
                }
                else
                {
                    foreach (string _permitted in permitted)
                    {
                        if (WithinDomain(_permitted, dns))
                        {
                            intersect.Add(_permitted);
                        }
                        else if (WithinDomain(dns, _permitted))
                        {
                            intersect.Add(dns);
                        }
                    }
                }
            }
            return intersect;
        }

        private ISet<string> UnionDns(ISet<string> excluded, string dns)
        {
            if (excluded.Count < 1)
            {
                if (dns == null)
                    return excluded;

                excluded.Add(dns);
                return excluded;
            }

            var union = new HashSet<string>();
            foreach (string _excluded in excluded)
            {
                if (WithinDomain(_excluded, dns))
                {
                    union.Add(dns);
                }
                else if (WithinDomain(dns, _excluded))
                {
                    union.Add(_excluded);
                }
                else
                {
                    union.Add(_excluded);
                    union.Add(dns);
                }
            }
            return union;
        }

        /**
         * The most restricting part from <code>email1</code> and
         * <code>email2</code> is added to the intersection <code>intersect</code>.
         *
         * @param email1    Email address constraint 1.
         * @param email2    Email address constraint 2.
         * @param intersect The intersection.
         */
        private void IntersectEmail(string email1, string email2, ISet<string> intersect)
        {
            // email1 is a particular address
            if (email1.IndexOf('@') != -1)
            {
                string _sub = email1.Substring(email1.IndexOf('@') + 1);
                // both are a particular mailbox
                if (email2.IndexOf('@') != -1)
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(_sub, email2))
                    {
                        intersect.Add(email1);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(_sub, email2))
                    {
                        intersect.Add(email1);
                    }
                }
            }
            // email specifies a domain
            else if (Platform.StartsWith(email1, "."))
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email1.IndexOf('@') + 1);
                    if (WithinDomain(_sub, email1))
                    {
                        intersect.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2) || Platform.EqualsIgnoreCase(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                    else if (WithinDomain(email2, email1))
                    {
                        intersect.Add(email2);
                    }
                }
                else
                {
                    if (WithinDomain(email2, email1))
                    {
                        intersect.Add(email2);
                    }
                }
            }
            // email1 specifies a host
            else
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email2.IndexOf('@') + 1);
                    if (Platform.EqualsIgnoreCase(_sub, email1))
                    {
                        intersect.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                }
            }
        }

        private ISet<string> IntersectUri(ISet<string> permitted, ISet<GeneralSubtree> uris)
        {
            var intersect = new HashSet<string>();
            foreach (GeneralSubtree subtree in uris)
            {
                string uri = ExtractNameAsString(subtree.Base);
                if (permitted == null)
                {
                    if (uri != null)
                    {
                        intersect.Add(uri);
                    }
                }
                else
                {
                    foreach (string _permitted in permitted)
                    {
                        IntersectUri(_permitted, uri, intersect);
                    }
                }
            }
            return intersect;
        }

        private ISet<string> UnionUri(ISet<string> excluded, string uri)
        {
            if (excluded.Count < 1)
            {
                if (uri == null)
                    return excluded;

                excluded.Add(uri);
                return excluded;
            }

            var union = new HashSet<string>();
            foreach (string _excluded in excluded)
            {
                UnionUri(_excluded, uri, union);
            }
            return union;
        }

        private void IntersectUri(string email1, string email2, ISet<string> intersect)
        {
            // email1 is a particular address
            if (email1.IndexOf('@') != -1)
            {
                string _sub = email1.Substring(email1.IndexOf('@') + 1);
                // both are a particular mailbox
                if (email2.IndexOf('@') != -1)
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(_sub, email2))
                    {
                        intersect.Add(email1);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(_sub, email2))
                    {
                        intersect.Add(email1);
                    }
                }
            }
            // email specifies a domain
            else if (Platform.StartsWith(email1, "."))
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email1.IndexOf('@') + 1);
                    if (WithinDomain(_sub, email1))
                    {
                        intersect.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2) || Platform.EqualsIgnoreCase(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                    else if (WithinDomain(email2, email1))
                    {
                        intersect.Add(email2);
                    }
                }
                else
                {
                    if (WithinDomain(email2, email1))
                    {
                        intersect.Add(email2);
                    }
                }
            }
            // email1 specifies a host
            else
            {
                if (email2.IndexOf('@') != -1)
                {
                    string _sub = email2.Substring(email2.IndexOf('@') + 1);
                    if (Platform.EqualsIgnoreCase(_sub, email1))
                    {
                        intersect.Add(email2);
                    }
                }
                // email2 specifies a domain
                else if (Platform.StartsWith(email2, "."))
                {
                    if (WithinDomain(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                }
                // email2 specifies a particular host
                else
                {
                    if (Platform.EqualsIgnoreCase(email1, email2))
                    {
                        intersect.Add(email1);
                    }
                }
            }
        }

        private static string ExtractHostFromURL(string url)
        {
            // see RFC 1738
            // remove ':' after protocol, e.g. http:
            string sub = url.Substring(url.IndexOf(':') + 1);
            // extract host from Common Internet Scheme Syntax, e.g. http://
            int idxOfSlashes = Platform.IndexOf(sub, "//");
            if (idxOfSlashes != -1)
            {
                sub = sub.Substring(idxOfSlashes + 2);
            }
            // first remove port, e.g. http://test.com:21
            if (sub.LastIndexOf(':') != -1)
            {
                sub = sub.Substring(0, sub.LastIndexOf(':'));
            }
            // remove user and password, e.g. http://john:password@test.com
            sub = sub.Substring(sub.IndexOf(':') + 1);
            sub = sub.Substring(sub.IndexOf('@') + 1);
            // remove local parts, e.g. http://test.com/bla
            if (sub.IndexOf('/') != -1)
            {
                sub = sub.Substring(0, sub.IndexOf('/'));
            }
            return sub;
        }

        /**
         * Checks if the given GeneralName is in the permitted ISet.
         *
         * @param name The GeneralName
         * @throws PkixNameConstraintValidatorException
         *          If the <code>name</code>
         */
        public void checkPermitted(GeneralName name)
        //throws PkixNameConstraintValidatorException
        {
            switch (name.TagNo)
            {
            case GeneralName.OtherName:
                CheckPermittedOtherName(permittedSubtreesOtherName, OtherName.GetInstance(name.Name));
                break;
            case GeneralName.Rfc822Name:
                CheckPermittedEmail(permittedSubtreesEmail, ExtractNameAsString(name));
                break;
            case GeneralName.DnsName:
                CheckPermittedDns(permittedSubtreesDns, ExtractNameAsString(name));
                break;
            case GeneralName.DirectoryName:
                CheckPermittedDN(Asn1Sequence.GetInstance(name.Name.ToAsn1Object()));
                break;
            case GeneralName.UniformResourceIdentifier:
                CheckPermittedUri(permittedSubtreesUri, ExtractNameAsString(name));
                break;
            case GeneralName.IPAddress:
                CheckPermittedIP(permittedSubtreesIP, Asn1OctetString.GetInstance(name.Name).GetOctets());
                break;
            }
        }

        /**
         * Check if the given GeneralName is contained in the excluded ISet.
         *
         * @param name The GeneralName.
         * @throws PkixNameConstraintValidatorException
         *          If the <code>name</code> is
         *          excluded.
         */
        public void checkExcluded(GeneralName name)
        //throws PkixNameConstraintValidatorException
        {
            switch (name.TagNo)
            {
            case GeneralName.OtherName:
                CheckExcludedOtherName(excludedSubtreesOtherName, OtherName.GetInstance(name.Name));
                break;
            case GeneralName.Rfc822Name:
                CheckExcludedEmail(excludedSubtreesEmail, ExtractNameAsString(name));
                break;
            case GeneralName.DnsName:
                CheckExcludedDns(excludedSubtreesDns, ExtractNameAsString(name));
                break;
            case GeneralName.DirectoryName:
                CheckExcludedDN(Asn1Sequence.GetInstance(name.Name.ToAsn1Object()));
                break;
            case GeneralName.UniformResourceIdentifier:
                CheckExcludedUri(excludedSubtreesUri, ExtractNameAsString(name));
                break;
            case GeneralName.IPAddress:
                CheckExcludedIP(excludedSubtreesIP, Asn1OctetString.GetInstance(name.Name).GetOctets());
                break;
            }
        }

        /**
         * Updates the permitted ISet of these name constraints with the intersection
         * with the given subtree.
         *
         * @param permitted The permitted subtrees
         */

        public void IntersectPermittedSubtree(Asn1Sequence permitted)
        {
            var subtreesMap = new Dictionary<int, ISet<GeneralSubtree>>();

            // group in ISets in a map ordered by tag no.
            foreach (var element in permitted)
            {
                GeneralSubtree subtree = GeneralSubtree.GetInstance(element);

                int tagNo = subtree.Base.TagNo;

                ISet<GeneralSubtree> subtrees;
                if (!subtreesMap.TryGetValue(tagNo, out subtrees))
                {
                    subtrees = new HashSet<GeneralSubtree>();
                    subtreesMap[tagNo] = subtrees;
                }

                subtrees.Add(subtree);
            }

            foreach (var entry in subtreesMap)
            {
                // go through all subtree groups
                switch (entry.Key)
                {
                case GeneralName.OtherName:
                    permittedSubtreesOtherName = IntersectOtherName(permittedSubtreesOtherName, entry.Value);
                    break;
                case GeneralName.Rfc822Name:
                    permittedSubtreesEmail = IntersectEmail(permittedSubtreesEmail, entry.Value);
                    break;
                case GeneralName.DnsName:
                    permittedSubtreesDns = IntersectDns(permittedSubtreesDns, entry.Value);
                    break;
                case GeneralName.DirectoryName:
                    permittedSubtreesDN = IntersectDN(permittedSubtreesDN, entry.Value);
                    break;
                case GeneralName.UniformResourceIdentifier:
                    permittedSubtreesUri = IntersectUri(permittedSubtreesUri, entry.Value);
                    break;
                case GeneralName.IPAddress:
                    permittedSubtreesIP = IntersectIP(permittedSubtreesIP, entry.Value);
                    break;
                }
            }
        }

        private string ExtractNameAsString(GeneralName name)
        {
            return DerIA5String.GetInstance(name.Name).GetString();
        }

        public void IntersectEmptyPermittedSubtree(int nameType)
        {
            switch (nameType)
            {
            case GeneralName.OtherName:
                permittedSubtreesOtherName = new HashSet<OtherName>();
                break;
            case GeneralName.Rfc822Name:
                permittedSubtreesEmail = new HashSet<string>();
                break;
            case GeneralName.DnsName:
                permittedSubtreesDns = new HashSet<string>();
                break;
            case GeneralName.DirectoryName:
                permittedSubtreesDN = new HashSet<Asn1Sequence>();
                break;
            case GeneralName.UniformResourceIdentifier:
                permittedSubtreesUri = new HashSet<string>();
                break;
            case GeneralName.IPAddress:
                permittedSubtreesIP = new HashSet<byte[]>();
                break;
            }
        }

        /**
         * Adds a subtree to the excluded ISet of these name constraints.
         *
         * @param subtree A subtree with an excluded GeneralName.
         */
        public void AddExcludedSubtree(GeneralSubtree subtree)
        {
            GeneralName subTreeBase = subtree.Base;

            switch (subTreeBase.TagNo)
            {
            case GeneralName.OtherName:
                excludedSubtreesOtherName = UnionOtherName(excludedSubtreesOtherName,
                    OtherName.GetInstance(subTreeBase.Name));
                break;
            case GeneralName.Rfc822Name:
                excludedSubtreesEmail = UnionEmail(excludedSubtreesEmail,
                    ExtractNameAsString(subTreeBase));
                break;
            case GeneralName.DnsName:
                excludedSubtreesDns = UnionDns(excludedSubtreesDns,
                    ExtractNameAsString(subTreeBase));
                break;
            case GeneralName.DirectoryName:
                excludedSubtreesDN = UnionDN(excludedSubtreesDN,
                    (Asn1Sequence)subTreeBase.Name.ToAsn1Object());
                break;
            case GeneralName.UniformResourceIdentifier:
                excludedSubtreesUri = UnionUri(excludedSubtreesUri,
                    ExtractNameAsString(subTreeBase));
                break;
            case GeneralName.IPAddress:
                excludedSubtreesIP = UnionIP(excludedSubtreesIP,
                    Asn1OctetString.GetInstance(subTreeBase.Name).GetOctets());
                break;
            }
        }

        /**
         * Returns the maximum IP address.
         *
         * @param ip1 The first IP address.
         * @param ip2 The second IP address.
         * @return The maximum IP address.
         */
        private static byte[] Max(byte[] ip1, byte[] ip2)
        {
            for (int i = 0; i < ip1.Length; i++)
            {
                if ((ip1[i] & 0xFFFF) > (ip2[i] & 0xFFFF))
                {
                    return ip1;
                }
            }
            return ip2;
        }

        /**
         * Returns the minimum IP address.
         *
         * @param ip1 The first IP address.
         * @param ip2 The second IP address.
         * @return The minimum IP address.
         */
        private static byte[] Min(byte[] ip1, byte[] ip2)
        {
            for (int i = 0; i < ip1.Length; i++)
            {
                if ((ip1[i] & 0xFFFF) < (ip2[i] & 0xFFFF))
                {
                    return ip1;
                }
            }
            return ip2;
        }

        /**
         * Compares IP address <code>ip1</code> with <code>ip2</code>. If ip1
         * is equal to ip2 0 is returned. If ip1 is bigger 1 is returned, -1
         * otherwise.
         *
         * @param ip1 The first IP address.
         * @param ip2 The second IP address.
         * @return 0 if ip1 is equal to ip2, 1 if ip1 is bigger, -1 otherwise.
         */
        private static int CompareTo(byte[] ip1, byte[] ip2)
        {
            if (Org.BouncyCastle.Utilities.Arrays.AreEqual(ip1, ip2))
            {
                return 0;
            }
            if (Org.BouncyCastle.Utilities.Arrays.AreEqual(Max(ip1, ip2), ip1))
            {
                return 1;
            }
            return -1;
        }

        /**
         * Returns the logical OR of the IP addresses <code>ip1</code> and
         * <code>ip2</code>.
         *
         * @param ip1 The first IP address.
         * @param ip2 The second IP address.
         * @return The OR of <code>ip1</code> and <code>ip2</code>.
         */
        private static byte[] Or(byte[] ip1, byte[] ip2)
        {
            byte[] temp = new byte[ip1.Length];
            for (int i = 0; i < ip1.Length; i++)
            {
                temp[i] = (byte)(ip1[i] | ip2[i]);
            }
            return temp;
        }

		public override int GetHashCode()
        {
            return HashCollection(excludedSubtreesDN)
                + HashCollection(excludedSubtreesDns)
                + HashCollection(excludedSubtreesEmail)
                + HashCollection(excludedSubtreesIP)
                + HashCollection(excludedSubtreesUri)
                + HashCollection(excludedSubtreesOtherName)
                + HashCollection(permittedSubtreesDN)
                + HashCollection(permittedSubtreesDns)
                + HashCollection(permittedSubtreesEmail)
                + HashCollection(permittedSubtreesIP)
                + HashCollection(permittedSubtreesUri)
                + HashCollection(permittedSubtreesOtherName);
        }

        private int HashCollection(IEnumerable<byte[]> c)
        {
            int hash = 0;
            if (c != null)
            {
                foreach (byte[] o in c)
                {
                    hash += Arrays.GetHashCode(o);
                }
            }
            return hash;
        }

        private int HashCollection(IEnumerable<object> c)
        {
            int hash = 0;
            if (c != null)
            {
                foreach (object o in c)
                {
                    hash += o.GetHashCode();
                }
            }
            return hash;
        }

		public override bool Equals(object o)
		{
			if (!(o is PkixNameConstraintValidator that))
				return false;

            return AreEqualSets(that.excludedSubtreesDN, excludedSubtreesDN)
                && AreEqualSets(that.excludedSubtreesDns, excludedSubtreesDns)
                && AreEqualSets(that.excludedSubtreesEmail, excludedSubtreesEmail)
                && AreEqualSets(that.excludedSubtreesIP, excludedSubtreesIP)
                && AreEqualSets(that.excludedSubtreesUri, excludedSubtreesUri)
                && AreEqualSets(that.excludedSubtreesOtherName, excludedSubtreesOtherName)
                && AreEqualSets(that.permittedSubtreesDN, permittedSubtreesDN)
                && AreEqualSets(that.permittedSubtreesDns, permittedSubtreesDns)
                && AreEqualSets(that.permittedSubtreesEmail, permittedSubtreesEmail)
                && AreEqualSets(that.permittedSubtreesIP, permittedSubtreesIP)
                && AreEqualSets(that.permittedSubtreesUri, permittedSubtreesUri)
                && AreEqualSets(that.permittedSubtreesOtherName, permittedSubtreesOtherName);
		}

        private bool AreEqualSets(ISet<byte[]> set1, ISet<byte[]> set2)
        {
            if (set1 == set2)
                return true;
            if (set1 == null || set2 == null || set1.Count != set2.Count)
                return false;

            foreach (byte[] a in set1)
            {
                bool found = false;
                foreach (byte[] b in set2)
                {
                    if (Arrays.AreEqual(a, b))
                    {
                        found = true;
                        break;
                    }
                }

                if (!found)
                    return false;
            }
            return true;
        }

        private bool AreEqualSets<T>(ISet<T> set1, ISet<T> set2)
        {
            if (set1 == set2)
                return true;
            if (set1 == null || set2 == null || set1.Count != set2.Count)
                return false;

            foreach (T a in set1)
            {
                if (!set2.Contains(a))
                    return false;
            }
            return true;
        }

        /**
         * Stringifies an IPv4 or v6 address with subnet mask.
         *
         * @param ip The IP with subnet mask.
         * @return The stringified IP address.
         */
        private string StringifyIP(byte[] ip)
        {
            string temp = "";
            for (int i = 0; i < ip.Length / 2; i++)
            {
                temp += (ip[i] & 0x00FF) + ".";
            }
            temp = temp.Substring(0, temp.Length - 1);
            temp += "/";
            for (int i = ip.Length / 2; i < ip.Length; i++)
            {
                temp += (ip[i] & 0x00FF) + ".";
            }
            temp = temp.Substring(0, temp.Length - 1);
            return temp;
        }

        private string StringifyIPCollection(ISet<byte[]> ips)
        {
            string temp = "";
            temp += "[";
            foreach (byte[] ip in ips)
            {
                temp += StringifyIP(ip) + ",";
            }
            if (temp.Length > 1)
            {
                temp = temp.Substring(0, temp.Length - 1);
            }
            temp += "]";
            return temp;
        }

        private string StringifyOtherNameCollection(ISet<OtherName> otherNames)
        {
            StringBuilder sb = new StringBuilder('[');
            foreach (OtherName name in otherNames)
            {
                if (sb.Length > 1)
                {
                    sb.Append(',');
                }
                sb.Append(name.TypeID.Id);
                sb.Append(':');
                sb.Append(Hex.ToHexString(name.Value.GetEncoded()));
            }
            sb.Append(']');
            return sb.ToString();
        }

        public override string ToString()
        {
            StringBuilder sb = new StringBuilder("permitted:\n");
            if (permittedSubtreesDN != null)
            {
                Append(sb, "DN", permittedSubtreesDN);
            }
            if (permittedSubtreesDns != null)
            {
                Append(sb, "DNS", permittedSubtreesDns);
            }
            if (permittedSubtreesEmail != null)
            {
                Append(sb, "Email", permittedSubtreesEmail);
            }
            if (permittedSubtreesUri != null)
            {
                Append(sb, "URI", permittedSubtreesUri);
            }
            if (permittedSubtreesIP != null)
            {
                Append(sb, "IP", StringifyIPCollection(permittedSubtreesIP));
            }
            if (permittedSubtreesOtherName != null)
            {
                Append(sb, "OtherName", StringifyOtherNameCollection(permittedSubtreesOtherName));
            }
            sb.Append("excluded:\n");
            if (excludedSubtreesDN.Count > 0)
            {
                Append(sb, "DN", excludedSubtreesDN);
            }
            if (excludedSubtreesDns.Count > 0)
            {
                Append(sb, "DNS", excludedSubtreesDns);
            }
            if (excludedSubtreesEmail.Count > 0)
            {
                Append(sb, "Email", excludedSubtreesEmail);
            }
            if (excludedSubtreesUri.Count > 0)
            {
                Append(sb, "URI", excludedSubtreesUri);
            }
            if (excludedSubtreesIP.Count > 0)
            {
                Append(sb, "IP", StringifyIPCollection(excludedSubtreesIP));
            }
            if (excludedSubtreesOtherName.Count > 0)
            {
                Append(sb, "OtherName", StringifyOtherNameCollection(excludedSubtreesOtherName));
            }
            return sb.ToString();
        }

        private static void Append(StringBuilder sb, string name, object value)
        {
            sb.Append(name);
            sb.AppendLine(":");
            sb.Append(value);
            sb.AppendLine();
        }
    }
}
