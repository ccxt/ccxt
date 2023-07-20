
import ccxt from '../../js/ccxt.js';
import ololog from 'ololog'

const log  = ololog.configure ({ locate: false })

const binance = new ccxt['binance'] ()
const recvWindow = binance.options.recvWindow
const aheadWindow = 1000

async function test () {
    const localStartTime = Date.now ()
    const { serverTime } = await binance.publicGetTime ()
    const localFinishTime = Date.now ()
    const estimatedLandingTime = (localFinishTime + localStartTime) / 2

    const diff = serverTime - estimatedLandingTime

    log (`request departure time:     ${binance.iso8601 (localStartTime)}`)
    log (`response arrival time:      ${binance.iso8601 (localFinishTime)}`)
    log (`server time:                ${binance.iso8601 (serverTime)}`)
    log (`request landing time (est): ${binance.iso8601 (estimatedLandingTime)}, ${Math.abs (diff)} ms ${Math.sign (diff) > 0 ? 'behind' : 'ahead of'} server`)
    log ('\n')

    if (diff < -aheadWindow) {
        log.error.red (`your request will likely be rejected if local time is ahead of the server's time for more than ${aheadWindow} ms \n`)
    }

    if (diff > recvWindow) {
        log.error.red (`your request will likely be rejected if local time is behind server time for more than ${recvWindow} ms\n`)
    }
}

test ();
