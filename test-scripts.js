(async function () {
  var ccxt = require ('./ccxt')
  let ascendex = new ccxt.ascendex ({
      apiKey: '7pmzWDeo4fwFljq9Z3LUn2n8vjdYVBMg',
      secret: 'EucgqDiPwq3xotKQFNr3V34iJDKkuDHtigeMvB7LFDErPwA5yz6DbZtgMNI8XNxw',
  })
  console.log(await ascendex.fetchBalance())
  const position = await ascendex.fetchPositions();
  const {data} = position;
  const {contracts} = data;
  contracts.forEach(item => {
    console.log(item);
  })

  // console.log(await ascendex.setLeverage(43, 'BTC-PERP'))
  // console.log(await ascendex.setMarginMode('BTC-PERP', 'isolated'))

}) ();