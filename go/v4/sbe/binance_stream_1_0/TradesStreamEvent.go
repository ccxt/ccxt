// Generated SBE (Simple Binary Encoding) message codec

package binance_stream_1_0

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type TradesStreamEvent struct {
	EventTime     int64
	TransactTime  int64
	PriceExponent int8
	QtyExponent   int8
	Trades        []TradesStreamEventTrades
	Symbol        []uint8
}
type TradesStreamEventTrades struct {
	Id           int64
	Price        int64
	Qty          int64
	IsBuyerMaker BoolEnumEnum
	IsBestMatch  BoolEnumEnum
}

func (t *TradesStreamEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, t.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, t.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, t.QtyExponent); err != nil {
		return err
	}
	var TradesBlockLength uint16 = 25
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
	if err := _m.WriteUint8(_w, uint8(len(t.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, t.Symbol); err != nil {
		return err
	}
	return nil
}

func (t *TradesStreamEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !t.EventTimeInActingVersion(actingVersion) {
		t.EventTime = t.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.EventTime); err != nil {
			return err
		}
	}
	if !t.TransactTimeInActingVersion(actingVersion) {
		t.TransactTime = t.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.TransactTime); err != nil {
			return err
		}
	}
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
			t.Trades = make([]TradesStreamEventTrades, TradesNumInGroup)
		}
		t.Trades = t.Trades[:TradesNumInGroup]
		for i := range t.Trades {
			if err := t.Trades[i].Decode(_m, _r, actingVersion, uint(TradesBlockLength)); err != nil {
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
	if doRangeCheck {
		if err := t.RangeCheck(actingVersion, t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (t *TradesStreamEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if t.EventTimeInActingVersion(actingVersion) {
		if t.EventTime < t.EventTimeMinValue() || t.EventTime > t.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on t.EventTime (%v < %v > %v)", t.EventTimeMinValue(), t.EventTime, t.EventTimeMaxValue())
		}
	}
	if t.TransactTimeInActingVersion(actingVersion) {
		if t.TransactTime < t.TransactTimeMinValue() || t.TransactTime > t.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on t.TransactTime (%v < %v > %v)", t.TransactTimeMinValue(), t.TransactTime, t.TransactTimeMaxValue())
		}
	}
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
	if !utf8.Valid(t.Symbol[:]) {
		return errors.New("t.Symbol failed UTF-8 validation")
	}
	return nil
}

func TradesStreamEventInit(t *TradesStreamEvent) {
	return
}

func (t *TradesStreamEventTrades) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, t.Id); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.Qty); err != nil {
		return err
	}
	if err := t.IsBuyerMaker.Encode(_m, _w); err != nil {
		return err
	}
	return nil
}

func (t *TradesStreamEventTrades) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	if t.IsBuyerMakerInActingVersion(actingVersion) {
		if err := t.IsBuyerMaker.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	t.IsBestMatch = BoolEnum.True
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}
	return nil
}

func (t *TradesStreamEventTrades) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	if err := t.IsBuyerMaker.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := t.IsBestMatch.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	return nil
}

func TradesStreamEventTradesInit(t *TradesStreamEventTrades) {
	t.IsBestMatch = BoolEnum.True
	return
}

func (*TradesStreamEvent) SbeBlockLength() (blockLength uint16) {
	return 18
}

func (*TradesStreamEvent) SbeTemplateId() (templateId uint16) {
	return 10000
}

func (*TradesStreamEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*TradesStreamEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*TradesStreamEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TradesStreamEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TradesStreamEvent) EventTimeId() uint16 {
	return 1
}

func (*TradesStreamEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.EventTimeSinceVersion()
}

func (*TradesStreamEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*TradesStreamEvent) EventTimeMetaAttribute(meta int) string {
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

func (*TradesStreamEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesStreamEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesStreamEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*TradesStreamEvent) TransactTimeId() uint16 {
	return 2
}

func (*TradesStreamEvent) TransactTimeSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEvent) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TransactTimeSinceVersion()
}

func (*TradesStreamEvent) TransactTimeDeprecated() uint16 {
	return 0
}

