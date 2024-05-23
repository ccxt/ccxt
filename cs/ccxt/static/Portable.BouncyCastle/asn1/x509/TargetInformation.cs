using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
	/**
	 * Target information extension for attributes certificates according to RFC
	 * 3281.
	 * 
	 * <pre>
	 *           SEQUENCE OF Targets
	 * </pre>
	 * 
	 */
	public class TargetInformation
		: Asn1Encodable
	{
		private readonly Asn1Sequence targets;

		/**
		 * Creates an instance of a TargetInformation from the given object.
		 * <p>
		 * <code>obj</code> can be a TargetInformation or a {@link Asn1Sequence}</p>
		 * 
		 * @param obj The object.
		 * @return A TargetInformation instance.
		 * @throws ArgumentException if the given object cannot be interpreted as TargetInformation.
		 */
		public static TargetInformation GetInstance(
			object obj)
		{
			if (obj is TargetInformation)
			{
				return (TargetInformation) obj;
			}

			if (obj is Asn1Sequence)
			{
				return new TargetInformation((Asn1Sequence) obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		 * Constructor from a Asn1Sequence.
		 * 
		 * @param seq The Asn1Sequence.
		 * @throws ArgumentException if the sequence does not contain
		 *             correctly encoded Targets elements.
		 */
		private TargetInformation(
			Asn1Sequence targets)
		{
			this.targets = targets;
		}

		/**
		 * Returns the targets in this target information extension.
		 * <p>
		 * The ArrayList is cloned before it is returned.</p>
		 * 
		 * @return Returns the targets.
		 */
		public virtual Targets[] GetTargetsObjects()
		{
			Targets[] result = new Targets[targets.Count];

			for (int i = 0; i < targets.Count; ++i)
			{
				result[i] = Targets.GetInstance(targets[i]);
			}

			return result;
		}

		/**
		 * Constructs a target information from a single targets element. 
		 * According to RFC 3281 only one targets element must be produced.
		 * 
		 * @param targets A Targets instance.
		 */
		public TargetInformation(
			Targets targets)
		{
			this.targets = new DerSequence(targets);
		}

		/**
		 * According to RFC 3281 only one targets element must be produced. If
		 * multiple targets are given they must be merged in
		 * into one targets element.
		 *
		 * @param targets An array with {@link Targets}.
		 */
		public TargetInformation(
			Target[] targets)
			: this(new Targets(targets))
		{
		}

		/**
		 * Produce an object suitable for an Asn1OutputStream.
		 * 
		 * Returns:
		 * 
		 * <pre>
		 *          SEQUENCE OF Targets
		 * </pre>
		 * 
		 * <p>
		 * According to RFC 3281 only one targets element must be produced. If
		 * multiple targets are given in the constructor they are merged into one
		 * targets element. If this was produced from a
		 * {@link Org.BouncyCastle.Asn1.Asn1Sequence} the encoding is kept.</p>
		 * 
		 * @return an Asn1Object
		 */
		public override Asn1Object ToAsn1Object()
		{
			return targets;
		}
	}
}
