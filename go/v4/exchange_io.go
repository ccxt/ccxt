package ccxt

import (
	"os"
	"path/filepath"
	"strings"
)

// fileRead reads a file and returns its contents
func (this *Exchange) FileRead(path interface{}, args ...interface{}) string {
	this.EnsureCcxtFile(path)
	pathStr := path.(string)
	data, err := os.ReadFile(pathStr)
	if err != nil {
		return ""
	}
	return string(data)
}

// fileWrite writes data to a file
func (this *Exchange) FileWrite(path interface{}, data interface{}, args ...interface{}) bool {
	this.EnsureCcxtFile(path)
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
	this.EnsureCcxtFile(path)
	pathStr := path.(string)
	_, err := os.Stat(pathStr)
	return err == nil
}

// EnsureCcxtFile ensures the file path is ccxt file, so users would be safeguarded
func (this *Exchange) EnsureCcxtFile(path interface{}) {
	pathStr := path.(string)
	tempDir := this.GetTempDir()
	if !strings.Contains(pathStr, tempDir) || !strings.Contains(pathStr, "ccxt") {
		panic("invalid file path")
	}
}

// GetTempDir returns the temporary directory
func (this *Exchange) GetTempDir() string {
	return os.TempDir() + string(filepath.Separator)
}
