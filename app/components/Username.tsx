import { RiShieldFill, RiShieldStarFill } from 'react-icons/ri';
import type { User } from '~/types/types';
import { UserType } from '~/types/types';

type UsernameProps = {
  user: User;
  className?: string;
};

const Username = ({ user, className }: UsernameProps) => {
  const { username, userType } = user;

  const isMod = userType === UserType.Mod;
  const isAdmin = userType === UserType.Admin;

  const title = isMod ? 'Moderator' : isAdmin ? 'Admin' : '';
  const Icon = isAdmin ? RiShieldStarFill : isMod ? RiShieldFill : null;

  return (
    <p title={title} className={className}>
      {username}
      {Icon && <Icon className="ml-1 text-theme1-primary" />}
    </p>
  );
};

export default Username;
