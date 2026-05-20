using System;
using System.Reflection;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{

    [AttributeUsage(AttributeTargets.Class)]
    public class FunctionAttribute : Attribute
    {
        public string Name { get; private set; }

        public Type DTOReturnType { get; private set; }

        public string ReturnType { get; private set; }

        public FunctionAttribute(string name, string returnType)
        {
            this.Name = name;
            this.ReturnType = returnType;
        }

        public FunctionAttribute(string name)
        {
            this.Name = name;
        }

        public FunctionAttribute(string name, Type dtoReturnType)
        {
            this.DTOReturnType = dtoReturnType;
            this.Name = name;
        }

        public static FunctionAttribute GetAttribute<T>()
        {
            var type = typeof(T);
            return GetAttribute(type);
        }

        public static FunctionAttribute GetAttribute(Type type)
        {
            return type.GetTypeInfo().GetCustomAttribute<FunctionAttribute>(true);
        }

        public static FunctionAttribute GetAttribute(object instance)
        {
            var type = instance.GetType();
            return GetAttribute(type);
        }

        public static bool IsFunctionType<T>()
        {
            return GetAttribute<T>() != null;
        }

        public static bool IsFunctionType(Type type)
        {
            return GetAttribute(type) != null;
        }

        public static bool IsFunctionType(object type)
        {
            return GetAttribute(type) != null;
        }
    }
}