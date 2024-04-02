using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Agreement
{
    /// <summary>
    /// SM2 Key Exchange protocol - based on https://tools.ietf.org/html/draft-shen-sm2-ecdsa-02
    /// </summary>
    public class SM2KeyExchange
    {
        private readonly IDigest mDigest;

        private byte[] mUserID;
        private ECPrivateKeyParameters mStaticKey;
        private ECPoint mStaticPubPoint;
        private ECPoint mEphemeralPubPoint;
        private ECDomainParameters mECParams;
        private int mW;
        private ECPrivateKeyParameters mEphemeralKey;
        private bool mInitiator;

        public SM2KeyExchange()
            : this(new SM3Digest())
        {
        }

        public SM2KeyExchange(IDigest digest)
        {
            this.mDigest = digest;
        }

        public virtual void Init(ICipherParameters privParam)
        {
            SM2KeyExchangePrivateParameters baseParam;

            if (privParam is ParametersWithID)
            {
                baseParam = (SM2KeyExchangePrivateParameters)((ParametersWithID)privParam).Parameters;
                mUserID = ((ParametersWithID)privParam).GetID();
            }
            else
            {
                baseParam = (SM2KeyExchangePrivateParameters)privParam;
                mUserID = new byte[0];
            }

            mInitiator = baseParam.IsInitiator;
            mStaticKey = baseParam.StaticPrivateKey;
            mEphemeralKey = baseParam.EphemeralPrivateKey;
            mECParams = mStaticKey.Parameters;
            mStaticPubPoint = baseParam.StaticPublicPoint;
            mEphemeralPubPoint = baseParam.EphemeralPublicPoint;
            mW = mECParams.Curve.FieldSize / 2 - 1;
        }

        public virtual byte[] CalculateKey(int kLen, ICipherParameters pubParam)
        {
            SM2KeyExchangePublicParameters otherPub;
            byte[] otherUserID;

            if (pubParam is ParametersWithID)
            {
                otherPub = (SM2KeyExchangePublicParameters)((ParametersWithID)pubParam).Parameters;
                otherUserID = ((ParametersWithID)pubParam).GetID();
            }
            else
            {
                otherPub = (SM2KeyExchangePublicParameters)pubParam;
                otherUserID = new byte[0];
            }

            byte[] za = GetZ(mDigest, mUserID, mStaticPubPoint);
            byte[] zb = GetZ(mDigest, otherUserID, otherPub.StaticPublicKey.Q);

            ECPoint U = CalculateU(otherPub);

            byte[] rv;
            if (mInitiator)
            {
                rv = Kdf(U, za, zb, kLen);
            }
            else
            {
                rv = Kdf(U, zb, za, kLen);
            }

            return rv;
        }

        public virtual byte[][] CalculateKeyWithConfirmation(int kLen, byte[] confirmationTag, ICipherParameters pubParam)
        {
            SM2KeyExchangePublicParameters otherPub;
            byte[] otherUserID;

            if (pubParam is ParametersWithID)
            {
                otherPub = (SM2KeyExchangePublicParameters)((ParametersWithID)pubParam).Parameters;
                otherUserID = ((ParametersWithID)pubParam).GetID();
            }
            else
            {
                otherPub = (SM2KeyExchangePublicParameters)pubParam;
                otherUserID = new byte[0];
            }

            if (mInitiator && confirmationTag == null)
                throw new ArgumentException("if initiating, confirmationTag must be set");

            byte[] za = GetZ(mDigest, mUserID, mStaticPubPoint);
            byte[] zb = GetZ(mDigest, otherUserID, otherPub.StaticPublicKey.Q);

            ECPoint U = CalculateU(otherPub);

            byte[] rv;
            if (mInitiator)
            {
                rv = Kdf(U, za, zb, kLen);

                byte[] inner = CalculateInnerHash(mDigest, U, za, zb, mEphemeralPubPoint, otherPub.EphemeralPublicKey.Q);

                byte[] s1 = S1(mDigest, U, inner);

                if (!Arrays.ConstantTimeAreEqual(s1, confirmationTag))
                    throw new InvalidOperationException("confirmation tag mismatch");

                return new byte[][] { rv, S2(mDigest, U, inner)};
            }
            else
            {
                rv = Kdf(U, zb, za, kLen);

                byte[] inner = CalculateInnerHash(mDigest, U, zb, za, otherPub.EphemeralPublicKey.Q, mEphemeralPubPoint);

                return new byte[][] { rv, S1(mDigest, U, inner), S2(mDigest, U, inner) };
            }
        }

        protected virtual ECPoint CalculateU(SM2KeyExchangePublicParameters otherPub)
        {
            ECDomainParameters dp = mStaticKey.Parameters;

            ECPoint p1 = ECAlgorithms.CleanPoint(dp.Curve, otherPub.StaticPublicKey.Q);
            ECPoint p2 = ECAlgorithms.CleanPoint(dp.Curve, otherPub.EphemeralPublicKey.Q);

            BigInteger x1 = Reduce(mEphemeralPubPoint.AffineXCoord.ToBigInteger());
            BigInteger x2 = Reduce(p2.AffineXCoord.ToBigInteger());
            BigInteger tA = mStaticKey.D.Add(x1.Multiply(mEphemeralKey.D));
            BigInteger k1 = mECParams.H.Multiply(tA).Mod(mECParams.N);
            BigInteger k2 = k1.Multiply(x2).Mod(mECParams.N);

            return ECAlgorithms.SumOfTwoMultiplies(p1, k1, p2, k2).Normalize();
        }

        protected virtual byte[] Kdf(ECPoint u, byte[] za, byte[] zb, int klen)
        {
            int digestSize = mDigest.GetDigestSize();
            byte[] buf = new byte[System.Math.Max(4, digestSize)];
            byte[] rv = new byte[(klen + 7) / 8];
            int off = 0;

            IMemoable memo = mDigest as IMemoable;
            IMemoable copy = null;

            if (memo != null)
            {
                AddFieldElement(mDigest, u.AffineXCoord);
                AddFieldElement(mDigest, u.AffineYCoord);
                mDigest.BlockUpdate(za, 0, za.Length);
                mDigest.BlockUpdate(zb, 0, zb.Length);
                copy = memo.Copy();
            }

            uint ct = 0;

            while (off < rv.Length)
            {
                if (memo != null)
                {
                    memo.Reset(copy);
                }
                else
                {
                    AddFieldElement(mDigest, u.AffineXCoord);
                    AddFieldElement(mDigest, u.AffineYCoord);
                    mDigest.BlockUpdate(za, 0, za.Length);
                    mDigest.BlockUpdate(zb, 0, zb.Length);
                }

                Pack.UInt32_To_BE(++ct, buf, 0);
                mDigest.BlockUpdate(buf, 0, 4);
                mDigest.DoFinal(buf, 0);

                int copyLen = System.Math.Min(digestSize, rv.Length - off);
                Array.Copy(buf, 0, rv, off, copyLen);
                off += copyLen;
            }

            return rv;
        }

        //x1~=2^w+(x1 AND (2^w-1))
        private BigInteger Reduce(BigInteger x)
        {
            return x.And(BigInteger.One.ShiftLeft(mW).Subtract(BigInteger.One)).SetBit(mW);
        }

        private byte[] S1(IDigest digest, ECPoint u, byte[] inner)
        {
            digest.Update((byte)0x02);
            AddFieldElement(digest, u.AffineYCoord);
            digest.BlockUpdate(inner, 0, inner.Length);

            return DigestUtilities.DoFinal(digest);
        }

        private byte[] CalculateInnerHash(IDigest digest, ECPoint u, byte[] za, byte[] zb, ECPoint p1, ECPoint p2)
        {
            AddFieldElement(digest, u.AffineXCoord);
            digest.BlockUpdate(za, 0, za.Length);
            digest.BlockUpdate(zb, 0, zb.Length);
            AddFieldElement(digest, p1.AffineXCoord);
            AddFieldElement(digest, p1.AffineYCoord);
            AddFieldElement(digest, p2.AffineXCoord);
            AddFieldElement(digest, p2.AffineYCoord);

            return DigestUtilities.DoFinal(digest);
        }

        private byte[] S2(IDigest digest, ECPoint u, byte[] inner)
        {
            digest.Update((byte)0x03);
            AddFieldElement(digest, u.AffineYCoord);
            digest.BlockUpdate(inner, 0, inner.Length);

            return DigestUtilities.DoFinal(digest);
        }

        private byte[] GetZ(IDigest digest, byte[] userID, ECPoint pubPoint)
        {
            AddUserID(digest, userID);

            AddFieldElement(digest, mECParams.Curve.A);
            AddFieldElement(digest, mECParams.Curve.B);
            AddFieldElement(digest, mECParams.G.AffineXCoord);
            AddFieldElement(digest, mECParams.G.AffineYCoord);
            AddFieldElement(digest, pubPoint.AffineXCoord);
            AddFieldElement(digest, pubPoint.AffineYCoord);

            return DigestUtilities.DoFinal(digest);
        }

        private void AddUserID(IDigest digest, byte[] userID)
        {
            uint len = (uint)(userID.Length * 8);

            digest.Update((byte)(len >> 8));
            digest.Update((byte)len);
            digest.BlockUpdate(userID, 0, userID.Length);
        }

        private void AddFieldElement(IDigest digest, ECFieldElement v)
        {
            byte[] p = v.GetEncoded();
            digest.BlockUpdate(p, 0, p.Length);
        }
    }
}
