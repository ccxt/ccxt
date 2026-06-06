// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type TradesResponse struct {
	PriceExponent int8
	QtyExponent   int8
	Trades        []TradesResponseTrades
}
type TradesResponseTrades struct {
	Id           int64
	Price        int64
	Qty          int64
	QuoteQty     int64
	Time         int64
	IsBuyerMaker BoolEnumEnum
	IsBestMatch  BoolEnumEnum
}

func (t *TradesResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, t.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, t.QtyExponent); err != nil {
		return err
	}
	var TradesBlockLength uint16 = 42
	if err := _m.WriteUint16(_w, TradesBlockLength); err != nil {
		return err
	}
	var TradesNumInGroup uint32 = uint32(len(t.Trades))
	if err := _m.WriteUint32(_w, TradesNumInGroup); err != nil {
		return err
	}
	for i := range t.Trades {
		if err := t.Trades[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (t *TradesResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !t.PriceExponentInActingVersion(actingVersion) {
		t.PriceExponent = t.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &t.PriceExponent); err != nil {
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
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}

	if t.TradesInActingVersion(actingVersion) {
		var TradesBlockLength uint16
		if err := _m.ReadUint16(_r, &TradesBlockLength); err != nil {
			return err
		}
		var TradesNumInGroup uint32
		if err := _m.ReadUint32(_r, &TradesNumInGroup); err != nil {
			return err
		}
		if cap(t.Trades) < int(TradesNumInGroup) {
			t.Trades = make([]TradesResponseTrades, TradesNumInGroup)
		}
		t.Trades = t.Trades[:TradesNumInGroup]
		for i := range t.Trades {
			if err := t.Trades[i].Decode(_m, _r, actingVersion, uint(TradesBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := t.RangeCheck(actingVersion, t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (t *TradesResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if t.PriceExponentInActingVersion(actingVersion) {
		if t.PriceExponent < t.PriceExponentMinValue() || t.PriceExponent > t.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on t.PriceExponent (%v < %v > %v)", t.PriceExponentMinValue(), t.PriceExponent, t.PriceExponentMaxValue())
		}
	}
	if t.QtyExponentInActingVersion(actingVersion) {
		if t.QtyExponent < t.QtyExponentMinValue() || t.QtyExponent > t.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on t.QtyExponent (%v < %v > %v)", t.QtyExponentMinValue(), t.QtyExponent, t.QtyExponentMaxValue())
		}
	}
	for i := range t.Trades {
		if err := t.Trades[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func TradesResponseInit(t *TradesResponse) {
	return
}

func (t *TradesResponseTrades) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, t.Id); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.Qty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.QuoteQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.Time); err != nil {
		return err
	}
	if err := t.IsBuyerMaker.Encode(_m, _w); err != nil {
		return err
	}
	if err := t.IsBestMatch.Encode(_m, _w); err != nil {
		return err
	}
	return nil
}

func (t *TradesResponseTrades) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !t.IdInActingVersion(actingVersion) {
		t.Id = t.IdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.Id); err != nil {
			return err
		}
	}
	if !t.PriceInActingVersion(actingVersion) {
		t.Price = t.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.Price); err != nil {
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
	if !t.QuoteQtyInActingVersion(actingVersion) {
		t.QuoteQty = t.QuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.QuoteQty); err != nil {
			return err
		}
	}
	if !t.TimeInActingVersion(actingVersion) {
		t.Time = t.TimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.Time); err != nil {
			return err
		}
	}
	if t.IsBuyerMakerInActingVersion(actingVersion) {
		if err := t.IsBuyerMaker.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if t.IsBestMatchInActingVersion(actingVersion) {
		if err := t.IsBestMatch.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}
	return nil
}

func (t *TradesResponseTrades) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if t.IdInActingVersion(actingVersion) {
		if t.Id < t.IdMinValue() || t.Id > t.IdMaxValue() {
			return fmt.Errorf("Range check failed on t.Id (%v < %v > %v)", t.IdMinValue(), t.Id, t.IdMaxValue())
		}
	}
	if t.PriceInActingVersion(actingVersion) {
		if t.Price < t.PriceMinValue() || t.Price > t.PriceMaxValue() {
			return fmt.Errorf("Range check failed on t.Price (%v < %v > %v)", t.PriceMinValue(), t.Price, t.PriceMaxValue())
		}
	}
	if t.QtyInActingVersion(actingVersion) {
		if t.Qty < t.QtyMinValue() || t.Qty > t.QtyMaxValue() {
			return fmt.Errorf("Range check failed on t.Qty (%v < %v > %v)", t.QtyMinValue(), t.Qty, t.QtyMaxValue())
		}
	}
	if t.QuoteQtyInActingVersion(actingVersion) {
		if t.QuoteQty < t.QuoteQtyMinValue() || t.QuoteQty > t.QuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on t.QuoteQty (%v < %v > %v)", t.QuoteQtyMinValue(), t.QuoteQty, t.QuoteQtyMaxValue())
		}
	}
	if t.TimeInActingVersion(actingVersion) {
		if t.Time < t.TimeMinValue() || t.Time > t.TimeMaxValue() {
			return fmt.Errorf("Range check failed on t.Time (%v < %v > %v)", t.TimeMinValue(), t.Time, t.TimeMaxValue())
		}
	}
	if err := t.IsBuyerMaker.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := t.IsBestMatch.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	return nil
}

func TradesResponseTradesInit(t *TradesResponseTrades) {
	return
}

func (*TradesResponse) SbeBlockLength() (blockLength uint16) {
	return 2
}

func (*TradesResponse) SbeTemplateId() (templateId uint16) {
	return 201
}

func (*TradesResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TradesResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*TradesResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TradesResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TradesResponse) PriceExponentId() uint16 {
	return 1
}

func (*TradesResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *TradesResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*TradesResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*TradesResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*TradesResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TradesResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TradesResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*TradesResponse) QtyExponentId() uint16 {
	return 2
}

func (*TradesResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *TradesResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*TradesResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*TradesResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*TradesResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TradesResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TradesResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*TradesResponseTrades) IdId() uint16 {
	return 1
}

func (*TradesResponseTrades) IdSinceVersion() uint16 {
	return 0
}

func (t *TradesResponseTrades) IdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.IdSinceVersion()
}

func (*TradesResponseTrades) IdDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) IdMetaAttribute(meta int) string {
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

func (*TradesResponseTrades) IdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesResponseTrades) IdMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesResponseTrades) IdNullValue() int64 {
	return math.MinInt64
}

