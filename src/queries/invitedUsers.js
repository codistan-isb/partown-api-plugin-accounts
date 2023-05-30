/**
 * @name accounts
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns accounts optionally filtered by group IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} [input.groupIds] - Array of group IDs to limit the results
 * @param {String} [input.notInAnyGroups] - Return accounts that aren't part of any groups
 * @returns {Promise} Mongo cursor
 */

export default async function invitedUsers(context, searchQuery) {
  const { collections } = context;
  const { InvitedUsers } = collections;
  // const { groupIds, notInAnyGroups, searchQuery, filter } = input;
  let selector = {};
  if (searchQuery) {
    selector.$or = [
      {
        email: {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
    ];
  }

  await context.validatePermissions("reaction:legacy:accounts", "read");

  return InvitedUsers.find(selector);
}
