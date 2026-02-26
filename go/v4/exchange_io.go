package ccxt

import (
	"os"
	"path/filepath"
	"strings"
)

// fileRead reads a file and returns its contents
func (this *Exchange) FileRead(path interface{}, args ...interface{}) string {
	this.EnsureWhitelistedFile(path)
	pathStr := path.(string)
	data, err := os.ReadFile(pathStr)
	if err != nil {
		return ""
	}
	return string(data)
}

// fileWrite writes data to a file
func (this *Exchange) FileWrite(path interface{}, data interface{}, args ...interface{}) bool {
	this.EnsureWhitelistedFile(path)
	pathStr := path.(string)
	dataStr := data.(string)
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

// fileExists checks if a file exists
func (this *Exchange) FileExists(path interface{}) bool {
	this.EnsureWhitelistedFile(path)
	pathStr := path.(string)
	_, err := os.Stat(pathStr)
	return err == nil
}

// EnsureWhitelistedFile ensures the file path is ccxt file, so users would be safeguarded
func (this *Exchange) EnsureWhitelistedFile(filePath interface{}) {
	tempDir := this.GetTempDir()
	sanitized, err := filepath.Abs(filePath.(string))
	if err != nil {
		panic("invalid file path: " + filePath.(string))
	}
	if strings.HasPrefix(sanitized, tempDir) && strings.HasSuffix(sanitized, ".ccxtfile") {
		return
	}
	panic("invalid file path: " + filePath.(string))
}

// GetTempDir returns the temporary directory
func (this *Exchange) GetTempDir() string {
	tmp, _ := filepath.Abs(os.TempDir())
	if !strings.HasSuffix(tmp, string(os.PathSeparator)) {
		tmp += string(os.PathSeparator)
	}
	return tmp
}
