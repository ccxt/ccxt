package ccxt

import (
	"os"
	"path/filepath"
)

// fileRead reads a file and returns its contents
func (this *Exchange) FileRead(path interface{}, args ...interface{}) string {
	pathStr := path.(string)
	data, err := os.ReadFile(pathStr)
	if err != nil {
		return ""
	}
	return string(data)
}

// fileWrite writes data to a file
func (this *Exchange) FileWrite(path interface{}, data interface{}, args ...interface{}) bool {
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
	pathStr := path.(string)
	_, err := os.Stat(pathStr)
	return err == nil
}

// // fileDelete deletes a file
// func (this *Exchange) FileDelete(path interface{}) bool {
// 	if !this.FileExists(path) {
// 		return true
// 	}
// 	pathStr := path.(string)
// 	if err := os.Remove(pathStr); err != nil {
// 		return false
// 	}
// 	return true
// }

// // directoryCreate creates a directory
// func (this *Exchange) DirectoryCreate(path interface{}) bool {
// 	pathStr := path.(string)
// 	if err := os.MkdirAll(pathStr, 0755); err != nil {
// 		return false
// 	}
// 	return true
// }

// // directoryExists checks if a directory exists
// func (this *Exchange) DirectoryExists(path interface{}) bool {
// 	pathStr := path.(string)
// 	info, err := os.Stat(pathStr)
// 	if err != nil {
// 		return false
// 	}
// 	return info.IsDir()
// }

// // directoryDelete deletes a directory and all its contents
// func (this *Exchange) DirectoryDelete(path interface{}) bool {
// 	if !this.DirectoryExists(path) {
// 		return true
// 	}
// 	pathStr := path.(string)
// 	if err := os.RemoveAll(pathStr); err != nil {
// 		return false
// 	}
// 	return true
// }

// GetTempDir returns the temporary directory
func (this *Exchange) GetTempDir() string {
	return os.TempDir() + string(filepath.Separator)
}
