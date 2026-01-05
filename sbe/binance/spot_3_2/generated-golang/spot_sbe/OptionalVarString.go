// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"math"
)

type OptionalVarString struct {
	Length  uint16
	VarData uint8
}

func (o *OptionalVarString) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint16(_w, o.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, o.VarData); err != nil {
		return err
	}
	return nil
}

func (o *OptionalVarString) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
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

func (o *OptionalVarString) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func OptionalVarStringInit(o *OptionalVarString) {
	return
}

func (*OptionalVarString) EncodedLength() int64 {
	return -1
}

func (*OptionalVarString) LengthMinValue() uint16 {
	return 0
}

func (*OptionalVarString) LengthMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*OptionalVarString) LengthNullValue() uint16 {
	return math.MaxUint16
}

func (*OptionalVarString) LengthSinceVersion() uint16 {
	return 0
}

func (o *OptionalVarString) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LengthSinceVersion()
}

func (*OptionalVarString) LengthDeprecated() uint16 {
	return 0
}

func (*OptionalVarString) VarDataMinValue() uint8 {
	return 0
}

func (*OptionalVarString) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OptionalVarString) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*OptionalVarString) VarDataSinceVersion() uint16 {
	return 0
}

func (o *OptionalVarString) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.VarDataSinceVersion()
}

func (*OptionalVarString) VarDataDeprecated() uint16 {
	return 0
}
