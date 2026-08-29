using System.IO;

using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.IO.Pem;

namespace Org.BouncyCastle.OpenSsl
{
	/// <remarks>General purpose writer for OpenSSL PEM objects.</remarks>
	public class PemWriter
		: Utilities.IO.Pem.PemWriter
	{
		/// <param name="writer">The TextWriter object to write the output to.</param>
		public PemWriter(TextWriter writer)
			: base(writer)
		{
		}

		public void WriteObject(object obj) 
		{
			try
			{
				base.WriteObject(new MiscPemGenerator(obj));
			}
			catch (PemGenerationException e)
			{
				if (e.InnerException is IOException)
					throw (IOException)e.InnerException;

				throw e;
			}
		}

		public void WriteObject(
			object			obj,
			string			algorithm,
			char[]			password,
			SecureRandom	random)
		{
			base.WriteObject(new MiscPemGenerator(obj, algorithm, password, random));
		}
	}
}
