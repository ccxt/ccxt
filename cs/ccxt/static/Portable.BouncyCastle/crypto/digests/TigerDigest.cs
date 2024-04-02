using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    /**
    * implementation of Tiger based on:
    * <a href="http://www.cs.technion.ac.il/~biham/Reports/Tiger">
    *  http://www.cs.technion.ac.il/~biham/Reports/Tiger</a>
    */
    public class TigerDigest
		: IDigest, IMemoable
    {
        private const int MyByteLength = 64;

        /*
        * S-Boxes.
        */
        private static readonly long[] t1 = {
            unchecked((long) 0x02AAB17CF7E90C5EL)   /*    0 */,    unchecked((long) 0xAC424B03E243A8ECL)   /*    1 */,
            unchecked((long) 0x72CD5BE30DD5FCD3L)   /*    2 */,    unchecked((long) 0x6D019B93F6F97F3AL)   /*    3 */,
            unchecked((long) 0xCD9978FFD21F9193L)   /*    4 */,    unchecked((long) 0x7573A1C9708029E2L)   /*    5 */,
            unchecked((long) 0xB164326B922A83C3L)   /*    6 */,    unchecked((long) 0x46883EEE04915870L)   /*    7 */,
            unchecked((long) 0xEAACE3057103ECE6L)   /*    8 */,    unchecked((long) 0xC54169B808A3535CL)   /*    9 */,
            unchecked((long) 0x4CE754918DDEC47CL)   /*   10 */,    unchecked((long) 0x0AA2F4DFDC0DF40CL)   /*   11 */,
            unchecked((long) 0x10B76F18A74DBEFAL)   /*   12 */,    unchecked((long) 0xC6CCB6235AD1AB6AL)   /*   13 */,
            unchecked((long) 0x13726121572FE2FFL)   /*   14 */,    unchecked((long) 0x1A488C6F199D921EL)   /*   15 */,
            unchecked((long) 0x4BC9F9F4DA0007CAL)   /*   16 */,    unchecked((long) 0x26F5E6F6E85241C7L)   /*   17 */,
            unchecked((long) 0x859079DBEA5947B6L)   /*   18 */,    unchecked((long) 0x4F1885C5C99E8C92L)   /*   19 */,
            unchecked((long) 0xD78E761EA96F864BL)   /*   20 */,    unchecked((long) 0x8E36428C52B5C17DL)   /*   21 */,
            unchecked((long) 0x69CF6827373063C1L)   /*   22 */,    unchecked((long) 0xB607C93D9BB4C56EL)   /*   23 */,
            unchecked((long) 0x7D820E760E76B5EAL)   /*   24 */,    unchecked((long) 0x645C9CC6F07FDC42L)   /*   25 */,
            unchecked((long) 0xBF38A078243342E0L)   /*   26 */,    unchecked((long) 0x5F6B343C9D2E7D04L)   /*   27 */,
            unchecked((long) 0xF2C28AEB600B0EC6L)   /*   28 */,    unchecked((long) 0x6C0ED85F7254BCACL)   /*   29 */,
            unchecked((long) 0x71592281A4DB4FE5L)   /*   30 */,    unchecked((long) 0x1967FA69CE0FED9FL)   /*   31 */,
            unchecked((long) 0xFD5293F8B96545DBL)   /*   32 */,    unchecked((long) 0xC879E9D7F2A7600BL)   /*   33 */,
            unchecked((long) 0x860248920193194EL)   /*   34 */,    unchecked((long) 0xA4F9533B2D9CC0B3L)   /*   35 */,
            unchecked((long) 0x9053836C15957613L)   /*   36 */,    unchecked((long) 0xDB6DCF8AFC357BF1L)   /*   37 */,
            unchecked((long) 0x18BEEA7A7A370F57L)   /*   38 */,    unchecked((long) 0x037117CA50B99066L)   /*   39 */,
            unchecked((long) 0x6AB30A9774424A35L)   /*   40 */,    unchecked((long) 0xF4E92F02E325249BL)   /*   41 */,
            unchecked((long) 0x7739DB07061CCAE1L)   /*   42 */,    unchecked((long) 0xD8F3B49CECA42A05L)   /*   43 */,
            unchecked((long) 0xBD56BE3F51382F73L)   /*   44 */,    unchecked((long) 0x45FAED5843B0BB28L)   /*   45 */,
            unchecked((long) 0x1C813D5C11BF1F83L)   /*   46 */,    unchecked((long) 0x8AF0E4B6D75FA169L)   /*   47 */,
            unchecked((long) 0x33EE18A487AD9999L)   /*   48 */,    unchecked((long) 0x3C26E8EAB1C94410L)   /*   49 */,
            unchecked((long) 0xB510102BC0A822F9L)   /*   50 */,    unchecked((long) 0x141EEF310CE6123BL)   /*   51 */,
            unchecked((long) 0xFC65B90059DDB154L)   /*   52 */,    unchecked((long) 0xE0158640C5E0E607L)   /*   53 */,
            unchecked((long) 0x884E079826C3A3CFL)   /*   54 */,    unchecked((long) 0x930D0D9523C535FDL)   /*   55 */,
            unchecked((long) 0x35638D754E9A2B00L)   /*   56 */,    unchecked((long) 0x4085FCCF40469DD5L)   /*   57 */,
            unchecked((long) 0xC4B17AD28BE23A4CL)   /*   58 */,    unchecked((long) 0xCAB2F0FC6A3E6A2EL)   /*   59 */,
            unchecked((long) 0x2860971A6B943FCDL)   /*   60 */,    unchecked((long) 0x3DDE6EE212E30446L)   /*   61 */,
            unchecked((long) 0x6222F32AE01765AEL)   /*   62 */,    unchecked((long) 0x5D550BB5478308FEL)   /*   63 */,
            unchecked((long) 0xA9EFA98DA0EDA22AL)   /*   64 */,    unchecked((long) 0xC351A71686C40DA7L)   /*   65 */,
            unchecked((long) 0x1105586D9C867C84L)   /*   66 */,    unchecked((long) 0xDCFFEE85FDA22853L)   /*   67 */,
            unchecked((long) 0xCCFBD0262C5EEF76L)   /*   68 */,    unchecked((long) 0xBAF294CB8990D201L)   /*   69 */,
            unchecked((long) 0xE69464F52AFAD975L)   /*   70 */,    unchecked((long) 0x94B013AFDF133E14L)   /*   71 */,
            unchecked((long) 0x06A7D1A32823C958L)   /*   72 */,    unchecked((long) 0x6F95FE5130F61119L)   /*   73 */,
            unchecked((long) 0xD92AB34E462C06C0L)   /*   74 */,    unchecked((long) 0xED7BDE33887C71D2L)   /*   75 */,
            unchecked((long) 0x79746D6E6518393EL)   /*   76 */,    unchecked((long) 0x5BA419385D713329L)   /*   77 */,
            unchecked((long) 0x7C1BA6B948A97564L)   /*   78 */,    unchecked((long) 0x31987C197BFDAC67L)   /*   79 */,
            unchecked((long) 0xDE6C23C44B053D02L)   /*   80 */,    unchecked((long) 0x581C49FED002D64DL)   /*   81 */,
            unchecked((long) 0xDD474D6338261571L)   /*   82 */,    unchecked((long) 0xAA4546C3E473D062L)   /*   83 */,
            unchecked((long) 0x928FCE349455F860L)   /*   84 */,    unchecked((long) 0x48161BBACAAB94D9L)   /*   85 */,
            unchecked((long) 0x63912430770E6F68L)   /*   86 */,    unchecked((long) 0x6EC8A5E602C6641CL)   /*   87 */,
            unchecked((long) 0x87282515337DDD2BL)   /*   88 */,    unchecked((long) 0x2CDA6B42034B701BL)   /*   89 */,
            unchecked((long) 0xB03D37C181CB096DL)   /*   90 */,    unchecked((long) 0xE108438266C71C6FL)   /*   91 */,
            unchecked((long) 0x2B3180C7EB51B255L)   /*   92 */,    unchecked((long) 0xDF92B82F96C08BBCL)   /*   93 */,
            unchecked((long) 0x5C68C8C0A632F3BAL)   /*   94 */,    unchecked((long) 0x5504CC861C3D0556L)   /*   95 */,
            unchecked((long) 0xABBFA4E55FB26B8FL)   /*   96 */,    unchecked((long) 0x41848B0AB3BACEB4L)   /*   97 */,
            unchecked((long) 0xB334A273AA445D32L)   /*   98 */,    unchecked((long) 0xBCA696F0A85AD881L)   /*   99 */,
            unchecked((long) 0x24F6EC65B528D56CL)   /*  100 */,    unchecked((long) 0x0CE1512E90F4524AL)   /*  101 */,
            unchecked((long) 0x4E9DD79D5506D35AL)   /*  102 */,    unchecked((long) 0x258905FAC6CE9779L)   /*  103 */,
            unchecked((long) 0x2019295B3E109B33L)   /*  104 */,    unchecked((long) 0xF8A9478B73A054CCL)   /*  105 */,
            unchecked((long) 0x2924F2F934417EB0L)   /*  106 */,    unchecked((long) 0x3993357D536D1BC4L)   /*  107 */,
            unchecked((long) 0x38A81AC21DB6FF8BL)   /*  108 */,    unchecked((long) 0x47C4FBF17D6016BFL)   /*  109 */,
            unchecked((long) 0x1E0FAADD7667E3F5L)   /*  110 */,    unchecked((long) 0x7ABCFF62938BEB96L)   /*  111 */,
            unchecked((long) 0xA78DAD948FC179C9L)   /*  112 */,    unchecked((long) 0x8F1F98B72911E50DL)   /*  113 */,
            unchecked((long) 0x61E48EAE27121A91L)   /*  114 */,    unchecked((long) 0x4D62F7AD31859808L)   /*  115 */,
            unchecked((long) 0xECEBA345EF5CEAEBL)   /*  116 */,    unchecked((long) 0xF5CEB25EBC9684CEL)   /*  117 */,
            unchecked((long) 0xF633E20CB7F76221L)   /*  118 */,    unchecked((long) 0xA32CDF06AB8293E4L)   /*  119 */,
            unchecked((long) 0x985A202CA5EE2CA4L)   /*  120 */,    unchecked((long) 0xCF0B8447CC8A8FB1L)   /*  121 */,
            unchecked((long) 0x9F765244979859A3L)   /*  122 */,    unchecked((long) 0xA8D516B1A1240017L)   /*  123 */,
            unchecked((long) 0x0BD7BA3EBB5DC726L)   /*  124 */,    unchecked((long) 0xE54BCA55B86ADB39L)   /*  125 */,
            unchecked((long) 0x1D7A3AFD6C478063L)   /*  126 */,    unchecked((long) 0x519EC608E7669EDDL)   /*  127 */,
            unchecked((long) 0x0E5715A2D149AA23L)   /*  128 */,    unchecked((long) 0x177D4571848FF194L)   /*  129 */,
            unchecked((long) 0xEEB55F3241014C22L)   /*  130 */,    unchecked((long) 0x0F5E5CA13A6E2EC2L)   /*  131 */,
            unchecked((long) 0x8029927B75F5C361L)   /*  132 */,    unchecked((long) 0xAD139FABC3D6E436L)   /*  133 */,
            unchecked((long) 0x0D5DF1A94CCF402FL)   /*  134 */,    unchecked((long) 0x3E8BD948BEA5DFC8L)   /*  135 */,
            unchecked((long) 0xA5A0D357BD3FF77EL)   /*  136 */,    unchecked((long) 0xA2D12E251F74F645L)   /*  137 */,
            unchecked((long) 0x66FD9E525E81A082L)   /*  138 */,    unchecked((long) 0x2E0C90CE7F687A49L)   /*  139 */,
            unchecked((long) 0xC2E8BCBEBA973BC5L)   /*  140 */,    unchecked((long) 0x000001BCE509745FL)   /*  141 */,
            unchecked((long) 0x423777BBE6DAB3D6L)   /*  142 */,    unchecked((long) 0xD1661C7EAEF06EB5L)   /*  143 */,
            unchecked((long) 0xA1781F354DAACFD8L)   /*  144 */,    unchecked((long) 0x2D11284A2B16AFFCL)   /*  145 */,
            unchecked((long) 0xF1FC4F67FA891D1FL)   /*  146 */,    unchecked((long) 0x73ECC25DCB920ADAL)   /*  147 */,
            unchecked((long) 0xAE610C22C2A12651L)   /*  148 */,    unchecked((long) 0x96E0A810D356B78AL)   /*  149 */,
            unchecked((long) 0x5A9A381F2FE7870FL)   /*  150 */,    unchecked((long) 0xD5AD62EDE94E5530L)   /*  151 */,
            unchecked((long) 0xD225E5E8368D1427L)   /*  152 */,    unchecked((long) 0x65977B70C7AF4631L)   /*  153 */,
            unchecked((long) 0x99F889B2DE39D74FL)   /*  154 */,    unchecked((long) 0x233F30BF54E1D143L)   /*  155 */,
            unchecked((long) 0x9A9675D3D9A63C97L)   /*  156 */,    unchecked((long) 0x5470554FF334F9A8L)   /*  157 */,
            unchecked((long) 0x166ACB744A4F5688L)   /*  158 */,    unchecked((long) 0x70C74CAAB2E4AEADL)   /*  159 */,
            unchecked((long) 0xF0D091646F294D12L)   /*  160 */,    unchecked((long) 0x57B82A89684031D1L)   /*  161 */,
            unchecked((long) 0xEFD95A5A61BE0B6BL)   /*  162 */,    unchecked((long) 0x2FBD12E969F2F29AL)   /*  163 */,
            unchecked((long) 0x9BD37013FEFF9FE8L)   /*  164 */,    unchecked((long) 0x3F9B0404D6085A06L)   /*  165 */,
            unchecked((long) 0x4940C1F3166CFE15L)   /*  166 */,    unchecked((long) 0x09542C4DCDF3DEFBL)   /*  167 */,
            unchecked((long) 0xB4C5218385CD5CE3L)   /*  168 */,    unchecked((long) 0xC935B7DC4462A641L)   /*  169 */,
            unchecked((long) 0x3417F8A68ED3B63FL)   /*  170 */,    unchecked((long) 0xB80959295B215B40L)   /*  171 */,
            unchecked((long) 0xF99CDAEF3B8C8572L)   /*  172 */,    unchecked((long) 0x018C0614F8FCB95DL)   /*  173 */,
            unchecked((long) 0x1B14ACCD1A3ACDF3L)   /*  174 */,    unchecked((long) 0x84D471F200BB732DL)   /*  175 */,
            unchecked((long) 0xC1A3110E95E8DA16L)   /*  176 */,    unchecked((long) 0x430A7220BF1A82B8L)   /*  177 */,
            unchecked((long) 0xB77E090D39DF210EL)   /*  178 */,    unchecked((long) 0x5EF4BD9F3CD05E9DL)   /*  179 */,
            unchecked((long) 0x9D4FF6DA7E57A444L)   /*  180 */,    unchecked((long) 0xDA1D60E183D4A5F8L)   /*  181 */,
            unchecked((long) 0xB287C38417998E47L)   /*  182 */,    unchecked((long) 0xFE3EDC121BB31886L)   /*  183 */,
            unchecked((long) 0xC7FE3CCC980CCBEFL)   /*  184 */,    unchecked((long) 0xE46FB590189BFD03L)   /*  185 */,
            unchecked((long) 0x3732FD469A4C57DCL)   /*  186 */,    unchecked((long) 0x7EF700A07CF1AD65L)   /*  187 */,
            unchecked((long) 0x59C64468A31D8859L)   /*  188 */,    unchecked((long) 0x762FB0B4D45B61F6L)   /*  189 */,
            unchecked((long) 0x155BAED099047718L)   /*  190 */,    unchecked((long) 0x68755E4C3D50BAA6L)   /*  191 */,
            unchecked((long) 0xE9214E7F22D8B4DFL)   /*  192 */,    unchecked((long) 0x2ADDBF532EAC95F4L)   /*  193 */,
            unchecked((long) 0x32AE3909B4BD0109L)   /*  194 */,    unchecked((long) 0x834DF537B08E3450L)   /*  195 */,
            unchecked((long) 0xFA209DA84220728DL)   /*  196 */,    unchecked((long) 0x9E691D9B9EFE23F7L)   /*  197 */,
            unchecked((long) 0x0446D288C4AE8D7FL)   /*  198 */,    unchecked((long) 0x7B4CC524E169785BL)   /*  199 */,
            unchecked((long) 0x21D87F0135CA1385L)   /*  200 */,    unchecked((long) 0xCEBB400F137B8AA5L)   /*  201 */,
            unchecked((long) 0x272E2B66580796BEL)   /*  202 */,    unchecked((long) 0x3612264125C2B0DEL)   /*  203 */,
            unchecked((long) 0x057702BDAD1EFBB2L)   /*  204 */,    unchecked((long) 0xD4BABB8EACF84BE9L)   /*  205 */,
            unchecked((long) 0x91583139641BC67BL)   /*  206 */,    unchecked((long) 0x8BDC2DE08036E024L)   /*  207 */,
            unchecked((long) 0x603C8156F49F68EDL)   /*  208 */,    unchecked((long) 0xF7D236F7DBEF5111L)   /*  209 */,
            unchecked((long) 0x9727C4598AD21E80L)   /*  210 */,    unchecked((long) 0xA08A0896670A5FD7L)   /*  211 */,
            unchecked((long) 0xCB4A8F4309EBA9CBL)   /*  212 */,    unchecked((long) 0x81AF564B0F7036A1L)   /*  213 */,
            unchecked((long) 0xC0B99AA778199ABDL)   /*  214 */,    unchecked((long) 0x959F1EC83FC8E952L)   /*  215 */,
            unchecked((long) 0x8C505077794A81B9L)   /*  216 */,    unchecked((long) 0x3ACAAF8F056338F0L)   /*  217 */,
            unchecked((long) 0x07B43F50627A6778L)   /*  218 */,    unchecked((long) 0x4A44AB49F5ECCC77L)   /*  219 */,
            unchecked((long) 0x3BC3D6E4B679EE98L)   /*  220 */,    unchecked((long) 0x9CC0D4D1CF14108CL)   /*  221 */,
            unchecked((long) 0x4406C00B206BC8A0L)   /*  222 */,    unchecked((long) 0x82A18854C8D72D89L)   /*  223 */,
            unchecked((long) 0x67E366B35C3C432CL)   /*  224 */,    unchecked((long) 0xB923DD61102B37F2L)   /*  225 */,
            unchecked((long) 0x56AB2779D884271DL)   /*  226 */,    unchecked((long) 0xBE83E1B0FF1525AFL)   /*  227 */,
            unchecked((long) 0xFB7C65D4217E49A9L)   /*  228 */,    unchecked((long) 0x6BDBE0E76D48E7D4L)   /*  229 */,
            unchecked((long) 0x08DF828745D9179EL)   /*  230 */,    unchecked((long) 0x22EA6A9ADD53BD34L)   /*  231 */,
            unchecked((long) 0xE36E141C5622200AL)   /*  232 */,    unchecked((long) 0x7F805D1B8CB750EEL)   /*  233 */,
            unchecked((long) 0xAFE5C7A59F58E837L)   /*  234 */,    unchecked((long) 0xE27F996A4FB1C23CL)   /*  235 */,
            unchecked((long) 0xD3867DFB0775F0D0L)   /*  236 */,    unchecked((long) 0xD0E673DE6E88891AL)   /*  237 */,
            unchecked((long) 0x123AEB9EAFB86C25L)   /*  238 */,    unchecked((long) 0x30F1D5D5C145B895L)   /*  239 */,
            unchecked((long) 0xBB434A2DEE7269E7L)   /*  240 */,    unchecked((long) 0x78CB67ECF931FA38L)   /*  241 */,
            unchecked((long) 0xF33B0372323BBF9CL)   /*  242 */,    unchecked((long) 0x52D66336FB279C74L)   /*  243 */,
            unchecked((long) 0x505F33AC0AFB4EAAL)   /*  244 */,    unchecked((long) 0xE8A5CD99A2CCE187L)   /*  245 */,
            unchecked((long) 0x534974801E2D30BBL)   /*  246 */,    unchecked((long) 0x8D2D5711D5876D90L)   /*  247 */,
            unchecked((long) 0x1F1A412891BC038EL)   /*  248 */,    unchecked((long) 0xD6E2E71D82E56648L)   /*  249 */,
            unchecked((long) 0x74036C3A497732B7L)   /*  250 */,    unchecked((long) 0x89B67ED96361F5ABL)   /*  251 */,
            unchecked((long) 0xFFED95D8F1EA02A2L)   /*  252 */,    unchecked((long) 0xE72B3BD61464D43DL)   /*  253 */,
            unchecked((long) 0xA6300F170BDC4820L)   /*  254 */,    unchecked((long) 0xEBC18760ED78A77AL)   /*  255 */,
        };

        private static readonly long[] t2 = {
            unchecked((long) 0xE6A6BE5A05A12138L)   /*  256 */,    unchecked((long) 0xB5A122A5B4F87C98L)   /*  257 */,
            unchecked((long) 0x563C6089140B6990L)   /*  258 */,    unchecked((long) 0x4C46CB2E391F5DD5L)   /*  259 */,
            unchecked((long) 0xD932ADDBC9B79434L)   /*  260 */,    unchecked((long) 0x08EA70E42015AFF5L)   /*  261 */,
            unchecked((long) 0xD765A6673E478CF1L)   /*  262 */,    unchecked((long) 0xC4FB757EAB278D99L)   /*  263 */,
            unchecked((long) 0xDF11C6862D6E0692L)   /*  264 */,    unchecked((long) 0xDDEB84F10D7F3B16L)   /*  265 */,
            unchecked((long) 0x6F2EF604A665EA04L)   /*  266 */,    unchecked((long) 0x4A8E0F0FF0E0DFB3L)   /*  267 */,
            unchecked((long) 0xA5EDEEF83DBCBA51L)   /*  268 */,    unchecked((long) 0xFC4F0A2A0EA4371EL)   /*  269 */,
            unchecked((long) 0xE83E1DA85CB38429L)   /*  270 */,    unchecked((long) 0xDC8FF882BA1B1CE2L)   /*  271 */,
            unchecked((long) 0xCD45505E8353E80DL)   /*  272 */,    unchecked((long) 0x18D19A00D4DB0717L)   /*  273 */,
            unchecked((long) 0x34A0CFEDA5F38101L)   /*  274 */,    unchecked((long) 0x0BE77E518887CAF2L)   /*  275 */,
            unchecked((long) 0x1E341438B3C45136L)   /*  276 */,    unchecked((long) 0xE05797F49089CCF9L)   /*  277 */,
            unchecked((long) 0xFFD23F9DF2591D14L)   /*  278 */,    unchecked((long) 0x543DDA228595C5CDL)   /*  279 */,
            unchecked((long) 0x661F81FD99052A33L)   /*  280 */,    unchecked((long) 0x8736E641DB0F7B76L)   /*  281 */,
            unchecked((long) 0x15227725418E5307L)   /*  282 */,    unchecked((long) 0xE25F7F46162EB2FAL)   /*  283 */,
            unchecked((long) 0x48A8B2126C13D9FEL)   /*  284 */,    unchecked((long) 0xAFDC541792E76EEAL)   /*  285 */,
            unchecked((long) 0x03D912BFC6D1898FL)   /*  286 */,    unchecked((long) 0x31B1AAFA1B83F51BL)   /*  287 */,
            unchecked((long) 0xF1AC2796E42AB7D9L)   /*  288 */,    unchecked((long) 0x40A3A7D7FCD2EBACL)   /*  289 */,
            unchecked((long) 0x1056136D0AFBBCC5L)   /*  290 */,    unchecked((long) 0x7889E1DD9A6D0C85L)   /*  291 */,
            unchecked((long) 0xD33525782A7974AAL)   /*  292 */,    unchecked((long) 0xA7E25D09078AC09BL)   /*  293 */,
            unchecked((long) 0xBD4138B3EAC6EDD0L)   /*  294 */,    unchecked((long) 0x920ABFBE71EB9E70L)   /*  295 */,
            unchecked((long) 0xA2A5D0F54FC2625CL)   /*  296 */,    unchecked((long) 0xC054E36B0B1290A3L)   /*  297 */,
            unchecked((long) 0xF6DD59FF62FE932BL)   /*  298 */,    unchecked((long) 0x3537354511A8AC7DL)   /*  299 */,
            unchecked((long) 0xCA845E9172FADCD4L)   /*  300 */,    unchecked((long) 0x84F82B60329D20DCL)   /*  301 */,
            unchecked((long) 0x79C62CE1CD672F18L)   /*  302 */,    unchecked((long) 0x8B09A2ADD124642CL)   /*  303 */,
            unchecked((long) 0xD0C1E96A19D9E726L)   /*  304 */,    unchecked((long) 0x5A786A9B4BA9500CL)   /*  305 */,
            unchecked((long) 0x0E020336634C43F3L)   /*  306 */,    unchecked((long) 0xC17B474AEB66D822L)   /*  307 */,
            unchecked((long) 0x6A731AE3EC9BAAC2L)   /*  308 */,    unchecked((long) 0x8226667AE0840258L)   /*  309 */,
            unchecked((long) 0x67D4567691CAECA5L)   /*  310 */,    unchecked((long) 0x1D94155C4875ADB5L)   /*  311 */,
            unchecked((long) 0x6D00FD985B813FDFL)   /*  312 */,    unchecked((long) 0x51286EFCB774CD06L)   /*  313 */,
            unchecked((long) 0x5E8834471FA744AFL)   /*  314 */,    unchecked((long) 0xF72CA0AEE761AE2EL)   /*  315 */,
            unchecked((long) 0xBE40E4CDAEE8E09AL)   /*  316 */,    unchecked((long) 0xE9970BBB5118F665L)   /*  317 */,
            unchecked((long) 0x726E4BEB33DF1964L)   /*  318 */,    unchecked((long) 0x703B000729199762L)   /*  319 */,
            unchecked((long) 0x4631D816F5EF30A7L)   /*  320 */,    unchecked((long) 0xB880B5B51504A6BEL)   /*  321 */,
            unchecked((long) 0x641793C37ED84B6CL)   /*  322 */,    unchecked((long) 0x7B21ED77F6E97D96L)   /*  323 */,
            unchecked((long) 0x776306312EF96B73L)   /*  324 */,    unchecked((long) 0xAE528948E86FF3F4L)   /*  325 */,
            unchecked((long) 0x53DBD7F286A3F8F8L)   /*  326 */,    unchecked((long) 0x16CADCE74CFC1063L)   /*  327 */,
            unchecked((long) 0x005C19BDFA52C6DDL)   /*  328 */,    unchecked((long) 0x68868F5D64D46AD3L)   /*  329 */,
            unchecked((long) 0x3A9D512CCF1E186AL)   /*  330 */,    unchecked((long) 0x367E62C2385660AEL)   /*  331 */,
            unchecked((long) 0xE359E7EA77DCB1D7L)   /*  332 */,    unchecked((long) 0x526C0773749ABE6EL)   /*  333 */,
            unchecked((long) 0x735AE5F9D09F734BL)   /*  334 */,    unchecked((long) 0x493FC7CC8A558BA8L)   /*  335 */,
            unchecked((long) 0xB0B9C1533041AB45L)   /*  336 */,    unchecked((long) 0x321958BA470A59BDL)   /*  337 */,
            unchecked((long) 0x852DB00B5F46C393L)   /*  338 */,    unchecked((long) 0x91209B2BD336B0E5L)   /*  339 */,
            unchecked((long) 0x6E604F7D659EF19FL)   /*  340 */,    unchecked((long) 0xB99A8AE2782CCB24L)   /*  341 */,
            unchecked((long) 0xCCF52AB6C814C4C7L)   /*  342 */,    unchecked((long) 0x4727D9AFBE11727BL)   /*  343 */,
            unchecked((long) 0x7E950D0C0121B34DL)   /*  344 */,    unchecked((long) 0x756F435670AD471FL)   /*  345 */,
            unchecked((long) 0xF5ADD442615A6849L)   /*  346 */,    unchecked((long) 0x4E87E09980B9957AL)   /*  347 */,
            unchecked((long) 0x2ACFA1DF50AEE355L)   /*  348 */,    unchecked((long) 0xD898263AFD2FD556L)   /*  349 */,
            unchecked((long) 0xC8F4924DD80C8FD6L)   /*  350 */,    unchecked((long) 0xCF99CA3D754A173AL)   /*  351 */,
            unchecked((long) 0xFE477BACAF91BF3CL)   /*  352 */,    unchecked((long) 0xED5371F6D690C12DL)   /*  353 */,
            unchecked((long) 0x831A5C285E687094L)   /*  354 */,    unchecked((long) 0xC5D3C90A3708A0A4L)   /*  355 */,
            unchecked((long) 0x0F7F903717D06580L)   /*  356 */,    unchecked((long) 0x19F9BB13B8FDF27FL)   /*  357 */,
            unchecked((long) 0xB1BD6F1B4D502843L)   /*  358 */,    unchecked((long) 0x1C761BA38FFF4012L)   /*  359 */,
            unchecked((long) 0x0D1530C4E2E21F3BL)   /*  360 */,    unchecked((long) 0x8943CE69A7372C8AL)   /*  361 */,
            unchecked((long) 0xE5184E11FEB5CE66L)   /*  362 */,    unchecked((long) 0x618BDB80BD736621L)   /*  363 */,
            unchecked((long) 0x7D29BAD68B574D0BL)   /*  364 */,    unchecked((long) 0x81BB613E25E6FE5BL)   /*  365 */,
            unchecked((long) 0x071C9C10BC07913FL)   /*  366 */,    unchecked((long) 0xC7BEEB7909AC2D97L)   /*  367 */,
            unchecked((long) 0xC3E58D353BC5D757L)   /*  368 */,    unchecked((long) 0xEB017892F38F61E8L)   /*  369 */,
            unchecked((long) 0xD4EFFB9C9B1CC21AL)   /*  370 */,    unchecked((long) 0x99727D26F494F7ABL)   /*  371 */,
            unchecked((long) 0xA3E063A2956B3E03L)   /*  372 */,    unchecked((long) 0x9D4A8B9A4AA09C30L)   /*  373 */,
            unchecked((long) 0x3F6AB7D500090FB4L)   /*  374 */,    unchecked((long) 0x9CC0F2A057268AC0L)   /*  375 */,
            unchecked((long) 0x3DEE9D2DEDBF42D1L)   /*  376 */,    unchecked((long) 0x330F49C87960A972L)   /*  377 */,
            unchecked((long) 0xC6B2720287421B41L)   /*  378 */,    unchecked((long) 0x0AC59EC07C00369CL)   /*  379 */,
            unchecked((long) 0xEF4EAC49CB353425L)   /*  380 */,    unchecked((long) 0xF450244EEF0129D8L)   /*  381 */,
            unchecked((long) 0x8ACC46E5CAF4DEB6L)   /*  382 */,    unchecked((long) 0x2FFEAB63989263F7L)   /*  383 */,
            unchecked((long) 0x8F7CB9FE5D7A4578L)   /*  384 */,    unchecked((long) 0x5BD8F7644E634635L)   /*  385 */,
            unchecked((long) 0x427A7315BF2DC900L)   /*  386 */,    unchecked((long) 0x17D0C4AA2125261CL)   /*  387 */,
            unchecked((long) 0x3992486C93518E50L)   /*  388 */,    unchecked((long) 0xB4CBFEE0A2D7D4C3L)   /*  389 */,
            unchecked((long) 0x7C75D6202C5DDD8DL)   /*  390 */,    unchecked((long) 0xDBC295D8E35B6C61L)   /*  391 */,
            unchecked((long) 0x60B369D302032B19L)   /*  392 */,    unchecked((long) 0xCE42685FDCE44132L)   /*  393 */,
            unchecked((long) 0x06F3DDB9DDF65610L)   /*  394 */,    unchecked((long) 0x8EA4D21DB5E148F0L)   /*  395 */,
            unchecked((long) 0x20B0FCE62FCD496FL)   /*  396 */,    unchecked((long) 0x2C1B912358B0EE31L)   /*  397 */,
            unchecked((long) 0xB28317B818F5A308L)   /*  398 */,    unchecked((long) 0xA89C1E189CA6D2CFL)   /*  399 */,
            unchecked((long) 0x0C6B18576AAADBC8L)   /*  400 */,    unchecked((long) 0xB65DEAA91299FAE3L)   /*  401 */,
            unchecked((long) 0xFB2B794B7F1027E7L)   /*  402 */,    unchecked((long) 0x04E4317F443B5BEBL)   /*  403 */,
            unchecked((long) 0x4B852D325939D0A6L)   /*  404 */,    unchecked((long) 0xD5AE6BEEFB207FFCL)   /*  405 */,
            unchecked((long) 0x309682B281C7D374L)   /*  406 */,    unchecked((long) 0xBAE309A194C3B475L)   /*  407 */,
            unchecked((long) 0x8CC3F97B13B49F05L)   /*  408 */,    unchecked((long) 0x98A9422FF8293967L)   /*  409 */,
            unchecked((long) 0x244B16B01076FF7CL)   /*  410 */,    unchecked((long) 0xF8BF571C663D67EEL)   /*  411 */,
            unchecked((long) 0x1F0D6758EEE30DA1L)   /*  412 */,    unchecked((long) 0xC9B611D97ADEB9B7L)   /*  413 */,
            unchecked((long) 0xB7AFD5887B6C57A2L)   /*  414 */,    unchecked((long) 0x6290AE846B984FE1L)   /*  415 */,
            unchecked((long) 0x94DF4CDEACC1A5FDL)   /*  416 */,    unchecked((long) 0x058A5BD1C5483AFFL)   /*  417 */,
            unchecked((long) 0x63166CC142BA3C37L)   /*  418 */,    unchecked((long) 0x8DB8526EB2F76F40L)   /*  419 */,
            unchecked((long) 0xE10880036F0D6D4EL)   /*  420 */,    unchecked((long) 0x9E0523C9971D311DL)   /*  421 */,
            unchecked((long) 0x45EC2824CC7CD691L)   /*  422 */,    unchecked((long) 0x575B8359E62382C9L)   /*  423 */,
            unchecked((long) 0xFA9E400DC4889995L)   /*  424 */,    unchecked((long) 0xD1823ECB45721568L)   /*  425 */,
            unchecked((long) 0xDAFD983B8206082FL)   /*  426 */,    unchecked((long) 0xAA7D29082386A8CBL)   /*  427 */,
            unchecked((long) 0x269FCD4403B87588L)   /*  428 */,    unchecked((long) 0x1B91F5F728BDD1E0L)   /*  429 */,
            unchecked((long) 0xE4669F39040201F6L)   /*  430 */,    unchecked((long) 0x7A1D7C218CF04ADEL)   /*  431 */,
            unchecked((long) 0x65623C29D79CE5CEL)   /*  432 */,    unchecked((long) 0x2368449096C00BB1L)   /*  433 */,
            unchecked((long) 0xAB9BF1879DA503BAL)   /*  434 */,    unchecked((long) 0xBC23ECB1A458058EL)   /*  435 */,
            unchecked((long) 0x9A58DF01BB401ECCL)   /*  436 */,    unchecked((long) 0xA070E868A85F143DL)   /*  437 */,
            unchecked((long) 0x4FF188307DF2239EL)   /*  438 */,    unchecked((long) 0x14D565B41A641183L)   /*  439 */,
            unchecked((long) 0xEE13337452701602L)   /*  440 */,    unchecked((long) 0x950E3DCF3F285E09L)   /*  441 */,
            unchecked((long) 0x59930254B9C80953L)   /*  442 */,    unchecked((long) 0x3BF299408930DA6DL)   /*  443 */,
            unchecked((long) 0xA955943F53691387L)   /*  444 */,    unchecked((long) 0xA15EDECAA9CB8784L)   /*  445 */,
            unchecked((long) 0x29142127352BE9A0L)   /*  446 */,    unchecked((long) 0x76F0371FFF4E7AFBL)   /*  447 */,
            unchecked((long) 0x0239F450274F2228L)   /*  448 */,    unchecked((long) 0xBB073AF01D5E868BL)   /*  449 */,
            unchecked((long) 0xBFC80571C10E96C1L)   /*  450 */,    unchecked((long) 0xD267088568222E23L)   /*  451 */,
            unchecked((long) 0x9671A3D48E80B5B0L)   /*  452 */,    unchecked((long) 0x55B5D38AE193BB81L)   /*  453 */,
            unchecked((long) 0x693AE2D0A18B04B8L)   /*  454 */,    unchecked((long) 0x5C48B4ECADD5335FL)   /*  455 */,
            unchecked((long) 0xFD743B194916A1CAL)   /*  456 */,    unchecked((long) 0x2577018134BE98C4L)   /*  457 */,
            unchecked((long) 0xE77987E83C54A4ADL)   /*  458 */,    unchecked((long) 0x28E11014DA33E1B9L)   /*  459 */,
            unchecked((long) 0x270CC59E226AA213L)   /*  460 */,    unchecked((long) 0x71495F756D1A5F60L)   /*  461 */,
            unchecked((long) 0x9BE853FB60AFEF77L)   /*  462 */,    unchecked((long) 0xADC786A7F7443DBFL)   /*  463 */,
            unchecked((long) 0x0904456173B29A82L)   /*  464 */,    unchecked((long) 0x58BC7A66C232BD5EL)   /*  465 */,
            unchecked((long) 0xF306558C673AC8B2L)   /*  466 */,    unchecked((long) 0x41F639C6B6C9772AL)   /*  467 */,
            unchecked((long) 0x216DEFE99FDA35DAL)   /*  468 */,    unchecked((long) 0x11640CC71C7BE615L)   /*  469 */,
            unchecked((long) 0x93C43694565C5527L)   /*  470 */,    unchecked((long) 0xEA038E6246777839L)   /*  471 */,
            unchecked((long) 0xF9ABF3CE5A3E2469L)   /*  472 */,    unchecked((long) 0x741E768D0FD312D2L)   /*  473 */,
            unchecked((long) 0x0144B883CED652C6L)   /*  474 */,    unchecked((long) 0xC20B5A5BA33F8552L)   /*  475 */,
            unchecked((long) 0x1AE69633C3435A9DL)   /*  476 */,    unchecked((long) 0x97A28CA4088CFDECL)   /*  477 */,
            unchecked((long) 0x8824A43C1E96F420L)   /*  478 */,    unchecked((long) 0x37612FA66EEEA746L)   /*  479 */,
            unchecked((long) 0x6B4CB165F9CF0E5AL)   /*  480 */,    unchecked((long) 0x43AA1C06A0ABFB4AL)   /*  481 */,
            unchecked((long) 0x7F4DC26FF162796BL)   /*  482 */,    unchecked((long) 0x6CBACC8E54ED9B0FL)   /*  483 */,
            unchecked((long) 0xA6B7FFEFD2BB253EL)   /*  484 */,    unchecked((long) 0x2E25BC95B0A29D4FL)   /*  485 */,
            unchecked((long) 0x86D6A58BDEF1388CL)   /*  486 */,    unchecked((long) 0xDED74AC576B6F054L)   /*  487 */,
            unchecked((long) 0x8030BDBC2B45805DL)   /*  488 */,    unchecked((long) 0x3C81AF70E94D9289L)   /*  489 */,
            unchecked((long) 0x3EFF6DDA9E3100DBL)   /*  490 */,    unchecked((long) 0xB38DC39FDFCC8847L)   /*  491 */,
            unchecked((long) 0x123885528D17B87EL)   /*  492 */,    unchecked((long) 0xF2DA0ED240B1B642L)   /*  493 */,
            unchecked((long) 0x44CEFADCD54BF9A9L)   /*  494 */,    unchecked((long) 0x1312200E433C7EE6L)   /*  495 */,
            unchecked((long) 0x9FFCC84F3A78C748L)   /*  496 */,    unchecked((long) 0xF0CD1F72248576BBL)   /*  497 */,
            unchecked((long) 0xEC6974053638CFE4L)   /*  498 */,    unchecked((long) 0x2BA7B67C0CEC4E4CL)   /*  499 */,
            unchecked((long) 0xAC2F4DF3E5CE32EDL)   /*  500 */,    unchecked((long) 0xCB33D14326EA4C11L)   /*  501 */,
            unchecked((long) 0xA4E9044CC77E58BCL)   /*  502 */,    unchecked((long) 0x5F513293D934FCEFL)   /*  503 */,
            unchecked((long) 0x5DC9645506E55444L)   /*  504 */,    unchecked((long) 0x50DE418F317DE40AL)   /*  505 */,
            unchecked((long) 0x388CB31A69DDE259L)   /*  506 */,    unchecked((long) 0x2DB4A83455820A86L)   /*  507 */,
            unchecked((long) 0x9010A91E84711AE9L)   /*  508 */,    unchecked((long) 0x4DF7F0B7B1498371L)   /*  509 */,
            unchecked((long) 0xD62A2EABC0977179L)   /*  510 */,    unchecked((long) 0x22FAC097AA8D5C0EL)   /*  511 */,
        };

        private static readonly long[] t3 = {
            unchecked((long) 0xF49FCC2FF1DAF39BL)   /*  512 */,    unchecked((long) 0x487FD5C66FF29281L)   /*  513 */,
            unchecked((long) 0xE8A30667FCDCA83FL)   /*  514 */,    unchecked((long) 0x2C9B4BE3D2FCCE63L)   /*  515 */,
            unchecked((long) 0xDA3FF74B93FBBBC2L)   /*  516 */,    unchecked((long) 0x2FA165D2FE70BA66L)   /*  517 */,
            unchecked((long) 0xA103E279970E93D4L)   /*  518 */,    unchecked((long) 0xBECDEC77B0E45E71L)   /*  519 */,
            unchecked((long) 0xCFB41E723985E497L)   /*  520 */,    unchecked((long) 0xB70AAA025EF75017L)   /*  521 */,
            unchecked((long) 0xD42309F03840B8E0L)   /*  522 */,    unchecked((long) 0x8EFC1AD035898579L)   /*  523 */,
            unchecked((long) 0x96C6920BE2B2ABC5L)   /*  524 */,    unchecked((long) 0x66AF4163375A9172L)   /*  525 */,
            unchecked((long) 0x2174ABDCCA7127FBL)   /*  526 */,    unchecked((long) 0xB33CCEA64A72FF41L)   /*  527 */,
            unchecked((long) 0xF04A4933083066A5L)   /*  528 */,    unchecked((long) 0x8D970ACDD7289AF5L)   /*  529 */,
            unchecked((long) 0x8F96E8E031C8C25EL)   /*  530 */,    unchecked((long) 0xF3FEC02276875D47L)   /*  531 */,
            unchecked((long) 0xEC7BF310056190DDL)   /*  532 */,    unchecked((long) 0xF5ADB0AEBB0F1491L)   /*  533 */,
            unchecked((long) 0x9B50F8850FD58892L)   /*  534 */,    unchecked((long) 0x4975488358B74DE8L)   /*  535 */,
            unchecked((long) 0xA3354FF691531C61L)   /*  536 */,    unchecked((long) 0x0702BBE481D2C6EEL)   /*  537 */,
            unchecked((long) 0x89FB24057DEDED98L)   /*  538 */,    unchecked((long) 0xAC3075138596E902L)   /*  539 */,
            unchecked((long) 0x1D2D3580172772EDL)   /*  540 */,    unchecked((long) 0xEB738FC28E6BC30DL)   /*  541 */,
            unchecked((long) 0x5854EF8F63044326L)   /*  542 */,    unchecked((long) 0x9E5C52325ADD3BBEL)   /*  543 */,
            unchecked((long) 0x90AA53CF325C4623L)   /*  544 */,    unchecked((long) 0xC1D24D51349DD067L)   /*  545 */,
            unchecked((long) 0x2051CFEEA69EA624L)   /*  546 */,    unchecked((long) 0x13220F0A862E7E4FL)   /*  547 */,
            unchecked((long) 0xCE39399404E04864L)   /*  548 */,    unchecked((long) 0xD9C42CA47086FCB7L)   /*  549 */,
            unchecked((long) 0x685AD2238A03E7CCL)   /*  550 */,    unchecked((long) 0x066484B2AB2FF1DBL)   /*  551 */,
            unchecked((long) 0xFE9D5D70EFBF79ECL)   /*  552 */,    unchecked((long) 0x5B13B9DD9C481854L)   /*  553 */,
            unchecked((long) 0x15F0D475ED1509ADL)   /*  554 */,    unchecked((long) 0x0BEBCD060EC79851L)   /*  555 */,
            unchecked((long) 0xD58C6791183AB7F8L)   /*  556 */,    unchecked((long) 0xD1187C5052F3EEE4L)   /*  557 */,
            unchecked((long) 0xC95D1192E54E82FFL)   /*  558 */,    unchecked((long) 0x86EEA14CB9AC6CA2L)   /*  559 */,
            unchecked((long) 0x3485BEB153677D5DL)   /*  560 */,    unchecked((long) 0xDD191D781F8C492AL)   /*  561 */,
            unchecked((long) 0xF60866BAA784EBF9L)   /*  562 */,    unchecked((long) 0x518F643BA2D08C74L)   /*  563 */,
            unchecked((long) 0x8852E956E1087C22L)   /*  564 */,    unchecked((long) 0xA768CB8DC410AE8DL)   /*  565 */,
            unchecked((long) 0x38047726BFEC8E1AL)   /*  566 */,    unchecked((long) 0xA67738B4CD3B45AAL)   /*  567 */,
            unchecked((long) 0xAD16691CEC0DDE19L)   /*  568 */,    unchecked((long) 0xC6D4319380462E07L)   /*  569 */,
            unchecked((long) 0xC5A5876D0BA61938L)   /*  570 */,    unchecked((long) 0x16B9FA1FA58FD840L)   /*  571 */,
            unchecked((long) 0x188AB1173CA74F18L)   /*  572 */,    unchecked((long) 0xABDA2F98C99C021FL)   /*  573 */,
            unchecked((long) 0x3E0580AB134AE816L)   /*  574 */,    unchecked((long) 0x5F3B05B773645ABBL)   /*  575 */,
            unchecked((long) 0x2501A2BE5575F2F6L)   /*  576 */,    unchecked((long) 0x1B2F74004E7E8BA9L)   /*  577 */,
            unchecked((long) 0x1CD7580371E8D953L)   /*  578 */,    unchecked((long) 0x7F6ED89562764E30L)   /*  579 */,
            unchecked((long) 0xB15926FF596F003DL)   /*  580 */,    unchecked((long) 0x9F65293DA8C5D6B9L)   /*  581 */,
            unchecked((long) 0x6ECEF04DD690F84CL)   /*  582 */,    unchecked((long) 0x4782275FFF33AF88L)   /*  583 */,
            unchecked((long) 0xE41433083F820801L)   /*  584 */,    unchecked((long) 0xFD0DFE409A1AF9B5L)   /*  585 */,
            unchecked((long) 0x4325A3342CDB396BL)   /*  586 */,    unchecked((long) 0x8AE77E62B301B252L)   /*  587 */,
            unchecked((long) 0xC36F9E9F6655615AL)   /*  588 */,    unchecked((long) 0x85455A2D92D32C09L)   /*  589 */,
            unchecked((long) 0xF2C7DEA949477485L)   /*  590 */,    unchecked((long) 0x63CFB4C133A39EBAL)   /*  591 */,
            unchecked((long) 0x83B040CC6EBC5462L)   /*  592 */,    unchecked((long) 0x3B9454C8FDB326B0L)   /*  593 */,
            unchecked((long) 0x56F56A9E87FFD78CL)   /*  594 */,    unchecked((long) 0x2DC2940D99F42BC6L)   /*  595 */,
            unchecked((long) 0x98F7DF096B096E2DL)   /*  596 */,    unchecked((long) 0x19A6E01E3AD852BFL)   /*  597 */,
            unchecked((long) 0x42A99CCBDBD4B40BL)   /*  598 */,    unchecked((long) 0xA59998AF45E9C559L)   /*  599 */,
            unchecked((long) 0x366295E807D93186L)   /*  600 */,    unchecked((long) 0x6B48181BFAA1F773L)   /*  601 */,
            unchecked((long) 0x1FEC57E2157A0A1DL)   /*  602 */,    unchecked((long) 0x4667446AF6201AD5L)   /*  603 */,
            unchecked((long) 0xE615EBCACFB0F075L)   /*  604 */,    unchecked((long) 0xB8F31F4F68290778L)   /*  605 */,
            unchecked((long) 0x22713ED6CE22D11EL)   /*  606 */,    unchecked((long) 0x3057C1A72EC3C93BL)   /*  607 */,
            unchecked((long) 0xCB46ACC37C3F1F2FL)   /*  608 */,    unchecked((long) 0xDBB893FD02AAF50EL)   /*  609 */,
            unchecked((long) 0x331FD92E600B9FCFL)   /*  610 */,    unchecked((long) 0xA498F96148EA3AD6L)   /*  611 */,
            unchecked((long) 0xA8D8426E8B6A83EAL)   /*  612 */,    unchecked((long) 0xA089B274B7735CDCL)   /*  613 */,
            unchecked((long) 0x87F6B3731E524A11L)   /*  614 */,    unchecked((long) 0x118808E5CBC96749L)   /*  615 */,
            unchecked((long) 0x9906E4C7B19BD394L)   /*  616 */,    unchecked((long) 0xAFED7F7E9B24A20CL)   /*  617 */,
            unchecked((long) 0x6509EADEEB3644A7L)   /*  618 */,    unchecked((long) 0x6C1EF1D3E8EF0EDEL)   /*  619 */,
            unchecked((long) 0xB9C97D43E9798FB4L)   /*  620 */,    unchecked((long) 0xA2F2D784740C28A3L)   /*  621 */,
            unchecked((long) 0x7B8496476197566FL)   /*  622 */,    unchecked((long) 0x7A5BE3E6B65F069DL)   /*  623 */,
            unchecked((long) 0xF96330ED78BE6F10L)   /*  624 */,    unchecked((long) 0xEEE60DE77A076A15L)   /*  625 */,
            unchecked((long) 0x2B4BEE4AA08B9BD0L)   /*  626 */,    unchecked((long) 0x6A56A63EC7B8894EL)   /*  627 */,
            unchecked((long) 0x02121359BA34FEF4L)   /*  628 */,    unchecked((long) 0x4CBF99F8283703FCL)   /*  629 */,
            unchecked((long) 0x398071350CAF30C8L)   /*  630 */,    unchecked((long) 0xD0A77A89F017687AL)   /*  631 */,
            unchecked((long) 0xF1C1A9EB9E423569L)   /*  632 */,    unchecked((long) 0x8C7976282DEE8199L)   /*  633 */,
            unchecked((long) 0x5D1737A5DD1F7ABDL)   /*  634 */,    unchecked((long) 0x4F53433C09A9FA80L)   /*  635 */,
            unchecked((long) 0xFA8B0C53DF7CA1D9L)   /*  636 */,    unchecked((long) 0x3FD9DCBC886CCB77L)   /*  637 */,
            unchecked((long) 0xC040917CA91B4720L)   /*  638 */,    unchecked((long) 0x7DD00142F9D1DCDFL)   /*  639 */,
            unchecked((long) 0x8476FC1D4F387B58L)   /*  640 */,    unchecked((long) 0x23F8E7C5F3316503L)   /*  641 */,
            unchecked((long) 0x032A2244E7E37339L)   /*  642 */,    unchecked((long) 0x5C87A5D750F5A74BL)   /*  643 */,
            unchecked((long) 0x082B4CC43698992EL)   /*  644 */,    unchecked((long) 0xDF917BECB858F63CL)   /*  645 */,
            unchecked((long) 0x3270B8FC5BF86DDAL)   /*  646 */,    unchecked((long) 0x10AE72BB29B5DD76L)   /*  647 */,
            unchecked((long) 0x576AC94E7700362BL)   /*  648 */,    unchecked((long) 0x1AD112DAC61EFB8FL)   /*  649 */,
            unchecked((long) 0x691BC30EC5FAA427L)   /*  650 */,    unchecked((long) 0xFF246311CC327143L)   /*  651 */,
            unchecked((long) 0x3142368E30E53206L)   /*  652 */,    unchecked((long) 0x71380E31E02CA396L)   /*  653 */,
            unchecked((long) 0x958D5C960AAD76F1L)   /*  654 */,    unchecked((long) 0xF8D6F430C16DA536L)   /*  655 */,
            unchecked((long) 0xC8FFD13F1BE7E1D2L)   /*  656 */,    unchecked((long) 0x7578AE66004DDBE1L)   /*  657 */,
            unchecked((long) 0x05833F01067BE646L)   /*  658 */,    unchecked((long) 0xBB34B5AD3BFE586DL)   /*  659 */,
            unchecked((long) 0x095F34C9A12B97F0L)   /*  660 */,    unchecked((long) 0x247AB64525D60CA8L)   /*  661 */,
            unchecked((long) 0xDCDBC6F3017477D1L)   /*  662 */,    unchecked((long) 0x4A2E14D4DECAD24DL)   /*  663 */,
            unchecked((long) 0xBDB5E6D9BE0A1EEBL)   /*  664 */,    unchecked((long) 0x2A7E70F7794301ABL)   /*  665 */,
            unchecked((long) 0xDEF42D8A270540FDL)   /*  666 */,    unchecked((long) 0x01078EC0A34C22C1L)   /*  667 */,
            unchecked((long) 0xE5DE511AF4C16387L)   /*  668 */,    unchecked((long) 0x7EBB3A52BD9A330AL)   /*  669 */,
            unchecked((long) 0x77697857AA7D6435L)   /*  670 */,    unchecked((long) 0x004E831603AE4C32L)   /*  671 */,
            unchecked((long) 0xE7A21020AD78E312L)   /*  672 */,    unchecked((long) 0x9D41A70C6AB420F2L)   /*  673 */,
            unchecked((long) 0x28E06C18EA1141E6L)   /*  674 */,    unchecked((long) 0xD2B28CBD984F6B28L)   /*  675 */,
            unchecked((long) 0x26B75F6C446E9D83L)   /*  676 */,    unchecked((long) 0xBA47568C4D418D7FL)   /*  677 */,
            unchecked((long) 0xD80BADBFE6183D8EL)   /*  678 */,    unchecked((long) 0x0E206D7F5F166044L)   /*  679 */,
            unchecked((long) 0xE258A43911CBCA3EL)   /*  680 */,    unchecked((long) 0x723A1746B21DC0BCL)   /*  681 */,
            unchecked((long) 0xC7CAA854F5D7CDD3L)   /*  682 */,    unchecked((long) 0x7CAC32883D261D9CL)   /*  683 */,
            unchecked((long) 0x7690C26423BA942CL)   /*  684 */,    unchecked((long) 0x17E55524478042B8L)   /*  685 */,
            unchecked((long) 0xE0BE477656A2389FL)   /*  686 */,    unchecked((long) 0x4D289B5E67AB2DA0L)   /*  687 */,
            unchecked((long) 0x44862B9C8FBBFD31L)   /*  688 */,    unchecked((long) 0xB47CC8049D141365L)   /*  689 */,
            unchecked((long) 0x822C1B362B91C793L)   /*  690 */,    unchecked((long) 0x4EB14655FB13DFD8L)   /*  691 */,
            unchecked((long) 0x1ECBBA0714E2A97BL)   /*  692 */,    unchecked((long) 0x6143459D5CDE5F14L)   /*  693 */,
            unchecked((long) 0x53A8FBF1D5F0AC89L)   /*  694 */,    unchecked((long) 0x97EA04D81C5E5B00L)   /*  695 */,
            unchecked((long) 0x622181A8D4FDB3F3L)   /*  696 */,    unchecked((long) 0xE9BCD341572A1208L)   /*  697 */,
            unchecked((long) 0x1411258643CCE58AL)   /*  698 */,    unchecked((long) 0x9144C5FEA4C6E0A4L)   /*  699 */,
            unchecked((long) 0x0D33D06565CF620FL)   /*  700 */,    unchecked((long) 0x54A48D489F219CA1L)   /*  701 */,
            unchecked((long) 0xC43E5EAC6D63C821L)   /*  702 */,    unchecked((long) 0xA9728B3A72770DAFL)   /*  703 */,
            unchecked((long) 0xD7934E7B20DF87EFL)   /*  704 */,    unchecked((long) 0xE35503B61A3E86E5L)   /*  705 */,
            unchecked((long) 0xCAE321FBC819D504L)   /*  706 */,    unchecked((long) 0x129A50B3AC60BFA6L)   /*  707 */,
            unchecked((long) 0xCD5E68EA7E9FB6C3L)   /*  708 */,    unchecked((long) 0xB01C90199483B1C7L)   /*  709 */,
            unchecked((long) 0x3DE93CD5C295376CL)   /*  710 */,    unchecked((long) 0xAED52EDF2AB9AD13L)   /*  711 */,
            unchecked((long) 0x2E60F512C0A07884L)   /*  712 */,    unchecked((long) 0xBC3D86A3E36210C9L)   /*  713 */,
            unchecked((long) 0x35269D9B163951CEL)   /*  714 */,    unchecked((long) 0x0C7D6E2AD0CDB5FAL)   /*  715 */,
            unchecked((long) 0x59E86297D87F5733L)   /*  716 */,    unchecked((long) 0x298EF221898DB0E7L)   /*  717 */,
            unchecked((long) 0x55000029D1A5AA7EL)   /*  718 */,    unchecked((long) 0x8BC08AE1B5061B45L)   /*  719 */,
            unchecked((long) 0xC2C31C2B6C92703AL)   /*  720 */,    unchecked((long) 0x94CC596BAF25EF42L)   /*  721 */,
            unchecked((long) 0x0A1D73DB22540456L)   /*  722 */,    unchecked((long) 0x04B6A0F9D9C4179AL)   /*  723 */,
            unchecked((long) 0xEFFDAFA2AE3D3C60L)   /*  724 */,    unchecked((long) 0xF7C8075BB49496C4L)   /*  725 */,
            unchecked((long) 0x9CC5C7141D1CD4E3L)   /*  726 */,    unchecked((long) 0x78BD1638218E5534L)   /*  727 */,
            unchecked((long) 0xB2F11568F850246AL)   /*  728 */,    unchecked((long) 0xEDFABCFA9502BC29L)   /*  729 */,
            unchecked((long) 0x796CE5F2DA23051BL)   /*  730 */,    unchecked((long) 0xAAE128B0DC93537CL)   /*  731 */,
            unchecked((long) 0x3A493DA0EE4B29AEL)   /*  732 */,    unchecked((long) 0xB5DF6B2C416895D7L)   /*  733 */,
            unchecked((long) 0xFCABBD25122D7F37L)   /*  734 */,    unchecked((long) 0x70810B58105DC4B1L)   /*  735 */,
            unchecked((long) 0xE10FDD37F7882A90L)   /*  736 */,    unchecked((long) 0x524DCAB5518A3F5CL)   /*  737 */,
            unchecked((long) 0x3C9E85878451255BL)   /*  738 */,    unchecked((long) 0x4029828119BD34E2L)   /*  739 */,
            unchecked((long) 0x74A05B6F5D3CECCBL)   /*  740 */,    unchecked((long) 0xB610021542E13ECAL)   /*  741 */,
            unchecked((long) 0x0FF979D12F59E2ACL)   /*  742 */,    unchecked((long) 0x6037DA27E4F9CC50L)   /*  743 */,
            unchecked((long) 0x5E92975A0DF1847DL)   /*  744 */,    unchecked((long) 0xD66DE190D3E623FEL)   /*  745 */,
            unchecked((long) 0x5032D6B87B568048L)   /*  746 */,    unchecked((long) 0x9A36B7CE8235216EL)   /*  747 */,
            unchecked((long) 0x80272A7A24F64B4AL)   /*  748 */,    unchecked((long) 0x93EFED8B8C6916F7L)   /*  749 */,
            unchecked((long) 0x37DDBFF44CCE1555L)   /*  750 */,    unchecked((long) 0x4B95DB5D4B99BD25L)   /*  751 */,
            unchecked((long) 0x92D3FDA169812FC0L)   /*  752 */,    unchecked((long) 0xFB1A4A9A90660BB6L)   /*  753 */,
            unchecked((long) 0x730C196946A4B9B2L)   /*  754 */,    unchecked((long) 0x81E289AA7F49DA68L)   /*  755 */,
            unchecked((long) 0x64669A0F83B1A05FL)   /*  756 */,    unchecked((long) 0x27B3FF7D9644F48BL)   /*  757 */,
            unchecked((long) 0xCC6B615C8DB675B3L)   /*  758 */,    unchecked((long) 0x674F20B9BCEBBE95L)   /*  759 */,
            unchecked((long) 0x6F31238275655982L)   /*  760 */,    unchecked((long) 0x5AE488713E45CF05L)   /*  761 */,
            unchecked((long) 0xBF619F9954C21157L)   /*  762 */,    unchecked((long) 0xEABAC46040A8EAE9L)   /*  763 */,
            unchecked((long) 0x454C6FE9F2C0C1CDL)   /*  764 */,    unchecked((long) 0x419CF6496412691CL)   /*  765 */,
            unchecked((long) 0xD3DC3BEF265B0F70L)   /*  766 */,    unchecked((long) 0x6D0E60F5C3578A9EL)   /*  767 */,
        };

        private static readonly long[] t4 = {
            unchecked((long) 0x5B0E608526323C55L)   /*  768 */,    unchecked((long) 0x1A46C1A9FA1B59F5L)   /*  769 */,
            unchecked((long) 0xA9E245A17C4C8FFAL)   /*  770 */,    unchecked((long) 0x65CA5159DB2955D7L)   /*  771 */,
            unchecked((long) 0x05DB0A76CE35AFC2L)   /*  772 */,    unchecked((long) 0x81EAC77EA9113D45L)   /*  773 */,
            unchecked((long) 0x528EF88AB6AC0A0DL)   /*  774 */,    unchecked((long) 0xA09EA253597BE3FFL)   /*  775 */,
            unchecked((long) 0x430DDFB3AC48CD56L)   /*  776 */,    unchecked((long) 0xC4B3A67AF45CE46FL)   /*  777 */,
            unchecked((long) 0x4ECECFD8FBE2D05EL)   /*  778 */,    unchecked((long) 0x3EF56F10B39935F0L)   /*  779 */,
            unchecked((long) 0x0B22D6829CD619C6L)   /*  780 */,    unchecked((long) 0x17FD460A74DF2069L)   /*  781 */,
            unchecked((long) 0x6CF8CC8E8510ED40L)   /*  782 */,    unchecked((long) 0xD6C824BF3A6ECAA7L)   /*  783 */,
            unchecked((long) 0x61243D581A817049L)   /*  784 */,    unchecked((long) 0x048BACB6BBC163A2L)   /*  785 */,
            unchecked((long) 0xD9A38AC27D44CC32L)   /*  786 */,    unchecked((long) 0x7FDDFF5BAAF410ABL)   /*  787 */,
            unchecked((long) 0xAD6D495AA804824BL)   /*  788 */,    unchecked((long) 0xE1A6A74F2D8C9F94L)   /*  789 */,
            unchecked((long) 0xD4F7851235DEE8E3L)   /*  790 */,    unchecked((long) 0xFD4B7F886540D893L)   /*  791 */,
            unchecked((long) 0x247C20042AA4BFDAL)   /*  792 */,    unchecked((long) 0x096EA1C517D1327CL)   /*  793 */,
            unchecked((long) 0xD56966B4361A6685L)   /*  794 */,    unchecked((long) 0x277DA5C31221057DL)   /*  795 */,
            unchecked((long) 0x94D59893A43ACFF7L)   /*  796 */,    unchecked((long) 0x64F0C51CCDC02281L)   /*  797 */,
            unchecked((long) 0x3D33BCC4FF6189DBL)   /*  798 */,    unchecked((long) 0xE005CB184CE66AF1L)   /*  799 */,
            unchecked((long) 0xFF5CCD1D1DB99BEAL)   /*  800 */,    unchecked((long) 0xB0B854A7FE42980FL)   /*  801 */,
            unchecked((long) 0x7BD46A6A718D4B9FL)   /*  802 */,    unchecked((long) 0xD10FA8CC22A5FD8CL)   /*  803 */,
            unchecked((long) 0xD31484952BE4BD31L)   /*  804 */,    unchecked((long) 0xC7FA975FCB243847L)   /*  805 */,
            unchecked((long) 0x4886ED1E5846C407L)   /*  806 */,    unchecked((long) 0x28CDDB791EB70B04L)   /*  807 */,
            unchecked((long) 0xC2B00BE2F573417FL)   /*  808 */,    unchecked((long) 0x5C9590452180F877L)   /*  809 */,
            unchecked((long) 0x7A6BDDFFF370EB00L)   /*  810 */,    unchecked((long) 0xCE509E38D6D9D6A4L)   /*  811 */,
            unchecked((long) 0xEBEB0F00647FA702L)   /*  812 */,    unchecked((long) 0x1DCC06CF76606F06L)   /*  813 */,
            unchecked((long) 0xE4D9F28BA286FF0AL)   /*  814 */,    unchecked((long) 0xD85A305DC918C262L)   /*  815 */,
            unchecked((long) 0x475B1D8732225F54L)   /*  816 */,    unchecked((long) 0x2D4FB51668CCB5FEL)   /*  817 */,
            unchecked((long) 0xA679B9D9D72BBA20L)   /*  818 */,    unchecked((long) 0x53841C0D912D43A5L)   /*  819 */,
            unchecked((long) 0x3B7EAA48BF12A4E8L)   /*  820 */,    unchecked((long) 0x781E0E47F22F1DDFL)   /*  821 */,
            unchecked((long) 0xEFF20CE60AB50973L)   /*  822 */,    unchecked((long) 0x20D261D19DFFB742L)   /*  823 */,
            unchecked((long) 0x16A12B03062A2E39L)   /*  824 */,    unchecked((long) 0x1960EB2239650495L)   /*  825 */,
            unchecked((long) 0x251C16FED50EB8B8L)   /*  826 */,    unchecked((long) 0x9AC0C330F826016EL)   /*  827 */,
            unchecked((long) 0xED152665953E7671L)   /*  828 */,    unchecked((long) 0x02D63194A6369570L)   /*  829 */,
            unchecked((long) 0x5074F08394B1C987L)   /*  830 */,    unchecked((long) 0x70BA598C90B25CE1L)   /*  831 */,
            unchecked((long) 0x794A15810B9742F6L)   /*  832 */,    unchecked((long) 0x0D5925E9FCAF8C6CL)   /*  833 */,
            unchecked((long) 0x3067716CD868744EL)   /*  834 */,    unchecked((long) 0x910AB077E8D7731BL)   /*  835 */,
            unchecked((long) 0x6A61BBDB5AC42F61L)   /*  836 */,    unchecked((long) 0x93513EFBF0851567L)   /*  837 */,
            unchecked((long) 0xF494724B9E83E9D5L)   /*  838 */,    unchecked((long) 0xE887E1985C09648DL)   /*  839 */,
            unchecked((long) 0x34B1D3C675370CFDL)   /*  840 */,    unchecked((long) 0xDC35E433BC0D255DL)   /*  841 */,
            unchecked((long) 0xD0AAB84234131BE0L)   /*  842 */,    unchecked((long) 0x08042A50B48B7EAFL)   /*  843 */,
            unchecked((long) 0x9997C4EE44A3AB35L)   /*  844 */,    unchecked((long) 0x829A7B49201799D0L)   /*  845 */,
            unchecked((long) 0x263B8307B7C54441L)   /*  846 */,    unchecked((long) 0x752F95F4FD6A6CA6L)   /*  847 */,
            unchecked((long) 0x927217402C08C6E5L)   /*  848 */,    unchecked((long) 0x2A8AB754A795D9EEL)   /*  849 */,
            unchecked((long) 0xA442F7552F72943DL)   /*  850 */,    unchecked((long) 0x2C31334E19781208L)   /*  851 */,
            unchecked((long) 0x4FA98D7CEAEE6291L)   /*  852 */,    unchecked((long) 0x55C3862F665DB309L)   /*  853 */,
            unchecked((long) 0xBD0610175D53B1F3L)   /*  854 */,    unchecked((long) 0x46FE6CB840413F27L)   /*  855 */,
            unchecked((long) 0x3FE03792DF0CFA59L)   /*  856 */,    unchecked((long) 0xCFE700372EB85E8FL)   /*  857 */,
            unchecked((long) 0xA7BE29E7ADBCE118L)   /*  858 */,    unchecked((long) 0xE544EE5CDE8431DDL)   /*  859 */,
            unchecked((long) 0x8A781B1B41F1873EL)   /*  860 */,    unchecked((long) 0xA5C94C78A0D2F0E7L)   /*  861 */,
            unchecked((long) 0x39412E2877B60728L)   /*  862 */,    unchecked((long) 0xA1265EF3AFC9A62CL)   /*  863 */,
            unchecked((long) 0xBCC2770C6A2506C5L)   /*  864 */,    unchecked((long) 0x3AB66DD5DCE1CE12L)   /*  865 */,
            unchecked((long) 0xE65499D04A675B37L)   /*  866 */,    unchecked((long) 0x7D8F523481BFD216L)   /*  867 */,
            unchecked((long) 0x0F6F64FCEC15F389L)   /*  868 */,    unchecked((long) 0x74EFBE618B5B13C8L)   /*  869 */,
            unchecked((long) 0xACDC82B714273E1DL)   /*  870 */,    unchecked((long) 0xDD40BFE003199D17L)   /*  871 */,
            unchecked((long) 0x37E99257E7E061F8L)   /*  872 */,    unchecked((long) 0xFA52626904775AAAL)   /*  873 */,
            unchecked((long) 0x8BBBF63A463D56F9L)   /*  874 */,    unchecked((long) 0xF0013F1543A26E64L)   /*  875 */,
            unchecked((long) 0xA8307E9F879EC898L)   /*  876 */,    unchecked((long) 0xCC4C27A4150177CCL)   /*  877 */,
            unchecked((long) 0x1B432F2CCA1D3348L)   /*  878 */,    unchecked((long) 0xDE1D1F8F9F6FA013L)   /*  879 */,
            unchecked((long) 0x606602A047A7DDD6L)   /*  880 */,    unchecked((long) 0xD237AB64CC1CB2C7L)   /*  881 */,
            unchecked((long) 0x9B938E7225FCD1D3L)   /*  882 */,    unchecked((long) 0xEC4E03708E0FF476L)   /*  883 */,
            unchecked((long) 0xFEB2FBDA3D03C12DL)   /*  884 */,    unchecked((long) 0xAE0BCED2EE43889AL)   /*  885 */,
            unchecked((long) 0x22CB8923EBFB4F43L)   /*  886 */,    unchecked((long) 0x69360D013CF7396DL)   /*  887 */,
            unchecked((long) 0x855E3602D2D4E022L)   /*  888 */,    unchecked((long) 0x073805BAD01F784CL)   /*  889 */,
            unchecked((long) 0x33E17A133852F546L)   /*  890 */,    unchecked((long) 0xDF4874058AC7B638L)   /*  891 */,
            unchecked((long) 0xBA92B29C678AA14AL)   /*  892 */,    unchecked((long) 0x0CE89FC76CFAADCDL)   /*  893 */,
            unchecked((long) 0x5F9D4E0908339E34L)   /*  894 */,    unchecked((long) 0xF1AFE9291F5923B9L)   /*  895 */,
            unchecked((long) 0x6E3480F60F4A265FL)   /*  896 */,    unchecked((long) 0xEEBF3A2AB29B841CL)   /*  897 */,
            unchecked((long) 0xE21938A88F91B4ADL)   /*  898 */,    unchecked((long) 0x57DFEFF845C6D3C3L)   /*  899 */,
            unchecked((long) 0x2F006B0BF62CAAF2L)   /*  900 */,    unchecked((long) 0x62F479EF6F75EE78L)   /*  901 */,
            unchecked((long) 0x11A55AD41C8916A9L)   /*  902 */,    unchecked((long) 0xF229D29084FED453L)   /*  903 */,
            unchecked((long) 0x42F1C27B16B000E6L)   /*  904 */,    unchecked((long) 0x2B1F76749823C074L)   /*  905 */,
            unchecked((long) 0x4B76ECA3C2745360L)   /*  906 */,    unchecked((long) 0x8C98F463B91691BDL)   /*  907 */,
            unchecked((long) 0x14BCC93CF1ADE66AL)   /*  908 */,    unchecked((long) 0x8885213E6D458397L)   /*  909 */,
            unchecked((long) 0x8E177DF0274D4711L)   /*  910 */,    unchecked((long) 0xB49B73B5503F2951L)   /*  911 */,
            unchecked((long) 0x10168168C3F96B6BL)   /*  912 */,    unchecked((long) 0x0E3D963B63CAB0AEL)   /*  913 */,
            unchecked((long) 0x8DFC4B5655A1DB14L)   /*  914 */,    unchecked((long) 0xF789F1356E14DE5CL)   /*  915 */,
            unchecked((long) 0x683E68AF4E51DAC1L)   /*  916 */,    unchecked((long) 0xC9A84F9D8D4B0FD9L)   /*  917 */,
            unchecked((long) 0x3691E03F52A0F9D1L)   /*  918 */,    unchecked((long) 0x5ED86E46E1878E80L)   /*  919 */,
            unchecked((long) 0x3C711A0E99D07150L)   /*  920 */,    unchecked((long) 0x5A0865B20C4E9310L)   /*  921 */,
            unchecked((long) 0x56FBFC1FE4F0682EL)   /*  922 */,    unchecked((long) 0xEA8D5DE3105EDF9BL)   /*  923 */,
            unchecked((long) 0x71ABFDB12379187AL)   /*  924 */,    unchecked((long) 0x2EB99DE1BEE77B9CL)   /*  925 */,
            unchecked((long) 0x21ECC0EA33CF4523L)   /*  926 */,    unchecked((long) 0x59A4D7521805C7A1L)   /*  927 */,
            unchecked((long) 0x3896F5EB56AE7C72L)   /*  928 */,    unchecked((long) 0xAA638F3DB18F75DCL)   /*  929 */,
            unchecked((long) 0x9F39358DABE9808EL)   /*  930 */,    unchecked((long) 0xB7DEFA91C00B72ACL)   /*  931 */,
            unchecked((long) 0x6B5541FD62492D92L)   /*  932 */,    unchecked((long) 0x6DC6DEE8F92E4D5BL)   /*  933 */,
            unchecked((long) 0x353F57ABC4BEEA7EL)   /*  934 */,    unchecked((long) 0x735769D6DA5690CEL)   /*  935 */,
            unchecked((long) 0x0A234AA642391484L)   /*  936 */,    unchecked((long) 0xF6F9508028F80D9DL)   /*  937 */,
            unchecked((long) 0xB8E319A27AB3F215L)   /*  938 */,    unchecked((long) 0x31AD9C1151341A4DL)   /*  939 */,
            unchecked((long) 0x773C22A57BEF5805L)   /*  940 */,    unchecked((long) 0x45C7561A07968633L)   /*  941 */,
            unchecked((long) 0xF913DA9E249DBE36L)   /*  942 */,    unchecked((long) 0xDA652D9B78A64C68L)   /*  943 */,
            unchecked((long) 0x4C27A97F3BC334EFL)   /*  944 */,    unchecked((long) 0x76621220E66B17F4L)   /*  945 */,
            unchecked((long) 0x967743899ACD7D0BL)   /*  946 */,    unchecked((long) 0xF3EE5BCAE0ED6782L)   /*  947 */,
            unchecked((long) 0x409F753600C879FCL)   /*  948 */,    unchecked((long) 0x06D09A39B5926DB6L)   /*  949 */,
            unchecked((long) 0x6F83AEB0317AC588L)   /*  950 */,    unchecked((long) 0x01E6CA4A86381F21L)   /*  951 */,
            unchecked((long) 0x66FF3462D19F3025L)   /*  952 */,    unchecked((long) 0x72207C24DDFD3BFBL)   /*  953 */,
            unchecked((long) 0x4AF6B6D3E2ECE2EBL)   /*  954 */,    unchecked((long) 0x9C994DBEC7EA08DEL)   /*  955 */,
            unchecked((long) 0x49ACE597B09A8BC4L)   /*  956 */,    unchecked((long) 0xB38C4766CF0797BAL)   /*  957 */,
            unchecked((long) 0x131B9373C57C2A75L)   /*  958 */,    unchecked((long) 0xB1822CCE61931E58L)   /*  959 */,
            unchecked((long) 0x9D7555B909BA1C0CL)   /*  960 */,    unchecked((long) 0x127FAFDD937D11D2L)   /*  961 */,
            unchecked((long) 0x29DA3BADC66D92E4L)   /*  962 */,    unchecked((long) 0xA2C1D57154C2ECBCL)   /*  963 */,
            unchecked((long) 0x58C5134D82F6FE24L)   /*  964 */,    unchecked((long) 0x1C3AE3515B62274FL)   /*  965 */,
            unchecked((long) 0xE907C82E01CB8126L)   /*  966 */,    unchecked((long) 0xF8ED091913E37FCBL)   /*  967 */,
            unchecked((long) 0x3249D8F9C80046C9L)   /*  968 */,    unchecked((long) 0x80CF9BEDE388FB63L)   /*  969 */,
            unchecked((long) 0x1881539A116CF19EL)   /*  970 */,    unchecked((long) 0x5103F3F76BD52457L)   /*  971 */,
            unchecked((long) 0x15B7E6F5AE47F7A8L)   /*  972 */,    unchecked((long) 0xDBD7C6DED47E9CCFL)   /*  973 */,
            unchecked((long) 0x44E55C410228BB1AL)   /*  974 */,    unchecked((long) 0xB647D4255EDB4E99L)   /*  975 */,
            unchecked((long) 0x5D11882BB8AAFC30L)   /*  976 */,    unchecked((long) 0xF5098BBB29D3212AL)   /*  977 */,
            unchecked((long) 0x8FB5EA14E90296B3L)   /*  978 */,    unchecked((long) 0x677B942157DD025AL)   /*  979 */,
            unchecked((long) 0xFB58E7C0A390ACB5L)   /*  980 */,    unchecked((long) 0x89D3674C83BD4A01L)   /*  981 */,
            unchecked((long) 0x9E2DA4DF4BF3B93BL)   /*  982 */,    unchecked((long) 0xFCC41E328CAB4829L)   /*  983 */,
            unchecked((long) 0x03F38C96BA582C52L)   /*  984 */,    unchecked((long) 0xCAD1BDBD7FD85DB2L)   /*  985 */,
            unchecked((long) 0xBBB442C16082AE83L)   /*  986 */,    unchecked((long) 0xB95FE86BA5DA9AB0L)   /*  987 */,
            unchecked((long) 0xB22E04673771A93FL)   /*  988 */,    unchecked((long) 0x845358C9493152D8L)   /*  989 */,
            unchecked((long) 0xBE2A488697B4541EL)   /*  990 */,    unchecked((long) 0x95A2DC2DD38E6966L)   /*  991 */,
            unchecked((long) 0xC02C11AC923C852BL)   /*  992 */,    unchecked((long) 0x2388B1990DF2A87BL)   /*  993 */,
            unchecked((long) 0x7C8008FA1B4F37BEL)   /*  994 */,    unchecked((long) 0x1F70D0C84D54E503L)   /*  995 */,
            unchecked((long) 0x5490ADEC7ECE57D4L)   /*  996 */,    unchecked((long) 0x002B3C27D9063A3AL)   /*  997 */,
            unchecked((long) 0x7EAEA3848030A2BFL)   /*  998 */,    unchecked((long) 0xC602326DED2003C0L)   /*  999 */,
            unchecked((long) 0x83A7287D69A94086L)   /* 1000 */,    unchecked((long) 0xC57A5FCB30F57A8AL)   /* 1001 */,
            unchecked((long) 0xB56844E479EBE779L)   /* 1002 */,    unchecked((long) 0xA373B40F05DCBCE9L)   /* 1003 */,
            unchecked((long) 0xD71A786E88570EE2L)   /* 1004 */,    unchecked((long) 0x879CBACDBDE8F6A0L)   /* 1005 */,
            unchecked((long) 0x976AD1BCC164A32FL)   /* 1006 */,    unchecked((long) 0xAB21E25E9666D78BL)   /* 1007 */,
            unchecked((long) 0x901063AAE5E5C33CL)   /* 1008 */,    unchecked((long) 0x9818B34448698D90L)   /* 1009 */,
            unchecked((long) 0xE36487AE3E1E8ABBL)   /* 1010 */,    unchecked((long) 0xAFBDF931893BDCB4L)   /* 1011 */,
            unchecked((long) 0x6345A0DC5FBBD519L)   /* 1012 */,    unchecked((long) 0x8628FE269B9465CAL)   /* 1013 */,
            unchecked((long) 0x1E5D01603F9C51ECL)   /* 1014 */,    unchecked((long) 0x4DE44006A15049B7L)   /* 1015 */,
            unchecked((long) 0xBF6C70E5F776CBB1L)   /* 1016 */,    unchecked((long) 0x411218F2EF552BEDL)   /* 1017 */,
            unchecked((long) 0xCB0C0708705A36A3L)   /* 1018 */,    unchecked((long) 0xE74D14754F986044L)   /* 1019 */,
            unchecked((long) 0xCD56D9430EA8280EL)   /* 1020 */,    unchecked((long) 0xC12591D7535F5065L)   /* 1021 */,
            unchecked((long) 0xC83223F1720AEF96L)   /* 1022 */,    unchecked((long) 0xC3A0396F7363A51FL)   /* 1023 */
        };

        private const int    DigestLength = 24;

        //
        // registers
        //
        private long    a, b, c;
        private long    byteCount;

        //
        // buffers
        //
        private byte[]  m_buffer = new byte[8];
        private int     bOff;

        private long[]  x = new long[8];
        private int     xOff;

        /**
        * Standard constructor
        */
        public TigerDigest()
        {
            Reset();
        }

        /**
        * Copy constructor.  This will copy the state of the provided
        * message digest.
        */
        public TigerDigest(TigerDigest t)
        {
			Reset(t);
        }

		public string AlgorithmName
		{
			get { return "Tiger"; }
		}

		public int GetDigestSize()
		{
			return DigestLength;
		}

		public int GetByteLength()
		{
			return MyByteLength;
		}

		private void ProcessWord(byte[] b, int off)
        {
            x[xOff++] = (long)Pack.LE_To_UInt64(b, off);

            if (xOff == x.Length)
            {
                ProcessBlock();
            }

            bOff = 0;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void ProcessWord(ReadOnlySpan<byte> b)
        {
            x[xOff++] = (long)Pack.LE_To_UInt64(b);

            if (xOff == x.Length)
            {
                ProcessBlock();
            }

            bOff = 0;
        }
#endif

        public void Update(
            byte input)
        {
            m_buffer[bOff++] = input;

            if (bOff == m_buffer.Length)
            {
                ProcessWord(m_buffer, 0);
            }

            byteCount++;
        }

        public void BlockUpdate(
            byte[]  input,
            int     inOff,
            int     length)
        {
            //
            // fill the current word
            //
            while ((bOff != 0) && (length > 0))
            {
                Update(input[inOff]);

                inOff++;
                length--;
            }

            //
            // process whole words.
            //
            while (length >= 8)
            {
                ProcessWord(input, inOff);

                inOff += 8;
                length -= 8;
                byteCount += 8;
            }

            //
            // load in the remainder.
            //
            while (length > 0)
            {
                Update(input[inOff]);

                inOff++;
                length--;
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void BlockUpdate(ReadOnlySpan<byte> input)
        {
            int inOff = 0, length = input.Length;

            //
            // fill the current word
            //
            while ((bOff != 0) && (length > 0))
            {
                Update(input[inOff]);

                inOff++;
                length--;
            }

            //
            // process whole words.
            //
            while (length >= 8)
            {
                ProcessWord(input[inOff..]);

                inOff += 8;
                length -= 8;
                byteCount += 8;
            }

            //
            // load in the remainder.
            //
            while (length > 0)
            {
                Update(input[inOff]);

                inOff++;
                length--;
            }
        }
#endif

        private void RoundABC(
            long    x,
            long    mul)
        {
            c ^= x ;
            a -= t1[(int)c & 0xff] ^ t2[(int)(c >> 16) & 0xff]
                    ^ t3[(int)(c >> 32) & 0xff] ^ t4[(int)(c >> 48) & 0xff];
            b += t4[(int)(c >> 8) & 0xff] ^ t3[(int)(c >> 24) & 0xff]
                    ^ t2[(int)(c >> 40) & 0xff] ^ t1[(int)(c >> 56) & 0xff];
            b *= mul;
        }

        private void RoundBCA(
            long    x,
            long    mul)
        {
            a ^= x ;
            b -= t1[(int)a & 0xff] ^ t2[(int)(a >> 16) & 0xff]
                    ^ t3[(int)(a >> 32) & 0xff] ^ t4[(int)(a >> 48) & 0xff];
            c += t4[(int)(a >> 8) & 0xff] ^ t3[(int)(a >> 24) & 0xff]
                    ^ t2[(int)(a >> 40) & 0xff] ^ t1[(int)(a >> 56) & 0xff];
            c *= mul;
        }

        private void RoundCAB(
            long    x,
            long    mul)
        {
            b ^= x ;
            c -= t1[(int)b & 0xff] ^ t2[(int)(b >> 16) & 0xff]
                    ^ t3[(int)(b >> 32) & 0xff] ^ t4[(int)(b >> 48) & 0xff];
            a += t4[(int)(b >> 8) & 0xff] ^ t3[(int)(b >> 24) & 0xff]
                    ^ t2[(int)(b >> 40) & 0xff] ^ t1[(int)(b >> 56) & 0xff];
            a *= mul;
        }

        private void KeySchedule()
        {
            x[0] -= x[7] ^ unchecked ((long) 0xA5A5A5A5A5A5A5A5L);
            x[1] ^= x[0];
            x[2] += x[1];
            x[3] -= x[2] ^ ((~x[1]) << 19);
            x[4] ^= x[3];
            x[5] += x[4];
            x[6] -= x[5] ^ (long) ((ulong) (~x[4]) >> 23);
            x[7] ^= x[6];
            x[0] += x[7];
            x[1] -= x[0] ^ ((~x[7]) << 19);
            x[2] ^= x[1];
            x[3] += x[2];
            x[4] -= x[3] ^ (long) ((ulong) (~x[2]) >> 23);
            x[5] ^= x[4];
            x[6] += x[5];
            x[7] -= x[6] ^ 0x0123456789ABCDEFL;
        }

        private void ProcessBlock()
        {
            //
            // save abc
            //
            long aa = a;
            long bb = b;
            long cc = c;

            //
            // rounds and schedule
            //
            RoundABC(x[0], 5);
            RoundBCA(x[1], 5);
            RoundCAB(x[2], 5);
            RoundABC(x[3], 5);
            RoundBCA(x[4], 5);
            RoundCAB(x[5], 5);
            RoundABC(x[6], 5);
            RoundBCA(x[7], 5);

            KeySchedule();

            RoundCAB(x[0], 7);
            RoundABC(x[1], 7);
            RoundBCA(x[2], 7);
            RoundCAB(x[3], 7);
            RoundABC(x[4], 7);
            RoundBCA(x[5], 7);
            RoundCAB(x[6], 7);
            RoundABC(x[7], 7);

            KeySchedule();

            RoundBCA(x[0], 9);
            RoundCAB(x[1], 9);
            RoundABC(x[2], 9);
            RoundBCA(x[3], 9);
            RoundCAB(x[4], 9);
            RoundABC(x[5], 9);
            RoundBCA(x[6], 9);
            RoundCAB(x[7], 9);

            //
            // feed forward
            //
            a ^= aa;
            b -= bb;
            c += cc;

            //
            // clear the x buffer
            //
            xOff = 0;
            for (int i = 0; i != x.Length; i++)
            {
                x[i] = 0;
            }
        }

        private void ProcessLength(
            long    bitLength)
        {
            x[7] = bitLength;
        }

        private void Finish()
        {
            long    bitLength = (byteCount << 3);

            Update((byte)0x01);

            while (bOff != 0)
            {
                Update((byte)0);
            }

            ProcessLength(bitLength);

            ProcessBlock();
        }

        public int DoFinal(
            byte[]  output,
            int     outOff)
        {
            Finish();

            Pack.UInt64_To_LE((ulong)a, output, outOff);
            Pack.UInt64_To_LE((ulong)b, output, outOff + 8);
            Pack.UInt64_To_LE((ulong)c, output, outOff + 16);

            Reset();

            return DigestLength;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int DoFinal(Span<byte> output)
        {
            Finish();

            Pack.UInt64_To_LE((ulong)a, output);
            Pack.UInt64_To_LE((ulong)b, output[8..]);
            Pack.UInt64_To_LE((ulong)c, output[16..]);

            Reset();

            return DigestLength;
        }
#endif

        /**
        * reset the chaining variables
        */
        public void Reset()
        {
            a = unchecked((long) 0x0123456789ABCDEFL);
            b = unchecked((long) 0xFEDCBA9876543210L);
            c = unchecked((long) 0xF096A5B4C3B2E187L);

            xOff = 0;
            for (int i = 0; i != x.Length; i++)
            {
                x[i] = 0;
            }

            bOff = 0;
            for (int i = 0; i != m_buffer.Length; i++)
            {
                m_buffer[i] = 0;
            }

            byteCount = 0;
        }

		public IMemoable Copy()
		{
			return new TigerDigest(this);
		}

		public void Reset(IMemoable other)
		{
			TigerDigest t = (TigerDigest)other;

			a = t.a;
			b = t.b;
			c = t.c;

			Array.Copy(t.x, 0, x, 0, t.x.Length);
			xOff = t.xOff;

			Array.Copy(t.m_buffer, 0, m_buffer, 0, t.m_buffer.Length);
			bOff = t.bOff;

			byteCount = t.byteCount;
		}    
	}
}
