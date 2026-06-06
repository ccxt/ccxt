// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type AggTradesResponse struct {
	PriceExponent int8
	QtyExponent   int8
	AggTrades     []AggTradesResponseAggTrades
}
type AggTradesResponseAggTrades struct {
	AggTradeId   int64
	Price        int64
	Qty          int64
	FirstTradeId int64
	LastTradeId  int64
	Time         int64
	IsBuyerMaker BoolEnumEnum
	IsBestMatch  BoolEnumEnum
}

func (a *AggTradesResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, a.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.QtyExponent); err != nil {
		return err
	}
	var AggTradesBlockLength uint16 = 50
	if err := _m.WriteUint16(_w, AggTradesBlockLength); err != nil {
		return err
	}
	var AggTradesNumInGroup uint32 = uint32(len(a.AggTrades))
	if err := _m.WriteUint32(_w, AggTradesNumInGroup); err != nil {
		return err
	}
	for i := range a.AggTrades {
		if err := a.AggTrades[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (a *AggTradesResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.AggTradesInActingVersion(actingVersion) {
		var AggTradesBlockLength uint16
		if err := _m.ReadUint16(_r, &AggTradesBlockLength); err != nil {
			return err
		}
		var AggTradesNumInGroup uint32
		if err := _m.ReadUint32(_r, &AggTradesNumInGroup); err != nil {
			return err
		}
		if cap(a.AggTrades) < int(AggTradesNumInGroup) {
			a.AggTrades = make([]AggTradesResponseAggTrades, AggTradesNumInGroup)
		}
		a.AggTrades = a.AggTrades[:AggTradesNumInGroup]
		for i := range a.AggTrades {
			if err := a.AggTrades[i].Decode(_m, _r, actingVersion, uint(AggTradesBlockLength)); err != nil {
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

func (a *AggTradesResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	for i := range a.AggTrades {
		if err := a.AggTrades[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func AggTradesResponseInit(a *AggTradesResponse) {
	return
}

func (a *AggTradesResponseAggTrades) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, a.AggTradeId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Qty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.FirstTradeId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.LastTradeId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Time); err != nil {
		return err
	}
	if err := a.IsBuyerMaker.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.IsBestMatch.Encode(_m, _w); err != nil {
		return err
	}
	return nil
}

func (a *AggTradesResponseAggTrades) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !a.AggTradeIdInActingVersion(actingVersion) {
		a.AggTradeId = a.AggTradeIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.AggTradeId); err != nil {
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
	if !a.FirstTradeIdInActingVersion(actingVersion) {
		a.FirstTradeId = a.FirstTradeIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.FirstTradeId); err != nil {
			return err
		}
	}
	if !a.LastTradeIdInActingVersion(actingVersion) {
		a.LastTradeId = a.LastTradeIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.LastTradeId); err != nil {
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
	if a.IsBuyerMakerInActingVersion(actingVersion) {
		if err := a.IsBuyerMaker.Decode(_m, _r, actingVersion); err != nil {
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
	return nil
}

func (a *AggTradesResponseAggTrades) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if a.AggTradeIdInActingVersion(actingVersion) {
		if a.AggTradeId < a.AggTradeIdMinValue() || a.AggTradeId > a.AggTradeIdMaxValue() {
			return fmt.Errorf("Range check failed on a.AggTradeId (%v < %v > %v)", a.AggTradeIdMinValue(), a.AggTradeId, a.AggTradeIdMaxValue())
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
	if a.FirstTradeIdInActingVersion(actingVersion) {
		if a.FirstTradeId < a.FirstTradeIdMinValue() || a.FirstTradeId > a.FirstTradeIdMaxValue() {
			return fmt.Errorf("Range check failed on a.FirstTradeId (%v < %v > %v)", a.FirstTradeIdMinValue(), a.FirstTradeId, a.FirstTradeIdMaxValue())
		}
	}
	if a.LastTradeIdInActingVersion(actingVersion) {
		if a.LastTradeId < a.LastTradeIdMinValue() || a.LastTradeId > a.LastTradeIdMaxValue() {
			return fmt.Errorf("Range check failed on a.LastTradeId (%v < %v > %v)", a.LastTradeIdMinValue(), a.LastTradeId, a.LastTradeIdMaxValue())
		}
	}
	if a.TimeInActingVersion(actingVersion) {
		if a.Time < a.TimeMinValue() || a.Time > a.TimeMaxValue() {
			return fmt.Errorf("Range check failed on a.Time (%v < %v > %v)", a.TimeMinValue(), a.Time, a.TimeMaxValue())
		}
	}
	if err := a.IsBuyerMaker.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.IsBestMatch.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	return nil
}

func AggTradesResponseAggTradesInit(a *AggTradesResponseAggTrades) {
	return
}

func (*AggTradesResponse) SbeBlockLength() (blockLength uint16) {
	return 2
}

func (*AggTradesResponse) SbeTemplateId() (templateId uint16) {
	return 202
}

func (*AggTradesResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AggTradesResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*AggTradesResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AggTradesResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AggTradesResponse) PriceExponentId() uint16 {
	return 1
}

func (*AggTradesResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceExponentSinceVersion()
}

func (*AggTradesResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*AggTradesResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*AggTradesResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AggTradesResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AggTradesResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*AggTradesResponse) QtyExponentId() uint16 {
	return 2
}

func (*AggTradesResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QtyExponentSinceVersion()
}

func (*AggTradesResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*AggTradesResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*AggTradesResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AggTradesResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AggTradesResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*AggTradesResponseAggTrades) AggTradeIdId() uint16 {
	return 1
}

func (*AggTradesResponseAggTrades) AggTradeIdSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) AggTradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AggTradeIdSinceVersion()
}

func (*AggTradesResponseAggTrades) AggTradeIdDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) AggTradeIdMetaAttribute(meta int) string {
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

func (*AggTradesResponseAggTrades) AggTradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AggTradesResponseAggTrades) AggTradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AggTradesResponseAggTrades) AggTradeIdNullValue() int64 {
	return math.MinInt64
}

func (*AggTradesResponseAggTrades) PriceId() uint16 {
	return 2
}

func (*AggTradesResponseAggTrades) PriceSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceSinceVersion()
}

func (*AggTradesResponseAggTrades) PriceDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) PriceMetaAttribute(meta int) string {
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

func (*AggTradesResponseAggTrades) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AggTradesResponseAggTrades) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*AggTradesResponseAggTrades) PriceNullValue() int64 {
	return math.MinInt64
}

func (*AggTradesResponseAggTrades) QtyId() uint16 {
	return 3
}

func (*AggTradesResponseAggTrades) QtySinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.QtySinceVersion()
}

func (*AggTradesResponseAggTrades) QtyDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) QtyMetaAttribute(meta int) string {
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

func (*AggTradesResponseAggTrades) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AggTradesResponseAggTrades) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*AggTradesResponseAggTrades) QtyNullValue() int64 {
	return math.MinInt64
}

