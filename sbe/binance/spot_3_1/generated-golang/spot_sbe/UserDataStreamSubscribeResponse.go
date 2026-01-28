// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type UserDataStreamSubscribeResponse struct {
	SubscriptionId uint16
}

func (u *UserDataStreamSubscribeResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := u.RangeCheck(u.SbeSchemaVersion(), u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteUint16(_w, u.SubscriptionId); err != nil {
		return err
	}
	return nil
}

func (u *UserDataStreamSubscribeResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !u.SubscriptionIdInActingVersion(actingVersion) {
		u.SubscriptionId = u.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &u.SubscriptionId); err != nil {
			return err
		}
	}
	if actingVersion > u.SbeSchemaVersion() && blockLength > u.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-u.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := u.RangeCheck(actingVersion, u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (u *UserDataStreamSubscribeResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if u.SubscriptionIdInActingVersion(actingVersion) {
		if u.SubscriptionId != u.SubscriptionIdNullValue() && (u.SubscriptionId < u.SubscriptionIdMinValue() || u.SubscriptionId > u.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on u.SubscriptionId (%v < %v > %v)", u.SubscriptionIdMinValue(), u.SubscriptionId, u.SubscriptionIdMaxValue())
		}
	}
	return nil
}

func UserDataStreamSubscribeResponseInit(u *UserDataStreamSubscribeResponse) {
	u.SubscriptionId = math.MaxUint16
	return
}

func (*UserDataStreamSubscribeResponse) SbeBlockLength() (blockLength uint16) {
	return 2
}

func (*UserDataStreamSubscribeResponse) SbeTemplateId() (templateId uint16) {
	return 503
}

func (*UserDataStreamSubscribeResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*UserDataStreamSubscribeResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*UserDataStreamSubscribeResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*UserDataStreamSubscribeResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*UserDataStreamSubscribeResponse) SubscriptionIdId() uint16 {
	return 1
}

func (*UserDataStreamSubscribeResponse) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (u *UserDataStreamSubscribeResponse) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= u.SubscriptionIdSinceVersion()
}

func (*UserDataStreamSubscribeResponse) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*UserDataStreamSubscribeResponse) SubscriptionIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*UserDataStreamSubscribeResponse) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*UserDataStreamSubscribeResponse) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*UserDataStreamSubscribeResponse) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}
