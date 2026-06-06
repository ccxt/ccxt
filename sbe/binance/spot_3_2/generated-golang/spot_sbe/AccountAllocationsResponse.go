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

type AccountAllocationsResponse struct {
	Allocations []AccountAllocationsResponseAllocations
}
type AccountAllocationsResponseAllocations struct {
	PriceExponent      int8
	QtyExponent        int8
	CommissionExponent int8
	AllocationId       int64
	AllocationType     AllocationTypeEnum
	OrderId            int64
	OrderListId        int64
	SourceTradeId      int64
	SourceAllocationId int64
	Price              int64
	Qty                int64
	QuoteQty           int64
	Commission         int64
	Time               int64
	IsBuyer            BoolEnumEnum
	IsMaker            BoolEnumEnum
	IsAllocator        BoolEnumEnum
	Symbol             []uint8
	CommissionAsset    []uint8
	SourceSymbol       []uint8
}

func (a *AccountAllocationsResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var AllocationsBlockLength uint16 = 87
	if err := _m.WriteUint16(_w, AllocationsBlockLength); err != nil {
		return err
	}
	var AllocationsNumInGroup uint32 = uint32(len(a.Allocations))
	if err := _m.WriteUint32(_w, AllocationsNumInGroup); err != nil {
		return err
	}
	for i := range a.Allocations {
		if err := a.Allocations[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountAllocationsResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.AllocationsInActingVersion(actingVersion) {
		var AllocationsBlockLength uint16
		if err := _m.ReadUint16(_r, &AllocationsBlockLength); err != nil {
			return err
		}
		var AllocationsNumInGroup uint32
		if err := _m.ReadUint32(_r, &AllocationsNumInGroup); err != nil {
			return err
		}
		if cap(a.Allocations) < int(AllocationsNumInGroup) {
			a.Allocations = make([]AccountAllocationsResponseAllocations, AllocationsNumInGroup)
		}
		a.Allocations = a.Allocations[:AllocationsNumInGroup]
		for i := range a.Allocations {
			if err := a.Allocations[i].Decode(_m, _r, actingVersion, uint(AllocationsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := a.RangeCheck(actingVersion, a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountAllocationsResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range a.Allocations {
		if err := a.Allocations[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func AccountAllocationsResponseInit(a *AccountAllocationsResponse) {
	return
}

func (a *AccountAllocationsResponseAllocations) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, a.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.CommissionExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.AllocationId); err != nil {
		return err
	}
	if err := a.AllocationType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.SourceTradeId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.SourceAllocationId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Qty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.QuoteQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Commission); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Time); err != nil {
		return err
	}
	if err := a.IsBuyer.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.IsMaker.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.IsAllocator.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.CommissionAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.CommissionAsset); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.SourceSymbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.SourceSymbol); err != nil {
		return err
	}
	return nil
}

func (a *AccountAllocationsResponseAllocations) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !a.PriceExponentInActingVersion(actingVersion) {
		a.PriceExponent = a.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.PriceExponent); err != nil {
			return err
		}
	}
	if !a.QtyExponentInActingVersion(actingVersion) {
		a.QtyExponent = a.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.QtyExponent); err != nil {
			return err
		}
	}
	if !a.CommissionExponentInActingVersion(actingVersion) {
		a.CommissionExponent = a.CommissionExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.CommissionExponent); err != nil {
			return err
		}
	}
	if !a.AllocationIdInActingVersion(actingVersion) {
		a.AllocationId = a.AllocationIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.AllocationId); err != nil {
			return err
		}
	}
	if a.AllocationTypeInActingVersion(actingVersion) {
		if err := a.AllocationType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !a.OrderIdInActingVersion(actingVersion) {
		a.OrderId = a.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.OrderId); err != nil {
			return err
		}
	}
	if !a.OrderListIdInActingVersion(actingVersion) {
		a.OrderListId = a.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.OrderListId); err != nil {
			return err
		}
	}
	if !a.SourceTradeIdInActingVersion(actingVersion) {
		a.SourceTradeId = a.SourceTradeIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.SourceTradeId); err != nil {
			return err
		}
	}
	if !a.SourceAllocationIdInActingVersion(actingVersion) {
		a.SourceAllocationId = a.SourceAllocationIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.SourceAllocationId); err != nil {
			return err
		}
	}
	if !a.PriceInActingVersion(actingVersion) {
		a.Price = a.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Price); err != nil {
			return err
		}
	}
	if !a.QtyInActingVersion(actingVersion) {
		a.Qty = a.QtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Qty); err != nil {
			return err
		}
	}
	if !a.QuoteQtyInActingVersion(actingVersion) {
		a.QuoteQty = a.QuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.QuoteQty); err != nil {
			return err
		}
	}
	if !a.CommissionInActingVersion(actingVersion) {
		a.Commission = a.CommissionNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Commission); err != nil {
			return err
		}
	}
	if !a.TimeInActingVersion(actingVersion) {
		a.Time = a.TimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Time); err != nil {
			return err
		}
	}
	if a.IsBuyerInActingVersion(actingVersion) {
		if err := a.IsBuyer.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.IsMakerInActingVersion(actingVersion) {
		if err := a.IsMaker.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.IsAllocatorInActingVersion(actingVersion) {
		if err := a.IsAllocator.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(a.Symbol) < int(SymbolLength) {
			a.Symbol = make([]uint8, SymbolLength)
		}
		a.Symbol = a.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, a.Symbol); err != nil {
			return err
		}
	}

	if a.CommissionAssetInActingVersion(actingVersion) {
		var CommissionAssetLength uint8
		if err := _m.ReadUint8(_r, &CommissionAssetLength); err != nil {
			return err
		}
		if cap(a.CommissionAsset) < int(CommissionAssetLength) {
			a.CommissionAsset = make([]uint8, CommissionAssetLength)
		}
		a.CommissionAsset = a.CommissionAsset[:CommissionAssetLength]
		if err := _m.ReadBytes(_r, a.CommissionAsset); err != nil {
			return err
		}
	}

	if a.SourceSymbolInActingVersion(actingVersion) {
		var SourceSymbolLength uint8
		if err := _m.ReadUint8(_r, &SourceSymbolLength); err != nil {
			return err
		}
		if cap(a.SourceSymbol) < int(SourceSymbolLength) {
			a.SourceSymbol = make([]uint8, SourceSymbolLength)
		}
		a.SourceSymbol = a.SourceSymbol[:SourceSymbolLength]
		if err := _m.ReadBytes(_r, a.SourceSymbol); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountAllocationsResponseAllocations) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if a.PriceExponentInActingVersion(actingVersion) {
		if a.PriceExponent < a.PriceExponentMinValue() || a.PriceExponent > a.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.PriceExponent (%v < %v > %v)", a.PriceExponentMinValue(), a.PriceExponent, a.PriceExponentMaxValue())
		}
	}
	if a.QtyExponentInActingVersion(actingVersion) {
		if a.QtyExponent < a.QtyExponentMinValue() || a.QtyExponent > a.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.QtyExponent (%v < %v > %v)", a.QtyExponentMinValue(), a.QtyExponent, a.QtyExponentMaxValue())
		}
	}
	if a.CommissionExponentInActingVersion(actingVersion) {
		if a.CommissionExponent != a.CommissionExponentNullValue() && (a.CommissionExponent < a.CommissionExponentMinValue() || a.CommissionExponent > a.CommissionExponentMaxValue()) {
			return fmt.Errorf("Range check failed on a.CommissionExponent (%v < %v > %v)", a.CommissionExponentMinValue(), a.CommissionExponent, a.CommissionExponentMaxValue())
		}
	}
	if a.AllocationIdInActingVersion(actingVersion) {
		if a.AllocationId < a.AllocationIdMinValue() || a.AllocationId > a.AllocationIdMaxValue() {
			return fmt.Errorf("Range check failed on a.AllocationId (%v < %v > %v)", a.AllocationIdMinValue(), a.AllocationId, a.AllocationIdMaxValue())
		}
	}
	if err := a.AllocationType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if a.OrderIdInActingVersion(actingVersion) {
		if a.OrderId < a.OrderIdMinValue() || a.OrderId > a.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on a.OrderId (%v < %v > %v)", a.OrderIdMinValue(), a.OrderId, a.OrderIdMaxValue())
		}
	}
	if a.OrderListIdInActingVersion(actingVersion) {
		if a.OrderListId != a.OrderListIdNullValue() && (a.OrderListId < a.OrderListIdMinValue() || a.OrderListId > a.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on a.OrderListId (%v < %v > %v)", a.OrderListIdMinValue(), a.OrderListId, a.OrderListIdMaxValue())
		}
	}
	if a.SourceTradeIdInActingVersion(actingVersion) {
		if a.SourceTradeId != a.SourceTradeIdNullValue() && (a.SourceTradeId < a.SourceTradeIdMinValue() || a.SourceTradeId > a.SourceTradeIdMaxValue()) {
			return fmt.Errorf("Range check failed on a.SourceTradeId (%v < %v > %v)", a.SourceTradeIdMinValue(), a.SourceTradeId, a.SourceTradeIdMaxValue())
		}
	}
	if a.SourceAllocationIdInActingVersion(actingVersion) {
		if a.SourceAllocationId != a.SourceAllocationIdNullValue() && (a.SourceAllocationId < a.SourceAllocationIdMinValue() || a.SourceAllocationId > a.SourceAllocationIdMaxValue()) {
			return fmt.Errorf("Range check failed on a.SourceAllocationId (%v < %v > %v)", a.SourceAllocationIdMinValue(), a.SourceAllocationId, a.SourceAllocationIdMaxValue())
		}
	}
	if a.PriceInActingVersion(actingVersion) {
		if a.Price < a.PriceMinValue() || a.Price > a.PriceMaxValue() {
			return fmt.Errorf("Range check failed on a.Price (%v < %v > %v)", a.PriceMinValue(), a.Price, a.PriceMaxValue())
		}
	}
	if a.QtyInActingVersion(actingVersion) {
		if a.Qty < a.QtyMinValue() || a.Qty > a.QtyMaxValue() {
			return fmt.Errorf("Range check failed on a.Qty (%v < %v > %v)", a.QtyMinValue(), a.Qty, a.QtyMaxValue())
		}
	}
	if a.QuoteQtyInActingVersion(actingVersion) {
		if a.QuoteQty < a.QuoteQtyMinValue() || a.QuoteQty > a.QuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on a.QuoteQty (%v < %v > %v)", a.QuoteQtyMinValue(), a.QuoteQty, a.QuoteQtyMaxValue())
		}
	}
	if a.CommissionInActingVersion(actingVersion) {
		if a.Commission != a.CommissionNullValue() && (a.Commission < a.CommissionMinValue() || a.Commission > a.CommissionMaxValue()) {
			return fmt.Errorf("Range check failed on a.Commission (%v < %v > %v)", a.CommissionMinValue(), a.Commission, a.CommissionMaxValue())
		}
	}
	if a.TimeInActingVersion(actingVersion) {
		if a.Time < a.TimeMinValue() || a.Time > a.TimeMaxValue() {
			return fmt.Errorf("Range check failed on a.Time (%v < %v > %v)", a.TimeMinValue(), a.Time, a.TimeMaxValue())
		}
	}
	if err := a.IsBuyer.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.IsMaker.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.IsAllocator.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if !utf8.Valid(a.Symbol[:]) {
		return errors.New("a.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(a.CommissionAsset[:]) {
		return errors.New("a.CommissionAsset failed UTF-8 validation")
	}
	if !utf8.Valid(a.SourceSymbol[:]) {
		return errors.New("a.SourceSymbol failed UTF-8 validation")
	}
	return nil
}

