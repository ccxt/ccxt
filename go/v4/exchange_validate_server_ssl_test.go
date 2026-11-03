package ccxt

// ValidateServerSsl = false must let both REST and WS connect to a server whose
// certificate is self-signed, expired and issued for another hostname, while the
// default (true) must reject it. The shared server lives in
// ts/src/test/static/ssl/server.cjs (requires node on PATH).
//
// Run:  go -C go/v4 test -run ValidateServerSsl

import (
	"bufio"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

func startSslTestServer(t *testing.T) int {
	t.Helper()
	script, err := filepath.Abs(filepath.Join("..", "..", "ts", "src", "test", "static", "ssl", "server.cjs"))
	if err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command("node", script)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		t.Fatal(err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := cmd.Start(); err != nil {
		t.Skipf("node is required for the ssl test server: %v", err)
	}
	t.Cleanup(func() {
		stdin.Close()
		cmd.Process.Kill()
		cmd.Wait()
	})
	line, err := bufio.NewReader(stdout).ReadString('\n')
	if err != nil {
		t.Fatalf("ssl test server did not report its port: %v", err)
	}
	port, err := strconv.Atoi(strings.TrimSpace(line))
	if err != nil {
		t.Fatalf("ssl test server reported an invalid port %q", line)
	}
	return port
}

func newSslTestExchange(config map[string]any) *Exchange {
	ex := &Exchange{}
	ex.InitParent(config, ex.Describe().(map[string]any), ex)
	ex.DerivedExchange = ex
	return ex
}

func sslTestRest(ex *Exchange, url string) AsyncResult[any] {
	return <-ex.FetchAsync(url, "GET", nil, nil)
}

func sslTestWs(ex *Exchange, url string) error {
	client := ex.Client(url)
	err := client.CreateConnection()
	if err == nil && client.Connection != nil {
		client.Connection.Close()
	}
	return err
}

func TestValidateServerSsl(t *testing.T) {
	port := startSslTestServer(t)
	restUrl := "https://127.0.0.1:" + strconv.Itoa(port) + "/ping"
	wsUrl := "wss://127.0.0.1:" + strconv.Itoa(port) + "/ws"

	strict := newSslTestExchange(map[string]any{})
	if !strict.ValidateServerSsl {
		t.Fatal("ValidateServerSsl must default to true")
	}
	if res := sslTestRest(strict, restUrl); res.Err == nil {
		t.Fatalf("REST must fail against an invalid certificate by default, got %v", res.Value)
	}
	if err := sslTestWs(strict, wsUrl); err == nil {
		t.Fatal("WS must fail against an invalid certificate by default")
	}

	lax := newSslTestExchange(map[string]any{"validateServerSsl": false})
	if lax.ValidateServerSsl {
		t.Fatal("validateServerSsl: false must be read from the config")
	}
	res := sslTestRest(lax, restUrl)
	if res.Err != nil {
		t.Fatalf("REST must succeed with ValidateServerSsl = false: %v", res.Err)
	}
	if ok := SafeBool(res.Value, "ok", false); ok != true {
		t.Fatalf("unexpected REST response %v", res.Value)
	}
	if err := sslTestWs(lax, wsUrl); err != nil {
		t.Fatalf("WS must succeed with ValidateServerSsl = false: %v", err)
	}

	// flipping the field after construction must rebuild the cached transport
	flipped := newSslTestExchange(map[string]any{})
	if res := sslTestRest(flipped, restUrl); res.Err == nil {
		t.Fatal("REST must fail before the flag is flipped")
	}
	flipped.ValidateServerSsl = false
	if res := sslTestRest(flipped, restUrl); res.Err != nil {
		t.Fatalf("REST must honor ValidateServerSsl set after construction: %v", res.Err)
	}
}
