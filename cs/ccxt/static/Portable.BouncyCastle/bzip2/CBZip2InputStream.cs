/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/*
 * This package is based on the work done by Keiron Liddle, Aftex Software
 * <keiron@aftexsw.com> to whom the Ant project is very grateful for his
 * great code.
 */

using System;
using System.Diagnostics;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bzip2
{
	/**
    * An input stream that decompresses from the BZip2 format (with the file
    * header chars) to be read as any other stream.
    *
    * @author <a href="mailto:keiron@aftexsw.com">Keiron Liddle</a>
    *
    * <b>NB:</b> note this class has been modified to read the leading BZ from the
    * start of the BZIP2 stream to make it compatible with other PGP programs.
    */
    public class CBZip2InputStream
        : BaseInputStream 
	{
        /*
        index of the last char in the block, so
        the block size == last + 1.
        */
        private int  last;

        /*
        index in zptr[] of original string after sorting.
        */
        private int  origPtr;

        /*
        always: in the range 0 .. 9.
        The current block size is 100000 * this number.
        */
        private int blockSize100k;

        private int bsBuff;
        private int bsLive;
        private readonly CRC m_blockCrc = new CRC();

        private int nInUse;

        private byte[] seqToUnseq = new byte[256];

        private byte[] m_selectors = new byte[BZip2Constants.MAX_SELECTORS];

        private int[] tt;
        private byte[] ll8;

        /*
        freq table collected to save a pass over the data
        during decompression.
        */
        private int[] unzftab = new int[256];

        private int[][] limit = CreateIntArray(BZip2Constants.N_GROUPS, BZip2Constants.MAX_CODE_LEN + 1);
        private int[][] basev = CreateIntArray(BZip2Constants.N_GROUPS, BZip2Constants.MAX_CODE_LEN + 1);
        private int[][] perm = CreateIntArray(BZip2Constants.N_GROUPS, BZip2Constants.MAX_ALPHA_SIZE);
        private int[] minLens = new int[BZip2Constants.N_GROUPS];

        private Stream bsStream;

        private bool streamEnd = false;

        private int currentByte = -1;

        private const int RAND_PART_B_STATE = 1;
        private const int RAND_PART_C_STATE = 2;
        private const int NO_RAND_PART_B_STATE = 3;
        private const int NO_RAND_PART_C_STATE = 4;

        private int currentState = 0;

        private int m_expectedBlockCrc, m_expectedStreamCrc, m_streamCrc;

        int i2, count, chPrev, ch2;
        int i, tPos;
        int rNToGo = 0;
        int rTPos  = 0;
        int j2;
        int z;

        public CBZip2InputStream(Stream zStream)
        {
            ll8 = null;
            tt = null;
            bsStream = zStream;
            bsLive = 0;
            bsBuff = 0;

            int magic1 = bsStream.ReadByte();
            int magic2 = bsStream.ReadByte();
            int version = bsStream.ReadByte();
            int level = bsStream.ReadByte();
            if (level < 0)
                throw new EndOfStreamException();

            if (magic1 != 'B' | magic2 != 'Z' | version != 'h' | level < '1' | level > '9')
                throw new IOException("Invalid stream header");

            blockSize100k = level - '0';

            int n = BZip2Constants.baseBlockSize * blockSize100k;
            ll8 = new byte[n];
            tt = new int[n];

            m_streamCrc = 0;

            BeginBlock();
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            /*
             * TODO The base class implementation allows to return partial data if/when ReadByte throws. That would be
             * be preferable here too (so don't override), but it would require that exceptions cause this instance to
             * permanently fail, and that needs review.
             */
            int pos = 0;
            while (pos < count)
            {
                int b = ReadByte();
                if (b < 0)
                    break;

                buffer[offset + pos++] = (byte)b;
            }
            return pos;
        }

        public override int ReadByte()
        {
            if (streamEnd)
                return -1;

            int result = currentByte;
            switch (currentState)
            {
            case RAND_PART_B_STATE:
                SetupRandPartB();
                break;
            case RAND_PART_C_STATE:
                SetupRandPartC();
                break;
            case NO_RAND_PART_B_STATE:
                SetupNoRandPartB();
                break;
            case NO_RAND_PART_C_STATE:
                SetupNoRandPartC();
                break;
            default:
                throw new InvalidOperationException();
            }
            return result;
        }

        private void BeginBlock()
        {
            long magic48 = BsGetLong48();
            if (magic48 != 0x314159265359L)
            {
                if (magic48 != 0x177245385090L)
                    throw new IOException("Block header error");

                m_expectedStreamCrc = BsGetInt32();
                if (m_expectedStreamCrc != m_streamCrc)
                    throw new IOException("Stream CRC error");

                BsFinishedWithStream();
                streamEnd = true;
                return;
            }

            m_expectedBlockCrc = BsGetInt32();

            bool blockRandomised = BsGetBit() == 1;

            GetAndMoveToFrontDecode();

            m_blockCrc.Initialise();

            int[] cftab = new int[257];
            {
                int accum = 0;
                cftab[0] = 0;
                for (i = 0; i < 256; ++i)
                {
                    accum += unzftab[i];
                    cftab[i + 1] = accum;
                }
                if (accum != (last + 1))
                    throw new InvalidOperationException();
            }

            for (i = 0; i <= last; i++)
            {
                byte ch = ll8[i];
                tt[cftab[ch]++] = i;
            }

            tPos = tt[origPtr];

            count = 0;
            i2 = 0;
            ch2 = 256;   /* not a char and not EOF */

            if (blockRandomised)
            {
                rNToGo = 0;
                rTPos = 0;
                SetupRandPartA();
            }
            else
            {
                SetupNoRandPartA();
            }
        }

        private void EndBlock()
        {
            int blockFinalCrc = m_blockCrc.GetFinal();
            if (m_expectedBlockCrc != blockFinalCrc)
                throw new IOException("Block CRC error");

            m_streamCrc = Integers.RotateLeft(m_streamCrc, 1) ^ blockFinalCrc;
        }

        private void BsFinishedWithStream()
        {
            try
            {
                if (this.bsStream != null)
                {
                    Platform.Dispose(this.bsStream);
                    this.bsStream = null;
                }
            }
            catch
            {
                //ignore
            }
        }

        private int BsGetBit()
        {
            if (bsLive == 0)
            {
                bsBuff = RequireByte();
                bsLive = 7;
                return (int)((uint)bsBuff >> 7);
            }

            --bsLive;

            return (bsBuff >> bsLive) & 1;
        }

        private int BsGetBits(int n)
        {
            Debug.Assert(1 <= n && n <= 24);

            while (bsLive < n)
            {
                bsBuff = (bsBuff << 8) | RequireByte();
                bsLive += 8;
            }

            bsLive -= n;

            return (bsBuff >> bsLive) & ((1 << n) - 1);
        }

        private int BsGetBitsSmall(int n)
        {
            Debug.Assert(1 <= n && n <= 8);

            if (bsLive < n)
            {
                bsBuff = (bsBuff << 8) | RequireByte();
                bsLive += 8;
            }

            bsLive -= n;

            return (bsBuff >> bsLive) & ((1 << n) - 1);
        }

        private int BsGetInt32()
        {
            int u = BsGetBits(16) << 16;
            return u | BsGetBits(16);
        }

        private long BsGetLong48()
        {
            long u = (long)BsGetBits(24) << 24;
            return u | (long)BsGetBits(24);
        }

        private void HbCreateDecodeTables(int[] limit, int[] basev, int[] perm, byte[] length, int minLen, int maxLen,
            int alphaSize)
        {
            Array.Clear(basev, 0, basev.Length);
            Array.Clear(limit, 0, limit.Length);

            int pp = 0, baseVal = 0;
            for (int i = minLen; i <= maxLen; i++)
            {
                for (int j = 0; j < alphaSize; j++)
                {
                    if (length[j] == i)
                    {
                        perm[pp++] = j;
                    }
                }
                basev[i] = baseVal;
                limit[i] = baseVal + pp;
                baseVal += baseVal + pp;
            }
        }

        private int RecvDecodingTables()
        {
            int i, j;

            nInUse = 0;

            /* Receive the mapping table */
            int inUse16 = BsGetBits(16);

            for (i = 0; i < 16; ++i)
            {
                if ((inUse16 & (0x8000 >> i)) != 0)
                {
                    int inUse = BsGetBits(16);

                    int i16 = i * 16;
                    for (j = 0; j < 16; ++j)
                    {
                        if ((inUse & (0x8000 >> j)) != 0)
                        {
                            seqToUnseq[nInUse++] = (byte)(i16 + j);
                        }
                    }
                }
            }

            if (nInUse < 1)
                throw new InvalidOperationException();

            int alphaSize = nInUse + 2;

            /* Now the selectors */
            int nGroups = BsGetBitsSmall(3);
            if (nGroups < 2 || nGroups > BZip2Constants.N_GROUPS)
                throw new InvalidOperationException();

            int nSelectors = BsGetBits(15);
            if (nSelectors < 1)
                throw new InvalidOperationException();

            uint mtfGroups = 0x00543210U;
            for (i = 0; i < nSelectors; i++)
            {
                int mtfSelector = 0;
                while (BsGetBit() == 1)
                {
                    if (++mtfSelector >= nGroups)
                        throw new InvalidOperationException();
                }

                // Ignore declared selectors in excess of the maximum usable number
                if (i >= BZip2Constants.MAX_SELECTORS)
                    continue;

                // Undo the MTF value for the selector.
                switch (mtfSelector)
                {
                case 0:
                    break;
                case 1:
                    mtfGroups = (mtfGroups >>  4) & 0x00000FU | (mtfGroups << 4) & 0x0000F0U | mtfGroups & 0xFFFF00U;
                    break;
                case 2:
                    mtfGroups = (mtfGroups >>  8) & 0x00000FU | (mtfGroups << 4) & 0x000FF0U | mtfGroups & 0xFFF000U;
                    break;
                case 3:
                    mtfGroups = (mtfGroups >> 12) & 0x00000FU | (mtfGroups << 4) & 0x00FFF0U | mtfGroups & 0xFF0000U;
                    break;
                case 4:
                    mtfGroups = (mtfGroups >> 16) & 0x00000FU | (mtfGroups << 4) & 0x0FFFF0U | mtfGroups & 0xF00000U;
                    break;
                case 5:
                    mtfGroups = (mtfGroups >> 20) & 0x00000FU | (mtfGroups << 4) & 0xFFFFF0U;
                    break;
                default:
                    throw new InvalidOperationException();
                }

                m_selectors[i] = (byte)(mtfGroups & 0xF);
            }

            byte[] len_t = new byte[alphaSize];

            /* Now the coding tables */
            for (int t = 0; t < nGroups; t++)
            {
                int maxLen = 0, minLen = 32;
                int curr = BsGetBitsSmall(5);
                if ((curr < 1) | (curr > BZip2Constants.MAX_CODE_LEN))
                    throw new InvalidOperationException();

                for (i = 0; i < alphaSize; i++)
                {
                    int markerBit = BsGetBit();
                    while (markerBit != 0)
                    {
                        int nextTwoBits = BsGetBitsSmall(2);
                        curr += 1 - (nextTwoBits & 2);
                        if ((curr < 1) | (curr > BZip2Constants.MAX_CODE_LEN))
                            throw new InvalidOperationException();
                        markerBit = nextTwoBits & 1;
                    }

                    len_t[i] = (byte)curr;
                    maxLen = System.Math.Max(maxLen, curr);
                    minLen = System.Math.Min(minLen, curr);
                }

                /* Create the Huffman decoding tables */
                HbCreateDecodeTables(limit[t], basev[t], perm[t], len_t, minLen, maxLen, alphaSize);
                minLens[t] = minLen;
            }

            return nSelectors;
        }

        private void GetAndMoveToFrontDecode()
        {
            int i, j, nextSym;

            int limitLast = BZip2Constants.baseBlockSize * blockSize100k;

            origPtr = BsGetBits(24);
            if (origPtr > 10 + limitLast)
                throw new InvalidOperationException();

            int nSelectors = RecvDecodingTables();

            int alphaSize = nInUse + 2;
            int EOB = nInUse + 1;

            /*
            Setting up the unzftab entries here is not strictly
            necessary, but it does save having to do it later
            in a separate pass, and so saves a block's worth of
            cache misses.
            */
            Array.Clear(unzftab, 0, unzftab.Length);

            byte[] yy = new byte[nInUse];
            for (i = 0; i < nInUse; ++i)
            {
                yy[i] = seqToUnseq[i];
            }

            last = -1;

            int groupNo = 0;
            int groupPos = BZip2Constants.G_SIZE - 1;
            int groupSel = m_selectors[groupNo];
            int groupMinLen = minLens[groupSel];
            int[] groupLimits = limit[groupSel];
            int[] groupPerm = perm[groupSel];
            int[] groupBase = basev[groupSel];

            {
                int zn = groupMinLen;
                int zvec = BsGetBits(groupMinLen);
                while (zvec >= groupLimits[zn])
                {
                    if (++zn > BZip2Constants.MAX_CODE_LEN)
                        throw new InvalidOperationException();

                    zvec = (zvec << 1) | BsGetBit();
                }
                int permIndex = zvec - groupBase[zn];
                if (permIndex >= alphaSize)
                    throw new InvalidOperationException();

                nextSym = groupPerm[permIndex];
            }

            while (nextSym != EOB)
            {
                //if (nextSym == BZip2Constants.RUNA || nextSym == BZip2Constants.RUNB)
                if (nextSym <= BZip2Constants.RUNB)
                {
                    int n = 1, s = 0;
                    do
                    {
                        if (n > 1024 * 1024)
                            throw new InvalidOperationException();

                        s += n << nextSym;
                        n <<= 1;

                        {
                            if (groupPos == 0)
                            {
                                if (++groupNo >= nSelectors)
                                    throw new InvalidOperationException();

                                groupPos = BZip2Constants.G_SIZE;
                                groupSel = m_selectors[groupNo];
                                groupMinLen = minLens[groupSel];
                                groupLimits = limit[groupSel];
                                groupPerm = perm[groupSel];
                                groupBase = basev[groupSel];
                            }
                            groupPos--;

                            int zn = groupMinLen;
                            int zvec = BsGetBits(groupMinLen);
                            while (zvec >= groupLimits[zn])
                            {
                                if (++zn > BZip2Constants.MAX_CODE_LEN)
                                    throw new InvalidOperationException();

                                zvec = (zvec << 1) | BsGetBit();
                            }
                            int permIndex = zvec - groupBase[zn];
                            if (permIndex >= alphaSize)
                                throw new InvalidOperationException();

                            nextSym = groupPerm[permIndex];
                        }
                    }
                    //while (nextSym == BZip2Constants.RUNA || nextSym == BZip2Constants.RUNB);
                    while (nextSym <= BZip2Constants.RUNB);

                    byte ch = yy[0];
                    unzftab[ch] += s;

                    if (last >= limitLast - s)
                        throw new InvalidOperationException("Block overrun");

                    while (--s >= 0)
                    {
                        ll8[++last] = ch;
                    }

                    continue;
                }
                else
                {
                    if (++last >= limitLast)
                        throw new InvalidOperationException("Block overrun");

                    byte tmp = yy[nextSym - 1];
                    unzftab[tmp]++;
                    ll8[last] = tmp;

                    /*
                     * This loop is hammered during decompression, hence avoid
                     * native method call overhead of Array.Copy for very
                     * small ranges to copy.
                     */
                    if (nextSym <= 16)
                    {
                        for (j = nextSym - 1; j > 0; --j)
                        {
                            yy[j] = yy[j - 1];
                        }
                    }
                    else
                    {
                        Array.Copy(yy, 0, yy, 1, nextSym - 1);
                    }

                    yy[0] = tmp;

                    {
                        if (groupPos == 0)
                        {
                            if (++groupNo >= nSelectors)
                                throw new InvalidOperationException();

                            groupPos = BZip2Constants.G_SIZE;
                            groupSel = m_selectors[groupNo];
                            groupMinLen = minLens[groupSel];
                            groupLimits = limit[groupSel];
                            groupPerm = perm[groupSel];
                            groupBase = basev[groupSel];
                        }
                        groupPos--;

                        int zn = groupMinLen;
                        int zvec = BsGetBits(groupMinLen);
                        while (zvec >= groupLimits[zn])
                        {
                            if (++zn > BZip2Constants.MAX_CODE_LEN)
                                throw new InvalidOperationException();

                            zvec = (zvec << 1) | BsGetBit();
                        }
                        int permIndex = zvec - groupBase[zn];
                        if (permIndex >= alphaSize)
                            throw new InvalidOperationException();

                        nextSym = groupPerm[permIndex];
                    }
                    continue;
                }
            }

            if (origPtr > last)
                throw new InvalidOperationException();

            // Check unzftab entries are in range.
            {
                int nblock = last + 1;
                int check = 0;

                for (i = 0; i <= 255; i++)
                {
                    int t = unzftab[i];
                    check |= t;
                    check |= nblock - t;
                }
                if (check < 0)
                    throw new InvalidOperationException();
            }
        }

        private int RequireByte()
        {
            int b = bsStream.ReadByte();
            if (b < 0)
                throw new EndOfStreamException();
            return b & 0xFF;
        }

        private void SetupRandPartA()
        {
            if (i2 <= last)
            {
                chPrev = ch2;
                ch2 = ll8[tPos];
                tPos = tt[tPos];
                if (rNToGo == 0)
                {
                    rNToGo = CBZip2OutputStream.RNums[rTPos++];
                    rTPos &= 0x1FF;
                }
                rNToGo--;
                ch2 ^= rNToGo == 1 ? 1 : 0;
                i2++;

                currentByte = ch2;
                currentState = RAND_PART_B_STATE;
                m_blockCrc.Update((byte)ch2);
            }
            else
            {
                EndBlock();
                BeginBlock();
            }
        }

        private void SetupNoRandPartA()
        {
            if (i2 <= last)
            {
                chPrev = ch2;
                ch2 = ll8[tPos];
                tPos = tt[tPos];
                i2++;

                currentByte = ch2;
                currentState = NO_RAND_PART_B_STATE;
                m_blockCrc.Update((byte)ch2);
            }
            else
            {
                EndBlock();
                BeginBlock();
            }
        }

        private void SetupRandPartB()
        {
            if (ch2 != chPrev)
            {
                count = 1;
                SetupRandPartA();
            }
            else if (++count < 4)
            {
                SetupRandPartA();
            }
            else
            {
                z = ll8[tPos];
                tPos = tt[tPos];
                if (rNToGo == 0)
                {
                    rNToGo = CBZip2OutputStream.RNums[rTPos++];
                    rTPos &= 0x1FF;
                }
                rNToGo--;
                z ^= rNToGo == 1 ? 1 : 0;
                j2 = 0;
                currentState = RAND_PART_C_STATE;
                SetupRandPartC();
            }
        }

        private void SetupNoRandPartB()
        {
            if (ch2 != chPrev)
            {
                count = 1;
                SetupNoRandPartA();
            }
            else if (++count < 4)
            {
                SetupNoRandPartA();
            }
            else
            {
                z = ll8[tPos];
                tPos = tt[tPos];
                currentState = NO_RAND_PART_C_STATE;
                j2 = 0;
                SetupNoRandPartC();
            }
        }

        private void SetupRandPartC()
        {
            if (j2 < z)
            {
                currentByte = ch2;
                m_blockCrc.Update((byte)ch2);
                j2++;
            }
            else
            {
                i2++;
                count = 0;
                SetupRandPartA();
            }
        }

        private void SetupNoRandPartC()
        {
            if (j2 < z)
            {
                currentByte = ch2;
                m_blockCrc.Update((byte)ch2);
                j2++;
            }
            else
            {
                i2++;
                count = 0;
                SetupNoRandPartA();
            }
        }

        internal static int[][] CreateIntArray(int n1, int n2)
        {
            int[][] a = new int[n1][];
            for (int k = 0; k < n1; ++k)
            {
                a[k] = new int[n2];
            }
            return a;
        }
    }
}
