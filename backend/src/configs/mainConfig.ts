export const ENDPOINTS_LIST = [
  "POST api/v1/auth/login",
  "POST api/v1/auth/register",
  "GET api/v1/auth/password/request-reset?email=<email>",
  "POST api/v1/auth/password/verify-reset",
  "POST api/v1/auth/password/reset",
  "GET api/v1/facilities",
  "POST api/v1/facilities",
  "GET/PATCH/DELETE api/v1/facilities/:facilityId",
  "GET/POST api/v1/facilities/:facilityId/resources",
  "PATCH/DELETE api/v1/facilities/:facilityId/resources/:resourceId",
  "POST api/v1/facilities/:facilityId/staff",
  "GET/PATCH api/v1/facilities/me",
  "GET/POST api/v1/facilities/me/resources",
  "PATCH/DELETE api/v1/facilities/me/resources/:resourceId",
  "POST api/v1/auth/setup"
]