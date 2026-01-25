// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type AveragePriceResponse struct {
	Mins          int64
	PriceExponent int8
	Price         int64
	CloseTime     int64
}

func (a *AveragePriceResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, a.Mins); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.CloseTime); err != nil {
		return err
	}
	return nil
}

func (a *AveragePriceResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !a.MinsInActingVersion(actingVersion) {
		a.Mins = a.MinsNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Mins); err != nil {
			return err
		}
	}
	if !a.PriceExponentInActingVersion(actingVersion) {
		a.PriceExponent = a.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.PriceExponent); err != nil {
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
	if !a.CloseTimeInActingVersion(actingVersion) {
		a.CloseTime = a.CloseTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.CloseTime); err != nil {
			return err
		}
	}
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := a.RangeCheck(actingVersion, a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (a *AveragePriceResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if a.MinsInActingVersion(actingVersion) {
		if a.Mins < a.MinsMinValue() || a.Mins > a.MinsMaxValue() {
			return fmt.Errorf("Range check failed on a.Mins (%v < %v > %v)", a.MinsMinValue(), a.Mins, a.MinsMaxValue())
		}
	}
	if a.PriceExponentInActingVersion(actingVersion) {
		if a.PriceExponent < a.PriceExponentMinValue() || a.PriceExponent > a.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.PriceExponent (%v < %v > %v)", a.PriceExponentMinValue(), a.PriceExponent, a.PriceExponentMaxValue())
		}
	}
	if a.PriceInActingVersion(actingVersion) {
		if a.Price != a.PriceNullValue() && (a.Price < a.PriceMinValue() || a.Price > a.PriceMaxValue()) {
			return fmt.Errorf("Range check failed on a.Price (%v < %v > %v)", a.PriceMinValue(), a.Price, a.PriceMaxValue())
		}
	}
	if a.CloseTimeInActingVersion(actingVersion) {
		if a.CloseTime != a.CloseTimeNullValue() && (a.CloseTime < a.CloseTimeMinValue() || a.CloseTime > a.CloseTimeMaxValue()) {
			return fmt.Errorf("Range check failed on a.CloseTime (%v < %v > %v)", a.CloseTimeMinValue(), a.CloseTime, a.CloseTimeMaxValue())
		}
	}
	return nil
}

func AveragePriceResponseInit(a *AveragePriceResponse) {
	a.Price = math.MinInt64
	a.CloseTime = math.MinInt64
	return
}

func (*AveragePriceResponse) SbeBlockLength() (blockLength uint16) {
	return 25
}

func (*AveragePriceResponse) SbeTemplateId() (templateId uint16) {
	return 204
}

func (*AveragePriceResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AveragePriceResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*AveragePriceResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AveragePriceResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AveragePriceResponse) MinsId() uint16 {
	return 1
}

func (*AveragePriceResponse) MinsSinceVersion() uint16 {
	return 0
}

func (a *AveragePriceResponse) MinsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.MinsSinceVersion()
}

func (*AveragePriceResponse) MinsDeprecated() uint16 {
	return 0
}

func (*AveragePriceResponse) MinsMetaAttribute(meta int) string {
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

func (*AveragePriceResponse) MinsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AveragePriceResponse) MinsMaxValue() int64 {
	return math.MaxInt64
}

func (*AveragePriceResponse) MinsNullValue() int64 {
	return math.MinInt64
}

func (*AveragePriceResponse) PriceExponentId() uint16 {
	return 2
}

func (*AveragePriceResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (a *AveragePriceResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceExponentSinceVersion()
}

func (*AveragePriceResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*AveragePriceResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*AveragePriceResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AveragePriceResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AveragePriceResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*AveragePriceResponse) PriceId() uint16 {
	return 3
}

func (*AveragePriceResponse) PriceSinceVersion() uint16 {
	return 0
}

func (a *AveragePriceResponse) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PriceSinceVersion()
}

func (*AveragePriceResponse) PriceDeprecated() uint16 {
	return 0
}

func (*AveragePriceResponse) PriceMetaAttribute(meta int) string {
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

func (*AveragePriceResponse) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AveragePriceResponse) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*AveragePriceResponse) PriceNullValue() int64 {
	return math.MinInt64
}

func (*AveragePriceResponse) CloseTimeId() uint16 {
	return 4
}

func (*AveragePriceResponse) CloseTimeSinceVersion() uint16 {
	return 0
}

func (a *AveragePriceResponse) CloseTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CloseTimeSinceVersion()
}

func (*AveragePriceResponse) CloseTimeDeprecated() uint16 {
	return 0
}

func (*AveragePriceResponse) CloseTimeMetaAttribute(meta int) string {
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

func (*AveragePriceResponse) CloseTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AveragePriceResponse) CloseTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*AveragePriceResponse) CloseTimeNullValue() int64 {
	return math.MinInt64
}
