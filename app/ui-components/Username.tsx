import { RiShieldFill, RiShieldStarFill } from 'react-icons/ri';
import type { SimpleUser } from '~/types/types';

type UsernameProps = {
  user: Omit<SimpleUser, 'email'>;
  className?: string;
};

const Username = ({ user, className }: UsernameProps) => {
  const { username, userType } = user;

  const isMod = userType === 'moderator';
  const isAdmin = userType === 'admin';

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
