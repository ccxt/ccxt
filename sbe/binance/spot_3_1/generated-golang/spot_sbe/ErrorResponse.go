// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type ErrorResponse struct {
	Code       int16
	ServerTime int64
	RetryAfter int64
	Msg        []uint8
	Data       []uint8
}

func (e *ErrorResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt16(_w, e.Code); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.ServerTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.RetryAfter); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, uint16(len(e.Msg))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Msg); err != nil {
		return err
	}
	if err := _m.WriteUint32(_w, uint32(len(e.Data))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Data); err != nil {
		return err
	}
	return nil
}

func (e *ErrorResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !e.CodeInActingVersion(actingVersion) {
		e.Code = e.CodeNullValue()
	} else {
		if err := _m.ReadInt16(_r, &e.Code); err != nil {
			return err
		}
	}
	if !e.ServerTimeInActingVersion(actingVersion) {
		e.ServerTime = e.ServerTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.ServerTime); err != nil {
			return err
		}
	}
	if !e.RetryAfterInActingVersion(actingVersion) {
		e.RetryAfter = e.RetryAfterNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.RetryAfter); err != nil {
			return err
		}
	}
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.MsgInActingVersion(actingVersion) {
		var MsgLength uint16
		if err := _m.ReadUint16(_r, &MsgLength); err != nil {
			return err
		}
		if cap(e.Msg) < int(MsgLength) {
			e.Msg = make([]uint8, MsgLength)
		}
		e.Msg = e.Msg[:MsgLength]
		if err := _m.ReadBytes(_r, e.Msg); err != nil {
			return err
		}
	}

	if e.DataInActingVersion(actingVersion) {
		var DataLength uint32
		if err := _m.ReadUint32(_r, &DataLength); err != nil {
			return err
		}
		if cap(e.Data) < int(DataLength) {
			e.Data = make([]uint8, DataLength)
		}
		e.Data = e.Data[:DataLength]
		if err := _m.ReadBytes(_r, e.Data); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := e.RangeCheck(actingVersion, e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (e *ErrorResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if e.CodeInActingVersion(actingVersion) {
		if e.Code < e.CodeMinValue() || e.Code > e.CodeMaxValue() {
			return fmt.Errorf("Range check failed on e.Code (%v < %v > %v)", e.CodeMinValue(), e.Code, e.CodeMaxValue())
		}
	}
	if e.ServerTimeInActingVersion(actingVersion) {
		if e.ServerTime != e.ServerTimeNullValue() && (e.ServerTime < e.ServerTimeMinValue() || e.ServerTime > e.ServerTimeMaxValue()) {
			return fmt.Errorf("Range check failed on e.ServerTime (%v < %v > %v)", e.ServerTimeMinValue(), e.ServerTime, e.ServerTimeMaxValue())
		}
	}
	if e.RetryAfterInActingVersion(actingVersion) {
		if e.RetryAfter != e.RetryAfterNullValue() && (e.RetryAfter < e.RetryAfterMinValue() || e.RetryAfter > e.RetryAfterMaxValue()) {
			return fmt.Errorf("Range check failed on e.RetryAfter (%v < %v > %v)", e.RetryAfterMinValue(), e.RetryAfter, e.RetryAfterMaxValue())
		}
	}
	if !utf8.Valid(e.Msg[:]) {
		return errors.New("e.Msg failed UTF-8 validation")
	}
	return nil
}

func ErrorResponseInit(e *ErrorResponse) {
	e.ServerTime = math.MinInt64
	e.RetryAfter = math.MinInt64
	return
}

func (*ErrorResponse) SbeBlockLength() (blockLength uint16) {
	return 18
}

func (*ErrorResponse) SbeTemplateId() (templateId uint16) {
	return 100
}

func (*ErrorResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ErrorResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*ErrorResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ErrorResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ErrorResponse) CodeId() uint16 {
	return 1
}

func (*ErrorResponse) CodeSinceVersion() uint16 {
	return 0
}

func (e *ErrorResponse) CodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CodeSinceVersion()
}

func (*ErrorResponse) CodeDeprecated() uint16 {
	return 0
}

func (*ErrorResponse) CodeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ErrorResponse) CodeMinValue() int16 {
	return math.MinInt16 + 1
}

func (*ErrorResponse) CodeMaxValue() int16 {
	return math.MaxInt16
}

func (*ErrorResponse) CodeNullValue() int16 {
	return math.MinInt16
}

func (*ErrorResponse) ServerTimeId() uint16 {
	return 2
}

func (*ErrorResponse) ServerTimeSinceVersion() uint16 {
	return 0
}

func (e *ErrorResponse) ServerTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ServerTimeSinceVersion()
}

func (*ErrorResponse) ServerTimeDeprecated() uint16 {
	return 0
}

func (*ErrorResponse) ServerTimeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*ErrorResponse) ServerTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ErrorResponse) ServerTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ErrorResponse) ServerTimeNullValue() int64 {
	return math.MinInt64
}

func (*ErrorResponse) RetryAfterId() uint16 {
	return 3
}

func (*ErrorResponse) RetryAfterSinceVersion() uint16 {
	return 0
}

func (e *ErrorResponse) RetryAfterInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.RetryAfterSinceVersion()
}

func (*ErrorResponse) RetryAfterDeprecated() uint16 {
	return 0
}

func (*ErrorResponse) RetryAfterMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*ErrorResponse) RetryAfterMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ErrorResponse) RetryAfterMaxValue() int64 {
	return math.MaxInt64
}

func (*ErrorResponse) RetryAfterNullValue() int64 {
	return math.MinInt64
}

func (*ErrorResponse) MsgMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ErrorResponse) MsgSinceVersion() uint16 {
	return 0
}

func (e *ErrorResponse) MsgInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.MsgSinceVersion()
}

func (*ErrorResponse) MsgDeprecated() uint16 {
	return 0
}

func (ErrorResponse) MsgCharacterEncoding() string {
	return "UTF-8"
}

func (ErrorResponse) MsgHeaderLength() uint64 {
	return 2
}

func (*ErrorResponse) DataMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ErrorResponse) DataSinceVersion() uint16 {
	return 0
}

func (e *ErrorResponse) DataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.DataSinceVersion()
}

func (*ErrorResponse) DataDeprecated() uint16 {
	return 0
}

func (ErrorResponse) DataCharacterEncoding() string {
	return "null"
}

func (ErrorResponse) DataHeaderLength() uint64 {
	return 4
}
