using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Utilities.IO.Pem
{

	public class PemReader
	{		
		private readonly TextReader reader;
		private readonly MemoryStream buffer;
		private readonly StreamWriter textBuffer;
		private readonly List<int> pushback = new List<int>();
		int c = 0;

		public PemReader(TextReader reader)
		{
			if (reader == null)
				throw new ArgumentNullException("reader");


			buffer = new MemoryStream();
			textBuffer = new StreamWriter(buffer);

			this.reader = reader;
		}

		public TextReader Reader
		{
			get { return reader; }
		}


		/// <returns>
		/// A <see cref="PemObject"/>
		/// </returns>
		/// <exception cref="IOException"></exception>	
		public PemObject ReadPemObject()
        {

			//
			// Look for BEGIN
			//

			for (;;)
			{

				// Seek a leading dash, ignore anything up to that point.
				if (!seekDash())
				{
					// There are no pem objects here.
					return null; 
				}


				// consume dash [-----]BEGIN ...
				if (!consumeDash())
				{
					throw new IOException("no data after consuming leading dashes");
				}


				skipWhiteSpace();


				if (!expect("BEGIN"))
				{
					continue;
				}

				break;

			}


			skipWhiteSpace();

			//
			// Consume type, accepting whitespace
			//

			if (!bufferUntilStopChar('-',false) )
            {
				throw new IOException("ran out of data before consuming type");
			}

			string type = bufferedString().Trim();


			// Consume dashes after type.

			if (!consumeDash())
            {
				throw new IOException("ran out of data consuming header");
			}

			skipWhiteSpace();


			//
			// Read ahead looking for headers.
			// Look for a colon for up to 64 characters, as an indication there might be a header.
			//

			var headers = new List<PemHeader>();

			while (seekColon(64))
            {

				if (!bufferUntilStopChar(':',false))
                {
					throw new IOException("ran out of data reading header key value");
				}

				string key = bufferedString().Trim();


				c = Read();
				if (c != ':')
                {
					throw new IOException("expected colon");
                }
				

				//
				// We are going to look for well formed headers, if they do not end with a "LF" we cannot
				// discern where they end.
				//
			
				if (!bufferUntilStopChar('\n', false)) // Now read to the end of the line.
                {
					throw new IOException("ran out of data before consuming header value");
				}

				skipWhiteSpace();

				string value = bufferedString().Trim();
				headers.Add(new PemHeader(key,value));
			}


			//
			// Consume payload, ignoring all white space until we encounter a '-'
			//

			skipWhiteSpace();

			if (!bufferUntilStopChar('-',true))
			{
				throw new IOException("ran out of data before consuming payload");
			}

			string payload = bufferedString();
		
			// Seek the start of the end.
			if (!seekDash())
			{
				throw new IOException("did not find leading '-'");
			}

			if (!consumeDash())
			{
				throw new IOException("no data after consuming trailing dashes");
			}

			if (!expect("END "+type))
			{
				throw new IOException("END "+type+" was not found.");
			}



			if (!seekDash())
			{
				throw new IOException("did not find ending '-'");
			}


			// consume trailing dashes.
			consumeDash();
			

			return new PemObject(type, headers, Base64.Decode(payload));

		}


	
		private string bufferedString()
        {
			textBuffer.Flush();
			string value = Strings.FromUtf8ByteArray(buffer.ToArray());
			buffer.Position = 0;
			buffer.SetLength(0);
			return value;
        }


		private bool seekDash()
        {
			c = 0;
			while((c = Read()) >=0)
            {
				if (c == '-')
                {
					break;
                }
            }

			PushBack(c);

			return c == '-';
        }


		/// <summary>
		/// Seek ':" up to the limit.
		/// </summary>
		/// <param name="upTo"></param>
		/// <returns></returns>
		private bool seekColon(int upTo)
		{
			c = 0;
			bool colonFound = false;
			var read = new List<int>();

			for (; upTo>=0 && c >=0; upTo--)
            {
				c = Read();
				read.Add(c);
				if (c == ':')
                {
					colonFound = true;
					break;
                }
            }

			while(read.Count>0)
            {
				PushBack((int)read[read.Count-1]);
				read.RemoveAt(read.Count-1);
            }

			return colonFound;
		}



		/// <summary>
		/// Consume the dashes
		/// </summary>
		/// <returns></returns>
		private bool consumeDash()
        {
			c = 0;
			while ((c = Read()) >= 0)
			{
				if (c != '-')
				{
					break;
				}
			}

			PushBack(c);

			return c != -1;
		}

		/// <summary>
		/// Skip white space leave char in stream.
		/// </summary>
		private void skipWhiteSpace()
        {
			while ((c = Read()) >= 0)
			{
				if (c > ' ')
				{
					break;
				}
			}
			PushBack(c);
		}

		/// <summary>
		/// Read forward consuming the expected string.
		/// </summary>
		/// <param name="value">expected string</param>
		/// <returns>false if not consumed</returns>

		private bool expect(string value)
        {
			for (int t=0; t<value.Length; t++)
            {
				c = Read();
				if (c == value[t])
                {
					continue;
                } else
                {
					return false;
                }
            }

			return true;
        }

		/// <summary>
		/// Consume until dash.
		/// </summary>
		/// <returns>true if stream end not met</returns>
		private bool bufferUntilStopChar(char stopChar,   bool skipWhiteSpace)
        {
			while ((c = Read()) >= 0)
			{	
				if (skipWhiteSpace && c <=' ')
                {
					continue;
                }

				if (c != stopChar)
				{
					textBuffer.Write((char)c);
					textBuffer.Flush();
					
				} else
                {
					  PushBack(c);
					break;
                }
			}
			
			return c > -1;
		}

		private void PushBack(int value)
        {
			if (pushback.Count == 0)
            {
				pushback.Add(value);
            } else
            {
				pushback.Insert(0, value);
            }
        }

		private int Read()
        {
			if (pushback.Count > 0)
            {
				int i = pushback[0];
				pushback.RemoveAt(0);
				return i;
            }

			return reader.Read();
        }
	}
}
