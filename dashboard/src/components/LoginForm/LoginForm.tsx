import { CdsIcon } from "@cds/react/icon";
import { Location } from "history";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Redirect } from "react-router";
import LoadingWrapper from "../../components/LoadingWrapper";
import "./LoginForm.css";
import OAuthLogin from "./OauthLogin";
import TokenLogin from "./TokenLogin";

export interface ILoginFormProps {
  cluster: string;
  authenticated: boolean;
  authenticating: boolean;
  authenticationError: string | undefined;
  oauthLoginURI: string;
  authProxySkipLoginPage: boolean;
  authenticate: (cluster: string, token: string) => any;
  checkCookieAuthentication: (cluster: string) => Promise<boolean>;
  appVersion: string;
  location: Location;
}

function LoginForm(props: ILoginFormProps) {
  const intl = useIntl();
  const [token, setToken] = useState("");
  const [cookieChecked, setCookieChecked] = useState(false);
  const { oauthLoginURI, checkCookieAuthentication } = props;
  useEffect(() => {
    if (oauthLoginURI) {
      checkCookieAuthentication(props.cluster).then(() => setCookieChecked(true));
    } else {
      setCookieChecked(true);
    }
  }, [oauthLoginURI, checkCookieAuthentication, props.cluster]);

  if (props.authenticating || !cookieChecked) {
    return (
      <LoadingWrapper
        className="margin-t-xxl"
        loadingText={<h2>Welcome To Kubeapps</h2>}
        loaded={false}
      />
    );
  }
  if (props.authenticated) {
    const { from } = (props.location.state as any) || { from: { pathname: "/" } };
    return <Redirect to={from} />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return token && (await props.authenticate(props.cluster, token));
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  if (props.oauthLoginURI && props.authProxySkipLoginPage) {
    // If the oauth login page should be skipped, simply redirect to the login URI.
    window.location.replace(props.oauthLoginURI);
  }

  return (
    <div className="login-wrapper">
      <form className="login clr-form" onSubmit={handleSubmit}>
        {props.oauthLoginURI ? (
          <OAuthLogin
            authenticationError={props.authenticationError}
            oauthLoginURI={props.oauthLoginURI}
          />
        ) : (
          <TokenLogin
            authenticationError={props.authenticationError}
            token={token}
            handleTokenChange={handleTokenChange}
          />
        )}
        <div className="login-moreinfo">
          <a
            href={`https://github.com/kubeapps/kubeapps/blob/${props.appVersion}/docs/user/access-control.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CdsIcon shape="info-circle" />
            {intl.formatMessage({ id: "more-info", defaultMessage: "More Info" })}
          </a>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
