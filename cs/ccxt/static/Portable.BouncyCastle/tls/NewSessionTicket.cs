using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class NewSessionTicket
    {
        private readonly long m_ticketLifetimeHint;
        private readonly byte[] m_ticket;

        public NewSessionTicket(long ticketLifetimeHint, byte[] ticket)
        {
            this.m_ticketLifetimeHint = ticketLifetimeHint;
            this.m_ticket = ticket;
        }

        public long TicketLifetimeHint
        {
            get { return m_ticketLifetimeHint; }
        }

        public byte[] Ticket
        {
            get { return m_ticket; }
        }

        /// <summary>Encode this <see cref="NewSessionTicket"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint32(TicketLifetimeHint, output);
            TlsUtilities.WriteOpaque16(Ticket, output);
        }

        /// <summary>Parse a <see cref="NewSessionTicket"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="NewSessionTicket"/> object.</returns>
        /// <exception cref="IOException"/>
        public static NewSessionTicket Parse(Stream input)
        {
            long ticketLifetimeHint = TlsUtilities.ReadUint32(input);
            byte[] ticket = TlsUtilities.ReadOpaque16(input);
            return new NewSessionTicket(ticketLifetimeHint, ticket);
        }
    }
}
