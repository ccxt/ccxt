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

type TickerFullResponse struct {
	Tickers []TickerFullResponseTickers
}
type TickerFullResponseTickers struct {
	PriceExponent      int8
	QtyExponent        int8
	PriceChange        int64
	PriceChangePercent float32
	WeightedAvgPrice   int64
	OpenPrice          int64
	HighPrice          int64
	LowPrice           int64
	LastPrice          int64
	Volume             [16]uint8
	QuoteVolume        [16]uint8
	OpenTime           int64
	CloseTime          int64
	FirstId            int64
	LastId             int64
	NumTrades          int64
	Symbol             []uint8
}

func (t *TickerFullResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var TickersBlockLength uint16 = 126
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

func (t *TickerFullResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
			t.Tickers = make([]TickerFullResponseTickers, TickersNumInGroup)
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

func (t *TickerFullResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range t.Tickers {
		if err := t.Tickers[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func TickerFullResponseInit(t *TickerFullResponse) {
	return
}

func (t *TickerFullResponseTickers) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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
	if err := _m.WriteInt64(_w, t.OpenPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.HighPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.LowPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.LastPrice); err != nil {
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

func (t *TickerFullResponseTickers) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	if !t.LastPriceInActingVersion(actingVersion) {
		t.LastPrice = t.LastPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.LastPrice); err != nil {
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

func (t *TickerFullResponseTickers) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	if t.LastPriceInActingVersion(actingVersion) {
		if t.LastPrice != t.LastPriceNullValue() && (t.LastPrice < t.LastPriceMinValue() || t.LastPrice > t.LastPriceMaxValue()) {
			return fmt.Errorf("Range check failed on t.LastPrice (%v < %v > %v)", t.LastPriceMinValue(), t.LastPrice, t.LastPriceMaxValue())
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

func TickerFullResponseTickersInit(t *TickerFullResponseTickers) {
	t.PriceChange = math.MinInt64
	t.PriceChangePercent = float32(math.NaN())
	t.WeightedAvgPrice = math.MinInt64
	t.OpenPrice = math.MinInt64
	t.HighPrice = math.MinInt64
	t.LowPrice = math.MinInt64
	t.LastPrice = math.MinInt64
	t.FirstId = math.MinInt64
	t.LastId = math.MinInt64
	return
}

func (*TickerFullResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*TickerFullResponse) SbeTemplateId() (templateId uint16) {
	return 214
}

func (*TickerFullResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TickerFullResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*TickerFullResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TickerFullResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TickerFullResponseTickers) PriceExponentId() uint16 {
	return 1
}

func (*TickerFullResponseTickers) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*TickerFullResponseTickers) PriceExponentDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) PriceExponentMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerFullResponseTickers) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerFullResponseTickers) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerFullResponseTickers) QtyExponentId() uint16 {
	return 2
}

func (*TickerFullResponseTickers) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*TickerFullResponseTickers) QtyExponentDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) QtyExponentMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerFullResponseTickers) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerFullResponseTickers) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerFullResponseTickers) PriceChangeId() uint16 {
	return 3
}

func (*TickerFullResponseTickers) PriceChangeSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) PriceChangeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangeSinceVersion()
}

func (*TickerFullResponseTickers) PriceChangeDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) PriceChangeMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) PriceChangeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) PriceChangeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) PriceChangeNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) PriceChangePercentId() uint16 {
	return 4
}

func (*TickerFullResponseTickers) PriceChangePercentSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) PriceChangePercentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangePercentSinceVersion()
}

func (*TickerFullResponseTickers) PriceChangePercentDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) PriceChangePercentMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) PriceChangePercentMinValue() float32 {
	return -math.MaxFloat32
}

func (*TickerFullResponseTickers) PriceChangePercentMaxValue() float32 {
	return math.MaxFloat32
}

func (*TickerFullResponseTickers) PriceChangePercentNullValue() float32 {
	return float32(math.NaN())
}

func (*TickerFullResponseTickers) WeightedAvgPriceId() uint16 {
	return 5
}

func (*TickerFullResponseTickers) WeightedAvgPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) WeightedAvgPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.WeightedAvgPriceSinceVersion()
}

func (*TickerFullResponseTickers) WeightedAvgPriceDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) WeightedAvgPriceMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) WeightedAvgPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) WeightedAvgPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) WeightedAvgPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) OpenPriceId() uint16 {
	return 6
}

func (*TickerFullResponseTickers) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*TickerFullResponseTickers) OpenPriceDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) OpenPriceMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) HighPriceId() uint16 {
	return 7
}

func (*TickerFullResponseTickers) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*TickerFullResponseTickers) HighPriceDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) HighPriceMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) LowPriceId() uint16 {
	return 8
}

func (*TickerFullResponseTickers) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*TickerFullResponseTickers) LowPriceDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) LowPriceMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) LastPriceId() uint16 {
	return 9
}

func (*TickerFullResponseTickers) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*TickerFullResponseTickers) LastPriceDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) LastPriceMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) VolumeId() uint16 {
	return 10
}

func (*TickerFullResponseTickers) VolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*TickerFullResponseTickers) VolumeDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) VolumeMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) VolumeMinValue() uint8 {
	return 0
}

func (*TickerFullResponseTickers) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerFullResponseTickers) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerFullResponseTickers) QuoteVolumeId() uint16 {
	return 11
}

func (*TickerFullResponseTickers) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*TickerFullResponseTickers) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) QuoteVolumeMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*TickerFullResponseTickers) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerFullResponseTickers) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerFullResponseTickers) OpenTimeId() uint16 {
	return 12
}

func (*TickerFullResponseTickers) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*TickerFullResponseTickers) OpenTimeDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) OpenTimeMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) CloseTimeId() uint16 {
	return 13
}

func (*TickerFullResponseTickers) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*TickerFullResponseTickers) CloseTimeDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) CloseTimeMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) FirstIdId() uint16 {
	return 14
}

func (*TickerFullResponseTickers) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*TickerFullResponseTickers) FirstIdDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) FirstIdMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) LastIdId() uint16 {
	return 15
}

func (*TickerFullResponseTickers) LastIdSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*TickerFullResponseTickers) LastIdDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) LastIdMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) NumTradesId() uint16 {
	return 16
}

func (*TickerFullResponseTickers) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*TickerFullResponseTickers) NumTradesDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) NumTradesMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerFullResponseTickers) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerFullResponseTickers) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*TickerFullResponseTickers) SymbolMetaAttribute(meta int) string {
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

func (*TickerFullResponseTickers) SymbolSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponseTickers) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*TickerFullResponseTickers) SymbolDeprecated() uint16 {
	return 0
}

func (TickerFullResponseTickers) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (TickerFullResponseTickers) SymbolHeaderLength() uint64 {
	return 1
}

func (*TickerFullResponse) TickersId() uint16 {
	return 100
}

func (*TickerFullResponse) TickersSinceVersion() uint16 {
	return 0
}

func (t *TickerFullResponse) TickersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TickersSinceVersion()
}

func (*TickerFullResponse) TickersDeprecated() uint16 {
	return 0
}

func (*TickerFullResponseTickers) SbeBlockLength() (blockLength uint) {
	return 126
}

func (*TickerFullResponseTickers) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
