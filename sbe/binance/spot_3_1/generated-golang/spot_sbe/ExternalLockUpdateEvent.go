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

type ExternalLockUpdateEvent struct {
	EventTime      int64
	ClearTime      int64
	QtyExponent    int8
	LockedQtyDelta int64
	SubscriptionId uint16
	Asset          []uint8
}

func (e *ExternalLockUpdateEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, e.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.ClearTime); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, e.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.LockedQtyDelta); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, e.SubscriptionId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.Asset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Asset); err != nil {
		return err
	}
	return nil
}

func (e *ExternalLockUpdateEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !e.EventTimeInActingVersion(actingVersion) {
		e.EventTime = e.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.EventTime); err != nil {
			return err
		}
	}
	if !e.ClearTimeInActingVersion(actingVersion) {
		e.ClearTime = e.ClearTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.ClearTime); err != nil {
			return err
		}
	}
	if !e.QtyExponentInActingVersion(actingVersion) {
		e.QtyExponent = e.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &e.QtyExponent); err != nil {
			return err
		}
	}
	if !e.LockedQtyDeltaInActingVersion(actingVersion) {
		e.LockedQtyDelta = e.LockedQtyDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.LockedQtyDelta); err != nil {
			return err
		}
	}
	if !e.SubscriptionIdInActingVersion(actingVersion) {
		e.SubscriptionId = e.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &e.SubscriptionId); err != nil {
			return err
		}
	}
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.AssetInActingVersion(actingVersion) {
		var AssetLength uint8
		if err := _m.ReadUint8(_r, &AssetLength); err != nil {
			return err
		}
		if cap(e.Asset) < int(AssetLength) {
			e.Asset = make([]uint8, AssetLength)
		}
		e.Asset = e.Asset[:AssetLength]
		if err := _m.ReadBytes(_r, e.Asset); err != nil {
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

func (e *ExternalLockUpdateEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if e.EventTimeInActingVersion(actingVersion) {
		if e.EventTime < e.EventTimeMinValue() || e.EventTime > e.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on e.EventTime (%v < %v > %v)", e.EventTimeMinValue(), e.EventTime, e.EventTimeMaxValue())
		}
	}
	if e.ClearTimeInActingVersion(actingVersion) {
		if e.ClearTime < e.ClearTimeMinValue() || e.ClearTime > e.ClearTimeMaxValue() {
			return fmt.Errorf("Range check failed on e.ClearTime (%v < %v > %v)", e.ClearTimeMinValue(), e.ClearTime, e.ClearTimeMaxValue())
		}
	}
	if e.QtyExponentInActingVersion(actingVersion) {
		if e.QtyExponent < e.QtyExponentMinValue() || e.QtyExponent > e.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on e.QtyExponent (%v < %v > %v)", e.QtyExponentMinValue(), e.QtyExponent, e.QtyExponentMaxValue())
		}
	}
	if e.LockedQtyDeltaInActingVersion(actingVersion) {
		if e.LockedQtyDelta < e.LockedQtyDeltaMinValue() || e.LockedQtyDelta > e.LockedQtyDeltaMaxValue() {
			return fmt.Errorf("Range check failed on e.LockedQtyDelta (%v < %v > %v)", e.LockedQtyDeltaMinValue(), e.LockedQtyDelta, e.LockedQtyDeltaMaxValue())
		}
	}
	if e.SubscriptionIdInActingVersion(actingVersion) {
		if e.SubscriptionId != e.SubscriptionIdNullValue() && (e.SubscriptionId < e.SubscriptionIdMinValue() || e.SubscriptionId > e.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.SubscriptionId (%v < %v > %v)", e.SubscriptionIdMinValue(), e.SubscriptionId, e.SubscriptionIdMaxValue())
		}
	}
	if !utf8.Valid(e.Asset[:]) {
		return errors.New("e.Asset failed UTF-8 validation")
	}
	return nil
}

