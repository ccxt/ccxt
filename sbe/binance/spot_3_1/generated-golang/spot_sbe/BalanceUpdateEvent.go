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

type BalanceUpdateEvent struct {
	EventTime      int64
	ClearTime      int64
	QtyExponent    int8
	FreeQtyDelta   int64
	SubscriptionId uint16
	Asset          []uint8
}

func (b *BalanceUpdateEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := b.RangeCheck(b.SbeSchemaVersion(), b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, b.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.ClearTime); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, b.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.FreeQtyDelta); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, b.SubscriptionId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(b.Asset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, b.Asset); err != nil {
		return err
	}
	return nil
}

func (b *BalanceUpdateEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !b.EventTimeInActingVersion(actingVersion) {
		b.EventTime = b.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.EventTime); err != nil {
			return err
		}
	}
	if !b.ClearTimeInActingVersion(actingVersion) {
		b.ClearTime = b.ClearTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.ClearTime); err != nil {
			return err
		}
	}
	if !b.QtyExponentInActingVersion(actingVersion) {
		b.QtyExponent = b.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &b.QtyExponent); err != nil {
			return err
		}
	}
	if !b.FreeQtyDeltaInActingVersion(actingVersion) {
		b.FreeQtyDelta = b.FreeQtyDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.FreeQtyDelta); err != nil {
			return err
		}
	}
	if !b.SubscriptionIdInActingVersion(actingVersion) {
		b.SubscriptionId = b.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &b.SubscriptionId); err != nil {
			return err
		}
	}
	if actingVersion > b.SbeSchemaVersion() && blockLength > b.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-b.SbeBlockLength()))
	}

	if b.AssetInActingVersion(actingVersion) {
		var AssetLength uint8
		if err := _m.ReadUint8(_r, &AssetLength); err != nil {
			return err
		}
		if cap(b.Asset) < int(AssetLength) {
			b.Asset = make([]uint8, AssetLength)
		}
		b.Asset = b.Asset[:AssetLength]
		if err := _m.ReadBytes(_r, b.Asset); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := b.RangeCheck(actingVersion, b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (b *BalanceUpdateEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if b.EventTimeInActingVersion(actingVersion) {
		if b.EventTime < b.EventTimeMinValue() || b.EventTime > b.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on b.EventTime (%v < %v > %v)", b.EventTimeMinValue(), b.EventTime, b.EventTimeMaxValue())
		}
	}
	if b.ClearTimeInActingVersion(actingVersion) {
		if b.ClearTime != b.ClearTimeNullValue() && (b.ClearTime < b.ClearTimeMinValue() || b.ClearTime > b.ClearTimeMaxValue()) {
			return fmt.Errorf("Range check failed on b.ClearTime (%v < %v > %v)", b.ClearTimeMinValue(), b.ClearTime, b.ClearTimeMaxValue())
		}
	}
	if b.QtyExponentInActingVersion(actingVersion) {
		if b.QtyExponent < b.QtyExponentMinValue() || b.QtyExponent > b.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on b.QtyExponent (%v < %v > %v)", b.QtyExponentMinValue(), b.QtyExponent, b.QtyExponentMaxValue())
		}
	}
	if b.FreeQtyDeltaInActingVersion(actingVersion) {
		if b.FreeQtyDelta < b.FreeQtyDeltaMinValue() || b.FreeQtyDelta > b.FreeQtyDeltaMaxValue() {
			return fmt.Errorf("Range check failed on b.FreeQtyDelta (%v < %v > %v)", b.FreeQtyDeltaMinValue(), b.FreeQtyDelta, b.FreeQtyDeltaMaxValue())
		}
	}
	if b.SubscriptionIdInActingVersion(actingVersion) {
		if b.SubscriptionId != b.SubscriptionIdNullValue() && (b.SubscriptionId < b.SubscriptionIdMinValue() || b.SubscriptionId > b.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on b.SubscriptionId (%v < %v > %v)", b.SubscriptionIdMinValue(), b.SubscriptionId, b.SubscriptionIdMaxValue())
		}
	}
	if !utf8.Valid(b.Asset[:]) {
		return errors.New("b.Asset failed UTF-8 validation")
	}
	return nil
}

