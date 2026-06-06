// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type UserDataStreamSubscribeListenTokenResponse struct {
	SubscriptionId uint16
	ExpirationTime int64
}

func (u *UserDataStreamSubscribeListenTokenResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := u.RangeCheck(u.SbeSchemaVersion(), u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteUint16(_w, u.SubscriptionId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, u.ExpirationTime); err != nil {
		return err
	}
	return nil
}

func (u *UserDataStreamSubscribeListenTokenResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !u.SubscriptionIdInActingVersion(actingVersion) {
		u.SubscriptionId = u.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &u.SubscriptionId); err != nil {
			return err
		}
	}
	if !u.ExpirationTimeInActingVersion(actingVersion) {
		u.ExpirationTime = u.ExpirationTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &u.ExpirationTime); err != nil {
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

func (u *UserDataStreamSubscribeListenTokenResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if u.SubscriptionIdInActingVersion(actingVersion) {
		if u.SubscriptionId < u.SubscriptionIdMinValue() || u.SubscriptionId > u.SubscriptionIdMaxValue() {
			return fmt.Errorf("Range check failed on u.SubscriptionId (%v < %v > %v)", u.SubscriptionIdMinValue(), u.SubscriptionId, u.SubscriptionIdMaxValue())
		}
	}
	if u.ExpirationTimeInActingVersion(actingVersion) {
		if u.ExpirationTime < u.ExpirationTimeMinValue() || u.ExpirationTime > u.ExpirationTimeMaxValue() {
			return fmt.Errorf("Range check failed on u.ExpirationTime (%v < %v > %v)", u.ExpirationTimeMinValue(), u.ExpirationTime, u.ExpirationTimeMaxValue())
		}
	}
	return nil
}

func UserDataStreamSubscribeListenTokenResponseInit(u *UserDataStreamSubscribeListenTokenResponse) {
	return
}

func (*UserDataStreamSubscribeListenTokenResponse) SbeBlockLength() (blockLength uint16) {
	return 10
}

func (*UserDataStreamSubscribeListenTokenResponse) SbeTemplateId() (templateId uint16) {
	return 505
}

func (*UserDataStreamSubscribeListenTokenResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*UserDataStreamSubscribeListenTokenResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*UserDataStreamSubscribeListenTokenResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*UserDataStreamSubscribeListenTokenResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*UserDataStreamSubscribeListenTokenResponse) SubscriptionIdId() uint16 {
	return 1
}

func (*UserDataStreamSubscribeListenTokenResponse) SubscriptionIdSinceVersion() uint16 {
	return 0
}

func (u *UserDataStreamSubscribeListenTokenResponse) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= u.SubscriptionIdSinceVersion()
}

func (*UserDataStreamSubscribeListenTokenResponse) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*UserDataStreamSubscribeListenTokenResponse) SubscriptionIdMetaAttribute(meta int) string {
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

func (*UserDataStreamSubscribeListenTokenResponse) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*UserDataStreamSubscribeListenTokenResponse) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*UserDataStreamSubscribeListenTokenResponse) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*UserDataStreamSubscribeListenTokenResponse) ExpirationTimeId() uint16 {
	return 2
}

func (*UserDataStreamSubscribeListenTokenResponse) ExpirationTimeSinceVersion() uint16 {
	return 0
}

func (u *UserDataStreamSubscribeListenTokenResponse) ExpirationTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= u.ExpirationTimeSinceVersion()
}

func (*UserDataStreamSubscribeListenTokenResponse) ExpirationTimeDeprecated() uint16 {
	return 0
}

func (*UserDataStreamSubscribeListenTokenResponse) ExpirationTimeMetaAttribute(meta int) string {
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

func (*UserDataStreamSubscribeListenTokenResponse) ExpirationTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*UserDataStreamSubscribeListenTokenResponse) ExpirationTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*UserDataStreamSubscribeListenTokenResponse) ExpirationTimeNullValue() int64 {
	return math.MinInt64
}
