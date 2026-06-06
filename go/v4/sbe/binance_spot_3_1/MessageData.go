// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"math"
)

type MessageData struct {
	Length  uint32
	VarData uint8
}

func (m *MessageData) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint32(_w, m.Length); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, m.VarData); err != nil {
		return err
	}
	return nil
}

func (m *MessageData) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if !m.LengthInActingVersion(actingVersion) {
		m.Length = m.LengthNullValue()
	} else {
		if err := _m.ReadUint32(_r, &m.Length); err != nil {
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

func (m *MessageData) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func MessageDataInit(m *MessageData) {
	return
}

func (*MessageData) EncodedLength() int64 {
	return -1
}

func (*MessageData) LengthMinValue() uint32 {
	return 0
}

func (*MessageData) LengthMaxValue() uint32 {
	return 2147483647
}

func (*MessageData) LengthNullValue() uint32 {
	return math.MaxUint32
}

func (*MessageData) LengthSinceVersion() uint16 {
	return 0
}

func (m *MessageData) LengthInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.LengthSinceVersion()
}

func (*MessageData) LengthDeprecated() uint16 {
	return 0
}

func (*MessageData) VarDataMinValue() uint8 {
	return 0
}

func (*MessageData) VarDataMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*MessageData) VarDataNullValue() uint8 {
	return math.MaxUint8
}

func (*MessageData) VarDataSinceVersion() uint16 {
	return 0
}

func (m *MessageData) VarDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.VarDataSinceVersion()
}

func (*MessageData) VarDataDeprecated() uint16 {
	return 0
}
