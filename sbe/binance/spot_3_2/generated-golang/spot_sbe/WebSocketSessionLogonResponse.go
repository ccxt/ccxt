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

type WebSocketSessionLogonResponse struct {
	AuthorizedSince  int64
	ConnectedSince   int64
	ReturnRateLimits BoolEnumEnum
	ServerTime       int64
	UserDataStream   BoolEnumEnum
	LoggedOnApiKey   []uint8
}

func (w *WebSocketSessionLogonResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (w *WebSocketSessionLogonResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (w *WebSocketSessionLogonResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if w.AuthorizedSinceInActingVersion(actingVersion) {
		if w.AuthorizedSince < w.AuthorizedSinceMinValue() || w.AuthorizedSince > w.AuthorizedSinceMaxValue() {
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

func WebSocketSessionLogonResponseInit(w *WebSocketSessionLogonResponse) {
	return
}

func (*WebSocketSessionLogonResponse) SbeBlockLength() (blockLength uint16) {
	return 26
}

func (*WebSocketSessionLogonResponse) SbeTemplateId() (templateId uint16) {
	return 51
}

func (*WebSocketSessionLogonResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*WebSocketSessionLogonResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*WebSocketSessionLogonResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*WebSocketSessionLogonResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*WebSocketSessionLogonResponse) AuthorizedSinceId() uint16 {
	return 1
}

func (*WebSocketSessionLogonResponse) AuthorizedSinceSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogonResponse) AuthorizedSinceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.AuthorizedSinceSinceVersion()
}

func (*WebSocketSessionLogonResponse) AuthorizedSinceDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogonResponse) AuthorizedSinceMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogonResponse) AuthorizedSinceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionLogonResponse) AuthorizedSinceMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionLogonResponse) AuthorizedSinceNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionLogonResponse) ConnectedSinceId() uint16 {
	return 2
}

func (*WebSocketSessionLogonResponse) ConnectedSinceSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogonResponse) ConnectedSinceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ConnectedSinceSinceVersion()
}

func (*WebSocketSessionLogonResponse) ConnectedSinceDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogonResponse) ConnectedSinceMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogonResponse) ConnectedSinceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionLogonResponse) ConnectedSinceMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionLogonResponse) ConnectedSinceNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionLogonResponse) ReturnRateLimitsId() uint16 {
	return 3
}

func (*WebSocketSessionLogonResponse) ReturnRateLimitsSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogonResponse) ReturnRateLimitsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ReturnRateLimitsSinceVersion()
}

func (*WebSocketSessionLogonResponse) ReturnRateLimitsDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogonResponse) ReturnRateLimitsMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogonResponse) ServerTimeId() uint16 {
	return 4
}

func (*WebSocketSessionLogonResponse) ServerTimeSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogonResponse) ServerTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ServerTimeSinceVersion()
}

func (*WebSocketSessionLogonResponse) ServerTimeDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogonResponse) ServerTimeMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogonResponse) ServerTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionLogonResponse) ServerTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionLogonResponse) ServerTimeNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionLogonResponse) UserDataStreamId() uint16 {
	return 5
}

func (*WebSocketSessionLogonResponse) UserDataStreamSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogonResponse) UserDataStreamInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.UserDataStreamSinceVersion()
}

func (*WebSocketSessionLogonResponse) UserDataStreamDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionLogonResponse) UserDataStreamMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogonResponse) LoggedOnApiKeyMetaAttribute(meta int) string {
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

func (*WebSocketSessionLogonResponse) LoggedOnApiKeySinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionLogonResponse) LoggedOnApiKeyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.LoggedOnApiKeySinceVersion()
}

func (*WebSocketSessionLogonResponse) LoggedOnApiKeyDeprecated() uint16 {
	return 0
}

func (WebSocketSessionLogonResponse) LoggedOnApiKeyCharacterEncoding() string {
	return "UTF-8"
}

func (WebSocketSessionLogonResponse) LoggedOnApiKeyHeaderLength() uint64 {
	return 2
}
