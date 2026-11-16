namespace ccxt;

public partial class BaseExchange
{
    public string getTempDir()
    {
        var tmp = Path.GetFullPath(Path.GetTempPath());
        return tmp.EndsWith(Path.DirectorySeparatorChar.ToString()) ? tmp : tmp + Path.DirectorySeparatorChar;
    }

    // .ccxtfile (cache files) can be read and written, but only inside the temp dir
    // .pem (user-supplied keys, e.g. the ibkr oauth keys) can be read from any location, but never written
    public void ensureWhitelistedFile(object filePath, bool isWrite = false)
    {
        var sanitized = Path.GetFullPath(filePath as string);
        if (sanitized.EndsWith(".ccxtfile"))
        {
            if (sanitized.StartsWith(getTempDir()))
            {
                return;
            }
        }
        else if (sanitized.EndsWith(".pem") && !isWrite)
        {
            return;
        }
        throw new InvalidOperationException($"invalid file path: {filePath as string}, allowed are .ccxtfile (inside the temp dir) and read-only .pem");
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
        ensureWhitelistedFile(filePath, true);
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