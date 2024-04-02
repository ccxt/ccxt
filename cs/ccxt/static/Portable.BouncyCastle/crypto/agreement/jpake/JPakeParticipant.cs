using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Agreement.JPake
{
    /// <summary>
    /// A participant in a Password Authenticated Key Exchange by Juggling (J-PAKE) exchange.
    ///
    /// The J-PAKE exchange is defined by Feng Hao and Peter Ryan in the paper
    /// <a href="http://grouper.ieee.org/groups/1363/Research/contributions/hao-ryan-2008.pdf">
    /// "Password Authenticated Key Exchange by Juggling, 2008."</a>
    ///
    /// The J-PAKE protocol is symmetric.
    /// There is no notion of a <i>client</i> or <i>server</i>, but rather just two <i>participants</i>.
    /// An instance of JPakeParticipant represents one participant, and
    /// is the primary interface for executing the exchange.
    ///
    /// To execute an exchange, construct a JPakeParticipant on each end,
    /// and call the following 7 methods
    /// (once and only once, in the given order, for each participant, sending messages between them as described):
    ///
    /// CreateRound1PayloadToSend() - and send the payload to the other participant
    /// ValidateRound1PayloadReceived(JPakeRound1Payload) - use the payload received from the other participant
    /// CreateRound2PayloadToSend() - and send the payload to the other participant
    /// ValidateRound2PayloadReceived(JPakeRound2Payload) - use the payload received from the other participant
    /// CalculateKeyingMaterial()
    /// CreateRound3PayloadToSend(BigInteger) - and send the payload to the other participant
    /// ValidateRound3PayloadReceived(JPakeRound3Payload, BigInteger) - use the payload received from the other participant
    ///
    /// Each side should derive a session key from the keying material returned by CalculateKeyingMaterial().
    /// The caller is responsible for deriving the session key using a secure key derivation function (KDF).
    ///
    /// Round 3 is an optional key confirmation process.
    /// If you do not execute round 3, then there is no assurance that both participants are using the same key.
    /// (i.e. if the participants used different passwords, then their session keys will differ.)
    ///
    /// If the round 3 validation succeeds, then the keys are guaranteed to be the same on both sides.
    ///
    /// The symmetric design can easily support the asymmetric cases when one party initiates the communication.
    /// e.g. Sometimes the round1 payload and round2 payload may be sent in one pass.
    /// Also, in some cases, the key confirmation payload can be sent together with the round2 payload.
    /// These are the trivial techniques to optimize the communication.
    ///
    /// The key confirmation process is implemented as specified in
    /// <a href="http://csrc.nist.gov/publications/nistpubs/800-56A/SP800-56A_Revision1_Mar08-2007.pdf">NIST SP 800-56A Revision 1</a>,
    /// Section 8.2 Unilateral Key Confirmation for Key Agreement Schemes.
    ///
    /// This class is stateful and NOT threadsafe.
    /// Each instance should only be used for ONE complete J-PAKE exchange
    /// (i.e. a new JPakeParticipant should be constructed for each new J-PAKE exchange).
    /// </summary>
    public class JPakeParticipant
    {
        // Possible internal states.  Used for state checking.
        public static readonly int STATE_INITIALIZED = 0;
        public static readonly int STATE_ROUND_1_CREATED = 10;
        public static readonly int STATE_ROUND_1_VALIDATED = 20;
        public static readonly int STATE_ROUND_2_CREATED = 30;
        public static readonly int STATE_ROUND_2_VALIDATED = 40;
        public static readonly int STATE_KEY_CALCULATED = 50;
        public static readonly int STATE_ROUND_3_CREATED = 60;
        public static readonly int STATE_ROUND_3_VALIDATED = 70;

        // Unique identifier of this participant.
        // The two participants in the exchange must NOT share the same id.
        private string participantId;

        // Shared secret.  This only contains the secret between construction
        // and the call to CalculateKeyingMaterial().
        //
        // i.e. When CalculateKeyingMaterial() is called, this buffer overwritten with 0's,
        // and the field is set to null.
        private char[] password;

        // Digest to use during calculations.
        private IDigest digest;
        
        // Source of secure random data.
        private readonly SecureRandom random;

        private readonly BigInteger p;
        private readonly BigInteger q;
        private readonly BigInteger g;

        // The participantId of the other participant in this exchange.
        private string partnerParticipantId;

        // Alice's x1 or Bob's x3.
        private BigInteger x1;
        // Alice's x2 or Bob's x4.
        private BigInteger x2;
        // Alice's g^x1 or Bob's g^x3.
        private BigInteger gx1;
        // Alice's g^x2 or Bob's g^x4.
        private BigInteger gx2;
        // Alice's g^x3 or Bob's g^x1.
        private BigInteger gx3;
        // Alice's g^x4 or Bob's g^x2.
        private BigInteger gx4;
        // Alice's B or Bob's A.
        private BigInteger b;

        // The current state.
        // See the <tt>STATE_*</tt> constants for possible values.
        private int state;

        /// <summary>
        /// Convenience constructor for a new JPakeParticipant that uses
        /// the JPakePrimeOrderGroups#NIST_3072 prime order group,
        /// a SHA-256 digest, and a default SecureRandom implementation.
        ///
        /// After construction, the State state will be STATE_INITIALIZED.
        /// 
        /// Throws NullReferenceException if any argument is null. Throws
        /// ArgumentException if password is empty.
        /// </summary>
        /// <param name="participantId">Unique identifier of this participant.
        ///      The two participants in the exchange must NOT share the same id.</param>
        /// <param name="password">Shared secret.
        ///      A defensive copy of this array is made (and cleared once CalculateKeyingMaterial() is called).
        ///      Caller should clear the input password as soon as possible.</param>
        public JPakeParticipant(string participantId, char[] password)
            : this(participantId, password, JPakePrimeOrderGroups.NIST_3072) { }

        /// <summary>
        /// Convenience constructor for a new JPakeParticipant that uses
        /// a SHA-256 digest, and a default SecureRandom implementation.
        ///
        /// After construction, the State state will be STATE_INITIALIZED.
        /// 
        /// Throws NullReferenceException if any argument is null. Throws
        /// ArgumentException if password is empty.
        /// </summary>
        /// <param name="participantId">Unique identifier of this participant.
        ///      The two participants in the exchange must NOT share the same id.</param>
        /// <param name="password">Shared secret.
        ///      A defensive copy of this array is made (and cleared once CalculateKeyingMaterial() is called).
        ///      Caller should clear the input password as soon as possible.</param>
        /// <param name="group">Prime order group. See JPakePrimeOrderGroups for standard groups.</param>
        public JPakeParticipant(string participantId, char[] password, JPakePrimeOrderGroup group)
            : this(participantId, password, group, new Sha256Digest(), new SecureRandom()) { }


        /// <summary>
        /// Constructor for a new JPakeParticipant.
        ///
        /// After construction, the State state will be STATE_INITIALIZED.
        /// 
        /// Throws NullReferenceException if any argument is null. Throws
        /// ArgumentException if password is empty.
        /// </summary>
        /// <param name="participantId">Unique identifier of this participant.
        ///      The two participants in the exchange must NOT share the same id.</param>
        /// <param name="password">Shared secret.
        ///      A defensive copy of this array is made (and cleared once CalculateKeyingMaterial() is called).
        ///      Caller should clear the input password as soon as possible.</param>
        /// <param name="group">Prime order group. See JPakePrimeOrderGroups for standard groups.</param>
        /// <param name="digest">Digest to use during zero knowledge proofs and key confirmation
        ///     (SHA-256 or stronger preferred).</param>
        /// <param name="random">Source of secure random data for x1 and x2, and for the zero knowledge proofs.</param>
        public JPakeParticipant(string participantId, char[] password, JPakePrimeOrderGroup group, IDigest digest, SecureRandom random)
        {
            JPakeUtilities.ValidateNotNull(participantId, "participantId");
            JPakeUtilities.ValidateNotNull(password, "password");
            JPakeUtilities.ValidateNotNull(group, "p");
            JPakeUtilities.ValidateNotNull(digest, "digest");
            JPakeUtilities.ValidateNotNull(random, "random");

            if (password.Length == 0)
            {
                throw new ArgumentException("Password must not be empty.");
            }

            this.participantId = participantId;

            // Create a defensive copy so as to fully encapsulate the password.
            // 
            // This array will contain the password for the lifetime of this
            // participant BEFORE CalculateKeyingMaterial() is called.
            // 
            // i.e. When CalculateKeyingMaterial() is called, the array will be cleared
            // in order to remove the password from memory.
            // 
            // The caller is responsible for clearing the original password array
            // given as input to this constructor.
            this.password = new char[password.Length];
            Array.Copy(password, this.password, password.Length);

            this.p = group.P;
            this.q = group.Q;
            this.g = group.G;

            this.digest = digest;
            this.random = random;

            this.state = STATE_INITIALIZED;
        }

        /// <summary>
        /// Gets the current state of this participant.
        /// See the <tt>STATE_*</tt> constants for possible values.
        /// </summary>
        public virtual int State
        {
            get { return state; }
        }


        /// <summary>
        /// Creates and returns the payload to send to the other participant during round 1.
        ///
        /// After execution, the State state} will be STATE_ROUND_1_CREATED}.
        /// </summary>
        public virtual JPakeRound1Payload CreateRound1PayloadToSend()
        {
            if (this.state >= STATE_ROUND_1_CREATED)
                throw new InvalidOperationException("Round 1 payload already created for " + this.participantId);

            this.x1 = JPakeUtilities.GenerateX1(q, random);
            this.x2 = JPakeUtilities.GenerateX2(q, random);

            this.gx1 = JPakeUtilities.CalculateGx(p, g, x1);
            this.gx2 = JPakeUtilities.CalculateGx(p, g, x2);
            BigInteger[] knowledgeProofForX1 = JPakeUtilities.CalculateZeroKnowledgeProof(p, q, g, gx1, x1, participantId, digest, random);
            BigInteger[] knowledgeProofForX2 = JPakeUtilities.CalculateZeroKnowledgeProof(p, q, g, gx2, x2, participantId, digest, random);

            this.state = STATE_ROUND_1_CREATED;

            return new JPakeRound1Payload(participantId, gx1, gx2, knowledgeProofForX1, knowledgeProofForX2);
        }

        /// <summary>
        /// Validates the payload received from the other participant during round 1.
        ///
        /// Must be called prior to CreateRound2PayloadToSend().
        ///
        /// After execution, the State state will be  STATE_ROUND_1_VALIDATED.
        /// 
        /// Throws CryptoException if validation fails. Throws InvalidOperationException
        /// if called multiple times.
        /// </summary>
        public virtual void ValidateRound1PayloadReceived(JPakeRound1Payload round1PayloadReceived)
        {
            if (this.state >= STATE_ROUND_1_VALIDATED)
                throw new InvalidOperationException("Validation already attempted for round 1 payload for " + this.participantId);

            this.partnerParticipantId = round1PayloadReceived.ParticipantId;
            this.gx3 = round1PayloadReceived.Gx1;
            this.gx4 = round1PayloadReceived.Gx2;

            BigInteger[] knowledgeProofForX3 = round1PayloadReceived.KnowledgeProofForX1;
            BigInteger[] knowledgeProofForX4 = round1PayloadReceived.KnowledgeProofForX2;

            JPakeUtilities.ValidateParticipantIdsDiffer(participantId, round1PayloadReceived.ParticipantId);
            JPakeUtilities.ValidateGx4(gx4);
            JPakeUtilities.ValidateZeroKnowledgeProof(p, q, g, gx3, knowledgeProofForX3, round1PayloadReceived.ParticipantId, digest);
            JPakeUtilities.ValidateZeroKnowledgeProof(p, q, g, gx4, knowledgeProofForX4, round1PayloadReceived.ParticipantId, digest); 
            this.state = STATE_ROUND_1_VALIDATED;
        }

        /// <summary>
        /// Creates and returns the payload to send to the other participant during round 2.
        ///
        /// ValidateRound1PayloadReceived(JPakeRound1Payload) must be called prior to this method.
        ///
        /// After execution, the State state will be  STATE_ROUND_2_CREATED.
        ///
        /// Throws InvalidOperationException if called prior to ValidateRound1PayloadReceived(JPakeRound1Payload), or multiple times
        /// </summary>
        public virtual JPakeRound2Payload CreateRound2PayloadToSend()
        {
            if (this.state >= STATE_ROUND_2_CREATED)
                throw new InvalidOperationException("Round 2 payload already created for " + this.participantId);
            if (this.state < STATE_ROUND_1_VALIDATED)
                throw new InvalidOperationException("Round 1 payload must be validated prior to creating round 2 payload for " + this.participantId);

            BigInteger gA = JPakeUtilities.CalculateGA(p, gx1, gx3, gx4);
            BigInteger s = JPakeUtilities.CalculateS(password);
            BigInteger x2s = JPakeUtilities.CalculateX2s(q, x2, s);
            BigInteger A = JPakeUtilities.CalculateA(p, q, gA, x2s);
            BigInteger[] knowledgeProofForX2s = JPakeUtilities.CalculateZeroKnowledgeProof(p, q, gA, A, x2s, participantId, digest, random);

            this.state = STATE_ROUND_2_CREATED;

            return new JPakeRound2Payload(participantId, A, knowledgeProofForX2s);
        }

        /// <summary>
        /// Validates the payload received from the other participant during round 2.
        /// Note that this DOES NOT detect a non-common password.
        /// The only indication of a non-common password is through derivation
        /// of different keys (which can be detected explicitly by executing round 3 and round 4)
        ///
        /// Must be called prior to CalculateKeyingMaterial().
        ///
        /// After execution, the State state will be STATE_ROUND_2_VALIDATED.
        ///
        /// Throws CryptoException if validation fails. Throws
        /// InvalidOperationException if called prior to ValidateRound1PayloadReceived(JPakeRound1Payload), or multiple times
        /// </summary>
        public virtual void ValidateRound2PayloadReceived(JPakeRound2Payload round2PayloadReceived)
        {
            if (this.state >= STATE_ROUND_2_VALIDATED)
                throw new InvalidOperationException("Validation already attempted for round 2 payload for " + this.participantId);
            if (this.state < STATE_ROUND_1_VALIDATED)
                throw new InvalidOperationException("Round 1 payload must be validated prior to validation round 2 payload for " + this.participantId);

            BigInteger gB = JPakeUtilities.CalculateGA(p, gx3, gx1, gx2);
            this.b = round2PayloadReceived.A;
            BigInteger[] knowledgeProofForX4s = round2PayloadReceived.KnowledgeProofForX2s;

            JPakeUtilities.ValidateParticipantIdsDiffer(participantId, round2PayloadReceived.ParticipantId);
            JPakeUtilities.ValidateParticipantIdsEqual(this.partnerParticipantId, round2PayloadReceived.ParticipantId);
            JPakeUtilities.ValidateGa(gB);
            JPakeUtilities.ValidateZeroKnowledgeProof(p, q, gB, b, knowledgeProofForX4s, round2PayloadReceived.ParticipantId, digest);

            this.state = STATE_ROUND_2_VALIDATED;
        }

        /// <summary>
        /// Calculates and returns the key material.
        /// A session key must be derived from this key material using a secure key derivation function (KDF).
        /// The KDF used to derive the key is handled externally (i.e. not by JPakeParticipant).
        ///
        /// The keying material will be identical for each participant if and only if
        /// each participant's password is the same.  i.e. If the participants do not
        /// share the same password, then each participant will derive a different key.
        /// Therefore, if you immediately start using a key derived from
        /// the keying material, then you must handle detection of incorrect keys.
        /// If you want to handle this detection explicitly, you can optionally perform
        /// rounds 3 and 4.  See JPakeParticipant for details on how to execute
        /// rounds 3 and 4.
        ///
        /// The keying material will be in the range <tt>[0, p-1]</tt>.
        ///
        /// ValidateRound2PayloadReceived(JPakeRound2Payload) must be called prior to this method.
        /// 
        /// As a side effect, the internal password array is cleared, since it is no longer needed.
        ///
        /// After execution, the State state will be STATE_KEY_CALCULATED.
        ///
        /// Throws InvalidOperationException if called prior to ValidateRound2PayloadReceived(JPakeRound2Payload),
        /// or if called multiple times.
        /// </summary>
        public virtual BigInteger CalculateKeyingMaterial()
        {
            if (this.state >= STATE_KEY_CALCULATED)
                throw new InvalidOperationException("Key already calculated for " + participantId);
            if (this.state < STATE_ROUND_2_VALIDATED)
                throw new InvalidOperationException("Round 2 payload must be validated prior to creating key for " + participantId);

            BigInteger s = JPakeUtilities.CalculateS(password);

            // Clear the password array from memory, since we don't need it anymore.
            // Also set the field to null as a flag to indicate that the key has already been calculated.
            Array.Clear(password, 0, password.Length);
            this.password = null;

            BigInteger keyingMaterial = JPakeUtilities.CalculateKeyingMaterial(p, q, gx4, x2, s, b);

            // Clear the ephemeral private key fields as well.
            // Note that we're relying on the garbage collector to do its job to clean these up.
            // The old objects will hang around in memory until the garbage collector destroys them.
            // 
            // If the ephemeral private keys x1 and x2 are leaked,
            // the attacker might be able to brute-force the password.
            this.x1 = null;
            this.x2 = null;
            this.b = null;

            // Do not clear gx* yet, since those are needed by round 3.

            this.state = STATE_KEY_CALCULATED;

            return keyingMaterial;
        }

        /// <summary>
        /// Creates and returns the payload to send to the other participant during round 3.
        ///
        /// See JPakeParticipant for more details on round 3.
        ///
        /// After execution, the State state} will be  STATE_ROUND_3_CREATED.
        /// Throws InvalidOperationException if called prior to CalculateKeyingMaterial, or multiple
        /// times.
        /// </summary>
        /// <param name="keyingMaterial">The keying material as returned from CalculateKeyingMaterial().</param> 
        public virtual JPakeRound3Payload CreateRound3PayloadToSend(BigInteger keyingMaterial)
        {
            if (this.state >= STATE_ROUND_3_CREATED)
                throw new InvalidOperationException("Round 3 payload already created for " + this.participantId);
            if (this.state < STATE_KEY_CALCULATED)
                throw new InvalidOperationException("Keying material must be calculated prior to creating round 3 payload for " + this.participantId);

            BigInteger macTag = JPakeUtilities.CalculateMacTag(
                this.participantId,
                this.partnerParticipantId,
                this.gx1,
                this.gx2,
                this.gx3,
                this.gx4,
                keyingMaterial,
                this.digest);

            this.state = STATE_ROUND_3_CREATED;

            return new JPakeRound3Payload(participantId, macTag);
        }

        /// <summary>
        /// Validates the payload received from the other participant during round 3.
        ///
        /// See JPakeParticipant for more details on round 3.
        ///
        /// After execution, the State state will be STATE_ROUND_3_VALIDATED.
        /// 
        /// Throws CryptoException if validation fails. Throws InvalidOperationException if called prior to
        /// CalculateKeyingMaterial or multiple times
        /// </summary>
        /// <param name="round3PayloadReceived">The round 3 payload received from the other participant.</param> 
        /// <param name="keyingMaterial">The keying material as returned from CalculateKeyingMaterial().</param> 
        public virtual void ValidateRound3PayloadReceived(JPakeRound3Payload round3PayloadReceived, BigInteger keyingMaterial)
        {
            if (this.state >= STATE_ROUND_3_VALIDATED)
                throw new InvalidOperationException("Validation already attempted for round 3 payload for " + this.participantId);
            if (this.state < STATE_KEY_CALCULATED)
                throw new InvalidOperationException("Keying material must be calculated prior to validating round 3 payload for " + this.participantId);

            JPakeUtilities.ValidateParticipantIdsDiffer(participantId, round3PayloadReceived.ParticipantId);
            JPakeUtilities.ValidateParticipantIdsEqual(this.partnerParticipantId, round3PayloadReceived.ParticipantId);

            JPakeUtilities.ValidateMacTag(
                this.participantId,
                this.partnerParticipantId,
                this.gx1,
                this.gx2,
                this.gx3,
                this.gx4,
                keyingMaterial,
                this.digest,
                round3PayloadReceived.MacTag);

            // Clear the rest of the fields.
            this.gx1 = null;
            this.gx2 = null;
            this.gx3 = null;
            this.gx4 = null;

            this.state = STATE_ROUND_3_VALIDATED;
        }
    }
}
