function makeDefaultQueryRes() {
  let returns = [];
  for (let i = 0; i < 30; i++) {
    returns.push({
      username: 'user ' + i,
      points: 2000 - i * 10,
      isMod: Math.random() > 0.5, // not used for anything.. but maybe it will? idk
    });
  }
  return returns;
}

function makeYearQueryRes() {
  let returns = [];
  for (let i = 0; i < 30; i++) {
    returns.push({
      username: 'Yearly User ' + i,
      points: 5000 - i * 10,
      isMod: Math.random() > 0.5, // not used for anything.. but maybe it will? idk
    });
  }
  return returns;
}

const defaultquery = makeDefaultQueryRes(); // list of users and points
const yearquery = makeYearQueryRes(); // list of users and points

export { defaultquery, yearquery };
