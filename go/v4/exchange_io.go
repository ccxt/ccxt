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
	this.EnsureWhitelistedFile(path)
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

// EnsureWhitelistedFile ensures the file path is ccxt file, so users would be safeguarded
func (this *BaseExchange) EnsureWhitelistedFile(filePath any) {
	sanitized, err := filepath.Abs(derefScalar(filePath).(string))
	if err != nil {
		panic("invalid file path: " + derefScalar(filePath).(string))
	}
	allowedExtensions := []string{".ccxtfile", ".pem"}
	for _, ext := range allowedExtensions {
		if strings.HasSuffix(sanitized, ext) {
			return
		}
	}
	panic("invalid file path: " + derefScalar(filePath).(string) + ", allowed extensions are: " + strings.Join(allowedExtensions, ", "))
}

// GetTempDir returns the temporary directory
func (this *BaseExchange) GetTempDir() string {
	tmp, _ := filepath.Abs(os.TempDir())
	if !strings.HasSuffix(tmp, string(os.PathSeparator)) {
		tmp += string(os.PathSeparator)
	}
	return tmp
}
