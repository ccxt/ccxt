// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"io"
)

type AllowedSelfTradePreventionModes [8]bool
type AllowedSelfTradePreventionModesChoiceValue uint8
type AllowedSelfTradePreventionModesChoiceValues struct {
	None             AllowedSelfTradePreventionModesChoiceValue
	ExpireTaker      AllowedSelfTradePreventionModesChoiceValue
	ExpireMaker      AllowedSelfTradePreventionModesChoiceValue
	ExpireBoth       AllowedSelfTradePreventionModesChoiceValue
	Decrement        AllowedSelfTradePreventionModesChoiceValue
	NonRepresentable AllowedSelfTradePreventionModesChoiceValue
}

var AllowedSelfTradePreventionModesChoice = AllowedSelfTradePreventionModesChoiceValues{0, 1, 2, 3, 4, 7}

func (a *AllowedSelfTradePreventionModes) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	var wireval uint8 = 0
	for k, v := range a {
		if v {
			wireval |= (1 << uint(k))
		}
	}
	return _m.WriteUint8(_w, wireval)
}

func (a *AllowedSelfTradePreventionModes) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	var wireval uint8

	if err := _m.ReadUint8(_r, &wireval); err != nil {
		return err
	}

	var idx uint
	for idx = 0; idx < 8; idx++ {
		a[idx] = (wireval & (1 << idx)) > 0
	}
	return nil
}

func (AllowedSelfTradePreventionModes) EncodedLength() int64 {
	return 1
}

func (*AllowedSelfTradePreventionModes) NoneSinceVersion() uint16 {
	return 0
}

func (a *AllowedSelfTradePreventionModes) NoneInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.NoneSinceVersion()
}

func (*AllowedSelfTradePreventionModes) NoneDeprecated() uint16 {
	return 0
}

func (*AllowedSelfTradePreventionModes) ExpireTakerSinceVersion() uint16 {
	return 0
}

func (a *AllowedSelfTradePreventionModes) ExpireTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.ExpireTakerSinceVersion()
}

func (*AllowedSelfTradePreventionModes) ExpireTakerDeprecated() uint16 {
	return 0
}

func (*AllowedSelfTradePreventionModes) ExpireMakerSinceVersion() uint16 {
	return 0
}

func (a *AllowedSelfTradePreventionModes) ExpireMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.ExpireMakerSinceVersion()
}

func (*AllowedSelfTradePreventionModes) ExpireMakerDeprecated() uint16 {
	return 0
}

func (*AllowedSelfTradePreventionModes) ExpireBothSinceVersion() uint16 {
	return 0
}

func (a *AllowedSelfTradePreventionModes) ExpireBothInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.ExpireBothSinceVersion()
}

func (*AllowedSelfTradePreventionModes) ExpireBothDeprecated() uint16 {
	return 0
}

func (*AllowedSelfTradePreventionModes) DecrementSinceVersion() uint16 {
	return 0
}

func (a *AllowedSelfTradePreventionModes) DecrementInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.DecrementSinceVersion()
}

func (*AllowedSelfTradePreventionModes) DecrementDeprecated() uint16 {
	return 0
}

func (*AllowedSelfTradePreventionModes) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (a *AllowedSelfTradePreventionModes) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.NonRepresentableSinceVersion()
}

func (*AllowedSelfTradePreventionModes) NonRepresentableDeprecated() uint16 {
	return 0
}
