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

type Ticker24hSymbolFullResponse struct {
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

func (t *Ticker24hSymbolFullResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (t *Ticker24hSymbolFullResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
	if doRangeCheck {
		if err := t.RangeCheck(actingVersion, t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (t *Ticker24hSymbolFullResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func Ticker24hSymbolFullResponseInit(t *Ticker24hSymbolFullResponse) {
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

func (*Ticker24hSymbolFullResponse) SbeBlockLength() (blockLength uint16) {
	return 182
}

func (*Ticker24hSymbolFullResponse) SbeTemplateId() (templateId uint16) {
	return 205
}

func (*Ticker24hSymbolFullResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*Ticker24hSymbolFullResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*Ticker24hSymbolFullResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*Ticker24hSymbolFullResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*Ticker24hSymbolFullResponse) PriceExponentId() uint16 {
	return 1
}

func (*Ticker24hSymbolFullResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*Ticker24hSymbolFullResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hSymbolFullResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hSymbolFullResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hSymbolFullResponse) QtyExponentId() uint16 {
	return 2
}

func (*Ticker24hSymbolFullResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*Ticker24hSymbolFullResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hSymbolFullResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hSymbolFullResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hSymbolFullResponse) PriceChangeId() uint16 {
	return 3
}

func (*Ticker24hSymbolFullResponse) PriceChangeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) PriceChangeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangeSinceVersion()
}

func (*Ticker24hSymbolFullResponse) PriceChangeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) PriceChangeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) PriceChangeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) PriceChangeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) PriceChangeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) PriceChangePercentId() uint16 {
	return 4
}

func (*Ticker24hSymbolFullResponse) PriceChangePercentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) PriceChangePercentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangePercentSinceVersion()
}

func (*Ticker24hSymbolFullResponse) PriceChangePercentDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) PriceChangePercentMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) PriceChangePercentMinValue() float32 {
	return -math.MaxFloat32
}

func (*Ticker24hSymbolFullResponse) PriceChangePercentMaxValue() float32 {
	return math.MaxFloat32
}

func (*Ticker24hSymbolFullResponse) PriceChangePercentNullValue() float32 {
	return float32(math.NaN())
}

func (*Ticker24hSymbolFullResponse) WeightedAvgPriceId() uint16 {
	return 5
}

func (*Ticker24hSymbolFullResponse) WeightedAvgPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) WeightedAvgPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.WeightedAvgPriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) WeightedAvgPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) WeightedAvgPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) WeightedAvgPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) WeightedAvgPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) WeightedAvgPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) PrevClosePriceId() uint16 {
	return 6
}

func (*Ticker24hSymbolFullResponse) PrevClosePriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) PrevClosePriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PrevClosePriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) PrevClosePriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) PrevClosePriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) PrevClosePriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) PrevClosePriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) PrevClosePriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) LastPriceId() uint16 {
	return 7
}

func (*Ticker24hSymbolFullResponse) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) LastPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) LastPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) LastQtyId() uint16 {
	return 8
}

func (*Ticker24hSymbolFullResponse) LastQtySinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) LastQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastQtySinceVersion()
}

func (*Ticker24hSymbolFullResponse) LastQtyDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) LastQtyMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) LastQtyMinValue() uint8 {
	return 0
}

func (*Ticker24hSymbolFullResponse) LastQtyMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hSymbolFullResponse) LastQtyNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hSymbolFullResponse) BidPriceId() uint16 {
	return 9
}

func (*Ticker24hSymbolFullResponse) BidPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) BidPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.BidPriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) BidPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) BidPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) BidPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) BidPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) BidPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) BidQtyId() uint16 {
	return 10
}

func (*Ticker24hSymbolFullResponse) BidQtySinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) BidQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.BidQtySinceVersion()
}

func (*Ticker24hSymbolFullResponse) BidQtyDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) BidQtyMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) BidQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) BidQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) BidQtyNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) AskPriceId() uint16 {
	return 11
}

func (*Ticker24hSymbolFullResponse) AskPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) AskPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.AskPriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) AskPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) AskPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) AskPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) AskPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) AskPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) AskQtyId() uint16 {
	return 12
}

func (*Ticker24hSymbolFullResponse) AskQtySinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) AskQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.AskQtySinceVersion()
}

func (*Ticker24hSymbolFullResponse) AskQtyDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) AskQtyMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) AskQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) AskQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) AskQtyNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) OpenPriceId() uint16 {
	return 13
}

func (*Ticker24hSymbolFullResponse) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) OpenPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) OpenPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) HighPriceId() uint16 {
	return 14
}

func (*Ticker24hSymbolFullResponse) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) HighPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) HighPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) LowPriceId() uint16 {
	return 15
}

func (*Ticker24hSymbolFullResponse) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*Ticker24hSymbolFullResponse) LowPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) LowPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) VolumeId() uint16 {
	return 16
}

func (*Ticker24hSymbolFullResponse) VolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*Ticker24hSymbolFullResponse) VolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) VolumeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) VolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hSymbolFullResponse) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hSymbolFullResponse) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hSymbolFullResponse) QuoteVolumeId() uint16 {
	return 17
}

func (*Ticker24hSymbolFullResponse) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*Ticker24hSymbolFullResponse) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) QuoteVolumeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hSymbolFullResponse) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hSymbolFullResponse) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hSymbolFullResponse) OpenTimeId() uint16 {
	return 18
}

func (*Ticker24hSymbolFullResponse) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*Ticker24hSymbolFullResponse) OpenTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) OpenTimeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) CloseTimeId() uint16 {
	return 19
}

func (*Ticker24hSymbolFullResponse) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*Ticker24hSymbolFullResponse) CloseTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) CloseTimeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) FirstIdId() uint16 {
	return 20
}

func (*Ticker24hSymbolFullResponse) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*Ticker24hSymbolFullResponse) FirstIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) FirstIdMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) LastIdId() uint16 {
	return 21
}

func (*Ticker24hSymbolFullResponse) LastIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*Ticker24hSymbolFullResponse) LastIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) LastIdMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) NumTradesId() uint16 {
	return 22
}

func (*Ticker24hSymbolFullResponse) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*Ticker24hSymbolFullResponse) NumTradesDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolFullResponse) NumTradesMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolFullResponse) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolFullResponse) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolFullResponse) SymbolMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolFullResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolFullResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*Ticker24hSymbolFullResponse) SymbolDeprecated() uint16 {
	return 0
}

func (Ticker24hSymbolFullResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (Ticker24hSymbolFullResponse) SymbolHeaderLength() uint64 {
	return 1
}