func BalanceUpdateEventInit(b *BalanceUpdateEvent) {
	b.ClearTime = math.MinInt64
	b.SubscriptionId = math.MaxUint16
	return
}

func (*BalanceUpdateEvent) SbeBlockLength() (blockLength uint16) {
	return 27
}

func (*BalanceUpdateEvent) SbeTemplateId() (templateId uint16) {
	return 601
}

func (*BalanceUpdateEvent) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*BalanceUpdateEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*BalanceUpdateEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BalanceUpdateEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*BalanceUpdateEvent) EventTimeId() uint16 {
	return 1
}

func (*BalanceUpdateEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (b *BalanceUpdateEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.EventTimeSinceVersion()
}

func (*BalanceUpdateEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*BalanceUpdateEvent) EventTimeMetaAttribute(meta int) string {
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

func (*BalanceUpdateEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BalanceUpdateEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BalanceUpdateEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*BalanceUpdateEvent) ClearTimeId() uint16 {
	return 2
}

func (*BalanceUpdateEvent) ClearTimeSinceVersion() uint16 {
	return 0
}

func (b *BalanceUpdateEvent) ClearTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.ClearTimeSinceVersion()
}

func (*BalanceUpdateEvent) ClearTimeDeprecated() uint16 {
	return 0
}

func (*BalanceUpdateEvent) ClearTimeMetaAttribute(meta int) string {
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

func (*BalanceUpdateEvent) ClearTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BalanceUpdateEvent) ClearTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BalanceUpdateEvent) ClearTimeNullValue() int64 {
	return math.MinInt64
}

func (*BalanceUpdateEvent) QtyExponentId() uint16 {
	return 3
}

func (*BalanceUpdateEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (b *BalanceUpdateEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.QtyExponentSinceVersion()
}

func (*BalanceUpdateEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*BalanceUpdateEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*BalanceUpdateEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BalanceUpdateEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BalanceUpdateEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*BalanceUpdateEvent) FreeQtyDeltaId() uint16 {
	return 4
}

func (*BalanceUpdateEvent) FreeQtyDeltaSinceVersion() uint16 {
	return 0
}

func (b *BalanceUpdateEvent) FreeQtyDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.FreeQtyDeltaSinceVersion()
}

func (*BalanceUpdateEvent) FreeQtyDeltaDeprecated() uint16 {
	return 0
}

func (*BalanceUpdateEvent) FreeQtyDeltaMetaAttribute(meta int) string {
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

func (*BalanceUpdateEvent) FreeQtyDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BalanceUpdateEvent) FreeQtyDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*BalanceUpdateEvent) FreeQtyDeltaNullValue() int64 {
	return math.MinInt64
}

func (*BalanceUpdateEvent) SubscriptionIdId() uint16 {
	return 5
}

func (*BalanceUpdateEvent) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (b *BalanceUpdateEvent) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SubscriptionIdSinceVersion()
}

func (*BalanceUpdateEvent) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*BalanceUpdateEvent) SubscriptionIdMetaAttribute(meta int) string {
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

func (*BalanceUpdateEvent) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*BalanceUpdateEvent) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*BalanceUpdateEvent) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*BalanceUpdateEvent) AssetMetaAttribute(meta int) string {
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

func (*BalanceUpdateEvent) AssetSinceVersion() uint16 {
	return 0
}

func (b *BalanceUpdateEvent) AssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AssetSinceVersion()
}

func (*BalanceUpdateEvent) AssetDeprecated() uint16 {
	return 0
}

func (BalanceUpdateEvent) AssetCharacterEncoding() string {
	return "UTF-8"
}

func (BalanceUpdateEvent) AssetHeaderLength() uint64 {
	return 1
}
