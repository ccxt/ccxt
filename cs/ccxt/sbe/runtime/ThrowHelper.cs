using System;

namespace Org.SbeTool.Sbe.Dll
{
    /// <summary>
    /// Helper class that provides non-returning methods that throw common exception
    /// from the generated C# code
    /// </summary>
    public class ThrowHelper
    {
        /// <summary>
        /// Throws a <see cref="ArgumentOutOfRangeException"/> when the "count" parameter is out of range
        /// </summary>
        /// <param name="count">the parameter that triggered the exception</param>
        public static void ThrowCountOutOfRangeException(int count) =>
            throw new ArgumentOutOfRangeException("count", $"Outside allowed range: count={count}");
        
        /// <summary>
        /// Throws a <see cref="InvalidOperationException"/> when an invalid operation is invoked on a message (for example: enumerating a group past it's maximal count)
        /// </summary>
        public static void ThrowInvalidOperationException() =>
            throw new InvalidOperationException();
        
        /// <summary>
        /// Throws a <see cref="IndexOutOfRangeException" /> when the "index" parameter is out of range
        /// </summary>
        /// <param name="index">the parameter that triggered the exception</param>
        public static void ThrowIndexOutOfRangeException(int index) =>
            throw new IndexOutOfRangeException($"index out of range: index={index}");
        
        /// <summary>
        /// Throws a <see cref="ArgumentOutOfRangeException"/> when a too-small <see cref="Span{T}"/>
        /// is provided to a getter
        /// </summary>
        /// <param name="length">The length of the too-small Span</param>
        public static void ThrowWhenSpanLengthTooSmall(int length) =>
            throw new ArgumentOutOfRangeException("dst", $"dst.Length={length} is too small.");
        
        /// <summary>
        /// Throws a <see cref="ArgumentOutOfRangeException"/> when a too-large <see cref="Span{T}"/>
        /// is provided to a setter
        /// </summary>
        /// <param name="length">The length of the too-large Span</param>
        public static void ThrowWhenSpanLengthTooLarge(int length) =>
            throw new ArgumentOutOfRangeException("src", $"src.Length={length} is too large.");
    }
}