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

type WebSocketSessionLogoutResponse struct {
	AuthorizedSince  int64
	ConnectedSince   int64
	ReturnRateLimits BoolEnumEnum
	ServerTime       int64
	UserDataStream   BoolEnumEnum
	LoggedOnApiKey   []uint8
}

func (w *WebSocketSessionLogoutResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (w *WebSocketSessionLogoutResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (w *WebSocketSessionLogoutResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func WebSocketSessionLogoutResponseInit(w *WebSocketSessionLogoutResponse) {
	w.AuthorizedSince = math.MinInt64
	return
}

func (*WebSocketSessionLogoutResponse) SbeBlockLength() (blockLength uint16) {
	return 26
}

func (*WebSocketSessionLogoutResponse) SbeTemplateId() (templateId uint16) {
	return 53
}

func (*WebSocketSessionLogoutResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*WebSocketSessionLogoutResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*WebSocketSessionLogoutResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*WebSocketSessionLogoutResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*WebSocketSessionLogoutResponse) AuthorizedSinceId() uint16 {
	return 1
}

func (*WebSocketSessionLogoutResponse) AuthorizedSinceSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogoutResponse) AuthorizedSinceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.AuthorizedSinceSinceVersion()
}

func (*WebSocketSessionLogoutResponse) AuthorizedSinceDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogoutResponse) AuthorizedSinceMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogoutResponse) AuthorizedSinceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionLogoutResponse) AuthorizedSinceMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionLogoutResponse) AuthorizedSinceNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionLogoutResponse) ConnectedSinceId() uint16 {
	return 2
}

func (*WebSocketSessionLogoutResponse) ConnectedSinceSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogoutResponse) ConnectedSinceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ConnectedSinceSinceVersion()
}

func (*WebSocketSessionLogoutResponse) ConnectedSinceDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogoutResponse) ConnectedSinceMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogoutResponse) ConnectedSinceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionLogoutResponse) ConnectedSinceMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionLogoutResponse) ConnectedSinceNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionLogoutResponse) ReturnRateLimitsId() uint16 {
	return 3
}

func (*WebSocketSessionLogoutResponse) ReturnRateLimitsSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogoutResponse) ReturnRateLimitsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ReturnRateLimitsSinceVersion()
}

func (*WebSocketSessionLogoutResponse) ReturnRateLimitsDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogoutResponse) ReturnRateLimitsMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogoutResponse) ServerTimeId() uint16 {
	return 4
}

func (*WebSocketSessionLogoutResponse) ServerTimeSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogoutResponse) ServerTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ServerTimeSinceVersion()
}

func (*WebSocketSessionLogoutResponse) ServerTimeDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogoutResponse) ServerTimeMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogoutResponse) ServerTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionLogoutResponse) ServerTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionLogoutResponse) ServerTimeNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionLogoutResponse) UserDataStreamId() uint16 {
	return 5
}

func (*WebSocketSessionLogoutResponse) UserDataStreamSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogoutResponse) UserDataStreamInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.UserDataStreamSinceVersion()
}

func (*WebSocketSessionLogoutResponse) UserDataStreamDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogoutResponse) UserDataStreamMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogoutResponse) LoggedOnApiKeyMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogoutResponse) LoggedOnApiKeySinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogoutResponse) LoggedOnApiKeyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.LoggedOnApiKeySinceVersion()
}

func (*WebSocketSessionLogoutResponse) LoggedOnApiKeyDeprecated() uint16 {
	return 0
}

func (WebSocketSessionLogoutResponse) LoggedOnApiKeyCharacterEncoding() string {
	return "UTF-8"
}

func (WebSocketSessionLogoutResponse) LoggedOnApiKeyHeaderLength() uint64 {
	return 2
}
