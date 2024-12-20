import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Outlet, useLoaderData, useNavigate, useParams } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import {
  type AdType,
  type AdStatus,
  type Advertisement,
  type AdvertisementPoorlyTyped,
  allAdStatuses,
  advertisementTypeMapper,
} from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import Select from '~/ui-components/Select/Select';
import TextInput from '~/ui-components/TextInput/TextInput';
import { capitalizeFirstRestLower } from '~/utils/general';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import AdListCard from '../../ui-components/Advertising/AdListCard';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: `Mod: Ads | Yiffer.xyz` }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  return { adsPath: context.cloudflare.env.ADS_PATH };
}

export default function Advertising() {
  const { adsPath } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { ad: selectedAdParam } = useParams();

  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedAd, setSelectedAd] = useState<Advertisement>();
  const [sort, setSort] = useState('age');
  const [statusFilter, setStatusFilter] = useState<AdStatus[]>(['PENDING', 'ACTIVE']);
  const [adTypeFilter, setAdTypeFilter] = useState<AdType[]>([
    'banner',
    'card',
    'topSmall',
  ]);

  const { submit, data: ads } = useGoodFetcher<AdvertisementPoorlyTyped[]>({
    url: '/api/admin/get-ads',
    method: 'post',
  });

  const filteredAds = useMemo<Advertisement[]>(() => {
    if (!ads) return [];

    const filtered = ads
      .filter(ad => {
        if (searchText) {
          const searchTextLower = searchText.toLowerCase();
          const match =
            ad.id.toLowerCase().includes(searchTextLower) ||
            ad.user.username.toLowerCase().includes(searchTextLower) ||
            ad.user.email.toLowerCase().includes(searchTextLower);
          if (!match) return false;
        }

        if (!statusFilter.includes(ad.status)) return false;
        if (!adTypeFilter.includes(ad.adType)) return false;

        return true;
      })
      .map(ad => advertisementTypeMapper(ad));

    return filtered.sort((a, b) => {
      if (sort === 'age') return b.createdDate.getTime() - a.createdDate.getTime();
      if (sort === 'total-clicks') return b.clicks - a.clicks;
      if (sort === 'clicks-per-day') return b.clicksPerDayActive - a.clicksPerDayActive;
      if (sort === 'click-rate') return b.clickRateSrv - a.clickRateSrv;
      if (sort === 'active-days') return b.numDaysActive - a.numDaysActive;
      if (sort === 'owner') return a.user.username.localeCompare(b.user.username);
      return 0;
    });
  }, [adTypeFilter, ads, searchText, sort, statusFilter]);

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

          <Button
            className="mt-2"
            onClick={() => setShowFilters(!showFilters)}
            text={showFilters ? 'Hide filters' : 'Show more filters'}
            variant="outlined"
          />

          {showFilters && (
            <>
              <p className="mt-4 mb-1 font-semibold">Status</p>
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
                {allAdStatuses.map(status => (
                  <Checkbox
                    key={status}
                    label={capitalizeFirstRestLower(status)}
                    checked={statusFilter.includes(status)}
                    onChange={() => {
                      if (statusFilter.includes(status)) {
                        setStatusFilter(statusFilter.filter(s => s !== status));
                      } else {
                        setStatusFilter([...statusFilter, status]);
                      }
                    }}
                  />
                ))}
              </div>

              <p className="mt-6 mb-1 font-semibold">Ad type</p>
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
                {['banner', 'card', 'topSmall'].map(type => (
                  <Checkbox
                    key={type}
                    label={capitalizeFirstRestLower(type)}
                    checked={adTypeFilter.includes(type as AdType)}
                    onChange={() => {
                      if (adTypeFilter.includes(type as AdType)) {
                        setAdTypeFilter(adTypeFilter.filter(s => s !== type));
                      } else {
                        setAdTypeFilter([...adTypeFilter, type as AdType]);
                      }
                    }}
                  />
                ))}
              </div>

              <p className="mt-6 font-semibold">Sort</p>
              <Select
                options={[
                  { text: 'Age', value: 'age' },
                  { text: 'Clicks per day', value: 'clicks-per-day' },
                  { text: 'Click rate', value: 'click-rate' },
                  { text: 'Total clicks', value: 'total-clicks' },
                  { text: 'Active days', value: 'active-days' },
                  { text: 'Owner', value: 'owner' },
                ]}
                name="sort"
                value={sort}
                onChange={setSort}
              />
            </>
          )}

          <p className={`mb-1 font-semibold ${showFilters ? 'mt-6' : 'mt-4'}`}>Search</p>
          <TextInput
            value={searchText}
            onChange={setSearchText}
            name="search"
            label="Id, username, or email"
            className="max-w-xs"
          />

          <p className="mt-4 text-sm text-gray-strong-100 font-semibold">
            {filteredAds.length} ads
          </p>

          <div className="flex flex-col gap-2 w-fit max-w-full mt-2">
            {filteredAds?.map(ad => (
              <AdListCard
                ad={ad}
                adMediaPath={adsPath}
                frontendAdsPath="/admin/advertising"
                showFullAdminData
                key={ad.id}
              />
            ))}
          </div>
        </>
      )}

      <Outlet />
    </>
  );
}
