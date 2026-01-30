// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type TPlusFilterLockEvent struct {
	EventTime      int64
	QtyExponent    int8
	SubscriptionId uint16
	UnlockData     []TPlusFilterLockEventUnlockData
	Symbol         []uint8
	BaseAsset      []uint8
}
type TPlusFilterLockEventUnlockData struct {
	UnlockTime int64
	Qty        int64
}

func (t *TPlusFilterLockEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, t.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, t.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, t.SubscriptionId); err != nil {
		return err
	}
	var UnlockDataBlockLength uint16 = 16
	if err := _m.WriteUint16(_w, UnlockDataBlockLength); err != nil {
		return err
	}
	var UnlockDataNumInGroup uint32 = uint32(len(t.UnlockData))
	if err := _m.WriteUint32(_w, UnlockDataNumInGroup); err != nil {
		return err
	}
	for i := range t.UnlockData {
		if err := t.UnlockData[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(t.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, t.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(t.BaseAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, t.BaseAsset); err != nil {
		return err
	}
	return nil
}

func (t *TPlusFilterLockEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !t.EventTimeInActingVersion(actingVersion) {
		t.EventTime = t.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.EventTime); err != nil {
			return err
		}
	}
	if !t.QtyExponentInActingVersion(actingVersion) {
		t.QtyExponent = t.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &t.QtyExponent); err != nil {
			return err
		}
	}
	if !t.SubscriptionIdInActingVersion(actingVersion) {
		t.SubscriptionId = t.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &t.SubscriptionId); err != nil {
			return err
		}
	}
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}

	if t.UnlockDataInActingVersion(actingVersion) {
		var UnlockDataBlockLength uint16
		if err := _m.ReadUint16(_r, &UnlockDataBlockLength); err != nil {
			return err
		}
		var UnlockDataNumInGroup uint32
		if err := _m.ReadUint32(_r, &UnlockDataNumInGroup); err != nil {
			return err
		}
		if cap(t.UnlockData) < int(UnlockDataNumInGroup) {
			t.UnlockData = make([]TPlusFilterLockEventUnlockData, UnlockDataNumInGroup)
		}
		t.UnlockData = t.UnlockData[:UnlockDataNumInGroup]
		for i := range t.UnlockData {
			if err := t.UnlockData[i].Decode(_m, _r, actingVersion, uint(UnlockDataBlockLength)); err != nil {
				return err
			}
		}
	}

	if t.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(t.Symbol) < int(SymbolLength) {
			t.Symbol = make([]uint8, SymbolLength)
		}
		t.Symbol = t.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, t.Symbol); err != nil {
			return err
		}
	}

	if t.BaseAssetInActingVersion(actingVersion) {
		var BaseAssetLength uint8
		if err := _m.ReadUint8(_r, &BaseAssetLength); err != nil {
			return err
		}
		if cap(t.BaseAsset) < int(BaseAssetLength) {
			t.BaseAsset = make([]uint8, BaseAssetLength)
		}
		t.BaseAsset = t.BaseAsset[:BaseAssetLength]
		if err := _m.ReadBytes(_r, t.BaseAsset); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := t.RangeCheck(actingVersion, t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (t *TPlusFilterLockEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if t.EventTimeInActingVersion(actingVersion) {
		if t.EventTime < t.EventTimeMinValue() || t.EventTime > t.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on t.EventTime (%v < %v > %v)", t.EventTimeMinValue(), t.EventTime, t.EventTimeMaxValue())
		}
	}
	if t.QtyExponentInActingVersion(actingVersion) {
		if t.QtyExponent < t.QtyExponentMinValue() || t.QtyExponent > t.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on t.QtyExponent (%v < %v > %v)", t.QtyExponentMinValue(), t.QtyExponent, t.QtyExponentMaxValue())
		}
	}
	if t.SubscriptionIdInActingVersion(actingVersion) {
		if t.SubscriptionId != t.SubscriptionIdNullValue() && (t.SubscriptionId < t.SubscriptionIdMinValue() || t.SubscriptionId > t.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on t.SubscriptionId (%v < %v > %v)", t.SubscriptionIdMinValue(), t.SubscriptionId, t.SubscriptionIdMaxValue())
		}
	}
	for i := range t.UnlockData {
		if err := t.UnlockData[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(t.Symbol[:]) {
		return errors.New("t.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(t.BaseAsset[:]) {
		return errors.New("t.BaseAsset failed UTF-8 validation")
	}
	return nil
}

func TPlusFilterLockEventInit(t *TPlusFilterLockEvent) {
	t.SubscriptionId = math.MaxUint16
	return
}

func (t *TPlusFilterLockEventUnlockData) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, t.UnlockTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.Qty); err != nil {
		return err
	}
	return nil
}

func (t *TPlusFilterLockEventUnlockData) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !t.UnlockTimeInActingVersion(actingVersion) {
		t.UnlockTime = t.UnlockTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.UnlockTime); err != nil {
			return err
		}
	}
	if !t.QtyInActingVersion(actingVersion) {
		t.Qty = t.QtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.Qty); err != nil {
			return err
		}
	}
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}
	return nil
}

