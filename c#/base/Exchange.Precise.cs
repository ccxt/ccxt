using System.Text;
using System.Security.Cryptography;

namespace Main;


public partial class Exchange
{

    public class Precise
    {
        public object decimals = null;
        public Precise(object arg)
        {

        }

        public void reduce()
        {

        }
        static public string stringMul(object a, object b)
        {
            return (float.Parse((string)a) * float.Parse((string)b)).ToString(); // tmp
        }
        static public string stringSub(object a, object b)
        {
            return (float.Parse((string)a) - float.Parse((string)b)).ToString(); // tmp
        }
        static public string stringAdd(object a, object b)
        {
            return (float.Parse((string)a) + float.Parse((string)b)).ToString(); // tmp
        }
        static public string stringDiv(object a, object b, object c = null)
        {
            return (float.Parse((string)a) / float.Parse((string)b)).ToString(); // tmp
        }
        static public bool stringGt(object a, object b)
        {
            return (float.Parse((string)a) > float.Parse((string)b));// tmp
        }

        static public bool stringEq(object a, object b)
        {
            return (float.Parse((string)a) == float.Parse((string)b));// tmp;
        }

        static public string stringMax(object a, object b)
        {
            if (a == null || b == null)
                return null;
            if (a == null)
                return (string)b;
            if (b == null)

                if (stringGt(a, b))
                {
                    return (string)a;
                }
            return (string)b;
        }

        static public string stringEquals(object a, object b)
        {
            return "";
        }

        static public string stringMin(object a, object b)
        {
            return "";
        }

        static public bool stringLt(object a, object b)
        {
            return false;
        }

        static public string stringAbs(object a)
        {
            return ((string)a);
        }

        static public string stringNeg(object a)
        {
            return "-" + ((string)a);
        }

        static public bool stringLe(object a, object b)
        {
            return false;
        }

    }

}