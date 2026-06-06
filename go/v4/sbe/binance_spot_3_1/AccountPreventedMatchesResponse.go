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

type AccountPreventedMatchesResponse struct {
	PreventedMatches []AccountPreventedMatchesResponsePreventedMatches
}
type AccountPreventedMatchesResponsePreventedMatches struct {
	PriceExponent           int8
	QtyExponent             int8
	PreventedMatchId        int64
	TakerOrderId            int64
	MakerOrderId            int64
	TradeGroupId            int64
	SelfTradePreventionMode SelfTradePreventionModeEnum
	Price                   int64
	TakerPreventedQuantity  int64
	MakerPreventedQuantity  int64
	TransactTime            int64
	Symbol                  []uint8
	MakerSymbol             []uint8
}

func (a *AccountPreventedMatchesResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var PreventedMatchesBlockLength uint16 = 67
	if err := _m.WriteUint16(_w, PreventedMatchesBlockLength); err != nil {
		return err
	}
	var PreventedMatchesNumInGroup uint32 = uint32(len(a.PreventedMatches))
	if err := _m.WriteUint32(_w, PreventedMatchesNumInGroup); err != nil {
		return err
	}
	for i := range a.PreventedMatches {
		if err := a.PreventedMatches[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountPreventedMatchesResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.PreventedMatchesInActingVersion(actingVersion) {
		var PreventedMatchesBlockLength uint16
		if err := _m.ReadUint16(_r, &PreventedMatchesBlockLength); err != nil {
			return err
		}
		var PreventedMatchesNumInGroup uint32
		if err := _m.ReadUint32(_r, &PreventedMatchesNumInGroup); err != nil {
			return err
		}
		if cap(a.PreventedMatches) < int(PreventedMatchesNumInGroup) {
			a.PreventedMatches = make([]AccountPreventedMatchesResponsePreventedMatches, PreventedMatchesNumInGroup)
		}
		a.PreventedMatches = a.PreventedMatches[:PreventedMatchesNumInGroup]
		for i := range a.PreventedMatches {
			if err := a.PreventedMatches[i].Decode(_m, _r, actingVersion, uint(PreventedMatchesBlockLength)); err != nil {
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

func (a *AccountPreventedMatchesResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range a.PreventedMatches {
		if err := a.PreventedMatches[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func AccountPreventedMatchesResponseInit(a *AccountPreventedMatchesResponse) {
	return
}

func (a *AccountPreventedMatchesResponsePreventedMatches) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, a.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.PreventedMatchId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TakerOrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.MakerOrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TradeGroupId); err != nil {
		return err
	}
	if err := a.SelfTradePreventionMode.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TakerPreventedQuantity); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.MakerPreventedQuantity); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.MakerSymbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.MakerSymbol); err != nil {
		return err
	}
	return nil
}

func (a *AccountPreventedMatchesResponsePreventedMatches) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	if !a.PreventedMatchIdInActingVersion(actingVersion) {
		a.PreventedMatchId = a.PreventedMatchIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.PreventedMatchId); err != nil {
			return err
		}
	}
	if !a.TakerOrderIdInActingVersion(actingVersion) {
		a.TakerOrderId = a.TakerOrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TakerOrderId); err != nil {
			return err
		}
	}
	if !a.MakerOrderIdInActingVersion(actingVersion) {
		a.MakerOrderId = a.MakerOrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.MakerOrderId); err != nil {
			return err
		}
	}
	if !a.TradeGroupIdInActingVersion(actingVersion) {
		a.TradeGroupId = a.TradeGroupIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TradeGroupId); err != nil {
			return err
		}
	}
	if a.SelfTradePreventionModeInActingVersion(actingVersion) {
		if err := a.SelfTradePreventionMode.Decode(_m, _r, actingVersion); err != nil {
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
	if !a.TakerPreventedQuantityInActingVersion(actingVersion) {
		a.TakerPreventedQuantity = a.TakerPreventedQuantityNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TakerPreventedQuantity); err != nil {
			return err
		}
	}
	if !a.MakerPreventedQuantityInActingVersion(actingVersion) {
		a.MakerPreventedQuantity = a.MakerPreventedQuantityNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.MakerPreventedQuantity); err != nil {
			return err
		}
	}
	if !a.TransactTimeInActingVersion(actingVersion) {
		a.TransactTime = a.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TransactTime); err != nil {
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

	if a.MakerSymbolInActingVersion(actingVersion) {
		var MakerSymbolLength uint8
		if err := _m.ReadUint8(_r, &MakerSymbolLength); err != nil {
			return err
		}
		if cap(a.MakerSymbol) < int(MakerSymbolLength) {
			a.MakerSymbol = make([]uint8, MakerSymbolLength)
		}
		a.MakerSymbol = a.MakerSymbol[:MakerSymbolLength]
		if err := _m.ReadBytes(_r, a.MakerSymbol); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountPreventedMatchesResponsePreventedMatches) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	if a.PreventedMatchIdInActingVersion(actingVersion) {
		if a.PreventedMatchId < a.PreventedMatchIdMinValue() || a.PreventedMatchId > a.PreventedMatchIdMaxValue() {
			return fmt.Errorf("Range check failed on a.PreventedMatchId (%v < %v > %v)", a.PreventedMatchIdMinValue(), a.PreventedMatchId, a.PreventedMatchIdMaxValue())
		}
	}
	if a.TakerOrderIdInActingVersion(actingVersion) {
		if a.TakerOrderId < a.TakerOrderIdMinValue() || a.TakerOrderId > a.TakerOrderIdMaxValue() {
			return fmt.Errorf("Range check failed on a.TakerOrderId (%v < %v > %v)", a.TakerOrderIdMinValue(), a.TakerOrderId, a.TakerOrderIdMaxValue())
		}
	}
	if a.MakerOrderIdInActingVersion(actingVersion) {
		if a.MakerOrderId < a.MakerOrderIdMinValue() || a.MakerOrderId > a.MakerOrderIdMaxValue() {
			return fmt.Errorf("Range check failed on a.MakerOrderId (%v < %v > %v)", a.MakerOrderIdMinValue(), a.MakerOrderId, a.MakerOrderIdMaxValue())
		}
	}
	if a.TradeGroupIdInActingVersion(actingVersion) {
		if a.TradeGroupId < a.TradeGroupIdMinValue() || a.TradeGroupId > a.TradeGroupIdMaxValue() {
			return fmt.Errorf("Range check failed on a.TradeGroupId (%v < %v > %v)", a.TradeGroupIdMinValue(), a.TradeGroupId, a.TradeGroupIdMaxValue())
		}
	}
	if err := a.SelfTradePreventionMode.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if a.PriceInActingVersion(actingVersion) {
		if a.Price < a.PriceMinValue() || a.Price > a.PriceMaxValue() {
			return fmt.Errorf("Range check failed on a.Price (%v < %v > %v)", a.PriceMinValue(), a.Price, a.PriceMaxValue())
		}
	}
	if a.TakerPreventedQuantityInActingVersion(actingVersion) {
		if a.TakerPreventedQuantity != a.TakerPreventedQuantityNullValue() && (a.TakerPreventedQuantity < a.TakerPreventedQuantityMinValue() || a.TakerPreventedQuantity > a.TakerPreventedQuantityMaxValue()) {
			return fmt.Errorf("Range check failed on a.TakerPreventedQuantity (%v < %v > %v)", a.TakerPreventedQuantityMinValue(), a.TakerPreventedQuantity, a.TakerPreventedQuantityMaxValue())
		}
	}
	if a.MakerPreventedQuantityInActingVersion(actingVersion) {
		if a.MakerPreventedQuantity != a.MakerPreventedQuantityNullValue() && (a.MakerPreventedQuantity < a.MakerPreventedQuantityMinValue() || a.MakerPreventedQuantity > a.MakerPreventedQuantityMaxValue()) {
			return fmt.Errorf("Range check failed on a.MakerPreventedQuantity (%v < %v > %v)", a.MakerPreventedQuantityMinValue(), a.MakerPreventedQuantity, a.MakerPreventedQuantityMaxValue())
		}
	}
	if a.TransactTimeInActingVersion(actingVersion) {
		if a.TransactTime < a.TransactTimeMinValue() || a.TransactTime > a.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on a.TransactTime (%v < %v > %v)", a.TransactTimeMinValue(), a.TransactTime, a.TransactTimeMaxValue())
		}
	}
	if !utf8.Valid(a.Symbol[:]) {
		return errors.New("a.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(a.MakerSymbol[:]) {
		return errors.New("a.MakerSymbol failed UTF-8 validation")
	}
	return nil
}

