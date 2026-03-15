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

type Ticker24hMiniResponse struct {
	Tickers []Ticker24hMiniResponseTickers
}
type Ticker24hMiniResponseTickers struct {
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

func (t *Ticker24hMiniResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (t *Ticker24hMiniResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
			t.Tickers = make([]Ticker24hMiniResponseTickers, TickersNumInGroup)
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

func (t *Ticker24hMiniResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range t.Tickers {
		if err := t.Tickers[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func Ticker24hMiniResponseInit(t *Ticker24hMiniResponse) {
	return
}

func (t *Ticker24hMiniResponseTickers) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (t *Ticker24hMiniResponseTickers) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (t *Ticker24hMiniResponseTickers) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func Ticker24hMiniResponseTickersInit(t *Ticker24hMiniResponseTickers) {
	t.OpenPrice = math.MinInt64
	t.HighPrice = math.MinInt64
	t.LowPrice = math.MinInt64
	t.LastPrice = math.MinInt64
	t.FirstId = math.MinInt64
	t.LastId = math.MinInt64
	return
}

func (*Ticker24hMiniResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*Ticker24hMiniResponse) SbeTemplateId() (templateId uint16) {
	return 208
}

func (*Ticker24hMiniResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*Ticker24hMiniResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*Ticker24hMiniResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*Ticker24hMiniResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*Ticker24hMiniResponseTickers) PriceExponentId() uint16 {
	return 1
}

func (*Ticker24hMiniResponseTickers) PriceExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PriceExponentSinceVersion()
}

func (*Ticker24hMiniResponseTickers) PriceExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) PriceExponentMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hMiniResponseTickers) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hMiniResponseTickers) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hMiniResponseTickers) QtyExponentId() uint16 {
	return 2
}

func (*Ticker24hMiniResponseTickers) QtyExponentSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QtyExponentSinceVersion()
}

func (*Ticker24hMiniResponseTickers) QtyExponentDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) QtyExponentMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*Ticker24hMiniResponseTickers) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*Ticker24hMiniResponseTickers) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*Ticker24hMiniResponseTickers) OpenPriceId() uint16 {
	return 3
}

func (*Ticker24hMiniResponseTickers) OpenPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenPriceSinceVersion()
}

func (*Ticker24hMiniResponseTickers) OpenPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) OpenPriceMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) HighPriceId() uint16 {
	return 4
}

func (*Ticker24hMiniResponseTickers) HighPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.HighPriceSinceVersion()
}

func (*Ticker24hMiniResponseTickers) HighPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) HighPriceMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) LowPriceId() uint16 {
	return 5
}

func (*Ticker24hMiniResponseTickers) LowPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LowPriceSinceVersion()
}

func (*Ticker24hMiniResponseTickers) LowPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) LowPriceMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) LastPriceId() uint16 {
	return 6
}

func (*Ticker24hMiniResponseTickers) LastPriceSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastPriceSinceVersion()
}

func (*Ticker24hMiniResponseTickers) LastPriceDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) LastPriceMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) VolumeId() uint16 {
	return 7
}

func (*Ticker24hMiniResponseTickers) VolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.VolumeSinceVersion()
}

func (*Ticker24hMiniResponseTickers) VolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) VolumeMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) VolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hMiniResponseTickers) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hMiniResponseTickers) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hMiniResponseTickers) QuoteVolumeId() uint16 {
	return 8
}

func (*Ticker24hMiniResponseTickers) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.QuoteVolumeSinceVersion()
}

func (*Ticker24hMiniResponseTickers) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) QuoteVolumeMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*Ticker24hMiniResponseTickers) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*Ticker24hMiniResponseTickers) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*Ticker24hMiniResponseTickers) OpenTimeId() uint16 {
	return 9
}

func (*Ticker24hMiniResponseTickers) OpenTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OpenTimeSinceVersion()
}

func (*Ticker24hMiniResponseTickers) OpenTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) OpenTimeMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) CloseTimeId() uint16 {
	return 10
}

func (*Ticker24hMiniResponseTickers) CloseTimeSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CloseTimeSinceVersion()
}

func (*Ticker24hMiniResponseTickers) CloseTimeDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) CloseTimeMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) FirstIdId() uint16 {
	return 11
}

func (*Ticker24hMiniResponseTickers) FirstIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) FirstIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FirstIdSinceVersion()
}

func (*Ticker24hMiniResponseTickers) FirstIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) FirstIdMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) FirstIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) FirstIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) FirstIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) LastIdId() uint16 {
	return 12
}

func (*Ticker24hMiniResponseTickers) LastIdSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) LastIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.LastIdSinceVersion()
}

func (*Ticker24hMiniResponseTickers) LastIdDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) LastIdMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) LastIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) LastIdMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) LastIdNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) NumTradesId() uint16 {
	return 13
}

func (*Ticker24hMiniResponseTickers) NumTradesSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NumTradesSinceVersion()
}

func (*Ticker24hMiniResponseTickers) NumTradesDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) NumTradesMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*Ticker24hMiniResponseTickers) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*Ticker24hMiniResponseTickers) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*Ticker24hMiniResponseTickers) SymbolMetaAttribute(meta int) string {
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

func (*Ticker24hMiniResponseTickers) SymbolSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponseTickers) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SymbolSinceVersion()
}

func (*Ticker24hMiniResponseTickers) SymbolDeprecated() uint16 {
	return 0
}

func (Ticker24hMiniResponseTickers) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (Ticker24hMiniResponseTickers) SymbolHeaderLength() uint64 {
	return 1
}

func (*Ticker24hMiniResponse) TickersId() uint16 {
	return 100
}

func (*Ticker24hMiniResponse) TickersSinceVersion() uint16 {
	return 0
}

func (t *Ticker24hMiniResponse) TickersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TickersSinceVersion()
}

func (*Ticker24hMiniResponse) TickersDeprecated() uint16 {
	return 0
}

func (*Ticker24hMiniResponseTickers) SbeBlockLength() (blockLength uint) {
	return 106
}

func (*Ticker24hMiniResponseTickers) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
