// Generated SBE (Simple Binary Encoding) message codec

package okx_1_0

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type BooksL2TbtElpChannelEvent struct {
	InstIdCode int64
	TsUs       int64
	OutTime    int64
	SeqId      int64
	PrevSeqId  int64
	PxExponent int8
	SzExponent int8
	Asks       []BooksL2TbtElpChannelEventAsks
	Bids       []BooksL2TbtElpChannelEventBids
}
type BooksL2TbtElpChannelEventAsks struct {
	PxMantissa int64
	SzMantissa int64
	OrdCount   int32
}
type BooksL2TbtElpChannelEventBids struct {
	PxMantissa int64
	SzMantissa int64
	OrdCount   int32
}

func (b *BooksL2TbtElpChannelEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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
	var AsksBlockLength uint16 = 20
	if err := _m.WriteUint16(_w, AsksBlockLength); err != nil {
		return err
	}
	var AsksNumInGroup uint16 = uint16(len(b.Asks))
	if err := _m.WriteUint16(_w, AsksNumInGroup); err != nil {
		return err
	}
	for i := range b.Asks {
		if err := b.Asks[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var BidsBlockLength uint16 = 20
	if err := _m.WriteUint16(_w, BidsBlockLength); err != nil {
		return err
	}
	var BidsNumInGroup uint16 = uint16(len(b.Bids))
	if err := _m.WriteUint16(_w, BidsNumInGroup); err != nil {
		return err
	}
	for i := range b.Bids {
		if err := b.Bids[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (b *BooksL2TbtElpChannelEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

	if b.AsksInActingVersion(actingVersion) {
		var AsksBlockLength uint16
		if err := _m.ReadUint16(_r, &AsksBlockLength); err != nil {
			return err
		}
		var AsksNumInGroup uint16
		if err := _m.ReadUint16(_r, &AsksNumInGroup); err != nil {
			return err
		}
		if cap(b.Asks) < int(AsksNumInGroup) {
			b.Asks = make([]BooksL2TbtElpChannelEventAsks, AsksNumInGroup)
		}
		b.Asks = b.Asks[:AsksNumInGroup]
		for i := range b.Asks {
			if err := b.Asks[i].Decode(_m, _r, actingVersion, uint(AsksBlockLength)); err != nil {
				return err
			}
		}
	}

	if b.BidsInActingVersion(actingVersion) {
		var BidsBlockLength uint16
		if err := _m.ReadUint16(_r, &BidsBlockLength); err != nil {
			return err
		}
		var BidsNumInGroup uint16
		if err := _m.ReadUint16(_r, &BidsNumInGroup); err != nil {
			return err
		}
		if cap(b.Bids) < int(BidsNumInGroup) {
			b.Bids = make([]BooksL2TbtElpChannelEventBids, BidsNumInGroup)
		}
		b.Bids = b.Bids[:BidsNumInGroup]
		for i := range b.Bids {
			if err := b.Bids[i].Decode(_m, _r, actingVersion, uint(BidsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := b.RangeCheck(actingVersion, b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (b *BooksL2TbtElpChannelEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	for i := range b.Asks {
		if err := b.Asks[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range b.Bids {
		if err := b.Bids[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func BooksL2TbtElpChannelEventInit(b *BooksL2TbtElpChannelEvent) {
	return
}

func (b *BooksL2TbtElpChannelEventAsks) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, b.PxMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.SzMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, b.OrdCount); err != nil {
		return err
	}
	return nil
}

func (b *BooksL2TbtElpChannelEventAsks) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !b.PxMantissaInActingVersion(actingVersion) {
		b.PxMantissa = b.PxMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.PxMantissa); err != nil {
			return err
		}
	}
	if !b.SzMantissaInActingVersion(actingVersion) {
		b.SzMantissa = b.SzMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.SzMantissa); err != nil {
			return err
		}
	}
	if !b.OrdCountInActingVersion(actingVersion) {
		b.OrdCount = b.OrdCountNullValue()
	} else {
		if err := _m.ReadInt32(_r, &b.OrdCount); err != nil {
			return err
		}
	}
	if actingVersion > b.SbeSchemaVersion() && blockLength > b.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-b.SbeBlockLength()))
	}
	return nil
}

func (b *BooksL2TbtElpChannelEventAsks) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if b.PxMantissaInActingVersion(actingVersion) {
		if b.PxMantissa < b.PxMantissaMinValue() || b.PxMantissa > b.PxMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.PxMantissa (%v < %v > %v)", b.PxMantissaMinValue(), b.PxMantissa, b.PxMantissaMaxValue())
		}
	}
	if b.SzMantissaInActingVersion(actingVersion) {
		if b.SzMantissa < b.SzMantissaMinValue() || b.SzMantissa > b.SzMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.SzMantissa (%v < %v > %v)", b.SzMantissaMinValue(), b.SzMantissa, b.SzMantissaMaxValue())
		}
	}
	if b.OrdCountInActingVersion(actingVersion) {
		if b.OrdCount < b.OrdCountMinValue() || b.OrdCount > b.OrdCountMaxValue() {
			return fmt.Errorf("Range check failed on b.OrdCount (%v < %v > %v)", b.OrdCountMinValue(), b.OrdCount, b.OrdCountMaxValue())
		}
	}
	return nil
}

func BooksL2TbtElpChannelEventAsksInit(b *BooksL2TbtElpChannelEventAsks) {
	return
}

func (b *BooksL2TbtElpChannelEventBids) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, b.PxMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.SzMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, b.OrdCount); err != nil {
		return err
	}
	return nil
}

func (b *BooksL2TbtElpChannelEventBids) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !b.PxMantissaInActingVersion(actingVersion) {
		b.PxMantissa = b.PxMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.PxMantissa); err != nil {
			return err
		}
	}
	if !b.SzMantissaInActingVersion(actingVersion) {
		b.SzMantissa = b.SzMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.SzMantissa); err != nil {
			return err
		}
	}
	if !b.OrdCountInActingVersion(actingVersion) {
		b.OrdCount = b.OrdCountNullValue()
	} else {
		if err := _m.ReadInt32(_r, &b.OrdCount); err != nil {
			return err
		}
	}
	if actingVersion > b.SbeSchemaVersion() && blockLength > b.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-b.SbeBlockLength()))
	}
	return nil
}

