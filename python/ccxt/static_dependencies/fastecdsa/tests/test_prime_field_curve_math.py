from random import choice, randint
from unittest import TestCase

from . import CURVES
from ..curve import P192, P224, P256, P384, P521, secp256k1, W25519, W448
from ..point import Point


class TestPrimeFieldCurve(TestCase):
    """ NIST P curve tests taken from https://www.nsa.gov/ia/_files/nist-routines.pdf """

    def test_P192_arith(self):
        S = Point(
            0xd458e7d127ae671b0c330266d246769353a012073e97acf8,
            0x325930500d851f336bddc050cf7fb11b5673a1645086df3b,
            curve=P192
        )
        d = 0xa78a236d60baec0c5dd41b33a542463a8255391af64c74ee
        expected = Point(
            0x1faee4205a4f669d2d0a8f25e3bcec9a62a6952965bf6d31,
            0x5ff2cdfa508a2581892367087c696f179e7a4d7e8260fb06,
            curve=P192
        )
        R = d * S
        self.assertEqual(R, expected)

    def test_P224_arith(self):
        S = Point(
            0x6eca814ba59a930843dc814edd6c97da95518df3c6fdf16e9a10bb5b,
            0xef4b497f0963bc8b6aec0ca0f259b89cd80994147e05dc6b64d7bf22,
            curve=P224
        )
        d = 0xa78ccc30eaca0fcc8e36b2dd6fbb03df06d37f52711e6363aaf1d73b
        expected = Point(
            0x96a7625e92a8d72bff1113abdb95777e736a14c6fdaacc392702bca4,
            0x0f8e5702942a3c5e13cd2fd5801915258b43dfadc70d15dbada3ed10,
            curve=P224
        )
        R = d * S
        self.assertEqual(R, expected)

    def test_P256_arith(self):
        S = Point(
            0xde2444bebc8d36e682edd27e0f271508617519b3221a8fa0b77cab3989da97c9,
            0xc093ae7ff36e5380fc01a5aad1e66659702de80f53cec576b6350b243042a256,
            curve=P256
        )
        d = 0xc51e4753afdec1e6b6c6a5b992f43f8dd0c7a8933072708b6522468b2ffb06fd
        expected = Point(
            0x51d08d5f2d4278882946d88d83c97d11e62becc3cfc18bedacc89ba34eeca03f,
            0x75ee68eb8bf626aa5b673ab51f6e744e06f8fcf8a6c0cf3035beca956a7b41d5,
            curve=P256
        )
        R = d * S
        self.assertEqual(R, expected)

    def test_P384_arith(self):
        S = Point(
            int('fba203b81bbd23f2b3be971cc23997e1ae4d89e69cb6f92385dda82768ada415ebab4167459da98e6'
                '2b1332d1e73cb0e', 16),
            int('5ffedbaefdeba603e7923e06cdb5d0c65b22301429293376d5c6944e3fa6259f162b4788de6987fd5'
                '9aed5e4b5285e45', 16),
            curve=P384
        )
        d = int('a4ebcae5a665983493ab3e626085a24c104311a761b5a8fdac052ed1f111a5c44f76f45659d2d111a'
                '61b5fdd97583480', 16)
        expected = Point(
            int('e4f77e7ffeb7f0958910e3a680d677a477191df166160ff7ef6bb5261f791aa7b45e3e653d151b95d'
                'ad3d93ca0290ef2', 16),
            int('ac7dee41d8c5f4a7d5836960a773cfc1376289d3373f8cf7417b0c6207ac32e913856612fc9ff2e35'
                '7eb2ee05cf9667f', 16),
            curve=P384
        )
        R = d * S
        self.assertEqual(R, expected)

    def test_P521_arith(self):
        S = Point(
            int('000001d5c693f66c08ed03ad0f031f937443458f601fd098d3d0227b4bf62873af50740b0bb84aa15'
                '7fc847bcf8dc16a8b2b8bfd8e2d0a7d39af04b089930ef6dad5c1b4', 16),
            int('00000144b7770963c63a39248865ff36b074151eac33549b224af5c8664c54012b818ed037b2b7c1a'
                '63ac89ebaa11e07db89fcee5b556e49764ee3fa66ea7ae61ac01823', 16),
            curve=P521
        )
        d = int('000001eb7f81785c9629f136a7e8f8c674957109735554111a2a866fa5a166699419bfa9936c78b62'
                '653964df0d6da940a695c7294d41b2d6600de6dfcf0edcfc89fdcb1', 16)
        expected = Point(
            int('00000091b15d09d0ca0353f8f96b93cdb13497b0a4bb582ae9ebefa35eee61bf7b7d041b8ec34c6c0'
                '0c0c0671c4ae063318fb75be87af4fe859608c95f0ab4774f8c95bb', 16),
            int('00000130f8f8b5e1abb4dd94f6baaf654a2d5810411e77b7423965e0c7fd79ec1ae563c207bd255ee'
                '9828eb7a03fed565240d2cc80ddd2cecbb2eb50f0951f75ad87977f', 16),
            curve=P521
        )
        R = d * S
        self.assertEqual(R, expected)

    def test_secp256k1_arith(self):
        # http://crypto.stackexchange.com/a/787/17884
        m = 0xAA5E28D6A97A2479A65527F7290311A3624D4CC0FA1578598EE3C2613BF99522
        expected = Point(
            0x34F9460F0E4F08393D192B3C5133A6BA099AA0AD9FD54EBCCFACDFA239FF49C6,
            0x0B71EA9BD730FD8923F6D25A7A91E7DD7728A960686CB5A901BB419E0F2CA232,
            curve=secp256k1
        )
        R = m * secp256k1.G
        self.assertEqual(R, expected)

        m = 0x7E2B897B8CEBC6361663AD410835639826D590F393D90A9538881735256DFAE3
        expected = Point(
            0xD74BF844B0862475103D96A611CF2D898447E288D34B360BC885CB8CE7C00575,
            0x131C670D414C4546B88AC3FF664611B1C38CEB1C21D76369D7A7A0969D61D97D,
            curve=secp256k1
        )
        R = m * secp256k1.G
        self.assertEqual(R, expected)

        m = 0x6461E6DF0FE7DFD05329F41BF771B86578143D4DD1F7866FB4CA7E97C5FA945D
        expected = Point(
            0xE8AECC370AEDD953483719A116711963CE201AC3EB21D3F3257BB48668C6A72F,
            0xC25CAF2F0EBA1DDB2F0F3F47866299EF907867B7D27E95B3873BF98397B24EE1,
            curve=secp256k1
        )
        R = m * secp256k1.G
        self.assertEqual(R, expected)

        m = 0x376A3A2CDCD12581EFFF13EE4AD44C4044B8A0524C42422A7E1E181E4DEECCEC
        expected = Point(
            0x14890E61FCD4B0BD92E5B36C81372CA6FED471EF3AA60A3E415EE4FE987DABA1,
            0x297B858D9F752AB42D3BCA67EE0EB6DCD1C2B7B0DBE23397E66ADC272263F982,
            curve=secp256k1
        )
        R = m * secp256k1.G
        self.assertEqual(R, expected)

        m = 0x1B22644A7BE026548810C378D0B2994EEFA6D2B9881803CB02CEFF865287D1B9
        expected = Point(
            0xF73C65EAD01C5126F28F442D087689BFA08E12763E0CEC1D35B01751FD735ED3,
            0xF449A8376906482A84ED01479BD18882B919C140D638307F0C0934BA12590BDE,
            curve=secp256k1
        )
        R = m * secp256k1.G
        self.assertEqual(R, expected)

    def test_secp256k1_add_large(self):
        xs = 1
        xt = secp256k1.p + 1
        ys = 0x4218f20ae6c646b363db68605822fb14264ca8d2587fdd6fbc750d587e76a7ee
        S = Point(xs, ys, curve=secp256k1)
        T = Point(xt, ys, curve=secp256k1)
        expected = Point(
            0xc7ffffffffffffffffffffffffffffffffffffffffffffffffffffff37fffd03,
            0x4298c557a7ddcc570e8bf054c4cad9e99f396b3ce19d50f1b91c9df4bb00d333,
            curve=secp256k1
        )
        R = S+T
        self.assertEqual(R, expected)

    def test_W25519_arith(self):
        subgroup = [
            (0, 0),
            (19624287790469256669057814461137428606839005560001276145469620721820115669041,
             25869741026945134960544184956460972567356779614910045322022475500191642319642),
            (19298681539552699237261830834781317975544997444273427339909597334652188435538,
             9094040566125962849133224048217411091405536248825867518642941381412595940312),
            (784994156384216107199399111990385161439916830893843497063691184659069321411,
             47389623381099381275796781267935282128369626952426857267179501978497824351671),
            (19298681539552699237261830834781317975544997444273427339909597334652188435537,
             0),
            (784994156384216107199399111990385161439916830893843497063691184659069321411,
             10506421237558716435988711236408671798265365380393424752549290025458740468278),
            (19298681539552699237261830834781317975544997444273427339909597334652188435538,
             48802004052532134862652268456126542835229456083994414501085850622543968879637),
            (19624287790469256669057814461137428606839005560001276145469620721820115669041,
             32026303591712962751241307547882981359278212717910236697706316503764922500307)]

        # subgroup[1] generates an order-8 subgroup
        S = Point(subgroup[1][0], subgroup[1][1], curve=W25519)
        m = randint(1, S.curve.q - 1)

        # test subgroup operation
        for i in range(2 * len(subgroup)):
            R = (m + i) * S
            idx = (m + i) % len(subgroup)
            if idx == 0:
                expected = Point.IDENTITY_ELEMENT
            else:
                expected = Point(subgroup[idx][0], subgroup[idx][1], curve=S.curve)
            self.assertEqual(R, expected)

        # test 2Q = inf when ord(Q) = 2; subgroup[4] is such a point
        S = Point(subgroup[4][0], subgroup[4][1], curve=S.curve)
        R = S + S
        self.assertEqual(R, Point.IDENTITY_ELEMENT)

    def test_W448_arith(self):
        subgroup = [
            (0, 0),
            (484559149530404593699549205258669689569094240458212040187660132787074885444487181790930922465784363953392589641229091574035665345629067,
             197888467295464439538354009753858038256835152591059802148199779196087404232002515713604263127793030747855424464185691766453844835192428),
            (484559149530404593699549205258669689569094240458212040187660132787074885444487181790930922465784363953392589641229091574035665345629068,
             0),
            (484559149530404593699549205258669689569094240458212040187660132787074885444487181790930922465784363953392589641229091574035665345629067,
             528950257000142451010969798134146496096806208096258258133290419984524923934728256972792120570883515182233459997657945594599653183173011)]

        # subgroup[1] generates an order-4 subgroup
        S = Point(subgroup[1][0], subgroup[1][1], curve=W448)
        m = randint(1, S.curve.q - 1)

        # test subgroup operation
        for i in range(2 * len(subgroup)):
            R = (m + i) * S
            idx = (m + i) % len(subgroup)
            if idx == 0:
                expected = Point.IDENTITY_ELEMENT
            else:
                expected = Point(subgroup[idx][0], subgroup[idx][1], curve=S.curve)
            self.assertEqual(R, expected)

        # test 2Q = inf when ord(Q) = 2; subgroup[2] is such a point
        S = Point(subgroup[2][0], subgroup[2][1], curve=S.curve)
        R = S + S
        self.assertEqual(R, Point.IDENTITY_ELEMENT)

    def test_arbitrary_arithmetic(self):
        for _ in range(100):
            curve = choice(CURVES)
            a, b = randint(0, curve.q), randint(0, curve.q)
            c = (a + b) % curve.q
            P, Q = a * curve.G, b * curve.G
            R = c * curve.G
            pq_sum, qp_sum = P + Q, Q + P
            self.assertEqual(pq_sum, qp_sum)
            self.assertEqual(qp_sum, R)

    def test_point_at_infinity_arithmetic(self):
        for curve in CURVES:
            a = randint(0, curve.q)
            b = curve.q - a
            P, Q = a * curve.G, b * curve.G

            self.assertEqual(P + Q, Point.IDENTITY_ELEMENT)
            self.assertEqual((P + Q) + P, P)

    def test_mul_by_negative(self):
        for curve in CURVES:
            P = -1 * curve.G
            self.assertEqual(P.x, (-curve.G).x)
            self.assertEqual(P.y, (-curve.G).y)

            a = randint(0, curve.q)
            P = -a * curve.G
            Q = a * -curve.G

            self.assertEqual(P.x, Q.x)
            self.assertEqual(P.y, Q.y)

    def test_mul_by_large(self):
        # W25519 test
        # this is an order h * q point, where ord(G) = q and cofactor h satisfies card(E) = h * q
        P_25519 = (35096664872667797862139202932949049580901987963171775123990915594423742128033,
                   22480573877477866270168076032006671893585325258603943218058327520008883368696)
        # scalar larger than q but smaller than h * q
        k_25519 = 29372000253601831461196252357151931556312986177449743872632027037220559545805
        # KAT: Q = k * P
        Q_25519 = (49706689516442043243945288648738077613576846608357551203998149787039218825283,
                   39031159953669648926560068238390400180132971507115734045330364888380270413913)
        P_25519 = Point(P_25519[0], P_25519[1], curve=W25519)
        R = k_25519 * P_25519
        expected = Point(Q_25519[0], Q_25519[1], curve=W25519)
        self.assertEqual(R, expected)

        # W448 test
        # this is an order h * q point, where ord(G) = q and cofactor h satisfies card(E) = h * q
        P_448 = (231480979532797508943026590383724571663349496894338686929676625369384864922735088561874582237479033305968563866115522624182905190510908,
                 386642878578520576902801772187402730328995571185781418728101620741813344331894790606494081334128109534545128357659367878296954820089456)
        # scalar larger than q but smaller than h * q
        k_448 = 402277635739946816237642095194112559838556500677282525912537756673080201343619608058123416303707654128973619279630717054942423338738673
        # KAT: Q = k * P
        Q_448 = (594031426065062897452711501095164269186787326947787097339623446049485959406429079799671040253813345976305183137288555654745835823926292,
                 397805400082591898298129134663530334000872412871159149907636409950148029590985263340056678772524289857573459442468777694902850559368658)
        P_448 = Point(P_448[0], P_448[1], curve=W448)
        R = k_448 * P_448
        expected = Point(Q_448[0], Q_448[1], curve=W448)
        self.assertEqual(R, expected)
