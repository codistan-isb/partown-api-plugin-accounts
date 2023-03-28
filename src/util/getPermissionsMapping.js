export default function getPermissionsMapping(input) {
  const permissionMap = {
    manageUsers: {
      read: "reaction:legacy:accounts/view",
      edit: "reaction:legacy:accounts/edit",
      delete: "reaction:legacy:accounts/remove",
    },
    manageProperties: {
      read: "reaction:legacy:products/read",
      edit: "reaction:legacy:products/update",
      delete: "reaction:legacy:products/remove",
    },
    manageReports: {
      read: "reaction:legacy:reports/view",
      edit: "reaction:legacy:reports/edit",
      delete: "reaction:legacy:reports/remove",
    },
    managePermissions: {
      read: "reaction:legacy:groups/view",
      edit: "reaction:legacy:groups/update",
      delete: "reaction:legacy:groups/remove",
    },
    manageRates: {
      read: "reaction:legacy:rates/view",
      edit: "reaction:legacy:rates/edit",
      delete: "reaction:legacy:rates/remove",
    },
    // Add more permissions as needed
  };

  let permissionsArray = [];
  for (const [permission, values] of Object.entries(input)) {
    if (permissionMap[permission]) {
      for (const value of values) {
        permissionsArray.push(permissionMap[permission][value]);
      }
    }
  }

  return permissionsArray;
}
