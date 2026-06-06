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

type Ticker24hFullResponse struct {
	Tickers []Ticker24hFullResponseTickers
}
type Ticker24hFullResponseTickers struct {
	PriceExponent      int8
	QtyExponent        int8
	PriceChange        int64
	PriceChangePercent float32
	WeightedAvgPrice   int64
	PrevClosePrice     int64
	LastPrice          int64
	LastQty            [16]uint8
	BidPrice           int64
	BidQty             int64
	AskPrice           int64
	AskQty             int64
	OpenPrice          int64
	HighPrice          int64
	LowPrice           int64
	Volume             [16]uint8
	QuoteVolume        [16]uint8
	OpenTime           int64
	CloseTime          int64
	FirstId            int64
	LastId             int64
	NumTrades          int64
	Symbol             []uint8
}

func (t *Ticker24hFullResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var TickersBlockLength uint16 = 182
	if err := _m.WriteUint16(_w, TickersBlockLength); err != nil {
		return err
	}
	var TickersNumInGroup uint32 = uint32(len(t.Tickers))
	if err := _m.WriteUint32(_w, TickersNumInGroup); err != nil {
		return err
	}
	for i := range t.Tickers {
		if err := t.Tickers[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (t *Ticker24hFullResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}

	if t.TickersInActingVersion(actingVersion) {
		var TickersBlockLength uint16
		if err := _m.ReadUint16(_r, &TickersBlockLength); err != nil {
			return err
		}
		var TickersNumInGroup uint32
		if err := _m.ReadUint32(_r, &TickersNumInGroup); err != nil {
			return err
		}
		if cap(t.Tickers) < int(TickersNumInGroup) {
			t.Tickers = make([]Ticker24hFullResponseTickers, TickersNumInGroup)
		}
		t.Tickers = t.Tickers[:TickersNumInGroup]
		for i := range t.Tickers {
			if err := t.Tickers[i].Decode(_m, _r, actingVersion, uint(TickersBlockLength)); err != nil {
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

func (t *Ticker24hFullResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range t.Tickers {
		if err := t.Tickers[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func Ticker24hFullResponseInit(t *Ticker24hFullResponse) {
	return
}

func (t *Ticker24hFullResponseTickers) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, t.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, t.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.PriceChange); err != nil {
		return err
	}
	if err := _m.WriteFloat32(_w, t.PriceChangePercent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.WeightedAvgPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.PrevClosePrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.LastPrice); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, t.LastQty[:]); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.BidPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.BidQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.AskPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.AskQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.OpenPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.HighPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.LowPrice); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, t.Volume[:]); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, t.QuoteVolume[:]); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.OpenTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.CloseTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.FirstId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.LastId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.NumTrades); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(t.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, t.Symbol); err != nil {
		return err
	}
	return nil
}

func (t *Ticker24hFullResponseTickers) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	if !t.PriceChangeInActingVersion(actingVersion) {
		t.PriceChange = t.PriceChangeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.PriceChange); err != nil {
			return err
		}
	}
	if !t.PriceChangePercentInActingVersion(actingVersion) {
		t.PriceChangePercent = t.PriceChangePercentNullValue()
	} else {
		if err := _m.ReadFloat32(_r, &t.PriceChangePercent); err != nil {
			return err
		}
	}
	if !t.WeightedAvgPriceInActingVersion(actingVersion) {
		t.WeightedAvgPrice = t.WeightedAvgPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.WeightedAvgPrice); err != nil {
			return err
		}
	}
	if !t.PrevClosePriceInActingVersion(actingVersion) {
		t.PrevClosePrice = t.PrevClosePriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.PrevClosePrice); err != nil {
			return err
		}
	}
	if !t.LastPriceInActingVersion(actingVersion) {
		t.LastPrice = t.LastPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.LastPrice); err != nil {
			return err
		}
	}
	if !t.LastQtyInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			t.LastQty[idx] = t.LastQtyNullValue()
		}
	} else {
		if err := _m.ReadBytes(_r, t.LastQty[:]); err != nil {
			return err
		}
	}
	if !t.BidPriceInActingVersion(actingVersion) {
		t.BidPrice = t.BidPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.BidPrice); err != nil {
			return err
		}
	}
	if !t.BidQtyInActingVersion(actingVersion) {
		t.BidQty = t.BidQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.BidQty); err != nil {
			return err
		}
	}
	if !t.AskPriceInActingVersion(actingVersion) {
		t.AskPrice = t.AskPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.AskPrice); err != nil {
			return err
		}
	}
	if !t.AskQtyInActingVersion(actingVersion) {
		t.AskQty = t.AskQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.AskQty); err != nil {
			return err
		}
	}
	if !t.OpenPriceInActingVersion(actingVersion) {
		t.OpenPrice = t.OpenPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.OpenPrice); err != nil {
			return err
		}
	}
	if !t.HighPriceInActingVersion(actingVersion) {
		t.HighPrice = t.HighPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.HighPrice); err != nil {
			return err
		}
	}
	if !t.LowPriceInActingVersion(actingVersion) {
		t.LowPrice = t.LowPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.LowPrice); err != nil {
			return err
		}
	}
	if !t.VolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			t.Volume[idx] = t.VolumeNullValue()
		}
	} else {
		if err := _m.ReadBytes(_r, t.Volume[:]); err != nil {
			return err
		}
	}
	if !t.QuoteVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			t.QuoteVolume[idx] = t.QuoteVolumeNullValue()
		}
	} else {
		if err := _m.ReadBytes(_r, t.QuoteVolume[:]); err != nil {
			return err
		}
	}
	if !t.OpenTimeInActingVersion(actingVersion) {
		t.OpenTime = t.OpenTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.OpenTime); err != nil {
			return err
		}
	}
	if !t.CloseTimeInActingVersion(actingVersion) {
		t.CloseTime = t.CloseTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.CloseTime); err != nil {
			return err
		}
	}
	if !t.FirstIdInActingVersion(actingVersion) {
		t.FirstId = t.FirstIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.FirstId); err != nil {
			return err
		}
	}
	if !t.LastIdInActingVersion(actingVersion) {
		t.LastId = t.LastIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.LastId); err != nil {
			return err
		}
	}
	if !t.NumTradesInActingVersion(actingVersion) {
		t.NumTrades = t.NumTradesNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.NumTrades); err != nil {
			return err
		}
	}
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
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
	return nil
}

