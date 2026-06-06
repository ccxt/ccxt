// Generated SBE (Simple Binary Encoding) message codec

package com_okx_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type SideEnumEnum int8
type SideEnumValues struct {
	SELL      SideEnumEnum
	BUY       SideEnumEnum
	NullValue SideEnumEnum
}

var SideEnum = SideEnumValues{0, 1, -128}

func (s SideEnumEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, int8(s)); err != nil {
		return err
	}
	return nil
}

func (s *SideEnumEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadInt8(_r, (*int8)(s)); err != nil {
		return err
	}
	return nil
}

func (s SideEnumEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(SideEnum)
	for idx := 0; idx < value.NumField(); idx++ {
		if s == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on SideEnum, unknown enumeration value %d", s)
}

func (*SideEnumEnum) EncodedLength() int64 {
	return 1
}

func (*SideEnumEnum) SELLSinceVersion() uint16 {
	return 0
}

func (s *SideEnumEnum) SELLInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.SELLSinceVersion()
}

func (*SideEnumEnum) SELLDeprecated() uint16 {
	return 0
}

func (*SideEnumEnum) BUYSinceVersion() uint16 {
	return 0
}

func (s *SideEnumEnum) BUYInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.BUYSinceVersion()
}

func (*SideEnumEnum) BUYDeprecated() uint16 {
	return 0
}
