// Generated SBE (Simple Binary Encoding) message codec

package okx_1_0

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type TradesChannelEvent struct {
	InstIdCode int64
	TsUs       int64
	OutTime    int64
	SeqId      int64
	PxMantissa int64
	SzMantissa int64
	TradeId    int64
	Count      int16
	Side       SideEnumEnum
	PxExponent int8
	SzExponent int8
	Source     SourceEnumEnum
}

func (t *TradesChannelEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, t.InstIdCode); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.TsUs); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.OutTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.SeqId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.PxMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.SzMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.TradeId); err != nil {
		return err
	}
	if err := _m.WriteInt16(_w, t.Count); err != nil {
		return err
	}
	if err := t.Side.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, t.PxExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, t.SzExponent); err != nil {
		return err
	}
	if err := t.Source.Encode(_m, _w); err != nil {
		return err
	}
	return nil
}

func (t *TradesChannelEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !t.InstIdCodeInActingVersion(actingVersion) {
		t.InstIdCode = t.InstIdCodeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.InstIdCode); err != nil {
			return err
		}
	}
	if !t.TsUsInActingVersion(actingVersion) {
		t.TsUs = t.TsUsNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.TsUs); err != nil {
			return err
		}
	}
	if !t.OutTimeInActingVersion(actingVersion) {
		t.OutTime = t.OutTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.OutTime); err != nil {
			return err
		}
	}
	if !t.SeqIdInActingVersion(actingVersion) {
		t.SeqId = t.SeqIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.SeqId); err != nil {
			return err
		}
	}
	if !t.PxMantissaInActingVersion(actingVersion) {
		t.PxMantissa = t.PxMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.PxMantissa); err != nil {
			return err
		}
	}
	if !t.SzMantissaInActingVersion(actingVersion) {
		t.SzMantissa = t.SzMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.SzMantissa); err != nil {
			return err
		}
	}
	if !t.TradeIdInActingVersion(actingVersion) {
		t.TradeId = t.TradeIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.TradeId); err != nil {
			return err
		}
	}
	if !t.CountInActingVersion(actingVersion) {
		t.Count = t.CountNullValue()
	} else {
		if err := _m.ReadInt16(_r, &t.Count); err != nil {
			return err
		}
	}
	if t.SideInActingVersion(actingVersion) {
		if err := t.Side.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !t.PxExponentInActingVersion(actingVersion) {
		t.PxExponent = t.PxExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &t.PxExponent); err != nil {
			return err
		}
	}
	if !t.SzExponentInActingVersion(actingVersion) {
		t.SzExponent = t.SzExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &t.SzExponent); err != nil {
			return err
		}
	}
	if t.SourceInActingVersion(actingVersion) {
		if err := t.Source.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := t.RangeCheck(actingVersion, t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (t *TradesChannelEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if t.InstIdCodeInActingVersion(actingVersion) {
		if t.InstIdCode < t.InstIdCodeMinValue() || t.InstIdCode > t.InstIdCodeMaxValue() {
			return fmt.Errorf("Range check failed on t.InstIdCode (%v < %v > %v)", t.InstIdCodeMinValue(), t.InstIdCode, t.InstIdCodeMaxValue())
		}
	}
	if t.TsUsInActingVersion(actingVersion) {
		if t.TsUs < t.TsUsMinValue() || t.TsUs > t.TsUsMaxValue() {
			return fmt.Errorf("Range check failed on t.TsUs (%v < %v > %v)", t.TsUsMinValue(), t.TsUs, t.TsUsMaxValue())
		}
	}
	if t.OutTimeInActingVersion(actingVersion) {
		if t.OutTime < t.OutTimeMinValue() || t.OutTime > t.OutTimeMaxValue() {
			return fmt.Errorf("Range check failed on t.OutTime (%v < %v > %v)", t.OutTimeMinValue(), t.OutTime, t.OutTimeMaxValue())
		}
	}
	if t.SeqIdInActingVersion(actingVersion) {
		if t.SeqId < t.SeqIdMinValue() || t.SeqId > t.SeqIdMaxValue() {
			return fmt.Errorf("Range check failed on t.SeqId (%v < %v > %v)", t.SeqIdMinValue(), t.SeqId, t.SeqIdMaxValue())
		}
	}
	if t.PxMantissaInActingVersion(actingVersion) {
		if t.PxMantissa < t.PxMantissaMinValue() || t.PxMantissa > t.PxMantissaMaxValue() {
			return fmt.Errorf("Range check failed on t.PxMantissa (%v < %v > %v)", t.PxMantissaMinValue(), t.PxMantissa, t.PxMantissaMaxValue())
		}
	}
	if t.SzMantissaInActingVersion(actingVersion) {
		if t.SzMantissa < t.SzMantissaMinValue() || t.SzMantissa > t.SzMantissaMaxValue() {
			return fmt.Errorf("Range check failed on t.SzMantissa (%v < %v > %v)", t.SzMantissaMinValue(), t.SzMantissa, t.SzMantissaMaxValue())
		}
	}
	if t.TradeIdInActingVersion(actingVersion) {
		if t.TradeId < t.TradeIdMinValue() || t.TradeId > t.TradeIdMaxValue() {
			return fmt.Errorf("Range check failed on t.TradeId (%v < %v > %v)", t.TradeIdMinValue(), t.TradeId, t.TradeIdMaxValue())
		}
	}
	if t.CountInActingVersion(actingVersion) {
		if t.Count < t.CountMinValue() || t.Count > t.CountMaxValue() {
			return fmt.Errorf("Range check failed on t.Count (%v < %v > %v)", t.CountMinValue(), t.Count, t.CountMaxValue())
		}
	}
	if err := t.Side.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if t.PxExponentInActingVersion(actingVersion) {
		if t.PxExponent < t.PxExponentMinValue() || t.PxExponent > t.PxExponentMaxValue() {
			return fmt.Errorf("Range check failed on t.PxExponent (%v < %v > %v)", t.PxExponentMinValue(), t.PxExponent, t.PxExponentMaxValue())
		}
	}
	if t.SzExponentInActingVersion(actingVersion) {
		if t.SzExponent < t.SzExponentMinValue() || t.SzExponent > t.SzExponentMaxValue() {
			return fmt.Errorf("Range check failed on t.SzExponent (%v < %v > %v)", t.SzExponentMinValue(), t.SzExponent, t.SzExponentMaxValue())
		}
	}
	if err := t.Source.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	return nil
}

func TradesChannelEventInit(t *TradesChannelEvent) {
	return
}

func (*TradesChannelEvent) SbeBlockLength() (blockLength uint16) {
	return 62
}

func (*TradesChannelEvent) SbeTemplateId() (templateId uint16) {
	return 1005
}

func (*TradesChannelEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*TradesChannelEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*TradesChannelEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TradesChannelEvent) SbeSemanticVersion() (semanticVersion string) {
	return "1.0.0"
}

func (*TradesChannelEvent) InstIdCodeId() uint16 {
	return 1
}

func (*TradesChannelEvent) InstIdCodeSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) InstIdCodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.InstIdCodeSinceVersion()
}

