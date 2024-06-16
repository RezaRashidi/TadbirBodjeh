import wretch, {Wretch, WretchError} from "wretch";
import {AuthActions} from "@/app/auth/utils";
import {url} from "@/app/Server"; // Extract necessary functions from the AuthActions utility.
import Cookies from "js-cookie";

const {handleJWTRefresh, storeToken, getToken} = AuthActions();
/**
 * Configures the API with authentication and automatic token refresh on 401 responses.
 */

export const api = () => {
    return (
        wretch(url)
            // Initialize authentication with the access token.
            .auth(`Bearer ${getToken("access")}`)
            // Catch 401 errors to refresh the token and retry the request.
            .catcher(401, async (error: WretchError, request: Wretch) => {
                try {
                    // Attempt to refresh the JWT token.
                    const {access} = (await handleJWTRefresh().json()) as {
                        access: string;
                    };
                    // Store the new access token.
                    storeToken(access, "access");
                    // Replay the original request with the new access token.
                    return request
                        .auth(`Bearer ${access}`)
                        .fetch()

                        .unauthorized(() => {
                            Cookies.set("login", String(0));
                            AuthActions().removeTokens();
                            // Rethrow the error if unauthorized after token refresh.
                            window.location.replace("/Login");
                        })
                        .json(() => {

                            Cookies.set("login", String(1));
                        });
                } catch (err) {
                    Cookies.set("login", String(0));
                    AuthActions().removeTokens();
                    window.location.replace("/Login");
                }
            })
    );
};

/**
 * Fetches data from the specified URL, automatically handling authentication and token refresh.
 * @returns {Promise<any>} The promise resolving to the fetched data.
 * @param url
 */
export const fetcher = (url: string): Promise<any> => {
    return api().get(url).json();
};