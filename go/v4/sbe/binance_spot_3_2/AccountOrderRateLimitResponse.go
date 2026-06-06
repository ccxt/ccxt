// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type AccountOrderRateLimitResponse struct {
	RateLimits []AccountOrderRateLimitResponseRateLimits
}
type AccountOrderRateLimitResponseRateLimits struct {
	RateLimitType RateLimitTypeEnum
	Interval      RateLimitIntervalEnum
	IntervalNum   uint8
	RateLimit     int64
	NumOrders     int64
}

func (a *AccountOrderRateLimitResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var RateLimitsBlockLength uint16 = 19
	if err := _m.WriteUint16(_w, RateLimitsBlockLength); err != nil {
		return err
	}
	var RateLimitsNumInGroup uint32 = uint32(len(a.RateLimits))
	if err := _m.WriteUint32(_w, RateLimitsNumInGroup); err != nil {
		return err
	}
	for i := range a.RateLimits {
		if err := a.RateLimits[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountOrderRateLimitResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.RateLimitsInActingVersion(actingVersion) {
		var RateLimitsBlockLength uint16
		if err := _m.ReadUint16(_r, &RateLimitsBlockLength); err != nil {
			return err
		}
		var RateLimitsNumInGroup uint32
		if err := _m.ReadUint32(_r, &RateLimitsNumInGroup); err != nil {
			return err
		}
		if cap(a.RateLimits) < int(RateLimitsNumInGroup) {
			a.RateLimits = make([]AccountOrderRateLimitResponseRateLimits, RateLimitsNumInGroup)
		}
		a.RateLimits = a.RateLimits[:RateLimitsNumInGroup]
		for i := range a.RateLimits {
			if err := a.RateLimits[i].Decode(_m, _r, actingVersion, uint(RateLimitsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := a.RangeCheck(actingVersion, a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountOrderRateLimitResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range a.RateLimits {
		if err := a.RateLimits[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func AccountOrderRateLimitResponseInit(a *AccountOrderRateLimitResponse) {
	return
}

func (a *AccountOrderRateLimitResponseRateLimits) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := a.RateLimitType.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.Interval.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, a.IntervalNum); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.RateLimit); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.NumOrders); err != nil {
		return err
	}
	return nil
}

func (a *AccountOrderRateLimitResponseRateLimits) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if a.RateLimitTypeInActingVersion(actingVersion) {
		if err := a.RateLimitType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.IntervalInActingVersion(actingVersion) {
		if err := a.Interval.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !a.IntervalNumInActingVersion(actingVersion) {
		a.IntervalNum = a.IntervalNumNullValue()
	} else {
		if err := _m.ReadUint8(_r, &a.IntervalNum); err != nil {
			return err
		}
	}
	if !a.RateLimitInActingVersion(actingVersion) {
		a.RateLimit = a.RateLimitNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.RateLimit); err != nil {
			return err
		}
	}
	if !a.NumOrdersInActingVersion(actingVersion) {
		a.NumOrders = a.NumOrdersNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.NumOrders); err != nil {
			return err
		}
	}
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}
	return nil
}

func (a *AccountOrderRateLimitResponseRateLimits) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := a.RateLimitType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.Interval.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if a.IntervalNumInActingVersion(actingVersion) {
		if a.IntervalNum < a.IntervalNumMinValue() || a.IntervalNum > a.IntervalNumMaxValue() {
			return fmt.Errorf("Range check failed on a.IntervalNum (%v < %v > %v)", a.IntervalNumMinValue(), a.IntervalNum, a.IntervalNumMaxValue())
		}
	}
	if a.RateLimitInActingVersion(actingVersion) {
		if a.RateLimit < a.RateLimitMinValue() || a.RateLimit > a.RateLimitMaxValue() {
			return fmt.Errorf("Range check failed on a.RateLimit (%v < %v > %v)", a.RateLimitMinValue(), a.RateLimit, a.RateLimitMaxValue())
		}
	}
	if a.NumOrdersInActingVersion(actingVersion) {
		if a.NumOrders < a.NumOrdersMinValue() || a.NumOrders > a.NumOrdersMaxValue() {
			return fmt.Errorf("Range check failed on a.NumOrders (%v < %v > %v)", a.NumOrdersMinValue(), a.NumOrders, a.NumOrdersMaxValue())
		}
	}
	return nil
}

func AccountOrderRateLimitResponseRateLimitsInit(a *AccountOrderRateLimitResponseRateLimits) {
	return
}

func (*AccountOrderRateLimitResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*AccountOrderRateLimitResponse) SbeTemplateId() (templateId uint16) {
	return 402
}

func (*AccountOrderRateLimitResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AccountOrderRateLimitResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*AccountOrderRateLimitResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AccountOrderRateLimitResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitTypeId() uint16 {
	return 1
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitTypeSinceVersion() uint16 {
	return 0
}

func (a *AccountOrderRateLimitResponseRateLimits) RateLimitTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.RateLimitTypeSinceVersion()
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitTypeDeprecated() uint16 {
	return 0
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitTypeMetaAttribute(meta int) string {
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

func (*AccountOrderRateLimitResponseRateLimits) IntervalId() uint16 {
	return 2
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalSinceVersion() uint16 {
	return 0
}

func (a *AccountOrderRateLimitResponseRateLimits) IntervalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IntervalSinceVersion()
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalDeprecated() uint16 {
	return 0
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalMetaAttribute(meta int) string {
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

func (*AccountOrderRateLimitResponseRateLimits) IntervalNumId() uint16 {
	return 3
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalNumSinceVersion() uint16 {
	return 0
}

func (a *AccountOrderRateLimitResponseRateLimits) IntervalNumInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.IntervalNumSinceVersion()
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalNumDeprecated() uint16 {
	return 0
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalNumMetaAttribute(meta int) string {
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

func (*AccountOrderRateLimitResponseRateLimits) IntervalNumMinValue() uint8 {
	return 0
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalNumMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*AccountOrderRateLimitResponseRateLimits) IntervalNumNullValue() uint8 {
	return math.MaxUint8
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitId() uint16 {
	return 4
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitSinceVersion() uint16 {
	return 0
}

func (a *AccountOrderRateLimitResponseRateLimits) RateLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.RateLimitSinceVersion()
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitDeprecated() uint16 {
	return 0
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitMetaAttribute(meta int) string {
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

func (*AccountOrderRateLimitResponseRateLimits) RateLimitMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountOrderRateLimitResponseRateLimits) RateLimitNullValue() int64 {
	return math.MinInt64
}

func (*AccountOrderRateLimitResponseRateLimits) NumOrdersId() uint16 {
	return 5
}

func (*AccountOrderRateLimitResponseRateLimits) NumOrdersSinceVersion() uint16 {
	return 0
}

func (a *AccountOrderRateLimitResponseRateLimits) NumOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.NumOrdersSinceVersion()
}

func (*AccountOrderRateLimitResponseRateLimits) NumOrdersDeprecated() uint16 {
	return 0
}

func (*AccountOrderRateLimitResponseRateLimits) NumOrdersMetaAttribute(meta int) string {
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

func (*AccountOrderRateLimitResponseRateLimits) NumOrdersMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountOrderRateLimitResponseRateLimits) NumOrdersMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountOrderRateLimitResponseRateLimits) NumOrdersNullValue() int64 {
	return math.MinInt64
}

func (*AccountOrderRateLimitResponse) RateLimitsId() uint16 {
	return 100
}

func (*AccountOrderRateLimitResponse) RateLimitsSinceVersion() uint16 {
	return 0
}

func (a *AccountOrderRateLimitResponse) RateLimitsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.RateLimitsSinceVersion()
}

func (*AccountOrderRateLimitResponse) RateLimitsDeprecated() uint16 {
	return 0
}

func (*AccountOrderRateLimitResponseRateLimits) SbeBlockLength() (blockLength uint) {
	return 19
}

func (*AccountOrderRateLimitResponseRateLimits) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
