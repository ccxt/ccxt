class ReceiveBuffer {
  private buffer: Buffer;
  private offset: number;
  private originalSize: number;

  constructor(size = 4096) {
    this.buffer = Buffer.allocUnsafe(size);
    this.offset = 0;
    this.originalSize = size;
  }

  get length() {
    return this.offset;
  }

  append(data: Buffer): number {
    if (!Buffer.isBuffer(data)) {
      throw new Error(
        'Attempted to append a non-buffer instance to ReceiveBuffer.',
      );
    }

    if (this.offset + data.length >= this.buffer.length) {
      const tmp = this.buffer;
      this.buffer = Buffer.allocUnsafe(
        Math.max(
          this.buffer.length + this.originalSize,
          this.buffer.length + data.length,
        ),
      );
      tmp.copy(this.buffer);
    }

    data.copy(this.buffer, this.offset);
    return (this.offset += data.length);
  }

  peek(length: number) {
    if (length > this.offset) {
      throw new Error(
        'Attempted to read beyond the bounds of the managed internal data.',
      );
    }
    return this.buffer.slice(0, length);
  }

  get(length: number): Buffer {
    if (length > this.offset) {
      throw new Error(
        'Attempted to read beyond the bounds of the managed internal data.',
      );
    }

    const value = Buffer.allocUnsafe(length);
    this.buffer.slice(0, length).copy(value);
    this.buffer.copyWithin(0, length, length + this.offset - length);
    this.offset -= length;

    return value;
  }
}

export {ReceiveBuffer};
