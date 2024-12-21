import AdStatusText from '~/ui-components/Advertising/AdStatusText';
import { MdArrowForward } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import AdPaymentInstructions from '../advertising_.dashboard_.$adId/AdPaymentInstructions';

export default function Step1Info({ onNext }: { onNext: () => void }) {
  return (
    <>
      <p className="font-semibold text-lg mb-2">Step 1: Information</p>

      <div className="flex flex-col gap-2">
        <p className="font-bold -mb-2">General info</p>
        <p>
          If you haven't already, make sure to read the general info at the bottom of the
          previous page.
        </p>

        <AdPaymentInstructions className="mt-1" />

        <p className="font-bold mt-2 -mb-2">Free trial</p>
        <p>
          If this is your first ad, and your are a furry or furry-related content creator,
          you can request a one-month free trial. Note that we only offer this to{' '}
          <i>creators</i>, and that we require a certain level of professionalism/quality
          in your ad.
        </p>

        <p className="font-bold mt-2 -mb-2">Dimensions and cropping</p>
        <p>
          You can crop <b>images</b> to the correct size in the application form. For{' '}
          <b>videos/gifs</b>, you'll need to ensure they're the correct size before
          uploading.
        </p>

        <p className="font-bold mt-2 -mb-1">Process</p>
        <p>
          <b>1:</b> Submit your ad with its media and information for review in the next
          step. Your ad will get the <AdStatusText status="PENDING" /> status.
        </p>
        <p>
          <b>2:</b> Our admin team will review your ad. This is to ensure that it matches
          our quality and content standards.
        </p>
        <p>
          <b>3:</b> If your ad is accepted, it will receive the{' '}
          <AdStatusText status="AWAITING PAYMENT" /> status, and you will receive an email
          notification. Payment happens via Paypal at this point.
        </p>
        <p>
          <b>4:</b> Once payment is registered, your ad will receive the{' '}
          <AdStatusText status="ACTIVE" /> status. You can make changes to your ad while
          it is active.
        </p>
        <p>
          <b>5:</b> You can pay again at any point before your ad expires, for either 1,
          4, or 12 months. We will extend the ad's expiry date accordingly.
        </p>
        <p>
          <b>6:</b> You can reactivate expired ads at any time from the advertising
          dashboard.
        </p>

        <p className="mt-4 -mb-2">
          <i>If your ad is not approved in step 2:</i>
        </p>
        <p>
          You will receive an email notification stating what needs to be fixed, and your
          ad will get the <AdStatusText status="NEEDS CORRECTION" /> status. You can then
          go to your advertising dashboard and update your ad, and re-submit it for
          review. It will once again get the <AdStatusText status="PENDING" /> status and
          follow the normal flow from step 2 above.
        </p>
      </div>

      <Button
        text="Next: Ad & media type"
        endIcon={MdArrowForward}
        className="mt-8 self-end"
        onClick={onNext}
        disableElevation
      />
    </>
  );
}
