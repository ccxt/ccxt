namespace ccxt;

public partial class Exchange
{
    public string fileRead(string path)
    {
        if (!File.Exists(path))
        {
            throw new Exception("File not found: " + path);
        }
        return File.ReadAllText(path);
    }

    public void fileWrite(string path, string data)
    {
        var directory = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }
        File.WriteAllText(path, data);
    }

    public bool fileExists(string path)
    {
        return File.Exists(path);
    }

    public void fileDelete(string path)
    {
        if (File.Exists(path))
        {
            File.Delete(path);
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