func AccountPreventedMatchesResponsePreventedMatchesInit(a *AccountPreventedMatchesResponsePreventedMatches) {
	a.TakerPreventedQuantity = math.MinInt64
	a.MakerPreventedQuantity = math.MinInt64
	return
}

func (*AccountPreventedMatchesResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*AccountPreventedMatchesResponse) SbeTemplateId() (templateId uint16) {
	return 403
}

func (*AccountPreventedMatchesResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AccountPreventedMatchesResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*AccountPreventedMatchesResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AccountPreventedMatchesResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceExponentId() uint16 {
	return 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceExponentSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceExponentDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceExponentMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountPreventedMatchesResponsePreventedMatches) QtyExponentId() uint16 {
	return 2
}

func (*AccountPreventedMatchesResponsePreventedMatches) QtyExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QtyExponentSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) QtyExponentDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) QtyExponentMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountPreventedMatchesResponsePreventedMatches) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdId() uint16 {
	return 3
}

func (*AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PreventedMatchIdSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) PreventedMatchIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdId() uint16 {
	return 4
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TakerOrderIdSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerOrderIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdId() uint16 {
	return 5
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.MakerOrderIdSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerOrderIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdId() uint16 {
	return 6
}

func (*AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TradeGroupIdSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TradeGroupIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) SelfTradePreventionModeId() uint16 {
	return 7
}

func (*AccountPreventedMatchesResponsePreventedMatches) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SelfTradePreventionModeSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) PriceId() uint16 {
	return 8
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) PriceNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantityId() uint16 {
	return 9
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantitySinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TakerPreventedQuantitySinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantityDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantityMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TakerPreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantityId() uint16 {
	return 10
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantitySinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.MakerPreventedQuantitySinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantityDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantityMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerPreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TransactTimeId() uint16 {
	return 11
}

func (*AccountPreventedMatchesResponsePreventedMatches) TransactTimeSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TransactTimeSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) TransactTimeDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) TransactTimeMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*AccountPreventedMatchesResponsePreventedMatches) SymbolMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) SymbolSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SymbolSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) SymbolDeprecated() uint16 {
	return 0
}

