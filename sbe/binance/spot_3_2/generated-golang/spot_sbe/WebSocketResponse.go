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

type WebSocketResponse struct {
	SbeSchemaIdVersionDeprecated BoolEnumEnum
	Status                       uint16
	RateLimits                   []WebSocketResponseRateLimits
	Id                           []uint8
	Result                       []uint8
}
type WebSocketResponseRateLimits struct {
	RateLimitType RateLimitTypeEnum
	Interval      RateLimitIntervalEnum
	IntervalNum   uint8
	RateLimit     int64
	Current       int64
}

func (w *WebSocketResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := w.RangeCheck(w.SbeSchemaVersion(), w.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := w.SbeSchemaIdVersionDeprecated.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, w.Status); err != nil {
		return err
	}
	var RateLimitsBlockLength uint16 = 19
	if err := _m.WriteUint16(_w, RateLimitsBlockLength); err != nil {
		return err
	}
	var RateLimitsNumInGroup uint16 = uint16(len(w.RateLimits))
	if err := _m.WriteUint16(_w, RateLimitsNumInGroup); err != nil {
		return err
	}
	for i := range w.RateLimits {
		if err := w.RateLimits[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(w.Id))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, w.Id); err != nil {
		return err
	}
	if err := _m.WriteUint32(_w, uint32(len(w.Result))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, w.Result); err != nil {
		return err
	}
	return nil
}

func (w *WebSocketResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if w.SbeSchemaIdVersionDeprecatedInActingVersion(actingVersion) {
		if err := w.SbeSchemaIdVersionDeprecated.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !w.StatusInActingVersion(actingVersion) {
		w.Status = w.StatusNullValue()
	} else {
		if err := _m.ReadUint16(_r, &w.Status); err != nil {
			return err
		}
	}
	if actingVersion > w.SbeSchemaVersion() && blockLength > w.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-w.SbeBlockLength()))
	}

	if w.RateLimitsInActingVersion(actingVersion) {
		var RateLimitsBlockLength uint16
		if err := _m.ReadUint16(_r, &RateLimitsBlockLength); err != nil {
			return err
		}
		var RateLimitsNumInGroup uint16
		if err := _m.ReadUint16(_r, &RateLimitsNumInGroup); err != nil {
			return err
		}
		if cap(w.RateLimits) < int(RateLimitsNumInGroup) {
			w.RateLimits = make([]WebSocketResponseRateLimits, RateLimitsNumInGroup)
		}
		w.RateLimits = w.RateLimits[:RateLimitsNumInGroup]
		for i := range w.RateLimits {
			if err := w.RateLimits[i].Decode(_m, _r, actingVersion, uint(RateLimitsBlockLength)); err != nil {
				return err
			}
		}
	}

	if w.IdInActingVersion(actingVersion) {
		var IdLength uint8
		if err := _m.ReadUint8(_r, &IdLength); err != nil {
			return err
		}
		if cap(w.Id) < int(IdLength) {
			w.Id = make([]uint8, IdLength)
		}
		w.Id = w.Id[:IdLength]
		if err := _m.ReadBytes(_r, w.Id); err != nil {
			return err
		}
	}

	if w.ResultInActingVersion(actingVersion) {
		var ResultLength uint32
		if err := _m.ReadUint32(_r, &ResultLength); err != nil {
			return err
		}
		if cap(w.Result) < int(ResultLength) {
			w.Result = make([]uint8, ResultLength)
		}
		w.Result = w.Result[:ResultLength]
		if err := _m.ReadBytes(_r, w.Result); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := w.RangeCheck(actingVersion, w.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (w *WebSocketResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := w.SbeSchemaIdVersionDeprecated.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if w.StatusInActingVersion(actingVersion) {
		if w.Status < w.StatusMinValue() || w.Status > w.StatusMaxValue() {
			return fmt.Errorf("Range check failed on w.Status (%v < %v > %v)", w.StatusMinValue(), w.Status, w.StatusMaxValue())
		}
	}
	for i := range w.RateLimits {
		if err := w.RateLimits[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(w.Id[:]) {
		return errors.New("w.Id failed UTF-8 validation")
	}
	return nil
}

func WebSocketResponseInit(w *WebSocketResponse) {
	return
}

func (w *WebSocketResponseRateLimits) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := w.RateLimitType.Encode(_m, _w); err != nil {
		return err
	}
	if err := w.Interval.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, w.IntervalNum); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, w.RateLimit); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, w.Current); err != nil {
		return err
	}
	return nil
}

