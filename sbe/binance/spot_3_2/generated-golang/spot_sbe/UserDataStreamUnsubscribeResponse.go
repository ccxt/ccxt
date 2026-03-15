// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"io"
	"io/ioutil"
)

type UserDataStreamUnsubscribeResponse struct {
}

func (u *UserDataStreamUnsubscribeResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := u.RangeCheck(u.SbeSchemaVersion(), u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (u *UserDataStreamUnsubscribeResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (u *UserDataStreamUnsubscribeResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func UserDataStreamUnsubscribeResponseInit(u *UserDataStreamUnsubscribeResponse) {
	return
}

func (*UserDataStreamUnsubscribeResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*UserDataStreamUnsubscribeResponse) SbeTemplateId() (templateId uint16) {
	return 504
}

func (*UserDataStreamUnsubscribeResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*UserDataStreamUnsubscribeResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*UserDataStreamUnsubscribeResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*UserDataStreamUnsubscribeResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}
