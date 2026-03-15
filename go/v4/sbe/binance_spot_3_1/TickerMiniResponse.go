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

type TickerMiniResponse struct {
	Tickers []TickerMiniResponseTickers
}
type TickerMiniResponseTickers struct {
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

func (t *TickerMiniResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var TickersBlockLength uint16 = 106
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

func (t *TickerMiniResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
			t.Tickers = make([]TickerMiniResponseTickers, TickersNumInGroup)
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

func (t *TickerMiniResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range t.Tickers {
		if err := t.Tickers[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func TickerMiniResponseInit(t *TickerMiniResponse) {
	return
}

func (t *TickerMiniResponseTickers) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (t *TickerMiniResponseTickers) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	return nil
}

func (t *TickerMiniResponseTickers) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func TickerMiniResponseTickersInit(t *TickerMiniResponseTickers) {
	t.OpenPrice = math.MinInt64
	t.HighPrice = math.MinInt64
	t.LowPrice = math.MinInt64
	t.LastPrice = math.MinInt64
	t.FirstId = math.MinInt64
	t.LastId = math.MinInt64
	return
}

func (*TickerMiniResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*TickerMiniResponse) SbeTemplateId() (templateId uint16) {
	return 216
}

func (*TickerMiniResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TickerMiniResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*TickerMiniResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TickerMiniResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TickerMiniResponseTickers) PriceExponentId() uint16 {
	return 1
}

func (*TickerMiniResponseTickers) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*TickerMiniResponseTickers) PriceExponentDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) PriceExponentMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerMiniResponseTickers) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerMiniResponseTickers) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerMiniResponseTickers) QtyExponentId() uint16 {
	return 2
}

func (*TickerMiniResponseTickers) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*TickerMiniResponseTickers) QtyExponentDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) QtyExponentMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TickerMiniResponseTickers) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TickerMiniResponseTickers) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*TickerMiniResponseTickers) OpenPriceId() uint16 {
	return 3
}

func (*TickerMiniResponseTickers) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*TickerMiniResponseTickers) OpenPriceDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) OpenPriceMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) HighPriceId() uint16 {
	return 4
}

func (*TickerMiniResponseTickers) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*TickerMiniResponseTickers) HighPriceDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) HighPriceMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) LowPriceId() uint16 {
	return 5
}

func (*TickerMiniResponseTickers) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*TickerMiniResponseTickers) LowPriceDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) LowPriceMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) LastPriceId() uint16 {
	return 6
}

func (*TickerMiniResponseTickers) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*TickerMiniResponseTickers) LastPriceDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) LastPriceMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) VolumeId() uint16 {
	return 7
}

func (*TickerMiniResponseTickers) VolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*TickerMiniResponseTickers) VolumeDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) VolumeMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) VolumeMinValue() uint8 {
	return 0
}

func (*TickerMiniResponseTickers) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerMiniResponseTickers) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerMiniResponseTickers) QuoteVolumeId() uint16 {
	return 8
}

func (*TickerMiniResponseTickers) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*TickerMiniResponseTickers) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) QuoteVolumeMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*TickerMiniResponseTickers) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*TickerMiniResponseTickers) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*TickerMiniResponseTickers) OpenTimeId() uint16 {
	return 9
}

func (*TickerMiniResponseTickers) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*TickerMiniResponseTickers) OpenTimeDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) OpenTimeMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) CloseTimeId() uint16 {
	return 10
}

func (*TickerMiniResponseTickers) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*TickerMiniResponseTickers) CloseTimeDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) CloseTimeMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) FirstIdId() uint16 {
	return 11
}

func (*TickerMiniResponseTickers) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*TickerMiniResponseTickers) FirstIdDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) FirstIdMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) LastIdId() uint16 {
	return 12
}

func (*TickerMiniResponseTickers) LastIdSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*TickerMiniResponseTickers) LastIdDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) LastIdMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) NumTradesId() uint16 {
	return 13
}

func (*TickerMiniResponseTickers) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*TickerMiniResponseTickers) NumTradesDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) NumTradesMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TickerMiniResponseTickers) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*TickerMiniResponseTickers) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*TickerMiniResponseTickers) SymbolMetaAttribute(meta int) string {
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

func (*TickerMiniResponseTickers) SymbolSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponseTickers) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*TickerMiniResponseTickers) SymbolDeprecated() uint16 {
	return 0
}

func (TickerMiniResponseTickers) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (TickerMiniResponseTickers) SymbolHeaderLength() uint64 {
	return 1
}

func (*TickerMiniResponse) TickersId() uint16 {
	return 100
}

func (*TickerMiniResponse) TickersSinceVersion() uint16 {
	return 0
}

func (t *TickerMiniResponse) TickersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TickersSinceVersion()
}

func (*TickerMiniResponse) TickersDeprecated() uint16 {
	return 0
}

func (*TickerMiniResponseTickers) SbeBlockLength() (blockLength uint) {
	return 106
}

func (*TickerMiniResponseTickers) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}