func (t *Ticker24hFullResponseTickers) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	if t.PriceChangeInActingVersion(actingVersion) {
		if t.PriceChange != t.PriceChangeNullValue() && (t.PriceChange < t.PriceChangeMinValue() || t.PriceChange > t.PriceChangeMaxValue()) {
			return fmt.Errorf("Range check failed on t.PriceChange (%v < %v > %v)", t.PriceChangeMinValue(), t.PriceChange, t.PriceChangeMaxValue())
		}
	}
	if t.PriceChangePercentInActingVersion(actingVersion) {
		if t.PriceChangePercent != t.PriceChangePercentNullValue() && (t.PriceChangePercent < t.PriceChangePercentMinValue() || t.PriceChangePercent > t.PriceChangePercentMaxValue()) {
			return fmt.Errorf("Range check failed on t.PriceChangePercent (%v < %v > %v)", t.PriceChangePercentMinValue(), t.PriceChangePercent, t.PriceChangePercentMaxValue())
		}
	}
	if t.WeightedAvgPriceInActingVersion(actingVersion) {
		if t.WeightedAvgPrice != t.WeightedAvgPriceNullValue() && (t.WeightedAvgPrice < t.WeightedAvgPriceMinValue() || t.WeightedAvgPrice > t.WeightedAvgPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.WeightedAvgPrice (%v < %v > %v)", t.WeightedAvgPriceMinValue(), t.WeightedAvgPrice, t.WeightedAvgPriceMaxValue())
		}
	}
	if t.PrevClosePriceInActingVersion(actingVersion) {
		if t.PrevClosePrice != t.PrevClosePriceNullValue() && (t.PrevClosePrice < t.PrevClosePriceMinValue() || t.PrevClosePrice > t.PrevClosePriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.PrevClosePrice (%v < %v > %v)", t.PrevClosePriceMinValue(), t.PrevClosePrice, t.PrevClosePriceMaxValue())
		}
	}
	if t.LastPriceInActingVersion(actingVersion) {
		if t.LastPrice != t.LastPriceNullValue() && (t.LastPrice < t.LastPriceMinValue() || t.LastPrice > t.LastPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.LastPrice (%v < %v > %v)", t.LastPriceMinValue(), t.LastPrice, t.LastPriceMaxValue())
		}
	}
	if t.LastQtyInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			if t.LastQty[idx] < t.LastQtyMinValue() || t.LastQty[idx] > t.LastQtyMaxValue() {
				return fmt.Errorf("Range check failed on t.LastQty[%d] (%v < %v > %v)", idx, t.LastQtyMinValue(), t.LastQty[idx], t.LastQtyMaxValue())
			}
		}
	}
	if t.BidPriceInActingVersion(actingVersion) {
		if t.BidPrice != t.BidPriceNullValue() && (t.BidPrice < t.BidPriceMinValue() || t.BidPrice > t.BidPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.BidPrice (%v < %v > %v)", t.BidPriceMinValue(), t.BidPrice, t.BidPriceMaxValue())
		}
	}
	if t.BidQtyInActingVersion(actingVersion) {
		if t.BidQty < t.BidQtyMinValue() || t.BidQty > t.BidQtyMaxValue() {
			return fmt.Errorf("Range check failed on t.BidQty (%v < %v > %v)", t.BidQtyMinValue(), t.BidQty, t.BidQtyMaxValue())
		}
	}
	if t.AskPriceInActingVersion(actingVersion) {
		if t.AskPrice != t.AskPriceNullValue() && (t.AskPrice < t.AskPriceMinValue() || t.AskPrice > t.AskPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.AskPrice (%v < %v > %v)", t.AskPriceMinValue(), t.AskPrice, t.AskPriceMaxValue())
		}
	}
	if t.AskQtyInActingVersion(actingVersion) {
		if t.AskQty < t.AskQtyMinValue() || t.AskQty > t.AskQtyMaxValue() {
			return fmt.Errorf("Range check failed on t.AskQty (%v < %v > %v)", t.AskQtyMinValue(), t.AskQty, t.AskQtyMaxValue())
		}
	}
	if t.OpenPriceInActingVersion(actingVersion) {
		if t.OpenPrice != t.OpenPriceNullValue() && (t.OpenPrice < t.OpenPriceMinValue() || t.OpenPrice > t.OpenPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.OpenPrice (%v < %v > %v)", t.OpenPriceMinValue(), t.OpenPrice, t.OpenPriceMaxValue())
		}
	}
	if t.HighPriceInActingVersion(actingVersion) {
		if t.HighPrice != t.HighPriceNullValue() && (t.HighPrice < t.HighPriceMinValue() || t.HighPrice > t.HighPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.HighPrice (%v < %v > %v)", t.HighPriceMinValue(), t.HighPrice, t.HighPriceMaxValue())
		}
	}
	if t.LowPriceInActingVersion(actingVersion) {
		if t.LowPrice != t.LowPriceNullValue() && (t.LowPrice < t.LowPriceMinValue() || t.LowPrice > t.LowPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.LowPrice (%v < %v > %v)", t.LowPriceMinValue(), t.LowPrice, t.LowPriceMaxValue())
		}
	}
	if t.VolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			if t.Volume[idx] < t.VolumeMinValue() || t.Volume[idx] > t.VolumeMaxValue() {
				return fmt.Errorf("Range check failed on t.Volume[%d] (%v < %v > %v)", idx, t.VolumeMinValue(), t.Volume[idx], t.VolumeMaxValue())
			}
		}
	}
	if t.QuoteVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			if t.QuoteVolume[idx] < t.QuoteVolumeMinValue() || t.QuoteVolume[idx] > t.QuoteVolumeMaxValue() {
				return fmt.Errorf("Range check failed on t.QuoteVolume[%d] (%v < %v > %v)", idx, t.QuoteVolumeMinValue(), t.QuoteVolume[idx], t.QuoteVolumeMaxValue())
			}
		}
	}
	if t.OpenTimeInActingVersion(actingVersion) {
		if t.OpenTime < t.OpenTimeMinValue() || t.OpenTime > t.OpenTimeMaxValue() {
			return fmt.Errorf("Range check failed on t.OpenTime (%v < %v > %v)", t.OpenTimeMinValue(), t.OpenTime, t.OpenTimeMaxValue())
		}
	}
	if t.CloseTimeInActingVersion(actingVersion) {
		if t.CloseTime < t.CloseTimeMinValue() || t.CloseTime > t.CloseTimeMaxValue() {
			return fmt.Errorf("Range check failed on t.CloseTime (%v < %v > %v)", t.CloseTimeMinValue(), t.CloseTime, t.CloseTimeMaxValue())
		}
	}
	if t.FirstIdInActingVersion(actingVersion) {
		if t.FirstId != t.FirstIdNullValue() && (t.FirstId < t.FirstIdMinValue() || t.FirstId > t.FirstIdMaxValue()) {
			return fmt.Errorf("Range check failed on t.FirstId (%v < %v > %v)", t.FirstIdMinValue(), t.FirstId, t.FirstIdMaxValue())
		}
	}
	if t.LastIdInActingVersion(actingVersion) {
		if t.LastId != t.LastIdNullValue() && (t.LastId < t.LastIdMinValue() || t.LastId > t.LastIdMaxValue()) {
			return fmt.Errorf("Range check failed on t.LastId (%v < %v > %v)", t.LastIdMinValue(), t.LastId, t.LastIdMaxValue())
		}
	}
	if t.NumTradesInActingVersion(actingVersion) {
		if t.NumTrades < t.NumTradesMinValue() || t.NumTrades > t.NumTradesMaxValue() {
			return fmt.Errorf("Range check failed on t.NumTrades (%v < %v > %v)", t.NumTradesMinValue(), t.NumTrades, t.NumTradesMaxValue())
		}
	}
	if !utf8.Valid(t.Symbol[:]) {
		return errors.New("t.Symbol failed UTF-8 validation")
	}
	return nil
}