func AccountAllocationsResponseAllocationsInit(a *AccountAllocationsResponseAllocations) {
	a.CommissionExponent = math.MinInt8
	a.OrderListId = math.MinInt64
	a.SourceTradeId = math.MinInt64
	a.SourceAllocationId = math.MinInt64
	a.Commission = math.MinInt64
	return
}

func (*AccountAllocationsResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*AccountAllocationsResponse) SbeTemplateId() (templateId uint16) {
	return 404
}

func (*AccountAllocationsResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AccountAllocationsResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*AccountAllocationsResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AccountAllocationsResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AccountAllocationsResponseAllocations) PriceExponentId() uint16 {
	return 1
}

func (*AccountAllocationsResponseAllocations) PriceExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceExponentSinceVersion()
}

func (*AccountAllocationsResponseAllocations) PriceExponentDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) PriceExponentMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountAllocationsResponseAllocations) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountAllocationsResponseAllocations) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountAllocationsResponseAllocations) QtyExponentId() uint16 {
	return 2
}

func (*AccountAllocationsResponseAllocations) QtyExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QtyExponentSinceVersion()
}

func (*AccountAllocationsResponseAllocations) QtyExponentDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) QtyExponentMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountAllocationsResponseAllocations) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountAllocationsResponseAllocations) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountAllocationsResponseAllocations) CommissionExponentId() uint16 {
	return 3
}