func ExternalLockUpdateEventInit(e *ExternalLockUpdateEvent) {
	e.SubscriptionId = math.MaxUint16
	return
}

func (*ExternalLockUpdateEvent) SbeBlockLength() (blockLength uint16) {
	return 27
}

func (*ExternalLockUpdateEvent) SbeTemplateId() (templateId uint16) {
	return 604
}

func (*ExternalLockUpdateEvent) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ExternalLockUpdateEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*ExternalLockUpdateEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ExternalLockUpdateEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ExternalLockUpdateEvent) EventTimeId() uint16 {
	return 1
}

func (*ExternalLockUpdateEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (e *ExternalLockUpdateEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.EventTimeSinceVersion()
}

func (*ExternalLockUpdateEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*ExternalLockUpdateEvent) EventTimeMetaAttribute(meta int) string {
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

func (*ExternalLockUpdateEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExternalLockUpdateEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ExternalLockUpdateEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*ExternalLockUpdateEvent) ClearTimeId() uint16 {
	return 2
}

func (*ExternalLockUpdateEvent) ClearTimeSinceVersion() uint16 {
	return 0
}

func (e *ExternalLockUpdateEvent) ClearTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ClearTimeSinceVersion()
}

func (*ExternalLockUpdateEvent) ClearTimeDeprecated() uint16 {
	return 0
}

func (*ExternalLockUpdateEvent) ClearTimeMetaAttribute(meta int) string {
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

func (*ExternalLockUpdateEvent) ClearTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExternalLockUpdateEvent) ClearTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ExternalLockUpdateEvent) ClearTimeNullValue() int64 {
	return math.MinInt64
}

func (*ExternalLockUpdateEvent) QtyExponentId() uint16 {
	return 3
}

func (*ExternalLockUpdateEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (e *ExternalLockUpdateEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.QtyExponentSinceVersion()
}

func (*ExternalLockUpdateEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*ExternalLockUpdateEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*ExternalLockUpdateEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*ExternalLockUpdateEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*ExternalLockUpdateEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*ExternalLockUpdateEvent) LockedQtyDeltaId() uint16 {
	return 4
}

func (*ExternalLockUpdateEvent) LockedQtyDeltaSinceVersion() uint16 {
	return 0
}

func (e *ExternalLockUpdateEvent) LockedQtyDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.LockedQtyDeltaSinceVersion()
}

func (*ExternalLockUpdateEvent) LockedQtyDeltaDeprecated() uint16 {
	return 0
}

func (*ExternalLockUpdateEvent) LockedQtyDeltaMetaAttribute(meta int) string {
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

func (*ExternalLockUpdateEvent) LockedQtyDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExternalLockUpdateEvent) LockedQtyDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*ExternalLockUpdateEvent) LockedQtyDeltaNullValue() int64 {
	return math.MinInt64
}

func (*ExternalLockUpdateEvent) SubscriptionIdId() uint16 {
	return 5
}

func (*ExternalLockUpdateEvent) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (e *ExternalLockUpdateEvent) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SubscriptionIdSinceVersion()
}

func (*ExternalLockUpdateEvent) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*ExternalLockUpdateEvent) SubscriptionIdMetaAttribute(meta int) string {
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

func (*ExternalLockUpdateEvent) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*ExternalLockUpdateEvent) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*ExternalLockUpdateEvent) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*ExternalLockUpdateEvent) AssetMetaAttribute(meta int) string {
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

func (*ExternalLockUpdateEvent) AssetSinceVersion() uint16 {
	return 0
}

func (e *ExternalLockUpdateEvent) AssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.AssetSinceVersion()
}

func (*ExternalLockUpdateEvent) AssetDeprecated() uint16 {
	return 0
}

func (ExternalLockUpdateEvent) AssetCharacterEncoding() string {
	return "UTF-8"
}

func (ExternalLockUpdateEvent) AssetHeaderLength() uint64 {
	return 1
}
