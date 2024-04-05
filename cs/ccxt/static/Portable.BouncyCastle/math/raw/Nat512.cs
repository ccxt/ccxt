using System;
using System.Diagnostics;

namespace Org.BouncyCastle.Math.Raw
{
    internal abstract class Nat512
    {
        public static void Mul(uint[] x, uint[] y, uint[] zz)
        {
            Nat256.Mul(x, y, zz);
            Nat256.Mul(x, 8, y, 8, zz, 16);

            uint c24 = Nat256.AddToEachOther(zz, 8, zz, 16);
            uint c16 = c24 + Nat256.AddTo(zz, 0, zz, 8, 0);
            c24 += Nat256.AddTo(zz, 24, zz, 16, c16);

            uint[] dx = Nat256.Create(), dy = Nat256.Create();
            bool neg = Nat256.Diff(x, 8, x, 0, dx, 0) != Nat256.Diff(y, 8, y, 0, dy, 0);

            uint[] tt = Nat256.CreateExt();
            Nat256.Mul(dx, dy, tt);

            c24 += neg ? Nat.AddTo(16, tt, 0, zz, 8) : (uint)Nat.SubFrom(16, tt, 0, zz, 8);
            Nat.AddWordAt(32, c24, zz, 24); 
        }

        public static void Square(uint[] x, uint[] zz)
        {
            Nat256.Square(x, zz);
            Nat256.Square(x, 8, zz, 16);

            uint c24 = Nat256.AddToEachOther(zz, 8, zz, 16);
            uint c16 = c24 + Nat256.AddTo(zz, 0, zz, 8, 0);
            c24 += Nat256.AddTo(zz, 24, zz, 16, c16);

            uint[] dx = Nat256.Create();
            Nat256.Diff(x, 8, x, 0, dx, 0);

            uint[] m = Nat256.CreateExt();
            Nat256.Square(dx, m);

            c24 += (uint)Nat.SubFrom(16, m, 0, zz, 8);
            Nat.AddWordAt(32, c24, zz, 24); 
        }
    }
}
