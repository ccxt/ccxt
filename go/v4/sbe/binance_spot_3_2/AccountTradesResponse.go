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

type AccountTradesResponse struct {
	Trades []AccountTradesResponseTrades
}
type AccountTradesResponseTrades struct {
	PriceExponent      int8
	QtyExponent        int8
	CommissionExponent int8
	Id                 int64
	OrderId            int64
	OrderListId        int64
	Price              int64
	Qty                int64
	QuoteQty           int64
	Commission         int64
	Time               int64
	IsBuyer            BoolEnumEnum
	IsMaker            BoolEnumEnum
	IsBestMatch        BoolEnumEnum
	Symbol             []uint8
	CommissionAsset    []uint8
}

func (a *AccountTradesResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var TradesBlockLength uint16 = 70
	if err := _m.WriteUint16(_w, TradesBlockLength); err != nil {
		return err
	}
	var TradesNumInGroup uint32 = uint32(len(a.Trades))
	if err := _m.WriteUint32(_w, TradesNumInGroup); err != nil {
		return err
	}
	for i := range a.Trades {
		if err := a.Trades[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountTradesResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.TradesInActingVersion(actingVersion) {
		var TradesBlockLength uint16
		if err := _m.ReadUint16(_r, &TradesBlockLength); err != nil {
			return err
		}
		var TradesNumInGroup uint32
		if err := _m.ReadUint32(_r, &TradesNumInGroup); err != nil {
			return err
		}
		if cap(a.Trades) < int(TradesNumInGroup) {
			a.Trades = make([]AccountTradesResponseTrades, TradesNumInGroup)
		}
		a.Trades = a.Trades[:TradesNumInGroup]
		for i := range a.Trades {
			if err := a.Trades[i].Decode(_m, _r, actingVersion, uint(TradesBlockLength)); err != nil {
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

func (a *AccountTradesResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range a.Trades {
		if err := a.Trades[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func AccountTradesResponseInit(a *AccountTradesResponse) {
	return
}

func (a *AccountTradesResponseTrades) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, a.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.CommissionExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Id); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.OrderListId); err != nil {
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
	if err := a.IsBestMatch.Encode(_m, _w); err != nil {
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
	return nil
}

func (a *AccountTradesResponseTrades) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	if !a.IdInActingVersion(actingVersion) {
		a.Id = a.IdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Id); err != nil {
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
	if a.IsBestMatchInActingVersion(actingVersion) {
		if err := a.IsBestMatch.Decode(_m, _r, actingVersion); err != nil {
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
	return nil
}

func (a *AccountTradesResponseTrades) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
		if a.CommissionExponent < a.CommissionExponentMinValue() || a.CommissionExponent > a.CommissionExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.CommissionExponent (%v < %v > %v)", a.CommissionExponentMinValue(), a.CommissionExponent, a.CommissionExponentMaxValue())
		}
	}
	if a.IdInActingVersion(actingVersion) {
		if a.Id < a.IdMinValue() || a.Id > a.IdMaxValue() {
			return fmt.Errorf("Range check failed on a.Id (%v < %v > %v)", a.IdMinValue(), a.Id, a.IdMaxValue())
		}
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
		if a.Commission < a.CommissionMinValue() || a.Commission > a.CommissionMaxValue() {
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
	if err := a.IsBestMatch.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if !utf8.Valid(a.Symbol[:]) {
		return errors.New("a.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(a.CommissionAsset[:]) {
		return errors.New("a.CommissionAsset failed UTF-8 validation")
	}
	return nil
}

func AccountTradesResponseTradesInit(a *AccountTradesResponseTrades) {
	a.OrderListId = math.MinInt64
	return
}

func (*AccountTradesResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*AccountTradesResponse) SbeTemplateId() (templateId uint16) {
	return 401
}

func (*AccountTradesResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AccountTradesResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*AccountTradesResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AccountTradesResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AccountTradesResponseTrades) PriceExponentId() uint16 {
	return 1
}

func (*AccountTradesResponseTrades) PriceExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceExponentSinceVersion()
}

func (*AccountTradesResponseTrades) PriceExponentDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) PriceExponentMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountTradesResponseTrades) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountTradesResponseTrades) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountTradesResponseTrades) QtyExponentId() uint16 {
	return 2
}

func (*AccountTradesResponseTrades) QtyExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QtyExponentSinceVersion()
}

func (*AccountTradesResponseTrades) QtyExponentDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) QtyExponentMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountTradesResponseTrades) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountTradesResponseTrades) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountTradesResponseTrades) CommissionExponentId() uint16 {
	return 3
}