func (*AccountAllocationsResponseAllocations) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionExponentSinceVersion()
}

func (*AccountAllocationsResponseAllocations) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) CommissionExponentMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountAllocationsResponseAllocations) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountAllocationsResponseAllocations) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountAllocationsResponseAllocations) AllocationIdId() uint16 {
	return 4
}

func (*AccountAllocationsResponseAllocations) AllocationIdSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) AllocationIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AllocationIdSinceVersion()
}

func (*AccountAllocationsResponseAllocations) AllocationIdDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) AllocationIdMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) AllocationIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) AllocationIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) AllocationIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) AllocationTypeId() uint16 {
	return 5
}

func (*AccountAllocationsResponseAllocations) AllocationTypeSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) AllocationTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AllocationTypeSinceVersion()
}

func (*AccountAllocationsResponseAllocations) AllocationTypeDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) AllocationTypeMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) OrderIdId() uint16 {
	return 6
}

func (*AccountAllocationsResponseAllocations) OrderIdSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.OrderIdSinceVersion()
}

func (*AccountAllocationsResponseAllocations) OrderIdDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) OrderIdMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) OrderListIdId() uint16 {
	return 7
}

func (*AccountAllocationsResponseAllocations) OrderListIdSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.OrderListIdSinceVersion()
}

