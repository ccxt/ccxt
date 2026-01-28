// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"io"
)

type OrderTypes [16]bool
type OrderTypesChoiceValue uint8
type OrderTypesChoiceValues struct {
	Market           OrderTypesChoiceValue
	Limit            OrderTypesChoiceValue
	StopLoss         OrderTypesChoiceValue
	StopLossLimit    OrderTypesChoiceValue
	TakeProfit       OrderTypesChoiceValue
	TakeProfitLimit  OrderTypesChoiceValue
	LimitMaker       OrderTypesChoiceValue
	NonRepresentable OrderTypesChoiceValue
}

var OrderTypesChoice = OrderTypesChoiceValues{0, 1, 2, 3, 4, 5, 6, 15}

func (o *OrderTypes) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	var wireval uint16 = 0
	for k, v := range o {
		if v {
			wireval |= (1 << uint(k))
		}
	}
	return _m.WriteUint16(_w, wireval)
}

func (o *OrderTypes) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	var wireval uint16

	if err := _m.ReadUint16(_r, &wireval); err != nil {
		return err
	}

	var idx uint
	for idx = 0; idx < 16; idx++ {
		o[idx] = (wireval & (1 << idx)) > 0
	}
	return nil
}

func (OrderTypes) EncodedLength() int64 {
	return 2
}

func (*OrderTypes) MarketSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) MarketInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.MarketSinceVersion()
}

func (*OrderTypes) MarketDeprecated() uint16 {
	return 0
}

func (*OrderTypes) LimitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) LimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LimitSinceVersion()
}

func (*OrderTypes) LimitDeprecated() uint16 {
	return 0
}

func (*OrderTypes) StopLossSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) StopLossInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopLossSinceVersion()
}

func (*OrderTypes) StopLossDeprecated() uint16 {
	return 0
}

func (*OrderTypes) StopLossLimitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) StopLossLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopLossLimitSinceVersion()
}

func (*OrderTypes) StopLossLimitDeprecated() uint16 {
	return 0
}

func (*OrderTypes) TakeProfitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) TakeProfitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TakeProfitSinceVersion()
}

func (*OrderTypes) TakeProfitDeprecated() uint16 {
	return 0
}

func (*OrderTypes) TakeProfitLimitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) TakeProfitLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TakeProfitLimitSinceVersion()
}

func (*OrderTypes) TakeProfitLimitDeprecated() uint16 {
	return 0
}

func (*OrderTypes) LimitMakerSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) LimitMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LimitMakerSinceVersion()
}

func (*OrderTypes) LimitMakerDeprecated() uint16 {
	return 0
}

func (*OrderTypes) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (o *OrderTypes) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NonRepresentableSinceVersion()
}

func (*OrderTypes) NonRepresentableDeprecated() uint16 {
	return 0
}
