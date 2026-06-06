// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type KlinesResponse struct {
	PriceExponent int8
	QtyExponent   int8
	Klines        []KlinesResponseKlines
}
type KlinesResponseKlines struct {
	OpenTime            int64
	OpenPrice           int64
	HighPrice           int64
	LowPrice            int64
	ClosePrice          int64
	Volume              [16]uint8
	CloseTime           int64
	QuoteVolume         [16]uint8
	NumTrades           int64
	TakerBuyBaseVolume  [16]uint8
	TakerBuyQuoteVolume [16]uint8
}

func (k *KlinesResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := k.RangeCheck(k.SbeSchemaVersion(), k.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, k.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, k.QtyExponent); err != nil {
		return err
	}
	var KlinesBlockLength uint16 = 120
	if err := _m.WriteUint16(_w, KlinesBlockLength); err != nil {
		return err
	}
	var KlinesNumInGroup uint32 = uint32(len(k.Klines))
	if err := _m.WriteUint32(_w, KlinesNumInGroup); err != nil {
		return err
	}
	for i := range k.Klines {
		if err := k.Klines[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (k *KlinesResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !k.PriceExponentInActingVersion(actingVersion) {
		k.PriceExponent = k.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &k.PriceExponent); err != nil {
			return err
		}
	}
	if !k.QtyExponentInActingVersion(actingVersion) {
		k.QtyExponent = k.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &k.QtyExponent); err != nil {
			return err
		}
	}
	if actingVersion > k.SbeSchemaVersion() && blockLength > k.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-k.SbeBlockLength()))
	}

	if k.KlinesInActingVersion(actingVersion) {
		var KlinesBlockLength uint16
		if err := _m.ReadUint16(_r, &KlinesBlockLength); err != nil {
			return err
		}
		var KlinesNumInGroup uint32
		if err := _m.ReadUint32(_r, &KlinesNumInGroup); err != nil {
			return err
		}
		if cap(k.Klines) < int(KlinesNumInGroup) {
			k.Klines = make([]KlinesResponseKlines, KlinesNumInGroup)
		}
		k.Klines = k.Klines[:KlinesNumInGroup]
		for i := range k.Klines {
			if err := k.Klines[i].Decode(_m, _r, actingVersion, uint(KlinesBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := k.RangeCheck(actingVersion, k.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (k *KlinesResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if k.PriceExponentInActingVersion(actingVersion) {
		if k.PriceExponent < k.PriceExponentMinValue() || k.PriceExponent > k.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on k.PriceExponent (%v < %v > %v)", k.PriceExponentMinValue(), k.PriceExponent, k.PriceExponentMaxValue())
		}
	}
	if k.QtyExponentInActingVersion(actingVersion) {
		if k.QtyExponent < k.QtyExponentMinValue() || k.QtyExponent > k.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on k.QtyExponent (%v < %v > %v)", k.QtyExponentMinValue(), k.QtyExponent, k.QtyExponentMaxValue())
		}
	}
	for i := range k.Klines {
		if err := k.Klines[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func KlinesResponseInit(k *KlinesResponse) {
	return
}

func (k *KlinesResponseKlines) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, k.OpenTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, k.OpenPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, k.HighPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, k.LowPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, k.ClosePrice); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, k.Volume[:]); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, k.CloseTime); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, k.QuoteVolume[:]); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, k.NumTrades); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, k.TakerBuyBaseVolume[:]); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, k.TakerBuyQuoteVolume[:]); err != nil {
		return err
	}
	return nil
}