func (*AccountAllocationsResponseAllocations) OrderListIdDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) OrderListIdMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) SourceTradeIdId() uint16 {
	return 8
}

func (*AccountAllocationsResponseAllocations) SourceTradeIdSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) SourceTradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SourceTradeIdSinceVersion()
}

func (*AccountAllocationsResponseAllocations) SourceTradeIdDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) SourceTradeIdMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) SourceTradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) SourceTradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) SourceTradeIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) SourceAllocationIdId() uint16 {
	return 9
}

func (*AccountAllocationsResponseAllocations) SourceAllocationIdSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) SourceAllocationIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SourceAllocationIdSinceVersion()
}

func (*AccountAllocationsResponseAllocations) SourceAllocationIdDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) SourceAllocationIdMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) SourceAllocationIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) SourceAllocationIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) SourceAllocationIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) PriceId() uint16 {
	return 10
}

func (*AccountAllocationsResponseAllocations) PriceSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceSinceVersion()
}

func (*AccountAllocationsResponseAllocations) PriceDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) PriceMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) PriceNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) QtyId() uint16 {
	return 11
}

func (*AccountAllocationsResponseAllocations) QtySinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QtySinceVersion()
}

func (*AccountAllocationsResponseAllocations) QtyDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) QtyMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) QtyNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) QuoteQtyId() uint16 {
	return 12
}

