using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Crypto.Parameters
{

	/// <summary>
	/// Parameters for the Skein hash function - a series of byte[] strings identified by integer tags.
	/// </summary>
	/// <remarks>
	/// Parameterised Skein can be used for:
	/// <ul> 
	/// <li>MAC generation, by providing a <see cref="SkeinParameters.Builder.SetKey(byte[])">key</see>.</li>
	/// <li>Randomised hashing, by providing a <see cref="SkeinParameters.Builder.SetNonce(byte[])">nonce</see>.</li>
	/// <li>A hash function for digital signatures, associating a
	/// <see cref="SkeinParameters.Builder.SetPublicKey(byte[])">public key</see> with the message digest.</li>
	/// <li>A key derivation function, by providing a
	/// <see cref="SkeinParameters.Builder.SetKeyIdentifier(byte[])">key identifier</see>.</li>
	/// <li>Personalised hashing, by providing a
	/// <see cref="SkeinParameters.Builder.SetPersonalisation(DateTime,string,string)">recommended format</see> or
	/// <see cref="SkeinParameters.Builder.SetPersonalisation(byte[])">arbitrary</see> personalisation string.</li>
	/// </ul>
	/// </remarks>
	/// <seealso cref="Org.BouncyCastle.Crypto.Digests.SkeinEngine"/>
	/// <seealso cref="Org.BouncyCastle.Crypto.Digests.SkeinDigest"/>
	/// <seealso cref="Org.BouncyCastle.Crypto.Macs.SkeinMac"/>
	public class SkeinParameters
		: ICipherParameters
	{
		/// <summary>
		/// The parameter type for a secret key, supporting MAC or KDF functions: 0
		/// </summary>
		public const int PARAM_TYPE_KEY = 0;

		/// <summary>
		/// The parameter type for the Skein configuration block: 4
		/// </summary>
		public const int PARAM_TYPE_CONFIG = 4;

		/// <summary>
		/// The parameter type for a personalisation string: 8
		/// </summary>
		public const int PARAM_TYPE_PERSONALISATION = 8;

		/// <summary>
		/// The parameter type for a public key: 12
		/// </summary>
		public const int PARAM_TYPE_PUBLIC_KEY = 12;

		/// <summary>
		/// The parameter type for a key identifier string: 16
		/// </summary>
		public const int PARAM_TYPE_KEY_IDENTIFIER = 16;

		/// <summary>
		/// The parameter type for a nonce: 20
		/// </summary>
		public const int PARAM_TYPE_NONCE = 20;

		/// <summary>
		/// The parameter type for the message: 48
		/// </summary>
		public const int PARAM_TYPE_MESSAGE = 48;

		/// <summary>
		/// The parameter type for the output transformation: 63
		/// </summary>
		public const int PARAM_TYPE_OUTPUT = 63;

		private IDictionary<int, byte[]> m_parameters;

		public SkeinParameters()
			: this(new Dictionary<int, byte[]>())
		{
		}

		private SkeinParameters(IDictionary<int, byte[]> parameters)
		{
			this.m_parameters = parameters;
		}

		/// <summary>
		/// Obtains a map of type (int) to value (byte[]) for the parameters tracked in this object.
		/// </summary>
		public IDictionary<int, byte[]> GetParameters()
		{
			return m_parameters;
		}

		/// <summary>
		/// Obtains the value of the <see cref="PARAM_TYPE_KEY">key parameter</see>, or <code>null</code> if not
		/// set.
		/// </summary>
		/// <returns>The key.</returns>
		public byte[] GetKey()
		{
			return CollectionUtilities.GetValueOrNull(m_parameters, PARAM_TYPE_KEY);
		}

		/// <summary>
		/// Obtains the value of the <see cref="PARAM_TYPE_PERSONALISATION">personalisation parameter</see>, or
		/// <code>null</code> if not set.
		/// </summary>
		public byte[] GetPersonalisation()
		{
			return CollectionUtilities.GetValueOrNull(m_parameters, PARAM_TYPE_PERSONALISATION);
		}

		/// <summary>
		/// Obtains the value of the <see cref="PARAM_TYPE_PUBLIC_KEY">public key parameter</see>, or
		/// <code>null</code> if not set.
		/// </summary>
		public byte[] GetPublicKey()
		{
			return CollectionUtilities.GetValueOrNull(m_parameters, PARAM_TYPE_PUBLIC_KEY);
		}

		/// <summary>
		/// Obtains the value of the <see cref="PARAM_TYPE_KEY_IDENTIFIER">key identifier parameter</see>, or
		/// <code>null</code> if not set.
		/// </summary>
		public byte[] GetKeyIdentifier()
		{
			return CollectionUtilities.GetValueOrNull(m_parameters, PARAM_TYPE_KEY_IDENTIFIER);
		}

		/// <summary>
		/// Obtains the value of the <see cref="PARAM_TYPE_NONCE">nonce parameter</see>, or <code>null</code> if
		/// not set.
		/// </summary>
		public byte[] GetNonce()
		{
			return CollectionUtilities.GetValueOrNull(m_parameters, PARAM_TYPE_NONCE);
		}

		/// <summary>
		/// A builder for <see cref="SkeinParameters"/>.
		/// </summary>
		public class Builder
		{
			private Dictionary<int, byte[]> m_parameters;

			public Builder()
			{
				m_parameters = new Dictionary<int, byte[]>();
			}

			public Builder(IDictionary<int, byte[]> paramsMap)
			{
				m_parameters = new Dictionary<int, byte[]>(paramsMap);
			}

			public Builder(SkeinParameters parameters)
				: this(parameters.m_parameters)
			{
			}

			/// <summary>
			/// Sets a parameters to apply to the Skein hash function.
			/// </summary>
			/// <remarks>
			/// Parameter types must be in the range 0,5..62, and cannot use the value 48
			/// (reserved for message body).
			/// <p/>
			/// Parameters with type &lt; 48 are processed before
			/// the message content, parameters with type &gt; 48
			/// are processed after the message and prior to output.
			/// </remarks>
			/// <param name="type">the type of the parameter, in the range 5..62.</param>
			/// <param name="value">the byte sequence of the parameter.</param>
			public Builder Set(int type, byte[] value)
			{
				if (value == null)
				{
					throw new ArgumentException("Parameter value must not be null.");
				}
				if ((type != PARAM_TYPE_KEY)
				    && (type <= PARAM_TYPE_CONFIG || type >= PARAM_TYPE_OUTPUT || type == PARAM_TYPE_MESSAGE))
				{
					throw new ArgumentException("Parameter types must be in the range 0,5..47,49..62.");
				}
				if (type == PARAM_TYPE_CONFIG)
				{
					throw new ArgumentException("Parameter type " + PARAM_TYPE_CONFIG
					                            + " is reserved for internal use.");
				}
				m_parameters.Add(type, value);
				return this;
			}

			/// <summary>
			/// Sets the <see cref="SkeinParameters.PARAM_TYPE_KEY"/> parameter.
			/// </summary>
			public Builder SetKey(byte[] key)
			{
				return Set(PARAM_TYPE_KEY, key);
			}

			/// <summary>
			/// Sets the <see cref="SkeinParameters.PARAM_TYPE_PERSONALISATION"/> parameter.
			/// </summary>
			public Builder SetPersonalisation(byte[] personalisation)
			{
				return Set(PARAM_TYPE_PERSONALISATION, personalisation);
			}

			/// <summary>
			/// Implements the recommended personalisation format for Skein defined in Section 4.11 of
			/// the Skein 1.3 specification.
			/// </summary>
			/// <remarks>
			/// The format is <code>YYYYMMDD email@address distinguisher</code>, encoded to a byte
			/// sequence using UTF-8 encoding.
			/// </remarks>
			/// <param name="date">the date the personalised application of the Skein was defined.</param>
			/// <param name="emailAddress">the email address of the creation of the personalised application.</param>
			/// <param name="distinguisher">an arbitrary personalisation string distinguishing the application.</param>
			public Builder SetPersonalisation(DateTime date, string emailAddress, string distinguisher)
			{
				try
				{
					MemoryStream bout = new MemoryStream();
					StreamWriter outBytes = new StreamWriter(bout, System.Text.Encoding.UTF8);
					outBytes.Write(date.ToString("YYYYMMDD", CultureInfo.InvariantCulture));
					outBytes.Write(" ");
					outBytes.Write(emailAddress);
					outBytes.Write(" ");
					outBytes.Write(distinguisher);
                    Platform.Dispose(outBytes);
					return Set(PARAM_TYPE_PERSONALISATION, bout.ToArray());
				}
				catch (IOException e)
				{
					throw new InvalidOperationException("Byte I/O failed.", e);
				}
			}

			/// <summary>
			/// Sets the <see cref="SkeinParameters.PARAM_TYPE_KEY_IDENTIFIER"/> parameter.
			/// </summary>
			public Builder SetPublicKey(byte[] publicKey)
			{
				return Set(PARAM_TYPE_PUBLIC_KEY, publicKey);
			}

			/// <summary>
			/// Sets the <see cref="SkeinParameters.PARAM_TYPE_KEY_IDENTIFIER"/> parameter.
			/// </summary>
			public Builder SetKeyIdentifier(byte[] keyIdentifier)
			{
				return Set(PARAM_TYPE_KEY_IDENTIFIER, keyIdentifier);
			}

			/// <summary>
			/// Sets the <see cref="SkeinParameters.PARAM_TYPE_NONCE"/> parameter.
			/// </summary>
			public Builder SetNonce(byte[] nonce)
			{
				return Set(PARAM_TYPE_NONCE, nonce);
			}

			/// <summary>
			/// Constructs a new <see cref="SkeinParameters"/> instance with the parameters provided to this
			/// builder.
			/// </summary>
			public SkeinParameters Build()
			{
				return new SkeinParameters(m_parameters);
			}
		}
	}
}