func Ticker24hFullResponseTickersInit(t *Ticker24hFullResponseTickers) {
	t.PriceChange = math.MinInt64
	t.PriceChangePercent = float32(math.NaN())
	t.WeightedAvgPrice = math.MinInt64
	t.PrevClosePrice = math.MinInt64
	t.LastPrice = math.MinInt64
	t.BidPrice = math.MinInt64
	t.AskPrice = math.MinInt64
	t.OpenPrice = math.MinInt64
	t.HighPrice = math.MinInt64
	t.LowPrice = math.MinInt64
	t.FirstId = math.MinInt64
	t.LastId = math.MinInt64
	return
}

func (*Ticker24hFullResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*Ticker24hFullResponse) SbeTemplateId() (templateId uint16) {
	return 206
}

func (*Ticker24hFullResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*Ticker24hFullResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*Ticker24hFullResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*Ticker24hFullResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*Ticker24hFullResponseTickers) PriceExponentId() uint16 {
	return 1
}

func (*Ticker24hFullResponseTickers) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*Ticker24hFullResponseTickers) PriceExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) PriceExponentMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hFullResponseTickers) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hFullResponseTickers) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hFullResponseTickers) QtyExponentId() uint16 {
	return 2
}

func (*Ticker24hFullResponseTickers) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*Ticker24hFullResponseTickers) QtyExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) QtyExponentMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hFullResponseTickers) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hFullResponseTickers) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hFullResponseTickers) PriceChangeId() uint16 {
	return 3
}

