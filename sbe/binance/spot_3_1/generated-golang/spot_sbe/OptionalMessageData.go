// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"math"
)

type OptionalMessageData struct {
	Length  uint32
	VarData uint8
}

func (o *OptionalMessageData) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint32(_w, o.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, o.VarData); err != nil {
		return err
	}
	return nil
}

func (o *OptionalMessageData) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !o.LengthInActingVersion(actingVersion) {
		o.Length = o.LengthNullValue()
	} else {
		if err := _m.ReadUint32(_r, &o.Length); err != nil {
			return err
		}
	}
	if !o.VarDataInActingVersion(actingVersion) {
		o.VarData = o.VarDataNullValue()
	} else {
		if err := _m.ReadUint8(_r, &o.VarData); err != nil {
			return err
		}
	}
	return nil
}

func (o *OptionalMessageData) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.LengthInActingVersion(actingVersion) {
		if o.Length < o.LengthMinValue() || o.Length > o.LengthMaxValue() {
			return fmt.Errorf("Range check failed on o.Length (%v < %v > %v)", o.LengthMinValue(), o.Length, o.LengthMaxValue())
		}
	}
	if o.VarDataInActingVersion(actingVersion) {
		if o.VarData < o.VarDataMinValue() || o.VarData > o.VarDataMaxValue() {
			return fmt.Errorf("Range check failed on o.VarData (%v < %v > %v)", o.VarDataMinValue(), o.VarData, o.VarDataMaxValue())
		}
	}
	return nil
}

func OptionalMessageDataInit(o *OptionalMessageData) {
	return
}

func (*OptionalMessageData) EncodedLength() int64 {
	return -1
}

func (*OptionalMessageData) LengthMinValue() uint32 {
	return 0
}

func (*OptionalMessageData) LengthMaxValue() uint32 {
	return 2147483647
}

func (*OptionalMessageData) LengthNullValue() uint32 {
	return math.MaxUint32
}

func (*OptionalMessageData) LengthSinceVersion() uint16 {
	return 0
}

func (o *OptionalMessageData) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LengthSinceVersion()
}

func (*OptionalMessageData) LengthDeprecated() uint16 {
	return 0
}

func (*OptionalMessageData) VarDataMinValue() uint8 {
	return 0
}

func (*OptionalMessageData) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OptionalMessageData) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*OptionalMessageData) VarDataSinceVersion() uint16 {
	return 0
}

func (o *OptionalMessageData) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.VarDataSinceVersion()
}

func (*OptionalMessageData) VarDataDeprecated() uint16 {
	return 0
}
