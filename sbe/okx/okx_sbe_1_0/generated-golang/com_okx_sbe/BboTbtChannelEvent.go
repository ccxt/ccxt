// Generated SBE (Simple Binary Encoding) message codec

package com_okx_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type BboTbtChannelEvent struct {
	InstIdCode    int64
	TsUs          int64
	OutTime       int64
	SeqId         int64
	AskPxMantissa int64
	AskSzMantissa int64
	BidPxMantissa int64
	BidSzMantissa int64
	AskOrdCount   int32
	BidOrdCount   int32
	PxExponent    int8
	SzExponent    int8
}

func (b *BboTbtChannelEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := b.RangeCheck(b.SbeSchemaVersion(), b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, b.InstIdCode); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.TsUs); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.OutTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.SeqId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.AskPxMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.AskSzMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.BidPxMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.BidSzMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, b.AskOrdCount); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, b.BidOrdCount); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, b.PxExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, b.SzExponent); err != nil {
		return err
	}
	return nil
}

func (b *BboTbtChannelEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !b.InstIdCodeInActingVersion(actingVersion) {
		b.InstIdCode = b.InstIdCodeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.InstIdCode); err != nil {
			return err
		}
	}
	if !b.TsUsInActingVersion(actingVersion) {
		b.TsUs = b.TsUsNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.TsUs); err != nil {
			return err
		}
	}
	if !b.OutTimeInActingVersion(actingVersion) {
		b.OutTime = b.OutTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.OutTime); err != nil {
			return err
		}
	}
	if !b.SeqIdInActingVersion(actingVersion) {
		b.SeqId = b.SeqIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.SeqId); err != nil {
			return err
		}
	}
	if !b.AskPxMantissaInActingVersion(actingVersion) {
		b.AskPxMantissa = b.AskPxMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.AskPxMantissa); err != nil {
			return err
		}
	}
	if !b.AskSzMantissaInActingVersion(actingVersion) {
		b.AskSzMantissa = b.AskSzMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.AskSzMantissa); err != nil {
			return err
		}
	}
	if !b.BidPxMantissaInActingVersion(actingVersion) {
		b.BidPxMantissa = b.BidPxMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.BidPxMantissa); err != nil {
			return err
		}
	}
	if !b.BidSzMantissaInActingVersion(actingVersion) {
		b.BidSzMantissa = b.BidSzMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.BidSzMantissa); err != nil {
			return err
		}
	}
	if !b.AskOrdCountInActingVersion(actingVersion) {
		b.AskOrdCount = b.AskOrdCountNullValue()
	} else {
		if err := _m.ReadInt32(_r, &b.AskOrdCount); err != nil {
			return err
		}
	}
	if !b.BidOrdCountInActingVersion(actingVersion) {
		b.BidOrdCount = b.BidOrdCountNullValue()
	} else {
		if err := _m.ReadInt32(_r, &b.BidOrdCount); err != nil {
			return err
		}
	}
	if !b.PxExponentInActingVersion(actingVersion) {
		b.PxExponent = b.PxExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &b.PxExponent); err != nil {
			return err
		}
	}
	if !b.SzExponentInActingVersion(actingVersion) {
		b.SzExponent = b.SzExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &b.SzExponent); err != nil {
			return err
		}
	}
	if actingVersion > b.SbeSchemaVersion() && blockLength > b.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-b.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := b.RangeCheck(actingVersion, b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (b *BboTbtChannelEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if b.InstIdCodeInActingVersion(actingVersion) {
		if b.InstIdCode < b.InstIdCodeMinValue() || b.InstIdCode > b.InstIdCodeMaxValue() {
			return fmt.Errorf("Range check failed on b.InstIdCode (%v < %v > %v)", b.InstIdCodeMinValue(), b.InstIdCode, b.InstIdCodeMaxValue())
		}
	}
	if b.TsUsInActingVersion(actingVersion) {
		if b.TsUs < b.TsUsMinValue() || b.TsUs > b.TsUsMaxValue() {
			return fmt.Errorf("Range check failed on b.TsUs (%v < %v > %v)", b.TsUsMinValue(), b.TsUs, b.TsUsMaxValue())
		}
	}
	if b.OutTimeInActingVersion(actingVersion) {
		if b.OutTime < b.OutTimeMinValue() || b.OutTime > b.OutTimeMaxValue() {
			return fmt.Errorf("Range check failed on b.OutTime (%v < %v > %v)", b.OutTimeMinValue(), b.OutTime, b.OutTimeMaxValue())
		}
	}
	if b.SeqIdInActingVersion(actingVersion) {
		if b.SeqId < b.SeqIdMinValue() || b.SeqId > b.SeqIdMaxValue() {
			return fmt.Errorf("Range check failed on b.SeqId (%v < %v > %v)", b.SeqIdMinValue(), b.SeqId, b.SeqIdMaxValue())
		}
	}
	if b.AskPxMantissaInActingVersion(actingVersion) {
		if b.AskPxMantissa < b.AskPxMantissaMinValue() || b.AskPxMantissa > b.AskPxMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.AskPxMantissa (%v < %v > %v)", b.AskPxMantissaMinValue(), b.AskPxMantissa, b.AskPxMantissaMaxValue())
		}
	}
	if b.AskSzMantissaInActingVersion(actingVersion) {
		if b.AskSzMantissa < b.AskSzMantissaMinValue() || b.AskSzMantissa > b.AskSzMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.AskSzMantissa (%v < %v > %v)", b.AskSzMantissaMinValue(), b.AskSzMantissa, b.AskSzMantissaMaxValue())
		}
	}
	if b.BidPxMantissaInActingVersion(actingVersion) {
		if b.BidPxMantissa < b.BidPxMantissaMinValue() || b.BidPxMantissa > b.BidPxMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.BidPxMantissa (%v < %v > %v)", b.BidPxMantissaMinValue(), b.BidPxMantissa, b.BidPxMantissaMaxValue())
		}
	}
	if b.BidSzMantissaInActingVersion(actingVersion) {
		if b.BidSzMantissa < b.BidSzMantissaMinValue() || b.BidSzMantissa > b.BidSzMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.BidSzMantissa (%v < %v > %v)", b.BidSzMantissaMinValue(), b.BidSzMantissa, b.BidSzMantissaMaxValue())
		}
	}
	if b.AskOrdCountInActingVersion(actingVersion) {
		if b.AskOrdCount < b.AskOrdCountMinValue() || b.AskOrdCount > b.AskOrdCountMaxValue() {
			return fmt.Errorf("Range check failed on b.AskOrdCount (%v < %v > %v)", b.AskOrdCountMinValue(), b.AskOrdCount, b.AskOrdCountMaxValue())
		}
	}
	if b.BidOrdCountInActingVersion(actingVersion) {
		if b.BidOrdCount < b.BidOrdCountMinValue() || b.BidOrdCount > b.BidOrdCountMaxValue() {
			return fmt.Errorf("Range check failed on b.BidOrdCount (%v < %v > %v)", b.BidOrdCountMinValue(), b.BidOrdCount, b.BidOrdCountMaxValue())
		}
	}
	if b.PxExponentInActingVersion(actingVersion) {
		if b.PxExponent < b.PxExponentMinValue() || b.PxExponent > b.PxExponentMaxValue() {
			return fmt.Errorf("Range check failed on b.PxExponent (%v < %v > %v)", b.PxExponentMinValue(), b.PxExponent, b.PxExponentMaxValue())
		}
	}
	if b.SzExponentInActingVersion(actingVersion) {
		if b.SzExponent < b.SzExponentMinValue() || b.SzExponent > b.SzExponentMaxValue() {
			return fmt.Errorf("Range check failed on b.SzExponent (%v < %v > %v)", b.SzExponentMinValue(), b.SzExponent, b.SzExponentMaxValue())
		}
	}
	return nil
}

