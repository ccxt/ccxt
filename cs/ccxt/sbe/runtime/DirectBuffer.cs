using System;
using System.Runtime.InteropServices;
using System.Text;

namespace Org.SbeTool.Sbe.Dll
{
    /// <summary>
    /// Provides access to read and write simple data types to and from a byte array in the SBE format.
    /// </summary>
    public sealed unsafe class DirectBuffer : IDisposable
    {
        /// <summary>
        /// Delegate invoked if buffer size is too small.
        /// </summary>
        /// <param name="existingBufferSize"></param>
        /// <param name="requestedBufferSize"></param>
        /// <returns>New buffer, or null if reallocation is not possible</returns>
        public delegate byte[] BufferOverflowDelegate(int existingBufferSize, int requestedBufferSize);
        private readonly BufferOverflowDelegate bufferOverflow;

        private byte* _pBuffer;
        private bool _disposed;
        private GCHandle _pinnedGCHandle;
        private bool _needToFreeGCHandle;
        private int _capacity;

        /// <summary>
        /// Attach a view to a byte[] for providing direct access.
        /// </summary>
        /// <param name="buffer">buffer to which the view is attached.</param>
        public DirectBuffer(byte[] buffer) : this(buffer, null)
        {
        }

        /// <summary>
        /// Attach a view to a byte[] for providing direct access
        /// </summary>
        /// <param name="buffer">buffer to which the view is attached.</param>
        /// <param name="bufferOverflow">delegate to allow reallocation of buffer</param>
        public DirectBuffer(byte[] buffer, BufferOverflowDelegate bufferOverflow)
        {
            this.bufferOverflow = bufferOverflow;
            Wrap(buffer);
        }

        /// <summary>
        /// Attach a view to an unmanaged buffer owned by external code
        /// </summary>
        /// <param name="pBuffer">Unmanaged byte buffer</param>
        /// <param name="bufferLength">Length of the buffer</param>
        public DirectBuffer(byte* pBuffer, int bufferLength) : this(pBuffer, bufferLength, null)
        {
        }

        /// <summary>
        /// Attach a view to an unmanaged buffer owned by external code
        /// </summary>
        /// <param name="pBuffer">Unmanaged byte buffer</param>
        /// <param name="bufferLength">Length of the buffer</param>
        /// <param name="bufferOverflow">delegate to allow reallocation of buffer</param>
        public DirectBuffer(byte* pBuffer, int bufferLength, BufferOverflowDelegate bufferOverflow)
        {
            this.bufferOverflow = bufferOverflow;
            Wrap(pBuffer, bufferLength);
        }

        /// <summary>
        /// Attach a view to a buffer owned by external code
        /// </summary>
        /// <param name="buffer">byte buffer</param>
        public DirectBuffer(ArraySegment<byte> buffer) : this(buffer, null)
        {
        }

        /// <summary>
        /// Attach a view to a buffer owned by external code
        /// </summary>
        /// <param name="buffer">byte buffer</param>
        /// <param name="bufferOverflow">delegate to allow reallocation of buffer</param>
        public DirectBuffer(ArraySegment<byte> buffer, BufferOverflowDelegate bufferOverflow)
        {
            this.bufferOverflow = bufferOverflow;
            Wrap(buffer);
        }

        /// <summary>
        /// Creates a DirectBuffer that can later be wrapped
        /// </summary>
        public DirectBuffer()
        {
        }

        /// <summary>
        /// Creates a DirectBuffer that can later be wrapped
        /// </summary>
        public DirectBuffer(BufferOverflowDelegate bufferOverflow)
        {
            this.bufferOverflow = bufferOverflow;
        }

        /// <summary>
        /// Recycles an existing <see cref="DirectBuffer"/>
        /// </summary>
        /// <param name="byteArray">The byte array that will act as the backing buffer.</param>
        public void Wrap(byte[] byteArray)
        {
            if (byteArray == null) throw new ArgumentNullException("byteArray");

            FreeGCHandle();

            // pin the buffer so it does not get moved around by GC, this is required since we use pointers
            _pinnedGCHandle = GCHandle.Alloc(byteArray, GCHandleType.Pinned);
            _needToFreeGCHandle = true;

            _pBuffer = (byte*)_pinnedGCHandle.AddrOfPinnedObject().ToPointer();
            _capacity = byteArray.Length;
        }

