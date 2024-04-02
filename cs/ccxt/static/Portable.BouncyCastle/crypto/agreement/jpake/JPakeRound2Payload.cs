using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Agreement.JPake
{
    /// <summary>
    /// The payload sent/received during the second round of a J-PAKE exchange.
    /// 
    /// Each JPAKEParticipant creates and sends an instance
    /// of this payload to the other JPAKEParticipant.
    /// The payload to send should be created via
    /// JPAKEParticipant#createRound2PayloadToSend()
    /// 
    /// Each JPAKEParticipant must also validate the payload
    /// received from the other JPAKEParticipant.
    /// The received payload should be validated via
    /// JPAKEParticipant#validateRound2PayloadReceived(JPakeRound2Payload)
    /// </summary>
    public class JPakeRound2Payload
    {
        /// <summary>
        /// The id of the JPAKEParticipant who created/sent this payload.
        /// </summary>
        private readonly string participantId;

        /// <summary>
        /// The value of A, as computed during round 2.
        /// </summary>
        private readonly BigInteger a;

        /// <summary>
        /// The zero knowledge proof for x2 * s.
        /// 
        /// This is a two element array, containing {g^v, r} for x2 * s.
        /// </summary>
        private readonly BigInteger[] knowledgeProofForX2s;

        public JPakeRound2Payload(string participantId, BigInteger a, BigInteger[] knowledgeProofForX2s)
        {
            JPakeUtilities.ValidateNotNull(participantId, "participantId");
            JPakeUtilities.ValidateNotNull(a, "a");
            JPakeUtilities.ValidateNotNull(knowledgeProofForX2s, "knowledgeProofForX2s");

            this.participantId = participantId;
            this.a = a;
            this.knowledgeProofForX2s = new BigInteger[knowledgeProofForX2s.Length];
            knowledgeProofForX2s.CopyTo(this.knowledgeProofForX2s, 0);
        }

        public virtual string ParticipantId
        {
            get { return participantId; }
        }

        public virtual BigInteger A
        {
            get { return a; }
        }

        public virtual BigInteger[] KnowledgeProofForX2s
        {
            get
            {
                BigInteger[] kp = new BigInteger[knowledgeProofForX2s.Length];
                Array.Copy(knowledgeProofForX2s, kp, knowledgeProofForX2s.Length);
                return kp;
            }
        }
    }
}
