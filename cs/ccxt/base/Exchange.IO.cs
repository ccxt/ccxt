namespace ccxt;

public partial class Exchange
{
    public string fileRead(object path)
    {
        if (!File.Exists(path as string))
        {
            throw new Exception("File not found: " + path as string);
        }
        return File.ReadAllText(path as string);
    }

    public bool fileWrite(object path, object data)
    {
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
        return File.Exists(path as string);
    }

    public void fileDelete(object path)
    {
        if (File.Exists(path as string))
        {
            File.Delete(path as string);
        }
    }

    public void directoryCreate(string path)
    {
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
    }

    public bool directoryExists(string path)
    {
        return Directory.Exists(path);
    }

    public void directoryDelete(string path)
    {
        if (Directory.Exists(path))
        {
            Directory.Delete(path, true);
        }
    }
}