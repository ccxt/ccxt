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

type Ticker24hSymbolMiniResponse struct {
	PriceExponent int8
	QtyExponent   int8
	OpenPrice     int64
	HighPrice     int64
	LowPrice      int64
	LastPrice     int64
	Volume        [16]uint8
	QuoteVolume   [16]uint8
	OpenTime      int64
	CloseTime     int64
	FirstId       int64
	LastId        int64
	NumTrades     int64
	Symbol        []uint8
}

func (t *Ticker24hSymbolMiniResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (t *Ticker24hSymbolMiniResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (t *Ticker24hSymbolMiniResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func Ticker24hSymbolMiniResponseInit(t *Ticker24hSymbolMiniResponse) {
	t.OpenPrice = math.MinInt64
	t.HighPrice = math.MinInt64
	t.LowPrice = math.MinInt64
	t.LastPrice = math.MinInt64
	t.FirstId = math.MinInt64
	t.LastId = math.MinInt64
	return
}

func (*Ticker24hSymbolMiniResponse) SbeBlockLength() (blockLength uint16) {
	return 106
}

func (*Ticker24hSymbolMiniResponse) SbeTemplateId() (templateId uint16) {
	return 207
}

func (*Ticker24hSymbolMiniResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*Ticker24hSymbolMiniResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*Ticker24hSymbolMiniResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*Ticker24hSymbolMiniResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*Ticker24hSymbolMiniResponse) PriceExponentId() uint16 {
	return 1
}

func (*Ticker24hSymbolMiniResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hSymbolMiniResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hSymbolMiniResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hSymbolMiniResponse) QtyExponentId() uint16 {
	return 2
}

func (*Ticker24hSymbolMiniResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hSymbolMiniResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hSymbolMiniResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hSymbolMiniResponse) OpenPriceId() uint16 {
	return 3
}

func (*Ticker24hSymbolMiniResponse) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) OpenPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) OpenPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) HighPriceId() uint16 {
	return 4
}

func (*Ticker24hSymbolMiniResponse) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) HighPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) HighPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) LowPriceId() uint16 {
	return 5
}

func (*Ticker24hSymbolMiniResponse) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) LowPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) LowPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) LastPriceId() uint16 {
	return 6
}

func (*Ticker24hSymbolMiniResponse) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) LastPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) LastPriceMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) VolumeId() uint16 {
	return 7
}

func (*Ticker24hSymbolMiniResponse) VolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) VolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) VolumeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) VolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hSymbolMiniResponse) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hSymbolMiniResponse) QuoteVolumeId() uint16 {
	return 8
}

func (*Ticker24hSymbolMiniResponse) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) QuoteVolumeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hSymbolMiniResponse) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hSymbolMiniResponse) OpenTimeId() uint16 {
	return 9
}

func (*Ticker24hSymbolMiniResponse) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) OpenTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) OpenTimeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) CloseTimeId() uint16 {
	return 10
}

func (*Ticker24hSymbolMiniResponse) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) CloseTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) CloseTimeMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) FirstIdId() uint16 {
	return 11
}

func (*Ticker24hSymbolMiniResponse) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) FirstIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) FirstIdMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) LastIdId() uint16 {
	return 12
}

func (*Ticker24hSymbolMiniResponse) LastIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) LastIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) LastIdMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) NumTradesId() uint16 {
	return 13
}

func (*Ticker24hSymbolMiniResponse) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) NumTradesDeprecated() uint16 {
	return 0
}

func (*Ticker24hSymbolMiniResponse) NumTradesMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hSymbolMiniResponse) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hSymbolMiniResponse) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hSymbolMiniResponse) SymbolMetaAttribute(meta int) string {
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

func (*Ticker24hSymbolMiniResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hSymbolMiniResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*Ticker24hSymbolMiniResponse) SymbolDeprecated() uint16 {
	return 0
}

func (Ticker24hSymbolMiniResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (Ticker24hSymbolMiniResponse) SymbolHeaderLength() uint64 {
	return 1
}
