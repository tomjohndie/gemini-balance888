import { handleRequest } from "../../src/handle_request.js";

export default async (req, context) => {
  return handleRequest(req);
};
