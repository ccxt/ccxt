// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"io"
	"io/ioutil"
)

type UserDataStreamPingResponse struct {
}

func (u *UserDataStreamPingResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := u.RangeCheck(u.SbeSchemaVersion(), u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (u *UserDataStreamPingResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (u *UserDataStreamPingResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func UserDataStreamPingResponseInit(u *UserDataStreamPingResponse) {
	return
}

func (*UserDataStreamPingResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*UserDataStreamPingResponse) SbeTemplateId() (templateId uint16) {
	return 501
}

func (*UserDataStreamPingResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*UserDataStreamPingResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*UserDataStreamPingResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*UserDataStreamPingResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}
