namespace ccxt;

public partial class Exchange
{
    public string getTempDir()
    {
        var tmp = Path.GetFullPath(Path.GetTempPath());
        return tmp.EndsWith(Path.DirectorySeparatorChar.ToString()) ? tmp : tmp + Path.DirectorySeparatorChar;
    }

    public void ensureWhitelistedFile(object filePath)
    {
        var tempDir = getTempDir();
        var sanitized = Path.GetFullPath(filePath as string);
        if (sanitized.StartsWith(tempDir) && sanitized.EndsWith(".ccxtfile")) {
            return;
        }
        throw new InvalidOperationException($"invalid file path: {filePath as string}");
    }

    public string readFile(object filePath)
    {
        ensureWhitelistedFile(filePath);
        if (!File.Exists(filePath as string))
        {
            throw new Exception("File not found: " + (filePath as string));
        }
        return File.ReadAllText(filePath as string);
    }

    public bool writeFile(object filePath, object data)
    {
        ensureWhitelistedFile(filePath);
        var directory = Path.GetDirectoryName(filePath as string);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }
        File.WriteAllText(filePath as string, data as string);
        return true;
    }

    public bool existsFile(object filePath)
    {
        ensureWhitelistedFile(filePath);
        return File.Exists(filePath as string);
    }
}