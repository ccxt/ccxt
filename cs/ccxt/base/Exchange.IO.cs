namespace ccxt;

public partial class Exchange
{
    public string GetTempDir()
    {
        var tmp = Path.GetFullPath(Path.GetTempPath());
        return tmp.EndsWith(Path.DirectorySeparatorChar) ? tmp : tmp + Path.DirectorySeparatorChar;
    }

    public void EnsureWhitelistedFile(object filePath)
    {
        var tempDir = GetTempDir();
        var sanitized = Path.GetFullPath(filePath as string);
        if (sanitized.StartsWith(tempDir) && sanitized.EndsWith(".ccxtfile")) {
            return;
        }
        throw new InvalidOperationException($"invalid file path: {filePath as string}");
    }

    public string ReadFile(object filePath)
    {
        EnsureWhitelistedFile(filePath);
        if (!File.Exists(filePath as string))
        {
            throw new Exception("File not found: " + (filePath as string));
        }
        return File.ReadAllText(filePath as string);
    }

    public bool WriteFile(object filePath, object data)
    {
        EnsureWhitelistedFile(filePath);
        var directory = Path.GetDirectoryName(filePath as string);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }
        File.WriteAllText(filePath as string, data as string);
        return true;
    }

    public bool ExistsFile(object filePath)
    {
        EnsureWhitelistedFile(filePath);
        return File.Exists(filePath as string);
    }
}