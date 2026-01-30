// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type WebSocketSessionSubscriptionsResponse struct {
	Subscriptions []WebSocketSessionSubscriptionsResponseSubscriptions
}
type WebSocketSessionSubscriptionsResponseSubscriptions struct {
	SubscriptionId uint16
	ExpirationTime int64
}

func (w *WebSocketSessionSubscriptionsResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := w.RangeCheck(w.SbeSchemaVersion(), w.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var SubscriptionsBlockLength uint16 = 10
	if err := _m.WriteUint16(_w, SubscriptionsBlockLength); err != nil {
		return err
	}
	var SubscriptionsNumInGroup uint32 = uint32(len(w.Subscriptions))
	if err := _m.WriteUint32(_w, SubscriptionsNumInGroup); err != nil {
		return err
	}
	for i := range w.Subscriptions {
		if err := w.Subscriptions[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (w *WebSocketSessionSubscriptionsResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > w.SbeSchemaVersion() && blockLength > w.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-w.SbeBlockLength()))
	}

	if w.SubscriptionsInActingVersion(actingVersion) {
		var SubscriptionsBlockLength uint16
		if err := _m.ReadUint16(_r, &SubscriptionsBlockLength); err != nil {
			return err
		}
		var SubscriptionsNumInGroup uint32
		if err := _m.ReadUint32(_r, &SubscriptionsNumInGroup); err != nil {
			return err
		}
		if cap(w.Subscriptions) < int(SubscriptionsNumInGroup) {
			w.Subscriptions = make([]WebSocketSessionSubscriptionsResponseSubscriptions, SubscriptionsNumInGroup)
		}
		w.Subscriptions = w.Subscriptions[:SubscriptionsNumInGroup]
		for i := range w.Subscriptions {
			if err := w.Subscriptions[i].Decode(_m, _r, actingVersion, uint(SubscriptionsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := w.RangeCheck(actingVersion, w.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (w *WebSocketSessionSubscriptionsResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range w.Subscriptions {
		if err := w.Subscriptions[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func WebSocketSessionSubscriptionsResponseInit(w *WebSocketSessionSubscriptionsResponse) {
	return
}

func (w *WebSocketSessionSubscriptionsResponseSubscriptions) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint16(_w, w.SubscriptionId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, w.ExpirationTime); err != nil {
		return err
	}
	return nil
}

func (w *WebSocketSessionSubscriptionsResponseSubscriptions) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !w.SubscriptionIdInActingVersion(actingVersion) {
		w.SubscriptionId = w.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &w.SubscriptionId); err != nil {
			return err
		}
	}
	if !w.ExpirationTimeInActingVersion(actingVersion) {
		w.ExpirationTime = w.ExpirationTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &w.ExpirationTime); err != nil {
			return err
		}
	}
	if actingVersion > w.SbeSchemaVersion() && blockLength > w.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-w.SbeBlockLength()))
	}
	return nil
}

func (w *WebSocketSessionSubscriptionsResponseSubscriptions) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if w.SubscriptionIdInActingVersion(actingVersion) {
		if w.SubscriptionId < w.SubscriptionIdMinValue() || w.SubscriptionId > w.SubscriptionIdMaxValue() {
			return fmt.Errorf("Range check failed on w.SubscriptionId (%v < %v > %v)", w.SubscriptionIdMinValue(), w.SubscriptionId, w.SubscriptionIdMaxValue())
		}
	}
	if w.ExpirationTimeInActingVersion(actingVersion) {
		if w.ExpirationTime != w.ExpirationTimeNullValue() && (w.ExpirationTime < w.ExpirationTimeMinValue() || w.ExpirationTime > w.ExpirationTimeMaxValue()) {
			return fmt.Errorf("Range check failed on w.ExpirationTime (%v < %v > %v)", w.ExpirationTimeMinValue(), w.ExpirationTime, w.ExpirationTimeMaxValue())
		}
	}
	return nil
}

func WebSocketSessionSubscriptionsResponseSubscriptionsInit(w *WebSocketSessionSubscriptionsResponseSubscriptions) {
	w.ExpirationTime = math.MinInt64
	return
}

func (*WebSocketSessionSubscriptionsResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*WebSocketSessionSubscriptionsResponse) SbeTemplateId() (templateId uint16) {
	return 54
}

func (*WebSocketSessionSubscriptionsResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*WebSocketSessionSubscriptionsResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*WebSocketSessionSubscriptionsResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*WebSocketSessionSubscriptionsResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdId() uint16 {
	return 1
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.SubscriptionIdSinceVersion()
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdMetaAttribute(meta int) string {
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

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeId() uint16 {
	return 2
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.ExpirationTimeSinceVersion()
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeMetaAttribute(meta int) string {
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

func (*WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) ExpirationTimeNullValue() int64 {
	return math.MinInt64
}

func (*WebSocketSessionSubscriptionsResponse) SubscriptionsId() uint16 {
	return 100
}

func (*WebSocketSessionSubscriptionsResponse) SubscriptionsSinceVersion() uint16 {
	return 0
}

func (w *WebSocketSessionSubscriptionsResponse) SubscriptionsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= w.SubscriptionsSinceVersion()
}

func (*WebSocketSessionSubscriptionsResponse) SubscriptionsDeprecated() uint16 {
	return 0
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SbeBlockLength() (blockLength uint) {
	return 10
}

func (*WebSocketSessionSubscriptionsResponseSubscriptions) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}
