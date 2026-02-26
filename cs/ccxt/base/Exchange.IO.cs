namespace ccxt;

public partial class Exchange
{
    public string GetTempDir()
    {
        return Path.GetTempPath();
    }

    public void EnsureWhitelistedFile(object path)
    {
        var pathStr = path as string;
        var tempDir = GetTempDir();
        if (pathStr == null || !pathStr.Contains(tempDir) || !pathStr.Contains("ccxt"))
        {
            throw new Exception("invalid file path");
        }
    }

    public string ReadFile(object path)
    {
        EnsureWhitelistedFile(path);
        if (!File.Exists(path as string))
        {
            throw new Exception("File not found: " + path as string);
        }
        return File.ReadAllText(path as string);
    }

    public bool WriteFile(object path, object data)
    {
        EnsureWhitelistedFile(path);
        var directory = Path.GetDirectoryName(path as string);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }
        File.WriteAllText(path as string, data as string);
        return true;
    }

    public bool ExistsFile(object path)
    {
        EnsureWhitelistedFile(path);
        return File.Exists(path as string);
    }
}