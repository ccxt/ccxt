// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type MaxAssetFilter struct {
	FilterType  FilterTypeEnum
	QtyExponent int8
	MaxQty      int64
	Asset       []uint8
}

func (m *MaxAssetFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, m.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, m.MaxQty); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(m.Asset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, m.Asset); err != nil {
		return err
	}
	return nil
}

func (m *MaxAssetFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MaxAsset
	if !m.QtyExponentInActingVersion(actingVersion) {
		m.QtyExponent = m.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &m.QtyExponent); err != nil {
			return err
		}
	}
	if !m.MaxQtyInActingVersion(actingVersion) {
		m.MaxQty = m.MaxQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxQty); err != nil {
			return err
		}
	}
	if actingVersion > m.SbeSchemaVersion() && blockLength > m.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-m.SbeBlockLength()))
	}

	if m.AssetInActingVersion(actingVersion) {
		var AssetLength uint8
		if err := _m.ReadUint8(_r, &AssetLength); err != nil {
			return err
		}
		if cap(m.Asset) < int(AssetLength) {
			m.Asset = make([]uint8, AssetLength)
		}
		m.Asset = m.Asset[:AssetLength]
		if err := _m.ReadBytes(_r, m.Asset); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := m.RangeCheck(actingVersion, m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (m *MaxAssetFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.QtyExponentInActingVersion(actingVersion) {
		if m.QtyExponent < m.QtyExponentMinValue() || m.QtyExponent > m.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on m.QtyExponent (%v < %v > %v)", m.QtyExponentMinValue(), m.QtyExponent, m.QtyExponentMaxValue())
		}
	}
	if m.MaxQtyInActingVersion(actingVersion) {
		if m.MaxQty < m.MaxQtyMinValue() || m.MaxQty > m.MaxQtyMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxQty (%v < %v > %v)", m.MaxQtyMinValue(), m.MaxQty, m.MaxQtyMaxValue())
		}
	}
	if !utf8.Valid(m.Asset[:]) {
		return errors.New("m.Asset failed UTF-8 validation")
	}
	return nil
}

func MaxAssetFilterInit(m *MaxAssetFilter) {
	m.FilterType = FilterType.MaxAsset
	return
}

func (*MaxAssetFilter) SbeBlockLength() (blockLength uint16) {
	return 9
}

func (*MaxAssetFilter) SbeTemplateId() (templateId uint16) {
	return 21
}

func (*MaxAssetFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MaxAssetFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MaxAssetFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MaxAssetFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MaxAssetFilter) FilterTypeId() uint16 {
	return 1
}

func (*MaxAssetFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MaxAssetFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MaxAssetFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MaxAssetFilter) FilterTypeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "constant"
	}
	return ""
}

func (*MaxAssetFilter) QtyExponentId() uint16 {
	return 2
}

func (*MaxAssetFilter) QtyExponentSinceVersion() uint16 {
	return 0
}

func (m *MaxAssetFilter) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.QtyExponentSinceVersion()
}

func (*MaxAssetFilter) QtyExponentDeprecated() uint16 {
	return 0
}

func (*MaxAssetFilter) QtyExponentMetaAttribute(meta int) string {
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

func (*MaxAssetFilter) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*MaxAssetFilter) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*MaxAssetFilter) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*MaxAssetFilter) MaxQtyId() uint16 {
	return 3
}

func (*MaxAssetFilter) MaxQtySinceVersion() uint16 {
	return 0
}

func (m *MaxAssetFilter) MaxQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxQtySinceVersion()
}

func (*MaxAssetFilter) MaxQtyDeprecated() uint16 {
	return 0
}

func (*MaxAssetFilter) MaxQtyMetaAttribute(meta int) string {
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

func (*MaxAssetFilter) MaxQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MaxAssetFilter) MaxQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*MaxAssetFilter) MaxQtyNullValue() int64 {
	return math.MinInt64
}

func (*MaxAssetFilter) AssetMetaAttribute(meta int) string {
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

func (*MaxAssetFilter) AssetSinceVersion() uint16 {
	return 0
}

func (m *MaxAssetFilter) AssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.AssetSinceVersion()
}

func (*MaxAssetFilter) AssetDeprecated() uint16 {
	return 0
}

func (MaxAssetFilter) AssetCharacterEncoding() string {
	return "UTF-8"
}

func (MaxAssetFilter) AssetHeaderLength() uint64 {
	return 1
}
