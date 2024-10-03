MiniMessagePack.cs
====

[![Build Status](https://travis-ci.org/shogo82148/MiniMessagePack.svg?branch=master)](https://travis-ci.org/shogo82148/MiniMessagePack)

MiniMessagePack decodes and encodes [MessagePack](http://msgpack.org/) binaries.
Handy for parsing MessagePack from inside Unity3d.
It is possible to easily replace the [MiniJSON](https://gist.github.com/darktable/1411710).

## Install

To install this, copy MiniMessagePack/MiniMessagePacker.cs to Assets folder in your project.

## Usage

### Decoding

``` csharp
using MiniMessagePack;

// it means {"compact":true,"schema":0} in JSON
var msgpack = new byte[] {
    0x82, 0xa7, 0x63, 0x6f, 0x6d, 0x70, 0x61, 0x63, 0x74, 0xc3,
    0xa6, 0x73, 0x63, 0x68, 0x65, 0x6d, 0x61, 0x00
};

var packer = new MiniMessagePacker ();
object unpacked_data = packer.Unpack (msgpack);
/*
unpacked_data = new Dictionary<string, object> {
    { "compact", true },
	{ "schema", 0},
};
*/
```

### Encoding

``` csharp
using MiniMessagePack;

var unpacked_data = new Dictionary<string, object> {
    { "compact", true },
	{ "schema", 0},
};

var packer = new MiniMessagePacker ();
byte[] msgpack = packer.Pack (unpacked_data);
// msgpack = new byte[] { 0x82, 0xa7, ...};
```

## See Also
- [MessagePack](http://msgpack.org)
- [MessagePack specification](https://github.com/msgpack/msgpack/blob/master/spec.md)
- [MiniJSON](https://gist.github.com/darktable/1411710)
