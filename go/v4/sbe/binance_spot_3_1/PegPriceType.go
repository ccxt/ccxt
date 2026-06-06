// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"reflect"
)

type PegPriceTypeEnum uint8
type PegPriceTypeValues struct {
	PrimaryPeg       PegPriceTypeEnum
	MarketPeg        PegPriceTypeEnum
	NonRepresentable PegPriceTypeEnum
	NullValue        PegPriceTypeEnum
}

var PegPriceType = PegPriceTypeValues{1, 2, 254, 255}

func (p PegPriceTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(p)); err != nil {
		return err
	}
	return nil
}

func (p *PegPriceTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(p)); err != nil {
		return err
	}
	return nil
}

func (p PegPriceTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(PegPriceType)
	for idx := 0; idx < value.NumField(); idx++ {
		if p == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on PegPriceType, unknown enumeration value %d", p)
}

func (*PegPriceTypeEnum) EncodedLength() int64 {
	return 1
}

func (*PegPriceTypeEnum) PrimaryPegSinceVersion() uint16 {
	return 0
}

func (p *PegPriceTypeEnum) PrimaryPegInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.PrimaryPegSinceVersion()
}

func (*PegPriceTypeEnum) PrimaryPegDeprecated() uint16 {
	return 0
}

func (*PegPriceTypeEnum) MarketPegSinceVersion() uint16 {
	return 0
}

func (p *PegPriceTypeEnum) MarketPegInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.MarketPegSinceVersion()
}

func (*PegPriceTypeEnum) MarketPegDeprecated() uint16 {
	return 0
}

func (*PegPriceTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (p *PegPriceTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.NonRepresentableSinceVersion()
}

func (*PegPriceTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}
