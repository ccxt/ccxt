// Generated SBE (Simple Binary Encoding) message codec

package com_okx_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type BooksL2TbtElpExponentUpdateEvent struct {
	InstIdCode int64
	TsUs       int64
	OutTime    int64
	SeqId      int64
	PrevSeqId  int64
	PxExponent int8
	SzExponent int8
}

func (b *BooksL2TbtElpExponentUpdateEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (b *BooksL2TbtElpExponentUpdateEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (b *BooksL2TbtElpExponentUpdateEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func BooksL2TbtElpExponentUpdateEventInit(b *BooksL2TbtElpExponentUpdateEvent) {
	return
}

func (*BooksL2TbtElpExponentUpdateEvent) SbeBlockLength() (blockLength uint16) {
	return 42
}

func (*BooksL2TbtElpExponentUpdateEvent) SbeTemplateId() (templateId uint16) {
	return 1004
}

func (*BooksL2TbtElpExponentUpdateEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*BooksL2TbtElpExponentUpdateEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BooksL2TbtElpExponentUpdateEvent) SbeSemanticVersion() (semanticVersion string) {
	return "1.0.0"
}

func (*BooksL2TbtElpExponentUpdateEvent) InstIdCodeId() uint16 {
	return 1
}

func (*BooksL2TbtElpExponentUpdateEvent) InstIdCodeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpExponentUpdateEvent) InstIdCodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.InstIdCodeSinceVersion()
}

func (*BooksL2TbtElpExponentUpdateEvent) InstIdCodeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) InstIdCodeMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpExponentUpdateEvent) InstIdCodeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpExponentUpdateEvent) InstIdCodeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) InstIdCodeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) TsUsId() uint16 {
	return 2
}

func (*BooksL2TbtElpExponentUpdateEvent) TsUsSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpExponentUpdateEvent) TsUsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.TsUsSinceVersion()
}

func (*BooksL2TbtElpExponentUpdateEvent) TsUsDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) TsUsMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpExponentUpdateEvent) TsUsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpExponentUpdateEvent) TsUsMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) TsUsNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) OutTimeId() uint16 {
	return 3
}

func (*BooksL2TbtElpExponentUpdateEvent) OutTimeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpExponentUpdateEvent) OutTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OutTimeSinceVersion()
}

func (*BooksL2TbtElpExponentUpdateEvent) OutTimeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) OutTimeMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpExponentUpdateEvent) OutTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpExponentUpdateEvent) OutTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) OutTimeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) SeqIdId() uint16 {
	return 4
}

func (*BooksL2TbtElpExponentUpdateEvent) SeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpExponentUpdateEvent) SeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SeqIdSinceVersion()
}

func (*BooksL2TbtElpExponentUpdateEvent) SeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) SeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpExponentUpdateEvent) SeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpExponentUpdateEvent) SeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) SeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) PrevSeqIdId() uint16 {
	return 5
}

func (*BooksL2TbtElpExponentUpdateEvent) PrevSeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpExponentUpdateEvent) PrevSeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PrevSeqIdSinceVersion()
}

func (*BooksL2TbtElpExponentUpdateEvent) PrevSeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) PrevSeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpExponentUpdateEvent) PrevSeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpExponentUpdateEvent) PrevSeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) PrevSeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpExponentUpdateEvent) PxExponentId() uint16 {
	return 6
}

func (*BooksL2TbtElpExponentUpdateEvent) PxExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpExponentUpdateEvent) PxExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxExponentSinceVersion()
}

func (*BooksL2TbtElpExponentUpdateEvent) PxExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) PxExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpExponentUpdateEvent) PxExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtElpExponentUpdateEvent) PxExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtElpExponentUpdateEvent) PxExponentNullValue() int8 {
	return math.MinInt8
}

func (*BooksL2TbtElpExponentUpdateEvent) SzExponentId() uint16 {
	return 7
}

func (*BooksL2TbtElpExponentUpdateEvent) SzExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpExponentUpdateEvent) SzExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzExponentSinceVersion()
}

func (*BooksL2TbtElpExponentUpdateEvent) SzExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpExponentUpdateEvent) SzExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpExponentUpdateEvent) SzExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtElpExponentUpdateEvent) SzExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtElpExponentUpdateEvent) SzExponentNullValue() int8 {
	return math.MinInt8
}