func (t *TPlusFilterLockEventUnlockData) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if t.UnlockTimeInActingVersion(actingVersion) {
		if t.UnlockTime < t.UnlockTimeMinValue() || t.UnlockTime > t.UnlockTimeMaxValue() {
			return fmt.Errorf("Range check failed on t.UnlockTime (%v < %v > %v)", t.UnlockTimeMinValue(), t.UnlockTime, t.UnlockTimeMaxValue())
		}
	}
	if t.QtyInActingVersion(actingVersion) {
		if t.Qty < t.QtyMinValue() || t.Qty > t.QtyMaxValue() {
			return fmt.Errorf("Range check failed on t.Qty (%v < %v > %v)", t.QtyMinValue(), t.Qty, t.QtyMaxValue())
		}
	}
	return nil
}

func TPlusFilterLockEventUnlockDataInit(t *TPlusFilterLockEventUnlockData) {
	return
}

func (*TPlusFilterLockEvent) SbeBlockLength() (blockLength uint16) {
	return 11
}

func (*TPlusFilterLockEvent) SbeTemplateId() (templateId uint16) {
	return 608
}

func (*TPlusFilterLockEvent) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TPlusFilterLockEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*TPlusFilterLockEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TPlusFilterLockEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TPlusFilterLockEvent) EventTimeId() uint16 {
	return 1
}

func (*TPlusFilterLockEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (t *TPlusFilterLockEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.EventTimeSinceVersion()
}

func (*TPlusFilterLockEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*TPlusFilterLockEvent) EventTimeMetaAttribute(meta int) string {
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

func (*TPlusFilterLockEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TPlusFilterLockEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TPlusFilterLockEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*TPlusFilterLockEvent) QtyExponentId() uint16 {
	return 2
}

func (*TPlusFilterLockEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *TPlusFilterLockEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*TPlusFilterLockEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*TPlusFilterLockEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*TPlusFilterLockEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TPlusFilterLockEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TPlusFilterLockEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*TPlusFilterLockEvent) SubscriptionIdId() uint16 {
	return 3
}

func (*TPlusFilterLockEvent) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (t *TPlusFilterLockEvent) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SubscriptionIdSinceVersion()
}

func (*TPlusFilterLockEvent) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*TPlusFilterLockEvent) SubscriptionIdMetaAttribute(meta int) string {
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

func (*TPlusFilterLockEvent) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*TPlusFilterLockEvent) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*TPlusFilterLockEvent) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*TPlusFilterLockEventUnlockData) UnlockTimeId() uint16 {
	return 1
}

func (*TPlusFilterLockEventUnlockData) UnlockTimeSinceVersion() uint16 {
	return 0
}

func (t *TPlusFilterLockEventUnlockData) UnlockTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.UnlockTimeSinceVersion()
}

func (*TPlusFilterLockEventUnlockData) UnlockTimeDeprecated() uint16 {
	return 0
}

func (*TPlusFilterLockEventUnlockData) UnlockTimeMetaAttribute(meta int) string {
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

func (*TPlusFilterLockEventUnlockData) UnlockTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TPlusFilterLockEventUnlockData) UnlockTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TPlusFilterLockEventUnlockData) UnlockTimeNullValue() int64 {
	return math.MinInt64
}

func (*TPlusFilterLockEventUnlockData) QtyId() uint16 {
	return 2
}

func (*TPlusFilterLockEventUnlockData) QtySinceVersion() uint16 {
	return 0
}

func (t *TPlusFilterLockEventUnlockData) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtySinceVersion()
}

func (*TPlusFilterLockEventUnlockData) QtyDeprecated() uint16 {
	return 0
}

func (*TPlusFilterLockEventUnlockData) QtyMetaAttribute(meta int) string {
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

func (*TPlusFilterLockEventUnlockData) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TPlusFilterLockEventUnlockData) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*TPlusFilterLockEventUnlockData) QtyNullValue() int64 {
	return math.MinInt64
}

func (*TPlusFilterLockEvent) UnlockDataId() uint16 {
	return 100
}

func (*TPlusFilterLockEvent) UnlockDataSinceVersion() uint16 {
	return 0
}

func (t *TPlusFilterLockEvent) UnlockDataInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.UnlockDataSinceVersion()
}

func (*TPlusFilterLockEvent) UnlockDataDeprecated() uint16 {
	return 0
}

func (*TPlusFilterLockEventUnlockData) SbeBlockLength() (blockLength uint) {
	return 16
}

func (*TPlusFilterLockEventUnlockData) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*TPlusFilterLockEvent) SymbolMetaAttribute(meta int) string {
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

func (*TPlusFilterLockEvent) SymbolSinceVersion() uint16 {
	return 0
}

func (t *TPlusFilterLockEvent) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*TPlusFilterLockEvent) SymbolDeprecated() uint16 {
	return 0
}

func (TPlusFilterLockEvent) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (TPlusFilterLockEvent) SymbolHeaderLength() uint64 {
	return 1
}

func (*TPlusFilterLockEvent) BaseAssetMetaAttribute(meta int) string {
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

func (*TPlusFilterLockEvent) BaseAssetSinceVersion() uint16 {
	return 0
}

func (t *TPlusFilterLockEvent) BaseAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.BaseAssetSinceVersion()
}

func (*TPlusFilterLockEvent) BaseAssetDeprecated() uint16 {
	return 0
}

func (TPlusFilterLockEvent) BaseAssetCharacterEncoding() string {
	return "UTF-8"
}

func (TPlusFilterLockEvent) BaseAssetHeaderLength() uint64 {
	return 1
}