func (*Ticker24hFullResponseTickers) PriceChangeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) PriceChangeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangeSinceVersion()
}

func (*Ticker24hFullResponseTickers) PriceChangeDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) PriceChangeMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) PriceChangeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) PriceChangeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) PriceChangeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) PriceChangePercentId() uint16 {
	return 4
}

func (*Ticker24hFullResponseTickers) PriceChangePercentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) PriceChangePercentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangePercentSinceVersion()
}

func (*Ticker24hFullResponseTickers) PriceChangePercentDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) PriceChangePercentMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) PriceChangePercentMinValue() float32 {
	return -math.MaxFloat32
}

func (*Ticker24hFullResponseTickers) PriceChangePercentMaxValue() float32 {
	return math.MaxFloat32
}

func (*Ticker24hFullResponseTickers) PriceChangePercentNullValue() float32 {
	return float32(math.NaN())
}

func (*Ticker24hFullResponseTickers) WeightedAvgPriceId() uint16 {
	return 5
}

func (*Ticker24hFullResponseTickers) WeightedAvgPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) WeightedAvgPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.WeightedAvgPriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) WeightedAvgPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) WeightedAvgPriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) WeightedAvgPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) WeightedAvgPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) WeightedAvgPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) PrevClosePriceId() uint16 {
	return 6
}

func (*Ticker24hFullResponseTickers) PrevClosePriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) PrevClosePriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PrevClosePriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) PrevClosePriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) PrevClosePriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) PrevClosePriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) PrevClosePriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) PrevClosePriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) LastPriceId() uint16 {
	return 7
}

