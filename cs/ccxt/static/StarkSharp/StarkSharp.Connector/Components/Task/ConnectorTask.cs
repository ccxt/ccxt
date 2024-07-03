using System.Collections.Generic;

namespace StarkSharp.Connectors.Components
{
    public class ConnectorTask
    {
        public static Dictionary<int, int> status = new Dictionary<int, int>();
        public static Dictionary<int, string> messages = new Dictionary<int, string>();
        public static int counter = 0;

        public static int CreateNewTask()
        {
            int newID = counter++;
            status.Add(newID, 0);
            messages.Add(newID, "");
            return newID;
        }

        public static int GetStatus()
        {
            int newID = counter++;
            status.Add(newID, 0);
            messages.Add(newID, "");
            return newID;
        }

        public static int GetStatus(int id, bool isRemove = false)
        {
            int currentStatus = status[id];
            if (currentStatus != 0 && isRemove) status.Remove(id);
            return currentStatus;
        }

        public static string GetMessage(int id)
        {
            string message = messages[id];
            messages.Remove(id);
            return message;
        }

        public static void RecieveMessage(string data)
        {
            string[] parts = data.Split(':');
            if (parts.Length != 3) return;
            int id = int.Parse(parts[0]);
            int currentStatus = int.Parse(parts[1]);
            var message = parts[2];
            status[id] = currentStatus;
            messages[id] = message;
        }
    }
}
