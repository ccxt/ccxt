/*
Copyright (c) 2001 Lapo Luchini.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright 
     notice, this list of conditions and the following disclaimer in 
     the documentation and/or other materials provided with the distribution.

  3. The names of the authors may not be used to endorse or promote products
     derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHORS
OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*
 * This program is based on zlib-1.1.3, so all credit should go authors
 * Jean-loup Gailly(jloup@gzip.org) and Mark Adler(madler@alumni.caltech.edu)
 * and contributors of zlib.
 */
/* This file is a port of jzlib v1.0.7, com.jcraft.jzlib.ZInputStream.java
 */

using System;
using System.Diagnostics;
using System.IO;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Utilities.Zlib
{
    public class ZInputStream
        : BaseInputStream
    {
        private static ZStream GetDefaultZStream(bool nowrap)
        {
            ZStream z = new ZStream();
            z.inflateInit(nowrap);
            return z;
        }

        private const int BufferSize = 4096;

        protected ZStream z;
        protected int flushLevel = JZlib.Z_NO_FLUSH;
        // TODO Allow custom buf
        protected byte[] buf = new byte[BufferSize];
        protected byte[] buf1 = new byte[1];
        protected bool compress;

        protected Stream input;
        protected bool closed;

        private bool nomoreinput = false;

        public ZInputStream(Stream input)
            : this(input, false)
        {
        }

        public ZInputStream(Stream input, bool nowrap)
            : this(input, GetDefaultZStream(nowrap))
        {
        }

        public ZInputStream(Stream input, ZStream z)
            : base()
        {
            Debug.Assert(input.CanRead);

            if (z == null)
            {
                z = new ZStream();
            }

            if (z.istate == null && z.dstate == null)
            {
                z.inflateInit();
            }

            this.input = input;
            this.compress = (z.istate == null);
            this.z = z;
            this.z.next_in = buf;
            this.z.next_in_index = 0;
            this.z.avail_in = 0;
        }

        public ZInputStream(Stream input, int level)
            : this(input, level, false)
        {
        }

        public ZInputStream(Stream input, int level, bool nowrap)
        {
            Debug.Assert(input.CanRead);

            this.input = input;
            this.compress = true;
            this.z = new ZStream();
            this.z.deflateInit(level, nowrap);
            this.z.next_in = buf;
            this.z.next_in_index = 0;
            this.z.avail_in = 0;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
			    if (!closed)
                {
                    closed = true;
                    Platform.Dispose(input);
                }
            }
            base.Dispose(disposing);
        }

        public virtual int FlushMode
        {
            get { return flushLevel; }
            set { this.flushLevel = value; }
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            if (count == 0)
                return 0;

            z.next_out = buffer;
            z.next_out_index = offset;
            z.avail_out = count;

            int err;
            do
            {
                if (z.avail_in == 0 && !nomoreinput)
                {
                    // if buffer is empty and more input is available, refill it
                    z.next_in_index = 0;
                    z.avail_in = input.Read(buf, 0, buf.Length); //(bufsize<z.avail_out ? bufsize : z.avail_out));

                    if (z.avail_in <= 0)
                    {
                        z.avail_in = 0;
                        nomoreinput = true;
                    }
                }

                err = compress
                    ? z.deflate(flushLevel)
                    : z.inflate(flushLevel);

                if (nomoreinput && err == JZlib.Z_BUF_ERROR)
                    return 0;
                if (err != JZlib.Z_OK && err != JZlib.Z_STREAM_END)
                    // TODO
                    //throw new ZStreamException((compress ? "de" : "in") + "flating: " + z.msg);
                    throw new IOException((compress ? "de" : "in") + "flating: " + z.msg);
                if ((nomoreinput || err == JZlib.Z_STREAM_END) && z.avail_out == count)
                    return 0;
            }
            while (z.avail_out == count && err == JZlib.Z_OK);
            //Console.Error.WriteLine("("+(len-z.avail_out)+")");
            return count - z.avail_out;
        }

        public override int ReadByte()
        {
            if (Read(buf1, 0, 1) <= 0)
                return -1;
            return buf1[0];
        }

        //  public long skip(long n) throws IOException {
        //    int len=512;
        //    if(n<len)
        //      len=(int)n;
        //    byte[] tmp=new byte[len];
        //    return((long)read(tmp));
        //  }

        public virtual long TotalIn
        {
            get { return z.total_in; }
        }

        public virtual long TotalOut
        {
            get { return z.total_out; }
        }
    }
}