func (*TradesResponseTrades) PriceId() uint16 {
	return 2
}

func (*TradesResponseTrades) PriceSinceVersion() uint16 {
	return 0
}

func (t *TradesResponseTrades) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceSinceVersion()
}

func (*TradesResponseTrades) PriceDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) PriceMetaAttribute(meta int) string {
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

func (*TradesResponseTrades) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesResponseTrades) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesResponseTrades) PriceNullValue() int64 {
	return math.MinInt64
}

func (*TradesResponseTrades) QtyId() uint16 {
	return 3
}

func (*TradesResponseTrades) QtySinceVersion() uint16 {
	return 0
}

func (t *TradesResponseTrades) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtySinceVersion()
}

func (*TradesResponseTrades) QtyDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) QtyMetaAttribute(meta int) string {
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

func (*TradesResponseTrades) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesResponseTrades) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesResponseTrades) QtyNullValue() int64 {
	return math.MinInt64
}

func (*TradesResponseTrades) QuoteQtyId() uint16 {
	return 4
}

func (*TradesResponseTrades) QuoteQtySinceVersion() uint16 {
	return 0
}

func (t *TradesResponseTrades) QuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteQtySinceVersion()
}

func (*TradesResponseTrades) QuoteQtyDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) QuoteQtyMetaAttribute(meta int) string {
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

func (*TradesResponseTrades) QuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesResponseTrades) QuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesResponseTrades) QuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*TradesResponseTrades) TimeId() uint16 {
	return 5
}

func (*TradesResponseTrades) TimeSinceVersion() uint16 {
	return 0
}

func (t *TradesResponseTrades) TimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TimeSinceVersion()
}

func (*TradesResponseTrades) TimeDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) TimeMetaAttribute(meta int) string {
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

func (*TradesResponseTrades) TimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesResponseTrades) TimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesResponseTrades) TimeNullValue() int64 {
	return math.MinInt64
}

func (*TradesResponseTrades) IsBuyerMakerId() uint16 {
	return 6
}

func (*TradesResponseTrades) IsBuyerMakerSinceVersion() uint16 {
	return 0
}

func (t *TradesResponseTrades) IsBuyerMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.IsBuyerMakerSinceVersion()
}

func (*TradesResponseTrades) IsBuyerMakerDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) IsBuyerMakerMetaAttribute(meta int) string {
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

func (*TradesResponseTrades) IsBestMatchId() uint16 {
	return 7
}

func (*TradesResponseTrades) IsBestMatchSinceVersion() uint16 {
	return 0
}

func (t *TradesResponseTrades) IsBestMatchInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.IsBestMatchSinceVersion()
}

func (*TradesResponseTrades) IsBestMatchDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) IsBestMatchMetaAttribute(meta int) string {
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

func (*TradesResponse) TradesId() uint16 {
	return 100
}

func (*TradesResponse) TradesSinceVersion() uint16 {
	return 0
}

func (t *TradesResponse) TradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TradesSinceVersion()
}

func (*TradesResponse) TradesDeprecated() uint16 {
	return 0
}

func (*TradesResponseTrades) SbeBlockLength() (blockLength uint) {
	return 42
}

func (*TradesResponseTrades) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
