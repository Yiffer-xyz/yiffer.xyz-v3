import { Outlet, useNavigate, useParams } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import type { AdType, AdStatus, Advertisement } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function Advertising() {
  const navigate = useNavigate();
  const { ad: selectedAdParam } = useParams();

  const [searchText, setSearchText] = useState('');
  const [selectedAd, setSelectedAd] = useState<Advertisement>();
  const [statusFilter, setStatusFilter] = useState<AdStatus[]>(['PENDING', 'ACTIVE']);
  const [adTypeFilter, setAdTypeFilter] = useState<AdType[]>([
    'banner',
    'card',
    'topSmall',
  ]);

  const { submit, data: ads } = useGoodFetcher<Advertisement[]>({
    url: '/api/admin/get-ads',
    method: 'post',
  });

  const filteredAds = useMemo(() => {
    if (!ads) return [];
    return ads.filter(ad => {
      if (searchText) {
        const searchTextLower = searchText.toLowerCase();
        return (
          ad.id.toLowerCase().includes(searchTextLower) ||
          ad.user.username.toLowerCase().includes(searchTextLower) ||
          ad.user.email.toLowerCase().includes(searchTextLower)
        );
      }

      return true;
    });
  }, [ads, searchText]);

  // Fetching!
  useEffect(() => {
    submit({ statusFilter, adTypeFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, adTypeFilter]);

  // Update url on selected ad change
  useEffect(() => {
    if (!selectedAd) return;
    navigate(`/admin/advertising/${selectedAd.id}`);
  }, [selectedAd, navigate]);

  // If the advertising/ad route presses back, this triggers - clear the ad selection.
  useEffect(() => {
    if (!selectedAdParam) setSelectedAd(undefined);
  }, [selectedAdParam]);

  return (
    <>
      {!selectedAd && !selectedAdParam && (
        <>
          <h1>Advertising</h1>

          <p className="font-bold my-4">ℹ️ See the figma prototype.</p>

          <TextInput
            value={searchText}
            onChange={setSearchText}
            name="search"
            label="Search ad id, username, or email"
          />

          {filteredAds?.map(ad => (
            <div key={ad.id} className="my-4">
              <Button text="Select ad 👇" onClick={() => setSelectedAd(ad)} />
              <pre>{JSON.stringify(ad, null, 2)}</pre>
            </div>
          ))}
        </>
      )}

      <Outlet />
    </>
  );
}
