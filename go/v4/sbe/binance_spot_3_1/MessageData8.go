// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"math"
)

type MessageData8 struct {
	Length  uint8
	VarData uint8
}

func (m *MessageData8) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, m.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, m.VarData); err != nil {
		return err
	}
	return nil
}

func (m *MessageData8) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !m.LengthInActingVersion(actingVersion) {
		m.Length = m.LengthNullValue()
	} else {
		if err := _m.ReadUint8(_r, &m.Length); err != nil {
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

func (m *MessageData8) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func MessageData8Init(m *MessageData8) {
	return
}

func (*MessageData8) EncodedLength() int64 {
	return -1
}

func (*MessageData8) LengthMinValue() uint8 {
	return 0
}

func (*MessageData8) LengthMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*MessageData8) LengthNullValue() uint8 {
	return math.MaxUint8
}

func (*MessageData8) LengthSinceVersion() uint16 {
	return 0
}

func (m *MessageData8) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.LengthSinceVersion()
}

func (*MessageData8) LengthDeprecated() uint16 {
	return 0
}

func (*MessageData8) VarDataMinValue() uint8 {
	return 0
}

func (*MessageData8) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*MessageData8) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*MessageData8) VarDataSinceVersion() uint16 {
	return 0
}

func (m *MessageData8) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.VarDataSinceVersion()
}

func (*MessageData8) VarDataDeprecated() uint16 {
	return 0
}
