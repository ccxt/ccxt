using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.Tsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities.Date;

namespace Org.BouncyCastle.Tsp
{
    /**
     * Generator for RFC 3161 Time Stamp Responses.
     */
    public class TimeStampResponseGenerator
    {
        private PkiStatus status;

        private Asn1EncodableVector statusStrings;

        private int failInfo;
        private TimeStampTokenGenerator tokenGenerator;
        private IList<string> acceptedAlgorithms;
        private IList<string> acceptedPolicies;
        private IList<string> acceptedExtensions;

        public TimeStampResponseGenerator(
            TimeStampTokenGenerator tokenGenerator,
            IList<string> acceptedAlgorithms)
            : this(tokenGenerator, acceptedAlgorithms, null, null)
        {
        }

        public TimeStampResponseGenerator(
            TimeStampTokenGenerator tokenGenerator,
            IList<string> acceptedAlgorithms,
            IList<string> acceptedPolicy)
            : this(tokenGenerator, acceptedAlgorithms, acceptedPolicy, null)
        {
        }

        public TimeStampResponseGenerator(
            TimeStampTokenGenerator tokenGenerator,
            IList<string> acceptedAlgorithms,
            IList<string> acceptedPolicies,
            IList<string> acceptedExtensions)
        {
            this.tokenGenerator = tokenGenerator;
            this.acceptedAlgorithms = acceptedAlgorithms;
            this.acceptedPolicies = acceptedPolicies;
            this.acceptedExtensions = acceptedExtensions;

            statusStrings = new Asn1EncodableVector();
        }

        private void AddStatusString(string statusString)
        {
            statusStrings.Add(new DerUtf8String(statusString));
        }

        private void SetFailInfoField(int field)
        {
            failInfo |= field;
        }

        private PkiStatusInfo GetPkiStatusInfo()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(
                new DerInteger((int)status));

            if (statusStrings.Count > 0)
            {
                v.Add(new PkiFreeText(new DerSequence(statusStrings)));
            }

            if (failInfo != 0)
            {
                v.Add(new FailInfo(failInfo));
            }

            return new PkiStatusInfo(new DerSequence(v));
        }

        public TimeStampResponse Generate(
            TimeStampRequest request,
            BigInteger serialNumber,
            DateTime genTime)
        {
            return Generate(request, serialNumber, new DateTimeObject(genTime));
        }

        /**
         * Return an appropriate TimeStampResponse.
         * <p>
         * If genTime is null a timeNotAvailable error response will be returned.
         *
         * @param request the request this response is for.
         * @param serialNumber serial number for the response token.
         * @param genTime generation time for the response token.
         * @param provider provider to use for signature calculation.
         * @return
         * @throws NoSuchAlgorithmException
         * @throws NoSuchProviderException
         * @throws TSPException
         * </p>
         */
        public TimeStampResponse Generate(
            TimeStampRequest request,
            BigInteger serialNumber,
            DateTimeObject genTime)
        {
            TimeStampResp resp;

            try
            {
                if (genTime == null)
                    throw new TspValidationException("The time source is not available.",
                        PkiFailureInfo.TimeNotAvailable);

                request.Validate(acceptedAlgorithms, acceptedPolicies, acceptedExtensions);

                this.status = PkiStatus.Granted;
                this.AddStatusString("Operation Okay");

                PkiStatusInfo pkiStatusInfo = GetPkiStatusInfo();

                ContentInfo tstTokenContentInfo;
                try
                {
                    TimeStampToken token = tokenGenerator.Generate(request, serialNumber, genTime.Value);
                    byte[] encoded = token.ToCmsSignedData().GetEncoded();

                    tstTokenContentInfo = ContentInfo.GetInstance(Asn1Object.FromByteArray(encoded));
                }
                catch (IOException e)
                {
                    throw new TspException("Timestamp token received cannot be converted to ContentInfo", e);
                }

                resp = new TimeStampResp(pkiStatusInfo, tstTokenContentInfo);
            }
            catch (TspValidationException e)
            {
                status = PkiStatus.Rejection;

                this.SetFailInfoField(e.FailureCode);
                this.AddStatusString(e.Message);

                PkiStatusInfo pkiStatusInfo = GetPkiStatusInfo();

                resp = new TimeStampResp(pkiStatusInfo, null);
            }

            try
            {
                return new TimeStampResponse(resp);
            }
            catch (IOException e)
            {
                throw new TspException("created badly formatted response!", e);
            }
        }


        public TimeStampResponse GenerateGrantedResponse(
            TimeStampRequest request,
            BigInteger serialNumber,
            DateTimeObject genTime, 
            string statusString, 
            X509Extensions additionalExtensions)
        {
            TimeStampResp resp;

            try
            {
                if (genTime == null)
                    throw new TspValidationException("The time source is not available.",
                        PkiFailureInfo.TimeNotAvailable);

                request.Validate(acceptedAlgorithms, acceptedPolicies, acceptedExtensions);

                this.status = PkiStatus.Granted;
                this.AddStatusString(statusString);

                PkiStatusInfo pkiStatusInfo = GetPkiStatusInfo();

                ContentInfo tstTokenContentInfo;
                try
                {
                    TimeStampToken token = tokenGenerator.Generate(request, serialNumber, genTime.Value,additionalExtensions);
                    byte[] encoded = token.ToCmsSignedData().GetEncoded();

                    tstTokenContentInfo = ContentInfo.GetInstance(Asn1Object.FromByteArray(encoded));
                }
                catch (IOException e)
                {
                    throw new TspException("Timestamp token received cannot be converted to ContentInfo", e);
                }

                resp = new TimeStampResp(pkiStatusInfo, tstTokenContentInfo);
            }
            catch (TspValidationException e)
            {
                status = PkiStatus.Rejection;

                this.SetFailInfoField(e.FailureCode);
                this.AddStatusString(e.Message);

                PkiStatusInfo pkiStatusInfo = GetPkiStatusInfo();

                resp = new TimeStampResp(pkiStatusInfo, null);
            }

            try
            {
                return new TimeStampResponse(resp);
            }
            catch (IOException e)
            {
                throw new TspException("created badly formatted response!", e);
            }
        }
       


        class FailInfo
            : DerBitString
        {
            internal FailInfo(int failInfoValue)
                : base(failInfoValue)
            {
            }
        }

        /**
         * Generate a TimeStampResponse with chosen status and FailInfoField.
         *
         * @param status the PKIStatus to set.
         * @param failInfoField the FailInfoField to set.
         * @param statusString an optional string describing the failure.
         * @return a TimeStampResponse with a failInfoField and optional statusString
         * @throws TSPException in case the response could not be created
         */
        public TimeStampResponse GenerateFailResponse(PkiStatus status, int failInfoField, string statusString)
        {
            this.status = status;

            this.SetFailInfoField(failInfoField);

            if (statusString != null)
            {
                this.AddStatusString(statusString);
            }

            PkiStatusInfo pkiStatusInfo = GetPkiStatusInfo();

            TimeStampResp resp = new TimeStampResp(pkiStatusInfo, null);

            try
            {
                return new TimeStampResponse(resp);
            }
            catch (IOException e)
            {
                throw new TspException("created badly formatted response!", e);
            }
        }
    }
}
