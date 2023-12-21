export default async function checkUserPermissionsGroup(context, userId) {
  const { Accounts, Groups } = context.collections;
  let accountGroup = await Accounts.findOne({ userId });
  const groups = accountGroup?.groups;

  if (!groups || groups?.length === 0) {
    return {
      check1: false,
      check2: false,
    };
  }

  let group1 = await Groups.findOne({ _id: groups[0] });
  let group2 = await Groups.findOne({ _id: groups[1] });

  let check1 = false;
  let check2 = false;

  if (group1?.name.startsWith("product-")) {
    check1 = true;
  }
  if (group2?.name.startsWith("users-")) {
    check2 = true;
  }

  return {
    check1,
    check2,
  };
}