func (b *BooksL2TbtElpChannelEventBids) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if b.PxMantissaInActingVersion(actingVersion) {
		if b.PxMantissa < b.PxMantissaMinValue() || b.PxMantissa > b.PxMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.PxMantissa (%v < %v > %v)", b.PxMantissaMinValue(), b.PxMantissa, b.PxMantissaMaxValue())
		}
	}
	if b.SzMantissaInActingVersion(actingVersion) {
		if b.SzMantissa < b.SzMantissaMinValue() || b.SzMantissa > b.SzMantissaMaxValue() {
			return fmt.Errorf("Range check failed on b.SzMantissa (%v < %v > %v)", b.SzMantissaMinValue(), b.SzMantissa, b.SzMantissaMaxValue())
		}
	}
	if b.OrdCountInActingVersion(actingVersion) {
		if b.OrdCount < b.OrdCountMinValue() || b.OrdCount > b.OrdCountMaxValue() {
			return fmt.Errorf("Range check failed on b.OrdCount (%v < %v > %v)", b.OrdCountMinValue(), b.OrdCount, b.OrdCountMaxValue())
		}
	}
	return nil
}

func BooksL2TbtElpChannelEventBidsInit(b *BooksL2TbtElpChannelEventBids) {
	return
}

func (*BooksL2TbtElpChannelEvent) SbeBlockLength() (blockLength uint16) {
	return 42
}

func (*BooksL2TbtElpChannelEvent) SbeTemplateId() (templateId uint16) {
	return 1003
}

func (*BooksL2TbtElpChannelEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*BooksL2TbtElpChannelEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BooksL2TbtElpChannelEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BooksL2TbtElpChannelEvent) SbeSemanticVersion() (semanticVersion string) {
	return "1.0.0"
}

func (*BooksL2TbtElpChannelEvent) InstIdCodeId() uint16 {
	return 1
}

func (*BooksL2TbtElpChannelEvent) InstIdCodeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) InstIdCodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.InstIdCodeSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) InstIdCodeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEvent) InstIdCodeMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEvent) InstIdCodeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEvent) InstIdCodeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEvent) InstIdCodeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEvent) TsUsId() uint16 {
	return 2
}

func (*BooksL2TbtElpChannelEvent) TsUsSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) TsUsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.TsUsSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) TsUsDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEvent) TsUsMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEvent) TsUsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEvent) TsUsMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEvent) TsUsNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEvent) OutTimeId() uint16 {
	return 3
}

func (*BooksL2TbtElpChannelEvent) OutTimeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) OutTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OutTimeSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) OutTimeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEvent) OutTimeMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEvent) OutTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEvent) OutTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEvent) OutTimeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEvent) SeqIdId() uint16 {
	return 4
}

