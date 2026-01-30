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

type TickerSymbolMiniResponse struct {
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

func (t *TickerSymbolMiniResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (t *TickerSymbolMiniResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (t *TickerSymbolMiniResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func TickerSymbolMiniResponseInit(t *TickerSymbolMiniResponse) {
	t.OpenPrice = math.MinInt64
	t.HighPrice = math.MinInt64
	t.LowPrice = math.MinInt64
	t.LastPrice = math.MinInt64
	t.FirstId = math.MinInt64
	t.LastId = math.MinInt64
	return
}

func (*TickerSymbolMiniResponse) SbeBlockLength() (blockLength uint16) {
	return 106
}

func (*TickerSymbolMiniResponse) SbeTemplateId() (templateId uint16) {
	return 215
}

func (*TickerSymbolMiniResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TickerSymbolMiniResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*TickerSymbolMiniResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TickerSymbolMiniResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TickerSymbolMiniResponse) PriceExponentId() uint16 {
	return 1
}

func (*TickerSymbolMiniResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*TickerSymbolMiniResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerSymbolMiniResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerSymbolMiniResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerSymbolMiniResponse) QtyExponentId() uint16 {
	return 2
}

func (*TickerSymbolMiniResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*TickerSymbolMiniResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerSymbolMiniResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerSymbolMiniResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerSymbolMiniResponse) OpenPriceId() uint16 {
	return 3
}

func (*TickerSymbolMiniResponse) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*TickerSymbolMiniResponse) OpenPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) OpenPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) HighPriceId() uint16 {
	return 4
}

func (*TickerSymbolMiniResponse) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*TickerSymbolMiniResponse) HighPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) HighPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) LowPriceId() uint16 {
	return 5
}

func (*TickerSymbolMiniResponse) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*TickerSymbolMiniResponse) LowPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) LowPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) LastPriceId() uint16 {
	return 6
}

func (*TickerSymbolMiniResponse) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*TickerSymbolMiniResponse) LastPriceDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) LastPriceMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) VolumeId() uint16 {
	return 7
}

func (*TickerSymbolMiniResponse) VolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*TickerSymbolMiniResponse) VolumeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) VolumeMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) VolumeMinValue() uint8 {
	return 0
}

func (*TickerSymbolMiniResponse) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerSymbolMiniResponse) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerSymbolMiniResponse) QuoteVolumeId() uint16 {
	return 8
}

func (*TickerSymbolMiniResponse) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*TickerSymbolMiniResponse) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) QuoteVolumeMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*TickerSymbolMiniResponse) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerSymbolMiniResponse) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerSymbolMiniResponse) OpenTimeId() uint16 {
	return 9
}

func (*TickerSymbolMiniResponse) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*TickerSymbolMiniResponse) OpenTimeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) OpenTimeMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) CloseTimeId() uint16 {
	return 10
}

func (*TickerSymbolMiniResponse) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*TickerSymbolMiniResponse) CloseTimeDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) CloseTimeMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) FirstIdId() uint16 {
	return 11
}

func (*TickerSymbolMiniResponse) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*TickerSymbolMiniResponse) FirstIdDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) FirstIdMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) LastIdId() uint16 {
	return 12
}

func (*TickerSymbolMiniResponse) LastIdSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*TickerSymbolMiniResponse) LastIdDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) LastIdMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) NumTradesId() uint16 {
	return 13
}

func (*TickerSymbolMiniResponse) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*TickerSymbolMiniResponse) NumTradesDeprecated() uint16 {
	return 0
}

func (*TickerSymbolMiniResponse) NumTradesMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerSymbolMiniResponse) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerSymbolMiniResponse) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*TickerSymbolMiniResponse) SymbolMetaAttribute(meta int) string {
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

func (*TickerSymbolMiniResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (t *TickerSymbolMiniResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*TickerSymbolMiniResponse) SymbolDeprecated() uint16 {
	return 0
}

func (TickerSymbolMiniResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (TickerSymbolMiniResponse) SymbolHeaderLength() uint64 {
	return 1
}
