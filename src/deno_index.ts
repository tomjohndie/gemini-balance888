import { handleRequest } from "./handle_request.js";

async function denoHandleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  console.log('Request URL:', req.url);
  return handleRequest(req);
};

Deno.serve({ port: 80 },denoHandleRequest); 