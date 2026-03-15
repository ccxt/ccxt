// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"math"
)

type GroupSize16Encoding struct {
	BlockLength uint16
	NumInGroup  uint16
}

func (g *GroupSize16Encoding) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint16(_w, g.BlockLength); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, g.NumInGroup); err != nil {
		return err
	}
	return nil
}

func (g *GroupSize16Encoding) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !g.BlockLengthInActingVersion(actingVersion) {
		g.BlockLength = g.BlockLengthNullValue()
	} else {
		if err := _m.ReadUint16(_r, &g.BlockLength); err != nil {
			return err
		}
	}
	if !g.NumInGroupInActingVersion(actingVersion) {
		g.NumInGroup = g.NumInGroupNullValue()
	} else {
		if err := _m.ReadUint16(_r, &g.NumInGroup); err != nil {
			return err
		}
	}
	return nil
}

func (g *GroupSize16Encoding) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if g.BlockLengthInActingVersion(actingVersion) {
		if g.BlockLength < g.BlockLengthMinValue() || g.BlockLength > g.BlockLengthMaxValue() {
			return fmt.Errorf("Range check failed on g.BlockLength (%v < %v > %v)", g.BlockLengthMinValue(), g.BlockLength, g.BlockLengthMaxValue())
		}
	}
	if g.NumInGroupInActingVersion(actingVersion) {
		if g.NumInGroup < g.NumInGroupMinValue() || g.NumInGroup > g.NumInGroupMaxValue() {
			return fmt.Errorf("Range check failed on g.NumInGroup (%v < %v > %v)", g.NumInGroupMinValue(), g.NumInGroup, g.NumInGroupMaxValue())
		}
	}
	return nil
}

func GroupSize16EncodingInit(g *GroupSize16Encoding) {
	return
}

func (*GroupSize16Encoding) EncodedLength() int64 {
	return 4
}

func (*GroupSize16Encoding) BlockLengthMinValue() uint16 {
	return 0
}

func (*GroupSize16Encoding) BlockLengthMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*GroupSize16Encoding) BlockLengthNullValue() uint16 {
	return math.MaxUint16
}

func (*GroupSize16Encoding) BlockLengthSinceVersion() uint16 {
	return 0
}

func (g *GroupSize16Encoding) BlockLengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= g.BlockLengthSinceVersion()
}

func (*GroupSize16Encoding) BlockLengthDeprecated() uint16 {
	return 0
}

func (*GroupSize16Encoding) NumInGroupMinValue() uint16 {
	return 0
}

func (*GroupSize16Encoding) NumInGroupMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*GroupSize16Encoding) NumInGroupNullValue() uint16 {
	return math.MaxUint16
}

func (*GroupSize16Encoding) NumInGroupSinceVersion() uint16 {
	return 0
}

func (g *GroupSize16Encoding) NumInGroupInActingVersion(actingVersion uint16) bool {
	return actingVersion >= g.NumInGroupSinceVersion()
}

func (*GroupSize16Encoding) NumInGroupDeprecated() uint16 {
	return 0
}
