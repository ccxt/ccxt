// Generated SBE (Simple Binary Encoding) message codec

package com_okx_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type SnapshotDepthResponseEvent struct {
	InstIdCode int64
	TsUs       int64
	SeqId      int64
	PxExponent int8
	SzExponent int8
	Asks       []SnapshotDepthResponseEventAsks
	Bids       []SnapshotDepthResponseEventBids
}
type SnapshotDepthResponseEventAsks struct {
	PxMantissa int64
	SzMantissa int64
	OrdCount   int32
}
type SnapshotDepthResponseEventBids struct {
	PxMantissa int64
	SzMantissa int64
	OrdCount   int32
}

func (s *SnapshotDepthResponseEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := s.RangeCheck(s.SbeSchemaVersion(), s.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, s.InstIdCode); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, s.TsUs); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, s.SeqId); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, s.PxExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, s.SzExponent); err != nil {
		return err
	}
	var AsksBlockLength uint16 = 20
	if err := _m.WriteUint16(_w, AsksBlockLength); err != nil {
		return err
	}
	var AsksNumInGroup uint16 = uint16(len(s.Asks))
	if err := _m.WriteUint16(_w, AsksNumInGroup); err != nil {
		return err
	}
	for i := range s.Asks {
		if err := s.Asks[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var BidsBlockLength uint16 = 20
	if err := _m.WriteUint16(_w, BidsBlockLength); err != nil {
		return err
	}
	var BidsNumInGroup uint16 = uint16(len(s.Bids))
	if err := _m.WriteUint16(_w, BidsNumInGroup); err != nil {
		return err
	}
	for i := range s.Bids {
		if err := s.Bids[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (s *SnapshotDepthResponseEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !s.InstIdCodeInActingVersion(actingVersion) {
		s.InstIdCode = s.InstIdCodeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.InstIdCode); err != nil {
			return err
		}
	}
	if !s.TsUsInActingVersion(actingVersion) {
		s.TsUs = s.TsUsNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.TsUs); err != nil {
			return err
		}
	}
	if !s.SeqIdInActingVersion(actingVersion) {
		s.SeqId = s.SeqIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.SeqId); err != nil {
			return err
		}
	}
	if !s.PxExponentInActingVersion(actingVersion) {
		s.PxExponent = s.PxExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &s.PxExponent); err != nil {
			return err
		}
	}
	if !s.SzExponentInActingVersion(actingVersion) {
		s.SzExponent = s.SzExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &s.SzExponent); err != nil {
			return err
		}
	}
	if actingVersion > s.SbeSchemaVersion() && blockLength > s.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-s.SbeBlockLength()))
	}

	if s.AsksInActingVersion(actingVersion) {
		var AsksBlockLength uint16
		if err := _m.ReadUint16(_r, &AsksBlockLength); err != nil {
			return err
		}
		var AsksNumInGroup uint16
		if err := _m.ReadUint16(_r, &AsksNumInGroup); err != nil {
			return err
		}
		if cap(s.Asks) < int(AsksNumInGroup) {
			s.Asks = make([]SnapshotDepthResponseEventAsks, AsksNumInGroup)
		}
		s.Asks = s.Asks[:AsksNumInGroup]
		for i := range s.Asks {
			if err := s.Asks[i].Decode(_m, _r, actingVersion, uint(AsksBlockLength)); err != nil {
				return err
			}
		}
	}

	if s.BidsInActingVersion(actingVersion) {
		var BidsBlockLength uint16
		if err := _m.ReadUint16(_r, &BidsBlockLength); err != nil {
			return err
		}
		var BidsNumInGroup uint16
		if err := _m.ReadUint16(_r, &BidsNumInGroup); err != nil {
			return err
		}
		if cap(s.Bids) < int(BidsNumInGroup) {
			s.Bids = make([]SnapshotDepthResponseEventBids, BidsNumInGroup)
		}
		s.Bids = s.Bids[:BidsNumInGroup]
		for i := range s.Bids {
			if err := s.Bids[i].Decode(_m, _r, actingVersion, uint(BidsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := s.RangeCheck(actingVersion, s.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (s *SnapshotDepthResponseEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if s.InstIdCodeInActingVersion(actingVersion) {
		if s.InstIdCode < s.InstIdCodeMinValue() || s.InstIdCode > s.InstIdCodeMaxValue() {
			return fmt.Errorf("Range check failed on s.InstIdCode (%v < %v > %v)", s.InstIdCodeMinValue(), s.InstIdCode, s.InstIdCodeMaxValue())
		}
	}
	if s.TsUsInActingVersion(actingVersion) {
		if s.TsUs < s.TsUsMinValue() || s.TsUs > s.TsUsMaxValue() {
			return fmt.Errorf("Range check failed on s.TsUs (%v < %v > %v)", s.TsUsMinValue(), s.TsUs, s.TsUsMaxValue())
		}
	}
	if s.SeqIdInActingVersion(actingVersion) {
		if s.SeqId < s.SeqIdMinValue() || s.SeqId > s.SeqIdMaxValue() {
			return fmt.Errorf("Range check failed on s.SeqId (%v < %v > %v)", s.SeqIdMinValue(), s.SeqId, s.SeqIdMaxValue())
		}
	}
	if s.PxExponentInActingVersion(actingVersion) {
		if s.PxExponent < s.PxExponentMinValue() || s.PxExponent > s.PxExponentMaxValue() {
			return fmt.Errorf("Range check failed on s.PxExponent (%v < %v > %v)", s.PxExponentMinValue(), s.PxExponent, s.PxExponentMaxValue())
		}
	}
	if s.SzExponentInActingVersion(actingVersion) {
		if s.SzExponent < s.SzExponentMinValue() || s.SzExponent > s.SzExponentMaxValue() {
			return fmt.Errorf("Range check failed on s.SzExponent (%v < %v > %v)", s.SzExponentMinValue(), s.SzExponent, s.SzExponentMaxValue())
		}
	}
	for i := range s.Asks {
		if err := s.Asks[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range s.Bids {
		if err := s.Bids[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func SnapshotDepthResponseEventInit(s *SnapshotDepthResponseEvent) {
	return
}

func (s *SnapshotDepthResponseEventAsks) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, s.PxMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, s.SzMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, s.OrdCount); err != nil {
		return err
	}
	return nil
}

func (s *SnapshotDepthResponseEventAsks) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !s.PxMantissaInActingVersion(actingVersion) {
		s.PxMantissa = s.PxMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.PxMantissa); err != nil {
			return err
		}
	}
	if !s.SzMantissaInActingVersion(actingVersion) {
		s.SzMantissa = s.SzMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.SzMantissa); err != nil {
			return err
		}
	}
	if !s.OrdCountInActingVersion(actingVersion) {
		s.OrdCount = s.OrdCountNullValue()
	} else {
		if err := _m.ReadInt32(_r, &s.OrdCount); err != nil {
			return err
		}
	}
	if actingVersion > s.SbeSchemaVersion() && blockLength > s.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-s.SbeBlockLength()))
	}
	return nil
}

func (s *SnapshotDepthResponseEventAsks) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if s.PxMantissaInActingVersion(actingVersion) {
		if s.PxMantissa < s.PxMantissaMinValue() || s.PxMantissa > s.PxMantissaMaxValue() {
			return fmt.Errorf("Range check failed on s.PxMantissa (%v < %v > %v)", s.PxMantissaMinValue(), s.PxMantissa, s.PxMantissaMaxValue())
		}
	}
	if s.SzMantissaInActingVersion(actingVersion) {
		if s.SzMantissa < s.SzMantissaMinValue() || s.SzMantissa > s.SzMantissaMaxValue() {
			return fmt.Errorf("Range check failed on s.SzMantissa (%v < %v > %v)", s.SzMantissaMinValue(), s.SzMantissa, s.SzMantissaMaxValue())
		}
	}
	if s.OrdCountInActingVersion(actingVersion) {
		if s.OrdCount < s.OrdCountMinValue() || s.OrdCount > s.OrdCountMaxValue() {
			return fmt.Errorf("Range check failed on s.OrdCount (%v < %v > %v)", s.OrdCountMinValue(), s.OrdCount, s.OrdCountMaxValue())
		}
	}
	return nil
}

func SnapshotDepthResponseEventAsksInit(s *SnapshotDepthResponseEventAsks) {
	return
}

func (s *SnapshotDepthResponseEventBids) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, s.PxMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, s.SzMantissa); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, s.OrdCount); err != nil {
		return err
	}
	return nil
}

