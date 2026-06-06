// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type IcebergPartsFilter struct {
	FilterType  FilterTypeEnum
	FilterLimit int64
}

func (i *IcebergPartsFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := i.RangeCheck(i.SbeSchemaVersion(), i.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, i.FilterLimit); err != nil {
		return err
	}
	return nil
}

func (i *IcebergPartsFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	i.FilterType = FilterType.IcebergParts
	if !i.FilterLimitInActingVersion(actingVersion) {
		i.FilterLimit = i.FilterLimitNullValue()
	} else {
		if err := _m.ReadInt64(_r, &i.FilterLimit); err != nil {
			return err
		}
	}
	if actingVersion > i.SbeSchemaVersion() && blockLength > i.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-i.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := i.RangeCheck(actingVersion, i.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (i *IcebergPartsFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := i.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if i.FilterLimitInActingVersion(actingVersion) {
		if i.FilterLimit < i.FilterLimitMinValue() || i.FilterLimit > i.FilterLimitMaxValue() {
			return fmt.Errorf("Range check failed on i.FilterLimit (%v < %v > %v)", i.FilterLimitMinValue(), i.FilterLimit, i.FilterLimitMaxValue())
		}
	}
	return nil
}

func IcebergPartsFilterInit(i *IcebergPartsFilter) {
	i.FilterType = FilterType.IcebergParts
	return
}

func (*IcebergPartsFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*IcebergPartsFilter) SbeTemplateId() (templateId uint16) {
	return 7
}

func (*IcebergPartsFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*IcebergPartsFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*IcebergPartsFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*IcebergPartsFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*IcebergPartsFilter) FilterTypeId() uint16 {
	return 1
}

func (*IcebergPartsFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (i *IcebergPartsFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= i.FilterTypeSinceVersion()
}

func (*IcebergPartsFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*IcebergPartsFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*IcebergPartsFilter) FilterLimitId() uint16 {
	return 2
}

func (*IcebergPartsFilter) FilterLimitSinceVersion() uint16 {
	return 0
}

func (i *IcebergPartsFilter) FilterLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= i.FilterLimitSinceVersion()
}

func (*IcebergPartsFilter) FilterLimitDeprecated() uint16 {
	return 0
}

func (*IcebergPartsFilter) FilterLimitMetaAttribute(meta int) string {
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

func (*IcebergPartsFilter) FilterLimitMinValue() int64 {
	return math.MinInt64 + 1
}

func (*IcebergPartsFilter) FilterLimitMaxValue() int64 {
	return math.MaxInt64
}

func (*IcebergPartsFilter) FilterLimitNullValue() int64 {
	return math.MinInt64
}
