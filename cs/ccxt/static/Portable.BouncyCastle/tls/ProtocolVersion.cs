using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public sealed class ProtocolVersion
    {
        public static readonly ProtocolVersion SSLv3 = new ProtocolVersion(0x0300, "SSL 3.0");
        public static readonly ProtocolVersion TLSv10 = new ProtocolVersion(0x0301, "TLS 1.0");
        public static readonly ProtocolVersion TLSv11 = new ProtocolVersion(0x0302, "TLS 1.1");
        public static readonly ProtocolVersion TLSv12 = new ProtocolVersion(0x0303, "TLS 1.2");
        public static readonly ProtocolVersion TLSv13 = new ProtocolVersion(0x0304, "TLS 1.3");
        public static readonly ProtocolVersion DTLSv10 = new ProtocolVersion(0xFEFF, "DTLS 1.0");
        public static readonly ProtocolVersion DTLSv12 = new ProtocolVersion(0xFEFD, "DTLS 1.2");
        public static readonly ProtocolVersion DTLSv13 = new ProtocolVersion(0xFEFC, "DTLS 1.3");

        internal static readonly ProtocolVersion CLIENT_EARLIEST_SUPPORTED_DTLS = DTLSv10;
        internal static readonly ProtocolVersion CLIENT_EARLIEST_SUPPORTED_TLS = SSLv3;
        internal static readonly ProtocolVersion CLIENT_LATEST_SUPPORTED_DTLS = DTLSv12;
        internal static readonly ProtocolVersion CLIENT_LATEST_SUPPORTED_TLS = TLSv13;

        internal static readonly ProtocolVersion SERVER_EARLIEST_SUPPORTED_DTLS = DTLSv10;
        internal static readonly ProtocolVersion SERVER_EARLIEST_SUPPORTED_TLS = SSLv3;
        internal static readonly ProtocolVersion SERVER_LATEST_SUPPORTED_DTLS = DTLSv12;
        internal static readonly ProtocolVersion SERVER_LATEST_SUPPORTED_TLS = TLSv13;

        public static bool Contains(ProtocolVersion[] versions, ProtocolVersion version)
        {
            if (versions != null && version != null)
            {
                for (int i = 0; i < versions.Length; ++i)
                {
                    if (version.Equals(versions[i]))
                        return true;
                }
            }
            return false;
        }

        public static ProtocolVersion GetEarliestDtls(ProtocolVersion[] versions)
        {
            ProtocolVersion earliest = null;
            if (null != versions)
            {
                for (int i = 0; i < versions.Length; ++i)
                {
                    ProtocolVersion next = versions[i];
                    if (null != next && next.IsDtls)
                    {
                        if (null == earliest || next.MinorVersion > earliest.MinorVersion)
                        {
                            earliest = next;
                        }
                    }
                }
            }
            return earliest;
        }

        public static ProtocolVersion GetEarliestTls(ProtocolVersion[] versions)
        {
            ProtocolVersion earliest = null;
            if (null != versions)
            {
                for (int i = 0; i < versions.Length; ++i)
                {
                    ProtocolVersion next = versions[i];
                    if (null != next && next.IsTls)
                    {
                        if (null == earliest || next.MinorVersion < earliest.MinorVersion)
                        {
                            earliest = next;
                        }
                    }
                }
            }
            return earliest;
        }

        public static ProtocolVersion GetLatestDtls(ProtocolVersion[] versions)
        {
            ProtocolVersion latest = null;
            if (null != versions)
            {
                for (int i = 0; i < versions.Length; ++i)
                {
                    ProtocolVersion next = versions[i];
                    if (null != next && next.IsDtls)
                    {
                        if (null == latest || next.MinorVersion < latest.MinorVersion)
                        {
                            latest = next;
                        }
                    }
                }
            }
            return latest;
        }

        public static ProtocolVersion GetLatestTls(ProtocolVersion[] versions)
        {
            ProtocolVersion latest = null;
            if (null != versions)
            {
                for (int i = 0; i < versions.Length; ++i)
                {
                    ProtocolVersion next = versions[i];
                    if (null != next && next.IsTls)
                    {
                        if (null == latest || next.MinorVersion > latest.MinorVersion)
                        {
                            latest = next;
                        }
                    }
                }
            }
            return latest;
        }

        internal static bool IsSupportedDtlsVersionClient(ProtocolVersion version)
        {
            return null != version
                && version.IsEqualOrLaterVersionOf(CLIENT_EARLIEST_SUPPORTED_DTLS)
                && version.IsEqualOrEarlierVersionOf(CLIENT_LATEST_SUPPORTED_DTLS);
        }

        internal static bool IsSupportedDtlsVersionServer(ProtocolVersion version)
        {
            return null != version
                && version.IsEqualOrLaterVersionOf(SERVER_EARLIEST_SUPPORTED_DTLS)
                && version.IsEqualOrEarlierVersionOf(SERVER_LATEST_SUPPORTED_DTLS);
        }

        internal static bool IsSupportedTlsVersionClient(ProtocolVersion version)
        {
            if (null == version)
                return false;

            int fullVersion = version.FullVersion;

            return fullVersion >= CLIENT_EARLIEST_SUPPORTED_TLS.FullVersion
                && fullVersion <= CLIENT_LATEST_SUPPORTED_TLS.FullVersion;
        }

        internal static bool IsSupportedTlsVersionServer(ProtocolVersion version)
        {
            if (null == version)
                return false;

            int fullVersion = version.FullVersion;

            return fullVersion >= SERVER_EARLIEST_SUPPORTED_TLS.FullVersion
                && fullVersion <= SERVER_LATEST_SUPPORTED_TLS.FullVersion;
        }

        private readonly int version;
        private readonly string name;

        private ProtocolVersion(int v, string name)
        {
            this.version = v & 0xFFFF;
            this.name = name;
        }

        public ProtocolVersion[] DownTo(ProtocolVersion min)
        {
            if (!IsEqualOrLaterVersionOf(min))
                throw new ArgumentException("must be an equal or earlier version of this one", "min");

            var result = new List<ProtocolVersion>();
            result.Add(this);

            ProtocolVersion current = this;
            while (!current.Equals(min))
            {
                current = current.GetPreviousVersion();
                result.Add(current);
            }

            return result.ToArray();
        }

        public int FullVersion
        {
            get { return version; }
        }

        public int MajorVersion
        {
            get { return version >> 8; }
        }

        public int MinorVersion
        {
            get { return version & 0xFF; }
        }

        public string Name
        {
            get { return name; }
        }

        public bool IsDtls
        {
            get { return MajorVersion == 0xFE; }
        }

        public bool IsSsl
        {
            get { return this == SSLv3; }
        }

        public bool IsTls
        {
            get { return MajorVersion == 0x03; }
        }

        public ProtocolVersion GetEquivalentTlsVersion()
        {
            switch (MajorVersion)
            {
            case 0x03:
                return this;
            case 0xFE:
                switch (MinorVersion)
                {
                case 0xFF:
                    return TLSv11;
                case 0xFD:
                    return TLSv12;
                case 0xFC:
                    return TLSv13;
                default:
                    return null;
                }
            default:
                return null;
            }
        }

        public ProtocolVersion GetNextVersion()
        {
            int major = MajorVersion, minor = MinorVersion;
            switch (major)
            {
            case 0x03:
                switch (minor)
                {
                case 0xFF:
                    return null;
                default:
                    return Get(major, minor + 1);
                }
            case 0xFE:
                switch (minor)
                {
                case 0x00:
                    return null;
                case 0xFF:
                    return DTLSv12;
                default:
                    return Get(major, minor - 1);
                }
            default:
                return null;
            }
        }

        public ProtocolVersion GetPreviousVersion()
        {
            int major = MajorVersion, minor = MinorVersion;
            switch (major)
            {
            case 0x03:
                switch (minor)
                {
                case 0x00:
                    return null;
                default:
                    return Get(major, minor - 1);
                }
            case 0xFE:
                switch (minor)
                {
                case 0xFF:
                    return null;
                case 0xFD:
                    return DTLSv10;
                default:
                    return Get(major, minor + 1);
                }
            default:
                return null;
            }
        }

        public bool IsEarlierVersionOf(ProtocolVersion version)
        {
            if (null == version || MajorVersion != version.MajorVersion)
                return false;

            int diffMinorVersion = MinorVersion - version.MinorVersion;
            return IsDtls ? diffMinorVersion > 0 : diffMinorVersion < 0;
        }

        public bool IsEqualOrEarlierVersionOf(ProtocolVersion version)
        {
            if (null == version || MajorVersion != version.MajorVersion)
                return false;

            int diffMinorVersion = MinorVersion - version.MinorVersion;
            return IsDtls ? diffMinorVersion >= 0 : diffMinorVersion <= 0;
        }

        public bool IsEqualOrLaterVersionOf(ProtocolVersion version)
        {
            if (null == version || MajorVersion != version.MajorVersion)
                return false;

            int diffMinorVersion = MinorVersion - version.MinorVersion;
            return IsDtls ? diffMinorVersion <= 0 : diffMinorVersion >= 0;
        }

        public bool IsLaterVersionOf(ProtocolVersion version)
        {
            if (null == version || MajorVersion != version.MajorVersion)
                return false;

            int diffMinorVersion = MinorVersion - version.MinorVersion;
            return IsDtls ? diffMinorVersion < 0 : diffMinorVersion > 0;
        }

        public override bool Equals(object other)
        {
            return this == other || (other is ProtocolVersion && Equals((ProtocolVersion)other));
        }

        public bool Equals(ProtocolVersion other)
        {
            return other != null && this.version == other.version;
        }

        public override int GetHashCode()
        {
            return version;
        }

        public static ProtocolVersion Get(int major, int minor)
        {
            switch (major)
            {
            case 0x03:
            {
                switch (minor)
                {
                case 0x00:
                    return SSLv3;
                case 0x01:
                    return TLSv10;
                case 0x02:
                    return TLSv11;
                case 0x03:
                    return TLSv12;
                case 0x04:
                    return TLSv13;
                }
                return GetUnknownVersion(major, minor, "TLS");
            }
            case 0xFE:
            {
                switch (minor)
                {
                case 0xFF:
                    return DTLSv10;
                case 0xFE:
                    throw new ArgumentException("{0xFE, 0xFE} is a reserved protocol version");
                case 0xFD:
                    return DTLSv12;
                case 0xFC:
                    return DTLSv13;
                }
                return GetUnknownVersion(major, minor, "DTLS");
            }
            default:
            {
                return GetUnknownVersion(major, minor, "UNKNOWN");
            }
            }
        }

        public ProtocolVersion[] Only()
        {
            return new ProtocolVersion[]{ this };
        }

        public override string ToString()
        {
            return name;
        }

        private static void CheckUint8(int versionOctet)
        {
            if (!TlsUtilities.IsValidUint8(versionOctet))
                throw new ArgumentException("not a valid octet", "versionOctet");
        }

        private static ProtocolVersion GetUnknownVersion(int major, int minor, string prefix)
        {
            CheckUint8(major);
            CheckUint8(minor);

            int v = (major << 8) | minor;
            string hex = Convert.ToString(0x10000 | v, 16).Substring(1).ToUpperInvariant();
            return new ProtocolVersion(v, prefix + " 0x" + hex);
        }
    }
}