func (s *SnapshotDepthResponseEventBids) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !s.PxMantissaInActingVersion(actingVersion) {
		s.PxMantissa = s.PxMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.PxMantissa); err != nil {
			return err
		}
	}
	if !s.SzMantissaInActingVersion(actingVersion) {
		s.SzMantissa = s.SzMantissaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.SzMantissa); err != nil {
			return err
		}
	}
	if !s.OrdCountInActingVersion(actingVersion) {
		s.OrdCount = s.OrdCountNullValue()
	} else {
		if err := _m.ReadInt32(_r, &s.OrdCount); err != nil {
			return err
		}
	}
	if actingVersion > s.SbeSchemaVersion() && blockLength > s.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-s.SbeBlockLength()))
	}
	return nil
}

func (s *SnapshotDepthResponseEventBids) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if s.PxMantissaInActingVersion(actingVersion) {
		if s.PxMantissa < s.PxMantissaMinValue() || s.PxMantissa > s.PxMantissaMaxValue() {
			return fmt.Errorf("Range check failed on s.PxMantissa (%v < %v > %v)", s.PxMantissaMinValue(), s.PxMantissa, s.PxMantissaMaxValue())
		}
	}
	if s.SzMantissaInActingVersion(actingVersion) {
		if s.SzMantissa < s.SzMantissaMinValue() || s.SzMantissa > s.SzMantissaMaxValue() {
			return fmt.Errorf("Range check failed on s.SzMantissa (%v < %v > %v)", s.SzMantissaMinValue(), s.SzMantissa, s.SzMantissaMaxValue())
		}
	}
	if s.OrdCountInActingVersion(actingVersion) {
		if s.OrdCount < s.OrdCountMinValue() || s.OrdCount > s.OrdCountMaxValue() {
			return fmt.Errorf("Range check failed on s.OrdCount (%v < %v > %v)", s.OrdCountMinValue(), s.OrdCount, s.OrdCountMaxValue())
		}
	}
	return nil
}

