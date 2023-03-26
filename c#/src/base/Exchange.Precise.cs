using System.Text;
using System.Security.Cryptography;
using System.Globalization;

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
            if (a == null || b == null)
                return null;
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return (first * second).ToString();// tmp
        }
        static public string stringSub(object a, object b)
        {
            if (a == null || b == null)
                return null;
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return (first - second).ToString();// tmp
        }
        static public string stringAdd(object a, object b)
        {
            if (a == null || b == null)
                return null;
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return (first + second).ToString();// tmp
        }
        static public string stringDiv(object a, object b, object c = null)
        {
            if (a == null || b == null)
                return null;
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return (first / second).ToString();// tmp
        }
        static public bool stringGt(object a, object b)
        {
            if (a == null || b == null)
                return false;
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return first > second;// tmp
        }

        static public bool stringEq(object a, object b)
        {
            if (a == null || b == null)
                return false;
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return (first == second);// tmp;
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
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return first < second;
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
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return first <= second;
        }

        static public bool stringGe(object a, object b)
        {
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return first >= second;
        }

    }

}