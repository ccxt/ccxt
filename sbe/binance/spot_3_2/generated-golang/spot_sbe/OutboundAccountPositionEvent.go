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

type OutboundAccountPositionEvent struct {
	EventTime      int64
	UpdateTime     int64
	SubscriptionId uint16
	Balances       []OutboundAccountPositionEventBalances
}
type OutboundAccountPositionEventBalances struct {
	Exponent int8
	Free     int64
	Locked   int64
	Asset    []uint8
}

func (o *OutboundAccountPositionEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, o.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.UpdateTime); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, o.SubscriptionId); err != nil {
		return err
	}
	var BalancesBlockLength uint16 = 17
	if err := _m.WriteUint16(_w, BalancesBlockLength); err != nil {
		return err
	}
	var BalancesNumInGroup uint32 = uint32(len(o.Balances))
	if err := _m.WriteUint32(_w, BalancesNumInGroup); err != nil {
		return err
	}
	for i := range o.Balances {
		if err := o.Balances[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (o *OutboundAccountPositionEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !o.EventTimeInActingVersion(actingVersion) {
		o.EventTime = o.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.EventTime); err != nil {
			return err
		}
	}
	if !o.UpdateTimeInActingVersion(actingVersion) {
		o.UpdateTime = o.UpdateTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.UpdateTime); err != nil {
			return err
		}
	}
	if !o.SubscriptionIdInActingVersion(actingVersion) {
		o.SubscriptionId = o.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &o.SubscriptionId); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.BalancesInActingVersion(actingVersion) {
		var BalancesBlockLength uint16
		if err := _m.ReadUint16(_r, &BalancesBlockLength); err != nil {
			return err
		}
		var BalancesNumInGroup uint32
		if err := _m.ReadUint32(_r, &BalancesNumInGroup); err != nil {
			return err
		}
		if cap(o.Balances) < int(BalancesNumInGroup) {
			o.Balances = make([]OutboundAccountPositionEventBalances, BalancesNumInGroup)
		}
		o.Balances = o.Balances[:BalancesNumInGroup]
		for i := range o.Balances {
			if err := o.Balances[i].Decode(_m, _r, actingVersion, uint(BalancesBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OutboundAccountPositionEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.EventTimeInActingVersion(actingVersion) {
		if o.EventTime < o.EventTimeMinValue() || o.EventTime > o.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on o.EventTime (%v < %v > %v)", o.EventTimeMinValue(), o.EventTime, o.EventTimeMaxValue())
		}
	}
	if o.UpdateTimeInActingVersion(actingVersion) {
		if o.UpdateTime < o.UpdateTimeMinValue() || o.UpdateTime > o.UpdateTimeMaxValue() {
			return fmt.Errorf("Range check failed on o.UpdateTime (%v < %v > %v)", o.UpdateTimeMinValue(), o.UpdateTime, o.UpdateTimeMaxValue())
		}
	}
	if o.SubscriptionIdInActingVersion(actingVersion) {
		if o.SubscriptionId != o.SubscriptionIdNullValue() && (o.SubscriptionId < o.SubscriptionIdMinValue() || o.SubscriptionId > o.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on o.SubscriptionId (%v < %v > %v)", o.SubscriptionIdMinValue(), o.SubscriptionId, o.SubscriptionIdMaxValue())
		}
	}
	for i := range o.Balances {
		if err := o.Balances[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func OutboundAccountPositionEventInit(o *OutboundAccountPositionEvent) {
	o.SubscriptionId = math.MaxUint16
	return
}

func (o *OutboundAccountPositionEventBalances) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, o.Exponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Free); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Locked); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Asset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Asset); err != nil {
		return err
	}
	return nil
}

func (o *OutboundAccountPositionEventBalances) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !o.ExponentInActingVersion(actingVersion) {
		o.Exponent = o.ExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &o.Exponent); err != nil {
			return err
		}
	}
	if !o.FreeInActingVersion(actingVersion) {
		o.Free = o.FreeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Free); err != nil {
			return err
		}
	}
	if !o.LockedInActingVersion(actingVersion) {
		o.Locked = o.LockedNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Locked); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.AssetInActingVersion(actingVersion) {
		var AssetLength uint8
		if err := _m.ReadUint8(_r, &AssetLength); err != nil {
			return err
		}
		if cap(o.Asset) < int(AssetLength) {
			o.Asset = make([]uint8, AssetLength)
		}
		o.Asset = o.Asset[:AssetLength]
		if err := _m.ReadBytes(_r, o.Asset); err != nil {
			return err
		}
	}
	return nil
}

func (o *OutboundAccountPositionEventBalances) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.ExponentInActingVersion(actingVersion) {
		if o.Exponent < o.ExponentMinValue() || o.Exponent > o.ExponentMaxValue() {
			return fmt.Errorf("Range check failed on o.Exponent (%v < %v > %v)", o.ExponentMinValue(), o.Exponent, o.ExponentMaxValue())
		}
	}
	if o.FreeInActingVersion(actingVersion) {
		if o.Free < o.FreeMinValue() || o.Free > o.FreeMaxValue() {
			return fmt.Errorf("Range check failed on o.Free (%v < %v > %v)", o.FreeMinValue(), o.Free, o.FreeMaxValue())
		}
	}
	if o.LockedInActingVersion(actingVersion) {
		if o.Locked < o.LockedMinValue() || o.Locked > o.LockedMaxValue() {
			return fmt.Errorf("Range check failed on o.Locked (%v < %v > %v)", o.LockedMinValue(), o.Locked, o.LockedMaxValue())
		}
	}
	if !utf8.Valid(o.Asset[:]) {
		return errors.New("o.Asset failed UTF-8 validation")
	}
	return nil
}

