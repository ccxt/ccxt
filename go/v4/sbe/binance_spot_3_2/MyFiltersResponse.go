// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"io"
	"io/ioutil"
)

type MyFiltersResponse struct {
	ExchangeFilters []MyFiltersResponseExchangeFilters
	SymbolFilters   []MyFiltersResponseSymbolFilters
	AssetFilters    []MyFiltersResponseAssetFilters
}
type MyFiltersResponseExchangeFilters struct {
	Filter []uint8
}
type MyFiltersResponseSymbolFilters struct {
	Filter []uint8
}
type MyFiltersResponseAssetFilters struct {
	Filter []uint8
}

func (m *MyFiltersResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var ExchangeFiltersBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, ExchangeFiltersBlockLength); err != nil {
		return err
	}
	var ExchangeFiltersNumInGroup uint32 = uint32(len(m.ExchangeFilters))
	if err := _m.WriteUint32(_w, ExchangeFiltersNumInGroup); err != nil {
		return err
	}
	for i := range m.ExchangeFilters {
		if err := m.ExchangeFilters[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var SymbolFiltersBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, SymbolFiltersBlockLength); err != nil {
		return err
	}
	var SymbolFiltersNumInGroup uint32 = uint32(len(m.SymbolFilters))
	if err := _m.WriteUint32(_w, SymbolFiltersNumInGroup); err != nil {
		return err
	}
	for i := range m.SymbolFilters {
		if err := m.SymbolFilters[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var AssetFiltersBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, AssetFiltersBlockLength); err != nil {
		return err
	}
	var AssetFiltersNumInGroup uint32 = uint32(len(m.AssetFilters))
	if err := _m.WriteUint32(_w, AssetFiltersNumInGroup); err != nil {
		return err
	}
	for i := range m.AssetFilters {
		if err := m.AssetFilters[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (m *MyFiltersResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > m.SbeSchemaVersion() && blockLength > m.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-m.SbeBlockLength()))
	}

	if m.ExchangeFiltersInActingVersion(actingVersion) {
		var ExchangeFiltersBlockLength uint16
		if err := _m.ReadUint16(_r, &ExchangeFiltersBlockLength); err != nil {
			return err
		}
		var ExchangeFiltersNumInGroup uint32
		if err := _m.ReadUint32(_r, &ExchangeFiltersNumInGroup); err != nil {
			return err
		}
		if cap(m.ExchangeFilters) < int(ExchangeFiltersNumInGroup) {
			m.ExchangeFilters = make([]MyFiltersResponseExchangeFilters, ExchangeFiltersNumInGroup)
		}
		m.ExchangeFilters = m.ExchangeFilters[:ExchangeFiltersNumInGroup]
		for i := range m.ExchangeFilters {
			if err := m.ExchangeFilters[i].Decode(_m, _r, actingVersion, uint(ExchangeFiltersBlockLength)); err != nil {
				return err
			}
		}
	}

	if m.SymbolFiltersInActingVersion(actingVersion) {
		var SymbolFiltersBlockLength uint16
		if err := _m.ReadUint16(_r, &SymbolFiltersBlockLength); err != nil {
			return err
		}
		var SymbolFiltersNumInGroup uint32
		if err := _m.ReadUint32(_r, &SymbolFiltersNumInGroup); err != nil {
			return err
		}
		if cap(m.SymbolFilters) < int(SymbolFiltersNumInGroup) {
			m.SymbolFilters = make([]MyFiltersResponseSymbolFilters, SymbolFiltersNumInGroup)
		}
		m.SymbolFilters = m.SymbolFilters[:SymbolFiltersNumInGroup]
		for i := range m.SymbolFilters {
			if err := m.SymbolFilters[i].Decode(_m, _r, actingVersion, uint(SymbolFiltersBlockLength)); err != nil {
				return err
			}
		}
	}

	if m.AssetFiltersInActingVersion(actingVersion) {
		var AssetFiltersBlockLength uint16
		if err := _m.ReadUint16(_r, &AssetFiltersBlockLength); err != nil {
			return err
		}
		var AssetFiltersNumInGroup uint32
		if err := _m.ReadUint32(_r, &AssetFiltersNumInGroup); err != nil {
			return err
		}
		if cap(m.AssetFilters) < int(AssetFiltersNumInGroup) {
			m.AssetFilters = make([]MyFiltersResponseAssetFilters, AssetFiltersNumInGroup)
		}
		m.AssetFilters = m.AssetFilters[:AssetFiltersNumInGroup]
		for i := range m.AssetFilters {
			if err := m.AssetFilters[i].Decode(_m, _r, actingVersion, uint(AssetFiltersBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := m.RangeCheck(actingVersion, m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (m *MyFiltersResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range m.ExchangeFilters {
		if err := m.ExchangeFilters[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range m.SymbolFilters {
		if err := m.SymbolFilters[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range m.AssetFilters {
		if err := m.AssetFilters[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func MyFiltersResponseInit(m *MyFiltersResponse) {
	return
}

func (m *MyFiltersResponseExchangeFilters) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(m.Filter))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, m.Filter); err != nil {
		return err
	}
	return nil
}

func (m *MyFiltersResponseExchangeFilters) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > m.SbeSchemaVersion() && blockLength > m.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-m.SbeBlockLength()))
	}

	if m.FilterInActingVersion(actingVersion) {
		var FilterLength uint8
		if err := _m.ReadUint8(_r, &FilterLength); err != nil {
			return err
		}
		if cap(m.Filter) < int(FilterLength) {
			m.Filter = make([]uint8, FilterLength)
		}
		m.Filter = m.Filter[:FilterLength]
		if err := _m.ReadBytes(_r, m.Filter); err != nil {
			return err
		}
	}
	return nil
}

func (m *MyFiltersResponseExchangeFilters) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func MyFiltersResponseExchangeFiltersInit(m *MyFiltersResponseExchangeFilters) {
	return
}

func (m *MyFiltersResponseSymbolFilters) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(m.Filter))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, m.Filter); err != nil {
		return err
	}
	return nil
}

func (m *MyFiltersResponseSymbolFilters) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > m.SbeSchemaVersion() && blockLength > m.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-m.SbeBlockLength()))
	}

	if m.FilterInActingVersion(actingVersion) {
		var FilterLength uint8
		if err := _m.ReadUint8(_r, &FilterLength); err != nil {
			return err
		}
		if cap(m.Filter) < int(FilterLength) {
			m.Filter = make([]uint8, FilterLength)
		}
		m.Filter = m.Filter[:FilterLength]
		if err := _m.ReadBytes(_r, m.Filter); err != nil {
			return err
		}
	}
	return nil
}