func SnapshotDepthResponseEventBidsInit(s *SnapshotDepthResponseEventBids) {
	return
}

func (*SnapshotDepthResponseEvent) SbeBlockLength() (blockLength uint16) {
	return 26
}

func (*SnapshotDepthResponseEvent) SbeTemplateId() (templateId uint16) {
	return 1006
}

func (*SnapshotDepthResponseEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*SnapshotDepthResponseEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*SnapshotDepthResponseEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*SnapshotDepthResponseEvent) SbeSemanticVersion() (semanticVersion string) {
	return "1.0.0"
}

func (*SnapshotDepthResponseEvent) InstIdCodeId() uint16 {
	return 1
}

func (*SnapshotDepthResponseEvent) InstIdCodeSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEvent) InstIdCodeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.InstIdCodeSinceVersion()
}

func (*SnapshotDepthResponseEvent) InstIdCodeDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEvent) InstIdCodeMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEvent) InstIdCodeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*SnapshotDepthResponseEvent) InstIdCodeMaxValue() int64 {
	return math.MaxInt64
}

func (*SnapshotDepthResponseEvent) InstIdCodeNullValue() int64 {
	return math.MinInt64
}

func (*SnapshotDepthResponseEvent) TsUsId() uint16 {
	return 2
}

func (*SnapshotDepthResponseEvent) TsUsSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEvent) TsUsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.TsUsSinceVersion()
}

func (*SnapshotDepthResponseEvent) TsUsDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEvent) TsUsMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEvent) TsUsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*SnapshotDepthResponseEvent) TsUsMaxValue() int64 {
	return math.MaxInt64
}

func (*SnapshotDepthResponseEvent) TsUsNullValue() int64 {
	return math.MinInt64
}

func (*SnapshotDepthResponseEvent) SeqIdId() uint16 {
	return 3
}

func (*SnapshotDepthResponseEvent) SeqIdSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEvent) SeqIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.SeqIdSinceVersion()
}

func (*SnapshotDepthResponseEvent) SeqIdDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEvent) SeqIdMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEvent) SeqIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*SnapshotDepthResponseEvent) SeqIdMaxValue() int64 {
	return math.MaxInt64
}

func (*SnapshotDepthResponseEvent) SeqIdNullValue() int64 {
	return math.MinInt64
}

func (*SnapshotDepthResponseEvent) PxExponentId() uint16 {
	return 4
}

func (*SnapshotDepthResponseEvent) PxExponentSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEvent) PxExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.PxExponentSinceVersion()
}

func (*SnapshotDepthResponseEvent) PxExponentDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEvent) PxExponentMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEvent) PxExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*SnapshotDepthResponseEvent) PxExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*SnapshotDepthResponseEvent) PxExponentNullValue() int8 {
	return math.MinInt8
}

func (*SnapshotDepthResponseEvent) SzExponentId() uint16 {
	return 5
}

func (*SnapshotDepthResponseEvent) SzExponentSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEvent) SzExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.SzExponentSinceVersion()
}