func (w *WebSocketResponseRateLimits) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if w.RateLimitTypeInActingVersion(actingVersion) {
		if err := w.RateLimitType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if w.IntervalInActingVersion(actingVersion) {
		if err := w.Interval.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !w.IntervalNumInActingVersion(actingVersion) {
		w.IntervalNum = w.IntervalNumNullValue()
	} else {
		if err := _m.ReadUint8(_r, &w.IntervalNum); err != nil {
			return err
		}
	}
	if !w.RateLimitInActingVersion(actingVersion) {
		w.RateLimit = w.RateLimitNullValue()
	} else {
		if err := _m.ReadInt64(_r, &w.RateLimit); err != nil {
			return err
		}
	}
	if !w.CurrentInActingVersion(actingVersion) {
		w.Current = w.CurrentNullValue()
	} else {
		if err := _m.ReadInt64(_r, &w.Current); err != nil {
			return err
		}
	}
	if actingVersion > w.SbeSchemaVersion() && blockLength > w.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-w.SbeBlockLength()))
	}
	return nil
}

func (w *WebSocketResponseRateLimits) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := w.RateLimitType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := w.Interval.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if w.IntervalNumInActingVersion(actingVersion) {
		if w.IntervalNum < w.IntervalNumMinValue() || w.IntervalNum > w.IntervalNumMaxValue() {
			return fmt.Errorf("Range check failed on w.IntervalNum (%v < %v > %v)", w.IntervalNumMinValue(), w.IntervalNum, w.IntervalNumMaxValue())
		}
	}
	if w.RateLimitInActingVersion(actingVersion) {
		if w.RateLimit < w.RateLimitMinValue() || w.RateLimit > w.RateLimitMaxValue() {
			return fmt.Errorf("Range check failed on w.RateLimit (%v < %v > %v)", w.RateLimitMinValue(), w.RateLimit, w.RateLimitMaxValue())
		}
	}
	if w.CurrentInActingVersion(actingVersion) {
		if w.Current < w.CurrentMinValue() || w.Current > w.CurrentMaxValue() {
			return fmt.Errorf("Range check failed on w.Current (%v < %v > %v)", w.CurrentMinValue(), w.Current, w.CurrentMaxValue())
		}
	}
	return nil
}

func WebSocketResponseRateLimitsInit(w *WebSocketResponseRateLimits) {
	return
}

func (*WebSocketResponse) SbeBlockLength() (blockLength uint16) {
	return 3
}

func (*WebSocketResponse) SbeTemplateId() (templateId uint16) {
	return 50
}

func (*WebSocketResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*WebSocketResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*WebSocketResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*WebSocketResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*WebSocketResponse) SbeSchemaIdVersionDeprecatedId() uint16 {
	return 1
}

func (*WebSocketResponse) SbeSchemaIdVersionDeprecatedSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponse) SbeSchemaIdVersionDeprecatedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.SbeSchemaIdVersionDeprecatedSinceVersion()
}

func (*WebSocketResponse) SbeSchemaIdVersionDeprecatedDeprecated() uint16 {
	return 0
}

func (*WebSocketResponse) SbeSchemaIdVersionDeprecatedMetaAttribute(meta int) string {
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

func (*WebSocketResponse) StatusId() uint16 {
	return 2
}

func (*WebSocketResponse) StatusSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponse) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.StatusSinceVersion()
}

func (*WebSocketResponse) StatusDeprecated() uint16 {
	return 0
}

func (*WebSocketResponse) StatusMetaAttribute(meta int) string {
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

func (*WebSocketResponse) StatusMinValue() uint16 {
	return 0
}

func (*WebSocketResponse) StatusMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*WebSocketResponse) StatusNullValue() uint16 {
	return math.MaxUint16
}

