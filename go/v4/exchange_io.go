package ccxt

import (
	"os"
	"path/filepath"
	"strings"
)

// InitFileSystemAsync is a no-op: file io is synchronous in go, nothing to load before the first ReadFile call
func (this *BaseExchange) InitFileSystemAsync(args ...any) <-chan AsyncResult[any] {
	ch := make(chan AsyncResult[any], 1)
	ch <- AsyncResult[any]{Value: nil}
	close(ch)
	return ch
}

// ReadFile reads a file and returns its contents
func (this *BaseExchange) ReadFile(path any, args ...any) string {
	this.EnsureWhitelistedFile(path)
	pathStr := derefScalar(path).(string)
	data, err := os.ReadFile(pathStr)
	if err != nil {
		return ""
	}
	return string(data)
}

// WriteFile writes data to a file
func (this *BaseExchange) WriteFile(path any, data any, args ...any) bool {
	this.EnsureWhitelistedFile(path, true)
	pathStr := derefScalar(path).(string)
	dataStr := derefScalar(data).(string)
	dir := filepath.Dir(pathStr)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return false
		}
	}
	if err := os.WriteFile(pathStr, []byte(dataStr), 0644); err != nil {
		return false
	}
	return true
}

// ExistsFile checks if a file exists
func (this *BaseExchange) ExistsFile(path any) bool {
	this.EnsureWhitelistedFile(path)
	pathStr := derefScalar(path).(string)
	_, err := os.Stat(pathStr)
	return err == nil
}

// EnsureWhitelistedFile ensures the file path is permitted, so users would be safeguarded:
// .ccxtfile (cache files) can be read and written, but only inside the temp dir
// .pem (user-supplied keys, e.g. the ibkr oauth keys) can be read from any location, but never written
// the optional second argument is true when the file is about to be written
func (this *BaseExchange) EnsureWhitelistedFile(filePath any, args ...any) {
	isWrite := false
	if len(args) > 0 {
		if b, ok := args[0].(bool); ok {
			isWrite = b
		}
	}
	sanitized, err := filepath.Abs(derefScalar(filePath).(string))
	if err != nil {
		panic("invalid file path: " + derefScalar(filePath).(string))
	}
	if strings.HasSuffix(sanitized, ".ccxtfile") {
		if strings.HasPrefix(sanitized, this.GetTempDir()) {
			return
		}
	} else if strings.HasSuffix(sanitized, ".pem") && !isWrite {
		return
	}
	panic("invalid file path: " + derefScalar(filePath).(string) + ", allowed are .ccxtfile (inside the temp dir) and read-only .pem")
}

// GetTempDir returns the temporary directory
func (this *BaseExchange) GetTempDir() string {
	tmp, _ := filepath.Abs(os.TempDir())
	if !strings.HasSuffix(tmp, string(os.PathSeparator)) {
		tmp += string(os.PathSeparator)
	}
	return tmp
}
