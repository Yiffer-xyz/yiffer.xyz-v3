import pluralize from 'pluralize';
import type { HTMLAttributes } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { ADVERTISEMENTS } from '~/types/constants';
import type { AdType } from '~/types/types';
import Link from '~/ui-components/Link';
import ShowHideBox from '~/ui-components/ShowHideBox/ShowHideBox';

export default function AdPaymentInstructions({
  adType,
  className,
}: {
  adType?: AdType;
  className?: HTMLAttributes<HTMLDivElement>['className'];
}) {
  const adInfo = adType ? ADVERTISEMENTS.find(ad => ad.name === adType) : null;
  const prices = adInfo?.pricesForMonths;

  return (
    <ShowHideBox
      showButtonText={`Show${prices ? '' : ' general'} payment instructions`}
      hideButtonText="Hide payment instructions"
      className={className}
    >
      <div className="mt-2">
        <p>
          Payments are made through Paypal, to <b>advertising@yiffer.xyz</b> (
          <Link
            href="https://www.paypal.com/paypalme/yifferadvertising"
            isInsideParagraph
            newTab
            IconRight={FaExternalLinkAlt}
            className="font-normal"
            text="paypal.me/yifferadvertising"
          />
          ).
        </p>
        <p>
          <b>Include your ad ID</b> in the Paypal description.
        </p>

        <p className="mt-4">
          You can pay for 1, 4, or 12 months at a time
          {prices ? ' according to the prices below' : ''}.
        </p>

        {prices && (
          <>
            <p className="mt-4">This ad's prices:</p>
            <ul>
              {Object.entries(prices).map(([months, price]) => (
                <li key={months}>
                  {pluralize('month', parseInt(months), true)}: <b>${price}</b>
                  {months !== '1' && (
                    <span className="text-sm">
                      {' '}
                      (${price / parseInt(months)} per month)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-4">
          It typically takes up to 2 days for your payment to be processed.
        </p>
        <p>
          You can pay for multiple ads at once in a single Paypal transaction, as long as
          you include all ad IDs in the Paypal description.
        </p>

        {!prices && (
          <p className="text-sm mt-4">
            These instructions can be found on your individual ads with specific prices
            later.
          </p>
        )}

        <p className="mt-4 text-sm">
          In the future, we aim to transform the payment process to be fully automated via
          credit card.
        </p>
      </div>
    </ShowHideBox>
  );
}