func (m *MyFiltersResponseSymbolFilters) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func MyFiltersResponseSymbolFiltersInit(m *MyFiltersResponseSymbolFilters) {
	return
}

func (m *MyFiltersResponseAssetFilters) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(m.Filter))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, m.Filter); err != nil {
		return err
	}
	return nil
}

func (m *MyFiltersResponseAssetFilters) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > m.SbeSchemaVersion() && blockLength > m.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-m.SbeBlockLength()))
	}

	if m.FilterInActingVersion(actingVersion) {
		var FilterLength uint8
		if err := _m.ReadUint8(_r, &FilterLength); err != nil {
			return err
		}
		if cap(m.Filter) < int(FilterLength) {
			m.Filter = make([]uint8, FilterLength)
		}
		m.Filter = m.Filter[:FilterLength]
		if err := _m.ReadBytes(_r, m.Filter); err != nil {
			return err
		}
	}
	return nil
}

func (m *MyFiltersResponseAssetFilters) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func MyFiltersResponseAssetFiltersInit(m *MyFiltersResponseAssetFilters) {
	return
}

func (*MyFiltersResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*MyFiltersResponse) SbeTemplateId() (templateId uint16) {
	return 105
}

func (*MyFiltersResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MyFiltersResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MyFiltersResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MyFiltersResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MyFiltersResponseExchangeFilters) FilterMetaAttribute(meta int) string {
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

func (*MyFiltersResponseExchangeFilters) FilterSinceVersion() uint16 {
	return 0
}

func (m *MyFiltersResponseExchangeFilters) FilterInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterSinceVersion()
}

func (*MyFiltersResponseExchangeFilters) FilterDeprecated() uint16 {
	return 0
}

func (MyFiltersResponseExchangeFilters) FilterCharacterEncoding() string {
	return "null"
}

func (MyFiltersResponseExchangeFilters) FilterHeaderLength() uint64 {
	return 1
}

func (*MyFiltersResponseSymbolFilters) FilterMetaAttribute(meta int) string {
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

func (*MyFiltersResponseSymbolFilters) FilterSinceVersion() uint16 {
	return 0
}

func (m *MyFiltersResponseSymbolFilters) FilterInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterSinceVersion()
}

func (*MyFiltersResponseSymbolFilters) FilterDeprecated() uint16 {
	return 0
}

func (MyFiltersResponseSymbolFilters) FilterCharacterEncoding() string {
	return "null"
}

func (MyFiltersResponseSymbolFilters) FilterHeaderLength() uint64 {
	return 1
}

func (*MyFiltersResponseAssetFilters) FilterMetaAttribute(meta int) string {
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

func (*MyFiltersResponseAssetFilters) FilterSinceVersion() uint16 {
	return 0
}

func (m *MyFiltersResponseAssetFilters) FilterInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterSinceVersion()
}

func (*MyFiltersResponseAssetFilters) FilterDeprecated() uint16 {
	return 0
}

func (MyFiltersResponseAssetFilters) FilterCharacterEncoding() string {
	return "null"
}

func (MyFiltersResponseAssetFilters) FilterHeaderLength() uint64 {
	return 1
}

func (*MyFiltersResponse) ExchangeFiltersId() uint16 {
	return 100
}

func (*MyFiltersResponse) ExchangeFiltersSinceVersion() uint16 {
	return 0
}

func (m *MyFiltersResponse) ExchangeFiltersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.ExchangeFiltersSinceVersion()
}

func (*MyFiltersResponse) ExchangeFiltersDeprecated() uint16 {
	return 0
}

func (*MyFiltersResponseExchangeFilters) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*MyFiltersResponseExchangeFilters) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MyFiltersResponse) SymbolFiltersId() uint16 {
	return 101
}

func (*MyFiltersResponse) SymbolFiltersSinceVersion() uint16 {
	return 0
}

func (m *MyFiltersResponse) SymbolFiltersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.SymbolFiltersSinceVersion()
}

func (*MyFiltersResponse) SymbolFiltersDeprecated() uint16 {
	return 0
}

func (*MyFiltersResponseSymbolFilters) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*MyFiltersResponseSymbolFilters) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MyFiltersResponse) AssetFiltersId() uint16 {
	return 102
}

func (*MyFiltersResponse) AssetFiltersSinceVersion() uint16 {
	return 0
}

func (m *MyFiltersResponse) AssetFiltersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.AssetFiltersSinceVersion()
}

func (*MyFiltersResponse) AssetFiltersDeprecated() uint16 {
	return 0
}

func (*MyFiltersResponseAssetFilters) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*MyFiltersResponseAssetFilters) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
