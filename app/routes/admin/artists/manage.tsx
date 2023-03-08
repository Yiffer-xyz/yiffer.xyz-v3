import { useOutletContext } from '@remix-run/react';
import { GlobalAdminContext } from '~/routes/admin';

export default function ManageArtists({}) {
  const globalContext: GlobalAdminContext = useOutletContext();

  return (
    <>
      <h1>Manage artists</h1>
    </>
  );
}
