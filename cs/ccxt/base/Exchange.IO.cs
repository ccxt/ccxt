namespace ccxt;

public partial class Exchange
{
    public string getTempDir()
    {
        return Path.GetTempPath();
    }

    public void ensureCcxtFile(object path)
    {
        var pathStr = path as string;
        var tempDir = getTempDir();
        if (pathStr == null || !pathStr.Contains(tempDir) || !pathStr.Contains("ccxt"))
        {
            throw new Exception("invalid file path");
        }
    }

    public string fileRead(object path)
    {
        ensureCcxtFile(path);
        if (!File.Exists(path as string))
        {
            throw new Exception("File not found: " + path as string);
        }
        return File.ReadAllText(path as string);
    }

    public bool fileWrite(object path, object data)
    {
        ensureCcxtFile(path);
        var directory = Path.GetDirectoryName(path as string);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }
        File.WriteAllText(path as string, data as string);
        return true;
    }

    public bool fileExists(object path)
    {
        ensureCcxtFile(path);
        return File.Exists(path as string);
    }


}