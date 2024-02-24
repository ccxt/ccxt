using System;
using System.Reflection;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class EventAttribute : Attribute
    {
        public EventAttribute(string name) : this(name, false)
        {
        }

        public EventAttribute(string name, bool isAnonymous)
        {
            this.Name = name;
            this.IsAnonymous = isAnonymous;
        }

        public string Name { get; set; }
        public bool IsAnonymous { get; set; }

        public static EventAttribute GetAttribute<T>()
        {
            var type = typeof(T);
            return GetAttribute(type);
        }

        public static EventAttribute GetAttribute(Type type)
        {
            return type.GetTypeInfo().GetCustomAttribute<EventAttribute>(true);
        }

        public static EventAttribute GetAttribute(object instance)
        {
            var type = instance.GetType();
            return GetAttribute(type);
        }

        public static bool IsEventType<T>()
        {
            return GetAttribute<T>() != null;
        }

        public static bool IsEventType(Type type)
        {
            return GetAttribute(type) != null;
        }

        public static bool IsEventType(object type)
        {
            return GetAttribute(type) != null;
        }
    }
}