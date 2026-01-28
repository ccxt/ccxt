// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"math"
)

type OptionalVarString8 struct {
	Length  uint8
	VarData uint8
}

func (o *OptionalVarString8) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, o.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, o.VarData); err != nil {
		return err
	}
	return nil
}

func (o *OptionalVarString8) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !o.LengthInActingVersion(actingVersion) {
		o.Length = o.LengthNullValue()
	} else {
		if err := _m.ReadUint8(_r, &o.Length); err != nil {
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

func (o *OptionalVarString8) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func OptionalVarString8Init(o *OptionalVarString8) {
	return
}

func (*OptionalVarString8) EncodedLength() int64 {
	return -1
}

func (*OptionalVarString8) LengthMinValue() uint8 {
	return 0
}

func (*OptionalVarString8) LengthMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OptionalVarString8) LengthNullValue() uint8 {
	return math.MaxUint8
}

func (*OptionalVarString8) LengthSinceVersion() uint16 {
	return 0
}

func (o *OptionalVarString8) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LengthSinceVersion()
}

func (*OptionalVarString8) LengthDeprecated() uint16 {
	return 0
}

func (*OptionalVarString8) VarDataMinValue() uint8 {
	return 0
}

func (*OptionalVarString8) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OptionalVarString8) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*OptionalVarString8) VarDataSinceVersion() uint16 {
	return 0
}

func (o *OptionalVarString8) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.VarDataSinceVersion()
}

func (*OptionalVarString8) VarDataDeprecated() uint16 {
	return 0
}
