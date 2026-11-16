package base

// hand-written go-only test (not transpiled): ValidateServerSsl = false must let both REST and WS
// connect to a server whose certificate is self-signed, expired and issued for another hostname,
// while the default (true) must reject it. The shared server lives in
// ts/src/test/static/ssl/server.cjs (requires node on PATH, the test is skipped without it).

import (
	"bufio"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

// startSslTestServer starts the shared invalid-certificate server, returns its port and a stop function,
// the port is 0 when node is not available
func startSslTestServer() (int, func()) {
	script, err := filepath.Abs(filepath.Join(GetRootDir(), "ts", "src", "test", "static", "ssl", "server.cjs"))
	Assert(err == nil, "could not resolve the ssl test server path")
	cmd := exec.Command("node", script)
	stdin, err := cmd.StdinPipe()
	Assert(err == nil, "could not open the ssl test server stdin")
	stdout, err := cmd.StdoutPipe()
	Assert(err == nil, "could not open the ssl test server stdout")
	if err := cmd.Start(); err != nil {
		Print("validateServerSsl test skipped, node is required for the ssl test server: " + err.Error())
		return 0, func() {}
	}
	stop := func() {
		stdin.Close()
		cmd.Process.Kill()
		cmd.Wait()
	}
	line, err := bufio.NewReader(stdout).ReadString('\n')
	if err != nil {
		stop()
		panic("ssl test server did not report its port: " + err.Error())
	}
	port, err := strconv.Atoi(strings.TrimSpace(line))
	if err != nil {
		stop()
		panic("ssl test server reported an invalid port: " + line)
	}
	return port, stop
}

func newSslTestExchange(config map[string]any) *ccxt.Exchange {
	exchange := ccxt.NewExchange().(*ccxt.Exchange)
	exchange.DerivedExchange = exchange
	exchange.InitParent(config, map[string]any{}, exchange)
	return exchange
}

func sslTestRest(exchange *ccxt.Exchange, url string) ccxt.AsyncResult[any] {
	return <-exchange.FetchAsync(url, "GET", nil, nil)
}

func sslTestWs(exchange *ccxt.Exchange, url string) error {
	client := exchange.Client(url)
	err := client.CreateConnection()
	if err == nil {
		client.Close()
	}
	return err
}

func TestValidateServerSsl() {
	port, stop := startSslTestServer()
	if port == 0 {
		return
	}
	defer stop()
	restUrl := "https://127.0.0.1:" + strconv.Itoa(port) + "/ping"
	wsUrl := "wss://127.0.0.1:" + strconv.Itoa(port) + "/ws"
	// default: certificate validation on, both transports must fail
	strict := newSslTestExchange(map[string]any{})
	Assert(strict.ValidateServerSsl, "ValidateServerSsl must default to true")
	Assert(sslTestRest(strict, restUrl).Err != nil, "REST must fail against an invalid certificate by default")
	Assert(sslTestWs(strict, wsUrl) != nil, "WS must fail against an invalid certificate by default")
	// validateServerSsl: false from the config, both transports must connect
	lax := newSslTestExchange(map[string]any{"validateServerSsl": false})
	Assert(!lax.ValidateServerSsl, "validateServerSsl: false must be read from the config")
	res := sslTestRest(lax, restUrl)
	Assert(res.Err == nil, "REST must succeed with ValidateServerSsl = false")
	Assert(ccxt.SafeBool(res.Value, "ok", false) == true, "unexpected REST response from the ssl test server")
	Assert(sslTestWs(lax, wsUrl) == nil, "WS must succeed with ValidateServerSsl = false")
	// flipping the flag after construction must rebuild the cached transport
	flipped := newSslTestExchange(map[string]any{})
	Assert(sslTestRest(flipped, restUrl).Err != nil, "REST must fail before the flag is flipped")
	flipped.SetValidateServerSsl(false)
	Assert(sslTestRest(flipped, restUrl).Err == nil, "REST must honor ValidateServerSsl set after construction")
}