func (*WebSocketResponseRateLimits) RateLimitTypeId() uint16 {
	return 1
}

func (*WebSocketResponseRateLimits) RateLimitTypeSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponseRateLimits) RateLimitTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.RateLimitTypeSinceVersion()
}

func (*WebSocketResponseRateLimits) RateLimitTypeDeprecated() uint16 {
	return 0
}

func (*WebSocketResponseRateLimits) RateLimitTypeMetaAttribute(meta int) string {
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

func (*WebSocketResponseRateLimits) IntervalId() uint16 {
	return 2
}

func (*WebSocketResponseRateLimits) IntervalSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponseRateLimits) IntervalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.IntervalSinceVersion()
}

func (*WebSocketResponseRateLimits) IntervalDeprecated() uint16 {
	return 0
}

func (*WebSocketResponseRateLimits) IntervalMetaAttribute(meta int) string {
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

func (*WebSocketResponseRateLimits) IntervalNumId() uint16 {
	return 3
}

func (*WebSocketResponseRateLimits) IntervalNumSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponseRateLimits) IntervalNumInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.IntervalNumSinceVersion()
}

func (*WebSocketResponseRateLimits) IntervalNumDeprecated() uint16 {
	return 0
}

func (*WebSocketResponseRateLimits) IntervalNumMetaAttribute(meta int) string {
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

func (*WebSocketResponseRateLimits) IntervalNumMinValue() uint8 {
	return 0
}

func (*WebSocketResponseRateLimits) IntervalNumMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*WebSocketResponseRateLimits) IntervalNumNullValue() uint8 {
	return math.MaxUint8
}

func (*WebSocketResponseRateLimits) RateLimitId() uint16 {
	return 4
}

func (*WebSocketResponseRateLimits) RateLimitSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponseRateLimits) RateLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.RateLimitSinceVersion()
}

func (*WebSocketResponseRateLimits) RateLimitDeprecated() uint16 {
	return 0
}

func (*WebSocketResponseRateLimits) RateLimitMetaAttribute(meta int) string {
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

func (*WebSocketResponseRateLimits) RateLimitMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketResponseRateLimits) RateLimitMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketResponseRateLimits) RateLimitNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketResponseRateLimits) CurrentId() uint16 {
	return 5
}

func (*WebSocketResponseRateLimits) CurrentSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponseRateLimits) CurrentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.CurrentSinceVersion()
}

func (*WebSocketResponseRateLimits) CurrentDeprecated() uint16 {
	return 0
}

func (*WebSocketResponseRateLimits) CurrentMetaAttribute(meta int) string {
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

func (*WebSocketResponseRateLimits) CurrentMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketResponseRateLimits) CurrentMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketResponseRateLimits) CurrentNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketResponse) RateLimitsId() uint16 {
	return 100
}

func (*WebSocketResponse) RateLimitsSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponse) RateLimitsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.RateLimitsSinceVersion()
}

func (*WebSocketResponse) RateLimitsDeprecated() uint16 {
	return 0
}

func (*WebSocketResponseRateLimits) SbeBlockLength() (blockLength uint) {
	return 19
}

func (*WebSocketResponseRateLimits) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*WebSocketResponse) IdMetaAttribute(meta int) string {
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

func (*WebSocketResponse) IdSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponse) IdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.IdSinceVersion()
}

func (*WebSocketResponse) IdDeprecated() uint16 {
	return 0
}

func (WebSocketResponse) IdCharacterEncoding() string {
	return "UTF-8"
}

func (WebSocketResponse) IdHeaderLength() uint64 {
	return 1
}

func (*WebSocketResponse) ResultMetaAttribute(meta int) string {
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

func (*WebSocketResponse) ResultSinceVersion() uint16 {
	return 0
}

func (w *WebSocketResponse) ResultInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ResultSinceVersion()
}

func (*WebSocketResponse) ResultDeprecated() uint16 {
	return 0
}

func (WebSocketResponse) ResultCharacterEncoding() string {
	return "null"
}

func (WebSocketResponse) ResultHeaderLength() uint64 {
	return 4
}