func (*TradesStreamEvent) TransactTimeMetaAttribute(meta int) string {
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

func (*TradesStreamEvent) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesStreamEvent) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesStreamEvent) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*TradesStreamEvent) PriceExponentId() uint16 {
	return 3
}

func (*TradesStreamEvent) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEvent) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*TradesStreamEvent) PriceExponentDeprecated() uint16 {
	return 0
}

func (*TradesStreamEvent) PriceExponentMetaAttribute(meta int) string {
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

func (*TradesStreamEvent) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TradesStreamEvent) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TradesStreamEvent) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*TradesStreamEvent) QtyExponentId() uint16 {
	return 4
}

func (*TradesStreamEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*TradesStreamEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*TradesStreamEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*TradesStreamEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TradesStreamEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TradesStreamEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*TradesStreamEventTrades) IdId() uint16 {
	return 1
}

func (*TradesStreamEventTrades) IdSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEventTrades) IdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.IdSinceVersion()
}

func (*TradesStreamEventTrades) IdDeprecated() uint16 {
	return 0
}

func (*TradesStreamEventTrades) IdMetaAttribute(meta int) string {
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

func (*TradesStreamEventTrades) IdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesStreamEventTrades) IdMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesStreamEventTrades) IdNullValue() int64 {
	return math.MinInt64
}

func (*TradesStreamEventTrades) PriceId() uint16 {
	return 2
}

func (*TradesStreamEventTrades) PriceSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEventTrades) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceSinceVersion()
}

func (*TradesStreamEventTrades) PriceDeprecated() uint16 {
	return 0
}

func (*TradesStreamEventTrades) PriceMetaAttribute(meta int) string {
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

func (*TradesStreamEventTrades) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesStreamEventTrades) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesStreamEventTrades) PriceNullValue() int64 {
	return math.MinInt64
}

func (*TradesStreamEventTrades) QtyId() uint16 {
	return 3
}

func (*TradesStreamEventTrades) QtySinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEventTrades) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtySinceVersion()
}

func (*TradesStreamEventTrades) QtyDeprecated() uint16 {
	return 0
}

func (*TradesStreamEventTrades) QtyMetaAttribute(meta int) string {
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

func (*TradesStreamEventTrades) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesStreamEventTrades) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesStreamEventTrades) QtyNullValue() int64 {
	return math.MinInt64
}

func (*TradesStreamEventTrades) IsBuyerMakerId() uint16 {
	return 4
}

func (*TradesStreamEventTrades) IsBuyerMakerSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEventTrades) IsBuyerMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.IsBuyerMakerSinceVersion()
}

func (*TradesStreamEventTrades) IsBuyerMakerDeprecated() uint16 {
	return 0
}

func (*TradesStreamEventTrades) IsBuyerMakerMetaAttribute(meta int) string {
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

func (*TradesStreamEventTrades) IsBestMatchId() uint16 {
	return 5
}

func (*TradesStreamEventTrades) IsBestMatchSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEventTrades) IsBestMatchInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.IsBestMatchSinceVersion()
}

func (*TradesStreamEventTrades) IsBestMatchDeprecated() uint16 {
	return 0
}

func (*TradesStreamEventTrades) IsBestMatchMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "constant"
	}
	return ""
}

func (*TradesStreamEvent) TradesId() uint16 {
	return 100
}

func (*TradesStreamEvent) TradesSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEvent) TradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TradesSinceVersion()
}

func (*TradesStreamEvent) TradesDeprecated() uint16 {
	return 0
}

func (*TradesStreamEventTrades) SbeBlockLength() (blockLength uint) {
	return 25
}

func (*TradesStreamEventTrades) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*TradesStreamEvent) SymbolMetaAttribute(meta int) string {
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

func (*TradesStreamEvent) SymbolSinceVersion() uint16 {
	return 0
}

func (t *TradesStreamEvent) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*TradesStreamEvent) SymbolDeprecated() uint16 {
	return 0
}

func (TradesStreamEvent) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (TradesStreamEvent) SymbolHeaderLength() uint64 {
	return 1
}
