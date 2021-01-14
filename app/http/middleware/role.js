"use strict";
var compose = require("composable-middleware");
//Super Admin
// function checkAdmin() {
//     return (
//         compose()
//         // Attach user to request
//         .use(async function(req, res, next) {
//             const role = await userroleData.findOne({ userId: req.user._id });
//             if (role == null) {
//                 var err = {
//                     success: false,
//                     msg: "ACCESS DENIED!",
//                 };
//                 res.status(401).send(err);
//                 return;
//             }

//             if (role.role[0] !== "2") {
//                 var err = {
//                     success: false,
//                     msg: "Access Denied!",
//                 };
//                 res.status(401).send(err);
//                 return false;
//             }
//             req.role = role.role[0];
//             next();
//         })
//     );
// };

// exports.checkAdmin = checkAdmin;