func (k *KlinesResponseKlines) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !k.OpenTimeInActingVersion(actingVersion) {
		k.OpenTime = k.OpenTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &k.OpenTime); err != nil {
			return err
		}
	}
	if !k.OpenPriceInActingVersion(actingVersion) {
		k.OpenPrice = k.OpenPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &k.OpenPrice); err != nil {
			return err
		}
	}
	if !k.HighPriceInActingVersion(actingVersion) {
		k.HighPrice = k.HighPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &k.HighPrice); err != nil {
			return err
		}
	}
	if !k.LowPriceInActingVersion(actingVersion) {
		k.LowPrice = k.LowPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &k.LowPrice); err != nil {
			return err
		}
	}
	if !k.ClosePriceInActingVersion(actingVersion) {
		k.ClosePrice = k.ClosePriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &k.ClosePrice); err != nil {
			return err
		}
	}
	if !k.VolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			k.Volume[idx] = k.VolumeNullValue()
		}
	} else {
		if err := _m.ReadBytes(_r, k.Volume[:]); err != nil {
			return err
		}
	}
	if !k.CloseTimeInActingVersion(actingVersion) {
		k.CloseTime = k.CloseTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &k.CloseTime); err != nil {
			return err
		}
	}
	if !k.QuoteVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			k.QuoteVolume[idx] = k.QuoteVolumeNullValue()
		}
	} else {
		if err := _m.ReadBytes(_r, k.QuoteVolume[:]); err != nil {
			return err
		}
	}
	if !k.NumTradesInActingVersion(actingVersion) {
		k.NumTrades = k.NumTradesNullValue()
	} else {
		if err := _m.ReadInt64(_r, &k.NumTrades); err != nil {
			return err
		}
	}
	if !k.TakerBuyBaseVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			k.TakerBuyBaseVolume[idx] = k.TakerBuyBaseVolumeNullValue()
		}
	} else {
		if err := _m.ReadBytes(_r, k.TakerBuyBaseVolume[:]); err != nil {
			return err
		}
	}
	if !k.TakerBuyQuoteVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			k.TakerBuyQuoteVolume[idx] = k.TakerBuyQuoteVolumeNullValue()
		}
	} else {
		if err := _m.ReadBytes(_r, k.TakerBuyQuoteVolume[:]); err != nil {
			return err
		}
	}
	if actingVersion > k.SbeSchemaVersion() && blockLength > k.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-k.SbeBlockLength()))
	}
	return nil
}

func (k *KlinesResponseKlines) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if k.OpenTimeInActingVersion(actingVersion) {
		if k.OpenTime < k.OpenTimeMinValue() || k.OpenTime > k.OpenTimeMaxValue() {
			return fmt.Errorf("Range check failed on k.OpenTime (%v < %v > %v)", k.OpenTimeMinValue(), k.OpenTime, k.OpenTimeMaxValue())
		}
	}
	if k.OpenPriceInActingVersion(actingVersion) {
		if k.OpenPrice < k.OpenPriceMinValue() || k.OpenPrice > k.OpenPriceMaxValue() {
			return fmt.Errorf("Range check failed on k.OpenPrice (%v < %v > %v)", k.OpenPriceMinValue(), k.OpenPrice, k.OpenPriceMaxValue())
		}
	}
	if k.HighPriceInActingVersion(actingVersion) {
		if k.HighPrice < k.HighPriceMinValue() || k.HighPrice > k.HighPriceMaxValue() {
			return fmt.Errorf("Range check failed on k.HighPrice (%v < %v > %v)", k.HighPriceMinValue(), k.HighPrice, k.HighPriceMaxValue())
		}
	}
	if k.LowPriceInActingVersion(actingVersion) {
		if k.LowPrice < k.LowPriceMinValue() || k.LowPrice > k.LowPriceMaxValue() {
			return fmt.Errorf("Range check failed on k.LowPrice (%v < %v > %v)", k.LowPriceMinValue(), k.LowPrice, k.LowPriceMaxValue())
		}
	}
	if k.ClosePriceInActingVersion(actingVersion) {
		if k.ClosePrice < k.ClosePriceMinValue() || k.ClosePrice > k.ClosePriceMaxValue() {
			return fmt.Errorf("Range check failed on k.ClosePrice (%v < %v > %v)", k.ClosePriceMinValue(), k.ClosePrice, k.ClosePriceMaxValue())
		}
	}
	if k.VolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			if k.Volume[idx] < k.VolumeMinValue() || k.Volume[idx] > k.VolumeMaxValue() {
				return fmt.Errorf("Range check failed on k.Volume[%d] (%v < %v > %v)", idx, k.VolumeMinValue(), k.Volume[idx], k.VolumeMaxValue())
			}
		}
	}
	if k.CloseTimeInActingVersion(actingVersion) {
		if k.CloseTime < k.CloseTimeMinValue() || k.CloseTime > k.CloseTimeMaxValue() {
			return fmt.Errorf("Range check failed on k.CloseTime (%v < %v > %v)", k.CloseTimeMinValue(), k.CloseTime, k.CloseTimeMaxValue())
		}
	}
	if k.QuoteVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			if k.QuoteVolume[idx] < k.QuoteVolumeMinValue() || k.QuoteVolume[idx] > k.QuoteVolumeMaxValue() {
				return fmt.Errorf("Range check failed on k.QuoteVolume[%d] (%v < %v > %v)", idx, k.QuoteVolumeMinValue(), k.QuoteVolume[idx], k.QuoteVolumeMaxValue())
			}
		}
	}
	if k.NumTradesInActingVersion(actingVersion) {
		if k.NumTrades < k.NumTradesMinValue() || k.NumTrades > k.NumTradesMaxValue() {
			return fmt.Errorf("Range check failed on k.NumTrades (%v < %v > %v)", k.NumTradesMinValue(), k.NumTrades, k.NumTradesMaxValue())
		}
	}
	if k.TakerBuyBaseVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			if k.TakerBuyBaseVolume[idx] < k.TakerBuyBaseVolumeMinValue() || k.TakerBuyBaseVolume[idx] > k.TakerBuyBaseVolumeMaxValue() {
				return fmt.Errorf("Range check failed on k.TakerBuyBaseVolume[%d] (%v < %v > %v)", idx, k.TakerBuyBaseVolumeMinValue(), k.TakerBuyBaseVolume[idx], k.TakerBuyBaseVolumeMaxValue())
			}
		}
	}
	if k.TakerBuyQuoteVolumeInActingVersion(actingVersion) {
		for idx := 0; idx < 16; idx++ {
			if k.TakerBuyQuoteVolume[idx] < k.TakerBuyQuoteVolumeMinValue() || k.TakerBuyQuoteVolume[idx] > k.TakerBuyQuoteVolumeMaxValue() {
				return fmt.Errorf("Range check failed on k.TakerBuyQuoteVolume[%d] (%v < %v > %v)", idx, k.TakerBuyQuoteVolumeMinValue(), k.TakerBuyQuoteVolume[idx], k.TakerBuyQuoteVolumeMaxValue())
			}
		}
	}
	return nil
}

