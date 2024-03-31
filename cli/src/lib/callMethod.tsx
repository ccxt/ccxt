import React from 'react';
import { render, Text } from 'ink';
import Loading from '../components/Loading.js';


export default async function callMethod(exchange, methodName, params) {
    const {rerender} = render(<Loading text=" Loading Markets" />);
    await exchange.loadMarkets();

    rerender(<Loading text=" Calling method" />);
    
    const data = await exchange[methodName](...params)
    rerender (<Text>{JSON.stringify(data)}</Text>)
}