func (*TradesChannelEvent) InstIdCodeDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) InstIdCodeMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) InstIdCodeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesChannelEvent) InstIdCodeMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesChannelEvent) InstIdCodeNullValue() int64 {
	return math.MinInt64
}

func (*TradesChannelEvent) TsUsId() uint16 {
	return 2
}

func (*TradesChannelEvent) TsUsSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) TsUsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TsUsSinceVersion()
}

func (*TradesChannelEvent) TsUsDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) TsUsMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) TsUsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesChannelEvent) TsUsMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesChannelEvent) TsUsNullValue() int64 {
	return math.MinInt64
}

func (*TradesChannelEvent) OutTimeId() uint16 {
	return 3
}

func (*TradesChannelEvent) OutTimeSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) OutTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.OutTimeSinceVersion()
}

func (*TradesChannelEvent) OutTimeDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) OutTimeMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) OutTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesChannelEvent) OutTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesChannelEvent) OutTimeNullValue() int64 {
	return math.MinInt64
}

func (*TradesChannelEvent) SeqIdId() uint16 {
	return 4
}

func (*TradesChannelEvent) SeqIdSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) SeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SeqIdSinceVersion()
}

func (*TradesChannelEvent) SeqIdDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) SeqIdMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) SeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesChannelEvent) SeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesChannelEvent) SeqIdNullValue() int64 {
	return math.MinInt64
}

func (*TradesChannelEvent) PxMantissaId() uint16 {
	return 5
}

func (*TradesChannelEvent) PxMantissaSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) PxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PxMantissaSinceVersion()
}

func (*TradesChannelEvent) PxMantissaDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) PxMantissaMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) PxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesChannelEvent) PxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesChannelEvent) PxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*TradesChannelEvent) SzMantissaId() uint16 {
	return 6
}

func (*TradesChannelEvent) SzMantissaSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) SzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SzMantissaSinceVersion()
}

func (*TradesChannelEvent) SzMantissaDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) SzMantissaMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) SzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesChannelEvent) SzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesChannelEvent) SzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*TradesChannelEvent) TradeIdId() uint16 {
	return 7
}

func (*TradesChannelEvent) TradeIdSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) TradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.TradeIdSinceVersion()
}

func (*TradesChannelEvent) TradeIdDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) TradeIdMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) TradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TradesChannelEvent) TradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*TradesChannelEvent) TradeIdNullValue() int64 {
	return math.MinInt64
}

func (*TradesChannelEvent) CountId() uint16 {
	return 8
}

func (*TradesChannelEvent) CountSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) CountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.CountSinceVersion()
}

func (*TradesChannelEvent) CountDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) CountMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) CountMinValue() int16 {
	return math.MinInt16 + 1
}

func (*TradesChannelEvent) CountMaxValue() int16 {
	return math.MaxInt16
}

func (*TradesChannelEvent) CountNullValue() int16 {
	return math.MinInt16
}

func (*TradesChannelEvent) SideId() uint16 {
	return 9
}

func (*TradesChannelEvent) SideSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SideSinceVersion()
}

func (*TradesChannelEvent) SideDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) SideMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) PxExponentId() uint16 {
	return 10
}

func (*TradesChannelEvent) PxExponentSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) PxExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.PxExponentSinceVersion()
}

func (*TradesChannelEvent) PxExponentDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) PxExponentMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) PxExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TradesChannelEvent) PxExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TradesChannelEvent) PxExponentNullValue() int8 {
	return math.MinInt8
}

func (*TradesChannelEvent) SzExponentId() uint16 {
	return 11
}

func (*TradesChannelEvent) SzExponentSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) SzExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SzExponentSinceVersion()
}

func (*TradesChannelEvent) SzExponentDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) SzExponentMetaAttribute(meta int) string {
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

func (*TradesChannelEvent) SzExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*TradesChannelEvent) SzExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*TradesChannelEvent) SzExponentNullValue() int8 {
	return math.MinInt8
}

func (*TradesChannelEvent) SourceId() uint16 {
	return 12
}

func (*TradesChannelEvent) SourceSinceVersion() uint16 {
	return 0
}

func (t *TradesChannelEvent) SourceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.SourceSinceVersion()
}

func (*TradesChannelEvent) SourceDeprecated() uint16 {
	return 0
}

func (*TradesChannelEvent) SourceMetaAttribute(meta int) string {
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