func (*AggTradesResponseAggTrades) FirstTradeIdId() uint16 {
	return 4
}

func (*AggTradesResponseAggTrades) FirstTradeIdSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) FirstTradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.FirstTradeIdSinceVersion()
}

func (*AggTradesResponseAggTrades) FirstTradeIdDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) FirstTradeIdMetaAttribute(meta int) string {
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

func (*AggTradesResponseAggTrades) FirstTradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AggTradesResponseAggTrades) FirstTradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AggTradesResponseAggTrades) FirstTradeIdNullValue() int64 {
	return math.MinInt64
}

func (*AggTradesResponseAggTrades) LastTradeIdId() uint16 {
	return 5
}

func (*AggTradesResponseAggTrades) LastTradeIdSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) LastTradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.LastTradeIdSinceVersion()
}

func (*AggTradesResponseAggTrades) LastTradeIdDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) LastTradeIdMetaAttribute(meta int) string {
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

func (*AggTradesResponseAggTrades) LastTradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AggTradesResponseAggTrades) LastTradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AggTradesResponseAggTrades) LastTradeIdNullValue() int64 {
	return math.MinInt64
}

func (*AggTradesResponseAggTrades) TimeId() uint16 {
	return 7
}

func (*AggTradesResponseAggTrades) TimeSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) TimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TimeSinceVersion()
}

func (*AggTradesResponseAggTrades) TimeDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) TimeMetaAttribute(meta int) string {
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

func (*AggTradesResponseAggTrades) TimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AggTradesResponseAggTrades) TimeMaxValue() int64 {
	return math.MaxInt64
}

func (*AggTradesResponseAggTrades) TimeNullValue() int64 {
	return math.MinInt64
}

func (*AggTradesResponseAggTrades) IsBuyerMakerId() uint16 {
	return 8
}

func (*AggTradesResponseAggTrades) IsBuyerMakerSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) IsBuyerMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsBuyerMakerSinceVersion()
}

func (*AggTradesResponseAggTrades) IsBuyerMakerDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) IsBuyerMakerMetaAttribute(meta int) string {
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

func (*AggTradesResponseAggTrades) IsBestMatchId() uint16 {
	return 9
}

func (*AggTradesResponseAggTrades) IsBestMatchSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponseAggTrades) IsBestMatchInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IsBestMatchSinceVersion()
}

func (*AggTradesResponseAggTrades) IsBestMatchDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) IsBestMatchMetaAttribute(meta int) string {
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

func (*AggTradesResponse) AggTradesId() uint16 {
	return 100
}

func (*AggTradesResponse) AggTradesSinceVersion() uint16 {
	return 0
}

func (a *AggTradesResponse) AggTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AggTradesSinceVersion()
}

func (*AggTradesResponse) AggTradesDeprecated() uint16 {
	return 0
}

func (*AggTradesResponseAggTrades) SbeBlockLength() (blockLength uint) {
	return 50
}

func (*AggTradesResponseAggTrades) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
