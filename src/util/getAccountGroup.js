/**
 * @summary Return an account, given a user ID
 * @param {Object} context App context
 * @param {String} userId User ID
 * @return {Promise<Object|null>} Account
 */
export default async function getAccountGroup(context, userId) {
  const { Accounts } = context.collections;
  let result = await Accounts.findOne({
    _id: userId,
  });

  return result?.groups;
}
