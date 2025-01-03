// using System;
// using System.Runtime.InteropServices;

// [assembly: CLSCompliant(true)]
// [assembly: ComVisible(false)]

// // Start with no permissions
// //[assembly: PermissionSet(SecurityAction.RequestOptional, Unrestricted=false)]
// //...and explicitly add those we need

// // see Org.BouncyCastle.Crypto.Encodings.Pkcs1Encoding.StrictLengthEnabledProperty
// //[assembly: EnvironmentPermission(SecurityAction.RequestOptional, Read="Org.BouncyCastle.Pkcs1.Strict")]

// #if !(NET45_OR_GREATER || NETSTANDARD1_0_OR_GREATER)
// namespace System.Reflection
// {
//     [AttributeUsage(AttributeTargets.Assembly, AllowMultiple = true, Inherited = false)]
//     internal sealed class AssemblyMetadataAttribute : Attribute
//     {
//         public AssemblyMetadataAttribute(string key, string value)
//         {
//             Key = key;
//             Value = value;
//         }

//         public string Key { get; }

//         public string Value { get; }
//     }
// }
// #endif
