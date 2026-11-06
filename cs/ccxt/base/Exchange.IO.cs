namespace ccxt;

public partial class BaseExchange
{
    public string getTempDir()
    {
        var tmp = Path.GetFullPath(Path.GetTempPath());
        return tmp.EndsWith(Path.DirectorySeparatorChar.ToString()) ? tmp : tmp + Path.DirectorySeparatorChar;
    }

    public void ensureWhitelistedFile(object filePath)
    {
        var sanitized = Path.GetFullPath(filePath as string);
        var allowedExtensions = new string[] { ".ccxtfile", ".pem" };
        if (Array.Exists(allowedExtensions, ext => sanitized.EndsWith(ext))) {
            return;
        }
        throw new InvalidOperationException($"invalid file path: {filePath as string}, allowed extensions are: {string.Join(", ", allowedExtensions)}");
    }

    // file IO is synchronous in .NET, nothing to load before the first readFile call
    public Task<object> initFileSystem()
    {
        return Task.FromResult<object>(null);
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