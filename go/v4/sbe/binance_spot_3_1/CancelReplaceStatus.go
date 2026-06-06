// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"reflect"
)

type CancelReplaceStatusEnum uint8
type CancelReplaceStatusValues struct {
	Success          CancelReplaceStatusEnum
	Failure          CancelReplaceStatusEnum
	NotAttempted     CancelReplaceStatusEnum
	NonRepresentable CancelReplaceStatusEnum
	NullValue        CancelReplaceStatusEnum
}

var CancelReplaceStatus = CancelReplaceStatusValues{0, 1, 2, 254, 255}

func (c CancelReplaceStatusEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(c)); err != nil {
		return err
	}
	return nil
}

func (c *CancelReplaceStatusEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(c)); err != nil {
		return err
	}
	return nil
}

func (c CancelReplaceStatusEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(CancelReplaceStatus)
	for idx := 0; idx < value.NumField(); idx++ {
		if c == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on CancelReplaceStatus, unknown enumeration value %d", c)
}

func (*CancelReplaceStatusEnum) EncodedLength() int64 {
	return 1
}

func (*CancelReplaceStatusEnum) SuccessSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceStatusEnum) SuccessInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SuccessSinceVersion()
}

func (*CancelReplaceStatusEnum) SuccessDeprecated() uint16 {
	return 0
}

func (*CancelReplaceStatusEnum) FailureSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceStatusEnum) FailureInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.FailureSinceVersion()
}

func (*CancelReplaceStatusEnum) FailureDeprecated() uint16 {
	return 0
}

func (*CancelReplaceStatusEnum) NotAttemptedSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceStatusEnum) NotAttemptedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.NotAttemptedSinceVersion()
}

func (*CancelReplaceStatusEnum) NotAttemptedDeprecated() uint16 {
	return 0
}

func (*CancelReplaceStatusEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceStatusEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.NonRepresentableSinceVersion()
}

func (*CancelReplaceStatusEnum) NonRepresentableDeprecated() uint16 {
	return 0
}
