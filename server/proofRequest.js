const { KYCAgeCredential, VodicskyPreukaz } = require("./vcHelpers/KYCAgeCredential");

// design your own customised authentication requirement here using Query Language
// https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/


/*
const humanReadableAuthReason = "Must be born before this year";

const credentialSubject = {
  birthday: {
    // users must be born before this year
    // birthday is less than Jan 1, 2023
    $gt: 20230101,
  },
};

*/

const humanReadableAuthReason = "Must have valid vodicsky preukaz";

const credentialSubject = {
  "valid": {
    "$eq": true
  }
};
const proofRequest = VodicskyPreukaz(credentialSubject);

module.exports = {
  humanReadableAuthReason,
  proofRequest,
};
