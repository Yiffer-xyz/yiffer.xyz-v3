import { useEffect, useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { FaPatreon } from 'react-icons/fa';
import { RiShieldFill, RiShieldStarFill } from 'react-icons/ri';
import countryList from 'react-select-country-list';
import type { PublicUser, UserType } from '~/types/types';

export default function PublicProfileBadges({ user }: { user: PublicUser }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isMod = user.userType === 'moderator';
  const isAdmin = user.userType === 'admin';

  const Icon = isAdmin ? RiShieldStarFill : isMod ? RiShieldFill : null;

  const countryName = useMemo(() => {
    if (!user.nationality) return null;
    return countryList()
      .getData()
      .find(c => c.value === user.nationality)?.label;
  }, [user.nationality]);

  return (
    <>
      {Icon && (
        <div className="flex flex-row gap-1 items-center">
          <Icon className="text-theme1-primary mt-0.5" />{' '}
          <p className="text-nowrap">{modTypeToText(user.userType)}</p>
        </div>
      )}
      {user.patreonDollars && (
        <div className="flex flex-row gap-1 items-center">
          <FaPatreon className="text-patreon-primary mt-0.5" />{' '}
          <p className="text-nowrap">
            <span className="hidden sm:inline">Patron (</span>${user.patreonDollars}
            <span className="hidden sm:inline">)</span>
          </p>
        </div>
      )}
      {user.nationality && (
        <div className="flex flex-row gap-1 items-center">
          {isClient ? (
            <ReactCountryFlag countryCode={user.nationality} />
          ) : (
            <div className="w-3.5 sm:w-4" />
          )}
          <p className="text-nowrap">{countryName}</p>
        </div>
      )}
    </>
  );
}

function modTypeToText(type: UserType) {
  if (type === 'admin') return 'Admin';
  if (type === 'moderator') return 'Mod';
  return '';
}
