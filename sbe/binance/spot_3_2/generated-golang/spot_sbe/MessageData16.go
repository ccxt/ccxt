// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"math"
)

type MessageData16 struct {
	Length  uint16
	VarData uint8
}

func (m *MessageData16) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint16(_w, m.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, m.VarData); err != nil {
		return err
	}
	return nil
}

func (m *MessageData16) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !m.LengthInActingVersion(actingVersion) {
		m.Length = m.LengthNullValue()
	} else {
		if err := _m.ReadUint16(_r, &m.Length); err != nil {
			return err
		}
	}
	if !m.VarDataInActingVersion(actingVersion) {
		m.VarData = m.VarDataNullValue()
	} else {
		if err := _m.ReadUint8(_r, &m.VarData); err != nil {
			return err
		}
	}
	return nil
}

func (m *MessageData16) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if m.LengthInActingVersion(actingVersion) {
		if m.Length < m.LengthMinValue() || m.Length > m.LengthMaxValue() {
			return fmt.Errorf("Range check failed on m.Length (%v < %v > %v)", m.LengthMinValue(), m.Length, m.LengthMaxValue())
		}
	}
	if m.VarDataInActingVersion(actingVersion) {
		if m.VarData < m.VarDataMinValue() || m.VarData > m.VarDataMaxValue() {
			return fmt.Errorf("Range check failed on m.VarData (%v < %v > %v)", m.VarDataMinValue(), m.VarData, m.VarDataMaxValue())
		}
	}
	return nil
}

func MessageData16Init(m *MessageData16) {
	return
}

func (*MessageData16) EncodedLength() int64 {
	return -1
}

func (*MessageData16) LengthMinValue() uint16 {
	return 0
}

func (*MessageData16) LengthMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*MessageData16) LengthNullValue() uint16 {
	return math.MaxUint16
}

func (*MessageData16) LengthSinceVersion() uint16 {
	return 0
}

func (m *MessageData16) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.LengthSinceVersion()
}

func (*MessageData16) LengthDeprecated() uint16 {
	return 0
}

func (*MessageData16) VarDataMinValue() uint8 {
	return 0
}

func (*MessageData16) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*MessageData16) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*MessageData16) VarDataSinceVersion() uint16 {
	return 0
}

func (m *MessageData16) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.VarDataSinceVersion()
}

func (*MessageData16) VarDataDeprecated() uint16 {
	return 0
}
