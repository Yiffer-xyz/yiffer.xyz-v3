import { RiShieldFill, RiShieldStarFill } from 'react-icons/ri';
import type { User } from '~/types/types';
import { UserType } from '~/types/types';

type UsernameProps = {
  user: User;
  className?: string;
};

const Username = (props: UsernameProps) => {
  const { user, className } = props;
  const { username, userType } = user;

  const Icon =
    userType === UserType.Admin
      ? RiShieldStarFill
      : userType === UserType.Mod
      ? RiShieldFill
      : null;

  return (
    <p className={className}>
      {username}
      {Icon && <Icon className="ml-1 text-theme1-primary" />}
    </p>
  );
};

export default Username;
