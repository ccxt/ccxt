// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type ListStatusTypeEnum uint8
type ListStatusTypeValues struct {
	Response         ListStatusTypeEnum
	ExecStarted      ListStatusTypeEnum
	AllDone          ListStatusTypeEnum
	Updated          ListStatusTypeEnum
	NonRepresentable ListStatusTypeEnum
	NullValue        ListStatusTypeEnum
}

var ListStatusType = ListStatusTypeValues{0, 1, 2, 3, 254, 255}

func (l ListStatusTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(l)); err != nil {
		return err
	}
	return nil
}

func (l *ListStatusTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(l)); err != nil {
		return err
	}
	return nil
}

func (l ListStatusTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(ListStatusType)
	for idx := 0; idx < value.NumField(); idx++ {
		if l == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on ListStatusType, unknown enumeration value %d", l)
}

func (*ListStatusTypeEnum) EncodedLength() int64 {
	return 1
}

func (*ListStatusTypeEnum) ResponseSinceVersion() uint16 {
	return 0
}

func (l *ListStatusTypeEnum) ResponseInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ResponseSinceVersion()
}

func (*ListStatusTypeEnum) ResponseDeprecated() uint16 {
	return 0
}

func (*ListStatusTypeEnum) ExecStartedSinceVersion() uint16 {
	return 0
}

func (l *ListStatusTypeEnum) ExecStartedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ExecStartedSinceVersion()
}

func (*ListStatusTypeEnum) ExecStartedDeprecated() uint16 {
	return 0
}

func (*ListStatusTypeEnum) AllDoneSinceVersion() uint16 {
	return 0
}

func (l *ListStatusTypeEnum) AllDoneInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.AllDoneSinceVersion()
}

func (*ListStatusTypeEnum) AllDoneDeprecated() uint16 {
	return 0
}

func (*ListStatusTypeEnum) UpdatedSinceVersion() uint16 {
	return 0
}

func (l *ListStatusTypeEnum) UpdatedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.UpdatedSinceVersion()
}

func (*ListStatusTypeEnum) UpdatedDeprecated() uint16 {
	return 0
}

func (*ListStatusTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (l *ListStatusTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.NonRepresentableSinceVersion()
}

func (*ListStatusTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}
