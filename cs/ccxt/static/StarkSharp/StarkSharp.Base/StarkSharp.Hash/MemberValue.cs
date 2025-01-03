namespace StarkSharp.StarkSharp.Base.StarkSharp.Hash
{

    public class MemberValue
    { 
        public string TypeName { get; set; }

        public object Value { get; set; }
    }

    public class Member
    {
        public Member() { }
        public Member(MemberDescription memberDescription, MemberValue memberValue)
        {
            MemberDescription = memberDescription;
            MemberValue = memberValue;
        }

        public MemberDescription MemberDescription { get; set; }
        public MemberValue MemberValue { get; set; }
    }
}