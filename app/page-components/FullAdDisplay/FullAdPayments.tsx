import { TableCell, TableHeadRow, TableRow, Table } from '~/ui-components/Table';
import Button from '~/ui-components/Buttons/Button';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { useState } from 'react';
import type { AdvertisementFullData } from '~/types/types';
import { format } from 'date-fns';
import { ADVERTISEMENTS } from '~/types/constants';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';

export function FullAdPayments({
  adData,
  showAdminFeatures,
}: {
  adData: AdvertisementFullData;
  showAdminFeatures: boolean;
}) {
  const ad = adData.ad;

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const shouldShowPayments =
    ad && (showAdminFeatures || adData.payments.length > 0 || ad.status === 'ACTIVE');
  const prices = ADVERTISEMENTS.find(a => a.name === ad.adType)?.pricesForMonths;

  const registerPaymentFetcher = useGoodFetcher({
    url: '/api/register-ad-payment',
    method: 'post',
    toastError: true,
    toastSuccessMessage: 'Payment registered',
    onFinish: () => {
      setIsAddingPayment(false);
      setPaymentAmount(0);
    },
  });

  async function onRegisterPayment() {
    const formData = new FormData();
    formData.append('adId', adData.ad.id);
    formData.append('amount', paymentAmount.toString());
    registerPaymentFetcher.submit(formData);
  }

  if (!shouldShowPayments) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3>Payments</h3>
      {adData.payments.length > 0 ? (
        <Table className="mt-2 mb-3">
          <TableHeadRow>
            <TableCell>Registered date</TableCell>
            <TableCell>Amount</TableCell>
          </TableHeadRow>
          {adData.payments.map(payment => (
            <TableRow key={payment.registeredDate.getTime()}>
              <TableCell>{format(payment.registeredDate, 'PPP')}</TableCell>
              <TableCell>${payment.amount}</TableCell>
            </TableRow>
          ))}
        </Table>
      ) : (
        <p>There are no registered payments for this ad.</p>
      )}

      {showAdminFeatures && !isAddingPayment && (
        <Button
          text="Register payment"
          onClick={() => setIsAddingPayment(true)}
          className="mt-2"
        />
      )}

      {isAddingPayment && (
        <div className="mt-2">
          {isAddingPayment && <h4>Register new payment</h4>}

          <TextInput
            value={paymentAmount.toString()}
            onChange={newText => setPaymentAmount(parseInt(newText))}
            className="max-w-[80px] mt-2"
            label="Amount, $"
          />

          {prices && (
            <div className="flex flex-row gap-2 mt-2">
              {Object.entries(prices).map(([months, price]) => (
                <Button
                  key={months}
                  text={`+$${price} (${months}M)`}
                  variant="outlined"
                  onClick={() => setPaymentAmount(prev => prev + price)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-row gap-2 mt-4">
            <Button
              text="Cancel"
              onClick={() => {
                setIsAddingPayment(false);
                setPaymentAmount(0);
              }}
              variant="outlined"
            />
            <LoadingButton
              text="Register payment"
              onClick={onRegisterPayment}
              isLoading={registerPaymentFetcher.isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
