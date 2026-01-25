// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"reflect"
)

type RateLimitTypeEnum uint8
type RateLimitTypeValues struct {
	RawRequests      RateLimitTypeEnum
	Connections      RateLimitTypeEnum
	RequestWeight    RateLimitTypeEnum
	Orders           RateLimitTypeEnum
	NonRepresentable RateLimitTypeEnum
	NullValue        RateLimitTypeEnum
}

var RateLimitType = RateLimitTypeValues{0, 1, 2, 3, 254, 255}

func (r RateLimitTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(r)); err != nil {
		return err
	}
	return nil
}

func (r *RateLimitTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(r)); err != nil {
		return err
	}
	return nil
}

func (r RateLimitTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(RateLimitType)
	for idx := 0; idx < value.NumField(); idx++ {
		if r == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on RateLimitType, unknown enumeration value %d", r)
}

func (*RateLimitTypeEnum) EncodedLength() int64 {
	return 1
}

func (*RateLimitTypeEnum) RawRequestsSinceVersion() uint16 {
	return 0
}

func (r *RateLimitTypeEnum) RawRequestsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.RawRequestsSinceVersion()
}

func (*RateLimitTypeEnum) RawRequestsDeprecated() uint16 {
	return 0
}

func (*RateLimitTypeEnum) ConnectionsSinceVersion() uint16 {
	return 0
}

func (r *RateLimitTypeEnum) ConnectionsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.ConnectionsSinceVersion()
}

func (*RateLimitTypeEnum) ConnectionsDeprecated() uint16 {
	return 0
}

func (*RateLimitTypeEnum) RequestWeightSinceVersion() uint16 {
	return 0
}

func (r *RateLimitTypeEnum) RequestWeightInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.RequestWeightSinceVersion()
}

func (*RateLimitTypeEnum) RequestWeightDeprecated() uint16 {
	return 0
}

func (*RateLimitTypeEnum) OrdersSinceVersion() uint16 {
	return 0
}

func (r *RateLimitTypeEnum) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.OrdersSinceVersion()
}

func (*RateLimitTypeEnum) OrdersDeprecated() uint16 {
	return 0
}

func (*RateLimitTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (r *RateLimitTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.NonRepresentableSinceVersion()
}

func (*RateLimitTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}
