// Generated SBE (Simple Binary Encoding) message codec

package okx_1_0

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type BooksL2TbtChannelEvent struct {
	InstIdCode int64
	TsUs       int64
	OutTime    int64
	SeqId      int64
	PrevSeqId  int64
	PxExponent int8
	SzExponent int8
	Asks       []BooksL2TbtChannelEventAsks
	Bids       []BooksL2TbtChannelEventBids
}
type BooksL2TbtChannelEventAsks struct {
	PxMantissa int64
	SzMantissa int64
	OrdCount   int32
}
type BooksL2TbtChannelEventBids struct {
	PxMantissa int64
	SzMantissa int64
	OrdCount   int32
}

func (b *BooksL2TbtChannelEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (b *BooksL2TbtChannelEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
			b.Asks = make([]BooksL2TbtChannelEventAsks, AsksNumInGroup)
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
			b.Bids = make([]BooksL2TbtChannelEventBids, BidsNumInGroup)
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

func (b *BooksL2TbtChannelEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func BooksL2TbtChannelEventInit(b *BooksL2TbtChannelEvent) {
	return
}

func (b *BooksL2TbtChannelEventAsks) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (b *BooksL2TbtChannelEventAsks) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (b *BooksL2TbtChannelEventAsks) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func BooksL2TbtChannelEventAsksInit(b *BooksL2TbtChannelEventAsks) {
	return
}

func (b *BooksL2TbtChannelEventBids) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (b *BooksL2TbtChannelEventBids) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (b *BooksL2TbtChannelEventBids) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func BooksL2TbtChannelEventBidsInit(b *BooksL2TbtChannelEventBids) {
	return
}

func (*BooksL2TbtChannelEvent) SbeBlockLength() (blockLength uint16) {
	return 42
}

func (*BooksL2TbtChannelEvent) SbeTemplateId() (templateId uint16) {
	return 1001
}

func (*BooksL2TbtChannelEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*BooksL2TbtChannelEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BooksL2TbtChannelEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BooksL2TbtChannelEvent) SbeSemanticVersion() (semanticVersion string) {
	return "1.0.0"
}

func (*BooksL2TbtChannelEvent) InstIdCodeId() uint16 {
	return 1
}

func (*BooksL2TbtChannelEvent) InstIdCodeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) InstIdCodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.InstIdCodeSinceVersion()
}

func (*BooksL2TbtChannelEvent) InstIdCodeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEvent) InstIdCodeMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEvent) InstIdCodeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEvent) InstIdCodeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEvent) InstIdCodeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEvent) TsUsId() uint16 {
	return 2
}

func (*BooksL2TbtChannelEvent) TsUsSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) TsUsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.TsUsSinceVersion()
}

func (*BooksL2TbtChannelEvent) TsUsDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEvent) TsUsMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEvent) TsUsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEvent) TsUsMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEvent) TsUsNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEvent) OutTimeId() uint16 {
	return 3
}

func (*BooksL2TbtChannelEvent) OutTimeSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) OutTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OutTimeSinceVersion()
}

func (*BooksL2TbtChannelEvent) OutTimeDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEvent) OutTimeMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEvent) OutTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEvent) OutTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEvent) OutTimeNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEvent) SeqIdId() uint16 {
	return 4
}

func (*BooksL2TbtChannelEvent) SeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) SeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SeqIdSinceVersion()
}

func (*BooksL2TbtChannelEvent) SeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEvent) SeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEvent) SeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEvent) SeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEvent) SeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEvent) PrevSeqIdId() uint16 {
	return 5
}

func (*BooksL2TbtChannelEvent) PrevSeqIdSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) PrevSeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PrevSeqIdSinceVersion()
}

func (*BooksL2TbtChannelEvent) PrevSeqIdDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEvent) PrevSeqIdMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEvent) PrevSeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEvent) PrevSeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEvent) PrevSeqIdNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEvent) PxExponentId() uint16 {
	return 6
}

func (*BooksL2TbtChannelEvent) PxExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) PxExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxExponentSinceVersion()
}

func (*BooksL2TbtChannelEvent) PxExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEvent) PxExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEvent) PxExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtChannelEvent) PxExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtChannelEvent) PxExponentNullValue() int8 {
	return math.MinInt8
}

