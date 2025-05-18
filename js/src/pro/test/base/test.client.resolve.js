import assert from 'assert';
import Client from '../../../base/ws/Client';
function test(description, fn) {
    try {
        fn();
        console.log(`✓ ${description}`);
    }
    catch (error) {
        console.error(`✗ ${description}`);
        console.error(error);
    }
}
test('resolve with a future', async () => {
    const client = new Client('url', undefined, undefined, undefined, undefined);
    const messageHash = 'testHash';
    const result = 'testResult';
    const future = client.future(messageHash);
    client.resolve(result, messageHash);
    assert.strictEqual(client.futures[messageHash], undefined, 'Future was not removed from futures list');
    assert.equal(await future, result, 'Future did not resolve with the correct message');
});
test('resolve future after message in the messageQueue', async () => {
    const client = new Client('url', undefined, undefined, undefined, undefined);
    const messageHash = 'testHash';
    client.messageQueue[messageHash] = ['msg1'];
    const future = client.future(messageHash);
    client.resolve('msg2', messageHash);
    assert.strictEqual(client.futures[messageHash], undefined, 'Future was not removed from futures list');
    assert.strictEqual(client.messageQueue[messageHash].length, 1, 'Message queue was not updated');
    assert.equal(await future, 'msg1', 'Future did not resolve with the correct message');
    const future2 = client.future(messageHash);
    assert.equal(await future2, 'msg2', 'Future did not resolve with the correct message');
});
