// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"io"
	"io/ioutil"
)

type UserDataStreamStopResponse struct {
}

func (u *UserDataStreamStopResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := u.RangeCheck(u.SbeSchemaVersion(), u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (u *UserDataStreamStopResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (u *UserDataStreamStopResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func UserDataStreamStopResponseInit(u *UserDataStreamStopResponse) {
	return
}

func (*UserDataStreamStopResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*UserDataStreamStopResponse) SbeTemplateId() (templateId uint16) {
	return 502
}

func (*UserDataStreamStopResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*UserDataStreamStopResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*UserDataStreamStopResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*UserDataStreamStopResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}