func (*Ticker24hFullResponseTickers) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) LastPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) LastPriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) LastQtyId() uint16 {
	return 8
}

func (*Ticker24hFullResponseTickers) LastQtySinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) LastQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastQtySinceVersion()
}

func (*Ticker24hFullResponseTickers) LastQtyDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) LastQtyMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) LastQtyMinValue() uint8 {
	return 0
}

func (*Ticker24hFullResponseTickers) LastQtyMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hFullResponseTickers) LastQtyNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hFullResponseTickers) BidPriceId() uint16 {
	return 9
}

func (*Ticker24hFullResponseTickers) BidPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) BidPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.BidPriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) BidPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) BidPriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) BidPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) BidPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) BidPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) BidQtyId() uint16 {
	return 10
}

func (*Ticker24hFullResponseTickers) BidQtySinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) BidQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.BidQtySinceVersion()
}

func (*Ticker24hFullResponseTickers) BidQtyDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) BidQtyMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) BidQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) BidQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) BidQtyNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) AskPriceId() uint16 {
	return 11
}

func (*Ticker24hFullResponseTickers) AskPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) AskPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.AskPriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) AskPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) AskPriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) AskPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) AskPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) AskPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) AskQtyId() uint16 {
	return 12
}

func (*Ticker24hFullResponseTickers) AskQtySinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) AskQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.AskQtySinceVersion()
}

func (*Ticker24hFullResponseTickers) AskQtyDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) AskQtyMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) AskQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) AskQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) AskQtyNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) OpenPriceId() uint16 {
	return 13
}

func (*Ticker24hFullResponseTickers) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) OpenPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) OpenPriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) HighPriceId() uint16 {
	return 14
}

func (*Ticker24hFullResponseTickers) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) HighPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) HighPriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) LowPriceId() uint16 {
	return 15
}

func (*Ticker24hFullResponseTickers) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*Ticker24hFullResponseTickers) LowPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) LowPriceMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) VolumeId() uint16 {
	return 16
}

func (*Ticker24hFullResponseTickers) VolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*Ticker24hFullResponseTickers) VolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) VolumeMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) VolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hFullResponseTickers) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hFullResponseTickers) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hFullResponseTickers) QuoteVolumeId() uint16 {
	return 17
}

func (*Ticker24hFullResponseTickers) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*Ticker24hFullResponseTickers) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) QuoteVolumeMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hFullResponseTickers) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hFullResponseTickers) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hFullResponseTickers) OpenTimeId() uint16 {
	return 18
}

func (*Ticker24hFullResponseTickers) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*Ticker24hFullResponseTickers) OpenTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) OpenTimeMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) CloseTimeId() uint16 {
	return 19
}

func (*Ticker24hFullResponseTickers) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*Ticker24hFullResponseTickers) CloseTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) CloseTimeMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) FirstIdId() uint16 {
	return 20
}

func (*Ticker24hFullResponseTickers) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*Ticker24hFullResponseTickers) FirstIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) FirstIdMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) LastIdId() uint16 {
	return 21
}

func (*Ticker24hFullResponseTickers) LastIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*Ticker24hFullResponseTickers) LastIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) LastIdMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) NumTradesId() uint16 {
	return 22
}

func (*Ticker24hFullResponseTickers) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*Ticker24hFullResponseTickers) NumTradesDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) NumTradesMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hFullResponseTickers) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hFullResponseTickers) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hFullResponseTickers) SymbolMetaAttribute(meta int) string {
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

func (*Ticker24hFullResponseTickers) SymbolSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponseTickers) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*Ticker24hFullResponseTickers) SymbolDeprecated() uint16 {
	return 0
}

func (Ticker24hFullResponseTickers) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (Ticker24hFullResponseTickers) SymbolHeaderLength() uint64 {
	return 1
}

func (*Ticker24hFullResponse) TickersId() uint16 {
	return 100
}

func (*Ticker24hFullResponse) TickersSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hFullResponse) TickersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TickersSinceVersion()
}

func (*Ticker24hFullResponse) TickersDeprecated() uint16 {
	return 0
}

func (*Ticker24hFullResponseTickers) SbeBlockLength() (blockLength uint) {
	return 182
}

func (*Ticker24hFullResponseTickers) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