func (*BooksL2TbtChannelEvent) SzExponentId() uint16 {
	return 7
}

func (*BooksL2TbtChannelEvent) SzExponentSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) SzExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzExponentSinceVersion()
}

func (*BooksL2TbtChannelEvent) SzExponentDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEvent) SzExponentMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEvent) SzExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BooksL2TbtChannelEvent) SzExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BooksL2TbtChannelEvent) SzExponentNullValue() int8 {
	return math.MinInt8
}

func (*BooksL2TbtChannelEventAsks) PxMantissaId() uint16 {
	return 1
}

func (*BooksL2TbtChannelEventAsks) PxMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEventAsks) PxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxMantissaSinceVersion()
}

func (*BooksL2TbtChannelEventAsks) PxMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventAsks) PxMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEventAsks) PxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEventAsks) PxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEventAsks) PxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEventAsks) SzMantissaId() uint16 {
	return 2
}

func (*BooksL2TbtChannelEventAsks) SzMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEventAsks) SzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzMantissaSinceVersion()
}

func (*BooksL2TbtChannelEventAsks) SzMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventAsks) SzMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEventAsks) SzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEventAsks) SzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEventAsks) SzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEventAsks) OrdCountId() uint16 {
	return 3
}

func (*BooksL2TbtChannelEventAsks) OrdCountSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEventAsks) OrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OrdCountSinceVersion()
}

func (*BooksL2TbtChannelEventAsks) OrdCountDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventAsks) OrdCountMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEventAsks) OrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*BooksL2TbtChannelEventAsks) OrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*BooksL2TbtChannelEventAsks) OrdCountNullValue() int32 {
	return math.MinInt32
}

func (*BooksL2TbtChannelEventBids) PxMantissaId() uint16 {
	return 1
}

func (*BooksL2TbtChannelEventBids) PxMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEventBids) PxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PxMantissaSinceVersion()
}

func (*BooksL2TbtChannelEventBids) PxMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventBids) PxMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEventBids) PxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEventBids) PxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEventBids) PxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEventBids) SzMantissaId() uint16 {
	return 2
}

func (*BooksL2TbtChannelEventBids) SzMantissaSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEventBids) SzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SzMantissaSinceVersion()
}

func (*BooksL2TbtChannelEventBids) SzMantissaDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventBids) SzMantissaMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEventBids) SzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BooksL2TbtChannelEventBids) SzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*BooksL2TbtChannelEventBids) SzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*BooksL2TbtChannelEventBids) OrdCountId() uint16 {
	return 3
}

func (*BooksL2TbtChannelEventBids) OrdCountSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEventBids) OrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.OrdCountSinceVersion()
}

func (*BooksL2TbtChannelEventBids) OrdCountDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventBids) OrdCountMetaAttribute(meta int) string {
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

func (*BooksL2TbtChannelEventBids) OrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*BooksL2TbtChannelEventBids) OrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*BooksL2TbtChannelEventBids) OrdCountNullValue() int32 {
	return math.MinInt32
}

func (*BooksL2TbtChannelEvent) AsksId() uint16 {
	return 8
}

func (*BooksL2TbtChannelEvent) AsksSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) AsksInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AsksSinceVersion()
}

func (*BooksL2TbtChannelEvent) AsksDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventAsks) SbeBlockLength() (blockLength uint) {
	return 20
}

func (*BooksL2TbtChannelEventAsks) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BooksL2TbtChannelEvent) BidsId() uint16 {
	return 9
}

func (*BooksL2TbtChannelEvent) BidsSinceVersion() uint16 {
	return 0
}

func (b *BooksL2TbtChannelEvent) BidsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidsSinceVersion()
}

func (*BooksL2TbtChannelEvent) BidsDeprecated() uint16 {
	return 0
}

func (*BooksL2TbtChannelEventBids) SbeBlockLength() (blockLength uint) {
	return 20
}

func (*BooksL2TbtChannelEventBids) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}