func BboTbtChannelEventInit(b *BboTbtChannelEvent) {
	return
}

func (*BboTbtChannelEvent) SbeBlockLength() (blockLength uint16) {
	return 74
}

func (*BboTbtChannelEvent) SbeTemplateId() (templateId uint16) {
	return 1000
}

func (*BboTbtChannelEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*BboTbtChannelEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BboTbtChannelEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BboTbtChannelEvent) SbeSemanticVersion() (semanticVersion string) {
	return "1.0.0"
}

func (*BboTbtChannelEvent) InstIdCodeId() uint16 {
	return 1
}

func (*BboTbtChannelEvent) InstIdCodeSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) InstIdCodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.InstIdCodeSinceVersion()
}

func (*BboTbtChannelEvent) InstIdCodeDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) InstIdCodeMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) InstIdCodeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) InstIdCodeMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) InstIdCodeNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) TsUsId() uint16 {
	return 2
}

func (*BboTbtChannelEvent) TsUsSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) TsUsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.TsUsSinceVersion()
}

func (*BboTbtChannelEvent) TsUsDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) TsUsMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) TsUsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) TsUsMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) TsUsNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) OutTimeId() uint16 {
	return 3
}

func (*BboTbtChannelEvent) OutTimeSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) OutTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OutTimeSinceVersion()
}

