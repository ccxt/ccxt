using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Generators
{
	/**
	 * generate suitable parameters for GOST3410.
	 */
	public class Gost3410ParametersGenerator
	{
		private int             size;
		private int             typeproc;
		private SecureRandom    init_random;

		/**
		 * initialise the key generator.
		 *
		 * @param size size of the key
		 * @param typeProcedure type procedure A,B = 1;  A',B' - else
		 * @param random random byte source.
		 */
		public void Init(
			int             size,
			int             typeProcedure,
			SecureRandom    random)
		{
			this.size = size;
			this.typeproc = typeProcedure;
			this.init_random = random;
		}

		//Procedure A
		private int procedure_A(int x0, int c,  BigInteger[] pq, int size)
		{
			//Verify and perform condition: 0<x<2^16; 0<c<2^16; c - odd.
			while(x0<0 || x0>65536)
			{
				x0 = init_random.NextInt()/32768;
			}

			while((c<0 || c>65536) || (c/2==0))
			{
				c = init_random.NextInt()/32768 + 1;
			}

			BigInteger C = BigInteger.ValueOf(c);
			BigInteger constA16 = BigInteger.ValueOf(19381);

			//step1
			BigInteger[] y = new BigInteger[1]; // begin length = 1
			y[0] = BigInteger.ValueOf(x0);

			//step 2
			int[] t = new int[1]; // t - orders; begin length = 1
			t[0] = size;
			int s = 0;
			for (int i=0; t[i]>=17; i++)
			{
				// extension array t
				int[] tmp_t = new int[t.Length + 1];             ///////////////
					Array.Copy(t,0,tmp_t,0,t.Length);          //  extension
				t = new int[tmp_t.Length];                       //  array t
				Array.Copy(tmp_t, 0, t, 0, tmp_t.Length);  ///////////////

				t[i+1] = t[i]/2;
				s = i+1;
			}

			//step3
			BigInteger[] p = new BigInteger[s+1];
			p[s] = new BigInteger("8003",16); //set min prime number length 16 bit

			int m = s-1;  //step4

			for (int i=0; i<s; i++)
			{
				int rm = t[m]/16;  //step5

			step6: for(;;)
				   {
					   //step 6
					   BigInteger[] tmp_y = new BigInteger[y.Length];  ////////////////
					   Array.Copy(y,0,tmp_y,0,y.Length);         //  extension
					   y = new BigInteger[rm+1];                       //  array y
					   Array.Copy(tmp_y,0,y,0,tmp_y.Length);     ////////////////

					   for (int j=0; j<rm; j++)
					   {
						   y[j+1] = (y[j].Multiply(constA16).Add(C)).Mod(BigInteger.Two.Pow(16));
					   }

					   //step 7
					   BigInteger Ym = BigInteger.Zero;
					   for (int j=0; j<rm; j++)
					   {
						   Ym = Ym.Add(y[j].ShiftLeft(16*j));
					   }

					   y[0] = y[rm]; //step 8

					   //step 9
					   BigInteger N = BigInteger.One.ShiftLeft(t[m]-1).Divide(p[m+1]).Add(
						   Ym.ShiftLeft(t[m]-1).Divide(p[m+1].ShiftLeft(16*rm)));

					   if (N.TestBit(0))
					   {
						   N = N.Add(BigInteger.One);
					   }

					   //step 10

						for(;;)
						{
							//step 11
							BigInteger NByLastP = N.Multiply(p[m+1]);

							if (NByLastP.BitLength > t[m])
							{
								goto step6; //step 12
							}

							p[m] = NByLastP.Add(BigInteger.One);

							//step13
							if (BigInteger.Two.ModPow(NByLastP, p[m]).CompareTo(BigInteger.One) == 0
								&& BigInteger.Two.ModPow(N, p[m]).CompareTo(BigInteger.One) != 0)
							{
								break;
							}

							N = N.Add(BigInteger.Two);
						}

					   if (--m < 0)
					   {
						   pq[0] = p[0];
						   pq[1] = p[1];
						   return y[0].IntValue; //return for procedure B step 2
					   }

					   break; //step 14
				   }
			}
			return y[0].IntValue;
		}

		//Procedure A'
		private long procedure_Aa(long x0, long c, BigInteger[] pq, int size)
		{
			//Verify and perform condition: 0<x<2^32; 0<c<2^32; c - odd.
			while(x0<0 || x0>4294967296L)
			{
				x0 = init_random.NextInt()*2;
			}

			while((c<0 || c>4294967296L) || (c/2==0))
			{
				c = init_random.NextInt()*2+1;
			}

			BigInteger C = BigInteger.ValueOf(c);
			BigInteger constA32 = BigInteger.ValueOf(97781173);

			//step1
			BigInteger[] y = new BigInteger[1]; // begin length = 1
			y[0] = BigInteger.ValueOf(x0);

			//step 2
			int[] t = new int[1]; // t - orders; begin length = 1
			t[0] = size;
			int s = 0;
			for (int i=0; t[i]>=33; i++)
			{
				// extension array t
				int[] tmp_t = new int[t.Length + 1];             ///////////////
					Array.Copy(t,0,tmp_t,0,t.Length);          //  extension
				t = new int[tmp_t.Length];                       //  array t
				Array.Copy(tmp_t, 0, t, 0, tmp_t.Length);  ///////////////

				t[i+1] = t[i]/2;
				s = i+1;
			}

			//step3
			BigInteger[] p = new BigInteger[s+1];
			p[s] = new BigInteger("8000000B",16); //set min prime number length 32 bit

			int m = s-1;  //step4

			for (int i=0; i<s; i++)
			{
				int rm = t[m]/32;  //step5

			step6: for(;;)
				   {
					   //step 6
					   BigInteger[] tmp_y = new BigInteger[y.Length];  ////////////////
						   Array.Copy(y,0,tmp_y,0,y.Length);         //  extension
					   y = new BigInteger[rm+1];                       //  array y
					   Array.Copy(tmp_y,0,y,0,tmp_y.Length);     ////////////////

					   for (int j=0; j<rm; j++)
					   {
						   y[j+1] = (y[j].Multiply(constA32).Add(C)).Mod(BigInteger.Two.Pow(32));
					   }

					   //step 7
					   BigInteger Ym = BigInteger.Zero;
					   for (int j=0; j<rm; j++)
					   {
						   Ym = Ym.Add(y[j].ShiftLeft(32*j));
					   }

					   y[0] = y[rm]; //step 8

					   //step 9
					   BigInteger N = BigInteger.One.ShiftLeft(t[m]-1).Divide(p[m+1]).Add(
						   Ym.ShiftLeft(t[m]-1).Divide(p[m+1].ShiftLeft(32*rm)));

					   if (N.TestBit(0))
					   {
						   N = N.Add(BigInteger.One);
					   }

					   //step 10

						for(;;)
						{
							//step 11
							BigInteger NByLastP = N.Multiply(p[m+1]);

							if (NByLastP.BitLength > t[m])
							{
								goto step6; //step 12
							}

							p[m] = NByLastP.Add(BigInteger.One);

							//step13
							if (BigInteger.Two.ModPow(NByLastP, p[m]).CompareTo(BigInteger.One) == 0
								&& BigInteger.Two.ModPow(N, p[m]).CompareTo(BigInteger.One) != 0)
							{
								break;
							}

							N = N.Add(BigInteger.Two);
						}

					   if (--m < 0)
					   {
						   pq[0] = p[0];
						   pq[1] = p[1];
						   return y[0].LongValue; //return for procedure B' step 2
					   }

					   break; //step 14
				   }
			}
			return y[0].LongValue;
		}

		//Procedure B
		private void procedure_B(int x0, int c, BigInteger[] pq)
		{
			//Verify and perform condition: 0<x<2^16; 0<c<2^16; c - odd.
			while(x0<0 || x0>65536)
			{
				x0 = init_random.NextInt()/32768;
			}

			while((c<0 || c>65536) || (c/2==0))
			{
				c = init_random.NextInt()/32768 + 1;
			}

			BigInteger [] qp = new BigInteger[2];
			BigInteger q = null, Q = null, p = null;
			BigInteger C = BigInteger.ValueOf(c);
			BigInteger constA16 = BigInteger.ValueOf(19381);

			//step1
			x0 = procedure_A(x0, c, qp, 256);
			q = qp[0];

			//step2
			x0 = procedure_A(x0, c, qp, 512);
			Q = qp[0];

			BigInteger[] y = new BigInteger[65];
			y[0] = BigInteger.ValueOf(x0);

			const int tp = 1024;

			BigInteger qQ = q.Multiply(Q);

step3:
			for(;;)
			{
				//step 3
				for (int j=0; j<64; j++)
				{
					y[j+1] = (y[j].Multiply(constA16).Add(C)).Mod(BigInteger.Two.Pow(16));
				}

				//step 4
				BigInteger Y = BigInteger.Zero;

				for (int j=0; j<64; j++)
				{
					Y = Y.Add(y[j].ShiftLeft(16*j));
				}

				y[0] = y[64]; //step 5

				//step 6
				BigInteger N = BigInteger.One.ShiftLeft(tp-1).Divide(qQ).Add(
					Y.ShiftLeft(tp-1).Divide(qQ.ShiftLeft(1024)));

				if (N.TestBit(0))
				{
					N = N.Add(BigInteger.One);
				}

				//step 7

				for(;;)
				{
					//step 11
					BigInteger qQN = qQ.Multiply(N);

					if (qQN.BitLength > tp)
					{
						goto step3; //step 9
					}

					p = qQN.Add(BigInteger.One);

					//step10
					if (BigInteger.Two.ModPow(qQN, p).CompareTo(BigInteger.One) == 0
						&& BigInteger.Two.ModPow(q.Multiply(N), p).CompareTo(BigInteger.One) != 0)
					{
						pq[0] = p;
						pq[1] = q;
						return;
					}

					N = N.Add(BigInteger.Two);
				}
			}
		}

		//Procedure B'
		private void procedure_Bb(long x0, long c, BigInteger[] pq)
		{
			//Verify and perform condition: 0<x<2^32; 0<c<2^32; c - odd.
			while(x0<0 || x0>4294967296L)
			{
				x0 = init_random.NextInt()*2;
			}

			while((c<0 || c>4294967296L) || (c/2==0))
			{
				c = init_random.NextInt()*2+1;
			}

			BigInteger [] qp = new BigInteger[2];
			BigInteger q = null, Q = null, p = null;
			BigInteger C = BigInteger.ValueOf(c);
			BigInteger constA32 = BigInteger.ValueOf(97781173);

			//step1
			x0 = procedure_Aa(x0, c, qp, 256);
			q = qp[0];

			//step2
			x0 = procedure_Aa(x0, c, qp, 512);
			Q = qp[0];

			BigInteger[] y = new BigInteger[33];
			y[0] = BigInteger.ValueOf(x0);

			const int tp = 1024;

			BigInteger qQ = q.Multiply(Q);

step3:
			for(;;)
			{
				//step 3
				for (int j=0; j<32; j++)
				{
					y[j+1] = (y[j].Multiply(constA32).Add(C)).Mod(BigInteger.Two.Pow(32));
				}

				//step 4
				BigInteger Y = BigInteger.Zero;
				for (int j=0; j<32; j++)
				{
					Y = Y.Add(y[j].ShiftLeft(32*j));
				}

				y[0] = y[32]; //step 5

				//step 6
				BigInteger N = BigInteger.One.ShiftLeft(tp-1).Divide(qQ).Add(
					Y.ShiftLeft(tp-1).Divide(qQ.ShiftLeft(1024)));

				if (N.TestBit(0))
				{
					N = N.Add(BigInteger.One);
				}

				//step 7

				for(;;)
				{
					//step 11
					BigInteger qQN = qQ.Multiply(N);

					if (qQN.BitLength > tp)
					{
						goto step3; //step 9
					}

					p = qQN.Add(BigInteger.One);

					//step10
					if (BigInteger.Two.ModPow(qQN, p).CompareTo(BigInteger.One) == 0
						&& BigInteger.Two.ModPow(q.Multiply(N), p).CompareTo(BigInteger.One) != 0)
					{
						pq[0] = p;
						pq[1] = q;
						return;
					}

					N = N.Add(BigInteger.Two);
				}
			}
		}


		/**
		 * Procedure C
		 * procedure generates the a value from the given p,q,
		 * returning the a value.
		 */
		private BigInteger procedure_C(BigInteger p, BigInteger q)
		{
			BigInteger pSub1 = p.Subtract(BigInteger.One);
			BigInteger pSub1Divq = pSub1.Divide(q);

			for(;;)
			{
				BigInteger d = new BigInteger(p.BitLength, init_random);

				// 1 < d < p-1
				if (d.CompareTo(BigInteger.One) > 0 && d.CompareTo(pSub1) < 0)
				{
					BigInteger a = d.ModPow(pSub1Divq, p);

					if (a.CompareTo(BigInteger.One) != 0)
					{
						return a;
					}
				}
			}
		}

		/**
		 * which generates the p , q and a values from the given parameters,
		 * returning the Gost3410Parameters object.
		 */
		public Gost3410Parameters GenerateParameters()
		{
			BigInteger [] pq = new BigInteger[2];
			BigInteger    q = null, p = null, a = null;

			int  x0, c;
			long  x0L, cL;

			if (typeproc==1)
			{
				x0 = init_random.NextInt();
				c  = init_random.NextInt();

				switch(size)
				{
					case 512:
						procedure_A(x0, c, pq, 512);
						break;
					case 1024:
						procedure_B(x0, c, pq);
						break;
					default:
						throw new ArgumentException("Ooops! key size 512 or 1024 bit.");
				}
				p = pq[0];  q = pq[1];
				a = procedure_C(p, q);
				//System.out.println("p:"+p.toString(16)+"\n"+"q:"+q.toString(16)+"\n"+"a:"+a.toString(16));
				//System.out.println("p:"+p+"\n"+"q:"+q+"\n"+"a:"+a);
				return new Gost3410Parameters(p, q, a, new Gost3410ValidationParameters(x0, c));
			}
			else
			{
				x0L = init_random.NextLong();
				cL  = init_random.NextLong();

				switch(size)
				{
					case 512:
						procedure_Aa(x0L, cL, pq, 512);
						break;
					case 1024:
						procedure_Bb(x0L, cL, pq);
						break;
					default:
						throw new InvalidOperationException("Ooops! key size 512 or 1024 bit.");
				}
				p = pq[0];  q = pq[1];
				a = procedure_C(p, q);
				//System.out.println("p:"+p.toString(16)+"\n"+"q:"+q.toString(16)+"\n"+"a:"+a.toString(16));
				//System.out.println("p:"+p+"\n"+"q:"+q+"\n"+"a:"+a);
				return new Gost3410Parameters(p, q, a, new Gost3410ValidationParameters(x0L, cL));
			}
		}
	}
}
