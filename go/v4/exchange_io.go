package ccxt

import (
	"os"
	"path/filepath"
)

// fileRead reads a file and returns its contents
func (this *Exchange) FileRead(path string, args ...interface{}) string {
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return string(data)
}

// fileWrite writes data to a file
func (this *Exchange) FileWrite(path string, data string, args ...interface{}) bool {
	dir := filepath.Dir(path)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return false
		}
	}
	if err := os.WriteFile(path, []byte(data), 0644); err != nil {
		return false
	}
	return true
}

// fileExists checks if a file exists
func (this *Exchange) FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// fileDelete deletes a file
func (this *Exchange) FileDelete(path string) bool {
	if !this.FileExists(path) {
		return true
	}
	if err := os.Remove(path); err != nil {
		return false
	}
	return true
}

// directoryCreate creates a directory
func (this *Exchange) DirectoryCreate(path string) bool {
	if err := os.MkdirAll(path, 0755); err != nil {
		return false
	}
	return true
}

// directoryExists checks if a directory exists
func (this *Exchange) DirectoryExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.IsDir()
}

// directoryDelete deletes a directory and all its contents
func (this *Exchange) DirectoryDelete(path string) bool {
	if !this.DirectoryExists(path) {
		return true
	}
	if err := os.RemoveAll(path); err != nil {
		return false
	}
	return true
}