func (*SnapshotDepthResponseEvent) SzExponentDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEvent) SzExponentMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEvent) SzExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*SnapshotDepthResponseEvent) SzExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*SnapshotDepthResponseEvent) SzExponentNullValue() int8 {
	return math.MinInt8
}

func (*SnapshotDepthResponseEventAsks) PxMantissaId() uint16 {
	return 1
}

func (*SnapshotDepthResponseEventAsks) PxMantissaSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEventAsks) PxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.PxMantissaSinceVersion()
}

func (*SnapshotDepthResponseEventAsks) PxMantissaDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventAsks) PxMantissaMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEventAsks) PxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*SnapshotDepthResponseEventAsks) PxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*SnapshotDepthResponseEventAsks) PxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*SnapshotDepthResponseEventAsks) SzMantissaId() uint16 {
	return 2
}

func (*SnapshotDepthResponseEventAsks) SzMantissaSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEventAsks) SzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.SzMantissaSinceVersion()
}

func (*SnapshotDepthResponseEventAsks) SzMantissaDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventAsks) SzMantissaMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEventAsks) SzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*SnapshotDepthResponseEventAsks) SzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*SnapshotDepthResponseEventAsks) SzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*SnapshotDepthResponseEventAsks) OrdCountId() uint16 {
	return 3
}

func (*SnapshotDepthResponseEventAsks) OrdCountSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEventAsks) OrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.OrdCountSinceVersion()
}

func (*SnapshotDepthResponseEventAsks) OrdCountDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventAsks) OrdCountMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEventAsks) OrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*SnapshotDepthResponseEventAsks) OrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*SnapshotDepthResponseEventAsks) OrdCountNullValue() int32 {
	return math.MinInt32
}

func (*SnapshotDepthResponseEventBids) PxMantissaId() uint16 {
	return 1
}

func (*SnapshotDepthResponseEventBids) PxMantissaSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEventBids) PxMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.PxMantissaSinceVersion()
}

func (*SnapshotDepthResponseEventBids) PxMantissaDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventBids) PxMantissaMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEventBids) PxMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*SnapshotDepthResponseEventBids) PxMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*SnapshotDepthResponseEventBids) PxMantissaNullValue() int64 {
	return math.MinInt64
}

func (*SnapshotDepthResponseEventBids) SzMantissaId() uint16 {
	return 2
}

func (*SnapshotDepthResponseEventBids) SzMantissaSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEventBids) SzMantissaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.SzMantissaSinceVersion()
}

func (*SnapshotDepthResponseEventBids) SzMantissaDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventBids) SzMantissaMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEventBids) SzMantissaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*SnapshotDepthResponseEventBids) SzMantissaMaxValue() int64 {
	return math.MaxInt64
}

func (*SnapshotDepthResponseEventBids) SzMantissaNullValue() int64 {
	return math.MinInt64
}

func (*SnapshotDepthResponseEventBids) OrdCountId() uint16 {
	return 3
}

func (*SnapshotDepthResponseEventBids) OrdCountSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEventBids) OrdCountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.OrdCountSinceVersion()
}

func (*SnapshotDepthResponseEventBids) OrdCountDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventBids) OrdCountMetaAttribute(meta int) string {
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

func (*SnapshotDepthResponseEventBids) OrdCountMinValue() int32 {
	return math.MinInt32 + 1
}

func (*SnapshotDepthResponseEventBids) OrdCountMaxValue() int32 {
	return math.MaxInt32
}

func (*SnapshotDepthResponseEventBids) OrdCountNullValue() int32 {
	return math.MinInt32
}

func (*SnapshotDepthResponseEvent) AsksId() uint16 {
	return 6
}

func (*SnapshotDepthResponseEvent) AsksSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEvent) AsksInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.AsksSinceVersion()
}

func (*SnapshotDepthResponseEvent) AsksDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventAsks) SbeBlockLength() (blockLength uint) {
	return 20
}

func (*SnapshotDepthResponseEventAsks) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*SnapshotDepthResponseEvent) BidsId() uint16 {
	return 7
}

func (*SnapshotDepthResponseEvent) BidsSinceVersion() uint16 {
	return 0
}

func (s *SnapshotDepthResponseEvent) BidsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.BidsSinceVersion()
}

func (*SnapshotDepthResponseEvent) BidsDeprecated() uint16 {
	return 0
}

func (*SnapshotDepthResponseEventBids) SbeBlockLength() (blockLength uint) {
	return 20
}

func (*SnapshotDepthResponseEventBids) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}
