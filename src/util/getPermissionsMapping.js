export default function getPermissionsMapping(input) {
  const permissionMap = {
    manageUsers: {
      read: "reaction:legacy:accounts/read",
      edit: "reaction:legacy:accounts/create",
      delete: "reaction:legacy:accounts/remove",
    },
    manageProperties: {
      read: "reaction:legacy:products/read",
      edit: "reaction:legacy:products/create",
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
    manageFunds: {
      read: "reaction:legacy:funds/view",
      edit: "reaction:legacy:funds/edit",
      delete: "reaction:legacy:funds/remove",
    },
  };

  let permissionsArray = [];
  let additionalPermissionsArray = [];

  for (const [permission, values] of Object.entries(input)) {
    if (permissionMap[permission]) {
      for (const value of values) {
        if (permission === "manageUsers") {
          additionalPermissionsArray.push(permissionMap[permission][value]);
        } else {
          permissionsArray.push(permissionMap[permission][value]);
        }
      }
    }
  }

  return { permissionsArray, additionalPermissionsArray };
}
