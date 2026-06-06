// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"math"
)

type OptionalMessageData16 struct {
	Length  uint16
	VarData uint8
}

func (o *OptionalMessageData16) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint16(_w, o.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, o.VarData); err != nil {
		return err
	}
	return nil
}

func (o *OptionalMessageData16) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !o.LengthInActingVersion(actingVersion) {
		o.Length = o.LengthNullValue()
	} else {
		if err := _m.ReadUint16(_r, &o.Length); err != nil {
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

func (o *OptionalMessageData16) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func OptionalMessageData16Init(o *OptionalMessageData16) {
	return
}

func (*OptionalMessageData16) EncodedLength() int64 {
	return -1
}

func (*OptionalMessageData16) LengthMinValue() uint16 {
	return 0
}

func (*OptionalMessageData16) LengthMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*OptionalMessageData16) LengthNullValue() uint16 {
	return math.MaxUint16
}

func (*OptionalMessageData16) LengthSinceVersion() uint16 {
	return 0
}

func (o *OptionalMessageData16) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LengthSinceVersion()
}

func (*OptionalMessageData16) LengthDeprecated() uint16 {
	return 0
}

func (*OptionalMessageData16) VarDataMinValue() uint8 {
	return 0
}

func (*OptionalMessageData16) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OptionalMessageData16) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*OptionalMessageData16) VarDataSinceVersion() uint16 {
	return 0
}

func (o *OptionalMessageData16) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.VarDataSinceVersion()
}

func (*OptionalMessageData16) VarDataDeprecated() uint16 {
	return 0
}
