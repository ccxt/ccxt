using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class ServerNameList
    {
        private readonly IList<ServerName> m_serverNameList;

        /// <param name="serverNameList">an <see cref="IList{T}"/> of <see cref="ServerName"/>.</param>
        public ServerNameList(IList<ServerName> serverNameList)
        {
            if (null == serverNameList)
                throw new ArgumentNullException("serverNameList");

            this.m_serverNameList = serverNameList;
        }

        /// <returns>an <see cref="IList{T}"/> of <see cref="ServerName"/>.</returns>
        public IList<ServerName> ServerNames
        {
            get { return m_serverNameList; }
        }

        /// <summary>Encode this <see cref="ServerNameList"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to .</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            MemoryStream buf = new MemoryStream();

            short[] nameTypesSeen = TlsUtilities.EmptyShorts;
            foreach (ServerName entry in ServerNames)
            {
                nameTypesSeen = CheckNameType(nameTypesSeen, entry.NameType);
                if (null == nameTypesSeen)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                entry.Encode(buf);
            }

            int length = Convert.ToInt32(buf.Length);
            TlsUtilities.CheckUint16(length);
            TlsUtilities.WriteUint16(length, output);
            buf.WriteTo(output);
        }

        /// <summary>Parse a <see cref="ServerNameList"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="ServerNameList"/> object.</returns>
        /// <exception cref="IOException"/>
        public static ServerNameList Parse(Stream input)
        {
            byte[] data = TlsUtilities.ReadOpaque16(input, 1);

            MemoryStream buf = new MemoryStream(data, false);

            short[] nameTypesSeen = TlsUtilities.EmptyShorts;
            var server_name_list = new List<ServerName>();
            while (buf.Position < buf.Length)
            {
                ServerName entry = ServerName.Parse(buf);

                nameTypesSeen = CheckNameType(nameTypesSeen, entry.NameType);
                if (null == nameTypesSeen)
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                server_name_list.Add(entry);
            }

            return new ServerNameList(server_name_list);
        }

        private static short[] CheckNameType(short[] nameTypesSeen, short nameType)
        {
             // RFC 6066 3. The ServerNameList MUST NOT contain more than one name of the same NameType.
            if (Arrays.Contains(nameTypesSeen, nameType))
                return null;

            return Arrays.Append(nameTypesSeen, nameType);
        }
    }
}
