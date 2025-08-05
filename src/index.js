  import { handleRequest } from "./handle_request.js";

  export default {
    async fetch (req, env, context) {
      const url = new URL(req.url);
      console.log('Request URL:', req.url); 
      return handleRequest(req);
    }
  }