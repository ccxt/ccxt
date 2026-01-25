// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type WebSocketSessionStatusResponse struct {
	AuthorizedSince  int64
	ConnectedSince   int64
	ReturnRateLimits BoolEnumEnum
	ServerTime       int64
	UserDataStream   BoolEnumEnum
	LoggedOnApiKey   []uint8
}

func (w *WebSocketSessionStatusResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := w.RangeCheck(w.SbeSchemaVersion(), w.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, w.AuthorizedSince); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, w.ConnectedSince); err != nil {
		return err
	}
	if err := w.ReturnRateLimits.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, w.ServerTime); err != nil {
		return err
	}
	if err := w.UserDataStream.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, uint16(len(w.LoggedOnApiKey))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, w.LoggedOnApiKey); err != nil {
		return err
	}
	return nil
}

func (w *WebSocketSessionStatusResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !w.AuthorizedSinceInActingVersion(actingVersion) {
		w.AuthorizedSince = w.AuthorizedSinceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &w.AuthorizedSince); err != nil {
			return err
		}
	}
	if !w.ConnectedSinceInActingVersion(actingVersion) {
		w.ConnectedSince = w.ConnectedSinceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &w.ConnectedSince); err != nil {
			return err
		}
	}
	if w.ReturnRateLimitsInActingVersion(actingVersion) {
		if err := w.ReturnRateLimits.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !w.ServerTimeInActingVersion(actingVersion) {
		w.ServerTime = w.ServerTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &w.ServerTime); err != nil {
			return err
		}
	}
	if w.UserDataStreamInActingVersion(actingVersion) {
		if err := w.UserDataStream.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if actingVersion > w.SbeSchemaVersion() && blockLength > w.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-w.SbeBlockLength()))
	}

	if w.LoggedOnApiKeyInActingVersion(actingVersion) {
		var LoggedOnApiKeyLength uint16
		if err := _m.ReadUint16(_r, &LoggedOnApiKeyLength); err != nil {
			return err
		}
		if cap(w.LoggedOnApiKey) < int(LoggedOnApiKeyLength) {
			w.LoggedOnApiKey = make([]uint8, LoggedOnApiKeyLength)
		}
		w.LoggedOnApiKey = w.LoggedOnApiKey[:LoggedOnApiKeyLength]
		if err := _m.ReadBytes(_r, w.LoggedOnApiKey); err != nil {
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

func (w *WebSocketSessionStatusResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if w.AuthorizedSinceInActingVersion(actingVersion) {
		if w.AuthorizedSince != w.AuthorizedSinceNullValue() && (w.AuthorizedSince < w.AuthorizedSinceMinValue() || w.AuthorizedSince > w.AuthorizedSinceMaxValue()) {
			return fmt.Errorf("Range check failed on w.AuthorizedSince (%v < %v > %v)", w.AuthorizedSinceMinValue(), w.AuthorizedSince, w.AuthorizedSinceMaxValue())
		}
	}
	if w.ConnectedSinceInActingVersion(actingVersion) {
		if w.ConnectedSince < w.ConnectedSinceMinValue() || w.ConnectedSince > w.ConnectedSinceMaxValue() {
			return fmt.Errorf("Range check failed on w.ConnectedSince (%v < %v > %v)", w.ConnectedSinceMinValue(), w.ConnectedSince, w.ConnectedSinceMaxValue())
		}
	}
	if err := w.ReturnRateLimits.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if w.ServerTimeInActingVersion(actingVersion) {
		if w.ServerTime < w.ServerTimeMinValue() || w.ServerTime > w.ServerTimeMaxValue() {
			return fmt.Errorf("Range check failed on w.ServerTime (%v < %v > %v)", w.ServerTimeMinValue(), w.ServerTime, w.ServerTimeMaxValue())
		}
	}
	if err := w.UserDataStream.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if !utf8.Valid(w.LoggedOnApiKey[:]) {
		return errors.New("w.LoggedOnApiKey failed UTF-8 validation")
	}
	return nil
}

func WebSocketSessionStatusResponseInit(w *WebSocketSessionStatusResponse) {
	w.AuthorizedSince = math.MinInt64
	return
}

func (*WebSocketSessionStatusResponse) SbeBlockLength() (blockLength uint16) {
	return 26
}

func (*WebSocketSessionStatusResponse) SbeTemplateId() (templateId uint16) {
	return 52
}

func (*WebSocketSessionStatusResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*WebSocketSessionStatusResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*WebSocketSessionStatusResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*WebSocketSessionStatusResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*WebSocketSessionStatusResponse) AuthorizedSinceId() uint16 {
	return 1
}

func (*WebSocketSessionStatusResponse) AuthorizedSinceSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionStatusResponse) AuthorizedSinceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.AuthorizedSinceSinceVersion()
}

func (*WebSocketSessionStatusResponse) AuthorizedSinceDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionStatusResponse) AuthorizedSinceMetaAttribute(meta int) string {
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

func (*WebSocketSessionStatusResponse) AuthorizedSinceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionStatusResponse) AuthorizedSinceMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionStatusResponse) AuthorizedSinceNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionStatusResponse) ConnectedSinceId() uint16 {
	return 2
}

func (*WebSocketSessionStatusResponse) ConnectedSinceSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionStatusResponse) ConnectedSinceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ConnectedSinceSinceVersion()
}

func (*WebSocketSessionStatusResponse) ConnectedSinceDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionStatusResponse) ConnectedSinceMetaAttribute(meta int) string {
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

func (*WebSocketSessionStatusResponse) ConnectedSinceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionStatusResponse) ConnectedSinceMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionStatusResponse) ConnectedSinceNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionStatusResponse) ReturnRateLimitsId() uint16 {
	return 3
}

func (*WebSocketSessionStatusResponse) ReturnRateLimitsSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionStatusResponse) ReturnRateLimitsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ReturnRateLimitsSinceVersion()
}

func (*WebSocketSessionStatusResponse) ReturnRateLimitsDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionStatusResponse) ReturnRateLimitsMetaAttribute(meta int) string {
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

func (*WebSocketSessionStatusResponse) ServerTimeId() uint16 {
	return 4
}

func (*WebSocketSessionStatusResponse) ServerTimeSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionStatusResponse) ServerTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ServerTimeSinceVersion()
}

func (*WebSocketSessionStatusResponse) ServerTimeDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionStatusResponse) ServerTimeMetaAttribute(meta int) string {
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

func (*WebSocketSessionStatusResponse) ServerTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionStatusResponse) ServerTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionStatusResponse) ServerTimeNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionStatusResponse) UserDataStreamId() uint16 {
	return 5
}

func (*WebSocketSessionStatusResponse) UserDataStreamSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionStatusResponse) UserDataStreamInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.UserDataStreamSinceVersion()
}

func (*WebSocketSessionStatusResponse) UserDataStreamDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionStatusResponse) UserDataStreamMetaAttribute(meta int) string {
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

func (*WebSocketSessionStatusResponse) LoggedOnApiKeyMetaAttribute(meta int) string {
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

func (*WebSocketSessionStatusResponse) LoggedOnApiKeySinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionStatusResponse) LoggedOnApiKeyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.LoggedOnApiKeySinceVersion()
}

func (*WebSocketSessionStatusResponse) LoggedOnApiKeyDeprecated() uint16 {
	return 0
}

func (WebSocketSessionStatusResponse) LoggedOnApiKeyCharacterEncoding() string {
	return "UTF-8"
}

func (WebSocketSessionStatusResponse) LoggedOnApiKeyHeaderLength() uint64 {
	return 2
}