        /// <summary>
        /// Recycles an existing <see cref="DirectBuffer"/> from an unmanaged byte buffer owned by external code
        /// </summary>
        /// <param name="pBuffer">Unmanaged byte buffer</param>
        /// <param name="bufferLength">Length of the buffer</param>
        public void Wrap(byte* pBuffer, int bufferLength)
        {
            if (pBuffer == null) throw new ArgumentNullException("pBuffer");
            if (bufferLength <= 0) throw new ArgumentException("Buffer size must be > 0", "bufferLength");

            FreeGCHandle();

            _pBuffer = pBuffer;
            _capacity = bufferLength;
            _needToFreeGCHandle = false;
        }

        /// <summary>
        /// Recycles an existing <see cref="DirectBuffer"/> from a byte buffer owned by external code
        /// </summary>
        /// <param name="buffer">buffer of bytes</param>
        public void Wrap(ArraySegment<byte> buffer)
        {
            if (buffer == null) throw new ArgumentNullException(nameof(buffer));

            FreeGCHandle();

            // pin the buffer so it does not get moved around by GC, this is required since we use pointers
            _pinnedGCHandle = GCHandle.Alloc(buffer.Array, GCHandleType.Pinned);
            _needToFreeGCHandle = true;

            _pBuffer = ((byte*)_pinnedGCHandle.AddrOfPinnedObject().ToPointer()) + buffer.Offset;
            _capacity = buffer.Count;
        }

        /// <summary>
        /// Capacity of the underlying buffer
        /// </summary>
        public int Capacity
        {
            get { return _capacity; }
        }
        
        /// <summary>
        /// Check that a given limit is not greater than the capacity of a buffer from a given offset.
        /// </summary>
        /// <param name="limit">limit access is required to.</param>
        public void CheckLimit(int limit)
        {
            if (limit > _capacity)
            {
                TryResizeBuffer(limit);
            }
        }

        private void TryResizeBuffer(int limit)
        {
            if (bufferOverflow == null)
            {
                throw new IndexOutOfRangeException("limit=" + limit + " is beyond capacity=" + _capacity);
            }

            var newBuffer = bufferOverflow(_capacity, limit);

            if (newBuffer == null)
            {
                throw new IndexOutOfRangeException("limit=" + limit + " is beyond capacity=" + _capacity);
            }

            Marshal.Copy((IntPtr)_pBuffer, newBuffer, 0, _capacity);
            Wrap(newBuffer);
        }

