using System;

namespace Org.BouncyCastle.Tls
{
    public sealed class RecordPreview
    {
        private readonly int recordSize;
        private readonly int contentLimit;

        internal static RecordPreview CombineAppData(RecordPreview a, RecordPreview b)
        {
            return new RecordPreview(a.RecordSize + b.RecordSize, a.ContentLimit + b.ContentLimit);
        }

        internal static RecordPreview ExtendRecordSize(RecordPreview a, int recordSize)
        {
            return new RecordPreview(a.RecordSize + recordSize, a.ContentLimit);
        }

        internal RecordPreview(int recordSize, int contentLimit)
        {
            this.recordSize = recordSize;
            this.contentLimit = contentLimit;
        }

        public int ContentLimit
        {
            get { return contentLimit; }
        }

        public int RecordSize
        {
            get { return recordSize; }
        }
    }
}