func KlinesResponseKlinesInit(k *KlinesResponseKlines) {
	return
}

func (*KlinesResponse) SbeBlockLength() (blockLength uint16) {
	return 2
}

func (*KlinesResponse) SbeTemplateId() (templateId uint16) {
	return 203
}

func (*KlinesResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*KlinesResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*KlinesResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*KlinesResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*KlinesResponse) PriceExponentId() uint16 {
	return 1
}

func (*KlinesResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.PriceExponentSinceVersion()
}

func (*KlinesResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*KlinesResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*KlinesResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*KlinesResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*KlinesResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*KlinesResponse) QtyExponentId() uint16 {
	return 2
}

func (*KlinesResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.QtyExponentSinceVersion()
}

func (*KlinesResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*KlinesResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*KlinesResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*KlinesResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*KlinesResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*KlinesResponseKlines) OpenTimeId() uint16 {
	return 1
}

func (*KlinesResponseKlines) OpenTimeSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) OpenTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.OpenTimeSinceVersion()
}

func (*KlinesResponseKlines) OpenTimeDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) OpenTimeMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) OpenTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*KlinesResponseKlines) OpenTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*KlinesResponseKlines) OpenTimeNullValue() int64 {
	return math.MinInt64
}

func (*KlinesResponseKlines) OpenPriceId() uint16 {
	return 2
}

func (*KlinesResponseKlines) OpenPriceSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) OpenPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.OpenPriceSinceVersion()
}

func (*KlinesResponseKlines) OpenPriceDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) OpenPriceMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) OpenPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*KlinesResponseKlines) OpenPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*KlinesResponseKlines) OpenPriceNullValue() int64 {
	return math.MinInt64
}

func (*KlinesResponseKlines) HighPriceId() uint16 {
	return 3
}

func (*KlinesResponseKlines) HighPriceSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) HighPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.HighPriceSinceVersion()
}

func (*KlinesResponseKlines) HighPriceDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) HighPriceMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) HighPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*KlinesResponseKlines) HighPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*KlinesResponseKlines) HighPriceNullValue() int64 {
	return math.MinInt64
}

func (*KlinesResponseKlines) LowPriceId() uint16 {
	return 4
}

func (*KlinesResponseKlines) LowPriceSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) LowPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.LowPriceSinceVersion()
}