func (*AccountAllocationsResponseAllocations) QuoteQtySinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) QuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QuoteQtySinceVersion()
}

func (*AccountAllocationsResponseAllocations) QuoteQtyDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) QuoteQtyMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) QuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) QuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) QuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) CommissionId() uint16 {
	return 13
}

func (*AccountAllocationsResponseAllocations) CommissionSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) CommissionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionSinceVersion()
}

func (*AccountAllocationsResponseAllocations) CommissionDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) CommissionMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) CommissionMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) CommissionMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) CommissionNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) TimeId() uint16 {
	return 14
}

func (*AccountAllocationsResponseAllocations) TimeSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) TimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TimeSinceVersion()
}

func (*AccountAllocationsResponseAllocations) TimeDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) TimeMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) TimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountAllocationsResponseAllocations) TimeMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountAllocationsResponseAllocations) TimeNullValue() int64 {
	return math.MinInt64
}

func (*AccountAllocationsResponseAllocations) IsBuyerId() uint16 {
	return 15
}

func (*AccountAllocationsResponseAllocations) IsBuyerSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) IsBuyerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsBuyerSinceVersion()
}

func (*AccountAllocationsResponseAllocations) IsBuyerDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) IsBuyerMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) IsMakerId() uint16 {
	return 16
}

func (*AccountAllocationsResponseAllocations) IsMakerSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) IsMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsMakerSinceVersion()
}

func (*AccountAllocationsResponseAllocations) IsMakerDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) IsMakerMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) IsAllocatorId() uint16 {
	return 17
}

func (*AccountAllocationsResponseAllocations) IsAllocatorSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) IsAllocatorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsAllocatorSinceVersion()
}

func (*AccountAllocationsResponseAllocations) IsAllocatorDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) IsAllocatorMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) SymbolMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) SymbolSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SymbolSinceVersion()
}

func (*AccountAllocationsResponseAllocations) SymbolDeprecated() uint16 {
	return 0
}

func (AccountAllocationsResponseAllocations) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (AccountAllocationsResponseAllocations) SymbolHeaderLength() uint64 {
	return 1
}

func (*AccountAllocationsResponseAllocations) CommissionAssetMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) CommissionAssetSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) CommissionAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionAssetSinceVersion()
}

func (*AccountAllocationsResponseAllocations) CommissionAssetDeprecated() uint16 {
	return 0
}

func (AccountAllocationsResponseAllocations) CommissionAssetCharacterEncoding() string {
	return "UTF-8"
}

func (AccountAllocationsResponseAllocations) CommissionAssetHeaderLength() uint64 {
	return 1
}

func (*AccountAllocationsResponseAllocations) SourceSymbolMetaAttribute(meta int) string {
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

func (*AccountAllocationsResponseAllocations) SourceSymbolSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponseAllocations) SourceSymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SourceSymbolSinceVersion()
}

func (*AccountAllocationsResponseAllocations) SourceSymbolDeprecated() uint16 {
	return 0
}

func (AccountAllocationsResponseAllocations) SourceSymbolCharacterEncoding() string {
	return "UTF-8"
}

func (AccountAllocationsResponseAllocations) SourceSymbolHeaderLength() uint64 {
	return 1
}

func (*AccountAllocationsResponse) AllocationsId() uint16 {
	return 100
}

func (*AccountAllocationsResponse) AllocationsSinceVersion() uint16 {
	return 0
}

func (a *AccountAllocationsResponse) AllocationsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AllocationsSinceVersion()
}

func (*AccountAllocationsResponse) AllocationsDeprecated() uint16 {
	return 0
}

func (*AccountAllocationsResponseAllocations) SbeBlockLength() (blockLength uint) {
	return 87
}

func (*AccountAllocationsResponseAllocations) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