func (*BboTbtChannelEvent) OutTimeDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) OutTimeMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) OutTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) OutTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) OutTimeNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) SeqIdId() uint16 {
	return 4
}

func (*BboTbtChannelEvent) SeqIdSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) SeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SeqIdSinceVersion()
}

func (*BboTbtChannelEvent) SeqIdDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) SeqIdMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) SeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) SeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) SeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) AskPxMantissaId() uint16 {
	return 5
}

func (*BboTbtChannelEvent) AskPxMantissaSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) AskPxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskPxMantissaSinceVersion()
}

func (*BboTbtChannelEvent) AskPxMantissaDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) AskPxMantissaMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) AskPxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) AskPxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) AskPxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) AskSzMantissaId() uint16 {
	return 6
}

func (*BboTbtChannelEvent) AskSzMantissaSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) AskSzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskSzMantissaSinceVersion()
}

func (*BboTbtChannelEvent) AskSzMantissaDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) AskSzMantissaMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) AskSzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) AskSzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) AskSzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) BidPxMantissaId() uint16 {
	return 7
}

func (*BboTbtChannelEvent) BidPxMantissaSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) BidPxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidPxMantissaSinceVersion()
}

func (*BboTbtChannelEvent) BidPxMantissaDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) BidPxMantissaMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) BidPxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) BidPxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) BidPxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) BidSzMantissaId() uint16 {
	return 8
}

func (*BboTbtChannelEvent) BidSzMantissaSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) BidSzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidSzMantissaSinceVersion()
}

func (*BboTbtChannelEvent) BidSzMantissaDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) BidSzMantissaMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) BidSzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BboTbtChannelEvent) BidSzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BboTbtChannelEvent) BidSzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BboTbtChannelEvent) AskOrdCountId() uint16 {
	return 9
}

func (*BboTbtChannelEvent) AskOrdCountSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) AskOrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskOrdCountSinceVersion()
}

func (*BboTbtChannelEvent) AskOrdCountDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) AskOrdCountMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) AskOrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*BboTbtChannelEvent) AskOrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*BboTbtChannelEvent) AskOrdCountNullValue() int32 {
	return math.MinInt32
}

func (*BboTbtChannelEvent) BidOrdCountId() uint16 {
	return 10
}

func (*BboTbtChannelEvent) BidOrdCountSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) BidOrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidOrdCountSinceVersion()
}

func (*BboTbtChannelEvent) BidOrdCountDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) BidOrdCountMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) BidOrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*BboTbtChannelEvent) BidOrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*BboTbtChannelEvent) BidOrdCountNullValue() int32 {
	return math.MinInt32
}

func (*BboTbtChannelEvent) PxExponentId() uint16 {
	return 11
}

func (*BboTbtChannelEvent) PxExponentSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) PxExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxExponentSinceVersion()
}

func (*BboTbtChannelEvent) PxExponentDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) PxExponentMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) PxExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BboTbtChannelEvent) PxExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BboTbtChannelEvent) PxExponentNullValue() int8 {
	return math.MinInt8
}

func (*BboTbtChannelEvent) SzExponentId() uint16 {
	return 12
}

func (*BboTbtChannelEvent) SzExponentSinceVersion() uint16 {
	return 0
}

func (b *BboTbtChannelEvent) SzExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzExponentSinceVersion()
}

func (*BboTbtChannelEvent) SzExponentDeprecated() uint16 {
	return 0
}

func (*BboTbtChannelEvent) SzExponentMetaAttribute(meta int) string {
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

func (*BboTbtChannelEvent) SzExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BboTbtChannelEvent) SzExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BboTbtChannelEvent) SzExponentNullValue() int8 {
	return math.MinInt8
}