func (*KlinesResponseKlines) LowPriceDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) LowPriceMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) LowPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*KlinesResponseKlines) LowPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*KlinesResponseKlines) LowPriceNullValue() int64 {
	return math.MinInt64
}

func (*KlinesResponseKlines) ClosePriceId() uint16 {
	return 5
}

func (*KlinesResponseKlines) ClosePriceSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) ClosePriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.ClosePriceSinceVersion()
}

func (*KlinesResponseKlines) ClosePriceDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) ClosePriceMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) ClosePriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*KlinesResponseKlines) ClosePriceMaxValue() int64 {
	return math.MaxInt64
}

func (*KlinesResponseKlines) ClosePriceNullValue() int64 {
	return math.MinInt64
}

func (*KlinesResponseKlines) VolumeId() uint16 {
	return 6
}

func (*KlinesResponseKlines) VolumeSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) VolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.VolumeSinceVersion()
}

func (*KlinesResponseKlines) VolumeDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) VolumeMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) VolumeMinValue() uint8 {
	return 0
}

func (*KlinesResponseKlines) VolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*KlinesResponseKlines) VolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*KlinesResponseKlines) CloseTimeId() uint16 {
	return 7
}

func (*KlinesResponseKlines) CloseTimeSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.CloseTimeSinceVersion()
}

func (*KlinesResponseKlines) CloseTimeDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) CloseTimeMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*KlinesResponseKlines) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*KlinesResponseKlines) CloseTimeNullValue() int64 {
	return math.MinInt64
}

func (*KlinesResponseKlines) QuoteVolumeId() uint16 {
	return 8
}

func (*KlinesResponseKlines) QuoteVolumeSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) QuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.QuoteVolumeSinceVersion()
}

func (*KlinesResponseKlines) QuoteVolumeDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) QuoteVolumeMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) QuoteVolumeMinValue() uint8 {
	return 0
}

func (*KlinesResponseKlines) QuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*KlinesResponseKlines) QuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*KlinesResponseKlines) NumTradesId() uint16 {
	return 9
}

func (*KlinesResponseKlines) NumTradesSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) NumTradesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.NumTradesSinceVersion()
}

func (*KlinesResponseKlines) NumTradesDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) NumTradesMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) NumTradesMinValue() int64 {
	return math.MinInt64 + 1
}

func (*KlinesResponseKlines) NumTradesMaxValue() int64 {
	return math.MaxInt64
}

func (*KlinesResponseKlines) NumTradesNullValue() int64 {
	return math.MinInt64
}

func (*KlinesResponseKlines) TakerBuyBaseVolumeId() uint16 {
	return 10
}

func (*KlinesResponseKlines) TakerBuyBaseVolumeSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) TakerBuyBaseVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.TakerBuyBaseVolumeSinceVersion()
}

func (*KlinesResponseKlines) TakerBuyBaseVolumeDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) TakerBuyBaseVolumeMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) TakerBuyBaseVolumeMinValue() uint8 {
	return 0
}

func (*KlinesResponseKlines) TakerBuyBaseVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*KlinesResponseKlines) TakerBuyBaseVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*KlinesResponseKlines) TakerBuyQuoteVolumeId() uint16 {
	return 11
}

func (*KlinesResponseKlines) TakerBuyQuoteVolumeSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponseKlines) TakerBuyQuoteVolumeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.TakerBuyQuoteVolumeSinceVersion()
}

func (*KlinesResponseKlines) TakerBuyQuoteVolumeDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) TakerBuyQuoteVolumeMetaAttribute(meta int) string {
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

func (*KlinesResponseKlines) TakerBuyQuoteVolumeMinValue() uint8 {
	return 0
}

func (*KlinesResponseKlines) TakerBuyQuoteVolumeMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*KlinesResponseKlines) TakerBuyQuoteVolumeNullValue() uint8 {
	return math.MaxUint8
}

func (*KlinesResponse) KlinesId() uint16 {
	return 100
}

func (*KlinesResponse) KlinesSinceVersion() uint16 {
	return 0
}

func (k *KlinesResponse) KlinesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= k.KlinesSinceVersion()
}

func (*KlinesResponse) KlinesDeprecated() uint16 {
	return 0
}

func (*KlinesResponseKlines) SbeBlockLength() (blockLength uint) {
	return 120
}

func (*KlinesResponseKlines) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
