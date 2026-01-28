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

type TickerSymbolFullResponse struct {
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

func (t *TickerSymbolFullResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (t *TickerSymbolFullResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
	if doRangeCheck {
		if err := t.RangeCheck(actingVersion, t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (t *TickerSymbolFullResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func TickerSymbolFullResponseInit(t *TickerSymbolFullResponse) {
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

func (*TickerSymbolFullResponse) SbeBlockLength() (blockLength uint16) {
	return 126
}

func (*TickerSymbolFullResponse) SbeTemplateId() (templateId uint16) {
	return 213
}

func (*TickerSymbolFullResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TickerSymbolFullResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*TickerSymbolFullResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TickerSymbolFullResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TickerSymbolFullResponse) PriceExponentId() uint16 {
	return 1
}

func (*TickerSymbolFullResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*TickerSymbolFullResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerSymbolFullResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerSymbolFullResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerSymbolFullResponse) QtyExponentId() uint16 {
	return 2
}

func (*TickerSymbolFullResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*TickerSymbolFullResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerSymbolFullResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerSymbolFullResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerSymbolFullResponse) PriceChangeId() uint16 {
	return 3
}

func (*TickerSymbolFullResponse) PriceChangeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) PriceChangeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangeSinceVersion()
}

func (*TickerSymbolFullResponse) PriceChangeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) PriceChangeMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) PriceChangeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) PriceChangeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) PriceChangeNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) PriceChangePercentId() uint16 {
	return 4
}

func (*TickerSymbolFullResponse) PriceChangePercentSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) PriceChangePercentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceChangePercentSinceVersion()
}

func (*TickerSymbolFullResponse) PriceChangePercentDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) PriceChangePercentMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) PriceChangePercentMinValue() float32 {
	return -math.MaxFloat32
}

func (*TickerSymbolFullResponse) PriceChangePercentMaxValue() float32 {
	return math.MaxFloat32
}

func (*TickerSymbolFullResponse) PriceChangePercentNullValue() float32 {
	return float32(math.NaN())
}

func (*TickerSymbolFullResponse) WeightedAvgPriceId() uint16 {
	return 5
}

func (*TickerSymbolFullResponse) WeightedAvgPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) WeightedAvgPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.WeightedAvgPriceSinceVersion()
}

func (*TickerSymbolFullResponse) WeightedAvgPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) WeightedAvgPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) WeightedAvgPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) WeightedAvgPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) WeightedAvgPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) OpenPriceId() uint16 {
	return 6
}

func (*TickerSymbolFullResponse) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*TickerSymbolFullResponse) OpenPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) OpenPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) HighPriceId() uint16 {
	return 7
}

func (*TickerSymbolFullResponse) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*TickerSymbolFullResponse) HighPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) HighPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) LowPriceId() uint16 {
	return 8
}

func (*TickerSymbolFullResponse) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*TickerSymbolFullResponse) LowPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) LowPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) LastPriceId() uint16 {
	return 9
}

func (*TickerSymbolFullResponse) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*TickerSymbolFullResponse) LastPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) LastPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) VolumeId() uint16 {
	return 10
}

func (*TickerSymbolFullResponse) VolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*TickerSymbolFullResponse) VolumeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) VolumeMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) VolumeMinValue() uint8 {
	return 0
}

func (*TickerSymbolFullResponse) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerSymbolFullResponse) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerSymbolFullResponse) QuoteVolumeId() uint16 {
	return 11
}

func (*TickerSymbolFullResponse) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*TickerSymbolFullResponse) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) QuoteVolumeMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*TickerSymbolFullResponse) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerSymbolFullResponse) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerSymbolFullResponse) OpenTimeId() uint16 {
	return 12
}

func (*TickerSymbolFullResponse) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*TickerSymbolFullResponse) OpenTimeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) OpenTimeMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) CloseTimeId() uint16 {
	return 13
}

func (*TickerSymbolFullResponse) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*TickerSymbolFullResponse) CloseTimeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) CloseTimeMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) FirstIdId() uint16 {
	return 14
}

func (*TickerSymbolFullResponse) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*TickerSymbolFullResponse) FirstIdDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) FirstIdMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) LastIdId() uint16 {
	return 15
}

func (*TickerSymbolFullResponse) LastIdSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*TickerSymbolFullResponse) LastIdDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) LastIdMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) NumTradesId() uint16 {
	return 16
}

func (*TickerSymbolFullResponse) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*TickerSymbolFullResponse) NumTradesDeprecated() uint16 {
	return 0
}

func (*TickerSymbolFullResponse) NumTradesMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolFullResponse) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolFullResponse) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolFullResponse) SymbolMetaAttribute(meta int) string {
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

func (*TickerSymbolFullResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolFullResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*TickerSymbolFullResponse) SymbolDeprecated() uint16 {
	return 0
}

func (TickerSymbolFullResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (TickerSymbolFullResponse) SymbolHeaderLength() uint64 {
	return 1
}