func (*AccountTradesResponseTrades) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionExponentSinceVersion()
}

func (*AccountTradesResponseTrades) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) CommissionExponentMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountTradesResponseTrades) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountTradesResponseTrades) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountTradesResponseTrades) IdId() uint16 {
	return 4
}

func (*AccountTradesResponseTrades) IdSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) IdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IdSinceVersion()
}

func (*AccountTradesResponseTrades) IdDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) IdMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) IdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) IdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) IdNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) OrderIdId() uint16 {
	return 5
}

func (*AccountTradesResponseTrades) OrderIdSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.OrderIdSinceVersion()
}

func (*AccountTradesResponseTrades) OrderIdDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) OrderIdMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) OrderListIdId() uint16 {
	return 6
}

func (*AccountTradesResponseTrades) OrderListIdSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.OrderListIdSinceVersion()
}

func (*AccountTradesResponseTrades) OrderListIdDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) OrderListIdMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) PriceId() uint16 {
	return 7
}

func (*AccountTradesResponseTrades) PriceSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceSinceVersion()
}

func (*AccountTradesResponseTrades) PriceDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) PriceMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) PriceNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) QtyId() uint16 {
	return 8
}

func (*AccountTradesResponseTrades) QtySinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QtySinceVersion()
}

func (*AccountTradesResponseTrades) QtyDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) QtyMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) QtyNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) QuoteQtyId() uint16 {
	return 9
}

func (*AccountTradesResponseTrades) QuoteQtySinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) QuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QuoteQtySinceVersion()
}

func (*AccountTradesResponseTrades) QuoteQtyDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) QuoteQtyMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) QuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) QuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) QuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) CommissionId() uint16 {
	return 10
}

func (*AccountTradesResponseTrades) CommissionSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) CommissionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionSinceVersion()
}

func (*AccountTradesResponseTrades) CommissionDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) CommissionMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) CommissionMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) CommissionMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) CommissionNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) TimeId() uint16 {
	return 11
}

func (*AccountTradesResponseTrades) TimeSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) TimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TimeSinceVersion()
}

func (*AccountTradesResponseTrades) TimeDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) TimeMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) TimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountTradesResponseTrades) TimeMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountTradesResponseTrades) TimeNullValue() int64 {
	return math.MinInt64
}

func (*AccountTradesResponseTrades) IsBuyerId() uint16 {
	return 12
}

func (*AccountTradesResponseTrades) IsBuyerSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) IsBuyerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsBuyerSinceVersion()
}

func (*AccountTradesResponseTrades) IsBuyerDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) IsBuyerMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) IsMakerId() uint16 {
	return 13
}

func (*AccountTradesResponseTrades) IsMakerSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) IsMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsMakerSinceVersion()
}

func (*AccountTradesResponseTrades) IsMakerDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) IsMakerMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) IsBestMatchId() uint16 {
	return 14
}

func (*AccountTradesResponseTrades) IsBestMatchSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) IsBestMatchInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsBestMatchSinceVersion()
}

func (*AccountTradesResponseTrades) IsBestMatchDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) IsBestMatchMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) SymbolMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) SymbolSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SymbolSinceVersion()
}

func (*AccountTradesResponseTrades) SymbolDeprecated() uint16 {
	return 0
}

func (AccountTradesResponseTrades) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (AccountTradesResponseTrades) SymbolHeaderLength() uint64 {
	return 1
}

func (*AccountTradesResponseTrades) CommissionAssetMetaAttribute(meta int) string {
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

func (*AccountTradesResponseTrades) CommissionAssetSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponseTrades) CommissionAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionAssetSinceVersion()
}

func (*AccountTradesResponseTrades) CommissionAssetDeprecated() uint16 {
	return 0
}

func (AccountTradesResponseTrades) CommissionAssetCharacterEncoding() string {
	return "UTF-8"
}

func (AccountTradesResponseTrades) CommissionAssetHeaderLength() uint64 {
	return 1
}

func (*AccountTradesResponse) TradesId() uint16 {
	return 100
}

func (*AccountTradesResponse) TradesSinceVersion() uint16 {
	return 0
}

func (a *AccountTradesResponse) TradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TradesSinceVersion()
}

func (*AccountTradesResponse) TradesDeprecated() uint16 {
	return 0
}

func (*AccountTradesResponseTrades) SbeBlockLength() (blockLength uint) {
	return 70
}

func (*AccountTradesResponseTrades) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