func (AccountPreventedMatchesResponsePreventedMatches) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (AccountPreventedMatchesResponsePreventedMatches) SymbolHeaderLength() uint64 {
	return 1
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerSymbolMetaAttribute(meta int) string {
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

func (*AccountPreventedMatchesResponsePreventedMatches) MakerSymbolSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponsePreventedMatches) MakerSymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.MakerSymbolSinceVersion()
}

func (*AccountPreventedMatchesResponsePreventedMatches) MakerSymbolDeprecated() uint16 {
	return 0
}

func (AccountPreventedMatchesResponsePreventedMatches) MakerSymbolCharacterEncoding() string {
	return "UTF-8"
}

func (AccountPreventedMatchesResponsePreventedMatches) MakerSymbolHeaderLength() uint64 {
	return 1
}

func (*AccountPreventedMatchesResponse) PreventedMatchesId() uint16 {
	return 100
}

func (*AccountPreventedMatchesResponse) PreventedMatchesSinceVersion() uint16 {
	return 0
}

func (a *AccountPreventedMatchesResponse) PreventedMatchesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PreventedMatchesSinceVersion()
}

func (*AccountPreventedMatchesResponse) PreventedMatchesDeprecated() uint16 {
	return 0
}

func (*AccountPreventedMatchesResponsePreventedMatches) SbeBlockLength() (blockLength uint) {
	return 67
}

func (*AccountPreventedMatchesResponsePreventedMatches) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}
