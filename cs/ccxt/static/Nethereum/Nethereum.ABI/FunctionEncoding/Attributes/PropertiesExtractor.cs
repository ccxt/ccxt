using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{
    public static class PropertiesExtractor
    {
        public static IEnumerable<PropertyInfo> GetProperties(Type type)
        {
#if DOTNET35
            var hidingProperties = type.GetProperties().Where(x => PropertyInfoExtensions.IsHidingMember(x));
            var nonHidingProperties = type.GetProperties().Where(x => hidingProperties.All(y => y.Name != x.Name));
            return nonHidingProperties.Concat(hidingProperties);
#else
            var hidingProperties = type.GetRuntimeProperties().Where(x => x.IsHidingMember());
            var nonHidingProperties = type.GetRuntimeProperties().Where(x => hidingProperties.All(y => y.Name != x.Name));
            return nonHidingProperties.Concat(hidingProperties);
#endif
        }

        public static IEnumerable<PropertyInfo> GetPropertiesWithParameterAttribute(Type type)
        {
            return GetProperties(type).Where(x => x.IsDefined(typeof(ParameterAttribute), true));
        }

        public static ParameterAttributeIndexedTopics[] GetIndexedTopics<T>()
        {
            return PropertiesExtractor
                .GetPropertiesWithParameterAttribute(typeof(T))
                .Select(p => new ParameterAttributeIndexedTopics
                {
                    ParameterAttribute = p.GetCustomAttribute<ParameterAttribute>(),
                    PropertyInfo = p
                })
                .Where(p => p.ParameterAttribute?.Parameter.Indexed ?? false)
                .OrderBy(p => p.ParameterAttribute.Order)
                .ToArray();
        }
    }
}