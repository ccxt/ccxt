using System;
using System.Reflection;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class ErrorAttribute : Attribute
    {
        public ErrorAttribute(string name)
        {
            this.Name = name;
        }

        public string Name { get; set; }

        public static ErrorAttribute GetAttribute<T>()
        {
            var type = typeof(T);
            return GetAttribute(type);
        }

        public static ErrorAttribute GetAttribute(Type type)
        {
            return type.GetTypeInfo().GetCustomAttribute<ErrorAttribute>(true);
        }

        public static ErrorAttribute GetAttribute(object instance)
        {
            var type = instance.GetType();
            return GetAttribute(type);
        }

        public static bool IsErrorType<T>()
        {
            return GetAttribute<T>() != null;
        }

        public static bool IsErrorType(Type type)
        {
            return GetAttribute(type) != null;
        }

        public static bool IsErrorType(object type)
        {
            return GetAttribute(type) != null;
        }
    }
}