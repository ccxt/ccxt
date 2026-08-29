using System;
using System.Reflection;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class StructAttribute : Attribute
    {
        public StructAttribute(string name)
        {
            this.Name = name;
        }

        public string Name { get; set; }
      
        public static StructAttribute GetAttribute<T>()
        {
            var type = typeof(T);
            return GetAttribute(type);
        }

        public static StructAttribute GetAttribute(Type type)
        {
            return type.GetTypeInfo().GetCustomAttribute<StructAttribute>(true);
        }

        public static StructAttribute GetAttribute(object instance)
        {
            var type = instance.GetType();
            return GetAttribute(type);
        }

        public static bool IsStructType<T>()
        {
            return GetAttribute<T>() != null;
        }

        public static bool IsStructType(Type type)
        {
            return GetAttribute(type) != null;
        }

        public static bool IsStructType(object type)
        {
            return GetAttribute(type) != null;
        }
    }
}