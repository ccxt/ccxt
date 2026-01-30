// Generated SBE (Simple Binary Encoding) message codec

package spot_stream

import (
	"fmt"
	"io"
	"math"
)

type VarString8 struct {
	Length  uint8
	VarData uint8
}

func (v *VarString8) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, v.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, v.VarData); err != nil {
		return err
	}
	return nil
}

func (v *VarString8) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !v.LengthInActingVersion(actingVersion) {
		v.Length = v.LengthNullValue()
	} else {
		if err := _m.ReadUint8(_r, &v.Length); err != nil {
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

func (v *VarString8) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func VarString8Init(v *VarString8) {
	return
}

func (*VarString8) EncodedLength() int64 {
	return -1
}

func (*VarString8) LengthMinValue() uint8 {
	return 0
}

func (*VarString8) LengthMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*VarString8) LengthNullValue() uint8 {
	return math.MaxUint8
}

func (*VarString8) LengthSinceVersion() uint16 {
	return 0
}

func (v *VarString8) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= v.LengthSinceVersion()
}

func (*VarString8) LengthDeprecated() uint16 {
	return 0
}

func (*VarString8) VarDataMinValue() uint8 {
	return 0
}

func (*VarString8) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*VarString8) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*VarString8) VarDataSinceVersion() uint16 {
	return 0
}

func (v *VarString8) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= v.VarDataSinceVersion()
}

func (*VarString8) VarDataDeprecated() uint16 {
	return 0
}
