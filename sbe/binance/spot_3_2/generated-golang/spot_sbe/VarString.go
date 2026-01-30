// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"math"
)

type VarString struct {
	Length  uint16
	VarData uint8
}

func (v *VarString) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint16(_w, v.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, v.VarData); err != nil {
		return err
	}
	return nil
}

func (v *VarString) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !v.LengthInActingVersion(actingVersion) {
		v.Length = v.LengthNullValue()
	} else {
		if err := _m.ReadUint16(_r, &v.Length); err != nil {
			return err
		}
	}
	if !v.VarDataInActingVersion(actingVersion) {
		v.VarData = v.VarDataNullValue()
	} else {
		if err := _m.ReadUint8(_r, &v.VarData); err != nil {
			return err
		}
	}
	return nil
}

func (v *VarString) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if v.LengthInActingVersion(actingVersion) {
		if v.Length < v.LengthMinValue() || v.Length > v.LengthMaxValue() {
			return fmt.Errorf("Range check failed on v.Length (%v < %v > %v)", v.LengthMinValue(), v.Length, v.LengthMaxValue())
		}
	}
	if v.VarDataInActingVersion(actingVersion) {
		if v.VarData < v.VarDataMinValue() || v.VarData > v.VarDataMaxValue() {
			return fmt.Errorf("Range check failed on v.VarData (%v < %v > %v)", v.VarDataMinValue(), v.VarData, v.VarDataMaxValue())
		}
	}
	return nil
}

func VarStringInit(v *VarString) {
	return
}

func (*VarString) EncodedLength() int64 {
	return -1
}

func (*VarString) LengthMinValue() uint16 {
	return 0
}

func (*VarString) LengthMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*VarString) LengthNullValue() uint16 {
	return math.MaxUint16
}

func (*VarString) LengthSinceVersion() uint16 {
	return 0
}

func (v *VarString) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= v.LengthSinceVersion()
}

func (*VarString) LengthDeprecated() uint16 {
	return 0
}

func (*VarString) VarDataMinValue() uint8 {
	return 0
}

func (*VarString) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*VarString) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*VarString) VarDataSinceVersion() uint16 {
	return 0
}

func (v *VarString) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= v.VarDataSinceVersion()
}

func (*VarString) VarDataDeprecated() uint16 {
	return 0
}