        /// <summary>
        /// Gets the <see cref="byte"/> value at a given index.
        /// </summary>
        /// <param name="index">index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public byte CharGet(int index)
        {
            return *(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="byte"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void CharPut(int index, byte value)
        {
            *(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="sbyte"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public sbyte Int8Get(int index)
        {
            return *(sbyte*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="sbyte"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Int8Put(int index, sbyte value)
        {
            *(sbyte*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="byte"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public byte Uint8Get(int index)
        {
            return *(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="byte"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Uint8Put(int index, byte value)
        {
            *(_pBuffer + index) = value;
        }

        #region Big Endian

        /// <summary>
        /// Gets the <see cref="short"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public short Int16GetBigEndian(int index)
        {
            var data = *(short*) (_pBuffer + index);
            data = EndianessConverter.ApplyInt16(ByteOrder.BigEndian, data);
            return data;
        }

        /// <summary>
        /// Writes a <see cref="short"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Int16PutBigEndian(int index, short value)
        {
           value = EndianessConverter.ApplyInt16(ByteOrder.BigEndian, value);

            *(short*) (_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="int"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public int Int32GetBigEndian(int index)
        {
            var data = *(int*) (_pBuffer + index);
            data = EndianessConverter.ApplyInt32(ByteOrder.BigEndian, data);

            return data;
        }

        /// <summary>
        /// Writes a <see cref="int"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Int32PutBigEndian(int index, int value)
        {
            value = EndianessConverter.ApplyInt32(ByteOrder.BigEndian, value);

            *(int*) (_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="long"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public long Int64GetBigEndian(int index)
        {
            var data = *(long*) (_pBuffer + index);
           data = EndianessConverter.ApplyInt64(ByteOrder.BigEndian, data);

            return data;
        }

        /// <summary>
        /// Writes a <see cref="long"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Int64PutBigEndian(int index, long value)
        {
           value = EndianessConverter.ApplyInt64(ByteOrder.BigEndian, value);

            *(long*) (_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="ushort"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public ushort Uint16GetBigEndian(int index)
        {
            var data = *(ushort*) (_pBuffer + index);
            data = EndianessConverter.ApplyUint16(ByteOrder.BigEndian, data);

            return data;
        }

        /// <summary>
        /// Writes a <see cref="ushort"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Uint16PutBigEndian(int index, ushort value)
        {
            value = EndianessConverter.ApplyUint16(ByteOrder.BigEndian, value);

            *(ushort*) (_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="uint"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public uint Uint32GetBigEndian(int index)
        {
            var data = *(uint*) (_pBuffer + index);
            data = EndianessConverter.ApplyUint32(ByteOrder.BigEndian, data);

            return data;
        }

        /// <summary>
        /// Writes a <see cref="uint"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Uint32PutBigEndian(int index, uint value)
        {
           value = EndianessConverter.ApplyUint32(ByteOrder.BigEndian, value);

            *(uint*) (_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="ulong"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public ulong Uint64GetBigEndian(int index)
        {
            var data = *(ulong*) (_pBuffer + index);
            data = EndianessConverter.ApplyUint64(ByteOrder.BigEndian, data);

            return data;
        }

        /// <summary>
        /// Writes a <see cref="ulong"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Uint64PutBigEndian(int index, ulong value)
        {
           value = EndianessConverter.ApplyUint64(ByteOrder.BigEndian, value);

            *(ulong*) (_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="float"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public float FloatGetBigEndian(int index)
        {
            var data = *(float*) (_pBuffer + index);
            data = EndianessConverter.ApplyFloat(ByteOrder.BigEndian, data);

            return data;
        }

        /// <summary>
        /// Writes a <see cref="float"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void FloatPutBigEndian(int index, float value)
        {
           value = EndianessConverter.ApplyFloat(ByteOrder.BigEndian, value);

            *(float*) (_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="double"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public double DoubleGetBigEndian(int index)
        {
            var data = *(double*) (_pBuffer + index);
            data = EndianessConverter.ApplyDouble(ByteOrder.BigEndian, data);

            return data;
        }

        /// <summary>
        /// Writes a <see cref="double"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void DoublePutBigEndian(int index, double value)
        {
            value = EndianessConverter.ApplyDouble(ByteOrder.BigEndian, value);

            *(double*) (_pBuffer + index) = value;
        }

        #endregion

        #region Little Endian

        /// <summary>
        /// Gets the <see cref="short"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public short Int16GetLittleEndian(int index)
        {
            return *(short*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="short"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Int16PutLittleEndian(int index, short value)
        {
            *(short*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="int"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public int Int32GetLittleEndian(int index)
        {
            return *(int*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="int"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Int32PutLittleEndian(int index, int value)
        {
            *(int*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="long"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public long Int64GetLittleEndian(int index)
        {
            return *(long*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="long"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Int64PutLittleEndian(int index, long value)
        {
            *(long*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="ushort"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public ushort Uint16GetLittleEndian(int index)
        {
            return *(ushort*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="ushort"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Uint16PutLittleEndian(int index, ushort value)
        {
            *(ushort*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="uint"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public uint Uint32GetLittleEndian(int index)
        {
            return *(uint*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="uint"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Uint32PutLittleEndian(int index, uint value)
        {
            *(uint*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="ulong"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public ulong Uint64GetLittleEndian(int index)
        {
            return *(ulong*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="ulong"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void Uint64PutLittleEndian(int index, ulong value)
        {
            *(ulong*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="float"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public float FloatGetLittleEndian(int index)
        {
            return *(float*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="float"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void FloatPutLittleEndian(int index, float value)
        {
            *(float*)(_pBuffer + index) = value;
        }

        /// <summary>
        /// Gets the <see cref="double"/> value at a given index.
        /// </summary>
        /// <param name="index"> index in bytes from which to get.</param>
        /// <returns>the value at a given index.</returns>
        public double DoubleGetLittleEndian(int index)
        {
            return *(double*)(_pBuffer + index);
        }

        /// <summary>
        /// Writes a <see cref="double"/> value to a given index.
        /// </summary>
        /// <param name="index">index in bytes for where to put.</param>
        /// <param name="value">value to be written</param>
        public void DoublePutLittleEndian(int index, double value)
        {
            *(double*)(_pBuffer + index) = value;
        }

        #endregion

        /// <summary>
        /// Creates a <see cref="Span{T}" /> on top of the underlying buffer
        /// </summary>
        /// <param name="index">index  in the underlying buffer to start from.</param>
        /// <param name="length">length of the supplied buffer to use.</param>
        /// <returns>The new <see cref="Span{T}" /> wrapping the requested memory</returns>
        public Span<T> AsSpan<T>(int index, int length) => new Span<T>(_pBuffer + index, length);

        /// <summary>
        /// Creates a <see cref="ReadOnlySpan{T}" /> on top of the underlying buffer
        /// </summary>
        /// <param name="index">index  in the underlying buffer to start from.</param>
        /// <param name="length">length of the supplied buffer to use.</param>
        /// <returns>The new <see cref="ReadOnlySpan{T}" /> wrapping the requested memory</returns>
        public ReadOnlySpan<T> AsReadOnlySpan<T>(int index, int length) => new ReadOnlySpan<T>(_pBuffer + index, length);

        /// <summary>
        /// Copies a range of bytes from the underlying into a supplied byte array.
        /// </summary>
        /// <param name="index">index  in the underlying buffer to start from.</param>
        /// <param name="destination">array into which the bytes will be copied.</param>
        /// <param name="offsetDestination">offset in the supplied buffer to start the copy</param>
        /// <param name="length">length of the supplied buffer to use.</param>
        /// <returns>count of bytes copied.</returns>
        public int GetBytes(int index, byte[] destination, int offsetDestination, int length)
        {
            int count = Math.Min(length, _capacity - index);
            Marshal.Copy((IntPtr)(_pBuffer + index), destination, offsetDestination, count);

            return count;
        }

        /// <summary>
        /// Copies a range of bytes from the underlying into a supplied <see cref="Span{T}" />.
        /// </summary>
        /// <param name="index">index  in the underlying buffer to start from.</param>
        /// <param name="destination"><see cref="Span{T}" /> into which the bytes will be copied.</param>
        /// <returns>count of bytes copied.</returns>
        public int GetBytes(int index, Span<byte> destination)
        {
            int count = Math.Min(destination.Length, _capacity - index);
            AsReadOnlySpan<byte>(index, count).CopyTo(destination);

            return count;
        }

        /// <summary>
        /// Writes a byte array into the underlying buffer.
        /// </summary>
        /// <param name="index">index  in the underlying buffer to start from.</param>
        /// <param name="src">source byte array to be copied to the underlying buffer.</param>
        /// <param name="offset">offset in the supplied buffer to begin the copy.</param>
        /// <param name="length">length of the supplied buffer to copy.</param>
        /// <returns>count of bytes copied.</returns>
        public int SetBytes(int index, byte[] src, int offset, int length)
        {
            int count = Math.Min(length, _capacity - index);
            Marshal.Copy(src, offset, (IntPtr)(_pBuffer + index), count);

            return count;
        }

        /// <summary>
        /// Writes a <see cref="Span{T}" /> into the underlying buffer.
        /// </summary>
        /// <param name="index">index  in the underlying buffer to start from.</param>
        /// <param name="src">source <see cref="Span{T}" /> to be copied to the underlying buffer.</param>
        /// <returns>count of bytes copied.</returns>
        public int SetBytes(int index, ReadOnlySpan<byte> src)
        {
            int count = Math.Min(src.Length, _capacity - index);
            src.CopyTo(AsSpan<byte>(index, count));

            return count;
        }

        /// <summary>
        /// Writes a string into the underlying buffer, encoding using the provided <see cref="System.Text.Encoding"/>.
        /// </summary>
        /// <param name="encoding">encoding to use to write the bytes from the string</param>
        /// <param name="src">source string</param>
        /// <param name="index">index in the underlying buffer to start writing bytes</param>
        /// <returns>count of bytes written</returns>
        public unsafe int SetBytesFromString(Encoding encoding, string src, int index)
        {
           int byteCount = encoding.GetByteCount(src);

           CheckLimit(index + byteCount);

           char[] chars = src.ToCharArray();
           fixed (char* ptr = chars)
           {
               return encoding.GetBytes(ptr, src.Length, _pBuffer + index, byteCount);
           }
        }

        /// <summary>
        /// Reads a string from the buffer; converting the bytes to characters using 
        /// the provided <see cref="System.Text.Encoding"/>.
        /// If there are not enough bytes in the buffer it will throw an IndexOutOfRangeException.
        /// </summary>
        /// <param name="encoding">encoding to use to convert the bytes into characters</param>
        /// <param name="index">index in the underlying buffer to start writing bytes</param>
        /// <param name="byteCount">the number of bytes to read into the string</param>
        /// <returns>the string representing the decoded bytes read from the buffer</returns>
        public string GetStringFromBytes(Encoding encoding, int index, int byteCount)
        {
            int num = _capacity - index;
            if (byteCount > num)
            {
                ThrowHelper.ThrowIndexOutOfRangeException(_capacity);
            }

            return new String((sbyte*)_pBuffer, index, byteCount, encoding);
        }

        /// <summary>
        /// Reads a number of bytes from the buffer to create a string, truncating the string if a null byte is found
        /// </summary>
        /// <param name="encoding">The text encoding to use for string creation</param>
        /// <param name="index">index in the underlying buffer to start from</param>
        /// <param name="maxLength">The maximum number of bytes to read</param>
        /// <param name="nullByte">The null value for this string</param>
        /// <returns>The created string</returns>
        public unsafe string GetStringFromNullTerminatedBytes(Encoding encoding, int index, int maxLength, byte nullByte)
        {
            int count = Math.Min(maxLength, _capacity - index);
            if (count <= 0)
            {
                ThrowHelper.ThrowIndexOutOfRangeException(index);
            }

            if (_pBuffer[index] == nullByte)
            {
                return null;
            }

            int byteCount2 = 0;
            for (byteCount2 = 0; byteCount2 < count && _pBuffer[byteCount2 + index] != nullByte; byteCount2++)
            { 
            }

            return new String((sbyte*) _pBuffer, index, byteCount2, encoding);
        }

        /// <summary>
        /// Writes a number of bytes into the buffer using the given encoding and string.
        /// Note that pre-computing the bytes to be written, when possible, will be quicker than using the encoder to convert on-the-fly.
        /// </summary>
        /// <param name="encoding">The text encoding to use</param>
        /// <param name="src">String to write</param>
        /// <param name="index"></param>
        /// <param name="maxLength">Maximum number of bytes to write</param>
        /// <param name="nullByte"></param>
        /// <returns>The number of bytes written.</returns>
        public unsafe int SetNullTerminatedBytesFromString(Encoding encoding, string src, int index, int maxLength, byte nullByte)
        {
            int available = Math.Min(maxLength, _capacity - index);
            if (available <= 0)
            {
                ThrowHelper.ThrowIndexOutOfRangeException(index);
            }

            if (src == null)
            {
                _pBuffer[index] = nullByte;
                return 1;
            }

            int byteCount = encoding.GetByteCount(src);
            if (byteCount > available)
            {
                ThrowHelper.ThrowIndexOutOfRangeException(index + available);
            }

            char[] chars = src.ToCharArray();
            fixed (char* ptr = chars)
            {
                encoding.GetBytes(ptr, src.Length, _pBuffer + index, byteCount);
            }

            if (byteCount < available)
            {
                *(_pBuffer + index + byteCount) = nullByte;
                return byteCount + 1;
            }

            return byteCount;
        }

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        /// <filterpriority>2</filterpriority>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Destructor for <see cref="DirectBuffer"/>
        /// </summary>
        ~DirectBuffer()
        {
            Dispose(false);
        }

        private void Dispose(bool disposing)
        {
            if (_disposed)
            {
                return;
            }

            FreeGCHandle();

            _disposed = true;
        }

        private void FreeGCHandle()
        {
            if (_needToFreeGCHandle)
            {
                _pinnedGCHandle.Free();
                _needToFreeGCHandle = false;
            }
        }
    }
}
