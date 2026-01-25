// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"errors"
	"io"
	"io/ioutil"
	"unicode/utf8"
)

type UserDataStreamStartResponse struct {
	ListenKey []uint8
}

func (u *UserDataStreamStartResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := u.RangeCheck(u.SbeSchemaVersion(), u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(u.ListenKey))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, u.ListenKey); err != nil {
		return err
	}
	return nil
}

func (u *UserDataStreamStartResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > u.SbeSchemaVersion() && blockLength > u.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-u.SbeBlockLength()))
	}

	if u.ListenKeyInActingVersion(actingVersion) {
		var ListenKeyLength uint8
		if err := _m.ReadUint8(_r, &ListenKeyLength); err != nil {
			return err
		}
		if cap(u.ListenKey) < int(ListenKeyLength) {
			u.ListenKey = make([]uint8, ListenKeyLength)
		}
		u.ListenKey = u.ListenKey[:ListenKeyLength]
		if err := _m.ReadBytes(_r, u.ListenKey); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := u.RangeCheck(actingVersion, u.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (u *UserDataStreamStartResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if !utf8.Valid(u.ListenKey[:]) {
		return errors.New("u.ListenKey failed UTF-8 validation")
	}
	return nil
}

func UserDataStreamStartResponseInit(u *UserDataStreamStartResponse) {
	return
}

func (*UserDataStreamStartResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*UserDataStreamStartResponse) SbeTemplateId() (templateId uint16) {
	return 500
}

func (*UserDataStreamStartResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*UserDataStreamStartResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*UserDataStreamStartResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*UserDataStreamStartResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*UserDataStreamStartResponse) ListenKeyMetaAttribute(meta int) string {
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

func (*UserDataStreamStartResponse) ListenKeySinceVersion() uint16 {
	return 0
}

func (u *UserDataStreamStartResponse) ListenKeyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= u.ListenKeySinceVersion()
}

func (*UserDataStreamStartResponse) ListenKeyDeprecated() uint16 {
	return 0
}

func (UserDataStreamStartResponse) ListenKeyCharacterEncoding() string {
	return "UTF-8"
}

func (UserDataStreamStartResponse) ListenKeyHeaderLength() uint64 {
	return 1
}
