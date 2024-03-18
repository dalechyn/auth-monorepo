import { AuthClientError, type CompletedStatusAPIResponse } from "@farcaster/auth-client";
import { type Config } from "../types/config.js";
import { type Omit } from "../types/utils.js";
import { type PollStatusTillSuccessParameters } from "./pollStatusTillSuccess.js";

export type SignInErrorType = AuthClientError;

export type SignInParameters = Omit<PollStatusTillSuccessParameters, "channelToken"> & {
  channelToken: string;
};

export type SignInReturnType = CompletedStatusAPIResponse & { isAuthenticated: boolean };

const defaults = {
  timeout: 300_000,
  interval: 1_500,
};

export async function signIn(config: Config, parameters: SignInParameters): Promise<SignInReturnType> {
  if (!config.domain) throw new Error("domain is not defined");
  const { data: pollStatusTillSuccessResponse } = await config.appClient.pollStatusTillSuccess({
    channelToken: parameters?.channelToken,
    timeout: parameters?.timeout ?? defaults.timeout,
    interval: parameters?.interval ?? defaults.interval,
  });

  const { success: isAuthenticated } = await config.appClient.verifySignInMessage({
    nonce: pollStatusTillSuccessResponse.nonce,
    domain: config.domain,
    message: pollStatusTillSuccessResponse.message,
    signature: pollStatusTillSuccessResponse.signature,
  });

  return { isAuthenticated, ...pollStatusTillSuccessResponse };
}
