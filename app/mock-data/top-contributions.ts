import { UserType } from '~/types/types';

const ceilToNearest = (m: number, n: number) => Math.ceil(n / m) * m;
const generateUser = (i: number) => ({
  username: i === 0 ? 'Melon' : 'Monthly User ' + i,
  userType:
    i === 0 || Math.random() > 0.999
      ? UserType.Admin
      : Math.random() > 0.98
      ? UserType.Mod
      : UserType.User,
  email: 'user' + i + '@example.com',
  id: i,
});

function makeDefaultQueryRes(month: number, year: number) {
  const random = Math.random() * 1000;
  return Array(30)
    .fill(0)
    .map((_, i) => ({
      user: generateUser(i),
      points: ceilToNearest(5, Math.floor((year - random) / (i + 1))),
    }));
}

const allTimeRandom = Math.random() * 10000;
function makeAllTimeQueryRes() {
  return Array(30)
    .fill(0)
    .map((_, i) => ({
      user: generateUser(i),
      points: ceilToNearest(5, Math.floor((60000 - allTimeRandom) / (i + 1))),
    }));
}

const defaultquery = makeDefaultQueryRes; // list of users and points
const alltimequery = makeAllTimeQueryRes; // list of users and points

export { defaultquery, alltimequery };