func (*BooksL2TbtElpChannelEvent) SeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) SeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SeqIdSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) SeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEvent) SeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEvent) SeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEvent) SeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEvent) SeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEvent) PrevSeqIdId() uint16 {
	return 5
}

func (*BooksL2TbtElpChannelEvent) PrevSeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) PrevSeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PrevSeqIdSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) PrevSeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEvent) PrevSeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEvent) PrevSeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEvent) PrevSeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEvent) PrevSeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEvent) PxExponentId() uint16 {
	return 6
}

func (*BooksL2TbtElpChannelEvent) PxExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) PxExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxExponentSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) PxExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEvent) PxExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEvent) PxExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtElpChannelEvent) PxExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtElpChannelEvent) PxExponentNullValue() int8 {
	return math.MinInt8
}

func (*BooksL2TbtElpChannelEvent) SzExponentId() uint16 {
	return 7
}

func (*BooksL2TbtElpChannelEvent) SzExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) SzExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzExponentSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) SzExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEvent) SzExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEvent) SzExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtElpChannelEvent) SzExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtElpChannelEvent) SzExponentNullValue() int8 {
	return math.MinInt8
}

func (*BooksL2TbtElpChannelEventAsks) PxMantissaId() uint16 {
	return 1
}

func (*BooksL2TbtElpChannelEventAsks) PxMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEventAsks) PxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxMantissaSinceVersion()
}

func (*BooksL2TbtElpChannelEventAsks) PxMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventAsks) PxMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEventAsks) PxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEventAsks) PxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEventAsks) PxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEventAsks) SzMantissaId() uint16 {
	return 2
}

func (*BooksL2TbtElpChannelEventAsks) SzMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEventAsks) SzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzMantissaSinceVersion()
}

func (*BooksL2TbtElpChannelEventAsks) SzMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventAsks) SzMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEventAsks) SzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEventAsks) SzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEventAsks) SzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEventAsks) OrdCountId() uint16 {
	return 3
}

func (*BooksL2TbtElpChannelEventAsks) OrdCountSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEventAsks) OrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OrdCountSinceVersion()
}

func (*BooksL2TbtElpChannelEventAsks) OrdCountDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventAsks) OrdCountMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEventAsks) OrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*BooksL2TbtElpChannelEventAsks) OrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*BooksL2TbtElpChannelEventAsks) OrdCountNullValue() int32 {
	return math.MinInt32
}

func (*BooksL2TbtElpChannelEventBids) PxMantissaId() uint16 {
	return 1
}

func (*BooksL2TbtElpChannelEventBids) PxMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEventBids) PxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxMantissaSinceVersion()
}

func (*BooksL2TbtElpChannelEventBids) PxMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventBids) PxMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEventBids) PxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEventBids) PxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEventBids) PxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEventBids) SzMantissaId() uint16 {
	return 2
}

func (*BooksL2TbtElpChannelEventBids) SzMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEventBids) SzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzMantissaSinceVersion()
}

func (*BooksL2TbtElpChannelEventBids) SzMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventBids) SzMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEventBids) SzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtElpChannelEventBids) SzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtElpChannelEventBids) SzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtElpChannelEventBids) OrdCountId() uint16 {
	return 3
}

func (*BooksL2TbtElpChannelEventBids) OrdCountSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEventBids) OrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OrdCountSinceVersion()
}

func (*BooksL2TbtElpChannelEventBids) OrdCountDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventBids) OrdCountMetaAttribute(meta int) string {
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

func (*BooksL2TbtElpChannelEventBids) OrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*BooksL2TbtElpChannelEventBids) OrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*BooksL2TbtElpChannelEventBids) OrdCountNullValue() int32 {
	return math.MinInt32
}

func (*BooksL2TbtElpChannelEvent) AsksId() uint16 {
	return 8
}

func (*BooksL2TbtElpChannelEvent) AsksSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) AsksInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AsksSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) AsksDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventAsks) SbeBlockLength() (blockLength uint) {
	return 20
}

func (*BooksL2TbtElpChannelEventAsks) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BooksL2TbtElpChannelEvent) BidsId() uint16 {
	return 9
}

func (*BooksL2TbtElpChannelEvent) BidsSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtElpChannelEvent) BidsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidsSinceVersion()
}

func (*BooksL2TbtElpChannelEvent) BidsDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtElpChannelEventBids) SbeBlockLength() (blockLength uint) {
	return 20
}

func (*BooksL2TbtElpChannelEventBids) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}
