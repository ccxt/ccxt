// Generated SBE (Simple Binary Encoding) message codec

package com_okx_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type BooksL2TbtExponentUpdateEvent struct {
	InstIdCode int64
	TsUs       int64
	OutTime    int64
	SeqId      int64
	PrevSeqId  int64
	PxExponent int8
	SzExponent int8
}

func (b *BooksL2TbtExponentUpdateEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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
	if err := _m.WriteInt64(_w, b.PrevSeqId); err != nil {
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

func (b *BooksL2TbtExponentUpdateEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
	if !b.PrevSeqIdInActingVersion(actingVersion) {
		b.PrevSeqId = b.PrevSeqIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.PrevSeqId); err != nil {
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

func (b *BooksL2TbtExponentUpdateEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	if b.PrevSeqIdInActingVersion(actingVersion) {
		if b.PrevSeqId < b.PrevSeqIdMinValue() || b.PrevSeqId > b.PrevSeqIdMaxValue() {
			return fmt.Errorf("Range check failed on b.PrevSeqId (%v < %v > %v)", b.PrevSeqIdMinValue(), b.PrevSeqId, b.PrevSeqIdMaxValue())
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

func BooksL2TbtExponentUpdateEventInit(b *BooksL2TbtExponentUpdateEvent) {
	return
}

func (*BooksL2TbtExponentUpdateEvent) SbeBlockLength() (blockLength uint16) {
	return 42
}

func (*BooksL2TbtExponentUpdateEvent) SbeTemplateId() (templateId uint16) {
	return 1002
}

func (*BooksL2TbtExponentUpdateEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*BooksL2TbtExponentUpdateEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BooksL2TbtExponentUpdateEvent) SbeSemanticVersion() (semanticVersion string) {
	return "1.0.0"
}

func (*BooksL2TbtExponentUpdateEvent) InstIdCodeId() uint16 {
	return 1
}

func (*BooksL2TbtExponentUpdateEvent) InstIdCodeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtExponentUpdateEvent) InstIdCodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.InstIdCodeSinceVersion()
}

func (*BooksL2TbtExponentUpdateEvent) InstIdCodeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) InstIdCodeMetaAttribute(meta int) string {
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

func (*BooksL2TbtExponentUpdateEvent) InstIdCodeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtExponentUpdateEvent) InstIdCodeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtExponentUpdateEvent) InstIdCodeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtExponentUpdateEvent) TsUsId() uint16 {
	return 2
}

func (*BooksL2TbtExponentUpdateEvent) TsUsSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtExponentUpdateEvent) TsUsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.TsUsSinceVersion()
}

func (*BooksL2TbtExponentUpdateEvent) TsUsDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) TsUsMetaAttribute(meta int) string {
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

func (*BooksL2TbtExponentUpdateEvent) TsUsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtExponentUpdateEvent) TsUsMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtExponentUpdateEvent) TsUsNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtExponentUpdateEvent) OutTimeId() uint16 {
	return 3
}

func (*BooksL2TbtExponentUpdateEvent) OutTimeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtExponentUpdateEvent) OutTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OutTimeSinceVersion()
}

func (*BooksL2TbtExponentUpdateEvent) OutTimeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) OutTimeMetaAttribute(meta int) string {
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

func (*BooksL2TbtExponentUpdateEvent) OutTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtExponentUpdateEvent) OutTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtExponentUpdateEvent) OutTimeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtExponentUpdateEvent) SeqIdId() uint16 {
	return 4
}

func (*BooksL2TbtExponentUpdateEvent) SeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtExponentUpdateEvent) SeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SeqIdSinceVersion()
}

func (*BooksL2TbtExponentUpdateEvent) SeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) SeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtExponentUpdateEvent) SeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtExponentUpdateEvent) SeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtExponentUpdateEvent) SeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtExponentUpdateEvent) PrevSeqIdId() uint16 {
	return 5
}

func (*BooksL2TbtExponentUpdateEvent) PrevSeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtExponentUpdateEvent) PrevSeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PrevSeqIdSinceVersion()
}

func (*BooksL2TbtExponentUpdateEvent) PrevSeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) PrevSeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtExponentUpdateEvent) PrevSeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtExponentUpdateEvent) PrevSeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtExponentUpdateEvent) PrevSeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtExponentUpdateEvent) PxExponentId() uint16 {
	return 6
}

func (*BooksL2TbtExponentUpdateEvent) PxExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtExponentUpdateEvent) PxExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxExponentSinceVersion()
}

func (*BooksL2TbtExponentUpdateEvent) PxExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) PxExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtExponentUpdateEvent) PxExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtExponentUpdateEvent) PxExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtExponentUpdateEvent) PxExponentNullValue() int8 {
	return math.MinInt8
}

func (*BooksL2TbtExponentUpdateEvent) SzExponentId() uint16 {
	return 7
}

func (*BooksL2TbtExponentUpdateEvent) SzExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtExponentUpdateEvent) SzExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzExponentSinceVersion()
}

func (*BooksL2TbtExponentUpdateEvent) SzExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtExponentUpdateEvent) SzExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtExponentUpdateEvent) SzExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtExponentUpdateEvent) SzExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtExponentUpdateEvent) SzExponentNullValue() int8 {
	return math.MinInt8
}
