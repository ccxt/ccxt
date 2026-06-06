// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"reflect"
)

type ListOrderStatusEnum uint8
type ListOrderStatusValues struct {
	Canceling        ListOrderStatusEnum
	Executing        ListOrderStatusEnum
	AllDone          ListOrderStatusEnum
	Reject           ListOrderStatusEnum
	NonRepresentable ListOrderStatusEnum
	NullValue        ListOrderStatusEnum
}

var ListOrderStatus = ListOrderStatusValues{0, 1, 2, 3, 254, 255}

func (l ListOrderStatusEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(l)); err != nil {
		return err
	}
	return nil
}

func (l *ListOrderStatusEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(l)); err != nil {
		return err
	}
	return nil
}

func (l ListOrderStatusEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(ListOrderStatus)
	for idx := 0; idx < value.NumField(); idx++ {
		if l == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on ListOrderStatus, unknown enumeration value %d", l)
}

func (*ListOrderStatusEnum) EncodedLength() int64 {
	return 1
}

func (*ListOrderStatusEnum) CancelingSinceVersion() uint16 {
	return 0
}

func (l *ListOrderStatusEnum) CancelingInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.CancelingSinceVersion()
}

func (*ListOrderStatusEnum) CancelingDeprecated() uint16 {
	return 0
}

func (*ListOrderStatusEnum) ExecutingSinceVersion() uint16 {
	return 0
}

func (l *ListOrderStatusEnum) ExecutingInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ExecutingSinceVersion()
}

func (*ListOrderStatusEnum) ExecutingDeprecated() uint16 {
	return 0
}

func (*ListOrderStatusEnum) AllDoneSinceVersion() uint16 {
	return 0
}

func (l *ListOrderStatusEnum) AllDoneInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.AllDoneSinceVersion()
}

func (*ListOrderStatusEnum) AllDoneDeprecated() uint16 {
	return 0
}

func (*ListOrderStatusEnum) RejectSinceVersion() uint16 {
	return 0
}

func (l *ListOrderStatusEnum) RejectInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.RejectSinceVersion()
}

func (*ListOrderStatusEnum) RejectDeprecated() uint16 {
	return 0
}

func (*ListOrderStatusEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (l *ListOrderStatusEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.NonRepresentableSinceVersion()
}

func (*ListOrderStatusEnum) NonRepresentableDeprecated() uint16 {
	return 0
}