func OutboundAccountPositionEventBalancesInit(o *OutboundAccountPositionEventBalances) {
	return
}

func (*OutboundAccountPositionEvent) SbeBlockLength() (blockLength uint16) {
	return 18
}

func (*OutboundAccountPositionEvent) SbeTemplateId() (templateId uint16) {
	return 607
}

func (*OutboundAccountPositionEvent) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OutboundAccountPositionEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*OutboundAccountPositionEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OutboundAccountPositionEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OutboundAccountPositionEvent) EventTimeId() uint16 {
	return 1
}

func (*OutboundAccountPositionEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (o *OutboundAccountPositionEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.EventTimeSinceVersion()
}

func (*OutboundAccountPositionEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*OutboundAccountPositionEvent) EventTimeMetaAttribute(meta int) string {
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

func (*OutboundAccountPositionEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OutboundAccountPositionEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OutboundAccountPositionEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*OutboundAccountPositionEvent) UpdateTimeId() uint16 {
	return 2
}

func (*OutboundAccountPositionEvent) UpdateTimeSinceVersion() uint16 {
	return 0
}

func (o *OutboundAccountPositionEvent) UpdateTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UpdateTimeSinceVersion()
}

func (*OutboundAccountPositionEvent) UpdateTimeDeprecated() uint16 {
	return 0
}

func (*OutboundAccountPositionEvent) UpdateTimeMetaAttribute(meta int) string {
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

func (*OutboundAccountPositionEvent) UpdateTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OutboundAccountPositionEvent) UpdateTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OutboundAccountPositionEvent) UpdateTimeNullValue() int64 {
	return math.MinInt64
}

func (*OutboundAccountPositionEvent) SubscriptionIdId() uint16 {
	return 3
}

func (*OutboundAccountPositionEvent) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (o *OutboundAccountPositionEvent) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SubscriptionIdSinceVersion()
}

func (*OutboundAccountPositionEvent) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*OutboundAccountPositionEvent) SubscriptionIdMetaAttribute(meta int) string {
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

func (*OutboundAccountPositionEvent) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*OutboundAccountPositionEvent) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*OutboundAccountPositionEvent) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*OutboundAccountPositionEventBalances) ExponentId() uint16 {
	return 1
}

func (*OutboundAccountPositionEventBalances) ExponentSinceVersion() uint16 {
	return 0
}

func (o *OutboundAccountPositionEventBalances) ExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExponentSinceVersion()
}

func (*OutboundAccountPositionEventBalances) ExponentDeprecated() uint16 {
	return 0
}

func (*OutboundAccountPositionEventBalances) ExponentMetaAttribute(meta int) string {
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

func (*OutboundAccountPositionEventBalances) ExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OutboundAccountPositionEventBalances) ExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OutboundAccountPositionEventBalances) ExponentNullValue() int8 {
	return math.MinInt8
}

func (*OutboundAccountPositionEventBalances) FreeId() uint16 {
	return 2
}

func (*OutboundAccountPositionEventBalances) FreeSinceVersion() uint16 {
	return 0
}

func (o *OutboundAccountPositionEventBalances) FreeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.FreeSinceVersion()
}

func (*OutboundAccountPositionEventBalances) FreeDeprecated() uint16 {
	return 0
}

func (*OutboundAccountPositionEventBalances) FreeMetaAttribute(meta int) string {
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

func (*OutboundAccountPositionEventBalances) FreeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OutboundAccountPositionEventBalances) FreeMaxValue() int64 {
	return math.MaxInt64
}

func (*OutboundAccountPositionEventBalances) FreeNullValue() int64 {
	return math.MinInt64
}

func (*OutboundAccountPositionEventBalances) LockedId() uint16 {
	return 3
}

func (*OutboundAccountPositionEventBalances) LockedSinceVersion() uint16 {
	return 0
}

func (o *OutboundAccountPositionEventBalances) LockedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LockedSinceVersion()
}

func (*OutboundAccountPositionEventBalances) LockedDeprecated() uint16 {
	return 0
}

func (*OutboundAccountPositionEventBalances) LockedMetaAttribute(meta int) string {
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

func (*OutboundAccountPositionEventBalances) LockedMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OutboundAccountPositionEventBalances) LockedMaxValue() int64 {
	return math.MaxInt64
}

func (*OutboundAccountPositionEventBalances) LockedNullValue() int64 {
	return math.MinInt64
}

func (*OutboundAccountPositionEventBalances) AssetMetaAttribute(meta int) string {
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

func (*OutboundAccountPositionEventBalances) AssetSinceVersion() uint16 {
	return 0
}

func (o *OutboundAccountPositionEventBalances) AssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.AssetSinceVersion()
}

func (*OutboundAccountPositionEventBalances) AssetDeprecated() uint16 {
	return 0
}

func (OutboundAccountPositionEventBalances) AssetCharacterEncoding() string {
	return "UTF-8"
}

func (OutboundAccountPositionEventBalances) AssetHeaderLength() uint64 {
	return 1
}

func (*OutboundAccountPositionEvent) BalancesId() uint16 {
	return 100
}

func (*OutboundAccountPositionEvent) BalancesSinceVersion() uint16 {
	return 0
}

func (o *OutboundAccountPositionEvent) BalancesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.BalancesSinceVersion()
}

func (*OutboundAccountPositionEvent) BalancesDeprecated() uint16 {
	return 0
}

func (*OutboundAccountPositionEventBalances) SbeBlockLength() (blockLength uint) {
	return 17
}

func (*OutboundAccountPositionEventBalances) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
