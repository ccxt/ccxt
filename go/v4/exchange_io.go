package ccxt

import (
	"os"
	"path/filepath"
)

// fileRead reads a file and returns its contents
func (this *Exchange) FileRead(path string, args ...interface{}) (interface{}, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return string(data), nil
}

// writeFile writes data to a file
func (this *Exchange) WriteFile(path string, data string, args ...interface{}) error {
	dir := filepath.Dir(path)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}
	return os.WriteFile(path, []byte(data), 0644)
}

// fileExists checks if a file exists
func (this *Exchange) FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// deleteFile deletes a file
func (this *Exchange) DeleteFile(path string) error {
	if !this.FileExists(path) {
		return nil
	}
	return os.Remove(path)
}

// directoryCreate creates a directory
func (this *Exchange) DirectoryCreate(path string) error {
	return os.MkdirAll(path, 0755)
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
func (this *Exchange) DirectoryDelete(path string) error {
	if !this.DirectoryExists(path) {
		return nil
	}
	return os.RemoveAll(path)
}
