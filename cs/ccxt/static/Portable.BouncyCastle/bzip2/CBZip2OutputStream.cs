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
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bzip2
{
	/**
    * An output stream that compresses into the BZip2 format (with the file
    * header chars) into another stream.
    *
    * @author <a href="mailto:keiron@aftexsw.com">Keiron Liddle</a>
    *
    * TODO:    Update to BZip2 1.0.1
    * <b>NB:</b> note this class has been modified to add a leading BZ to the
    * start of the BZIP2 stream to make it compatible with other PGP programs.
    */
    public class CBZip2OutputStream
        : BaseOutputStream 
	{
        protected const int SETMASK = 1 << 21;
        protected const int CLEARMASK = ~SETMASK;
        protected const int GREATER_ICOST = 15;
        protected const int LESSER_ICOST = 0;
        protected const int SMALL_THRESH = 20;
        protected const int DEPTH_THRESH = 10;

        internal static readonly ushort[] RNums = {
            619, 720, 127, 481, 931, 816, 813, 233, 566, 247, 985, 724, 205, 454, 863, 491, 741, 242, 949, 214, 733,
            859, 335, 708, 621, 574, 73, 654, 730, 472, 419, 436, 278, 496, 867, 210, 399, 680, 480, 51, 878, 465, 811,
            169, 869, 675, 611, 697, 867, 561, 862, 687, 507, 283, 482, 129, 807, 591, 733, 623, 150, 238, 59, 379, 684,
            877, 625, 169, 643, 105, 170, 607, 520, 932, 727, 476, 693, 425, 174, 647, 73, 122, 335, 530, 442, 853, 695,
            249, 445, 515, 909, 545, 703, 919, 874, 474, 882, 500, 594, 612, 641, 801, 220, 162, 819, 984, 589, 513,
            495, 799, 161, 604, 958, 533, 221, 400, 386, 867, 600, 782, 382, 596, 414, 171, 516, 375, 682, 485, 911,
            276, 98, 553, 163, 354, 666, 933, 424, 341, 533, 870, 227, 730, 475, 186, 263, 647, 537, 686, 600, 224, 469,
            68, 770, 919, 190, 373, 294, 822, 808, 206, 184, 943, 795, 384, 383, 461, 404, 758, 839, 887, 715, 67, 618,
            276, 204, 918, 873, 777, 604, 560, 951, 160, 578, 722, 79, 804, 96, 409, 713, 940, 652, 934, 970, 447, 318,
            353, 859, 672, 112, 785, 645, 863, 803, 350, 139, 93, 354, 99, 820, 908, 609, 772, 154, 274, 580, 184, 79,
            626, 630, 742, 653, 282, 762, 623, 680, 81, 927, 626, 789, 125, 411, 521, 938, 300, 821, 78, 343, 175, 128,
            250, 170, 774, 972, 275, 999, 639, 495, 78, 352, 126, 857, 956, 358, 619, 580, 124, 737, 594, 701, 612, 669,
            112, 134, 694, 363, 992, 809, 743, 168, 974, 944, 375, 748, 52, 600, 747, 642, 182, 862, 81, 344, 805, 988,
            739, 511, 655, 814, 334, 249, 515, 897, 955, 664, 981, 649, 113, 974, 459, 893, 228, 433, 837, 553, 268,
            926, 240, 102, 654, 459, 51, 686, 754, 806, 760, 493, 403, 415, 394, 687, 700, 946, 670, 656, 610, 738, 392,
            760, 799, 887, 653, 978, 321, 576, 617, 626, 502, 894, 679, 243, 440, 680, 879, 194, 572, 640, 724, 926, 56,
            204, 700, 707, 151, 457, 449, 797, 195, 791, 558, 945, 679, 297, 59, 87, 824, 713, 663, 412, 693, 342, 606,
            134, 108, 571, 364, 631, 212, 174, 643, 304, 329, 343, 97, 430, 751, 497, 314, 983, 374, 822, 928, 140, 206,
            73, 263, 980, 736, 876, 478, 430, 305, 170, 514, 364, 692, 829, 82, 855, 953, 676, 246, 369, 970, 294, 750,
            807, 827, 150, 790, 288, 923, 804, 378, 215, 828, 592, 281, 565, 555, 710, 82, 896, 831, 547, 261, 524, 462,
            293, 465, 502, 56, 661, 821, 976, 991, 658, 869, 905, 758, 745, 193, 768, 550, 608, 933, 378, 286, 215, 979,
            792, 961, 61, 688, 793, 644, 986, 403, 106, 366, 905, 644, 372, 567, 466, 434, 645, 210, 389, 550, 919, 135,
            780, 773, 635, 389, 707, 100, 626, 958, 165, 504, 920, 176, 193, 713, 857, 265, 203, 50, 668, 108, 645, 990,
            626, 197, 510, 357, 358, 850, 858, 364, 936, 638 };

        /*
         * Knuth's increments seem to work better than Incerpi-Sedgewick here, possibly because the number of elements
         * to sort is usually small, typically <= 20.
         */
        private static readonly int[] Incs = { 1, 4, 13, 40, 121, 364, 1093, 3280, 9841, 29524, 88573, 265720, 797161,
            2391484 };

        private bool finished;

        protected static void HbMakeCodeLengths(byte[] len, int[] freq, int alphaSize, int maxLen)
        {
            /*
            Nodes and heap entries run from 1.  Entry 0
            for both the heap and nodes is a sentinel.
            */
            int[] heap = new int[BZip2Constants.MAX_ALPHA_SIZE + 2];
            int[] weight = new int[BZip2Constants.MAX_ALPHA_SIZE * 2];
            int[] parent = new int[BZip2Constants.MAX_ALPHA_SIZE * 2];

            for (int i = 0; i < alphaSize; i++)
            {
                weight[i + 1] = (freq[i] == 0 ? 1 : freq[i]) << 8;
            }

            while (true)
            {
                int nNodes = alphaSize;
                int nHeap = 0;

                heap[0] = 0;
                weight[0] = 0;
                parent[0] = -2;

                for (int i = 1; i <= alphaSize; i++)
                {
                    parent[i] = -1;
                    heap[++nHeap] = i;
                    {
                        int zz = nHeap;
                        int tmp = heap[zz];
                        while (weight[tmp] < weight[heap[zz >> 1]])
                        {
                            heap[zz] = heap[zz >> 1];
                            zz >>= 1;
                        }
                        heap[zz] = tmp;
                    }
                }
                if (!(nHeap < (BZip2Constants.MAX_ALPHA_SIZE + 2)))
                    throw new InvalidOperationException();

                while (nHeap > 1)
                {
                    int n1 = heap[1];
                    heap[1] = heap[nHeap--];
                    {
                        int zz = 1;
                        int tmp = heap[zz];
                        while (true) 
                        {
                            int yy = zz << 1;
                            if (yy > nHeap)
                                break;

                            if (yy < nHeap
                                && weight[heap[yy + 1]] < weight[heap[yy]])
                            {
                                yy++;
                            }

                            if (weight[tmp] < weight[heap[yy]])
                                break;

                            heap[zz] = heap[yy];
                            zz = yy;
                        }
                        heap[zz] = tmp;
                    }
                    int n2 = heap[1];
                    heap[1] = heap[nHeap--];
                    {
                        int zz = 1;
                        int tmp = heap[zz];
                        while (true)
                        {
                            int yy = zz << 1;
                            if (yy > nHeap)
                                break;

                            if (yy < nHeap
                                && weight[heap[yy + 1]] < weight[heap[yy]])
                            {
                                yy++;
                            }

                            if (weight[tmp] < weight[heap[yy]])
                                break;

                            heap[zz] = heap[yy];
                            zz = yy;
                        }
                        heap[zz] = tmp;
                    }
                    nNodes++;
                    parent[n1] = parent[n2] = nNodes;

                    weight[nNodes] = (int)((uint)((weight[n1] & 0xffffff00)
                                    + (weight[n2] & 0xffffff00))
                        | (uint)(1 + (((weight[n1] & 0x000000ff) >
                                (weight[n2] & 0x000000ff)) ?
                                (weight[n1] & 0x000000ff) :
                                (weight[n2] & 0x000000ff))));

                    parent[nNodes] = -1;
                    heap[++nHeap] = nNodes;
                    {
                        int zz = nHeap;
                        int tmp = heap[zz];
                        while (weight[tmp] < weight[heap[zz >> 1]])
                        {
                            heap[zz] = heap[zz >> 1];
                            zz >>= 1;
                        }
                        heap[zz] = tmp;
                    }
                }
                if (!(nNodes < (BZip2Constants.MAX_ALPHA_SIZE * 2)))
                    throw new InvalidOperationException();

                //bool tooLong = false;
                int tooLongBits = 0;
                for (int i = 1; i <= alphaSize; i++)
                {
                    int j = 0;
                    int k = i;
                    while (parent[k] >= 0)
                    {
                        k = parent[k];
                        j++;
                    }
                    len[i - 1] = (byte)j;
                    //tooLong |= j > maxLen;
                    tooLongBits |= maxLen - j;
                }

                //if (!tooLong)
                if (tooLongBits >= 0)
                    break;

                for (int i = 1; i <= alphaSize; i++)
                {
                    int j = weight[i] >> 8;
                    j = 1 + (j / 2);
                    weight[i] = j << 8;
                }
            }
        }

        /*
         * number of characters in the block
         */
        int count;

        /*
        index in zptr[] of original string after sorting.
        */
        int origPtr;

        /*
        always: in the range 0 .. 9.
        The current block size is 100000 * this number.
        */
        private readonly int blockSize100k;
        private readonly int allowableBlockSize;

        bool blockRandomised;
        private readonly IList<StackElem> blocksortStack = new List<StackElem>();

        int bsBuff;
        int bsLivePos;
        private readonly CRC m_blockCrc = new CRC();

        private bool[] inUse = new bool[256];
        private int nInUse;

        private byte[] m_selectors = new byte[BZip2Constants.MAX_SELECTORS];

        private byte[] blockBytes;
        private ushort[] quadrantShorts;
        private int[] zptr;
        private int[] szptr;
        private int[] ftab;

        private int nMTF;

        private int[] mtfFreq = new int[BZip2Constants.MAX_ALPHA_SIZE];

        /*
        * Used when sorting.  If too many long comparisons
        * happen, we stop sorting, randomise the block
        * slightly, and try again.
        */
        private int workFactor;
        private int workDone;
        private int workLimit;
        private bool firstAttempt;

        private int currentByte = -1;
        private int runLength = 0;
        private int m_streamCrc;

        public CBZip2OutputStream(Stream outStream)
            : this(outStream, 9)
        {
        }

        public CBZip2OutputStream(Stream outStream, int blockSize)
        {
            blockBytes = null;
            quadrantShorts = null;
            zptr = null;
            ftab = null;

            outStream.WriteByte((byte)'B');
            outStream.WriteByte((byte)'Z');

            bsStream = outStream;
            bsBuff = 0;
            bsLivePos = 32;

            workFactor = 50;
            if (blockSize > 9)
            {
                blockSize = 9;
            }
            else if (blockSize < 1)
            {
                blockSize = 1;
            }
            blockSize100k = blockSize;

            /* 20 is just a paranoia constant */
            allowableBlockSize = BZip2Constants.baseBlockSize * blockSize100k - 20;

            int n = BZip2Constants.baseBlockSize * blockSize100k;
            blockBytes = new byte[(n + 1 + BZip2Constants.NUM_OVERSHOOT_BYTES)];
            quadrantShorts = new ushort[(n + 1 + BZip2Constants.NUM_OVERSHOOT_BYTES)];
            zptr = new int[n];
            ftab = new int[65537];

            /*
            The back end needs a place to store the MTF values
            whilst it calculates the coding tables.  We could
            put them in the zptr array.  However, these values
            will fit in a short, so we overlay szptr at the
            start of zptr, in the hope of reducing the number
            of cache misses induced by the multiple traversals
            of the MTF values when calculating coding tables.
            Seems to improve compression speed by about 1%.
            */
            // NOTE: We can't "overlay" in C#, so we just share zptr
            szptr = zptr;

            // Write `magic' bytes h indicating file-format == huffmanised, followed by a digit indicating blockSize100k
            outStream.WriteByte((byte)'h');
            outStream.WriteByte((byte)('0' + blockSize100k));

            m_streamCrc = 0;

            InitBlock();
        }

        /**
        *
        * modified by Oliver Merkel, 010128
        *
        */
        public override void WriteByte(byte value)
        {
            if (currentByte == value)
            {
                if (++runLength > 254)
                {
                    WriteRun();
                    currentByte = -1;
                    runLength = 0;
                }
                return;
            }

            if (currentByte >= 0)
            {
                WriteRun();
            }

            currentByte = value;
            runLength = 1;
        }

        private void WriteRun()
        {
            if (count > allowableBlockSize)
            {
                EndBlock();
                InitBlock();
            }

            inUse[currentByte] = true;

            switch (runLength)
            {
            case 1:
                blockBytes[++count] = (byte)currentByte;
                m_blockCrc.Update((byte)currentByte);
                break;
            case 2:
                blockBytes[++count] = (byte)currentByte;
                blockBytes[++count] = (byte)currentByte;
                m_blockCrc.Update((byte)currentByte);
                m_blockCrc.Update((byte)currentByte);
                break;
            case 3:
                blockBytes[++count] = (byte)currentByte;
                blockBytes[++count] = (byte)currentByte;
                blockBytes[++count] = (byte)currentByte;
                m_blockCrc.Update((byte)currentByte);
                m_blockCrc.Update((byte)currentByte);
                m_blockCrc.Update((byte)currentByte);
                break;
            default:
                blockBytes[++count] = (byte)currentByte;
                blockBytes[++count] = (byte)currentByte;
                blockBytes[++count] = (byte)currentByte;
                blockBytes[++count] = (byte)currentByte;
                blockBytes[++count] = (byte)(runLength - 4);
                inUse[runLength - 4] = true;
                m_blockCrc.UpdateRun((byte)currentByte, runLength);
                break;
            }
        }

        bool closed = false;

        protected void Detach(bool disposing)
        {
            if (disposing)
            {
                if (!closed)
                {
                    Finish();
                    closed = true;
                }
            }
            base.Dispose(disposing);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (!closed)
                {
                    Finish();
                    closed = true;
                    Platform.Dispose(this.bsStream);
                }
            }
            base.Dispose(disposing);
        }

        public void Finish()
        {
            if (finished)
                return;

            if (runLength > 0)
            {
                WriteRun();
            }
            currentByte = -1;
            if (count > 0)
            {
                EndBlock();
            }
            EndCompression();
            finished = true;
            Flush();
        }
        
        public override void Flush()
        {
            bsStream.Flush();
        }

        private void InitBlock()
        {
            m_blockCrc.Initialise();
            count = 0;

            for (int i = 0; i < 256; i++)
            {
                inUse[i] = false;
            }
        }

        private void EndBlock()
        {
            int blockFinalCrc = m_blockCrc.GetFinal();
            m_streamCrc = Integers.RotateLeft(m_streamCrc, 1) ^ blockFinalCrc;

            /* sort the block and establish posn of original string */
            DoReversibleTransformation();

            /*
            A 6-byte block header, the value chosen arbitrarily
            as 0x314159265359 :-).  A 32 bit value does not really
            give a strong enough guarantee that the value will not
            appear by chance in the compressed datastream.  Worst-case
            probability of this event, for a 900k block, is about
            2.0e-3 for 32 bits, 1.0e-5 for 40 bits and 4.0e-8 for 48 bits.
            For a compressed file of size 100Gb -- about 100000 blocks --
            only a 48-bit marker will do.  NB: normal compression/
            decompression do *not* rely on these statistical properties.
            They are only important when trying to recover blocks from
            damaged files.
            */
            BsPutLong48(0x314159265359L);

            /* Now the block's CRC, so it is in a known place. */
            BsPutInt32(blockFinalCrc);

            /* Now a single bit indicating randomisation. */
            BsPutBit(blockRandomised ? 1 : 0);

            /* Finally, block's contents proper. */
            MoveToFrontCodeAndSend();
        }

        private void EndCompression()
        {
            /*
            Now another magic 48-bit number, 0x177245385090, to
            indicate the end of the last block.  (Sqrt(pi), if
            you want to know.  I did want to use e, but it contains
            too much repetition -- 27 18 28 18 28 46 -- for me
            to feel statistically comfortable.  Call me paranoid.)
            */
            BsPutLong48(0x177245385090L);

            BsPutInt32(m_streamCrc);

            BsFinishedWithStream();
        }

        private void HbAssignCodes(int[] code, byte[] length, int minLen, int maxLen, int alphaSize)
        {
            int vec = 0;
            for (int n = minLen; n <= maxLen; n++)
            {
                for (int i = 0; i < alphaSize; i++)
                {
                    if (length[i] == n)
                    {
                        code[i] = vec++;
                    }
                }
                vec <<= 1;
            }
        }

        private void BsFinishedWithStream()
        {
            if (bsLivePos < 32)
            {
                bsStream.WriteByte((byte)(bsBuff >> 24));
                bsBuff = 0;
                bsLivePos = 32;
            }
        }

        private void BsPutBit(int v)
        {
            --bsLivePos;
            bsBuff |= v << bsLivePos;

            if (bsLivePos <= 24)
            {
                bsStream.WriteByte((byte)(bsBuff >> 24));
                bsBuff <<= 8;
                bsLivePos += 8;
            }
        }

        private void BsPutBits(int n, int v)
        {
            Debug.Assert(1 <= n && n <= 24);

            bsLivePos -= n;
            bsBuff |= v << bsLivePos;

            while (bsLivePos <= 24)
            {
                bsStream.WriteByte((byte)(bsBuff >> 24));
                bsBuff <<= 8;
                bsLivePos += 8;
            }
        }

        private void BsPutBitsSmall(int n, int v)
        {
            Debug.Assert(1 <= n && n <= 8);

            bsLivePos -= n;
            bsBuff |= v << bsLivePos;

            if (bsLivePos <= 24)
            {
                bsStream.WriteByte((byte)(bsBuff >> 24));
                bsBuff <<= 8;
                bsLivePos += 8;
            }
        }

        private void BsPutInt32(int u)
        {
            BsPutBits(16, (u >> 16) & 0xFFFF);
            BsPutBits(16, u & 0xFFFF);
        }

        private void BsPutLong48(long u)
        {
            BsPutBits(24, (int)(u >> 24) & 0xFFFFFF);
            BsPutBits(24, (int)u & 0xFFFFFF);
        }

        private void SendMtfValues()
        {

            int v, t, i, j, bt, bc, iter;

            int alphaSize = nInUse + 2;

            /* Decide how many coding tables to use */
            if (nMTF <= 0)
                throw new InvalidOperationException();

            int nGroups;
            if (nMTF < 200)
            {
                nGroups = 2;
            }
            else if (nMTF < 600)
            {
                nGroups = 3;
            }
            else if (nMTF < 1200)
            {
                nGroups = 4;
            }
            else if (nMTF < 2400)
            {
                nGroups = 5;
            }
            else
            {
                nGroups = 6;
            }

            byte[][] len = CreateByteArray(nGroups, alphaSize);
            for (t = 0; t < nGroups; t++)
            {
                Arrays.Fill(len[t], GREATER_ICOST);
            }

            /* Generate an initial set of coding tables */
            {
                int nPart = nGroups;
                int remF = nMTF;
                int ge = -1;
                while (nPart > 0)
                {
                    int gs = ge + 1;
                    int aFreq = 0, tFreq = remF / nPart;
                    while (aFreq < tFreq && ge < alphaSize - 1)
                    {
                        aFreq += mtfFreq[++ge];
                    }

                    if (ge > gs && nPart != nGroups && nPart != 1
                        && ((nGroups - nPart) % 2 == 1))
                    {
                        aFreq -= mtfFreq[ge--];
                    }

                    byte[] len_np = len[nPart - 1];
                    for (v = 0; v < alphaSize; v++)
                    {
                        if (v >= gs && v <= ge)
                        {
                            len_np[v] = LESSER_ICOST;
                        }
                        else
                        {
                            len_np[v] = GREATER_ICOST;
                        }
                    }

                    nPart--;
                    remF -= aFreq;
                }
            }

            int[][] rfreq = CBZip2InputStream.CreateIntArray(BZip2Constants.N_GROUPS, BZip2Constants.MAX_ALPHA_SIZE);
            int[] fave = new int[BZip2Constants.N_GROUPS];
            short[] cost = new short[BZip2Constants.N_GROUPS];

            // Iterate up to N_ITERS times to improve the tables.
            int nSelectors = 0;
            for (iter = 0; iter < BZip2Constants.N_ITERS; iter++)
            {
                for (t = 0; t < nGroups; t++)
                {
                    fave[t] = 0;

                    int[] rfreq_t = rfreq[t];
                    for (v = 0; v < alphaSize; v++)
                    {
                        rfreq_t[v] = 0;
                    }
                }

                nSelectors = 0;
                int gs = 0;
                while (gs < nMTF)
                {
                    /* Set group start & end marks. */

                    /*
                     * Calculate the cost of this group as coded by each of the coding tables.
                     */

                    int ge = System.Math.Min(gs + BZip2Constants.G_SIZE - 1, nMTF - 1);

                    if (nGroups == 6)
                    {
                        byte[] len_0 = len[0], len_1 = len[1], len_2 = len[2], len_3 = len[3], len_4 = len[4], len_5 = len[5];
                        short cost0 = 0, cost1 = 0, cost2 = 0, cost3 = 0, cost4 = 0, cost5 = 0;

                        for (i = gs; i <= ge; i++)
                        {
                            int icv = szptr[i];
                            cost0 += len_0[icv];
                            cost1 += len_1[icv];
                            cost2 += len_2[icv];
                            cost3 += len_3[icv];
                            cost4 += len_4[icv];
                            cost5 += len_5[icv];
                        }

                        cost[0] = cost0;
                        cost[1] = cost1;
                        cost[2] = cost2;
                        cost[3] = cost3;
                        cost[4] = cost4;
                        cost[5] = cost5;
                    }
                    else
                    {
                        for (t = 0; t < nGroups; t++)
                        {
                            cost[t] = 0;
                        }

                        for (i = gs; i <= ge; i++)
                        {
                            int icv = szptr[i];
                            for (t = 0; t < nGroups; t++)
                            {
                                cost[t] += len[t][icv];
                            }
                        }
                    }

                    /*
                    Find the coding table which is best for this group,
                    and record its identity in the selector table.
                    */
                    bc = cost[0];
                    bt = 0;
                    for (t = 1; t < nGroups; t++)
                    {
                        short cost_t = cost[t];
                        if (cost_t < bc)
                        {
                            bc = cost_t;
                            bt = t;
                        }
                    }
                    fave[bt]++;
                    m_selectors[nSelectors] = (byte)bt;
                    nSelectors++;

                    /*
                    Increment the symbol frequencies for the selected table.
                    */
                    int[] rfreq_bt = rfreq[bt];
                    for (i = gs; i <= ge; i++)
                    {
                        rfreq_bt[szptr[i]]++;
                    }

                    gs = ge + 1;
                }

                /*
                Recompute the tables based on the accumulated frequencies.
                */
                for (t = 0; t < nGroups; t++)
                {
                    HbMakeCodeLengths(len[t], rfreq[t], alphaSize, BZip2Constants.MAX_CODE_LEN_GEN);
                }
            }

            if (nGroups >= 8 || nGroups > BZip2Constants.N_GROUPS)
                throw new InvalidOperationException();
            if (nSelectors >= 32768 || nSelectors > BZip2Constants.MAX_SELECTORS)
                throw new InvalidOperationException();

            int[][] code = CBZip2InputStream.CreateIntArray(BZip2Constants.N_GROUPS, BZip2Constants.MAX_ALPHA_SIZE);

            /* Assign actual codes for the tables. */
            for (t = 0; t < nGroups; t++)
            {
                int maxLen = 0, minLen = 32;
                byte[] len_t = len[t];
                for (i = 0; i < alphaSize; i++)
                {
                    int lti = len_t[i];
                    maxLen = System.Math.Max(maxLen, lti);
                    minLen = System.Math.Min(minLen, lti);
                }
                if (minLen < 1 | maxLen > BZip2Constants.MAX_CODE_LEN_GEN)
                    throw new InvalidOperationException();

                HbAssignCodes(code[t], len_t, minLen, maxLen, alphaSize);
            }

            /* Transmit the mapping table. */
            {
                bool[] inUse16 = new bool[16];
                for (i = 0; i < 16; i++)
                {
                    inUse16[i] = false;
                    int i16 = i * 16;
                    for (j = 0; j < 16; j++)
                    {
                        if (inUse[i16 + j])
                        {
                            inUse16[i] = true;
                            break;
                        }
                    }
                }

				for (i = 0; i < 16; i++)
                {
                    BsPutBit(inUse16[i] ? 1 : 0);
                }

                for (i = 0; i < 16; i++)
                {
                    if (inUse16[i])
                    {
                        int i16 = i * 16;
                        for (j = 0; j < 16; j++)
                        {
                            BsPutBit(inUse[i16 + j] ? 1 : 0);
                        }
                    }
                }
            }

            /* Now the selectors. */
            BsPutBitsSmall(3, nGroups);
            BsPutBits(15, nSelectors);
            {
                int mtfSelectors = 0x00654321;

                for (i = 0; i < nSelectors; i++)
                {
                    // Compute MTF value for the selector.
                    int ll_i = m_selectors[i];
                    int bitPos = ll_i << 2;
                    int mtfSelector = (mtfSelectors >> bitPos) & 0xF;

                    if (mtfSelector != 1)
                    {
                        int mtfIncMask = (0x00888888 - mtfSelectors + 0x00111111 * mtfSelector) & 0x00888888;
                        mtfSelectors = mtfSelectors - (mtfSelector << bitPos) + (mtfIncMask >> 3);
                    }

                    BsPutBitsSmall(mtfSelector, (1 << mtfSelector) - 2);
                }
            }

            /* Now the coding tables. */
            for (t = 0; t < nGroups; t++)
            {
                byte[] len_t = len[t];
                int curr = len_t[0];
                BsPutBitsSmall(6, curr << 1);
                for (i = 1; i < alphaSize; i++)
                {
                    int lti = len_t[i];
                    while (curr < lti)
                    {
                        BsPutBitsSmall(2, 2);
                        curr++; /* 10 */
                    }
                    while (curr > lti)
                    {
                        BsPutBitsSmall(2, 3);
                        curr--; /* 11 */
                    }
                    BsPutBit(0);
                }
            }

            /* And finally, the block data proper */
            {
                int selCtr = 0;
                int gs = 0;
                while (gs < nMTF)
                {
                    int ge = System.Math.Min(gs + BZip2Constants.G_SIZE - 1, nMTF - 1);

                    int selector_selCtr = m_selectors[selCtr];
                    byte[] len_selCtr = len[selector_selCtr];
                    int[] code_selCtr = code[selector_selCtr];

                    for (i = gs; i <= ge; i++)
                    {
                        int sfmap_i = szptr[i];
                        BsPutBits(len_selCtr[sfmap_i], code_selCtr[sfmap_i]);
                    }

                    gs = ge + 1;
                    selCtr++;
                }
                if (selCtr != nSelectors)
                    throw new InvalidOperationException();
            }
        }

        private void MoveToFrontCodeAndSend()
        {
            BsPutBits(24, origPtr);
            GenerateMtfValues();
            SendMtfValues();
        }

        private Stream bsStream;

        private void SimpleSort(int lo, int hi, int d)
        {
            int i, j, h, v;

            int bigN = hi - lo + 1;
            if (bigN < 2)
                return;

            int hp = 0;
            while (Incs[hp] < bigN)
            {
                hp++;
            }
            hp--;

            for (; hp >= 0; hp--)
            {
                h = Incs[hp];

                i = lo + h;
                while (i <= hi)
                {
                    /* copy 1 */
                    v = zptr[i];
                    j = i;
                    while (FullGtU(zptr[j - h] + d, v + d))
                    {
                        zptr[j] = zptr[j - h];
                        j = j - h;
                        if (j <= (lo + h - 1))
                            break;
                    }
                    zptr[j] = v;

                    /* copy 2 */
                    if (++i > hi)
                        break;

                    v = zptr[i];
                    j = i;
                    while (FullGtU(zptr[j - h] + d, v + d))
                    {
                        zptr[j] = zptr[j - h];
                        j = j - h;
                        if (j <= (lo + h - 1))
                            break;
                    }
                    zptr[j] = v;

                    /* copy 3 */
                    if (++i > hi)
                        break;

                    v = zptr[i];
                    j = i;
                    while (FullGtU(zptr[j - h] + d, v + d))
                    {
                        zptr[j] = zptr[j - h];
                        j = j - h;
                        if (j <= (lo + h - 1))
                            break;
                    }
                    zptr[j] = v;
                    i++;

                    if (workDone > workLimit && firstAttempt)
                        return;
                }
            }
        }

        private void Vswap(int p1, int p2, int n)
        {
            while (--n >= 0)
            {
                int t1 = zptr[p1], t2 = zptr[p2];
                zptr[p1++] = t2;
                zptr[p2++] = t1;
            }
        }

        private int Med3(int a, int b, int c)
        {
            return a > b
                ? (c < b ? b : c > a ? a : c)
                : (c < a ? a : c > b ? b : c);
        }

        internal class StackElem
        {
            internal int ll;
            internal int hh;
            internal int dd;
        }

        private static void PushStackElem(IList<StackElem> stack, int stackCount, int ll, int hh, int dd)
        {
            StackElem stackElem;
            if (stackCount < stack.Count)
            {
                stackElem = stack[stackCount];
            }
            else
            {
                stackElem = new StackElem();
                stack.Add(stackElem);
            }

            stackElem.ll = ll;
            stackElem.hh = hh;
            stackElem.dd = dd;
        }

        private void QSort3(int loSt, int hiSt, int dSt)
        {
            int unLo, unHi, ltLo, gtHi, n, m;

            var stack = blocksortStack;
            int stackCount = 0;
            StackElem stackElem;

            int lo = loSt;
            int hi = hiSt;
            int d = dSt;

            for (;;)
            {
                if (hi - lo < SMALL_THRESH || d > DEPTH_THRESH)
                {
                    SimpleSort(lo, hi, d);
                    if (stackCount < 1 || (workDone > workLimit && firstAttempt))
                        return;

                    stackElem = stack[--stackCount];
                    lo = stackElem.ll;
                    hi = stackElem.hh;
                    d = stackElem.dd;
                    continue;
                }

                int d1 = d + 1;
                int med = Med3(
                    blockBytes[zptr[lo] + d1],
                    blockBytes[zptr[hi] + d1],
                    blockBytes[zptr[(lo + hi) >> 1] + d1]);

                unLo = ltLo = lo;
                unHi = gtHi = hi;

                while (true)
                {
                    while (unLo <= unHi)
                    {
                        int zUnLo = zptr[unLo];
                        n = blockBytes[zUnLo + d1] - med;
                        if (n > 0)
                            break;

                        if (n == 0)
                        {
                            zptr[unLo] = zptr[ltLo];
                            zptr[ltLo++] = zUnLo;
                        }
                        unLo++;
                    }
                    while (unLo <= unHi)
                    {
                        int zUnHi = zptr[unHi];
                        n = blockBytes[zUnHi + d1] - med;
                        if (n < 0)
                            break;

                        if (n == 0)
                        {
                            zptr[unHi] = zptr[gtHi];
                            zptr[gtHi--] = zUnHi;
                        }
                        unHi--;
                    }
                    if (unLo > unHi)
                        break;

                    int temp = zptr[unLo];
                    zptr[unLo++] = zptr[unHi];
                    zptr[unHi--] = temp;
                }

                if (gtHi < ltLo)
                {
                    d = d1;
                    continue;
                }

                n = System.Math.Min(ltLo - lo, unLo - ltLo);
                Vswap(lo, unLo - n, n);

                m = System.Math.Min(hi - gtHi, gtHi - unHi);
                Vswap(unLo, hi - m + 1, m);

                n = lo + (unLo - ltLo);
                m = hi - (gtHi - unHi);

                PushStackElem(stack, stackCount++, lo, n - 1, d);
                PushStackElem(stack, stackCount++, n, m, d1);

                lo = m + 1;
            }
        }

        private void MainSort()
        {
            int i, j, ss, sb;
            int[] runningOrder = new int[256];
            int[] copy = new int[256];
            bool[] bigDone = new bool[256];
            int c1, c2;

            /*
            In the various block-sized structures, live data runs
            from 0 to last+NUM_OVERSHOOT_BYTES inclusive.  First,
            set up the overshoot area for block.
            */
            for (i = 0; i < BZip2Constants.NUM_OVERSHOOT_BYTES; i++)
            {
                blockBytes[count + i + 1] = blockBytes[(i % count) + 1];
            }
            for (i = 0; i <= count + BZip2Constants.NUM_OVERSHOOT_BYTES; i++)
            {
                quadrantShorts[i] = 0;
            }

            blockBytes[0] = blockBytes[count];

            if (count <= 4000)
            {
                /*
                Use SimpleSort(), since the full sorting mechanism
                has quite a large constant overhead.
                */
                for (i = 0; i < count; i++)
                {
                    zptr[i] = i;
                }
                firstAttempt = false;
                workDone = workLimit = 0;
                SimpleSort(0, count - 1, 0);
            }
            else
            {
                for (i = 0; i <= 255; i++)
                {
                    bigDone[i] = false;
                }

                for (i = 0; i <= 65536; i++)
                {
                    ftab[i] = 0;
                }

                c1 = blockBytes[0];
                for (i = 1; i <= count; i++)
                {
                    c2 = blockBytes[i];
                    ftab[(c1 << 8) + c2]++;
                    c1 = c2;
                }

                for (i = 0; i < 65536; i++)
                {
                    ftab[i + 1] += ftab[i];
                }

                c1 = blockBytes[1];
                for (i = 0; i < (count - 1); i++)
                {
                    c2 = blockBytes[i + 2];
                    j = (c1 << 8) + c2;
                    c1 = c2;
                    ftab[j]--;
                    zptr[ftab[j]] = i;
                }

                j = ((int)blockBytes[count] << 8) + blockBytes[1];
                ftab[j]--;
                zptr[ftab[j]] = count - 1;

                /*
                Now ftab contains the first loc of every small bucket.
                Calculate the running order, from smallest to largest
                big bucket.
                */

                for (i = 0; i <= 255; i++)
                {
                    runningOrder[i] = i;
                }

                {
                    int h = 1;
                    do
                    {
                        h = 3 * h + 1;
                    }
                    while (h <= 256);
                    do
                    {
                        h = h / 3;
                        for (i = h; i <= 255; i++)
                        {
                            int vv = runningOrder[i];
                            j = i;
                            while ((ftab[(runningOrder[j - h] + 1) << 8] - ftab[runningOrder[j - h] << 8])
                                > (ftab[(vv + 1) << 8] - ftab[vv << 8]))
                            {
                                runningOrder[j] = runningOrder[j - h];
                                j = j - h;
                                if (j < h)
                                    break;
                            }
                            runningOrder[j] = vv;
                        }
                    }
                    while (h != 1);
                }

                /*
                The main sorting loop.
                */
                for (i = 0; i <= 255; i++)
                {
                    /*
                    Process big buckets, starting with the least full.
                    */
                    ss = runningOrder[i];

                    /*
                    Complete the big bucket [ss] by quicksorting
                    any unsorted small buckets [ss, j].  Hopefully
                    previous pointer-scanning phases have already
                    completed many of the small buckets [ss, j], so
                    we don't have to sort them at all.
                    */
                    for (j = 0; j <= 255; j++)
                    {
                        sb = (ss << 8) + j;
                        if ((ftab[sb] & SETMASK) != SETMASK)
                        {
                            int lo = ftab[sb] & CLEARMASK;
                            int hi = (ftab[sb + 1] & CLEARMASK) - 1;
                            if (hi > lo)
                            {
                                QSort3(lo, hi, 2);
                                if (workDone > workLimit && firstAttempt)
                                    return;
                            }
                            ftab[sb] |= SETMASK;
                        }
                    }

                    /*
                    The ss big bucket is now done.  Record this fact,
                    and update the quadrant descriptors.  Remember to
                    update quadrants in the overshoot area too, if
                    necessary.  The "if (i < 255)" test merely skips
                    this updating for the last bucket processed, since
                    updating for the last bucket is pointless.
                    */
                    bigDone[ss] = true;

                    if (i < 255)
                    {
                        int bbStart = ftab[ss << 8] & CLEARMASK;
                        int bbSize = (ftab[(ss + 1) << 8] & CLEARMASK) - bbStart;

                        int shifts = 0;
                        while ((bbSize >> shifts) > 65534)
                        {
                            shifts++;
                        }

                        for (j = 0; j < bbSize; j++)
                        {
                            int a2update = zptr[bbStart + j] + 1;
                            ushort qVal = (ushort)(j >> shifts);
                            quadrantShorts[a2update] = qVal;
                            if (a2update <= BZip2Constants.NUM_OVERSHOOT_BYTES)
                            {
                                quadrantShorts[a2update + count] = qVal;
                            }
                        }

                        if (!(((bbSize - 1) >> shifts) <= 65535))
                            throw new InvalidOperationException();
                    }

                    /*
                    Now scan this big bucket so as to synthesise the
                    sorted order for small buckets [t, ss] for all t != ss.
                    */
                    for (j = 0; j <= 255; j++)
                    {
                        copy[j] = ftab[(j << 8) + ss] & CLEARMASK;
                    }

                    for (j = ftab[ss << 8] & CLEARMASK;
                        j < (ftab[(ss + 1) << 8] & CLEARMASK); j++)
                    {
                        int zptr_j = zptr[j];
                        c1 = blockBytes[zptr_j];
                        if (!bigDone[c1])
                        {
                            zptr[copy[c1]] = (zptr_j == 0 ? count : zptr_j) - 1;
                            copy[c1]++;
                        }
                    }

                    for (j = 0; j <= 255; j++)
                    {
                        ftab[(j << 8) + ss] |= SETMASK;
                    }
                }
            }
        }

        private void RandomiseBlock()
        {
            for (int i = 0; i < 256; i++)
            {
                inUse[i] = false;
            }

            int rNToGo = 0, rTPos = 0;

            for (int i = 1; i <= count; i++)
            {
                if (rNToGo == 0)
                {
                    rNToGo = RNums[rTPos++];
                    rTPos &= 0x1FF;
                }
                rNToGo--;
                blockBytes[i] ^= (byte)(rNToGo == 1 ? 1 : 0);

                inUse[blockBytes[i]] = true;
            }
        }

        private void DoReversibleTransformation()
        {
            workLimit = workFactor * (count - 1);
            workDone = 0;
            blockRandomised = false;
            firstAttempt = true;

            MainSort();

            if (workDone > workLimit && firstAttempt)
            {
                RandomiseBlock();
                workLimit = workDone = 0;
                blockRandomised = true;
                firstAttempt = false;
                MainSort();
            }

            origPtr = -1;
            for (int i = 0; i < count; i++)
            {
                if (zptr[i] == 0)
                {
                    origPtr = i;
                    break;
                }
            }

            if (origPtr == -1)
                throw new InvalidOperationException();
        }

        private bool FullGtU(int i1, int i2)
        {
            int c1, c2;

            c1 = blockBytes[++i1];
            c2 = blockBytes[++i2];
            if (c1 != c2)
                return c1 > c2;

            c1 = blockBytes[++i1];
            c2 = blockBytes[++i2];
            if (c1 != c2)
                return c1 > c2;

            c1 = blockBytes[++i1];
            c2 = blockBytes[++i2];
            if (c1 != c2)
                return c1 > c2;

            c1 = blockBytes[++i1];
            c2 = blockBytes[++i2];
            if (c1 != c2)
                return c1 > c2;

            c1 = blockBytes[++i1];
            c2 = blockBytes[++i2];
            if (c1 != c2)
                return c1 > c2;

            c1 = blockBytes[++i1];
            c2 = blockBytes[++i2];
            if (c1 != c2)
                return c1 > c2;

            int k = count;
            int s1, s2;

            do
            {
                c1 = blockBytes[++i1];
                c2 = blockBytes[++i2];
                if (c1 != c2)
                    return c1 > c2;

                s1 = quadrantShorts[i1];
                s2 = quadrantShorts[i2];
                if (s1 != s2)
                    return s1 > s2;

                c1 = blockBytes[++i1];
                c2 = blockBytes[++i2];
                if (c1 != c2)
                    return c1 > c2;

                s1 = quadrantShorts[i1];
                s2 = quadrantShorts[i2];
                if (s1 != s2)
                    return s1 > s2;

                c1 = blockBytes[++i1];
                c2 = blockBytes[++i2];
                if (c1 != c2)
                    return c1 > c2;

                s1 = quadrantShorts[i1];
                s2 = quadrantShorts[i2];
                if (s1 != s2)
                    return s1 > s2;

                c1 = blockBytes[++i1];
                c2 = blockBytes[++i2];
                if (c1 != c2)
                    return c1 > c2;

                s1 = quadrantShorts[i1];
                s2 = quadrantShorts[i2];
                if (s1 != s2)
                    return s1 > s2;

                if (i1 >= count)
                {
                    i1 -= count;
                }
                if (i2 >= count)
                {
                    i2 -= count;
                }

                k -= 4;
                workDone++;
            }
            while (k >= 0);

            return false;
        }

        private void GenerateMtfValues()
        {
            int i;

            nInUse = 0;

            byte[] yy = new byte[256];
            for (i = 0; i < 256; i++)
            {
                if (inUse[i])
                {
                    yy[nInUse++] = (byte)i;
                }
            }

            int EOB = nInUse + 1;

            for (i = 0; i <= EOB; i++)
            {
                mtfFreq[i] = 0;
            }

            int wr = 0, zPend = 0;
            for (i = 0; i < count; i++)
            {
                byte blockByte = blockBytes[zptr[i]];

                byte tmp = yy[0];
                if (blockByte == tmp)
                {
                    zPend++;
                    continue;
                }

                int sym = 1;
                do
                {
                    byte tmp2 = tmp;
                    tmp = yy[sym];
                    yy[sym++] = tmp2;
                }
                while (blockByte != tmp);
                yy[0] = tmp;

                while (zPend > 0)
                {
                    // RUNA or RUNB
                    int run = --zPend & 1;
                    szptr[wr++] = run;
                    mtfFreq[run]++;
                    zPend >>= 1;
                }

                szptr[wr++] = sym;
                mtfFreq[sym]++;
            }

            while (zPend > 0)
            {
                // RUNA or RUNB
                int run = --zPend & 1;
                szptr[wr++] = run;
                mtfFreq[run]++;
                zPend >>= 1;
            }

            szptr[wr++] = EOB;
            mtfFreq[EOB]++;

            nMTF = wr;
        }

        internal static byte[][] CreateByteArray(int n1, int n2)
        {
            byte[][] a = new byte[n1][];
            for (int k = 0; k < n1; ++k)
            {
                a[k] = new byte[n2];
            }
            return a;
        }
    }
}
