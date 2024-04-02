using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    internal class KMatrices
    {
        private int nmatrices;
        private int rows;
        private int columns;
        private uint[] data;

        public KMatrices(int nmatrices, int rows, int columns, uint[] data)
        {
            this.nmatrices = nmatrices;
            this.rows = rows;
            this.columns = columns;
            this.data = data;
        }
        

        public int GetNmatrices()
        {
            return nmatrices;
        }

        public int GetSize()
        {
            return rows * columns;
        }

        public int GetRows()
        {
            return rows;
        }

        public int GetColumns()
        {
            return columns;
        }

        public uint[] GetData()
        {
            return data;
        }
    }

    internal class KMatricesWithPointer
        : KMatrices
    {
        private int matrixPointer;
        public int GetMatrixPointer()
        {
            return matrixPointer;
        }

        public void SetMatrixPointer(int matrixPointer)
        {
            this.matrixPointer = matrixPointer;
        }

        public KMatricesWithPointer(KMatrices m)
            : base(m.GetNmatrices(), m.GetRows(), m.GetColumns(), m.GetData())
        {
            this.matrixPointer = 0;
        }
    }
}