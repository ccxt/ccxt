using System;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class FalconVrfy
    {
        FalconCommon common;
        internal FalconVrfy() {
            this.common = new FalconCommon();
        }
        internal FalconVrfy(FalconCommon common) {
            this.common = common;
        }

        /* 
        * License from the reference C code (the code was copied then modified
        * to function in C#):
        * ==========================(LICENSE BEGIN)============================
        *
        * Copyright (c) 2017-2019  Falcon Project
        *
        * Permission is hereby granted, free of charge, to any person obtaining
        * a copy of this software and associated documentation files (the
        * "Software"), to deal in the Software without restriction, including
        * without limitation the rights to use, copy, modify, merge, publish,
        * distribute, sublicense, and/or sell copies of the Software, and to
        * permit persons to whom the Software is furnished to do so, subject to
        * the following conditions:
        *
        * The above copyright notice and this permission notice shall be
        * included in all copies or substantial portions of the Software.
        *
        * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
        * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        *
        * ===========================(LICENSE END)=============================
        */
        /* ===================================================================== */
        /*
        * Constants for NTT.
        *
        *   n = 2^logn  (2 <= n <= 1024)
        *   phi = X^n + 1
        *   q = 12289
        *   q0i = -1/q mod 2^16
        *   R = 2^16 mod q
        *   R2 = 2^32 mod q
        */

        const int Q = 12289;
        const int Q0I = 12287;
        const int R = 4091;
        const int R2 = 10952;

        /*
        * Table for NTT, binary case:
        *   GMb[x] = R*(g^rev(x)) mod q
        * where g = 7 (it is a 2048-th primitive root of 1 modulo q)
        * and rev() is the bit-reversal function over 10 bits.
        */
        internal ushort[] GMb = {
            4091,  7888, 11060, 11208,  6960,  4342,  6275,  9759,
            1591,  6399,  9477,  5266,   586,  5825,  7538,  9710,
            1134,  6407,  1711,   965,  7099,  7674,  3743,  6442,
            10414,  8100,  1885,  1688,  1364, 10329, 10164,  9180,
            12210,  6240,   997,   117,  4783,  4407,  1549,  7072,
            2829,  6458,  4431,  8877,  7144,  2564,  5664,  4042,
            12189,   432, 10751,  1237,  7610,  1534,  3983,  7863,
            2181,  6308,  8720,  6570,  4843,  1690,    14,  3872,
            5569,  9368, 12163,  2019,  7543,  2315,  4673,  7340,
            1553,  1156,  8401, 11389,  1020,  2967, 10772,  7045,
            3316, 11236,  5285, 11578, 10637, 10086,  9493,  6180,
            9277,  6130,  3323,   883, 10469,   489,  1502,  2851,
            11061,  9729,  2742, 12241,  4970, 10481, 10078,  1195,
            730,  1762,  3854,  2030,  5892, 10922,  9020,  5274,
            9179,  3604,  3782, 10206,  3180,  3467,  4668,  2446,
            7613,  9386,   834,  7703,  6836,  3403,  5351, 12276,
            3580,  1739, 10820,  9787, 10209,  4070, 12250,  8525,
            10401,  2749,  7338, 10574,  6040,   943,  9330,  1477,
            6865,  9668,  3585,  6633, 12145,  4063,  3684,  7680,
            8188,  6902,  3533,  9807,  6090,   727, 10099,  7003,
            6945,  1949,  9731, 10559,  6057,   378,  7871,  8763,
            8901,  9229,  8846,  4551,  9589, 11664,  7630,  8821,
            5680,  4956,  6251,  8388, 10156,  8723,  2341,  3159,
            1467,  5460,  8553,  7783,  2649,  2320,  9036,  6188,
            737,  3698,  4699,  5753,  9046,  3687,    16,   914,
            5186, 10531,  4552,  1964,  3509,  8436,  7516,  5381,
            10733,  3281,  7037,  1060,  2895,  7156,  8887,  5357,
            6409,  8197,  2962,  6375,  5064,  6634,  5625,   278,
            932, 10229,  8927,  7642,   351,  9298,   237,  5858,
            7692,  3146, 12126,  7586,  2053, 11285,  3802,  5204,
            4602,  1748, 11300,   340,  3711,  4614,   300, 10993,
            5070, 10049, 11616, 12247,  7421, 10707,  5746,  5654,
            3835,  5553,  1224,  8476,  9237,  3845,   250, 11209,
            4225,  6326,  9680, 12254,  4136,  2778,   692,  8808,
            6410,  6718, 10105, 10418,  3759,  7356, 11361,  8433,
            6437,  3652,  6342,  8978,  5391,  2272,  6476,  7416,
            8418, 10824, 11986,  5733,   876,  7030,  2167,  2436,
            3442,  9217,  8206,  4858,  5964,  2746,  7178,  1434,
            7389,  8879, 10661, 11457,  4220,  1432, 10832,  4328,
            8557,  1867,  9454,  2416,  3816,  9076,   686,  5393,
            2523,  4339,  6115,   619,   937,  2834,  7775,  3279,
            2363,  7488,  6112,  5056,   824, 10204, 11690,  1113,
            2727,  9848,   896,  2028,  5075,  2654, 10464,  7884,
            12169,  5434,  3070,  6400,  9132, 11672, 12153,  4520,
            1273,  9739, 11468,  9937, 10039,  9720,  2262,  9399,
            11192,   315,  4511,  1158,  6061,  6751, 11865,   357,
            7367,  4550,   983,  8534,  8352, 10126,  7530,  9253,
            4367,  5221,  3999,  8777,  3161,  6990,  4130, 11652,
            3374, 11477,  1753,   292,  8681,  2806, 10378, 12188,
            5800, 11811,  3181,  1988,  1024,  9340,  2477, 10928,
            4582,  6750,  3619,  5503,  5233,  2463,  8470,  7650,
            7964,  6395,  1071,  1272,  3474, 11045,  3291, 11344,
            8502,  9478,  9837,  1253,  1857,  6233,  4720, 11561,
            6034,  9817,  3339,  1797,  2879,  6242,  5200,  2114,
            7962,  9353, 11363,  5475,  6084,  9601,  4108,  7323,
            10438,  9471,  1271,   408,  6911,  3079,   360,  8276,
            11535,  9156,  9049, 11539,   850,  8617,   784,  7919,
            8334, 12170,  1846, 10213, 12184,  7827, 11903,  5600,
            9779,  1012,   721,  2784,  6676,  6552,  5348,  4424,
            6816,  8405,  9959,  5150,  2356,  5552,  5267,  1333,
            8801,  9661,  7308,  5788,  4910,   909, 11613,  4395,
            8238,  6686,  4302,  3044,  2285, 12249,  1963,  9216,
            4296, 11918,   695,  4371,  9793,  4884,  2411, 10230,
            2650,   841,  3890, 10231,  7248,  8505, 11196,  6688,
            4059,  6060,  3686,  4722, 11853,  5816,  7058,  6868,
            11137,  7926,  4894, 12284,  4102,  3908,  3610,  6525,
            7938,  7982, 11977,  6755,   537,  4562,  1623,  8227,
            11453,  7544,   906, 11816,  9548, 10858,  9703,  2815,
            11736,  6813,  6979,   819,  8903,  6271, 10843,   348,
            7514,  8339,  6439,   694,   852,  5659,  2781,  3716,
            11589,  3024,  1523,  8659,  4114, 10738,  3303,  5885,
            2978,  7289, 11884,  9123,  9323, 11830,    98,  2526,
            2116,  4131, 11407,  1844,  3645,  3916,  8133,  2224,
            10871,  8092,  9651,  5989,  7140,  8480,  1670,   159,
            10923,  4918,   128,  7312,   725,  9157,  5006,  6393,
            3494,  6043, 10972,  6181, 11838,  3423, 10514,  7668,
            3693,  6658,  6905, 11953, 10212, 11922,  9101,  8365,
            5110,    45,  2400,  1921,  4377,  2720,  1695,    51,
            2808,   650,  1896,  9997,  9971, 11980,  8098,  4833,
            4135,  4257,  5838,  4765, 10985, 11532,   590, 12198,
            482, 12173,  2006,  7064, 10018,  3912, 12016, 10519,
            11362,  6954,  2210,   284,  5413,  6601,  3865, 10339,
            11188,  6231,   517,  9564, 11281,  3863,  1210,  4604,
            8160, 11447,   153,  7204,  5763,  5089,  9248, 12154,
            11748,  1354,  6672,   179,  5532,  2646,  5941, 12185,
            862,  3158,   477,  7279,  5678,  7914,  4254,   302,
            2893, 10114,  6890,  9560,  9647, 11905,  4098,  9824,
            10269,  1353, 10715,  5325,  6254,  3951,  1807,  6449,
            5159,  1308,  8315,  3404,  1877,  1231,   112,  6398,
            11724, 12272,  7286,  1459, 12274,  9896,  3456,   800,
            1397, 10678,   103,  7420,  7976,   936,   764,   632,
            7996,  8223,  8445,  7758, 10870,  9571,  2508,  1946,
            6524, 10158,  1044,  4338,  2457,  3641,  1659,  4139,
            4688,  9733, 11148,  3946,  2082,  5261,  2036, 11850,
            7636, 12236,  5366,  2380,  1399,  7720,  2100,  3217,
            10912,  8898,  7578, 11995,  2791,  1215,  3355,  2711,
            2267,  2004,  8568, 10176,  3214,  2337,  1750,  4729,
            4997,  7415,  6315, 12044,  4374,  7157,  4844,   211,
            8003, 10159,  9290, 11481,  1735,  2336,  5793,  9875,
            8192,   986,  7527,  1401,   870,  3615,  8465,  2756,
            9770,  2034, 10168,  3264,  6132,    54,  2880,  4763,
            11805,  3074,  8286,  9428,  4881,  6933,  1090, 10038,
            2567,   708,   893,  6465,  4962, 10024,  2090,  5718,
            10743,   780,  4733,  4623,  2134,  2087,  4802,   884,
            5372,  5795,  5938,  4333,  6559,  7549,  5269, 10664,
            4252,  3260,  5917, 10814,  5768,  9983,  8096,  7791,
            6800,  7491,  6272,  1907, 10947,  6289, 11803,  6032,
            11449,  1171,  9201,  7933,  2479,  7970, 11337,  7062,
            8911,  6728,  6542,  8114,  8828,  6595,  3545,  4348,
            4610,  2205,  6999,  8106,  5560, 10390,  9321,  2499,
            2413,  7272,  6881, 10582,  9308,  9437,  3554,  3326,
            5991, 11969,  3415, 12283,  9838, 12063,  4332,  7830,
            11329,  6605, 12271,  2044, 11611,  7353, 11201, 11582,
            3733,  8943,  9978,  1627,  7168,  3935,  5050,  2762,
            7496, 10383,   755,  1654, 12053,  4952, 10134,  4394,
            6592,  7898,  7497,  8904, 12029,  3581, 10748,  5674,
            10358,  4901,  7414,  8771,   710,  6764,  8462,  7193,
            5371,  7274, 11084,   290,  7864,  6827, 11822,  2509,
            6578,  4026,  5807,  1458,  5721,  5762,  4178,  2105,
            11621,  4852,  8897,  2856, 11510,  9264,  2520,  8776,
            7011,  2647,  1898,  7039,  5950, 11163,  5488,  6277,
            9182, 11456,   633, 10046, 11554,  5633,  9587,  2333,
            7008,  7084,  5047,  7199,  9865,  8997,   569,  6390,
            10845,  9679,  8268, 11472,  4203,  1997,     2,  9331,
            162,  6182,  2000,  3649,  9792,  6363,  7557,  6187,
            8510,  9935,  5536,  9019,  3706, 12009,  1452,  3067,
            5494,  9692,  4865,  6019,  7106,  9610,  4588, 10165,
            6261,  5887,  2652, 10172,  1580, 10379,  4638,  9949
        };

        /*
        * Table for inverse NTT, binary case:
        *   iGMb[x] = R*((1/g)^rev(x)) mod q
        * Since g = 7, 1/g = 8778 mod 12289.
        */
        internal ushort[] iGMb = {
            4091,  4401,  1081,  1229,  2530,  6014,  7947,  5329,
            2579,  4751,  6464, 11703,  7023,  2812,  5890, 10698,
            3109,  2125,  1960, 10925, 10601, 10404,  4189,  1875,
            5847,  8546,  4615,  5190, 11324, 10578,  5882, 11155,
            8417, 12275, 10599,  7446,  5719,  3569,  5981, 10108,
            4426,  8306, 10755,  4679, 11052,  1538, 11857,   100,
            8247,  6625,  9725,  5145,  3412,  7858,  5831,  9460,
            5217, 10740,  7882,  7506, 12172, 11292,  6049,    79,
            13,  6938,  8886,  5453,  4586, 11455,  2903,  4676,
            9843,  7621,  8822,  9109,  2083,  8507,  8685,  3110,
            7015,  3269,  1367,  6397, 10259,  8435, 10527, 11559,
            11094,  2211,  1808,  7319,    48,  9547,  2560,  1228,
            9438, 10787, 11800,  1820, 11406,  8966,  6159,  3012,
            6109,  2796,  2203,  1652,   711,  7004,  1053,  8973,
            5244,  1517,  9322, 11269,   900,  3888, 11133, 10736,
            4949,  7616,  9974,  4746, 10270,   126,  2921,  6720,
            6635,  6543,  1582,  4868,    42,   673,  2240,  7219,
            1296, 11989,  7675,  8578, 11949,   989, 10541,  7687,
            7085,  8487,  1004, 10236,  4703,   163,  9143,  4597,
            6431, 12052,  2991, 11938,  4647,  3362,  2060, 11357,
            12011,  6664,  5655,  7225,  5914,  9327,  4092,  5880,
            6932,  3402,  5133,  9394, 11229,  5252,  9008,  1556,
            6908,  4773,  3853,  8780, 10325,  7737,  1758,  7103,
            11375, 12273,  8602,  3243,  6536,  7590,  8591, 11552,
            6101,  3253,  9969,  9640,  4506,  3736,  6829, 10822,
            9130,  9948,  3566,  2133,  3901,  6038,  7333,  6609,
            3468,  4659,   625,  2700,  7738,  3443,  3060,  3388,
            3526,  4418, 11911,  6232,  1730,  2558, 10340,  5344,
            5286,  2190, 11562,  6199,  2482,  8756,  5387,  4101,
            4609,  8605,  8226,   144,  5656,  8704,  2621,  5424,
            10812,  2959, 11346,  6249,  1715,  4951,  9540,  1888,
            3764,    39,  8219,  2080,  2502,  1469, 10550,  8709,
            5601,  1093,  3784,  5041,  2058,  8399, 11448,  9639,
            2059,  9878,  7405,  2496,  7918, 11594,   371,  7993,
            3073, 10326,    40, 10004,  9245,  7987,  5603,  4051,
            7894,   676, 11380,  7379,  6501,  4981,  2628,  3488,
            10956,  7022,  6737,  9933,  7139,  2330,  3884,  5473,
            7865,  6941,  5737,  5613,  9505, 11568, 11277,  2510,
            6689,   386,  4462,   105,  2076, 10443,   119,  3955,
            4370, 11505,  3672, 11439,   750,  3240,  3133,   754,
            4013, 11929,  9210,  5378, 11881, 11018,  2818,  1851,
            4966,  8181,  2688,  6205,  6814,   926,  2936,  4327,
            10175,  7089,  6047,  9410, 10492,  8950,  2472,  6255,
            728,  7569,  6056, 10432, 11036,  2452,  2811,  3787,
            945,  8998,  1244,  8815, 11017, 11218,  5894,  4325,
            4639,  3819,  9826,  7056,  6786,  8670,  5539,  7707,
            1361,  9812,  2949, 11265, 10301,  9108,   478,  6489,
            101,  1911,  9483,  3608, 11997, 10536,   812,  8915,
            637,  8159,  5299,  9128,  3512,  8290,  7068,  7922,
            3036,  4759,  2163,  3937,  3755, 11306,  7739,  4922,
            11932,   424,  5538,  6228, 11131,  7778, 11974,  1097,
            2890, 10027,  2569,  2250,  2352,   821,  2550, 11016,
            7769,   136,   617,  3157,  5889,  9219,  6855,   120,
            4405,  1825,  9635,  7214, 10261, 11393,  2441,  9562,
            11176,   599,  2085, 11465,  7233,  6177,  4801,  9926,
            9010,  4514,  9455, 11352, 11670,  6174,  7950,  9766,
            6896, 11603,  3213,  8473,  9873,  2835, 10422,  3732,
            7961,  1457, 10857,  8069,   832,  1628,  3410,  4900,
            10855,  5111,  9543,  6325,  7431,  4083,  3072,  8847,
            9853, 10122,  5259, 11413,  6556,   303,  1465,  3871,
            4873,  5813, 10017,  6898,  3311,  5947,  8637,  5852,
            3856,   928,  4933,  8530,  1871,  2184,  5571,  5879,
            3481, 11597,  9511,  8153,    35,  2609,  5963,  8064,
            1080, 12039,  8444,  3052,  3813, 11065,  6736,  8454,
            2340,  7651,  1910, 10709,  2117,  9637,  6402,  6028,
            2124,  7701,  2679,  5183,  6270,  7424,  2597,  6795,
            9222, 10837,   280,  8583,  3270,  6753,  2354,  3779,
            6102,  4732,  5926,  2497,  8640, 10289,  6107, 12127,
            2958, 12287, 10292,  8086,   817,  4021,  2610,  1444,
            5899, 11720,  3292,  2424,  5090,  7242,  5205,  5281,
            9956,  2702,  6656,   735,  2243, 11656,   833,  3107,
            6012,  6801,  1126,  6339,  5250, 10391,  9642,  5278,
            3513,  9769,  3025,   779,  9433,  3392,  7437,   668,
            10184,  8111,  6527,  6568, 10831,  6482,  8263,  5711,
            9780,   467,  5462,  4425, 11999,  1205,  5015,  6918,
            5096,  3827,  5525, 11579,  3518,  4875,  7388,  1931,
            6615,  1541,  8708,   260,  3385,  4792,  4391,  5697,
            7895,  2155,  7337,   236, 10635, 11534,  1906,  4793,
            9527,  7239,  8354,  5121, 10662,  2311,  3346,  8556,
            707,  1088,  4936,   678, 10245,    18,  5684,   960,
            4459,  7957,   226,  2451,     6,  8874,   320,  6298,
            8963,  8735,  2852,  2981,  1707,  5408,  5017,  9876,
            9790,  2968,  1899,  6729,  4183,  5290, 10084,  7679,
            7941,  8744,  5694,  3461,  4175,  5747,  5561,  3378,
            5227,   952,  4319,  9810,  4356,  3088, 11118,   840,
            6257,   486,  6000,  1342, 10382,  6017,  4798,  5489,
            4498,  4193,  2306,  6521,  1475,  6372,  9029,  8037,
            1625,  7020,  4740,  5730,  7956,  6351,  6494,  6917,
            11405,  7487, 10202, 10155,  7666,  7556, 11509,  1546,
            6571, 10199,  2265,  7327,  5824, 11396, 11581,  9722,
            2251, 11199,  5356,  7408,  2861,  4003,  9215,   484,
            7526,  9409, 12235,  6157,  9025,  2121, 10255,  2519,
            9533,  3824,  8674, 11419, 10888,  4762, 11303,  4097,
            2414,  6496,  9953, 10554,   808,  2999,  2130,  4286,
            12078,  7445,  5132,  7915,   245,  5974,  4874,  7292,
            7560, 10539,  9952,  9075,  2113,  3721, 10285, 10022,
            9578,  8934, 11074,  9498,   294,  4711,  3391,  1377,
            9072, 10189,  4569, 10890,  9909,  6923,    53,  4653,
            439, 10253,  7028, 10207,  8343,  1141,  2556,  7601,
            8150, 10630,  8648,  9832,  7951, 11245,  2131,  5765,
            10343,  9781,  2718,  1419,  4531,  3844,  4066,  4293,
            11657, 11525, 11353,  4313,  4869, 12186,  1611, 10892,
            11489,  8833,  2393,    15, 10830,  5003,    17,   565,
            5891, 12177, 11058, 10412,  8885,  3974, 10981,  7130,
            5840, 10482,  8338,  6035,  6964,  1574, 10936,  2020,
            2465,  8191,   384,  2642,  2729,  5399,  2175,  9396,
            11987,  8035,  4375,  6611,  5010, 11812,  9131, 11427,
            104,  6348,  9643,  6757, 12110,  5617, 10935,   541,
            135,  3041,  7200,  6526,  5085, 12136,   842,  4129,
            7685, 11079,  8426,  1008,  2725, 11772,  6058,  1101,
            1950,  8424,  5688,  6876, 12005, 10079,  5335,   927,
            1770,   273,  8377,  2271,  5225, 10283,   116, 11807,
            91, 11699,   757,  1304,  7524,  6451,  8032,  8154,
            7456,  4191,   309,  2318,  2292, 10393, 11639,  9481,
            12238, 10594,  9569,  7912, 10368,  9889, 12244,  7179,
            3924,  3188,   367,  2077,   336,  5384,  5631,  8596,
            4621,  1775,  8866,   451,  6108,  1317,  6246,  8795,
            5896,  7283,  3132, 11564,  4977, 12161,  7371,  1366,
            12130, 10619,  3809,  5149,  6300,  2638,  4197,  1418,
            10065,  4156,  8373,  8644, 10445,   882,  8158, 10173,
            9763, 12191,   459,  2966,  3166,   405,  5000,  9311,
            6404,  8986,  1551,  8175,  3630, 10766,  9265,   700,
            8573,  9508,  6630, 11437, 11595,  5850,  3950,  4775,
            11941,  1446,  6018,  3386, 11470,  5310,  5476,   553,
            9474,  2586,  1431,  2741,   473, 11383,  4745,   836,
            4062, 10666,  7727, 11752,  5534,   312,  4307,  4351,
            5764,  8679,  8381,  8187,     5,  7395,  4363,  1152,
            5421,  5231,  6473,   436,  7567,  8603,  6229,  8230
        };

        /*
        * Reduce a small signed integer modulo q. The source integer MUST
        * be between -q/2 and +q/2.
        */
        internal uint mq_conv_small(int x)
        {
            /*
            * If x < 0, the cast to uint will set the high bit to 1.
            */
            uint y;

            y = (uint)x;
            y += (uint)(Q & -(y >> 31));
            return y;
        }

        /*
        * Addition modulo q. Operands must be in the 0..q-1 range.
        */
        internal uint mq_add(uint x, uint y)
        {
            /*
            * We compute x + y - q. If the result is negative, then the
            * high bit will be set, and 'd >> 31' will be equal to 1;
            * thus '-(d >> 31)' will be an all-one pattern. Otherwise,
            * it will be an all-zero pattern. In other words, this
            * implements a conditional addition of q.
            */
            uint d;

            d = x + y - Q;
            d += (uint)(Q & -(d >> 31));
            return d;
        }

        /*
        * Subtraction modulo q. Operands must be in the 0..q-1 range.
        */
        internal uint mq_sub(uint x, uint y)
        {
            /*
            * As in mq_add(), we use a conditional addition to ensure the
            * result is in the 0..q-1 range.
            */
            uint d;

            d = x - y;
            d += (uint)(Q & -(d >> 31));
            return d;
        }

        /*
        * Division by 2 modulo q. Operand must be in the 0..q-1 range.
        */
        internal uint mq_rshift1(uint x)
        {
            x += (uint)(Q & -(x & 1));
            return (x >> 1);
        }

        /*
        * Montgomery multiplication modulo q. If we set R = 2^16 mod q, then
        * this function computes: x * y / R mod q
        * Operands must be in the 0..q-1 range.
        */
        internal uint mq_montymul(uint x, uint y)
        {
            uint z, w;

            /*
            * We compute x*y + k*q with a value of k chosen so that the 16
            * low bits of the result are 0. We can then shift the value.
            * After the shift, result may still be larger than q, but it
            * will be lower than 2*q, so a conditional subtraction works.
            */

            z = x * y;
            w = ((z * Q0I) & 0xFFFF) * Q;

            /*
            * When adding z and w, the result will have its low 16 bits
            * equal to 0. Since x, y and z are lower than q, the sum will
            * be no more than (2^15 - 1) * q + (q - 1)^2, which will
            * fit on 29 bits.
            */
            z = (z + w) >> 16;

            /*
            * After the shift, analysis shows that the value will be less
            * than 2q. We do a subtraction then conditional subtraction to
            * ensure the result is in the expected range.
            */
            z -= Q;
            z += (uint)(Q & -(z >> 31));
            return z;
        }

        /*
        * Montgomery squaring (computes (x^2)/R).
        */
        internal uint mq_montysqr(uint x)
        {
            return mq_montymul(x, x);
        }

        /*
        * Divide x by y modulo q = 12289.
        */
        internal uint mq_div_12289(uint x, uint y)
        {
            /*
            * We invert y by computing y^(q-2) mod q.
            *
            * We use the following addition chain for exponent e = 12287:
            *
            *   e0 = 1
            *   e1 = 2 * e0 = 2
            *   e2 = e1 + e0 = 3
            *   e3 = e2 + e1 = 5
            *   e4 = 2 * e3 = 10
            *   e5 = 2 * e4 = 20
            *   e6 = 2 * e5 = 40
            *   e7 = 2 * e6 = 80
            *   e8 = 2 * e7 = 160
            *   e9 = e8 + e2 = 163
            *   e10 = e9 + e8 = 323
            *   e11 = 2 * e10 = 646
            *   e12 = 2 * e11 = 1292
            *   e13 = e12 + e9 = 1455
            *   e14 = 2 * e13 = 2910
            *   e15 = 2 * e14 = 5820
            *   e16 = e15 + e10 = 6143
            *   e17 = 2 * e16 = 12286
            *   e18 = e17 + e0 = 12287
            *
            * Additions on exponents are converted to Montgomery
            * multiplications. We define all intermediate results as so
            * many local variables, and let the C compiler work out which
            * must be kept around.
            */
            uint y0, y1, y2, y3, y4, y5, y6, y7, y8, y9;
            uint y10, y11, y12, y13, y14, y15, y16, y17, y18;

            y0 = mq_montymul(y, R2);
            y1 = mq_montysqr(y0);
            y2 = mq_montymul(y1, y0);
            y3 = mq_montymul(y2, y1);
            y4 = mq_montysqr(y3);
            y5 = mq_montysqr(y4);
            y6 = mq_montysqr(y5);
            y7 = mq_montysqr(y6);
            y8 = mq_montysqr(y7);
            y9 = mq_montymul(y8, y2);
            y10 = mq_montymul(y9, y8);
            y11 = mq_montysqr(y10);
            y12 = mq_montysqr(y11);
            y13 = mq_montymul(y12, y9);
            y14 = mq_montysqr(y13);
            y15 = mq_montysqr(y14);
            y16 = mq_montymul(y15, y10);
            y17 = mq_montysqr(y16);
            y18 = mq_montymul(y17, y0);

            /*
            * Final multiplication with x, which is not in Montgomery
            * representation, computes the correct division result.
            */
            return mq_montymul(y18, x);
        }

        /*
        * Compute NTT on a ring element.
        */
        internal void mq_NTT(ushort[] asrc, int a, uint logn)
        {
            int n, t, m;

            n = (int)1 << (int)logn;
            t = n;
            for (m = 1; m < n; m <<= 1) {
                int ht, i, j1;

                ht = t >> 1;
                for (i = 0, j1 = 0; i < m; i ++, j1 += t) {
                    int j, j2;
                    uint s;

                    s = GMb[m + i];
                    j2 = j1 + ht;
                    for (j = j1; j < j2; j ++) {
                        uint u, v;

                        u = asrc[a + j];
                        v = mq_montymul(asrc[a + j + ht], s);
                        asrc[a + j] = (ushort)mq_add(u, v);
                        asrc[a + j + ht] = (ushort)mq_sub(u, v);
                    }
                }
                t = ht;
            }
        }

        /*
        * Compute the inverse NTT on a ring element, binary case.
        */
        internal void mq_iNTT(ushort[] asrc, int a, uint logn)
        {
            int n, t, m;
            uint ni;

            n = (int)1 << (int)logn;
            t = 1;
            m = n;
            while (m > 1) {
                int hm, dt, i, j1;

                hm = m >> 1;
                dt = t << 1;
                for (i = 0, j1 = 0; i < hm; i ++, j1 += dt) {
                    int j, j2;
                    uint s;

                    j2 = j1 + t;
                    s = iGMb[hm + i];
                    for (j = j1; j < j2; j ++) {
                        uint u, v, w;

                        u = asrc[a + j];
                        v = asrc[a + j + t];
                        asrc[a + j] = (ushort)mq_add(u, v);
                        w = mq_sub(u, v);
                        asrc[a + j + t] = (ushort)
                            mq_montymul(w, s);
                    }
                }
                t = dt;
                m = hm;
            }

            /*
            * To complete the inverse NTT, we must now divide all values by
            * n (the vector size). We thus need the inverse of n, i.e. we
            * need to divide 1 by 2 logn times. But we also want it in
            * Montgomery representation, i.e. we also want to multiply it
            * by R = 2^16. In the common case, this should be a simple right
            * shift. The loop below is generic and works also in corner cases;
            * its computation time is negligible.
            */
            ni = R;
            for (m = n; m > 1; m >>= 1) {
                ni = mq_rshift1(ni);
            }
            for (m = 0; m < n; m ++) {
                asrc[a + m] = (ushort)mq_montymul(asrc[a + m], ni);
            }
        }

        /*
        * Convert a polynomial (mod q) to Montgomery representation.
        */
        internal void mq_poly_tomonty(ushort[] fsrc, int f, uint logn)
        {
            int u, n;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                fsrc[f + u] = (ushort)mq_montymul(fsrc[f + u], R2);
            }
        }

        /*
        * Multiply two polynomials together (NTT representation, and using
        * a Montgomery multiplication). Result f*g is written over f.
        */
        internal void mq_poly_montymul_ntt(ushort[] fsrc, int f, ushort[] gsrc, int g, uint logn)
        {
            int u, n;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                fsrc[f + u] = (ushort)mq_montymul(fsrc[f + u], gsrc[g + u]);
            }
        }

        /*
        * Subtract polynomial g from polynomial f.
        */
        internal void mq_poly_sub(ushort[] fsrc, int f, ushort[] gsrc, int g, uint logn)
        {
            int u, n;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                fsrc[f + u] = (ushort)mq_sub(fsrc[f + u], gsrc[g + u]);
            }
        }

        /* ===================================================================== */

        internal void to_ntt_monty(ushort[] hsrc, int h, uint logn)
        {
            mq_NTT(hsrc, h, logn);
            mq_poly_tomonty(hsrc, h, logn);
        }

        internal bool verify_raw(ushort[] c0src, int c0, short[] s2src, int s2,
            ushort[] hsrc, int h, uint logn, ushort[] tmpsrc, int tmp)
        {
            int u, n;
            int tt;

            n = (int)1 << (int)logn;
            tt = tmp;

            /*
            * Reduce s2 elements modulo q ([0..q-1] range).
            */
            for (u = 0; u < n; u ++) {
                uint w;

                w = (uint)s2src[s2 + u];
                w += (uint)(Q & -(w >> 31));
                tmpsrc[tt+u] = (ushort)w;
            }

            /*
            * Compute -s1 = s2*h - c0 mod phi mod q (in tt[]).
            */
            mq_NTT(tmpsrc, tt, logn);
            mq_poly_montymul_ntt(tmpsrc, tt, hsrc, h, logn);
            mq_iNTT(tmpsrc, tt, logn);
            mq_poly_sub(tmpsrc, tt, c0src, c0, logn);

            /*
            * Normalize -s1 elements into the [-q/2..q/2] range.
            */
            short[] shorttmp = new short[n];
            for (u = 0; u < n; u ++) {
                int w;

                w = (int)tmpsrc[tt+u];
                w -= (int)(Q & -(((Q >> 1) - (uint)w) >> 31));
                tmpsrc[tt + u] = (ushort)w;
                shorttmp[u] = (short)tmpsrc[tt + u];
            }


            /*
            * Signature is valid if and only if the aggregate (-s1,s2) vector
            * is short enough.
            */
            return this.common.is_short(shorttmp, 0, s2src, s2, logn);
        }

        internal int compute_public(ushort[] hsrc, int h,
            sbyte[] fsrc, int f, sbyte[] gsrc, int g, uint logn, ushort[] tmpsrc, int tmp)
        {
            int u, n;
            int tt;

            n = (int)1 << (int)logn;
            tt = tmp;
            for (u = 0; u < n; u ++) {
                tmpsrc[tt+u] = (ushort)mq_conv_small(fsrc[f+u]);
                hsrc[h+u] = (ushort)mq_conv_small(gsrc[g+u]);
            }
            mq_NTT(hsrc, h, logn);
            mq_NTT(tmpsrc, tt, logn);
            for (u = 0; u < n; u ++) {
                if (tmpsrc[tt+u] == 0) {
                    return 0;
                }
                hsrc[h+u] = (ushort)mq_div_12289(hsrc[h+u], tmpsrc[tt+u]);
            }
            mq_iNTT(hsrc, h, logn);
            return 1;
        }

        internal int complete_private(sbyte[] Gsrc, int G,
            sbyte[] fsrc, int f, sbyte[] gsrc, int g, sbyte[] Fsrc, int F,
            uint logn, ushort[] tmpsrc, int tmp)
        {
            int u, n;
            int t1, t2;

            n = (int)1 << (int)logn;
            t1 = tmp;
            t2 = t1 + n;
            for (u = 0; u < n; u ++) {
                tmpsrc[t1+u] = (ushort)mq_conv_small(gsrc[g+u]);
                tmpsrc[t2+u] = (ushort)mq_conv_small(Fsrc[F+u]);
            }
            mq_NTT(tmpsrc, t1, logn);
            mq_NTT(tmpsrc, t2, logn);
            mq_poly_tomonty(tmpsrc, t1, logn);
            mq_poly_montymul_ntt(tmpsrc, t1, tmpsrc, t2, logn);
            for (u = 0; u < n; u ++) {
                tmpsrc[t2+u] = (ushort)mq_conv_small(fsrc[f+u]);
            }
            mq_NTT(tmpsrc, t2, logn);
            for (u = 0; u < n; u ++) {
                if (tmpsrc[t2+u] == 0) {
                    return 0;
                }
                tmpsrc[t1+u] = (ushort)mq_div_12289(tmpsrc[t1+u], tmpsrc[t2+u]);
            }
            mq_iNTT(tmpsrc, t1, logn);
            for (u = 0; u < n; u ++) {
                uint w;
                int gi;

                w = tmpsrc[t1+u];
                w -= (uint)(Q & ~-((w - (Q >> 1)) >> 31));
                //gi = *(int *)&w;
                gi = (int)w;
                if (gi < -127 || gi > +127) {
                    return 0;
                }
                Gsrc[G+u] = (sbyte)gi;
            }
            return 1;
        }

        internal int is_invertible(
            short[] s2src, int s2, uint logn, ushort[] tmpsrc, int tmp)
        {
            int u, n;
            int tt;
            uint r;

            n = (int)1 << (int)logn;
            tt = tmp;
            for (u = 0; u < n; u ++) {
                uint w;

                w = (uint)s2src[s2 + u];
                w += (uint)(Q & -(w >> 31));
                tmpsrc[tt+u] = (ushort)w;
            }
            mq_NTT(tmpsrc, tt, logn);
            r = 0;
            for (u = 0; u < n; u ++) {
                r |= (uint)(tmpsrc[tt+u] - 1);
            }
            return (int)(1u - (r >> 31));
        }

        internal int verify_recover(ushort[] hsrc, int h,
            ushort[] c0src, int c0, short[] s1src, int s1, short[] s2src, int s2,
            uint logn, ushort[] tmpsrc, int tmp)
        {
            int u, n;
            int tt;
            uint r;

            n = (int)1 << (int)logn;

            /*
            * Reduce elements of s1 and s2 modulo q; then write s2 into tt[]
            * and c0 - s1 into h[].
            */
            tt = tmp;
            for (u = 0; u < n; u ++) {
                uint w;

                w = (uint)s2src[s2 + u];
                w += (uint)(Q & -(w >> 31));
                tmpsrc[tt+u] = (ushort)w;

                w = (uint)s1src[s1+u];
                w += (uint)(Q & -(w >> 31));
                w = mq_sub(c0src[c0 + u], w);
                hsrc[h+u] = (ushort)w;
            }

            /*
            * Compute h = (c0 - s1) / s2. If one of the coefficients of s2
            * is zero (in NTT representation) then the operation fails. We
            * keep that information into a flag so that we do not deviate
            * from strict constant-time processing; if all coefficients of
            * s2 are non-zero, then the high bit of r will be zero.
            */
            mq_NTT(tmpsrc, tt, logn);
            mq_NTT(hsrc, h, logn);
            r = 0;
            for (u = 0; u < n; u ++) {
                r |= (uint)(tmpsrc[tt+u] - 1);
                hsrc[h+u] = (ushort)mq_div_12289(hsrc[h+u], tmpsrc[tt+u]);
            }
            mq_iNTT(hsrc, h, logn);

            /*
            * Signature is acceptable if and only if it is short enough,
            * and s2 was invertible mod phi mod q. The caller must still
            * check that the rebuilt public key matches the expected
            * value (e.g. through a hash).
            */
            r = ~r & (uint)-(this.common.is_short(s1src, s1, s2src, s2, logn) ? 1 : 0);
            return (int)(r >> 31);
        }

        internal int count_nttzero(short[] sigsrc, int sig, uint logn, ushort[] tmpsrc, int tmp)
        {
            int s2;
            int u, n;
            uint r;

            n = (int)1 << (int)logn;
            s2 = tmp;
            for (u = 0; u < n; u ++) {
                uint w;

                w = (uint)sigsrc[sig + u];
                w += (uint)(Q & -(w >> 31));
                tmpsrc[s2 + u] = (ushort)w;
            }
            mq_NTT(tmpsrc, s2, logn);
            r = 0;
            for (u = 0; u < n; u ++) {
                uint w;

                w = (uint)tmpsrc[s2 + u] - 1u;
                r += (w >> 31);
            }
            return (int)r;
        }
    }
}
