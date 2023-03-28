export default async function checkUserPermissionsGroup(context, userId) {
  const { Accounts } = context.collections;
  let { groups } = await Accounts.findOne({ userId });
  return groups?.length > 0;
}
