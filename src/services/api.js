import { env } from "../config/env.js";
import { createApiClient } from "./createApiClient.js";

export const apiFetch = createApiClient(env);
