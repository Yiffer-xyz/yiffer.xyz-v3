"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  onRequest: () => onRequest
});
module.exports = __toCommonJS(server_exports);
var import_cloudflare_pages = require("@remix-run/cloudflare-pages");

// server-entry-module:@remix-run/dev/server-build
var server_build_exports = {};
__export(server_build_exports, {
  assets: () => assets_manifest_default,
  assetsBuildDirectory: () => assetsBuildDirectory,
  entry: () => entry,
  future: () => future,
  mode: () => mode,
  publicPath: () => publicPath,
  routes: () => routes
});

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
var import_react = require("@remix-run/react"), import_server = require("react-dom/server"), import_jsx_dev_runtime = require("react/jsx-dev-runtime");
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  let markup = (0, import_server.renderToString)(/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react.RemixServer, { context: remixContext, url: request.url }, void 0, !1, {
    fileName: "app/entry.server.tsx",
    lineNumber: 11,
    columnNumber: 31
  }, this));
  return responseHeaders.set("Content-Type", "text/html"), new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  App: () => App,
  default: () => AppWithProviders,
  links: () => links,
  loader: () => loader,
  meta: () => meta
});
var import_react7 = require("@remix-run/react"), import_clsx = __toESM(require("clsx"));

// app/styles/app.css
var app_default = "/build/_assets/app-ESYPPB2M.css";

// app/styles/main.css
var main_default = "/build/_assets/main-G3XKJLFZ.css";

// app/utils/auth.server.ts
var import_cloudflare2 = require("@remix-run/cloudflare"), import_cloudflare_worker_jwt = __toESM(require("@tsndr/cloudflare-worker-jwt"));

// app/utils/database-facade.ts
async function queryDbMultiple(urlBase, queries) {
  let response = await fetch(`${urlBase}/new-api/query-db-multiple`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(queries)
  });
  return response.ok ? await response.json() : {
    isError: !0,
    errorMessage: "Error connecting to server"
  };
}
async function queryDb(urlBase, query, params = []) {
  let response = await fetch(`${urlBase}/new-api/query-db`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      params
    })
  });
  return response.ok ? await response.json() : {
    isError: !0,
    errorMessage: "Error connecting to server"
  };
}

// app/utils/request-helpers.ts
var import_cloudflare = require("@remix-run/cloudflare");

// app/routes/error.tsx
var error_exports = {};
__export(error_exports, {
  ErrorBoundary: () => ErrorBoundary,
  HANDLED_ERR_MSG: () => HANDLED_ERR_MSG
});

// app/components/InfoBox.tsx
var import_react2 = require("react"), import_md = require("react-icons/md"), import_jsx_dev_runtime2 = require("react/jsx-dev-runtime");
function InfoBox({
  variant = "info",
  title,
  text,
  showIcon = !1,
  closable = !1,
  boldText = !0,
  centerText = !1,
  disableElevation = !1,
  children,
  className = "",
  ...props
}) {
  let [hidden, setHidden] = (0, import_react2.useState)(!1), variantClassname = "", Icon = null;
  switch (variant) {
    case "info":
      variantClassname = "from-status-info1 to-status-info2 ", Icon = import_md.MdInfo;
      break;
    case "error":
      variantClassname = "from-red-strong-300 to-status-error2 ", Icon = import_md.MdError;
      break;
    case "success":
      variantClassname = "from-theme1-darker to-theme2-darker ", Icon = import_md.MdCheckCircle;
      break;
    case "warning":
      variantClassname = "from-status-warn1 to-status-warn2 ", Icon = import_md.MdWarning;
      break;
  }
  let fullClassname = `px-6 py-4 flex flex-row justify-between items-center gap-2
    rounded ${disableElevation ? "" : "shadow-md"} bg-gradient-to-r 
    text-white ${variantClassname} ${className}`;
  return boldText && (fullClassname += " font-semibold"), hidden && (fullClassname += " hidden"), /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: fullClassname, ...props, children: [
    showIcon && /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Icon, { size: 36, className: "-ml-2 flex-shrink-0 w-8 md:w-auto" }, void 0, !1, {
      fileName: "app/components/InfoBox.tsx",
      lineNumber: 69,
      columnNumber: 20
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: `${centerText ? "text-center" : ""} flex flex-col flex-grow`, children: [
      title ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "text-xl", children: title }, void 0, !1, {
        fileName: "app/components/InfoBox.tsx",
        lineNumber: 71,
        columnNumber: 18
      }, this) : void 0,
      text ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { children: text }, void 0, !1, {
        fileName: "app/components/InfoBox.tsx",
        lineNumber: 72,
        columnNumber: 17
      }, this) : void 0,
      children
    ] }, void 0, !0, {
      fileName: "app/components/InfoBox.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this),
    closable && /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(
      import_md.MdCancel,
      {
        size: 24,
        className: "cursor-pointer flex-shrink-0 w-5 md:w-auto",
        onClick: () => setHidden(!0)
      },
      void 0,
      !1,
      {
        fileName: "app/components/InfoBox.tsx",
        lineNumber: 76,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/InfoBox.tsx",
    lineNumber: 68,
    columnNumber: 5
  }, this);
}

// app/routes/error.tsx
var import_react3 = require("react");
var import_react4 = require("@remix-run/react"), import_jsx_dev_runtime3 = require("react/jsx-dev-runtime"), HANDLED_ERR_MSG = "HANDLED server error";
function ErrorBoundary() {
  let error = (0, import_react4.useRouteError)();
  return (0, import_react4.isRouteErrorResponse)(error) ? /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(CatchBoundary, { status: error.data }, void 0, !1, {
    fileName: "app/routes/error.tsx",
    lineNumber: 12,
    columnNumber: 5
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(ErrorBoundaryInner, { error }, void 0, !1, {
    fileName: "app/routes/error.tsx",
    lineNumber: 14,
    columnNumber: 5
  }, this);
}
function CatchBoundary({ status }) {
  return status === 404 ? /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("h1", { children: "Not found" }, void 0, !1, {
      fileName: "app/routes/error.tsx",
      lineNumber: 22,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("pre", { children: "404 - could not find the resource you were looking for!" }, void 0, !1, {
      fileName: "app/routes/error.tsx",
      lineNumber: 23,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/error.tsx",
    lineNumber: 21,
    columnNumber: 7
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("h1", { children: status }, void 0, !1, {
      fileName: "app/routes/error.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("pre", { children: "Something went wrong!" }, void 0, !1, {
      fileName: "app/routes/error.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/error.tsx",
    lineNumber: 29,
    columnNumber: 5
  }, this);
}
function ErrorBoundaryInner({ error }) {
  return (0, import_react3.useEffect)(() => {
    error && error.message !== HANDLED_ERR_MSG && logErrorBoundaryException(error);
  }, [error]), /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { role: "alert", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(InfoBox, { variant: "error", showIcon: !0, disableElevation: !0, className: "mx-auto w-fit", children: "Something went wrong in this beloved admin panel of ours :(" }, void 0, !1, {
      fileName: "app/routes/error.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    ["clientMessage", "message", "errorCode"].map((errField) => {
      if (error[errField])
        return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("p", { className: "mt-4 p-4 bg-theme1-primaryTrans max-w-xl mx-auto", children: error[errField] }, void 0, !1, {
          fileName: "app/routes/error.tsx",
          lineNumber: 56,
          columnNumber: 13
        }, this);
    })
  ] }, void 0, !0, {
    fileName: "app/routes/error.tsx",
    lineNumber: 48,
    columnNumber: 5
  }, this);
}

// app/utils/request-helpers.ts
var Sentry = __toESM(require("@sentry/browser"));
async function processApiError(prependMessage, err, context) {
  throw logApiError(prependMessage, {
    ...err,
    context: {
      ...err.context || {},
      ...context || {}
    }
  }), new Error(HANDLED_ERR_MSG);
}
function logApiError(prependMessage, err, context) {
  let fullErrMsg = prependMessage ? prependMessage + " >> " + err.logMessage : err.logMessage;
  console.log("ERROR, message: ", fullErrMsg), console.log(err);
  let extra = {
    ...err.context || {},
    ...context || {}
  };
  err.error && (extra.dbResponse = err.error), Sentry.captureMessage(fullErrMsg, {
    extra,
    level: "error"
  });
}
function logApiErrorMessage(message, context) {
  Sentry.captureMessage(message, {
    extra: {
      ...context || {}
    },
    level: "error"
  });
}
function makeDbErr(err, message, context) {
  return {
    error: err,
    logMessage: message,
    context: context || {}
  };
}
function makeDbErrObj(err, message, context) {
  return {
    err: {
      error: err,
      logMessage: message,
      context: context || {}
    }
  };
}
function logErrorBoundaryException(err) {
  console.log("Error boundary captured and logging exception!"), console.log(err), Sentry.captureException(err, {
    tags: {
      errorBoundary: "true"
    }
  });
}
function wrapApiError(err, message, additionalContext) {
  let newErr = {
    ...err,
    logMessage: message + " >> " + err.logMessage
  };
  return additionalContext && (newErr.context = {
    ...err.context || {},
    ...additionalContext
  }), newErr;
}
function create500Json(message) {
  return (0, import_cloudflare.json)(
    {
      error: message || "Server error. Site admins have been notified of and will look into it.",
      success: !1
    },
    { status: 500 }
  );
}
function create400Json(message) {
  return (0, import_cloudflare.json)(
    {
      error: message,
      success: !1
    },
    { status: 400 }
  );
}
function createAnyErrorCodeJson(code, message) {
  return (0, import_cloudflare.json)(
    {
      error: message,
      success: !1
    },
    { status: code }
  );
}
function createSuccessJson(data) {
  return (0, import_cloudflare.json)(
    {
      success: !0,
      error: null,
      data
    },
    { status: 200 }
  );
}
async function noGetRoute() {
  return new Response("Cannot GET this route", { status: 405 });
}

// app/utils/auth.server.ts
var bcrypt = require("bcryptjs"), { hash, compare } = bcrypt;
async function getUserSession(request, jwtConfigstr) {
  let jwtConfig = JSON.parse(jwtConfigstr), allCookies = request.headers.get("cookie"), sessionCookieContent = cookiesStringToYifferSessionCookie(
    allCookies,
    jwtConfig.cookie.name
  );
  if (!sessionCookieContent || !await import_cloudflare_worker_jwt.default.verify(sessionCookieContent, jwtConfig.tokenSecret))
    return null;
  let tokenContent = import_cloudflare_worker_jwt.default.decode(sessionCookieContent);
  return !tokenContent.payload || !tokenContent.payload.id || !tokenContent.payload.username || !tokenContent.payload.userType ? null : {
    userId: tokenContent.payload.id,
    username: tokenContent.payload.username,
    userType: tokenContent.payload.userType
  };
}
async function logout(jwtConfigStr) {
  let jwtConfig = JSON.parse(jwtConfigStr), destroyUserDataHeader = destroyUserDataCookieHeader(jwtConfig), destroySessionCookieHeader = destroyJwtAuthCookieHeader(jwtConfig), headers = new Headers();
  return headers.append("Set-Cookie", destroySessionCookieHeader), headers.append("Set-Cookie", destroyUserDataHeader), (0, import_cloudflare2.redirect)("/", { headers });
}
function destroyJwtAuthCookieHeader(jwtConfig) {
  return `${jwtConfig.cookie.name}=; Max-Age=0; Domain=${jwtConfig.cookie.domain};${jwtConfig.cookie.secure ? " Secure;" : ""}${jwtConfig.cookie.httpOnly ? " HttpOnly;" : ""} Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}
function destroyUserDataCookieHeader(jwtConfig) {
  return `yiffer_userdata=; Max-Age=0; Domain=${jwtConfig.cookie.domain}; ${jwtConfig.cookie.secure ? "Secure" : ""}; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}
function cookiesStringToYifferSessionCookie(allCookies, cookieName) {
  if (!allCookies)
    return;
  let yifferSessionCookie = allCookies.split(";").map((cookieStr) => cookieStr.trim()).find(
    (cookie) => cookie.startsWith(`${cookieName}=`)
  );
  if (yifferSessionCookie)
    return yifferSessionCookie.slice(cookieName.length + 1);
}

// app/utils/theme-provider.tsx
var import_react5 = require("@remix-run/react"), import_react6 = require("react"), import_jsx_dev_runtime4 = require("react/jsx-dev-runtime"), themes = {
  light: "light",
  dark: "dark"
}, prefersDarkMQ = "(prefers-color-scheme: dark)";
function getPreferredTheme() {
  return window.matchMedia(prefersDarkMQ).matches ? themes.dark : themes.light;
}
var ThemeContext = (0, import_react6.createContext)({
  theme: null,
  setTheme: () => {
  }
});
function ThemeProvider({ specifiedTheme, children }) {
  let [theme, setTheme] = (0, import_react6.useState)(() => specifiedTheme ? isTheme(specifiedTheme) ? specifiedTheme : null : typeof window != "object" ? null : getPreferredTheme()), persistTheme = (0, import_react5.useFetcher)(), persistThemeRef = (0, import_react6.useRef)(persistTheme);
  (0, import_react6.useEffect)(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);
  let mountRun = (0, import_react6.useRef)(!1);
  return (0, import_react6.useEffect)(() => {
    if (!mountRun.current) {
      mountRun.current = !0;
      return;
    }
    theme && persistThemeRef.current.submit(
      { theme },
      { action: "api/set-theme", method: "post" }
    );
  }, [theme]), /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(ThemeContext.Provider, { value: { theme, setTheme }, children }, void 0, !1, {
    fileName: "app/utils/theme-provider.tsx",
    lineNumber: 77,
    columnNumber: 5
  }, this);
}
function useTheme() {
  let context = (0, import_react6.useContext)(ThemeContext);
  if (context === void 0)
    throw new Error("useTheme must be used within a ThemeProvider");
  return [context.theme, context.setTheme];
}
function isTheme(theme) {
  return theme !== null && Object.values(themes).includes(theme);
}
var clientThemeCode = `
  ;(() => {
    const theme = window.matchMedia(${JSON.stringify(prefersDarkMQ)}).matches
      ? 'dark'
      : 'light';
    const cl = document.documentElement.classList;
    const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
    if (themeAlreadyApplied) {
      // this script shouldn't exist if the theme is already applied!
      console.warn(
        "Theme bug",
      );
    } else {
      cl.add(theme);
    }
  })();
`;

// app/utils/theme.server.ts
var import_cloudflare3 = require("@remix-run/cloudflare");
var themeStorage = (0, import_cloudflare3.createCookieSessionStorage)({
  cookie: {
    name: "dev-yiffer-theme",
    secure: !1,
    // TODO:
    sameSite: "lax",
    path: "/",
    httpOnly: !1
    // TODO:
  }
});
async function getThemeSession(request) {
  let session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: function() {
      let themeVal = session.get("theme");
      return isTheme(themeVal) ? themeVal : null;
    },
    setTheme: function(theme) {
      return session.set("theme", theme);
    },
    commit: async function() {
      return themeStorage.commitSession(session);
    }
  };
}

// app/root.tsx
var import_react_toastify = require("react-toastify");

// node_modules/react-toastify/dist/ReactToastify.css
var ReactToastify_default = "/build/_assets/ReactToastify-RDYICG4O.css";

// app/root.tsx
var Sentry2 = __toESM(require("@sentry/browser")), import_jsx_dev_runtime5 = require("react/jsx-dev-runtime");
Sentry2.init({
  dsn: "https://74fe377e56b149fa9f1fa9d41d5de90b@o4504978928959488.ingest.sentry.io/4504978941542400",
  // Alternatively, use `process.env.npm_package_version` for a dynamic release version
  // if your build tool supports it.
  integrations: [new Sentry2.BrowserTracing()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1
});
var meta = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1"
});
function links() {
  return [
    { rel: "stylesheet", href: app_default },
    { rel: "stylesheet", href: main_default },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Mulish:wght@300;600&display=swap"
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Shrikhand&text=Yiffer.xyz&display=swap"
    },
    { rel: "stylesheet", href: ReactToastify_default }
  ];
}
var loader = async function({ request, context }) {
  let themeSession = await getThemeSession(request), userSession = await getUserSession(request, context.JWT_CONFIG_STR);
  return {
    theme: themeSession.getTheme(),
    user: userSession,
    frontPageUrl: context.FRONT_PAGE_URL
  };
};
function App() {
  let [theme] = useTheme(), data = (0, import_react7.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("html", { lang: "en", className: (0, import_clsx.default)(theme), children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("head", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react7.Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 82,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react7.Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 83,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 81,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("body", { className: "dark:bg-bgDark text-text-light dark:text-text-dark", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Layout, { user: data.user, frontPageUrl: data.frontPageUrl, children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react7.Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 90,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 88,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react7.ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 93,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react_toastify.ToastContainer, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 94,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react7.Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 95,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react7.LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 96,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`
          }
        },
        void 0,
        !1,
        {
          fileName: "app/root.tsx",
          lineNumber: 97,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 87,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 80,
    columnNumber: 5
  }, this);
}
function AppWithProviders() {
  let data = (0, import_react7.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(ThemeProvider, { specifiedTheme: data.theme, children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(App, {}, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 130,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 129,
    columnNumber: 5
  }, this);
}
function Layout({
  frontPageUrl,
  user,
  children
}) {
  let [, setTheme] = useTheme();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_jsx_dev_runtime5.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
      "nav",
      {
        className: `flex bg-gradient-to-r from-theme1-primary to-theme2-primary dark:bg-none
          px-4 py-1.5 nav-shadowing justify-between mb-4 text-gray-400 w-full z-20`,
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex items-center justify-between mx-auto flex-grow max-w-full lg:max-w-80p", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex gap-6 items-center", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
              "a",
              {
                href: frontPageUrl,
                className: "text-gray-400 hidden lg:block bg-none dark:text-blue-strong-300",
                style: {
                  fontFamily: "Shrikhand,cursive",
                  fontSize: "1.25rem",
                  fontWeight: 400
                },
                children: "Yiffer.xyz"
              },
              void 0,
              !1,
              {
                fileName: "app/root.tsx",
                lineNumber: 157,
                columnNumber: 13
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
              "a",
              {
                href: frontPageUrl,
                className: "text-gray-400 block lg:hidden bg-none dark:text-blue-strong-300",
                style: {
                  fontFamily: "Shrikhand,cursive",
                  fontSize: "1.25rem",
                  fontWeight: 400
                },
                children: "Y"
              },
              void 0,
              !1,
              {
                fileName: "app/root.tsx",
                lineNumber: 168,
                columnNumber: 13
              },
              this
            ),
            !!user ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_jsx_dev_runtime5.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
                "a",
                {
                  href: "https://yiffer.xyz/account",
                  className: "text-gray-400 font-semibold bg-none dark:text-blue-strong-300",
                  children: "Account"
                },
                void 0,
                !1,
                {
                  fileName: "app/root.tsx",
                  lineNumber: 181,
                  columnNumber: 17
                },
                this
              ),
              !0 && /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
                "a",
                {
                  href: "/admin",
                  className: "font-semibold bg-none dark:text-blue-strong-300",
                  children: "Admin"
                },
                void 0,
                !1,
                {
                  fileName: "app/root.tsx",
                  lineNumber: 188,
                  columnNumber: 15
                },
                this
              ),
              /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
                "a",
                {
                  href: "/logout",
                  className: "font-semibold bg-none dark:text-blue-strong-300",
                  children: "Log out"
                },
                void 0,
                !1,
                {
                  fileName: "app/root.tsx",
                  lineNumber: 195,
                  columnNumber: 17
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/root.tsx",
              lineNumber: 180,
              columnNumber: 13
            }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
              "a",
              {
                href: "/login",
                className: "text-gray-400 font-semibold bg-none dark:text-blue-strong-300",
                children: "Log in"
              },
              void 0,
              !1,
              {
                fileName: "app/root.tsx",
                lineNumber: 203,
                columnNumber: 13
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/root.tsx",
            lineNumber: 156,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex gap-6", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
              "p",
              {
                onClick: () => setTheme("light"),
                className: "cursor-pointer font-bold dark:text-blue-strong-300",
                children: "Light"
              },
              void 0,
              !1,
              {
                fileName: "app/root.tsx",
                lineNumber: 212,
                columnNumber: 13
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
              "p",
              {
                onClick: () => setTheme("dark"),
                className: "cursor-pointer font-bold dark:text-blue-strong-300",
                children: "Dark"
              },
              void 0,
              !1,
              {
                fileName: "app/root.tsx",
                lineNumber: 218,
                columnNumber: 13
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/root.tsx",
            lineNumber: 211,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/root.tsx",
          lineNumber: 155,
          columnNumber: 9
        }, this)
      },
      void 0,
      !1,
      {
        fileName: "app/root.tsx",
        lineNumber: 150,
        columnNumber: 7
      },
      this
    ),
    children
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 149,
    columnNumber: 5
  }, this);
}

// app/routes/forgotten-password.tsx
var forgotten_password_exports = {};
__export(forgotten_password_exports, {
  default: () => ForgottenPassword,
  loader: () => loader2
});
var import_react9 = require("@remix-run/react");

// app/components/Link.tsx
var import_react8 = require("@remix-run/react"), import_jsx_dev_runtime6 = require("react/jsx-dev-runtime");
function Link({
  href,
  text,
  newTab,
  Icon,
  IconRight,
  className,
  ...props
}) {
  let linkClass = `
    w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
    bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
    dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
    focus:no-underline cursor-pointer
    ${className}
  `;
  return href.includes("http") ? /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(
    "a",
    {
      href,
      target: newTab ? "_blank" : "_self",
      rel: newTab ? "noreferrer" : void 0,
      className: linkClass,
      style: { paddingBottom: "1px" },
      children: text
    },
    void 0,
    !1,
    {
      fileName: "app/components/Link.tsx",
      lineNumber: 37,
      columnNumber: 7
    },
    this
  ) : /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(
    import_react8.Link,
    {
      to: href,
      target: newTab ? "_blank" : "_self",
      rel: newTab ? "noreferrer" : void 0,
      className: linkClass,
      style: { paddingBottom: "1px" },
      prefetch: "intent",
      ...props,
      children: [
        Icon ? /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(Icon, { style: { marginRight: "4px" } }, void 0, !1, {
          fileName: "app/components/Link.tsx",
          lineNumber: 59,
          columnNumber: 17
        }, this) : void 0,
        text,
        IconRight ? /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(IconRight, { style: { marginLeft: "4px" } }, void 0, !1, {
          fileName: "app/components/Link.tsx",
          lineNumber: 61,
          columnNumber: 22
        }, this) : void 0
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/components/Link.tsx",
      lineNumber: 50,
      columnNumber: 7
    },
    this
  );
}

// app/utils/loaders.ts
var import_cloudflare4 = require("@remix-run/cloudflare");
async function authLoader(args) {
  return await getUserSession(args.request, args.context.JWT_CONFIG_STR);
}
async function redirectIfNotLoggedIn(args) {
  let user = await authLoader(args);
  if (!user)
    throw (0, import_cloudflare4.redirect)("/");
  return user;
}
async function redirectIfLoggedIn(args) {
  let user = await authLoader(args);
  if (user)
    throw (0, import_cloudflare4.redirect)("/");
  return user;
}
async function redirectIfNotMod(args) {
  let user = await authLoader(args);
  if (user?.userType !== "moderator" && user?.userType !== "admin")
    throw (0, import_cloudflare4.redirect)("/");
  return user;
}

// app/routes/forgotten-password.tsx
var import_jsx_dev_runtime7 = require("react/jsx-dev-runtime");
async function loader2(args) {
  return await redirectIfLoggedIn(args), null;
}
function ForgottenPassword() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react9.Form, { method: "post", className: "max-w-xs mx-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("h1", { className: "text-3xl", children: "Forgotten password" }, void 0, !1, {
      fileName: "app/routes/forgotten-password.tsx",
      lineNumber: 14,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("p", { children: "Content here." }, void 0, !1, {
      fileName: "app/routes/forgotten-password.tsx",
      lineNumber: 16,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Link, { href: "/login", text: "Log in instead", className: "mb-4" }, void 0, !1, {
      fileName: "app/routes/forgotten-password.tsx",
      lineNumber: 18,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("br", {}, void 0, !1, {
      fileName: "app/routes/forgotten-password.tsx",
      lineNumber: 19,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Link, { href: "/signup", text: "Sign up instead" }, void 0, !1, {
      fileName: "app/routes/forgotten-password.tsx",
      lineNumber: 20,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/forgotten-password.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, this);
}

// app/routes/contribute/index.tsx
var contribute_exports = {};
__export(contribute_exports, {
  default: () => Index,
  loader: () => loader3
});
var import_react10 = require("@remix-run/react"), import_md2 = require("react-icons/md");
var import_jsx_dev_runtime8 = require("react/jsx-dev-runtime");
async function loader3(args) {
  return await authLoader(args);
}
function Index() {
  let user = (0, import_react10.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("h1", { className: "text-center", children: "Contribute" }, void 0, !1, {
      fileName: "app/routes/contribute/index.tsx",
      lineNumber: 16,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "text-center mx-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Link, { href: "https://yiffer.xyz", text: "To main page", Icon: import_md2.MdHome }, void 0, !1, {
      fileName: "app/routes/contribute/index.tsx",
      lineNumber: 18,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/index.tsx",
      lineNumber: 17,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "max-w-4xl mx-auto mt p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-8 sm:p-8", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        ContributionCard,
        {
          title: "Upload a comic yourself",
          description: "Add files yourself, in addition to specifying artist, tags, and more",
          href: "upload"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 22,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        ContributionCard,
        {
          title: "Suggest a comic",
          description: "Suggest a comic for the mod team to upload, providing links and what information you can",
          href: "suggest-comic"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 27,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        ContributionCard,
        {
          title: "Your contributions",
          description: "See the status and history of your previous contributions",
          href: "your-contributions",
          disabled: !user,
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "text-center", children: "Requires login" }, void 0, !1, {
            fileName: "app/routes/contribute/index.tsx",
            lineNumber: 38,
            columnNumber: 11
          }, this)
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 32,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        ContributionCard,
        {
          title: "Contributions scoreboard",
          description: "See the monthly and all-time top contributors",
          href: "scoreboard"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 40,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        ContributionCard,
        {
          title: "Become a mod",
          description: "Be a part of the incredible team that keeps this site running!",
          href: "join-us"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 45,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        ContributionCard,
        {
          title: "Feedback & Support",
          description: "Have any tips for how Yiffer.xyz could be better? Need help?",
          href: "feedback"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 50,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/index.tsx",
      lineNumber: 21,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/index.tsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}
function ContributionCard({
  title,
  description,
  href,
  disabled,
  children
}) {
  return disabled ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
    "div",
    {
      className: `rounded-lg p-4 h-full flex flex-col 
      justify-evenly bg-white dark:bg-gray-300 border-2 border-gray-900 dark:border-0`,
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("h2", { className: "text-theme2-darker dark:text-theme2-dark text-xl text-center font-semibold", children: title }, void 0, !1, {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 80,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "text-black dark:text-text-dark text-center", children: description }, void 0, !1, {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 83,
          columnNumber: 7
        }, this),
        children
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/routes/contribute/index.tsx",
      lineNumber: 76,
      columnNumber: 5
    },
    this
  ) : /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
    import_react10.Link,
    {
      to: "/contribute/" + href,
      prefetch: "intent",
      style: { backgroundImage: "none" },
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        "div",
        {
          className: `rounded-lg shadow-md p-4 hover:shadow-lg h-full flex flex-col 
          justify-evenly bg-white dark:bg-gray-400`,
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("h2", { className: "text-theme2-darker dark:text-theme2-dark text-xl text-center font-semibold", children: title }, void 0, !1, {
              fileName: "app/routes/contribute/index.tsx",
              lineNumber: 96,
              columnNumber: 9
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "text-black dark:text-text-dark text-center", children: description }, void 0, !1, {
              fileName: "app/routes/contribute/index.tsx",
              lineNumber: 99,
              columnNumber: 9
            }, this)
          ]
        },
        void 0,
        !0,
        {
          fileName: "app/routes/contribute/index.tsx",
          lineNumber: 92,
          columnNumber: 7
        },
        this
      )
    },
    void 0,
    !1,
    {
      fileName: "app/routes/contribute/index.tsx",
      lineNumber: 87,
      columnNumber: 5
    },
    this
  );
}

// app/routes/logout.tsx
var logout_exports = {};
__export(logout_exports, {
  action: () => action,
  loader: () => loader4
});
async function action(args) {
  return logout(args.context.JWT_CONFIG_STR);
}
function loader4(args) {
  return logout(args.context.JWT_CONFIG_STR);
}

// app/routes/signup.tsx
var signup_exports = {};
__export(signup_exports, {
  action: () => action2,
  default: () => Signup,
  loader: () => loader5
});

// app/components/Buttons/LoadingButton.tsx
var import_react11 = require("react");

// app/components/Buttons/Button.tsx
var import_jsx_dev_runtime9 = require("react/jsx-dev-runtime");
function Button({
  text = "",
  variant = "contained",
  color = "primary",
  fullWidth = !1,
  onClick,
  disabled = !1,
  startIcon: StartIcon,
  endIcon: EndIcon,
  noPadding = !1,
  // TODO: Maybe a temporary hack. It's for IconButton.
  className,
  style = {},
  buttonRef,
  isSubmit = !1,
  ...props
}) {
  let variantClassname = "", paddingString = noPadding ? "" : variant === "contained" || variant === "naked" ? " py-1.25 px-3 " : " py-1 px-2.75 ";
  variant === "contained" && color === "primary" && (variantClassname += ` bg-blue-weak-200 hover:bg-blue-weak-100 focus:bg-blue-weak-100
      dark:bg-blue-strong-200 dark:hover:bg-blue-strong-100 dark:focus:bg-blue-strong-100
      shadow hover:shadow-md focus:shadow-md
      text-white ${paddingString} `), variant === "outlined" && color === "primary" && (variantClassname += ` bg-transparent 
      hover:bg-blue-weak-200 focus:bg-blue-weak-200
      dark:hover:bg-blue-strong-200 dark:focus:bg-blue-strong-200
      hover:text-white focus:text-white border-2 border-blue-weak-200 dark:border-blue-strong-200
      dark:text-white text-blue-weak-200 ${paddingString} `), variant === "naked" && color === "primary" && (variantClassname += ` bg-transparent dark:text-white text-blue-weak-200 ${paddingString} `), variant === "contained" && color === "error" && (variantClassname += ` bg-red-weak-200 hover:bg-red-weak-100 focus:bg-red-weak-100
      dark:bg-red-strong-200 dark:hover:bg-red-strong-100 dark:focus:bg-red-strong-100
      shadow hover:shadow-md focus:shadow-md
      text-white ${paddingString} `), variant === "outlined" && color === "error" && (variantClassname += ` bg-transparent hover:bg-red-weak-200 focus:bg-red-weak-200
      dark:hover:bg-red-strong-200 dark:focus:bg-red-strong-200
      hover:text-white focus:text-white dark:text-white text-red-weak-200
      border-2 border-red-weak-200 dark:border-red-strong-200 ${paddingString} `), variant === "naked" && color === "error" && (variantClassname += ` bg-transparent dark:text-white text-red-weak-200 ${paddingString} `), disabled && variant === "contained" && (variantClassname += ` bg-gray-800 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-600
    text-gray-900 dark:text-gray-700 cursor-not-allowed `), disabled && variant === "outlined" && (variantClassname += ` bg-transparent border-2 border-gray-800 dark:border-gray-600
    text-gray-800 dark:text-gray-700 cursor-not-allowed
    hover:bg-transparent focus:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent
    hover:text-gray-800 focus:text-gray-800 hover:border-gray-800 focus:border-gray-800`), disabled && variant === "naked" && (variantClassname += " text-gray-800 dark:text-gray-700 cursor-not-allowed ");
  let fullClassName = `rounded ${noPadding ? "" : "py-1.5 px-3"} font-bold flex flex-nowrap justify-center items-center transition-all duration-100 break-all text-sm ${noPadding ? "" : fullWidth ? "w-full" : "w-fit"} ${variantClassname} ${className} `;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(
    "button",
    {
      className: fullClassName,
      disabled,
      onClick,
      ...props,
      style,
      ref: buttonRef,
      type: isSubmit ? "submit" : "button",
      children: [
        StartIcon ? /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(StartIcon, { style: text ? { marginRight: "4px" } : {} }, void 0, !1, {
          fileName: "app/components/Buttons/Button.tsx",
          lineNumber: 114,
          columnNumber: 20
        }, this) : void 0,
        " ",
        text,
        " ",
        EndIcon ? /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(EndIcon, { style: text ? { marginLeft: "4px" } : {} }, void 0, !1, {
          fileName: "app/components/Buttons/Button.tsx",
          lineNumber: 115,
          columnNumber: 25
        }, this) : void 0
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/components/Buttons/Button.tsx",
      lineNumber: 105,
      columnNumber: 5
    },
    this
  );
}

// app/components/Buttons/LoadingButton.tsx
var import_jsx_dev_runtime10 = require("react/jsx-dev-runtime");
function LoadingButton({
  isLoading,
  variant = "contained",
  color = "primary",
  onClick,
  ...props
}) {
  let className = (isLoading ? "opacity-70 " : "") + props.className, Spinner4 = (0, import_react11.useMemo)(() => getSpinner(variant, color), [variant, color]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
    Button,
    {
      ...props,
      startIcon: isLoading ? Spinner4 : props.startIcon,
      variant,
      color,
      className,
      onClick: isLoading ? () => {
      } : onClick
    },
    void 0,
    !1,
    {
      fileName: "app/components/Buttons/LoadingButton.tsx",
      lineNumber: 21,
      columnNumber: 5
    },
    this
  );
}
var getSpinner = (variant, color) => {
  let borderRightColor = "";
  return variant === "contained" ? borderRightColor = "border-r-white" : (borderRightColor = "dark:border-r-white", color === "error" ? (borderRightColor += " border-r-red-weak-200", variant !== "naked" && (borderRightColor += " hover:border-r-white")) : (borderRightColor += " border-r-blue-weak-200", variant !== "naked" && (borderRightColor += " hover:border-r-white"))), () => /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
    "div",
    {
      className: `mr-3 w-4 h-4 animate-spin border-solid border-transparent ${borderRightColor} border border-r-2 rounded-full`
    },
    void 0,
    !1,
    {
      fileName: "app/components/Buttons/LoadingButton.tsx",
      lineNumber: 52,
      columnNumber: 5
    },
    this
  );
};

// app/components/TextInput/TextInput.tsx
var import_md3 = require("react-icons/md"), import_react12 = require("react"), import_jsx_dev_runtime11 = require("react/jsx-dev-runtime");
function TextInput({
  value,
  onChange,
  label,
  name,
  type = "text",
  autocomplete,
  placeholder,
  disabled = !1,
  clearable = !1,
  helperText = "",
  errorText = "",
  error = !1,
  className = "",
  onBlur,
  ...props
}) {
  function clear() {
    onChange("");
  }
  let borderClass = (0, import_react12.useMemo)(() => error ? "border-red-strong-300" : disabled ? "border-gray-800 dark:border-gray-600" : "", [error, disabled]), borderStyle = borderClass ? "" : { borderImage: "linear-gradient(to right, #9aebe7, #adfee0) 1" };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { className: `flex flex-col ${className}`, ...props, children: [
    label && /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("label", { className: `${error ? "text-red-strong-300" : ""} text-sm`, children: label }, void 0, !1, {
      fileName: "app/components/TextInput/TextInput.tsx",
      lineNumber: 61,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { className: "-mt-1 relative", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(
        "input",
        {
          value,
          onChange: (e) => onChange(e.target.value),
          type,
          name,
          autoComplete: autocomplete || void 0,
          placeholder,
          disabled,
          className: `w-full bg-transparent p-1.5 outline-none border border-0 border-b-2 
            border-gradient-to-r placeholder-gray-800 dark:placeholder-gray-700 ${borderClass}`,
          style: {
            appearance: "textfield",
            ...borderStyle
          },
          onBlur
        },
        void 0,
        !1,
        {
          fileName: "app/components/TextInput/TextInput.tsx",
          lineNumber: 64,
          columnNumber: 9
        },
        this
      ),
      clearable && value && /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(
        "span",
        {
          onClick: clear,
          className: "absolute block top-1.5 right-2 hover:cursor-pointer",
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(import_md3.MdClear, { className: "text-red hover:fill-theme2-darker" }, void 0, !1, {
            fileName: "app/components/TextInput/TextInput.tsx",
            lineNumber: 85,
            columnNumber: 13
          }, this)
        },
        void 0,
        !1,
        {
          fileName: "app/components/TextInput/TextInput.tsx",
          lineNumber: 81,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/components/TextInput/TextInput.tsx",
      lineNumber: 63,
      columnNumber: 7
    }, this),
    errorText && error && /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("p", { className: "text-sm py-0.5 px-2 text-red-strong-300", children: errorText }, void 0, !1, {
      fileName: "app/components/TextInput/TextInput.tsx",
      lineNumber: 91,
      columnNumber: 9
    }, this),
    !(errorText && error) && helperText && /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("label", { className: "text-sm py-0.5 px-2", children: helperText }, void 0, !1, {
      fileName: "app/components/TextInput/TextInput.tsx",
      lineNumber: 94,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/TextInput/TextInput.tsx",
    lineNumber: 59,
    columnNumber: 5
  }, this);
}

// app/components/TextInput/TextInputUncontrolled.tsx
var import_react13 = require("react"), import_jsx_dev_runtime12 = require("react/jsx-dev-runtime");
function TextInputUncontrolled({
  label,
  name,
  type = "text",
  autocomplete,
  placeholder = "",
  disabled = !1,
  clearable = !1,
  helperText = "",
  errorText = "",
  error = !1,
  validatorFunc,
  onErrorChange,
  className = "",
  ...props
}) {
  let [state, setState] = (0, import_react13.useState)(""), [hasBeenBlurred, setHasBeenBlurred] = (0, import_react13.useState)(!1), [lastErrorUpdate, setLastErrorUpdate] = (0, import_react13.useState)(!1), isInternalError = (0, import_react13.useMemo)(() => {
    if (validatorFunc) {
      let isError = !validatorFunc(state);
      return onErrorChange && isError !== lastErrorUpdate && (onErrorChange(isError), setLastErrorUpdate(isError)), isError;
    }
    return !1;
  }, [state, validatorFunc]), shouldShowError = error || hasBeenBlurred && isInternalError;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(
    TextInput,
    {
      value: state,
      onChange: (newVal) => setState(newVal),
      label,
      name,
      type,
      placeholder,
      disabled,
      clearable,
      helperText,
      errorText: shouldShowError ? errorText : "",
      error: shouldShowError,
      className,
      onBlur: () => setHasBeenBlurred(!0),
      ...props
    },
    void 0,
    !1,
    {
      fileName: "app/components/TextInput/TextInputUncontrolled.tsx",
      lineNumber: 44,
      columnNumber: 5
    },
    this
  );
}

// app/routes/signup.tsx
var import_auth_server = require("~/utils/auth.server.js");

// app/utils/useGoodFetcher.tsx
var import_react14 = require("@remix-run/react"), import_react15 = require("react"), import_react_toastify2 = require("react-toastify");
var import_jsx_dev_runtime13 = require("react/jsx-dev-runtime");
function useGoodFetcher({
  url,
  method = "get",
  onFinish,
  toastSuccessMessage,
  preventToastClose = !1,
  toastError = !0,
  // TODO: Probably flip this
  fetchGetOnLoad = !1,
  encType
}) {
  let [hasFetchedOnce, setHasFetchedOnce] = (0, import_react15.useState)(!1), fetcher = (0, import_react14.useFetcher)(), fetchingStateRef = (0, import_react15.useRef)("not-started"), [theme] = useTheme();
  (0, import_react15.useEffect)(() => {
    let stateToCheck = "idle";
    if (fetcher.state === "submitting" && fetchingStateRef.current === "not-started") {
      fetchingStateRef.current = "is-fetching";
      return;
    }
    fetcher.state === stateToCheck && fetchingStateRef.current === "is-fetching" && (fetchingStateRef.current = "not-started", setHasFetchedOnce(!0), onFinish && onFinish(), fetcher.data && (toastSuccessMessage && fetcher.data.success ? showSuccessToast(toastSuccessMessage, preventToastClose, theme) : toastError && fetcher.data.error && showErrorToast(fetcher.data.error, theme)));
  }, [fetcher.state]), (0, import_react15.useEffect)(() => () => {
    fetchingStateRef.current === "is-fetching" && toastSuccessMessage && showSuccessToast(toastSuccessMessage, preventToastClose, theme);
  }, [toastSuccessMessage, theme]), (0, import_react15.useEffect)(() => {
    fetchGetOnLoad && method === "get" && submit();
  }, [method, url, fetchGetOnLoad]);
  let returnData;
  fetcher.data?.data && (returnData = fetcher.data.data);
  let submit = (0, import_react15.useCallback)(
    (body) => {
      fetchingStateRef.current = "is-fetching";
      let submitOptions = {
        method
      };
      url && (submitOptions.action = url), encType && (submitOptions.encType = encType), fetcher.submit(body ?? null, submitOptions);
    },
    [fetcher, method]
  ), awaitSubmit = (0, import_react15.useCallback)(
    async (body) => {
      for (submit(body); fetchingStateRef.current === "is-fetching"; )
        await new Promise((resolve) => setTimeout(resolve, 25));
    },
    [submit]
  ), form = (0, import_react15.useCallback)(
    ({ children, className }) => /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(fetcher.Form, { action: url, method, className, children }, void 0, !1, {
      fileName: "app/utils/useGoodFetcher.tsx",
      lineNumber: 150,
      columnNumber: 9
    }, this),
    []
  );
  return {
    data: returnData,
    isError: !!fetcher.data?.error && fetcher.state === "idle",
    errorMessage: fetcher.data?.error || "",
    success: fetcher.data?.success,
    isLoading: fetcher.state !== "idle",
    hasFetchedOnce,
    submit,
    awaitSubmit,
    Form: form
  };
}
function showSuccessToast(message, preventClose, theme) {
  import_react_toastify2.toast.success(message, {
    position: import_react_toastify2.toast.POSITION.TOP_RIGHT,
    theme: theme === "dark" ? "dark" : "light",
    className(context) {
      return context?.defaultClassName + " dark:bg-gray-300";
    },
    style: { width: "fit-content", minHeight: "auto" },
    autoClose: preventClose ? !1 : 3e3,
    hideProgressBar: !0,
    closeOnClick: !0,
    pauseOnHover: !0,
    progress: void 0,
    closeButton: !1
  });
}
function showErrorToast(message, theme) {
  import_react_toastify2.toast.error(message, {
    position: import_react_toastify2.toast.POSITION.TOP_RIGHT,
    theme: theme === "dark" ? "dark" : "light",
    className(context) {
      return context?.defaultClassName + " dark:bg-gray-300";
    },
    style: { width: "fit-content", minHeight: "auto" },
    autoClose: !1,
    hideProgressBar: !0,
    closeOnClick: !0,
    progress: void 0,
    closeButton: !1
  });
}

// app/routes/signup.tsx
var import_jsx_dev_runtime14 = require("react/jsx-dev-runtime");
function Signup() {
  let fetcher = useGoodFetcher({
    method: "post",
    toastError: !1
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(fetcher.Form, { className: "max-w-xs mx-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("h1", { className: "text-3xl", children: "Sign up" }, void 0, !1, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "mt-4 flex flex-col gap-6", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(
        TextInputUncontrolled,
        {
          name: "username",
          label: "Username",
          autocomplete: "username",
          className: "mb-6 mt-4",
          type: "text"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/signup.tsx",
          lineNumber: 26,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(
        TextInputUncontrolled,
        {
          name: "email",
          label: "Email",
          autocomplete: "email",
          className: "mb-6",
          type: "text"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/signup.tsx",
          lineNumber: 34,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(
        TextInputUncontrolled,
        {
          name: "password",
          label: "Password - at least 6 characters",
          autocomplete: "password",
          type: "password",
          className: "mb-6"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/signup.tsx",
          lineNumber: 42,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(
        TextInputUncontrolled,
        {
          name: "password2",
          label: "Repeat password",
          autocomplete: "password",
          type: "password",
          className: "mb-6"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/signup.tsx",
          lineNumber: 50,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    fetcher?.isError && /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(InfoBox, { variant: "error", text: fetcher.errorMessage, className: "my-2" }, void 0, !1, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 60,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "flex", children: /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(
      LoadingButton,
      {
        text: "Sign up",
        color: "primary",
        variant: "contained",
        className: "mt-2 mb-6",
        fullWidth: !0,
        isLoading: fetcher.isLoading,
        isSubmit: !0
      },
      void 0,
      !1,
      {
        fileName: "app/routes/signup.tsx",
        lineNumber: 64,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 63,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Link, { href: "/login", text: "Log in instead" }, void 0, !1, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 75,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("br", {}, void 0, !1, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 76,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Link, { href: "/forgotten-password", text: "Forgotten password?" }, void 0, !1, {
      fileName: "app/routes/signup.tsx",
      lineNumber: 77,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/signup.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}
async function loader5(args) {
  return await redirectIfLoggedIn(args), null;
}
async function action2(args) {
  let reqBody = await args.request.formData(), {
    username: formUsername,
    email: formEmail,
    password: formPassword,
    password2: formPassword2
  } = Object.fromEntries(reqBody);
  if (!formUsername || !formEmail || !formPassword || !formPassword2)
    return create400Json("Missing fields");
  let username = formUsername.toString().trim(), email = formEmail.toString().trim(), password = formPassword.toString().trim(), password2 = formPassword2.toString().trim(), validationErr = getSignupValidationError(username, email, password, password2);
  if (validationErr)
    return create400Json(validationErr);
  let { err, redirect: redirect5, errorMessage } = await (0, import_auth_server.signup)(
    username,
    email,
    password,
    args.context.DB_API_URL_BASE,
    args.context.JWT_CONFIG_STR,
    args.context.POSTMARK_TOKEN
  );
  if (err)
    return processApiError("Error in /signup", err, { username, email });
  if (errorMessage)
    return createAnyErrorCodeJson(401, errorMessage);
  throw redirect5;
}
function getSignupValidationError(username, email, password, password2) {
  if (!username)
    return "Missing username";
  if (username.length < 2 || username.length > 25)
    return "Username must be between 2 and 25 characters";
  if (!password || !password2)
    return "Missing password";
  if (password !== password2)
    return "Passwords do not match";
  if (password.length < 6)
    return "Password must be at least 6 characters";
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    return "Invalid email";
}

// app/routes/admin.tsx
var admin_exports = {};
__export(admin_exports, {
  ErrorBoundary: () => ErrorBoundary,
  default: () => Admin,
  loader: () => loader6
});
var import_cloudflare5 = require("@remix-run/cloudflare"), import_react17 = require("@remix-run/react"), import_react18 = require("react"), import_md4 = require("react-icons/md");

// app/utils/useWindowSize.ts
var import_react16 = require("react");
function useWindowSize() {
  let [windowSize, setWindowSize] = (0, import_react16.useState)({
    width: void 0,
    height: void 0,
    isMobile: !1,
    isSmUp: !1,
    isMdUp: !1,
    isLgUp: !1,
    isXlUp: !1
  });
  return (0, import_react16.useEffect)(() => {
    if (!window)
      return;
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 640,
        isSmUp: window.innerWidth >= 640,
        isMdUp: window.innerWidth >= 768,
        isLgUp: window.innerWidth >= 1024,
        isXlUp: window.innerWidth >= 1280
      });
    }
    return window.addEventListener("resize", handleResize), handleResize(), () => window.removeEventListener("resize", handleResize);
  }, []), windowSize;
}

// app/routes/api/funcs/get-artists.ts
var get_artists_exports = {};
__export(get_artists_exports, {
  getAllArtists: () => getAllArtists
});
async function getAllArtists(urlBase, options) {
  let query = `SELECT
      id,
      name,
      patreonName,
      e621Name,
      isPending,
      isBanned
    FROM artist
    WHERE isRejected = 0`;
  options.includePending || (query += " AND IsPending = 0"), options.includeBanned || (query += " AND IsBanned = 0");
  let artistsRes = await queryDb(urlBase, query);
  if (artistsRes.isError)
    return makeDbErrObj(artistsRes, "Error getting artists from db", options);
  let boolArtists = artistsRes.result.map((artist) => (artist.isPending = !!artist.isPending, artist.isBanned = !!artist.isBanned, artist));
  return options.modifyNameIncludeType ? { artists: boolArtists.map((artist) => (artist.isPending && (artist.name = artist.name + " (PENDING)"), artist.isBanned && (artist.name = artist.name + " (BANNED)"), artist)) } : { artists: boolArtists };
}

// app/routes/api/funcs/get-comics.ts
var get_comics_exports = {};
__export(get_comics_exports, {
  getAllComicNamesAndIDs: () => getAllComicNamesAndIDs,
  getComicsByArtistId: () => getComicsByArtistId
});
async function getAllComicNamesAndIDs(urlBase, options) {
  let query = "SELECT name, id, publishStatus" + (options?.includeThumbnailStatus ? ", hasHighresThumbnail, published" : "") + ' FROM comic WHERE publishStatus != "rejected"';
  options?.includeRejectedList || (query += ' AND publishStatus != "rejected-list" '), options?.includeUnlisted || (query += ' AND publishStatus != "unlisted" ');
  let response = await queryDb(urlBase, query);
  if (response.isError || !response.result)
    return makeDbErrObj(response, "Error  getting comics", options);
  let comics = response.result.map((comic) => ({
    name: comic.name,
    id: comic.id,
    publishStatus: comic.publishStatus,
    temp_published: comic.published,
    temp_hasHighresThumbnail: comic.hasHighresThumbnail === 1
  }));
  return options?.modifyNameIncludeType ? { comics: addStateToComicNames(comics) } : { comics };
}
async function getComicsByArtistId(urlBase, artistId, options) {
  let query = `SELECT
      name, id, publishStatus
    FROM comic
    WHERE artist = ?
      AND publishStatus != "rejected"
      AND publishStatus != "rejected-list"
      ${options?.includeUnlisted ? "" : 'AND publishStatus != "unlisted"'}`, dbRes = await queryDb(urlBase, query, [artistId]);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting comics by artist", { artistId, options }) : { comics: addStateToComicNames(dbRes.result) };
}
function addStateToComicNames(comics) {
  return comics.map((comic) => (comic.publishStatus === "uploaded" && (comic.name = comic.name + " (UPLOADED)"), comic.publishStatus === "pending" && (comic.name = comic.name + " (PENDING)"), comic.publishStatus === "scheduled" && (comic.name = comic.name + " (SCHEDULED)"), comic.publishStatus === "unlisted" && (comic.name = comic.name + " (UNLISTED)"), comic));
}

// app/routes/api/funcs/get-tags.ts
var get_tags_exports = {};
__export(get_tags_exports, {
  getAllTags: () => getAllTags
});
async function getAllTags(urlBase) {
  let dbRes = await queryDb(urlBase, "SELECT id, keywordName AS name FROM keyword");
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting all tags") : { tags: dbRes.result };
}

// app/routes/admin.tsx
var import_jsx_dev_runtime15 = require("react/jsx-dev-runtime"), navWidth = 200, mobileClosedBarW = 24, mobileClosedBarTailwindUnits = mobileClosedBarW / 4;
function Admin({}) {
  let { isLgUp, width } = useWindowSize(), globalContext = (0, import_react17.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(import_jsx_dev_runtime15.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(Sidebar, { alwaysShow: isLgUp, delay: !width }, void 0, !1, {
      fileName: "app/routes/admin.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
      "div",
      {
        className: "pb-4 px-6 lg:px-8",
        style: { marginLeft: isLgUp ? navWidth : mobileClosedBarW },
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(import_react17.Outlet, { context: globalContext }, void 0, !1, {
          fileName: "app/routes/admin.tsx",
          lineNumber: 36,
          columnNumber: 9
        }, this)
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin.tsx",
        lineNumber: 32,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 30,
    columnNumber: 5
  }, this);
}
async function loader6(args) {
  let urlBase = args.context.DB_API_URL_BASE;
  await redirectIfNotMod(args);
  let url = new URL(args.request.url);
  if (url.pathname === "/admin" || url.pathname === "/admin/")
    return (0, import_cloudflare5.redirect)("/admin/dashboard");
  let [comicsRes, artistsRes, tagsRes] = await Promise.all([
    getAllComicNamesAndIDs(urlBase, {
      modifyNameIncludeType: !0,
      includeUnlisted: !0,
      includeThumbnailStatus: !0
    }),
    getAllArtists(urlBase, {
      includePending: !0,
      includeBanned: !0,
      modifyNameIncludeType: !0
    }),
    getAllTags(urlBase)
  ]);
  return comicsRes.err || !comicsRes.comics ? processApiError(
    "Error getting comics in mod panel",
    comicsRes.err || { logMessage: "Comics returned as null" }
  ) : artistsRes.err || !artistsRes.artists ? processApiError(
    "Error getting artists in mod panel",
    artistsRes.err || { logMessage: "Artists returned as null" }
  ) : tagsRes.err || !tagsRes.tags ? processApiError(
    "Error getting tags in mod panel",
    tagsRes.err || { logMessage: "Tags returned as null" }
  ) : {
    comics: comicsRes.comics,
    artists: artistsRes.artists,
    tags: tagsRes.tags
  };
}
function Sidebar({ alwaysShow, delay }) {
  let matches = (0, import_react17.useMatches)(), [isOpen, setIsOpen] = (0, import_react18.useState)(alwaysShow), [lastRoute, setLastRoute] = (0, import_react18.useState)("");
  function isRoute(matchString) {
    return matches.some((match) => match.pathname.includes(`/admin/${matchString}`));
  }
  return (0, import_react18.useEffect)(() => {
    setLastRoute(matches[matches.length - 1].pathname);
  }, [matches]), (0, import_react18.useEffect)(() => {
    setIsOpen(alwaysShow);
  }, [lastRoute]), delay ? /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(import_jsx_dev_runtime15.Fragment, {}, void 0, !1, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 115,
    columnNumber: 12
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(import_jsx_dev_runtime15.Fragment, { children: [
    !delay && !alwaysShow && /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
      "div",
      {
        className: `fixed inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-150 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`,
        onClick: () => setIsOpen(!1)
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin.tsx",
        lineNumber: 122,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
      "div",
      {
        className: `flex flex-row h-screen bg-white w-fit fixed -mt-4 shadow-lg lg:dark:shadow-2xl z-20
        dark:bg-gray-200 lg:dark:bg-gray-200 transition-width duration-150`,
        style: {
          width: navWidth,
          marginLeft: isOpen || alwaysShow ? 0 : mobileClosedBarW - navWidth
        },
        children: [
          !alwaysShow && /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(MobileExpander, { isOpen, setIsOpen }, void 0, !1, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 138,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { className: "flex flex-col w-full", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("p", { className: "pt-6 pr-4 pb-4 pl-4 italic", children: "Yiffer.xyz admin hub, sidebar style wip" }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 141,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
              SidebarLink,
              {
                href: "/admin/dashboard",
                text: "Action dashboard",
                isSelected: isRoute("dashboard")
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.tsx",
                lineNumber: 144,
                columnNumber: 11
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
              SidebarLink,
              {
                href: "/admin/pending-comics",
                text: "Pending comics",
                isSelected: isRoute("pending-comics")
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.tsx",
                lineNumber: 149,
                columnNumber: 11
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
              SidebarLink,
              {
                href: "/admin/comics",
                text: "Comic manager",
                isSelected: isRoute("comics")
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.tsx",
                lineNumber: 154,
                columnNumber: 11
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
              SidebarLink,
              {
                href: "/admin/artists",
                text: "Artist manager",
                isSelected: isRoute("artists")
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.tsx",
                lineNumber: 159,
                columnNumber: 11
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
              SidebarLink,
              {
                href: "/admin/tags",
                text: "Tag manager",
                isSelected: isRoute("tags")
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.tsx",
                lineNumber: 164,
                columnNumber: 11
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
              SidebarLink,
              {
                href: "/admin/thumbnails",
                text: "Update thumbnails",
                isSelected: isRoute("thumbnails")
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin.tsx",
                lineNumber: 169,
                columnNumber: 11
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(SidebarLink, { href: "/admin/stats", text: "Stats", isSelected: isRoute("stats") }, void 0, !1, {
              fileName: "app/routes/admin.tsx",
              lineNumber: 174,
              columnNumber: 11
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin.tsx",
            lineNumber: 140,
            columnNumber: 9
          }, this)
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/routes/admin.tsx",
        lineNumber: 130,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 119,
    columnNumber: 5
  }, this);
}
var selectedClassname = "bg-theme1-dark dark:bg-blue-strong-200 text-white";
function SidebarLink({
  href,
  text,
  isSelected = !1,
  isIndented = !1
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { className: isSelected ? selectedClassname : "", children: /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(import_react17.Link, { to: href, children: /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
    "div",
    {
      className: `
            font-bold py-2 px-4 hover:bg-theme1-primaryTrans dark:hover:bg-blue-trans transition-background duration-100
            ${isIndented ? "pr-4 pl-10" : "px-4"}
          `,
      children: text
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.tsx",
      lineNumber: 199,
      columnNumber: 9
    },
    this
  ) }, void 0, !1, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 198,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/admin.tsx",
    lineNumber: 197,
    columnNumber: 5
  }, this);
}
function MobileExpander({
  isOpen,
  setIsOpen
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(
    "div",
    {
      className: `bg-theme1-primary dark:bg-gray-150 h-full w-${mobileClosedBarTailwindUnits + 2} 
            -right-[1px] top-0 hover:cursor-pointer hover:bg-theme1-dark transition-opacity
            flex items-center justify-center absolute ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`,
      onClick: () => setIsOpen(!0),
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(import_md4.MdChevronRight, { className: "ml-[6px]", style: { height: 24, width: 24 } }, void 0, !1, {
        fileName: "app/routes/admin.tsx",
        lineNumber: 230,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin.tsx",
      lineNumber: 220,
      columnNumber: 5
    },
    this
  );
}

// app/routes/index.tsx
var routes_exports = {};
__export(routes_exports, {
  default: () => Index2
});
var import_md5 = require("react-icons/md");
var import_jsx_dev_runtime16 = require("react/jsx-dev-runtime");
function Index2() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("h1", { className: "text-center", children: "Yes hello this is Yiffer" }, void 0, !1, {
      fileName: "app/routes/index.tsx",
      lineNumber: 7,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("p", { className: "text-center mx-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(
      Link,
      {
        href: "/contribute",
        text: "Contribute!",
        Icon: import_md5.MdStar,
        style: { fontSize: "6rem" }
      },
      void 0,
      !1,
      {
        fileName: "app/routes/index.tsx",
        lineNumber: 9,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/index.tsx",
      lineNumber: 8,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/index.tsx",
    lineNumber: 6,
    columnNumber: 5
  }, this);
}

// app/routes/login.tsx
var login_exports = {};
__export(login_exports, {
  action: () => action3,
  default: () => Signup2,
  loader: () => loader7
});
var import_auth_server2 = require("~/utils/auth.server.js");
var import_jsx_dev_runtime17 = require("react/jsx-dev-runtime");
function Signup2() {
  let fetcher = useGoodFetcher({
    method: "post",
    toastError: !1
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(fetcher.Form, { className: "max-w-xs mx-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("h1", { className: "text-3xl", children: "Log in" }, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("div", { className: "mt-4 flex flex-col gap-6", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(
        TextInputUncontrolled,
        {
          name: "username",
          label: "Username or email",
          autocomplete: "username",
          className: "mb-6 mt-4",
          type: "text"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/login.tsx",
          lineNumber: 26,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(
        TextInputUncontrolled,
        {
          name: "password",
          label: "Password - at least 6 characters",
          autocomplete: "password",
          type: "password",
          className: "mb-6"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/login.tsx",
          lineNumber: 34,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/login.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    fetcher.isError && /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(InfoBox, { variant: "error", text: fetcher.errorMessage, className: "my-2" }, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 44,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("div", { className: "flex", children: /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(
      LoadingButton,
      {
        text: "Log in",
        color: "primary",
        variant: "contained",
        className: "mt-2 mb-6",
        fullWidth: !0,
        isLoading: fetcher.isLoading,
        isSubmit: !0
      },
      void 0,
      !1,
      {
        fileName: "app/routes/login.tsx",
        lineNumber: 48,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(Link, { href: "/signup", text: "Sign up instead" }, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 59,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("br", {}, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 60,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(Link, { href: "/forgotten-password", text: "Forgotten password?" }, void 0, !1, {
      fileName: "app/routes/login.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/login.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}
async function loader7(args) {
  return await redirectIfLoggedIn(args), null;
}
async function action3(args) {
  let reqBody = await args.request.formData(), { username: formUsername, password: formPassword } = Object.fromEntries(reqBody);
  if (!formUsername || !formPassword)
    return create400Json("Missing username or password");
  let username = formUsername.toString().trim(), password = formPassword.toString().trim(), { err, redirect: redirect5, errorMessage } = await (0, import_auth_server2.login)(
    username,
    password,
    args.context.DB_API_URL_BASE,
    args.context.JWT_CONFIG_STR
  );
  if (err)
    return processApiError("Error in /login", err, { username, password });
  if (errorMessage)
    return createAnyErrorCodeJson(401, errorMessage);
  throw redirect5;
}

// app/routes/contribute/your-contributions/data-fetchers.ts
var data_fetchers_exports = {};
__export(data_fetchers_exports, {
  getYourComicProblems: () => getYourComicProblems,
  getYourComicSuggestions: () => getYourComicSuggestions,
  getYourContributedComics: () => getYourContributedComics,
  getYourTagSuggestions: () => getYourTagSuggestions
});

// app/types/contributions.ts
var CONTRIBUTION_POINTS = {
  tagSuggestion: {
    points: 5
  },
  comicProblem: {
    points: 10
  },
  comicSuggestion: {
    good: {
      points: 30,
      description: void 0
    },
    bad: {
      points: 15,
      description: "Lacking links/info"
    }
  },
  comicUpload: {
    excellent: {
      points: 200,
      description: void 0,
      scoreListDescription: "Uploaded comic, excellent info",
      actionDashboardDescription: "Excellent info",
      modPanelDescription: "No issues found"
    },
    "minor-issues": {
      points: 150,
      description: "Minor issues",
      scoreListDescription: "Uploaded comic, minor issues found (incorrect category/classification, wrong name)",
      actionDashboardDescription: "Minor issues",
      modPanelDescription: "Minor issues (e.g. incorrect category/classification, name spelling error)"
    },
    "major-issues": {
      points: 100,
      description: "Major issues",
      scoreListDescription: "Uploaded comic, major issues found (lacking artist links, poor tagging, bad thumbnail)",
      actionDashboardDescription: "Major issues",
      modPanelDescription: "Major issues (e.g. lacking artist links, poor tagging, bad thumbnail)"
    },
    "page-issues": {
      points: 50,
      description: "Page issues",
      scoreListDescription: "Uploaded comic, page issues (resolution, ordering, some premium pages uploaded)",
      actionDashboardDescription: "Page issues",
      modPanelDescription: "Page issues (poor resolution, wrong ordering, some premium pages uploaded)"
    },
    terrible: {
      points: 15,
      description: "Major page issues",
      scoreListDescription: "Uploaded comic, major page issues (most/all pages needed replacing)",
      actionDashboardDescription: "Major page issues",
      modPanelDescription: "Major page issues (most/all pages needs replacing)"
    },
    "rejected-list": {
      points: 0,
      description: void 0,
      scoreListDescription: "",
      actionDashboardDescription: "Rejected, added to ban list",
      modPanelDescription: "Reject submission due to the nature of the comic - add to ban list (click to read more)"
    },
    rejected: {
      points: 0,
      description: void 0,
      scoreListDescription: "",
      actionDashboardDescription: "Rejected",
      modPanelDescription: "Reject submission due to poorly provided info in the submission (click to read more)"
    }
  }
};

// app/routes/contribute/your-contributions/data-fetchers.ts
function publishStatusToContributionStatus(publishStatus) {
  switch (publishStatus) {
    case "uploaded":
      return "pending";
    case "rejected":
    case "rejected-list":
      return "rejected";
    default:
      return "approved";
  }
}
async function getYourContributedComics(urlBase, userId) {
  let dbComicsRes = await queryDb(urlBase, `SELECT 
      comic.name,
      timestamp,
      publishStatus,
      verdict,
      modComment,
      artist.name AS artistName,
      numberOfPages,
      COUNT(*) AS numberOfKeywords,
      comicmetadata.originalNameIfRejected,
      comicmetadata.originalArtistIfRejected
    FROM comic 
    INNER JOIN artist ON (artist.Id = comic.Artist)
    INNER JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
    LEFT JOIN comickeyword ON (comickeyword.comicId = comic.id)
    WHERE comicmetadata.uploadUserId = ?
    GROUP BY comic.name, timestamp, publishStatus, verdict, modComment, artistName, numberOfPages`, [userId]);
  return dbComicsRes.isError || !dbComicsRes.result ? makeDbErrObj(dbComicsRes, "Error getting your contributed comics", { userId }) : { contributions: dbComicsRes.result.map((dbComic) => {
    let { points, description } = dbComic.verdict ? CONTRIBUTION_POINTS.comicUpload[dbComic.verdict] : { points: 0, description: void 0 }, comicName = dbComic.name, artistName = dbComic.artistName;
    return dbComic.publishStatus === "rejected" && (dbComic.originalNameIfRejected && (comicName = dbComic.originalNameIfRejected || dbComic.name), dbComic.originalArtistIfRejected && (artistName = dbComic.originalArtistIfRejected)), {
      comicName,
      artistName,
      status: publishStatusToContributionStatus(dbComic.publishStatus),
      timestamp: dbComic.timestamp,
      points,
      pointsDescription: description,
      modComment: dbComic.modComment,
      type: "ContributedComic",
      numberOfPages: dbComic.numberOfPages,
      numberOfKeywords: dbComic.numberOfKeywords
    };
  }) };
}
async function getYourTagSuggestions(urlBase, userId) {
  let dbTagSuggRes = await queryDb(urlBase, `SELECT 
      comic.Name AS comicName,
      status,
      timestamp,
      keyword.KeywordName AS tagName,
      isAdding
    FROM keywordsuggestion
    INNER JOIN comic ON (comic.Id = keywordsuggestion.ComicId)
    INNER JOIN keyword ON (keyword.Id = keywordsuggestion.KeywordId)
    WHERE userId = ?;
  `, [userId]);
  return dbTagSuggRes.isError || !dbTagSuggRes.result ? makeDbErrObj(dbTagSuggRes, "Error getting your tag suggestions", { userId }) : { contributions: dbTagSuggRes.result.map((dbTagSuggestion) => ({
    comicName: dbTagSuggestion.comicName,
    status: dbTagSuggestion.status,
    timestamp: dbTagSuggestion.timestamp,
    suggestion: `${dbTagSuggestion.isAdding ? "ADD" : "REMOVE"} ${dbTagSuggestion.tagName}`,
    points: dbTagSuggestion.status === "approved" ? 5 : 0,
    pointsDescription: void 0,
    modComment: void 0,
    type: "TagSuggestion"
  })) };
}
async function getYourComicProblems(urlBase, userId) {
  let dbProblemsRes = await queryDb(urlBase, `SELECT
      comic.Name AS comicName,
      Status AS status,
      Timestamp AS timestamp,
      comicproblemcategory.Name AS problemCategory
    FROM comicproblem
    INNER JOIN comic ON (comic.Id = comicproblem.ComicId)
    INNER JOIN comicproblemcategory ON (comicproblemcategory.Id = comicproblem.ProblemCategoryId)
    WHERE UserId = ?;
  `, [userId]);
  return dbProblemsRes.isError || !dbProblemsRes.result ? makeDbErrObj(dbProblemsRes, "Error getting your comic problems", { userId }) : { contributions: dbProblemsRes.result.map((dbComicProblem) => ({
    comicName: dbComicProblem.comicName,
    status: dbComicProblem.status,
    timestamp: dbComicProblem.timestamp,
    points: dbComicProblem.status === "approved" ? 15 : void 0,
    pointsDescription: void 0,
    modComment: void 0,
    type: "ComicProblem",
    problemCategory: dbComicProblem.problemCategory
  })) };
}
async function getYourComicSuggestions(urlBase, userId) {
  let dbSuggestionsRes = await queryDb(urlBase, `SELECT
      Name AS comicName,
      timestamp,
      status,
      verdict,
      modComment
    FROM comicsuggestion
    WHERE UserId = ?;
  `, [userId]);
  return dbSuggestionsRes.isError || !dbSuggestionsRes.result ? makeDbErrObj(dbSuggestionsRes, "Error getting your comic suggestions", {
    userId
  }) : { contributions: dbSuggestionsRes.result.map(
    (dbComicSuggestion) => ({
      comicName: dbComicSuggestion.comicName,
      status: dbComicSuggestion.status,
      timestamp: dbComicSuggestion.timestamp,
      points: dbComicSuggestion.verdict ? CONTRIBUTION_POINTS.comicSuggestion[dbComicSuggestion.verdict].points : 0,
      pointsDescription: dbComicSuggestion.verdict ? CONTRIBUTION_POINTS.comicSuggestion[dbComicSuggestion.verdict].description : void 0,
      modComment: dbComicSuggestion.modComment,
      type: "ComicSuggestion"
    })
  ) };
}

// app/routes/contribute/upload/upload-handler.server.ts
var upload_handler_server_exports = {};
__export(upload_handler_server_exports, {
  processUpload: () => processUpload
});

// app/routes/api/funcs/add-contribution-points.ts
var add_contribution_points_exports = {};
__export(add_contribution_points_exports, {
  addContributionPoints: () => addContributionPoints
});
var import_date_fns = require("date-fns");
async function addContributionPoints(urlBase, userId, pointColumn) {
  let yearMonth = (0, import_date_fns.format)(/* @__PURE__ */ new Date(), "yyyy-MM"), logCtx = { userId, pointColumn, yearMonth }, existingDbRes = await queryDb(
    urlBase,
    `
    SELECT yearMonth FROM contributionpoints
    WHERE userId = ? AND (yearMonth = ? OR yearMonth = 'all-time')
  `,
    [userId, yearMonth]
  );
  if (existingDbRes.isError)
    return makeDbErr(existingDbRes, "Error adding contribution points", logCtx);
  ["all-time", yearMonth].forEach(async (timeVal) => {
    if (existingDbRes.result.filter(
      (entry2) => entry2.yearMonth === timeVal
    ).length === 0) {
      let insertPointsQuery = `
        INSERT INTO contributionpoints (userId, yearMonth, ${pointColumn})
        VALUES (?, ?, 1)
      `, insertDbRes = await queryDb(
        urlBase,
        insertPointsQuery,
        [userId, timeVal]
      );
      if (insertDbRes.isError)
        return makeDbErr(insertDbRes, "Error adding contribution points", logCtx);
    } else {
      let updatePointsQuery = `
        UPDATE contributionpoints
        SET ${pointColumn} = ${pointColumn} + 1
        WHERE userId = ? AND yearMonth = ?
      `, updateDbRes = await queryDb(
        urlBase,
        updatePointsQuery,
        [userId, timeVal]
      );
      if (updateDbRes.isError)
        return makeDbErr(updateDbRes, "Error updating contribution points", logCtx);
    }
  });
}

// app/routes/contribute/upload/upload-handler.server.ts
async function processUpload(urlBase, uploadBody, user, userIP) {
  let skipApproval = !!user && ["moderator", "admin"].includes(user?.userType);
  if (uploadBody.newArtist) {
    let { artistId, err: err2 } = await createArtist(
      urlBase,
      uploadBody.newArtist,
      skipApproval
    );
    if (err2)
      return wrapApiError(err2, "Error uploading", { uploadBody });
    uploadBody.artistId = artistId;
  }
  let { err, comicId } = await createComic(urlBase, uploadBody, skipApproval);
  if (err)
    return wrapApiError(err, "Error uploading", { uploadBody });
  if (err = await createComicMetadata(
    urlBase,
    comicId,
    uploadBody,
    skipApproval,
    user?.userId,
    userIP
  ), err)
    return wrapApiError(err, "Error uploading", { uploadBody });
  if (uploadBody.previousComic || uploadBody.nextComic) {
    let err2 = await createComicLinks(urlBase, uploadBody, comicId);
    if (err2)
      return wrapApiError(err2, "Error uploading", { uploadBody });
  }
  if (uploadBody.tagIds) {
    let err2 = await createComicTags(urlBase, uploadBody.tagIds, comicId);
    if (err2)
      return wrapApiError(err2, "Error uploading", { uploadBody });
  }
}
async function createComicTags(urlBase, tagIds, comicId) {
  let query = `
    INSERT INTO comickeyword
    (comicId, keywordId)
    VALUES 
  `, params = [];
  tagIds.forEach((tagId, index) => {
    query += "(?, ?)", params.push(comicId, tagId), index < tagIds.length - 1 && (query += ", ");
  });
  let dbRes = await queryDb(urlBase, query, params);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error creating comic tags");
}
async function createComicLinks(urlBase, uploadBody, comicId) {
  let query = `
    INSERT INTO comiclink
    (firstComic, lastComic)
    VALUES (?, ?)
  `, queryParams = [];
  uploadBody.previousComic && queryParams.push(uploadBody.previousComic.id, comicId), uploadBody.nextComic && queryParams.push(comicId, uploadBody.nextComic.id), uploadBody.previousComic && uploadBody.nextComic && (query += ", (?, ?)");
  let dbRes = await queryDb(urlBase, query, queryParams);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error creating comic links");
}
async function createComicMetadata(urlBase, comicId, uploadBody, skipApproval, userId, userIP) {
  let query = `
    INSERT INTO comicmetadata
    (comicId, uploadUserId, uploadUserIP, uploadId, verdict)
    VALUES (?, ?, ?, ?, ?)
  `, values = [
    comicId,
    userId || null,
    userIP || null,
    uploadBody.uploadId,
    skipApproval ? "excellent" : null
  ], dbRes = await queryDb(urlBase, query, values);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error creating comic metadata");
  if (skipApproval) {
    let err = await addContributionPoints(urlBase, userId, "comicUploadexcellent");
    if (err)
      return wrapApiError(err, "Error adding contribution points for direct mod upload");
  }
}
async function createComic(urlBase, uploadBody, skipApproval) {
  let query = `
    INSERT INTO comic
    (name, cat, tag, state, numberOfPages, artist, publishStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, values = [
    uploadBody.comicName.trim(),
    uploadBody.classification,
    uploadBody.category,
    uploadBody.state,
    uploadBody.numberOfPages,
    uploadBody.artistId,
    skipApproval ? "pending" : "uploaded"
  ], result = await queryDb(urlBase, query, values);
  return result.isError ? makeDbErrObj(result, "Error inserting comic") : result.insertId ? { comicId: result.insertId } : makeDbErrObj(result, "Error inserting comic: no insert ID");
}
async function createArtist(urlBase, newArtist, skipApproval) {
  let insertQuery = `
    INSERT INTO artist (name, e621name, patreonName, isPending)
    VALUES (?, ?, ?, ?)
  `, insertValues = [
    newArtist.artistName.trim(),
    newArtist.e621Name ? newArtist.e621Name.trim() : null,
    newArtist.patreonName ? newArtist.patreonName.trim() : null,
    skipApproval ? 0 : 1
  ], dbRes = await queryDb(urlBase, insertQuery, insertValues), artistId = dbRes.insertId;
  if (dbRes.isError || !artistId)
    return makeDbErrObj(dbRes, "Error inserting artist");
  if (newArtist.links && newArtist.links.length > 0) {
    let err = await createArtistLinks(urlBase, newArtist, artistId);
    if (err)
      return { err: wrapApiError(err, "Error creating artist links") };
  }
  return { artistId };
}
async function createArtistLinks(urlBase, newArtist, newArtistId) {
  let filteredLinks = newArtist.links.filter((link) => link.length > 0), linkInsertQuery = "INSERT INTO artistlink (ArtistId, LinkUrl) VALUES ", linkInsertValues = [];
  for (let i = 0; i < filteredLinks.length; i++)
    linkInsertQuery += "(?, ?)", linkInsertValues.push(newArtistId, filteredLinks[i].trim()), i < newArtist.links.length - 1 && (linkInsertQuery += ", ");
  let dbRes = await queryDb(urlBase, linkInsertQuery, linkInsertValues);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error inserting artist links");
}

// app/routes/api/admin/recalculate-publishing-queue.ts
var recalculate_publishing_queue_exports = {};
__export(recalculate_publishing_queue_exports, {
  action: () => action4
});

// app/routes/api/funcs/publishing-queue.ts
var publishing_queue_exports = {};
__export(publishing_queue_exports, {
  moveComicInQueue: () => moveComicInQueue,
  recalculatePublishingQueue: () => recalculatePublishingQueue
});
async function moveComicInQueue(urlBase, comicId, moveBy) {
  let logCtx = { comicId, moveBy }, positionDbRes = await queryDb(
    urlBase,
    "SELECT publishingQueuePos FROM comicmetadata WHERE comicId = ?",
    [comicId]
  );
  if (positionDbRes.isError || !positionDbRes.result)
    return makeDbErr(positionDbRes, "Error moving comic in publishing queue", logCtx);
  let oldPos = positionDbRes.result[0].publishingQueuePos, moveComicQuery = "UPDATE comicmetadata SET publishingQueuePos = ? WHERE comicId = ?", moveComicQueryParams = [oldPos + moveBy, comicId], moveOtherComicQuery = "UPDATE comicmetadata SET publishingQueuePos = ? WHERE publishingQueuePos = ?", moveOtherComicQueryParams = [oldPos, oldPos + moveBy], moveOtherDbRes = await queryDb(
    urlBase,
    moveOtherComicQuery,
    moveOtherComicQueryParams
  );
  if (moveOtherDbRes.isError)
    return makeDbErr(
      moveOtherDbRes,
      "Error moving other comic in publishing queue",
      logCtx
    );
  let moveComicDbRes = await queryDb(urlBase, moveComicQuery, moveComicQueryParams);
  if (moveComicDbRes.isError)
    return makeDbErr(
      moveComicDbRes,
      "Error moving this comic in publishing queue",
      logCtx
    );
}
async function recalculatePublishingQueue(urlBase) {
  let queueDbRes = await queryDb(urlBase, `
    SELECT publishingQueuePos, comicId
    FROM comicmetadata INNER JOIN comic ON (comic.id = comicmetadata.comicId)
    WHERE
      publishStatus = 'scheduled'
      AND publishDate IS NULL
    ORDER BY publishingQueuePos ASC
  `);
  if (queueDbRes.isError)
    return makeDbErr(queueDbRes, "Error getting comics in queue");
  let queue = queueDbRes.result, comicsWithPos = queue.filter((comic) => comic.publishingQueuePos !== null), comicsWithoutPos = queue.filter((comic) => comic.publishingQueuePos === null), newQueue = comicsWithPos.sort((a, b) => a.publishingQueuePos - b.publishingQueuePos).map((comic, index) => ({
    ...comic,
    publishingQueuePos: index + 1
  })).concat(
    comicsWithoutPos.map((comic, index) => ({
      ...comic,
      publishingQueuePos: comicsWithPos.length + index + 1
    }))
  ), comicsToUpdate = [];
  for (let comic of queue) {
    let newQueuePos = newQueue.find(
      (newComic) => newComic.comicId === comic.comicId
    )?.publishingQueuePos;
    newQueuePos !== comic.publishingQueuePos && comicsToUpdate.push({
      comicId: comic.comicId,
      newQueuePos
    });
  }
  let updateQuery = `
    UPDATE comicmetadata
    SET publishingQueuePos = ?
    WHERE comicId = ?
  `, updatePromises = comicsToUpdate.map(
    (comic) => queryDb(urlBase, updateQuery, [comic.newQueuePos, comic.comicId])
  ), updateDbRes = await Promise.all(updatePromises);
  for (let result of updateDbRes)
    if (result.isError)
      return makeDbErr(result, "Error updating queue position of pending comic");
}

// app/routes/api/admin/recalculate-publishing-queue.ts
async function action4(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, err = await recalculatePublishingQueue(urlBase);
  return err ? processApiError("Error recalculating publishing queue from API endpoint", err) : createSuccessJson();
}

// app/routes/contribute/upload/step3-pagemanager.tsx
var step3_pagemanager_exports = {};
__export(step3_pagemanager_exports, {
  default: () => Step3Pagemanager
});
var import_react21 = require("react");

// app/utils/general.ts
function capitalizeString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
async function waitMillisec(millisec) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), millisec);
  });
}
function randomString(i) {
  let text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let j = 0; j < i; j++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
async function getFilesWithBase64(files) {
  let filePromises = Array.from(files).map((file) => getFileWithBase64(file));
  return Promise.all(filePromises);
}
async function getFileWithBase64(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      reader.result && resolve({ base64: reader.result.toString(), file });
    }, reader.onerror = () => {
      reject(reader.error);
    }, reader.readAsDataURL(file);
  });
}
function isUsernameUrl(str) {
  return !!(str.includes("http:") || str.includes("https:") || str.includes("www.") || str.includes(".com") || str.includes(".net"));
}

// app/components/PageManager/PageManager.tsx
var import_react_grid_dnd = require("react-grid-dnd"), import_react19 = require("react");
var import_md6 = require("react-icons/md");

// app/components/Buttons/IconButton.tsx
var import_jsx_dev_runtime18 = require("react/jsx-dev-runtime");
function IconButton({ icon, className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)(
    Button,
    {
      ...props,
      startIcon: icon,
      noPadding: !0,
      className: `rounded-full w-8 h-8 p-0 text-base ${className}`,
      text: "",
      style: { paddingTop: "2px" }
    },
    void 0,
    !1,
    {
      fileName: "app/components/Buttons/IconButton.tsx",
      lineNumber: 9,
      columnNumber: 5
    },
    this
  );
}

// app/components/PageManager/PageManager.tsx
var import_jsx_dev_runtime19 = require("react/jsx-dev-runtime"), RATIO = Math.round(400 / 564), PAGE_NAME_HEIGHT = 40, PAGES_SPACING = 4;
function PageManager({ files, onChange }) {
  let gridContainerRef = (0, import_react19.useRef)(), { width, isMobile } = useWindowSize(), [hoveredPageNum, setHoveredPageNum] = (0, import_react19.useState)(), [isHalfSize, setIsHalfSize] = (0, import_react19.useState)(!1), [fullSizeImage, setFullSizeImage] = (0, import_react19.useState)(void 0), lastDragEndTime = (0, import_react19.useRef)(0), isDragging = (0, import_react19.useRef)(!1), PAGE_IMG_HEIGHT = isMobile ? 100 : 160;
  isHalfSize && (PAGE_IMG_HEIGHT = PAGE_IMG_HEIGHT / 2);
  let PAGE_CONTAINER_HEIGHT = PAGE_IMG_HEIGHT + PAGE_NAME_HEIGHT, PAGE_IMG_WIDTH = PAGE_IMG_HEIGHT * RATIO;
  function onDragEnd(_, sourceIndex, targetIndex) {
    if (lastDragEndTime.current = Date.now(), sourceIndex === targetIndex)
      return;
    let newFiles = (0, import_react_grid_dnd.swap)(files, sourceIndex, targetIndex);
    onChange(newFiles);
  }
  let dragdropSizing = (0, import_react19.useMemo)(() => {
    if (!gridContainerRef?.current)
      return { containerHeight: 1, pagesPerRow: 1 };
    let containerWidth = gridContainerRef?.current.clientWidth, pagesPerRow = Math.floor(containerWidth / (PAGE_IMG_WIDTH + PAGES_SPACING)), containerHeight = Math.ceil(files.length / pagesPerRow) * (PAGE_CONTAINER_HEIGHT + PAGES_SPACING);
    return { pagesPerRow, containerHeight };
  }, [width, files, PAGE_IMG_HEIGHT]);
  function deleteImage(imageIndex) {
    let newFiles = [...files];
    newFiles.splice(imageIndex, 1), onChange(newFiles);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(import_jsx_dev_runtime19.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
      Button,
      {
        variant: "outlined",
        onClick: () => setIsHalfSize(!isHalfSize),
        text: isHalfSize ? "Larger" : "Smaller",
        className: "mb-2"
      },
      void 0,
      !1,
      {
        fileName: "app/components/PageManager/PageManager.tsx",
        lineNumber: 58,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { ref: gridContainerRef, children: /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(import_react_grid_dnd.GridContextProvider, { onChange: onDragEnd, children: /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
      import_react_grid_dnd.GridDropZone,
      {
        id: "pages",
        boxesPerRow: dragdropSizing.pagesPerRow,
        rowHeight: PAGE_CONTAINER_HEIGHT + PAGES_SPACING,
        style: {
          height: dragdropSizing.containerHeight
        },
        children: files.map((file, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
          import_react_grid_dnd.GridItem,
          {
            style: {
              height: PAGE_CONTAINER_HEIGHT + PAGES_SPACING,
              width: PAGE_IMG_WIDTH + PAGES_SPACING
            },
            onMouseEnter: () => setHoveredPageNum(index),
            onMouseLeave: () => setHoveredPageNum(void 0),
            className: "flex justify-center items-center",
            onClick: () => {
              isDragging.current || Date.now() - lastDragEndTime.current < 200 || setFullSizeImage(file);
            },
            onDragStart: () => isDragging.current = !0,
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
                IconButton,
                {
                  onClick: () => deleteImage(index),
                  icon: import_md6.MdDelete,
                  color: "error",
                  className: `
                    absolute top-1 right-1 
                    ${isMobile || hoveredPageNum === index ? "visible" : "invisible"}
                  `
                },
                void 0,
                !1,
                {
                  fileName: "app/components/PageManager/PageManager.tsx",
                  lineNumber: 92,
                  columnNumber: 17
                },
                this
              ),
              /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "h-full flex flex-col items-center justify-center hover:cursor-move", children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
                  "img",
                  {
                    src: file.url || file.base64,
                    height: PAGE_IMG_HEIGHT,
                    style: {
                      objectFit: "cover",
                      maxHeight: PAGE_IMG_HEIGHT,
                      maxWidth: PAGE_IMG_WIDTH
                    },
                    draggable: !1
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/components/PageManager/PageManager.tsx",
                    lineNumber: 102,
                    columnNumber: 19
                  },
                  this
                ),
                /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
                  "p",
                  {
                    className: "whitespace-pre-wrap break-all overflow-ellipsis overflow-hidden leading-none",
                    style: { height: PAGE_NAME_HEIGHT, width: PAGE_IMG_WIDTH },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("span", { className: "mr-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("b", { children: index + 1 }, void 0, !1, {
                        fileName: "app/components/PageManager/PageManager.tsx",
                        lineNumber: 117,
                        columnNumber: 23
                      }, this) }, void 0, !1, {
                        fileName: "app/components/PageManager/PageManager.tsx",
                        lineNumber: 116,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("span", { className: "text-xs", children: file.file?.name || file.url }, void 0, !1, {
                        fileName: "app/components/PageManager/PageManager.tsx",
                        lineNumber: 119,
                        columnNumber: 21
                      }, this)
                    ]
                  },
                  void 0,
                  !0,
                  {
                    fileName: "app/components/PageManager/PageManager.tsx",
                    lineNumber: 112,
                    columnNumber: 19
                  },
                  this
                )
              ] }, void 0, !0, {
                fileName: "app/components/PageManager/PageManager.tsx",
                lineNumber: 101,
                columnNumber: 17
              }, this)
            ]
          },
          file.file?.name || file.url || index,
          !0,
          {
            fileName: "app/components/PageManager/PageManager.tsx",
            lineNumber: 76,
            columnNumber: 15
          },
          this
        ))
      },
      void 0,
      !1,
      {
        fileName: "app/components/PageManager/PageManager.tsx",
        lineNumber: 67,
        columnNumber: 11
      },
      this
    ) }, void 0, !1, {
      fileName: "app/components/PageManager/PageManager.tsx",
      lineNumber: 66,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/PageManager/PageManager.tsx",
      lineNumber: 65,
      columnNumber: 7
    }, this),
    fullSizeImage && /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
      "div",
      {
        className: "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50",
        onClick: () => setFullSizeImage(void 0),
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(
          "img",
          {
            src: fullSizeImage.url || fullSizeImage.base64,
            style: { maxHeight: "90%", maxWidth: "90%" }
          },
          void 0,
          !1,
          {
            fileName: "app/components/PageManager/PageManager.tsx",
            lineNumber: 133,
            columnNumber: 11
          },
          this
        )
      },
      void 0,
      !1,
      {
        fileName: "app/components/PageManager/PageManager.tsx",
        lineNumber: 129,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/PageManager/PageManager.tsx",
    lineNumber: 57,
    columnNumber: 5
  }, this);
}

// app/routes/contribute/upload/step3-pagemanager.tsx
var import_md7 = require("react-icons/md");

// app/components/FileInput.tsx
var import_react20 = require("react"), import_jsx_dev_runtime20 = require("react/jsx-dev-runtime"), FileInput = (0, import_react20.forwardRef)(
  (props, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)("label", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime20.jsxDEV)(
    "input",
    {
      type: "file",
      ref,
      className: `text-sm text-grey-500 file:mr-5 file:py-3 file:px-10 file:transition-all file:duration-100
          file:rounded file:border-0 file:text-md file:font-semibold file:text-white
          file:bg-blue-weak-200 file:hover:bg-blue-weak-100
          file:focus:bg-blue-weak-100 
          file:dark:bg-blue-strong-200 file:dark:hover:bg-blue-strong-100
          file:dark:focus:bg-blue-strong-100
          hover:file:cursor-pointer file:shadow file:hover:file:shadow-md
          file:focus:file:shadow-md`,
      ...props
    },
    void 0,
    !1,
    {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 10,
      columnNumber: 9
    },
    this
  ) }, void 0, !1, {
    fileName: "app/components/FileInput.tsx",
    lineNumber: 9,
    columnNumber: 7
  }, this)
), FileInput_default = FileInput;

// app/routes/contribute/upload/step3-pagemanager.tsx
var import_jsx_dev_runtime21 = require("react/jsx-dev-runtime");
function Step3Pagemanager({ comicData, onUpdate }) {
  let { isMobile } = useWindowSize(), [isClearingPages, setIsClearingPages] = (0, import_react21.useState)(!1), [isLoadingFileContents, setIsLoadingFileContents] = (0, import_react21.useState)(!1);
  async function onFileChange(event) {
    if (event.target.files) {
      setIsLoadingFileContents(!0);
      let filesWithString = await getFilesWithBase64(event.target.files);
      setIsLoadingFileContents(!1), onUpdate({ ...comicData, files: filesWithString });
    }
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(import_jsx_dev_runtime21.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)("h4", { className: "mt-8", children: "Pages" }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this),
    comicData.files.length === 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(FileInput_default, { onChange: onFileChange, multiple: !0, accept: "image/*" }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
      lineNumber: 34,
      columnNumber: 9
    }, this),
    (comicData.files.length > 0 || isLoadingFileContents) && /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)("p", { className: "mb-2", children: [
      isMobile ? "Tap" : "Click",
      " an image to see it full size. Make sure the pages are correctly ordered."
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
      lineNumber: 38,
      columnNumber: 9
    }, this),
    isLoadingFileContents && /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)("p", { children: "Processing files..." }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
      lineNumber: 44,
      columnNumber: 33
    }, this),
    comicData.files.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(import_jsx_dev_runtime21.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(
        PageManager,
        {
          files: comicData.files,
          onChange: (newFiles) => onUpdate({ ...comicData, files: newFiles })
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
          lineNumber: 48,
          columnNumber: 11
        },
        this
      ),
      !isClearingPages && /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(
        Button,
        {
          variant: "outlined",
          text: "Clear pages",
          onClick: () => setIsClearingPages(!0),
          startIcon: import_md7.MdClear,
          className: "mt-2"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
          lineNumber: 54,
          columnNumber: 13
        },
        this
      ),
      isClearingPages && /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)("div", { className: "flex flex-row gap-2 mt-2", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(
          Button,
          {
            variant: "outlined",
            onClick: () => setIsClearingPages(!1),
            text: "Cancel",
            startIcon: import_md7.MdClear
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
            lineNumber: 64,
            columnNumber: 15
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime21.jsxDEV)(
          Button,
          {
            text: "Clear pages",
            color: "error",
            onClick: () => {
              onUpdate({ ...comicData, files: [] }), setIsClearingPages(!1);
            },
            startIcon: import_md7.MdClear
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
            lineNumber: 70,
            columnNumber: 15
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
        lineNumber: 63,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
      lineNumber: 47,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/upload/step3-pagemanager.tsx",
    lineNumber: 30,
    columnNumber: 5
  }, this);
}

// app/routes/contribute/your-contributions/index.tsx
var your_contributions_exports = {};
__export(your_contributions_exports, {
  default: () => YourContributions,
  loader: () => loader9
});
var import_react25 = require("@remix-run/react"), import_react26 = require("react"), import_md10 = require("react-icons/md");

// app/components/Table/Table.tsx
var import_jsx_dev_runtime22 = require("react/jsx-dev-runtime");
function Table({
  horizontalScroll,
  maxHeight,
  children,
  className = ""
}) {
  let horizontalScrollClass = "overflow-x-auto max-w-full whitespace-nowrap ", verticalScrollStyle = maxHeight ? { maxHeight } : {}, fullClassName = `
    w-fit
    ${className} ${horizontalScroll ? horizontalScrollClass : ""}
  `;
  return horizontalScroll || maxHeight ? /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)("div", { className: fullClassName, style: verticalScrollStyle, children: /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)("table", { children }, void 0, !1, {
    fileName: "app/components/Table/Table.tsx",
    lineNumber: 25,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "app/components/Table/Table.tsx",
    lineNumber: 24,
    columnNumber: 7
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime22.jsxDEV)("table", { className: fullClassName, children }, void 0, !1, {
    fileName: "app/components/Table/Table.tsx",
    lineNumber: 30,
    columnNumber: 10
  }, this);
}

// app/components/Table/TableBody.tsx
var import_jsx_dev_runtime23 = require("react/jsx-dev-runtime");
function TableBody({ children, className }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime23.jsxDEV)("tbody", { className, children }, void 0, !1, {
    fileName: "app/components/Table/TableBody.tsx",
    lineNumber: 7,
    columnNumber: 10
  }, this);
}

// app/components/Table/TableCell.tsx
var import_jsx_dev_runtime24 = require("react/jsx-dev-runtime");
function TableCell({
  maxWidth,
  colspan,
  children,
  className = ""
}) {
  let style = maxWidth ? { maxWidth } : {}, fullClassName = `py-2 px-3 ${maxWidth ? "whitespace-pre-wrap" : ""} ${className}`;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime24.jsxDEV)("td", { className: fullClassName, style, colSpan: colspan, children }, void 0, !1, {
    fileName: "app/components/Table/TableCell.tsx",
    lineNumber: 18,
    columnNumber: 5
  }, this);
}

// app/components/Table/TableHeadRow.tsx
var import_jsx_dev_runtime25 = require("react/jsx-dev-runtime");
function TableHeadRow({
  isTableMaxHeight = !1,
  children,
  className = ""
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)("thead", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime25.jsxDEV)(
    "tr",
    {
      className: `bg-gray-900 dark:bg-gray-300 text-left border-b
    border-gray-borderLight font-bold ${className} ${isTableMaxHeight ? "sticky top-0" : ""}`,
      children
    },
    void 0,
    !1,
    {
      fileName: "app/components/Table/TableHeadRow.tsx",
      lineNumber: 18,
      columnNumber: 7
    },
    this
  ) }, void 0, !1, {
    fileName: "app/components/Table/TableHeadRow.tsx",
    lineNumber: 17,
    columnNumber: 5
  }, this);
}

// app/components/Table/TableRow.tsx
var import_jsx_dev_runtime26 = require("react/jsx-dev-runtime");
function TableRow({ children, className = "" }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime26.jsxDEV)("tr", { className: `border-b border-gray-borderLight ${className}`, children }, void 0, !1, {
    fileName: "app/components/Table/TableRow.tsx",
    lineNumber: 7,
    columnNumber: 10
  }, this);
}

// app/routes/contribute/BackToContribute.tsx
var BackToContribute_exports = {};
__export(BackToContribute_exports, {
  default: () => BackToContribute
});
var import_md8 = require("react-icons/md");
var import_jsx_dev_runtime27 = require("react/jsx-dev-runtime");
function BackToContribute({}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime27.jsxDEV)(Link, { href: "/contribute", text: "Back", Icon: import_md8.MdArrowBack }, void 0, !1, {
    fileName: "app/routes/contribute/BackToContribute.tsx",
    lineNumber: 5,
    columnNumber: 10
  }, this);
}

// app/routes/contribute/scoreboard/index.tsx
var scoreboard_exports = {};
__export(scoreboard_exports, {
  PointInfo: () => PointInfo,
  action: () => action5,
  default: () => Scoreboard,
  loader: () => loader8
});
var import_react23 = require("@remix-run/react"), import_date_fns2 = require("date-fns"), import_react24 = require("react"), import_md9 = require("react-icons/md");

// app/components/Checkbox/Checkbox.tsx
var import_fa = require("react-icons/fa"), import_react22 = require("react"), import_jsx_dev_runtime28 = require("react/jsx-dev-runtime");
function Checkbox({
  label,
  checked,
  disabled,
  onChange,
  className = "",
  ...props
}) {
  let [lastChange, setLastChange] = (0, import_react22.useState)({
    type: "",
    time: 0
  }), fullClassname = `block relative select-none pl-8 
    outline-none w-fit ${disabled ? "text-gray-700" : "hover:cursor-pointer"} ${className} `;
  function onKeyPressed(keyEvent) {
    (keyEvent.key === "Enter" || keyEvent.key === " ") && (onChange(!checked), setLastChange({
      type: "key",
      time: Date.now()
    }));
  }
  function onStateChange(newVal) {
    lastChange.type === "key" && Date.now() - lastChange.time < 300 || (onChange(newVal), setLastChange({
      type: "internal",
      time: Date.now()
    }));
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime28.jsxDEV)("label", { className: fullClassname, ...props, onKeyPress: (e) => onKeyPressed(e), children: [
    label,
    /* @__PURE__ */ (0, import_jsx_dev_runtime28.jsxDEV)(
      "input",
      {
        type: "checkbox",
        checked,
        onChange: (e) => onStateChange(e.target.checked),
        disabled,
        className: "absolute opacity-0 cursor-pointer h-0 w-0 peer"
      },
      void 0,
      !1,
      {
        fileName: "app/components/Checkbox/Checkbox.tsx",
        lineNumber: 63,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime28.jsxDEV)("span", { className: "absolute top-0 left-0 h-6 w-6 border-2 border-theme1-primary peer-focus:border-theme1-verydark peer-checked:bg-theme1-primary rounded-sm flex justify-center items-center peer-disabled:bg-trans peer-disabled:border-gray-800 dark:peer-disabled:border-gray-600", children: checked && /* @__PURE__ */ (0, import_jsx_dev_runtime28.jsxDEV)(import_fa.FaCheck, { className: "mt-0.5 text-white dark:text-text-light", size: 16 }, void 0, !1, {
      fileName: "app/components/Checkbox/Checkbox.tsx",
      lineNumber: 73,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/components/Checkbox/Checkbox.tsx",
      lineNumber: 71,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Checkbox/Checkbox.tsx",
    lineNumber: 60,
    columnNumber: 5
  }, this);
}

// app/components/Spinner.tsx
var import_jsx_dev_runtime29 = require("react/jsx-dev-runtime");
function Spinner() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime29.jsxDEV)("div", { role: "status", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime29.jsxDEV)(
      "svg",
      {
        "aria-hidden": "true",
        className: "w-8 h-8 mr-2 text-gray-900 animate-spin dark:text-gray-600 fill-theme1-dark dark:fill-theme1-primary",
        viewBox: "0 0 100 101",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime29.jsxDEV)(
            "path",
            {
              d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z",
              fill: "currentColor"
            },
            void 0,
            !1,
            {
              fileName: "app/components/Spinner.tsx",
              lineNumber: 11,
              columnNumber: 9
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime29.jsxDEV)(
            "path",
            {
              d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z",
              fill: "currentFill"
            },
            void 0,
            !1,
            {
              fileName: "app/components/Spinner.tsx",
              lineNumber: 15,
              columnNumber: 9
            },
            this
          )
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/components/Spinner.tsx",
        lineNumber: 4,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime29.jsxDEV)("span", { className: "sr-only", children: "Loading..." }, void 0, !1, {
      fileName: "app/components/Spinner.tsx",
      lineNumber: 20,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Spinner.tsx",
    lineNumber: 3,
    columnNumber: 5
  }, this);
}

// app/components/Username.tsx
var import_ri = require("react-icons/ri");
var import_jsx_dev_runtime30 = require("react/jsx-dev-runtime"), Username = ({ user, className }) => {
  let { username, userType } = user, isMod = userType === "moderator" /* Mod */, isAdmin = userType === "admin" /* Admin */, title = isMod ? "Moderator" : isAdmin ? "Admin" : "", Icon = isAdmin ? import_ri.RiShieldStarFill : isMod ? import_ri.RiShieldFill : null;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime30.jsxDEV)("p", { title, className, children: [
    username,
    Icon && /* @__PURE__ */ (0, import_jsx_dev_runtime30.jsxDEV)(Icon, { className: "ml-1 text-theme1-primary" }, void 0, !1, {
      fileName: "app/components/Username.tsx",
      lineNumber: 22,
      columnNumber: 16
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Username.tsx",
    lineNumber: 20,
    columnNumber: 5
  }, this);
}, Username_default = Username;

// app/routes/contribute/scoreboard/index.tsx
var import_jsx_dev_runtime31 = require("react/jsx-dev-runtime");
function Scoreboard() {
  let fetcher = useGoodFetcher({
    method: "post",
    onFinish: () => {
      setPoints(fetcher.data || []), setCachedPoints((prev) => [
        ...prev,
        {
          yearMonth: showAllTime ? "all-time" : (0, import_date_fns2.format)(date, "yyyy-MM"),
          excludeMods,
          points: fetcher.data || []
        }
      ]);
    }
  }), allTimePoints = (0, import_react23.useLoaderData)(), [showPointInfo, setShowPointInfo] = (0, import_react24.useState)(!1), [showAllTime, setShowAllTime] = (0, import_react24.useState)(!1), [excludeMods, setExcludeMods] = (0, import_react24.useState)(!1), [date, setDate] = (0, import_react24.useState)(/* @__PURE__ */ new Date()), [points, setPoints] = (0, import_react24.useState)(
    allTimePoints.topScores || []
  ), [cachedPoints, setCachedPoints] = (0, import_react24.useState)([
    {
      yearMonth: (0, import_date_fns2.format)(/* @__PURE__ */ new Date(), "yyyy-MM"),
      excludeMods: !1,
      points: allTimePoints.topScores || []
    }
  ]);
  function changeDisplayInterval(incrementBy, setAllTime, newExcludeMods) {
    let newDate = /* @__PURE__ */ new Date();
    incrementBy === 1 && (newDate = (0, import_date_fns2.add)(date, { months: 1 }), setDate(newDate)), incrementBy === -1 && (newDate = (0, import_date_fns2.sub)(date, { months: 1 }), setDate(newDate)), setAllTime !== void 0 && setShowAllTime(setAllTime), newExcludeMods !== void 0 && setExcludeMods(newExcludeMods);
    let excludeMonthsValForQuery = newExcludeMods === void 0 ? excludeMods : newExcludeMods, yearMonth = (0, import_date_fns2.format)(date, "yyyy-MM");
    setAllTime && (yearMonth = "all-time"), incrementBy !== void 0 && (yearMonth = (0, import_date_fns2.format)(newDate, "yyyy-MM"));
    let foundCachedPoints = cachedPoints.find(
      (cp) => cp.yearMonth === yearMonth && cp.excludeMods === excludeMonthsValForQuery
    );
    if (foundCachedPoints) {
      setPoints(foundCachedPoints.points);
      return;
    }
    fetcher.submit({ yearMonth, excludeMods: excludeMonthsValForQuery.toString() });
  }
  let canIncrementMonth = !(date.getMonth() === (/* @__PURE__ */ new Date()).getMonth() && date.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear()) && !fetcher.isLoading;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("div", { className: "container mx-auto justify-items-center", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("h1", { className: "text-center mb-2", children: "Contributions scoreboard" }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 121,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: "text-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(BackToContribute, {}, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 123,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 122,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: "mb-4 text-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(Link, { href: "https://yiffer.xyz/", text: "To front page", Icon: import_md9.MdHome }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 126,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 125,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { children: "Points are awarded only when a contribution has been approved or accepted by a mod." }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 129,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: "mb-6", children: "Currently, these points can't be used for anything, and there are no concrete plans to change this, but who knows what the future holds?" }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 133,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: "text-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
      "button",
      {
        onClick: () => setShowPointInfo(!showPointInfo),
        className: `w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
          bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
          dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
          focus:no-underline cursor-pointer bg-[length:0%_1px] transition-[background-size]
          duration-200 bg-[center_bottom] hover:bg-[length:100%_1px]`,
        children: [
          showPointInfo ? "Hide" : "Show",
          " point info",
          " ",
          showPointInfo ? /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(import_md9.MdArrowDropUp, {}, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 148,
            columnNumber: 28
          }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(import_md9.MdArrowDropDown, {}, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 148,
            columnNumber: 48
          }, this)
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/routes/contribute/scoreboard/index.tsx",
        lineNumber: 139,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 138,
      columnNumber: 7
    }, this),
    showPointInfo && /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(PointInfo, {}, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 152,
      columnNumber: 25
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("div", { className: "flex flex-col justify-center items-center w-fit mx-auto mt-8", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
        Checkbox,
        {
          label: "Include mods",
          checked: !excludeMods,
          onChange: () => changeDisplayInterval(void 0, void 0, !excludeMods),
          className: "mb-4"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/scoreboard/index.tsx",
          lineNumber: 155,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("div", { className: "flex mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
          Button,
          {
            text: "Monthly",
            variant: "contained",
            color: "primary",
            className: "rounded-r-none" + disabledClass + (showAllTime ? "" : enabledClass),
            onClick: () => changeDisplayInterval(void 0, !1, void 0)
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 163,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
          Button,
          {
            text: "All time",
            variant: "contained",
            color: "primary",
            className: "rounded-l-none" + disabledClass + (showAllTime ? enabledClass : ""),
            onClick: () => changeDisplayInterval(void 0, !0, void 0)
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 172,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/scoreboard/index.tsx",
        lineNumber: 162,
        columnNumber: 9
      }, this),
      !showAllTime && /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("div", { className: "flex justify-between items-center w-fit mb-2 text-lg", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
          IconButton,
          {
            icon: import_md9.MdArrowBack,
            onClick: () => changeDisplayInterval(-1, !1, void 0),
            disabled: fetcher.isLoading,
            variant: "naked"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 185,
            columnNumber: 13
          },
          this
        ),
        (0, import_date_fns2.format)(date, "MMM y"),
        /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
          IconButton,
          {
            icon: import_md9.MdArrowForward,
            onClick: () => changeDisplayInterval(1, !1, void 0),
            disabled: !canIncrementMonth,
            variant: "naked"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 194,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/scoreboard/index.tsx",
        lineNumber: 184,
        columnNumber: 11
      }, this),
      fetcher.isLoading && /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(Spinner, {}, void 0, !1, {
        fileName: "app/routes/contribute/scoreboard/index.tsx",
        lineNumber: 203,
        columnNumber: 31
      }, this),
      points.length === 0 && !fetcher.isLoading && /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { children: "There are contributions for this month." }, void 0, !1, {
        fileName: "app/routes/contribute/scoreboard/index.tsx",
        lineNumber: 206,
        columnNumber: 11
      }, this),
      points.length > 0 && !fetcher.isLoading && /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(Table, { className: "mb-6", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(TableHeadRow, { isTableMaxHeight: !0, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(TableCell, { children: "User" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 212,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(TableCell, { children: "Score" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 213,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/scoreboard/index.tsx",
          lineNumber: 211,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(TableBody, { children: points.map((point, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
            Username_default,
            {
              user: {
                username: point.username,
                id: point.userId,
                userType: point.userType
              }
            },
            void 0,
            !1,
            {
              fileName: "app/routes/contribute/scoreboard/index.tsx",
              lineNumber: 219,
              columnNumber: 21
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 218,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(TableCell, { children: point.points }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 227,
            columnNumber: 19
          }, this)
        ] }, i, !0, {
          fileName: "app/routes/contribute/scoreboard/index.tsx",
          lineNumber: 217,
          columnNumber: 17
        }, this)) }, void 0, !1, {
          fileName: "app/routes/contribute/scoreboard/index.tsx",
          lineNumber: 215,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/scoreboard/index.tsx",
        lineNumber: 210,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 154,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/scoreboard/index.tsx",
    lineNumber: 120,
    columnNumber: 5
  }, this);
}
async function loader8(args) {
  let scoresRes = await getTopScores(args.context.DB_API_URL_BASE, "all-time", !1);
  return scoresRes.err ? processApiError("Error in loader of contribution scoreboard", scoresRes.err) : scoresRes;
}
async function action5(args) {
  let reqBody = await args.request.formData(), { yearMonth, excludeMods } = Object.fromEntries(reqBody), res = await getTopScores(
    args.context.DB_API_URL_BASE,
    yearMonth.toString(),
    excludeMods === "true"
  );
  return res.err ? processApiError("Error in action of contribution scoreboard", res.err) : {
    success: !0,
    data: res.topScores,
    error: null
  };
}
async function getTopScores(urlBase, yearMonth, excludeMods) {
  let dbRes = await queryDb(urlBase, `
    SELECT 
      user.id AS userId, 
      user.username,
      user.userType,
      tagSuggestion,
      comicProblem,
      comicSuggestiongood,
      comicSuggestionbad,
      comicUploadexcellent,
      comicUploadminorissues,
      comicUploadmajorissues,
      comicUploadpageissues,
      comicUploadterrible
    FROM contributionpoints
    INNER JOIN user ON (user.id = contributionpoints.userId)
    WHERE yearMonth = ?
    ${excludeMods ? "AND userType != 'moderator' AND userType != 'admin'" : ""}
  `, [yearMonth]);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting top score list", {
    yearMonth,
    excludeMods
  }) : {
    topScores: topScoreEntriesToPointList(dbRes.result)
  };
}
function topScoreEntriesToPointList(entries) {
  return entries.map((userContrib) => {
    let points = userContrib.tagSuggestion * CONTRIBUTION_POINTS.tagSuggestion.points + userContrib.comicProblem * CONTRIBUTION_POINTS.comicProblem.points + userContrib.comicSuggestiongood * CONTRIBUTION_POINTS.comicSuggestion.good.points + userContrib.comicSuggestionbad * CONTRIBUTION_POINTS.comicSuggestion.bad.points + userContrib.comicUploadexcellent * CONTRIBUTION_POINTS.comicUpload.excellent.points + userContrib.comicUploadminorissues * CONTRIBUTION_POINTS.comicUpload["minor-issues"].points + userContrib.comicUploadmajorissues * CONTRIBUTION_POINTS.comicUpload["major-issues"].points + userContrib.comicUploadpageissues * CONTRIBUTION_POINTS.comicUpload["page-issues"].points + userContrib.comicUploadterrible * CONTRIBUTION_POINTS.comicUpload.terrible.points;
    return {
      userId: userContrib.userId,
      username: userContrib.username,
      userType: userContrib.userType,
      points
    };
  });
}
var pInfoColors = {
  pValues: {
    green: "dark:text-green-600 text-green-700",
    blue: "dark:text-blue-600 text-blue-700",
    purple: "dark:text-purple-600 text-purple-700",
    yellow: "dark:text-yellow-500 text-yellow-600"
  },
  pDescriptions: {
    green: "dark:text-green-400 text-green-600",
    blue: "dark:text-blue-400 text-blue-600",
    purple: "dark:text-purple-400 text-purple-600",
    yellow: "dark:text-yellow-200 text-yellow-500"
  }
}, enabledClass = `
    dark:text-gray-100 text-gray-100 bg-gradient-to-r from-theme1-primary to-theme2-primary
  `, disabledClass = `
    dark:text-white dark:bg-gray-500 dark:hover:bg-gray-300 dark:focus:bg-gray-300
    text-white bg-gray-700 hover:bg-gray-700 focus:bg-gray-700
  `, nonRejectedUploads = Object.entries(CONTRIBUTION_POINTS.comicUpload).filter(([verdict]) => verdict !== "rejected" && verdict !== "rejected-list").map(([_, value]) => ({
  points: value.points,
  text: value.scoreListDescription
}));
function PointInfo({ showInfoAboutUploadedComics = !1 }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(import_jsx_dev_runtime31.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(
      "div",
      {
        className: "grid gap-y-1 gap-x-2 mt-4 mx-auto w-fit",
        style: { gridTemplateColumns: "auto auto" },
        children: [
          nonRejectedUploads.map(({ points, text }) => /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)(import_react24.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pValues.green, children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("b", { children: points }, void 0, !1, {
              fileName: "app/routes/contribute/scoreboard/index.tsx",
              lineNumber: 380,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/routes/contribute/scoreboard/index.tsx",
              lineNumber: 379,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pDescriptions.green, children: text }, void 0, !1, {
              fileName: "app/routes/contribute/scoreboard/index.tsx",
              lineNumber: 382,
              columnNumber: 13
            }, this)
          ] }, points, !0, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 378,
            columnNumber: 11
          }, this)),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pValues.blue, children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("b", { children: "30" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 387,
            columnNumber: 11
          }, this) }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 386,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pDescriptions.blue, children: "Comic suggestion approved with good links/information" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 389,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pValues.blue, children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("b", { children: "15" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 394,
            columnNumber: 11
          }, this) }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 393,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pDescriptions.blue, children: "Comic suggestion approved with lacking links/information" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 396,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pValues.purple, children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("b", { children: "10" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 401,
            columnNumber: 11
          }, this) }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 400,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pDescriptions.purple, children: "Comic problem reported" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 403,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pValues.yellow, children: /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("b", { children: "5" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 406,
            columnNumber: 11
          }, this) }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 405,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: pInfoColors.pDescriptions.yellow, children: "Add/remove tag suggestion approved" }, void 0, !1, {
            fileName: "app/routes/contribute/scoreboard/index.tsx",
            lineNumber: 408,
            columnNumber: 9
          }, this)
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/routes/contribute/scoreboard/index.tsx",
        lineNumber: 373,
        columnNumber: 7
      },
      this
    ),
    showInfoAboutUploadedComics && /* @__PURE__ */ (0, import_jsx_dev_runtime31.jsxDEV)("p", { className: "mt-4 text-center", children: "Note that even if your comic upload has the status Approved it might still not be available on the site. This is because we queue comics to spread them evenly over time." }, void 0, !1, {
      fileName: "app/routes/contribute/scoreboard/index.tsx",
      lineNumber: 413,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/scoreboard/index.tsx",
    lineNumber: 372,
    columnNumber: 5
  }, this);
}

// app/routes/contribute/your-contributions/index.tsx
var import_jsx_dev_runtime32 = require("react/jsx-dev-runtime");
function YourContributions() {
  let { contributions } = (0, import_react25.useLoaderData)(), [showPointInfo, setShowPointInfo] = (0, import_react26.useState)(!1);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("section", { className: "flex-col", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("h1", { className: "text-center mb-2", children: "Your contributions" }, void 0, !1, {
      fileName: "app/routes/contribute/your-contributions/index.tsx",
      lineNumber: 62,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "text-center mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(BackToContribute, {}, void 0, !1, {
      fileName: "app/routes/contribute/your-contributions/index.tsx",
      lineNumber: 64,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/your-contributions/index.tsx",
      lineNumber: 63,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "text-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(
      "button",
      {
        onClick: () => setShowPointInfo(!showPointInfo),
        className: `w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
          bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
          dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
          focus:no-underline cursor-pointer bg-[length:0%_1px] transition-[background-size]
          duration-200 bg-[center_bottom] hover:bg-[length:100%_1px]`,
        children: [
          showPointInfo ? "Hide" : "Show",
          " point info",
          " ",
          showPointInfo ? /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(import_md10.MdArrowDropUp, {}, void 0, !1, {
            fileName: "app/routes/contribute/your-contributions/index.tsx",
            lineNumber: 77,
            columnNumber: 28
          }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(import_md10.MdArrowDropDown, {}, void 0, !1, {
            fileName: "app/routes/contribute/your-contributions/index.tsx",
            lineNumber: 77,
            columnNumber: 48
          }, this)
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 68,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/contribute/your-contributions/index.tsx",
      lineNumber: 67,
      columnNumber: 7
    }, this),
    showPointInfo && /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(PointInfo, { showInfoAboutUploadedComics: !0 }, void 0, !1, {
      fileName: "app/routes/contribute/your-contributions/index.tsx",
      lineNumber: 81,
      columnNumber: 25
    }, this),
    contributions.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(Table, { horizontalScroll: !0, className: "mx-auto mt-8", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableHeadRow, { isTableMaxHeight: !1, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: "Contribution" }, void 0, !1, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 86,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: "Status" }, void 0, !1, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 87,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: "Date" }, void 0, !1, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 88,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: "Points" }, void 0, !1, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 89,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: "Mod comment" }, void 0, !1, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 90,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: "Contribution Details" }, void 0, !1, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 91,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 85,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableBody, { children: contributions.map((contribution, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(
        TableRow,
        {
          className: "border-b border-gray-800 dark:border-gray-500",
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "font-extralight", children: getContributionName(contribution) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 100,
              columnNumber: 19
            }, this) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 99,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(
              "p",
              {
                className: `${getContributionStatusColor(
                  contribution.status
                )} font-extralight`,
                children: capitalizeString(contribution.status)
              },
              void 0,
              !1,
              {
                fileName: "app/routes/contribute/your-contributions/index.tsx",
                lineNumber: 103,
                columnNumber: 19
              },
              this
            ) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 102,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "font-extralight", children: getDate(contribution.timestamp) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 112,
              columnNumber: 19
            }, this) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 111,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "font-semibold", children: contribution.points || "-" }, void 0, !1, {
                fileName: "app/routes/contribute/your-contributions/index.tsx",
                lineNumber: 115,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "font-extralight", children: contribution.pointsDescription }, void 0, !1, {
                fileName: "app/routes/contribute/your-contributions/index.tsx",
                lineNumber: 116,
                columnNumber: 19
              }, this)
            ] }, void 0, !0, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 114,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "font-extralight", children: contribution.modComment || "-" }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 119,
              columnNumber: 19
            }, this) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 118,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "font-extralight", children: getContributionDetails(contribution) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 122,
              columnNumber: 19
            }, this) }, void 0, !1, {
              fileName: "app/routes/contribute/your-contributions/index.tsx",
              lineNumber: 121,
              columnNumber: 17
            }, this)
          ]
        },
        contribution.comicName + index,
        !0,
        {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 95,
          columnNumber: 15
        },
        this
      )) }, void 0, !1, {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 93,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/your-contributions/index.tsx",
      lineNumber: 84,
      columnNumber: 9
    }, this),
    contributions.length === 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { className: "text-center mt-8", children: "You have no contributions yet." }, void 0, !1, {
      fileName: "app/routes/contribute/your-contributions/index.tsx",
      lineNumber: 133,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/your-contributions/index.tsx",
    lineNumber: 61,
    columnNumber: 5
  }, this);
}
async function loader9(args) {
  let urlBase = args.context.DB_API_URL_BASE, user = await redirectIfNotLoggedIn(args), uploadedComicsPromise = getYourContributedComics(urlBase, user.userId), tagSuggestionsPromise = getYourTagSuggestions(urlBase, user.userId), comicProblemsPromise = getYourComicProblems(urlBase, user.userId), comicSuggestionsPromise = getYourComicSuggestions(urlBase, user.userId), resolvedPromises = await Promise.all([
    uploadedComicsPromise,
    tagSuggestionsPromise,
    comicProblemsPromise,
    comicSuggestionsPromise
  ]);
  for (let promise of resolvedPromises)
    if (promise.err || !promise.contributions)
      return processApiError(
        "Error getting your contributions",
        promise.err || { logMessage: "Contributions returned as null" },
        {
          userId: user.userId
        }
      );
  let contributions = resolvedPromises.map((res) => res.contributions).flat();
  return contributions = contributions.sort((a, b) => a.timestamp.localeCompare(b.timestamp, void 0, {}) * -1), {
    contributions
  };
}
function getContributionDetails(contribution) {
  switch (contribution.type) {
    case "ContributedComic":
      return /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(import_jsx_dev_runtime32.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
          "Comic: ",
          contribution.comicName
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 185,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
          "Artist: ",
          contribution.artistName
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 186,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
          contribution.numberOfPages,
          " pages, ",
          contribution.numberOfKeywords,
          " tags"
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 187,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 184,
        columnNumber: 9
      }, this);
    case "ComicProblem":
      return /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(import_jsx_dev_runtime32.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
          "Comic: ",
          contribution.comicName
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 195,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
          "Problem: ",
          contribution.problemCategory
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 196,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 194,
        columnNumber: 9
      }, this);
    case "ComicSuggestion":
      return /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(import_jsx_dev_runtime32.Fragment, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
        "Comic name: ",
        contribution.comicName
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 202,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 201,
        columnNumber: 9
      }, this);
    case "TagSuggestion":
      return /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)(import_jsx_dev_runtime32.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
          "Comic: ",
          contribution.comicName
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 208,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime32.jsxDEV)("p", { children: [
          "Tag: ",
          contribution.suggestion
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/your-contributions/index.tsx",
          lineNumber: 209,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/your-contributions/index.tsx",
        lineNumber: 207,
        columnNumber: 9
      }, this);
    default:
      return "-";
  }
}
function getContributionName(contribution) {
  switch (contribution.type) {
    case "ContributedComic":
      return "Comic upload";
    case "ComicSuggestion":
      return "Comic suggestion";
    case "ComicProblem":
      return "Comic problem";
    case "TagSuggestion":
      return "Tag suggestion";
    default:
      return "ERROR";
  }
}
function getContributionStatusColor(status) {
  switch (status) {
    case "approved":
      return "text-green-500 dark:text-green-300";
    case "pending":
      return "text-blue-800 dark:text-blue-300";
    case "rejected":
      return "text-red-500 dark:text-red-300";
  }
}
function getDate(timestamp) {
  let d = new Date(timestamp), mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d), da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
  return `${mo} ${da}`;
}

// app/routes/api/admin/process-comic-suggestion.ts
var process_comic_suggestion_exports = {};
__export(process_comic_suggestion_exports, {
  action: () => action6
});

// app/utils/formdata-parser.ts
async function parseFormJson(args, validateUser = "none") {
  let user = await authLoader(args);
  if (validateUser === "user" && !user || validateUser === "mod" && user?.userType !== "moderator" && user?.userType !== "admin" || validateUser === "admin" && user?.userType !== "admin")
    return makeUnauthorizedResponse(user);
  let body = (await args.request.formData()).get("body");
  return {
    fields: JSON.parse(body),
    user,
    isUnauthorized: !1
  };
}
function makeUnauthorizedResponse(user) {
  return {
    fields: {},
    user,
    isUnauthorized: !0
  };
}

// app/routes/api/admin/process-comic-suggestion.ts
async function action6(args) {
  let { fields, user, isUnauthorized } = await parseFormJson(args, "mod");
  if (isUnauthorized)
    return new Response("Unauthorized", { status: 401 });
  let urlBase = args.context.DB_API_URL_BASE, err = await processComicSuggestion(
    urlBase,
    fields.actionId,
    fields.isApproved,
    user.userId,
    fields.verdict,
    fields.modComment,
    fields.suggestingUserId
  );
  return err ? processApiError("Error in /process-comic-suggestion", err, {
    ...fields
  }) : createSuccessJson();
}
async function processComicSuggestion(urlBase, actionId, isApproved, modId, verdict, modComment, suggestingUserId) {
  let updateQuery = `UPDATE comicsuggestion
    SET status = ?, modId = ?
    ${verdict ? ", verdict = ?" : ""}
    ${modComment ? ", modComment = ?" : ""}
    WHERE id = ?`, updateQueryParams = [
    isApproved ? "approved" : "rejected",
    modId,
    ...verdict ? [verdict] : [],
    ...modComment ? [modComment] : [],
    actionId
  ], dbRes = await queryDb(urlBase, updateQuery, updateQueryParams);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error updating comic suggestion");
  let columnName = isApproved ? `comicSuggestion${verdict}` : "comicSuggestionRejected", err = await addContributionPoints(urlBase, suggestingUserId ?? null, columnName);
  if (err)
    return err;
}

// app/routes/api/admin/schedule-comic-to-queue.ts
var schedule_comic_to_queue_exports = {};
__export(schedule_comic_to_queue_exports, {
  action: () => action7,
  scheduleComic: () => scheduleComic
});
async function action7(args) {
  let user = await redirectIfNotMod(args), urlBase = args.context.DB_API_URL_BASE, formComicId = (await args.request.formData()).get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let err = await scheduleComic(urlBase, parseInt(formComicId.toString()), user.userId);
  return err ? processApiError("Error in /schedule-comic-to-queue", err) : createSuccessJson();
}
async function scheduleComic(urlBase, comicId, modId) {
  let metadataQuery = "UPDATE comicmetadata SET scheduleModId = ? WHERE comicId = ?", comicQuery = "UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?", [comicDbRes, metadataDbRes] = await Promise.all([
    queryDb(urlBase, comicQuery, [comicId]),
    queryDb(urlBase, metadataQuery, [modId, comicId])
  ]), logCtx = { comicId, modId };
  if (comicDbRes.isError)
    return makeDbErr(comicDbRes, "Could not update comic table", logCtx);
  if (metadataDbRes.isError)
    return makeDbErr(metadataDbRes, "Could not update metadata table", logCtx);
  let err = await recalculatePublishingQueue(urlBase);
  if (err)
    return wrapApiError(err, "Error scheduling, recalculating", logCtx);
}

// app/routes/contribute/upload/step4-thumbnail.tsx
var step4_thumbnail_exports = {};
__export(step4_thumbnail_exports, {
  default: () => Step4Thumbnail
});
var import_react30 = require("react"), import_md12 = require("react-icons/md");

// app/components/RadioButton/RadioButtonGroup.tsx
var import_react27 = require("react"), import_jsx_dev_runtime33 = require("react/jsx-dev-runtime");
function RadioButtonGroup({
  options,
  title,
  name,
  direction = "vertical",
  value,
  onChange,
  className = ""
}) {
  let [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = (0, import_react27.useState)(-1);
  function onKeyDown(event, index) {
    if (event.key !== "Tab" && (event.stopPropagation(), event.preventDefault()), event.key === "ArrowUp" || event.key === "ArrowDown") {
      let newIndex = currentlyHighlightedIndex;
      event.key === "ArrowUp" ? newIndex-- : newIndex++, newIndex < 0 ? newIndex = options.length - 1 : newIndex >= options.length && (newIndex = 0), setCurrentlyHighlightedIndex(newIndex);
    }
    (event.key === "Enter" || event.key === " ") && onChange(options[index].value);
  }
  let wrapperClassName = direction === "vertical" ? "flex flex-col gap-2" : "flex flex-row gap-6";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)(import_jsx_dev_runtime33.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)("div", { className: `flex flex-col ${className}`, children: [
      title && /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)("label", { className: "mb-2", children: title }, void 0, !1, {
        fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
        lineNumber: 57,
        columnNumber: 19
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)("div", { className: wrapperClassName, onBlur: () => setCurrentlyHighlightedIndex(-1), children: options.map((option, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)(
        "div",
        {
          className: "flex flex-row items-center cursor-pointer outline-none",
          onClick: () => onChange(option.value),
          onKeyDown: (e) => onKeyDown(e, index),
          tabIndex: 0,
          onFocus: () => setCurrentlyHighlightedIndex(index),
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)(
              "div",
              {
                className: `flex flex-shrink-0 items-center justify-center w-5 h-5 rounded-full border
                border-gray-800 dark:border-gray-600 
              ${currentlyHighlightedIndex === index ? " bg-theme1-primaryTrans" : ""}`,
                children: value === option.value && /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)("div", { className: "w-2 h-2 rounded-full bg-theme1-dark dark:bg-theme1-primary" }, void 0, !1, {
                  fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
                  lineNumber: 74,
                  columnNumber: 19
                }, this)
              },
              void 0,
              !1,
              {
                fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
                lineNumber: 68,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)("div", { className: "ml-2 text-sm", children: option.text }, void 0, !1, {
              fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
              lineNumber: 77,
              columnNumber: 15
            }, this)
          ]
        },
        index,
        !0,
        {
          fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
          lineNumber: 60,
          columnNumber: 13
        },
        this
      )) }, void 0, !1, {
        fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
        lineNumber: 58,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
      lineNumber: 56,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime33.jsxDEV)("input", { type: "hidden", name, value: value?.toString() || "" }, void 0, !1, {
      fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
      lineNumber: 82,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/RadioButton/RadioButtonGroup.tsx",
    lineNumber: 55,
    columnNumber: 5
  }, this);
}

// app/components/Select/Select.tsx
var import_react28 = require("react");
var import_jsx_dev_runtime34 = require("react/jsx-dev-runtime");
function Select({
  options,
  title = "",
  value,
  onChange,
  error = !1,
  maxWidth = 999999,
  minWidth = 0,
  isFullWidth = !1,
  name,
  className = "",
  ...props
}) {
  let [isOpen, setIsOpen] = (0, import_react28.useState)(!1), [computedMinWidth, setComputedMinWidth] = (0, import_react28.useState)(0), [shouldAddRightPadding, setShouldAddRightPadding] = (0, import_react28.useState)(!1), [width, setWidth] = (0, import_react28.useState)(0), [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = (0, import_react28.useState)(-1), selectItemContainerRef = (0, import_react28.useRef)(null);
  (0, import_react28.useEffect)(() => {
    tryComputeWidth();
  }, []), (0, import_react28.useEffect)(() => {
    setCurrentlyHighlightedIndex(-1);
  }, [isOpen]);
  async function tryComputeWidth() {
    let isFinished = !1;
    for (; !isFinished; )
      await waitMillisec(25), isFinished = computeWidth();
  }
  function computeWidth() {
    let container = selectItemContainerRef.current;
    if (container && container.children.length > 0) {
      let maxChildWidth = 0;
      for (let child of container.children)
        child.clientWidth > maxChildWidth && (maxChildWidth = child.clientWidth);
      return computedMinWidth > maxWidth ? setWidth(maxWidth) : (maxChildWidth > minWidth && setShouldAddRightPadding(!0), setComputedMinWidth(Math.max(maxChildWidth, minWidth))), !0;
    } else
      return !1;
  }
  let minWidthStyle = (0, import_react28.useMemo)(() => width || isFullWidth ? {} : computedMinWidth ? { minWidth: computedMinWidth + (shouldAddRightPadding ? 16 : 0) } : minWidth ? { minWidth } : {}, [isFullWidth, computedMinWidth, minWidth, width]), widthStyle = (0, import_react28.useMemo)(() => isFullWidth ? { width: "100%" } : width ? { width } : {}, [isFullWidth, width]);
  function onSelected(clickedValue) {
    onChange(clickedValue), setIsOpen(!1);
  }
  let convertedValue = (0, import_react28.useMemo)(() => options.find((option) => option.value === value), [options, value]);
  function setHighlightedIndex(indexNum) {
    if (indexNum !== -1 && selectItemContainerRef.current) {
      let option = selectItemContainerRef.current.children[indexNum];
      option && option.scrollIntoView({ block: "nearest", inline: "start" });
    }
    setCurrentlyHighlightedIndex(indexNum);
  }
  function onKeyDown(event) {
    event.key !== "Tab" && (event.stopPropagation(), event.preventDefault()), event.key === "Enter" || event.key === " " ? isOpen ? currentlyHighlightedIndex !== -1 && options.length > 0 ? onSelected(options[currentlyHighlightedIndex].value) : setIsOpen(!1) : setIsOpen(!0) : event.key === "ArrowDown" ? isOpen ? currentlyHighlightedIndex === options.length - 1 ? setHighlightedIndex(0) : setHighlightedIndex(currentlyHighlightedIndex + 1) : (setIsOpen(!0), setHighlightedIndex(0)) : event.key === "ArrowUp" ? isOpen ? setHighlightedIndex(currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1 ? options.length - 1 : currentlyHighlightedIndex - 1) : (setIsOpen(!0), setHighlightedIndex(options.length - 1)) : event.key === "Escape" && setIsOpen(!1);
  }
  let borderStyle = error ? "" : { borderImage: "linear-gradient(to right, #9aebe7, #adfee0) 1" };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime34.jsxDEV)(
    "div",
    {
      onKeyDown,
      className: `hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit outline-none h-9 leading-9 pt-3 box-content ${className}`,
      style: { ...minWidthStyle, ...widthStyle },
      ...props,
      tabIndex: 0,
      onBlur: () => setIsOpen(!1),
      children: [
        title && /* @__PURE__ */ (0, import_jsx_dev_runtime34.jsxDEV)("label", { className: "absolute text-sm top-0 left-2", children: title }, void 0, !1, {
          fileName: "app/components/Select/Select.tsx",
          lineNumber: 174,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime34.jsxDEV)(
          "div",
          {
            onClick: () => setIsOpen(!isOpen),
            className: `border border-0 border-b-2 px-2 after:absolute
          after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
          after:border-t-text-light dark:after:border-t-text-dark after:right-3 ${value ? "" : "text-gray-750"}`,
            style: { ...borderStyle },
            children: value && options.find((x) => x.value === value)?.text || "\u2014"
          },
          void 0,
          !1,
          {
            fileName: "app/components/Select/Select.tsx",
            lineNumber: 175,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime34.jsxDEV)(
          "div",
          {
            className: `${isOpen ? "" : "invisible"} overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`,
            ref: selectItemContainerRef,
            children: options.map(({ text, value: optionValue }, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime34.jsxDEV)(
              "div",
              {
                onMouseEnter: () => setHighlightedIndex(index),
                onMouseLeave: () => setHighlightedIndex(-1),
                onClick: (e) => onSelected(optionValue),
                className: `z-40 hover:cursor-pointer px-3 whitespace-nowrap  ${currentlyHighlightedIndex === index ? "bg-gradient-to-r from-theme1-primary to-theme2-primary text-text-light " : ""}}`,
                children: text
              },
              text,
              !1,
              {
                fileName: "app/components/Select/Select.tsx",
                lineNumber: 193,
                columnNumber: 11
              },
              this
            ))
          },
          void 0,
          !1,
          {
            fileName: "app/components/Select/Select.tsx",
            lineNumber: 186,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime34.jsxDEV)(
          "input",
          {
            type: "text",
            name,
            value: convertedValue?.text || "",
            onChange: () => {
            },
            hidden: !0
          },
          void 0,
          !1,
          {
            fileName: "app/components/Select/Select.tsx",
            lineNumber: 209,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/components/Select/Select.tsx",
      lineNumber: 165,
      columnNumber: 5
    },
    this
  );
}

// app/components/ThumbnailCropper/ThumbnailCropper.tsx
var import_react29 = require("react"), import_react_cropper = __toESM(require("react-cropper")), import_md11 = require("react-icons/md");
var import_jsx_dev_runtime35 = require("react/jsx-dev-runtime");
function ThumbnailCropper({
  onClose,
  onComplete,
  image
}) {
  let cropperRef = (0, import_react29.useRef)(null), [currentCropEvent, setCurrentCropEvent] = (0, import_react29.useState)(
    null
  ), [isTooSmall, setIsTooSmall] = (0, import_react29.useState)(!1), [cropResult, setCropResult] = (0, import_react29.useState)(), { isMobile, isLgUp, isXlUp, isMdUp } = useWindowSize(), [mobileStep, setMobileStep] = (0, import_react29.useState)(1), step1Width = (0, import_react29.useMemo)(() => isXlUp ? 500 : isLgUp ? 400 : 340, [isLgUp, isXlUp]), step2Width = (0, import_react29.useMemo)(() => isLgUp ? 300 : isMdUp ? 230 : 300, [isLgUp, isXlUp]), step1Height = 480;
  function onCropAreaChange(e) {
    setIsTooSmall(!1), setCurrentCropEvent(e);
  }
  async function onCrop() {
    if (!currentCropEvent || !cropperRef?.current)
      return;
    let width = currentCropEvent.detail.width, height = currentCropEvent.detail.height;
    if (width < 400 || height < 564) {
      setIsTooSmall(!0), setCropResult(void 0);
      return;
    }
    setIsTooSmall(!1);
    let cropper = cropperRef?.current?.cropper, base64 = cropper.getCroppedCanvas().toDataURL(), file = await new Promise((resolve) => {
      cropper.getCroppedCanvas().toBlob((blob) => {
        blob && resolve(new File([blob], "thumbnail.png", { type: "image/png" }));
      });
    });
    setCropResult({ base64, file }), setMobileStep(2);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(import_jsx_dev_runtime35.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("div", { className: "fixed inset-0 z-10 bg-black bg-opacity-50 dark:bg-opacity-80" }, void 0, !1, {
      fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
      lineNumber: 79,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("div", { className: "fixed inset-0 z-20 flex items-center justify-center mx-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("div", { className: "bg-white dark:bg-gray-300 rounded-lg shadow-lg p-4 w-full lg:max-w-4xl xl:max-w-5xl flex flex-col", children: [
      !isMobile && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("p", { className: "text-xl mb-2 text-center", children: "Crop thumbnail" }, void 0, !1, {
        fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
        lineNumber: 82,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("div", { className: "flex flex-col sm:flex-row", children: [
        (!isMobile || mobileStep === 1) && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("div", { className: "flex flex-col items-center w-full sm:w-1/2 gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("p", { children: "Crop image" }, void 0, !1, {
            fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
            lineNumber: 86,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(
            import_react_cropper.default,
            {
              src: image.base64,
              style: { height: step1Height, width: step1Width },
              aspectRatio: 400 / 564,
              guides: !1,
              ref: cropperRef,
              background: !1,
              viewMode: 1,
              minCanvasWidth: 400,
              crop: (e) => onCropAreaChange(e)
            },
            void 0,
            !1,
            {
              fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
              lineNumber: 87,
              columnNumber: 17
            },
            this
          ),
          isTooSmall && isMobile && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(
            InfoBox,
            {
              variant: "error",
              centerText: !0,
              text: "Too small!",
              style: { width: step1Width }
            },
            void 0,
            !1,
            {
              fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
              lineNumber: 99,
              columnNumber: 19
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(
            Button,
            {
              variant: "contained",
              color: "primary",
              onClick: onCrop,
              text: "Crop",
              style: { width: step1Width }
            },
            void 0,
            !1,
            {
              fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
              lineNumber: 106,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(
            Button,
            {
              variant: "outlined",
              color: "primary",
              onClick: onClose,
              text: "Cancel",
              style: { width: step1Width }
            },
            void 0,
            !1,
            {
              fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
              lineNumber: 113,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
          lineNumber: 85,
          columnNumber: 15
        }, this),
        (!isMobile || mobileStep === 2) && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("div", { className: "flex flex-col items-center gap-2 w-full sm:w-1/2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("p", { children: "Preview and confirm" }, void 0, !1, {
            fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
            lineNumber: 125,
            columnNumber: 17
          }, this),
          cropResult && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(import_jsx_dev_runtime35.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(
              "img",
              {
                src: cropResult.base64,
                alt: "cropped image",
                style: { width: step2Width }
              },
              void 0,
              !1,
              {
                fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
                lineNumber: 128,
                columnNumber: 21
              },
              this
            ),
            isMobile && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(
              Button,
              {
                variant: "outlined",
                color: "primary",
                onClick: () => setMobileStep(1),
                text: "Back",
                startIcon: import_md11.MdArrowBack,
                style: { width: step2Width }
              },
              void 0,
              !1,
              {
                fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
                lineNumber: 134,
                columnNumber: 23
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(
              Button,
              {
                variant: "contained",
                color: "primary",
                text: "Confirm crop",
                startIcon: import_md11.MdCheck,
                onClick: () => onComplete(cropResult),
                style: { width: step2Width }
              },
              void 0,
              !1,
              {
                fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
                lineNumber: 143,
                columnNumber: 21
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
            lineNumber: 127,
            columnNumber: 19
          }, this),
          isTooSmall && !isMobile && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)(InfoBox, { variant: "error", text: "Too small!", children: currentCropEvent?.detail && /* @__PURE__ */ (0, import_jsx_dev_runtime35.jsxDEV)("p", { children: [
            "minimum 400px, currently",
            " ",
            Math.floor(currentCropEvent.detail.width),
            "px."
          ] }, void 0, !0, {
            fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
            lineNumber: 156,
            columnNumber: 23
          }, this) }, void 0, !1, {
            fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
            lineNumber: 154,
            columnNumber: 19
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
          lineNumber: 124,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
        lineNumber: 83,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
      lineNumber: 81,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
      lineNumber: 80,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/ThumbnailCropper/ThumbnailCropper.tsx",
    lineNumber: 78,
    columnNumber: 5
  }, this);
}

// app/routes/contribute/upload/step4-thumbnail.tsx
var import_jsx_dev_runtime36 = require("react/jsx-dev-runtime");
function Step4Thumbnail({ comicData, onUpdate }) {
  let [fileToCrop, setFileToCrop] = (0, import_react30.useState)(void 0), [thumbnailMode, setThumbnailMode] = (0, import_react30.useState)("upload"), [pageFileToCropNumber, setPageFileToCropNumber] = (0, import_react30.useState)(1), [pageFileToCrop, setPageFileToCrop] = (0, import_react30.useState)(void 0), fileInputRef = (0, import_react30.useRef)(null);
  async function onThumbnailFileUpload(event) {
    let files = event.target.files;
    if (files && files.length) {
      let fileStr = await getFileWithBase64(files[0]);
      setFileToCrop(fileStr);
    }
  }
  async function onPageFileNumChange(newNum) {
    if (setPageFileToCropNumber(newNum), !comicData.files)
      setPageFileToCrop(void 0);
    else {
      let file = comicData.files[newNum - 1];
      setPageFileToCrop(file);
    }
  }
  function onCropFinished(croppedThumb) {
    onUpdate({
      ...comicData,
      thumbnail: croppedThumb
    });
  }
  function onCancelCrop() {
    setFileToCrop(void 0), setPageFileToCropNumber(1), setPageFileToCrop(void 0), fileInputRef.current && (fileInputRef.current.value = "");
  }
  return (0, import_react30.useEffect)(() => {
    thumbnailMode === "page-file" && comicData.files && onPageFileNumChange(1);
  }, [comicData.files]), /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(import_jsx_dev_runtime36.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)("h4", { className: "mt-8", children: "Thumbnail" }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
      lineNumber: 65,
      columnNumber: 7
    }, this),
    comicData.thumbnail && /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(import_jsx_dev_runtime36.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)("img", { src: comicData.thumbnail.base64, width: 120 }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
        lineNumber: 70,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(
        Button,
        {
          text: "Change",
          onClick: () => {
            onCancelCrop(), onUpdate({ ...comicData, thumbnail: void 0 });
          },
          variant: "outlined",
          className: "mt-1",
          style: { width: 120 }
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
          lineNumber: 71,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
      lineNumber: 69,
      columnNumber: 9
    }, this),
    !comicData.thumbnail && /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(import_jsx_dev_runtime36.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(
        RadioButtonGroup,
        {
          name: "thumbnailMode",
          onChange: (newMode) => {
            setThumbnailMode(newMode), newMode === "page-file" && onPageFileNumChange(1);
          },
          value: thumbnailMode,
          className: "my-2",
          options: [
            { text: "Upload a file", value: "upload" },
            { text: "Crop an image from the comic's pages", value: "page-file" }
          ]
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
          lineNumber: 87,
          columnNumber: 11
        },
        this
      ),
      thumbnailMode === "upload" && /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(
        FileInput_default,
        {
          onChange: onThumbnailFileUpload,
          ref: fileInputRef,
          accept: "image/*"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
          lineNumber: 104,
          columnNumber: 13
        },
        this
      ),
      thumbnailMode === "page-file" && /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(import_jsx_dev_runtime36.Fragment, { children: comicData.files.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(import_jsx_dev_runtime36.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(
          Select,
          {
            value: pageFileToCropNumber,
            onChange: (newNum) => onPageFileNumChange(newNum),
            name: "pageFileToCropNumber",
            minWidth: 150,
            title: "Page to crop from",
            className: "mt-3",
            options: comicData.files.map((file, i) => ({
              text: `Page ${i + 1}`,
              value: i + 1
            }))
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
            lineNumber: 115,
            columnNumber: 19
          },
          this
        ),
        pageFileToCrop && /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(import_jsx_dev_runtime36.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)("img", { src: pageFileToCrop.base64, className: "mt-2", width: 100 }, void 0, !1, {
            fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
            lineNumber: 130,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(
            Button,
            {
              onClick: () => setFileToCrop(pageFileToCrop),
              text: "Crop",
              className: "mt-1",
              style: { width: 100 },
              endIcon: import_md12.MdArrowForward
            },
            void 0,
            !1,
            {
              fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
              lineNumber: 131,
              columnNumber: 23
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
          lineNumber: 129,
          columnNumber: 21
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
        lineNumber: 114,
        columnNumber: 17
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)("p", { children: "No pages uploaded yet." }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
        lineNumber: 142,
        columnNumber: 17
      }, this) }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
        lineNumber: 112,
        columnNumber: 13
      }, this),
      fileToCrop && /* @__PURE__ */ (0, import_jsx_dev_runtime36.jsxDEV)(
        ThumbnailCropper,
        {
          image: fileToCrop,
          onComplete: onCropFinished,
          onClose: onCancelCrop
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
          lineNumber: 148,
          columnNumber: 13
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
      lineNumber: 86,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/upload/step4-thumbnail.tsx",
    lineNumber: 64,
    columnNumber: 5
  }, this);
}

// app/routes/api/admin/process-tag-suggestion.ts
var process_tag_suggestion_exports = {};
__export(process_tag_suggestion_exports, {
  action: () => action8
});
async function action8(args) {
  let { fields, isUnauthorized, user } = await parseFormJson(
    args,
    "mod"
  );
  if (isUnauthorized)
    return new Response("Unauthorized", { status: 401 });
  let urlBase = args.context.DB_API_URL_BASE, err = await processTagSuggestion(
    urlBase,
    user?.userId,
    fields.isApproved,
    fields.actionId,
    fields.isAdding,
    fields.comicId,
    fields.tagId,
    fields.suggestingUserId
  );
  return err ? processApiError("Error in /process-tag-suggestion", err, {
    ...fields
  }) : createSuccessJson();
}
async function processTagSuggestion(urlBase, modId, isApproved, actionId, isAdding, comicId, tagId, suggestingUserId) {
  let updateActionQuery = "UPDATE keywordsuggestion SET status = ?, modId = ? WHERE id = ?", updateActionQueryParams = [isApproved ? "approved" : "rejected", modId, actionId], updateTagQuery, updateTagQueryParams;
  if (isApproved) {
    isAdding ? (updateTagQuery = "INSERT INTO comickeyword (comicId, keywordId) VALUES (?, ?)", updateTagQueryParams = [comicId, tagId]) : (updateTagQuery = "DELETE FROM comickeyword WHERE comicId = ? AND keywordId = ?", updateTagQueryParams = [comicId, tagId]);
    let dbRes = await queryDb(urlBase, updateTagQuery, updateTagQueryParams);
    if (dbRes.isError && (!dbRes.errorCode || dbRes.errorCode !== "ER_DUP_ENTRY"))
      return makeDbErr(dbRes, "Error updating comickeyword");
  }
  let actionRes = await queryDb(urlBase, updateActionQuery, updateActionQueryParams);
  if (actionRes.isError)
    return makeDbErr(actionRes, "Error updating mod panel action");
  let err = await addContributionPoints(urlBase, suggestingUserId ?? null, isApproved ? "tagSuggestion" : "tagSuggestionRejected");
  if (err)
    return wrapApiError(err, "Error adding contribution points");
}

// app/routes/api/search-similarly-named-comic.ts
var search_similarly_named_comic_exports = {};
__export(search_similarly_named_comic_exports, {
  action: () => action9,
  getSimilarlyNamedComics: () => getSimilarlyNamedComics
});

// app/utils/string-distance.ts
function stringDistance(aCased, bCased) {
  let a = aCased.toLowerCase(), b = bCased.toLowerCase();
  if (a.length === 0)
    return b.length;
  if (b.length === 0)
    return a.length;
  let matrix = [], i;
  for (i = 0; i <= b.length; i++)
    matrix[i] = [i];
  let j;
  for (j = 0; j <= a.length; j++)
    matrix[0][j] = j;
  for (i = 1; i <= b.length; i++)
    for (j = 1; j <= a.length; j++)
      b.charAt(i - 1) == a.charAt(j - 1) ? matrix[i][j] = matrix[i - 1][j - 1] : matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + 1,
        // substitution
        matrix[i][j - 1] + 1,
        // insertion
        matrix[i - 1][j] + 1
      );
  return matrix[b.length][a.length];
}

// app/routes/api/search-similarly-named-comic.ts
async function action9(args) {
  let urlBase = args.context.DB_API_URL_BASE, body = await args.request.formData(), comicName = body.get("comicName"), excludeName = body.get("excludeName"), res = await getSimilarlyNamedComics(
    urlBase,
    comicName,
    excludeName ? excludeName.toString() : void 0
  );
  return res.err ? processApiError("Error in /search-similarly-named-comics", res.err, {
    comicName,
    excludeName
  }) : res.comics ? createSuccessJson(res.comics) : logApiErrorMessage("Undefined db res in /search-similarly-named-comics", {
    comicName,
    excludeName
  });
}
async function getSimilarlyNamedComics(urlBase, comicName, excludeName) {
  let logCtx = { comicName, excludeName };
  if (comicName.length < 2)
    return { comics: { similarComics: [], similarRejectedComics: [] } };
  let comicNameLower = comicName.toLowerCase(), distanceThreshold = 4;
  comicNameLower.length < 14 && (distanceThreshold = 3), comicNameLower.length < 5 && (distanceThreshold = 2);
  let response = {
    similarComics: [],
    exactMatchComic: void 0,
    similarRejectedComics: [],
    exactMatchRejectedComic: void 0
  }, allComicsTinyRes = await getAllComicNamesAndIDs(urlBase, {
    includeRejectedList: !0,
    includeUnlisted: !0
  });
  if (allComicsTinyRes.err)
    return {
      err: wrapApiError(allComicsTinyRes.err, "error getting similar comics", logCtx)
    };
  for (let comic of (allComicsTinyRes.comics || []).filter(
    (c) => c.name !== excludeName && (c.publishStatus === "published" || c.publishStatus === "pending" || c.publishStatus === "scheduled")
  )) {
    let distance = stringDistance(comicName, comic.name);
    distance === 0 ? response.exactMatchComic = comic.name : distance <= distanceThreshold && response.similarComics.push(comic.name);
  }
  for (let comic of (allComicsTinyRes.comics || []).filter(
    (c) => c.name !== excludeName && (c.publishStatus === "uploaded" || c.publishStatus === "rejected" || c.publishStatus === "rejected-list")
  )) {
    let distance = stringDistance(comicName, comic.name);
    distance === 0 ? comic.publishStatus === "rejected-list" ? response.exactMatchRejectedComic = comic.name : response.exactMatchComic = comic.name : distance <= distanceThreshold && (comic.publishStatus === "rejected-list" ? response.similarRejectedComics.push(comic.name) : response.similarComics.push(comic.name));
  }
  return { comics: response };
}

// app/routes/api/admin/process-comic-problem.ts
var process_comic_problem_exports = {};
__export(process_comic_problem_exports, {
  action: () => action10
});
async function action10(args) {
  let { fields, isUnauthorized, user } = await parseFormJson(
    args,
    "mod"
  );
  if (isUnauthorized)
    return new Response("Unauthorized", { status: 401 });
  let urlBase = args.context.DB_API_URL_BASE, err = await processComicProblem(
    urlBase,
    fields.isApproved,
    fields.actionId,
    user.userId,
    fields.reportingUserId
  );
  return err ? processApiError("Error in /process-comic-problem", err, {
    ...fields
  }) : createSuccessJson();
}
async function processComicProblem(urlBase, isApproved, actionId, modId, reportingUserId) {
  let dbRes = await queryDb(urlBase, "UPDATE comicproblem SET status = ?, modId = ? WHERE id = ?", [isApproved ? "approved" : "rejected", modId, actionId]);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error updating comic problem");
  let err = await addContributionPoints(
    urlBase,
    reportingUserId ?? null,
    isApproved ? "comicProblem" : "comicProblemRejected"
  );
  if (err)
    return err;
}

// app/routes/api/admin/reject-pending-comic.ts
var reject_pending_comic_exports = {};
__export(reject_pending_comic_exports, {
  action: () => action11,
  rejectComic: () => rejectComic
});
async function action11(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, formComicId = (await args.request.formData()).get("comicId");
  if (!formComicId)
    return new Response("Missing comicId", { status: 400 });
  let err = await rejectComic(urlBase, parseInt(formComicId.toString()));
  return err ? processApiError("Error in /reject-pending-comic", err) : createSuccessJson();
}
async function rejectComic(urlBase, comicId) {
  let dbRes = await queryDb(urlBase, "UPDATE comic SET publishStatus = 'rejected' WHERE id = ?", [comicId]);
  if (dbRes.isError)
    return makeDbErr(
      dbRes,
      "Error rejecting comic, could not set publishStatus rejected",
      { comicId }
    );
}

// app/routes/contribute/join-us/apply/index.tsx
var apply_exports = {};
__export(apply_exports, {
  action: () => action12,
  default: () => Apply,
  loader: () => loader10
});
var import_react33 = require("@remix-run/react"), import_react34 = require("react"), import_md13 = require("react-icons/md");

// app/components/Textarea/Textarea.tsx
var import_react31 = require("react"), import_jsx_dev_runtime37 = require("react/jsx-dev-runtime");
function Textarea({
  value,
  onChange,
  label,
  name,
  rows = 4,
  placeholder,
  disabled = !1,
  helperText = "",
  errorText = "",
  error = !1,
  className = "",
  onBlur,
  ...props
}) {
  let borderClass = (0, import_react31.useMemo)(() => error ? "border-red-strong-300" : disabled ? "border-gray-800 dark:border-gray-600" : "", [error, disabled]), borderStyle = borderClass ? "" : { borderImage: "linear-gradient(to right, #9aebe7, #adfee0) 1" };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime37.jsxDEV)("div", { className: `flex flex-col ${className}`, ...props, children: [
    label && /* @__PURE__ */ (0, import_jsx_dev_runtime37.jsxDEV)("label", { className: `${error ? "text-red-strong-300" : ""} text-sm`, children: label }, void 0, !1, {
      fileName: "app/components/Textarea/Textarea.tsx",
      lineNumber: 53,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime37.jsxDEV)("div", { className: "-mt-1 relative", children: /* @__PURE__ */ (0, import_jsx_dev_runtime37.jsxDEV)(
      "textarea",
      {
        value,
        onChange: (e) => onChange(e.target.value),
        name,
        rows,
        placeholder,
        disabled,
        className: `w-full bg-transparent p-1.5 outline-none border border-0 border-b-2 
            placeholder-gray-800 dark:placeholder-gray-700 ${borderClass}`,
        style: {
          appearance: "textfield",
          ...borderStyle
        },
        onBlur
      },
      void 0,
      !1,
      {
        fileName: "app/components/Textarea/Textarea.tsx",
        lineNumber: 56,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/components/Textarea/Textarea.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, this),
    errorText && error && /* @__PURE__ */ (0, import_jsx_dev_runtime37.jsxDEV)("p", { className: "text-sm py-0.5 px-2 text-red-strong-300", children: errorText }, void 0, !1, {
      fileName: "app/components/Textarea/Textarea.tsx",
      lineNumber: 73,
      columnNumber: 9
    }, this),
    !(errorText && error) && helperText && /* @__PURE__ */ (0, import_jsx_dev_runtime37.jsxDEV)("label", { className: "text-sm py-0.5 px-2", children: helperText }, void 0, !1, {
      fileName: "app/components/Textarea/Textarea.tsx",
      lineNumber: 76,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/Textarea/Textarea.tsx",
    lineNumber: 51,
    columnNumber: 5
  }, this);
}

// app/components/Textarea/TextareaUncontrolled.tsx
var import_react32 = require("react"), import_jsx_dev_runtime38 = require("react/jsx-dev-runtime");
function TextareaUncontrolled({
  label,
  name,
  rows = 4,
  placeholder = "",
  disabled = !1,
  helperText = "",
  errorText = "",
  error = !1,
  validatorFunc,
  onErrorChange,
  className = "",
  ...props
}) {
  let [state, setState] = (0, import_react32.useState)(""), [hasBeenBlurred, setHasBeenBlurred] = (0, import_react32.useState)(!1), [lastErrorUpdate, setLastErrorUpdate] = (0, import_react32.useState)(!1), isInternalError = (0, import_react32.useMemo)(() => {
    if (validatorFunc) {
      let isError = !validatorFunc(state);
      return onErrorChange && isError !== lastErrorUpdate && (onErrorChange(isError), setLastErrorUpdate(isError)), isError;
    }
    return !1;
  }, [state, validatorFunc]), shouldShowError = error || hasBeenBlurred && isInternalError;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime38.jsxDEV)(
    Textarea,
    {
      value: state,
      onChange: (newVal) => setState(newVal),
      label,
      name,
      rows,
      placeholder,
      disabled,
      helperText,
      errorText: shouldShowError ? errorText : "",
      error: shouldShowError,
      className,
      onBlur: () => setHasBeenBlurred(!0),
      ...props
    },
    void 0,
    !1,
    {
      fileName: "app/components/Textarea/TextareaUncontrolled.tsx",
      lineNumber: 43,
      columnNumber: 5
    },
    this
  );
}

// app/components/TopGradientBox.tsx
var import_jsx_dev_runtime39 = require("react/jsx-dev-runtime");
function TopGradientBox({
  containerClassName,
  innerClassName,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime39.jsxDEV)(
    "div",
    {
      className: `pt-2.5 bg-gradient-to-r from-theme1-primary to-theme2-primary shadow-lg ${containerClassName}`,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime39.jsxDEV)("div", { className: `bg-white dark:bg-gray-300 w-full h-full ${innerClassName}`, children }, void 0, !1, {
        fileName: "app/components/TopGradientBox.tsx",
        lineNumber: 16,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/components/TopGradientBox.tsx",
      lineNumber: 13,
      columnNumber: 5
    },
    this
  );
}

// app/routes/api/funcs/get-mod-application.ts
var get_mod_application_exports = {};
__export(get_mod_application_exports, {
  getModApplicationForUser: () => getModApplicationForUser
});
async function getModApplicationForUser(urlBase, userId) {
  let dbRes = await queryDb(urlBase, `SELECT
      modapplication.id,
      userId,
      timestamp,
      telegramUsername,
      notes,
      user.username
    FROM modapplication INNER JOIN user ON (user.id = modapplication.userId)
    WHERE UserId = ?`, [userId]);
  return dbRes.isError || !dbRes.result ? makeDbErrObj(dbRes, "Error getting mod applications for user", { userId }) : { application: dbRes.result.length > 0 ? dbRes.result[0] : null };
}

// app/routes/contribute/join-us/apply/index.tsx
var import_jsx_dev_runtime40 = require("react/jsx-dev-runtime");
function Apply() {
  let fetcher = useGoodFetcher({
    method: "post",
    toastError: !1,
    toastSuccessMessage: "Application submitted!",
    preventToastClose: !0
  }), { hasExistingApplication } = (0, import_react33.useLoaderData)(), [notesIsValid, setNotesIsValid] = (0, import_react34.useState)(!1), [telegramIsValid, setTelegramIsValid] = (0, import_react34.useState)(!1);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)("h1", { children: "Become a mod" }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/apply/index.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)("p", { className: "mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(Link, { href: "/contribute/join-us", text: "Back", Icon: import_md13.MdArrowBack }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/apply/index.tsx",
      lineNumber: 38,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/apply/index.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)("p", { children: "In order to be accepted as a mod, you must have and use a Telegram account. We use telegram for communication and announcements for mods. If you do not have a telegram account, you will not be accepted." }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/apply/index.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this),
    hasExistingApplication && /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(
      InfoBox,
      {
        variant: "info",
        showIcon: !0,
        text: "You already have an existing application. You can see the status of your application on your Account page.",
        className: "my-4"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/contribute/join-us/apply/index.tsx",
        lineNumber: 48,
        columnNumber: 9
      },
      this
    ),
    !hasExistingApplication && /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(TopGradientBox, { containerClassName: "w-fit mx-auto my-4", innerClassName: "p-8 pb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(fetcher.Form, { className: "w-fit mx-auto flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(
        TextareaUncontrolled,
        {
          name: "notes",
          label: "Tell us a little about why you want to be a mod, and what sources you use for finding comics (which websites):",
          className: "mb-12",
          validatorFunc: (v) => v.length > 0,
          onErrorChange: (hasError) => setNotesIsValid(!hasError)
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/join-us/apply/index.tsx",
          lineNumber: 59,
          columnNumber: 13
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(
        TextInputUncontrolled,
        {
          name: "telegram",
          label: "Telegram username (don't include the @ symbol):",
          type: "text",
          className: "mb-4",
          validatorFunc: validateTelegramUsername,
          onErrorChange: (hasError) => setTelegramIsValid(!hasError)
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/join-us/apply/index.tsx",
          lineNumber: 67,
          columnNumber: 13
        },
        this
      ),
      fetcher.isError && !fetcher.isLoading && /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(
        InfoBox,
        {
          variant: "error",
          text: fetcher.errorMessage,
          showIcon: !0,
          closable: !0,
          className: "my-4"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/join-us/apply/index.tsx",
          lineNumber: 77,
          columnNumber: 15
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)("div", { className: "flex", children: /* @__PURE__ */ (0, import_jsx_dev_runtime40.jsxDEV)(
        LoadingButton,
        {
          text: "Submit application",
          color: "primary",
          variant: "contained",
          className: "my-4 mx-auto",
          disabled: !notesIsValid || !telegramIsValid,
          isLoading: fetcher.isLoading,
          isSubmit: !0
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/join-us/apply/index.tsx",
          lineNumber: 87,
          columnNumber: 15
        },
        this
      ) }, void 0, !1, {
        fileName: "app/routes/contribute/join-us/apply/index.tsx",
        lineNumber: 86,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/join-us/apply/index.tsx",
      lineNumber: 58,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/apply/index.tsx",
      lineNumber: 57,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/join-us/apply/index.tsx",
    lineNumber: 35,
    columnNumber: 5
  }, this);
}
async function loader10(args) {
  let user = await redirectIfNotLoggedIn(args), existingApplicationRes = await getModApplicationForUser(
    args.context.DB_API_URL_BASE,
    user.userId
  );
  return existingApplicationRes.err ? processApiError("Error in join us - apply", existingApplicationRes.err) : { hasExistingApplication: existingApplicationRes.application !== null };
}
var validateTelegramUsername = (username) => /^([a-zA-Z0-9_]){5,32}$/.test(username);
async function action12(args) {
  let urlBase = args.context.DB_API_URL_BASE, reqBody = await args.request.formData(), { notes, telegram } = Object.fromEntries(reqBody);
  if (!notes || !telegram)
    return create400Json("Missing fields");
  if (!validateTelegramUsername(telegram))
    return create400Json("Invalid telegram username");
  let user = await authLoader(args);
  if (!user)
    return create400Json("Not logged in");
  let existingApplicationRes = await getModApplicationForUser(urlBase, user.userId);
  if (existingApplicationRes.err)
    return logApiError("Error creating mod application", existingApplicationRes.err), create500Json();
  if (existingApplicationRes.application)
    return create400Json("You already have an existing application");
  let insertQuery = `
    INSERT INTO modapplication (userId, telegramUsername, notes)
    VALUES (?, ?, ?)`, insertParams = [user.userId, telegram.toString().trim(), notes], insertDbRes = await queryDb(urlBase, insertQuery, insertParams);
  return insertDbRes.isError ? (logApiError(void 0, {
    logMessage: "Error creating mod application",
    error: insertDbRes,
    context: { userId: user.userId, notes, telegram }
  }), create500Json()) : createSuccessJson();
}

// app/routes/contribute/suggest-comic/index.tsx
var suggest_comic_exports = {};
__export(suggest_comic_exports, {
  action: () => action13,
  default: () => Upload,
  loader: () => loader11
});
var import_react35 = require("@remix-run/react"), import_react36 = require("react"), import_timers = require("timers");
var import_jsx_dev_runtime41 = require("react/jsx-dev-runtime");
async function loader11(args) {
  return await authLoader(args);
}
function Upload() {
  let actionData = (0, import_react35.useActionData)(), similarComicsFetcher = useGoodFetcher({
    url: "/api/search-similarly-named-comic",
    method: "post"
  }), similarArtistsFetcher = useGoodFetcher({
    url: "/api/search-similar-artist",
    method: "post",
    onFinish: () => {
      similarArtistsFetcher.data && setSimilarArtists(similarArtistsFetcher.data);
    }
  }), [comicName, setComicName] = (0, import_react36.useState)(""), [artistName, setArtistName] = (0, import_react36.useState)(""), [comments, setComments] = (0, import_react36.useState)(""), [similarComics, setSimilarComics] = (0, import_react36.useState)(), [isComicnameLegal, setIsComicnameLegal] = (0, import_react36.useState)(!0), [hasConfirmedDifferentComic, setHasConfirmedDifferentComic] = (0, import_react36.useState)(!1), [similarArtists, setSimilarArtists] = (0, import_react36.useState)(), [isArtistNameLegal, setIsArtistNameLegal] = (0, import_react36.useState)(!0), [hasConfirmedNewArtist, setHasConfirmedNewArtist] = (0, import_react36.useState)(!1), user = (0, import_react35.useLoaderData)(), debounceTimeoutArtistRef = (0, import_react36.useRef)(null), debounceTimeoutComicRef = (0, import_react36.useRef)(null), transition = (0, import_react35.useNavigation)();
  (0, import_react36.useEffect)(() => {
    let isLegal = !1;
    if (similarArtists) {
      let isExactMatch = similarArtists.exactMatchBannedArtist, isSimilar = similarArtists.similarBannedArtists.length > 0;
      !isExactMatch && artistName.length > 2 && (isLegal = !isSimilar || hasConfirmedNewArtist);
    }
    setIsArtistNameLegal(isLegal);
  }, [similarArtists, hasConfirmedNewArtist]), (0, import_react36.useEffect)(onComicNameChange, [comicName]);
  function onComicNameChange() {
    setSimilarComics(void 0), setIsComicnameLegal(!1), setHasConfirmedDifferentComic(!1), debounceTimeoutComicRef.current && (0, import_timers.clearTimeout)(debounceTimeoutComicRef.current), !(comicName.length < 3) && (debounceTimeoutComicRef.current = setTimeout(() => {
      similarComicsFetcher.submit({ comicName });
    }, 1500));
  }
  (0, import_react36.useEffect)(() => {
    if (!similarComicsFetcher.data)
      return;
    let similarComics2 = similarComicsFetcher.data, isExactMatch = similarComics2.exactMatchComic || similarComics2.exactMatchRejectedComic;
    console.log(similarComics2);
    let isAnySimilar = similarComics2.similarComics.length > 0 || similarComics2.similarRejectedComics.length > 0, isLegal = !1;
    !isExactMatch && comicName.length > 2 && (isLegal = !isAnySimilar || hasConfirmedDifferentComic), setSimilarComics(similarComics2), setIsComicnameLegal(isLegal);
  }, [similarComicsFetcher.data, hasConfirmedDifferentComic, comicName]), (0, import_react36.useEffect)(onArtistNameChange, [artistName]);
  function onArtistNameChange() {
    setHasConfirmedNewArtist(!1), setSimilarArtists(void 0), debounceTimeoutArtistRef.current && (0, import_timers.clearTimeout)(debounceTimeoutArtistRef.current), !(!artistName || artistName.length < 3) && (debounceTimeoutArtistRef.current = setTimeout(() => {
      similarArtistsFetcher.submit({ artistName });
    }, 1500));
  }
  function getSuccessText() {
    return user ? 'You can track its progress and result in the "Your contributions" section of the previous page.' : "Since you are not logged in, you cannot track the status and result of your submission. We recommend that you create a user next time - it will take you under a minute!";
  }
  let isSubmitDisabled = !comicName || !artistName || !comments || !isComicnameLegal || !isArtistNameLegal, isExactComicnameMatch = similarComics?.exactMatchComic || similarComics?.exactMatchRejectedComic, isAnySimilarComics = similarComics && !isExactComicnameMatch && (similarComics.similarComics.length > 0 || similarComics.similarRejectedComics.length > 0), isExactArtistMatch = similarArtists?.exactMatchBannedArtist, similarOrExactBannedArtist = !isExactArtistMatch && similarArtists && similarArtists.similarBannedArtists.length > 0;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("section", { className: "container mx-auto justify-items-center", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("h1", { className: "mb-2", children: "Suggest a comic" }, void 0, !1, {
      fileName: "app/routes/contribute/suggest-comic/index.tsx",
      lineNumber: 157,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("p", { className: "mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(BackToContribute, {}, void 0, !1, {
      fileName: "app/routes/contribute/suggest-comic/index.tsx",
      lineNumber: 159,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/suggest-comic/index.tsx",
      lineNumber: 158,
      columnNumber: 7
    }, this),
    actionData?.success ? /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
      InfoBox,
      {
        title: "Thanks for helping out!",
        text: getSuccessText(),
        variant: "success",
        className: "mt-4"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 163,
        columnNumber: 9
      },
      this
    ) : /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_jsx_dev_runtime41.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("h4", { children: "Introduction" }, void 0, !1, {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 171,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("p", { children: [
        "If you would like to follow your suggestion's status,",
        " ",
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("span", { children: "create an account!" }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 174,
          columnNumber: 13
        }, this),
        ' You can then follow updates in the "view your contributions" section above. Having a user will also earn you points in the scoreboard on the previous page - though significantly less than if you upload the comic yourself.'
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 172,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("br", {}, void 0, !1, {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 179,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("h4", { children: "Guidelines" }, void 0, !1, {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 180,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("ul", { className: "list-none ml-4 spaced", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: "The comic should be at least 4 pages long. If the pages have lots of panels or if the comic is of very high quality, 3-page comics might be accepted." }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 182,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: "The comic will not be accepted if it is of low quality (poorly drawn)." }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 186,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: "The comic will not be accepted if it is not in English." }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 189,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: "The comic might not be accepted if it is uncolored." }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 190,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: "The comic will not be accepted if it has censoring bars, dots, etc." }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 191,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: "We do not accept cub comics, nor ones by artists Jay Naylor and Voregence who have asked not to be represented here." }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 192,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 181,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(TopGradientBox, { containerClassName: "my-10 mx-20 shadow-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_react35.Form, { method: "post", className: "w-fit mx-8 py-6", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("h3", { className: "pb-6", children: "Suggest comic" }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 199,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
          TextInput,
          {
            label: "Comic name (required)",
            name: "comicName",
            className: "mb-4",
            onChange: setComicName,
            value: comicName
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/suggest-comic/index.tsx",
            lineNumber: 200,
            columnNumber: 15
          },
          this
        ),
        similarComics && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_jsx_dev_runtime41.Fragment, { children: [
          isAnySimilarComics && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_jsx_dev_runtime41.Fragment, { children: [
            !hasConfirmedDifferentComic && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
              InfoBox,
              {
                variant: "warning",
                boldText: !1,
                className: "mt-2 w-fit",
                disableElevation: !0,
                children: [
                  similarComics.similarComics.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_jsx_dev_runtime41.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("p", { children: "The following comics with similar names already exist in the system:" }, void 0, !1, {
                      fileName: "app/routes/contribute/suggest-comic/index.tsx",
                      lineNumber: 221,
                      columnNumber: 31
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("ul", { children: similarComics.similarComics.map((comicName2) => /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: comicName2 }, comicName2, !1, {
                      fileName: "app/routes/contribute/suggest-comic/index.tsx",
                      lineNumber: 227,
                      columnNumber: 35
                    }, this)) }, void 0, !1, {
                      fileName: "app/routes/contribute/suggest-comic/index.tsx",
                      lineNumber: 225,
                      columnNumber: 31
                    }, this)
                  ] }, void 0, !0, {
                    fileName: "app/routes/contribute/suggest-comic/index.tsx",
                    lineNumber: 220,
                    columnNumber: 29
                  }, this),
                  similarComics.similarRejectedComics.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_jsx_dev_runtime41.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("p", { children: "The following comics with similar names have been rejected. If one of these is your comic, do not upload it:" }, void 0, !1, {
                      fileName: "app/routes/contribute/suggest-comic/index.tsx",
                      lineNumber: 234,
                      columnNumber: 31
                    }, this),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("ul", { children: similarComics.similarRejectedComics.map(
                      (comicName2) => /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: comicName2 }, comicName2, !1, {
                        fileName: "app/routes/contribute/suggest-comic/index.tsx",
                        lineNumber: 241,
                        columnNumber: 37
                      }, this)
                    ) }, void 0, !1, {
                      fileName: "app/routes/contribute/suggest-comic/index.tsx",
                      lineNumber: 238,
                      columnNumber: 31
                    }, this)
                  ] }, void 0, !0, {
                    fileName: "app/routes/contribute/suggest-comic/index.tsx",
                    lineNumber: 233,
                    columnNumber: 29
                  }, this)
                ]
              },
              void 0,
              !0,
              {
                fileName: "app/routes/contribute/suggest-comic/index.tsx",
                lineNumber: 213,
                columnNumber: 25
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
              Checkbox,
              {
                label: "The suggested comic is not one of the above",
                checked: hasConfirmedDifferentComic,
                onChange: setHasConfirmedDifferentComic,
                className: "mt-2"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/contribute/suggest-comic/index.tsx",
                lineNumber: 249,
                columnNumber: 23
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/routes/contribute/suggest-comic/index.tsx",
            lineNumber: 211,
            columnNumber: 21
          }, this),
          similarComics.exactMatchComic && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
            InfoBox,
            {
              text: `A comic with this name already exists in the system. You cannot submit this comic name. If you think this is a different comic with the same name, you can add "(<artistname>)" to the end of the comic's name. Please verify that this is not a duplicate before submitting.`,
              variant: "error",
              className: "mt-2 w-fit",
              disableElevation: !0
            },
            void 0,
            !1,
            {
              fileName: "app/routes/contribute/suggest-comic/index.tsx",
              lineNumber: 259,
              columnNumber: 21
            },
            this
          ),
          similarComics.exactMatchRejectedComic && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
            InfoBox,
            {
              text: "A comic with this name has been rejected. You cannot submit this comic name.",
              variant: "error",
              className: "mt-2 w-fit",
              disableElevation: !0
            },
            void 0,
            !1,
            {
              fileName: "app/routes/contribute/suggest-comic/index.tsx",
              lineNumber: 267,
              columnNumber: 21
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 209,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
          TextInput,
          {
            label: "Artist",
            name: "artist",
            className: "mt-12 mb-4",
            onChange: setArtistName,
            value: artistName
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/suggest-comic/index.tsx",
            lineNumber: 277,
            columnNumber: 15
          },
          this
        ),
        isExactArtistMatch && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
          InfoBox,
          {
            variant: "error",
            className: "mt-2",
            disableElevation: !0,
            text: similarArtists.exactMatchArtist ? "An artist with this name already exists in the system" : "An artist with this name has been banned or has requested their comics not be published here"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/suggest-comic/index.tsx",
            lineNumber: 286,
            columnNumber: 17
          },
          this
        ),
        similarOrExactBannedArtist && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_jsx_dev_runtime41.Fragment, { children: [
          !hasConfirmedNewArtist && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
            InfoBox,
            {
              variant: "warning",
              className: "mt-2",
              boldText: !1,
              disableElevation: !0,
              children: similarArtists.similarBannedArtists.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(import_jsx_dev_runtime41.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("p", { children: "The artists are somewhat similar to the one you entered, and have been banned or have requested their comics not be published here:" }, void 0, !1, {
                  fileName: "app/routes/contribute/suggest-comic/index.tsx",
                  lineNumber: 309,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("ul", { children: similarArtists.similarBannedArtists.map((name) => /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("li", { children: name }, name, !1, {
                  fileName: "app/routes/contribute/suggest-comic/index.tsx",
                  lineNumber: 316,
                  columnNumber: 31
                }, this)) }, void 0, !1, {
                  fileName: "app/routes/contribute/suggest-comic/index.tsx",
                  lineNumber: 314,
                  columnNumber: 27
                }, this)
              ] }, void 0, !0, {
                fileName: "app/routes/contribute/suggest-comic/index.tsx",
                lineNumber: 308,
                columnNumber: 25
              }, this)
            },
            void 0,
            !1,
            {
              fileName: "app/routes/contribute/suggest-comic/index.tsx",
              lineNumber: 301,
              columnNumber: 21
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
            Checkbox,
            {
              label: "This is not one of the above artists",
              checked: hasConfirmedNewArtist,
              onChange: setHasConfirmedNewArtist,
              className: "mt-2"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/contribute/suggest-comic/index.tsx",
              lineNumber: 324,
              columnNumber: 19
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 299,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
          Textarea,
          {
            label: "Links, comments (required)",
            name: "linksComments",
            className: "pb-12 mt-12",
            value: comments,
            onChange: setComments
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/suggest-comic/index.tsx",
            lineNumber: 333,
            columnNumber: 15
          },
          this
        ),
        actionData?.error && /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
          InfoBox,
          {
            variant: "error",
            text: actionData.error,
            className: "my-2",
            disableElevation: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/suggest-comic/index.tsx",
            lineNumber: 342,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("p", { children: "Please provide some link (e.g. e621, FurAffinity, u18chan, reddit, anything not behind a paywall), and any other helpful comments you may have. If you have multiple sources, feel free to provide all of them!" }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 350,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)("div", { className: "flex justify-center mt-6", children: /* @__PURE__ */ (0, import_jsx_dev_runtime41.jsxDEV)(
          LoadingButton,
          {
            isLoading: transition.state === "submitting",
            text: "Submit suggestion",
            variant: "contained",
            color: "primary",
            disabled: isSubmitDisabled,
            isSubmit: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/suggest-comic/index.tsx",
            lineNumber: 356,
            columnNumber: 17
          },
          this
        ) }, void 0, !1, {
          fileName: "app/routes/contribute/suggest-comic/index.tsx",
          lineNumber: 355,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 198,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/routes/contribute/suggest-comic/index.tsx",
        lineNumber: 197,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/suggest-comic/index.tsx",
      lineNumber: 170,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/suggest-comic/index.tsx",
    lineNumber: 156,
    columnNumber: 5
  }, this);
}
async function action13(args) {
  let reqBody = await args.request.formData(), logCtx = Object.fromEntries(reqBody), { comicName, artist, linksComments } = logCtx;
  if (!comicName || !artist || !linksComments)
    return create400Json("Some field is missing");
  let errors = await checkForExistingComicOrSuggestion(
    args.context.DB_API_URL_BASE,
    comicName
  );
  if (errors?.err)
    return processApiError("Error in post of /suggest-comic", errors.err, logCtx);
  if (errors?.comicExists)
    return create400Json("Comic already exists");
  if (errors?.suggestionExists)
    return create400Json("A suggestion for this comic already exists");
  let user = await authLoader(args), userIp = null, userId = null;
  user ? userId = user.userId : userIp = args.request.headers.get("CF-Connecting-IP") || "unknown";
  let insertQuery = `
    INSERT INTO comicsuggestion 
      (Name, ArtistName, Description, UserId, UserIp)
    VALUES (?, ?, ?, ?, ?)`, insertParams = [comicName.toString().trim(), artist, linksComments, userId, userIp], dbRes = await queryDb(args.context.DB_API_URL_BASE, insertQuery, insertParams);
  return dbRes.isError ? processApiError(void 0, {
    logMessage: "Db error in post of /suggest-comic",
    error: dbRes,
    context: logCtx
  }) : createSuccessJson();
}
async function checkForExistingComicOrSuggestion(dbUrlBase, comicName) {
  let existingSuggestionQueryPromise = queryDb(
    dbUrlBase,
    "SELECT COUNT(*) AS count FROM comicsuggestion WHERE Name = ?",
    [comicName]
  ), existingComicQueryPromise = queryDb(
    dbUrlBase,
    "SELECT COUNT(*) AS count FROM comic WHERE Name = ?",
    [comicName]
  ), [existingSuggestionDbRes, existingComicDbRes] = await Promise.all([
    existingSuggestionQueryPromise,
    existingComicQueryPromise
  ]);
  if (existingSuggestionDbRes.isError)
    return makeDbErrObj(
      existingSuggestionDbRes,
      "Error checking for existing suggestions",
      { comicName }
    );
  if (existingSuggestionDbRes.result && existingSuggestionDbRes.result[0].count > 0)
    return { suggestionExists: !0 };
  if (existingComicDbRes.isError)
    return makeDbErrObj(existingComicDbRes, "Error checking for existing comics", {
      comicName
    });
  if (existingComicDbRes.result && existingComicDbRes.result[0].count > 0)
    return { comicExists: !0 };
}

// app/routes/api/admin/process-anon-upload.tsx
var process_anon_upload_exports = {};
__export(process_anon_upload_exports, {
  action: () => action15
});

// app/routes/api/admin/process-user-upload.tsx
var process_user_upload_exports = {};
__export(process_user_upload_exports, {
  action: () => action14,
  processAnyUpload: () => processAnyUpload,
  processUserUpload: () => processUserUpload
});

// app/routes/api/funcs/get-artist.ts
var get_artist_exports = {};
__export(get_artist_exports, {
  getArtistByComicId: () => getArtistByComicId,
  getArtistById: () => getArtistById
});
async function getArtistById(urlBase, artistId) {
  let dbRes = await queryDb(urlBase, `
    SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl SEPARATOR ',') AS linksString 
    FROM artist LEFT JOIN artistlink ON (artistlink.artistId = artist.id)
    WHERE id = ?`, [artistId]);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting artist", { artistId }) : !dbRes.result || dbRes.result.length === 0 ? { notFound: !0 } : {
    artist: {
      id: dbRes.result[0].id,
      name: dbRes.result[0].name,
      patreonName: dbRes.result[0].patreonName,
      e621Name: dbRes.result[0].e621Name,
      isPending: dbRes.result[0].isPending === 1,
      isBanned: dbRes.result[0].isBanned === 1,
      isRejected: dbRes.result[0].isRejected === 1,
      links: dbRes.result[0].linksString ? dbRes.result[0].linksString.split(",") : []
    }
  };
}
async function getArtistByComicId(urlBase, comicId) {
  let dbRes = await queryDb(urlBase, `SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl SEPARATOR ',') AS linksString 
    FROM artist LEFT JOIN artistlink ON (artistlink.artistId = artist.id)
    WHERE artist.id = (SELECT artist FROM comic WHERE comic.id = ?)
    GROUP BY id, name, patreonName, e621Name, isPending, isBanned, isRejected`, [comicId]);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting artist by comic id", { comicId }) : !dbRes.result || dbRes.result.length === 0 ? { notFound: !0 } : { artist: {
    id: dbRes.result[0].id,
    name: dbRes.result[0].name,
    patreonName: dbRes.result[0].patreonName,
    e621Name: dbRes.result[0].e621Name,
    isPending: dbRes.result[0].isPending === 1,
    isBanned: dbRes.result[0].isBanned === 1,
    isRejected: dbRes.result[0].isRejected === 1,
    links: dbRes.result[0].linksString ? dbRes.result[0].linksString.split(",") : []
  } };
}

// app/routes/api/admin/manage-artist.ts
var manage_artist_exports = {};
__export(manage_artist_exports, {
  rejectArtistIfEmpty: () => rejectArtistIfEmpty,
  setArtistNotPending: () => setArtistNotPending
});
async function rejectArtistIfEmpty(urlBase, artistId, artistName) {
  let { comics, err } = await getComicsByArtistId(urlBase, artistId);
  if (err)
    return { err: wrapApiError(err, "Error rejecting artist", { artistId }) };
  if (comics = comics, comics.length > 0)
    return { isEmpty: !1 };
  let randomStr = randomString(6), newArtistName = `${artistName}-REJECTED-${randomStr}`, dbRes = await queryDb(urlBase, "UPDATE artist SET name = ?, isRejected = 1 WHERE id = ?", [newArtistName, artistId]);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error rejecting artist", {
    artistId,
    artistName,
    newArtistName
  }) : { isEmpty: !0 };
}
async function setArtistNotPending(urlBase, artistId) {
  let dbRes = await queryDb(urlBase, "UPDATE artist SET isPending = 0 WHERE id = ?", [artistId]);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error setting artist not pending", { artistId });
}

// app/routes/api/admin/process-user-upload.tsx
async function action14(args) {
  let user = await redirectIfNotMod(args), urlBase = args.context.DB_API_URL_BASE, formDataBody = await args.request.formData(), formComicId = formDataBody.get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let formVerdict = formDataBody.get("verdict");
  if (!formVerdict)
    return create400Json("Missing verdict");
  let formComicName = formDataBody.get("comicName");
  if (!formComicName)
    return create400Json("Missing comicName");
  let formUploaderId = formDataBody.get("uploaderId");
  if (!formUploaderId)
    return create400Json("Missing uploaderId");
  let verdict = formVerdict.toString(), formModComment = formDataBody.get("modComment"), modComment = formModComment ? formModComment.toString() : void 0, comicId = parseInt(formComicId.toString()), uploaderId = parseInt(formUploaderId.toString()), err = await processUserUpload(
    user.userId,
    urlBase,
    comicId,
    formComicName.toString(),
    verdict,
    modComment,
    uploaderId
  );
  return err ? processApiError("Error in /process-user-upload", err) : createSuccessJson();
}
async function processUserUpload(modId, urlBase, comicId, comicName, frontendVerdict, modComment, uploaderId) {
  let publishStatus = "pending", metadataVerdict = frontendVerdict.toString();
  frontendVerdict === "rejected" && (publishStatus = "rejected"), frontendVerdict === "rejected-list" && (publishStatus = "rejected-list", metadataVerdict = "rejected");
  let err = await processAnyUpload(
    modId,
    urlBase,
    comicId,
    comicName,
    modComment,
    publishStatus,
    frontendVerdict,
    metadataVerdict,
    uploaderId
  );
  if (err)
    return wrapApiError(err, "Error processing logged-in-user upload", {
      comicId,
      frontendVerdict,
      metadataVerdict,
      modComment
    });
}
async function processAnyUpload(modId, urlBase, comicId, comicName, modComment, publishStatus, frontendVerdict, metadataVerdict, userUploadId) {
  let comicQuery = "UPDATE comic SET publishStatus = ? WHERE id = ?", comicQueryParams = [publishStatus, comicId], isRejected = publishStatus === "rejected" || publishStatus === "rejected-list";
  if (frontendVerdict === "rejected") {
    let randomStr = randomString(6), newComicName = `${comicName}-REJECTED-${randomStr}`;
    comicQuery = "UPDATE comic SET publishStatus = ?, name = ? WHERE id = ?", comicQueryParams = [publishStatus, newComicName, comicId];
  }
  let [artistRes, updateComicDbRes] = await Promise.all([
    getArtistByComicId(urlBase, comicId),
    queryDb(urlBase, comicQuery, comicQueryParams)
  ]);
  if (updateComicDbRes.isError)
    return makeDbErr(updateComicDbRes, "Error updating comic in db");
  if (artistRes.notFound)
    return { logMessage: "Artist not found" };
  if (artistRes.err)
    return wrapApiError(artistRes.err, "Error getting artist");
  let artist = artistRes.artist;
  if (artist.isPending) {
    let pendingErr;
    if (isRejected ? pendingErr = (await rejectArtistIfEmpty(urlBase, artist.id, artist.name)).err : pendingErr = await setArtistNotPending(urlBase, artist.id), pendingErr)
      return wrapApiError(pendingErr, "Error processing user upload");
  }
  let metadataQuery = "UPDATE comicmetadata SET modId = ? WHERE comicId = ?", metadataQueryParams = [modId, comicId];
  metadataVerdict && (metadataQuery = `
    UPDATE comicmetadata 
    SET
      verdict = ?,
      modComment = ?,
      modId = ?
    WHERE comicId = ?`, metadataQueryParams = [metadataVerdict, modComment, modId, comicId]), frontendVerdict === "rejected" && (metadataVerdict ? (metadataQuery = `
        UPDATE comicmetadata
        SET
          verdict = ?,
          modComment = ?,
          modId = ?,
          originalNameIfRejected = ?,
          originalArtistIfRejected = ?
        WHERE comicId = ?`, metadataQueryParams = [
    metadataVerdict,
    modComment,
    modId,
    comicName,
    artist.name,
    comicId
  ]) : (metadataQuery = `
        UPDATE comicmetadata
        SET
          modId = ?,
          originalNameIfRejected = ?,
          originalArtistIfRejected = ?
        WHERE comicId = ?`, metadataQueryParams = [modId, comicName, artist.name, comicId])), frontendVerdict === "rejected-list" && (metadataVerdict ? (metadataQuery = `
      UPDATE comicmetadata
      SET
        verdict = ?,
        modComment = ?,
        modId = ?,
        originalArtistIfRejected = ?
      WHERE comicId = ?`, metadataQueryParams = [metadataVerdict, modComment, modId, artist.name, comicId]) : (metadataQuery = `
        UPDATE comicmetadata
        SET
          modId = ?,
          originalArtistIfRejected = ?
        WHERE comicId = ?`, metadataQueryParams = [modId, artist.name, comicId]));
  let dbTableName = frontendVerdict === "rejected" || frontendVerdict === "rejected-list" ? "comicUploadRejected" : `comicUpload${frontendVerdict.replace("-", "")}`, err = await addContributionPoints(urlBase, userUploadId ?? null, dbTableName);
  if (err)
    return wrapApiError(err, "Error adding contribution points");
  if (!metadataQuery)
    return;
  let metadataDbRes = await queryDb(urlBase, metadataQuery, metadataQueryParams);
  if (metadataDbRes.isError)
    return makeDbErr(metadataDbRes, "Error updating comic metadata in db");
}

// app/routes/api/admin/process-anon-upload.tsx
async function action15(args) {
  let user = await redirectIfNotMod(args), urlBase = args.context.DB_API_URL_BASE, formDataBody = await args.request.formData(), formComicId = formDataBody.get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let comicName = formDataBody.get("comicName");
  if (!comicName)
    return create400Json("Missing comicName");
  let formVerdict = formDataBody.get("verdict");
  if (!formVerdict)
    return create400Json("Missing verdict");
  let verdict = formVerdict.toString(), publishStatus = "pending", comicUploadVerdict = "excellent";
  verdict === "rejected" && (publishStatus = "rejected", comicUploadVerdict = "rejected"), verdict === "rejected-list" && (publishStatus = "rejected-list", comicUploadVerdict = "rejected-list");
  let err = await processAnyUpload(
    user.userId,
    urlBase,
    parseInt(formComicId.toString()),
    comicName.toString(),
    void 0,
    publishStatus,
    comicUploadVerdict,
    void 0
  );
  return err && processApiError("Error in /process-anon-upload", err, {
    comicId: formComicId.toString(),
    verdict
  }), createSuccessJson();
}

// app/routes/api/admin/publish-comics-cron.ts
var publish_comics_cron_exports = {};
__export(publish_comics_cron_exports, {
  loader: () => loader12
});

// app/routes/api/funcs/get-pending-comics.ts
var get_pending_comics_exports = {};
__export(get_pending_comics_exports, {
  getPendingComics: () => getPendingComics
});
async function getPendingComics(urlBase, scheduledOnly, topAmount) {
  let pendingComicsQuery = `
    SELECT Q2.*, user.username AS scheduleModName FROM (
      SELECT Q1.*, user.username AS reviewerModName 
        FROM (
          SELECT
              comic.name AS comicName,
              comic.id AS comicId,
              comic.publishStatus,
              artist.name AS artistName,
              COUNT(*) AS numberOfTags,
              timestamp,
              errorText,
              pendingProblemModId,
              uploadUserId,
              uploadUserIP,
              publishDate,
              publishingQueuePos,
              user.username AS uploadUsername,
              modId AS reviewerModId,
              scheduleModId
            FROM comic
            INNER JOIN comicmetadata ON (comic.id = comicmetadata.comicId)
            INNER JOIN artist ON (artist.id = comic.artist)
            LEFT JOIN comickeyword ON (comic.id = comickeyword.comicId)
            LEFT JOIN user ON (user.id = uploadUserId)
            WHERE ${scheduledOnly ? "" : "publishStatus = 'pending' OR"} publishStatus = 'scheduled'
            GROUP BY comic.id, timestamp, errorText, uploadUserId, uploadUserIP, publishDate, modId, scheduleModId
        ) AS Q1
      LEFT JOIN user ON (Q1.reviewerModId = user.id)
      WHERE publishStatus = 'pending' OR publishStatus = 'scheduled' OR publishStatus = 'published'
    ) AS Q2
    LEFT JOIN user ON (Q2.scheduleModId = user.id)
    ORDER BY timestamp ASC
    ${topAmount ? `LIMIT ${topAmount}` : ""}
  `, dbRes = await queryDb(urlBase, pendingComicsQuery);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting pending comics", {
    scheduledOnly,
    topAmount
  }) : { pendingComics: dbRes.result };
}

// app/routes/api/admin/publish-comic.ts
var publish_comic_exports = {};
__export(publish_comic_exports, {
  action: () => action16,
  publishComic: () => publishComic
});
async function action16(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, formComicId = (await args.request.formData()).get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let err = await publishComic(urlBase, parseInt(formComicId.toString()));
  return err ? processApiError("Error in /publish-comic", err, {
    comicId: formComicId
  }) : createSuccessJson();
}
async function publishComic(urlBase, comicId) {
  let dbRes = await queryDb(urlBase, `
    UPDATE comic
    SET publishStatus = "published",
      published = NOW(),
      updated = NOW()
    WHERE id = ?
  `, [comicId]);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error publishing comic", { comicId });
}

// app/routes/api/admin/publish-comics-cron.ts
async function loader12(args) {
  let requestApiKeyHeader = args.request.headers.get("x-yiffer-api-key"), urlBase = args.context.DB_API_URL_BASE, cronKey = args.context.CRON_KEY, schedulePerDay = parseInt(args.context.DAILY_SCHEDULE_PUBLISH_COUNT);
  if (cronKey !== requestApiKeyHeader)
    return logApiErrorMessage("Invalid x-yiffer-api-key header in /publish-comics-cron", {
      requestApiKeyHeader
    }), create400Json(
      `Invalid x-yiffer-api-key header in /publish-comics-cron: ${requestApiKeyHeader}`
    );
  let { err, pendingComics } = await getPendingComics(urlBase, !0, schedulePerDay);
  if (err)
    return processApiError("Error in /publish-comics-cron", err);
  for (let comic of pendingComics) {
    let err2 = await publishComic(urlBase, comic.comicId);
    if (err2)
      return processApiError("Error in /publish-comics-cron, failed publishing", err2);
  }
  return new Response(
    `Cron published comics finished. Comics published: ${pendingComics?.length}.`,
    { status: 200 }
  );
}

// app/routes/api/admin/update-artist-data.ts
var update_artist_data_exports = {};
__export(update_artist_data_exports, {
  action: () => action17,
  updateArtistData: () => updateArtistData
});
async function action17(args) {
  let urlBase = args.context.DB_API_URL_BASE;
  await redirectIfNotMod(args);
  let formData = await args.request.formData(), body = JSON.parse(formData.get("body"));
  if (body.e621Name && isUsernameUrl(body.e621Name))
    return create400Json("e621Name cannot be a URL");
  if (body.patreonName && isUsernameUrl(body.patreonName))
    return create400Json("patreonName cannot be a URL");
  let err = await updateArtistData(urlBase, body);
  return err ? processApiError("Errir in /update-artist-data", err) : createSuccessJson();
}
async function updateArtistData(urlBase, changes) {
  let promises = [];
  if ((changes.name || changes.e621Name !== void 0 || changes.patreonName !== void 0) && promises.push(updateGeneralDetails(urlBase, changes)), changes.links) {
    let { artist, err: artistErr } = await getArtistById(urlBase, changes.artistId);
    if (artistErr)
      return wrapApiError(artistErr, "Error updating artist", changes);
    promises.push(
      updateLinks(urlBase, changes.artistId, changes.links, artist)
    );
  }
  let maybeErrors = await Promise.all(promises);
  for (let err of maybeErrors)
    if (err)
      return wrapApiError(err, "Error updating artist", changes);
}
async function updateLinks(urlBase, artistId, links3, existingArtist) {
  let newLinks = links3.filter((l) => !existingArtist.links.includes(l)), deletedLinks = existingArtist.links.filter((l) => !links3.includes(l)), dbPromises = [];
  if (newLinks.length > 0) {
    let addLinksQuery = `INSERT INTO artistlink (artistId, linkUrl) VALUES ${newLinks.map(() => "(?, ?)").join(", ")}`;
    dbPromises.push(
      queryDb(
        urlBase,
        addLinksQuery,
        newLinks.flatMap((l) => [artistId, l])
      )
    );
  }
  if (deletedLinks.length > 0) {
    let deleteLinksQuery = `DELETE FROM artistlink WHERE artistId = ? AND linkUrl IN (${deletedLinks.map(() => "?").join(", ")})`;
    dbPromises.push(queryDb(urlBase, deleteLinksQuery, [artistId, ...deletedLinks]));
  }
  let dbResponses = await Promise.all(dbPromises);
  for (let dbRes of dbResponses)
    if (dbRes.isError)
      return makeDbErr(dbRes, "Error updating artist links", {
        artistId,
        links: links3,
        existingArtist
      });
}
async function updateGeneralDetails(urlBase, changes) {
  let updateFieldStr = "", updateFieldValues = [];
  changes.name && (updateFieldStr += "name = ?, ", updateFieldValues.push(changes.name.trim())), changes.e621Name !== void 0 && (updateFieldStr += "e621Name = ?, ", updateFieldValues.push(changes.e621Name.trim())), changes.patreonName !== void 0 && (updateFieldStr += "patreonName = ?, ", updateFieldValues.push(changes.patreonName.trim())), updateFieldStr = updateFieldStr.slice(0, -2), updateFieldValues.push(changes.artistId);
  let updateQuery = `UPDATE artist SET ${updateFieldStr} WHERE id = ?`, dbRes = await queryDb(urlBase, updateQuery, updateFieldValues);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error updating artist details", { changes });
}

// app/routes/api/admin/move-queued-comic.ts
var move_queued_comic_exports = {};
__export(move_queued_comic_exports, {
  action: () => action18
});
async function action18(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, formDataBody = await args.request.formData(), formComicId = formDataBody.get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let formMoveDirection = formDataBody.get("direction");
  if (formMoveDirection !== "up" && formMoveDirection !== "down")
    return create400Json("Missing direction, needs to be up or down");
  let err = await moveComicInQueue(
    urlBase,
    parseInt(formComicId.toString()),
    formMoveDirection === "up" ? -1 : 1
  );
  return err ? processApiError("Error in /move-queued-comic", err, {
    comicId: formComicId,
    direction: formMoveDirection
  }) : createSuccessJson();
}

// app/routes/api/admin/toggle-artist-ban.tsx
var toggle_artist_ban_exports = {};
__export(toggle_artist_ban_exports, {
  action: () => action20,
  toggleArtistBan: () => toggleArtistBan
});

// app/routes/api/admin/unlist-comic.tsx
var unlist_comic_exports = {};
__export(unlist_comic_exports, {
  action: () => action19,
  unlistComic: () => unlistComic
});
async function action19(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, formDataBody = await args.request.formData(), formComicId = formDataBody.get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let formUnlistComment = formDataBody.get("unlistComment");
  if (!formUnlistComment)
    return create400Json("Missing comment");
  let err = await unlistComic(
    urlBase,
    parseInt(formComicId.toString()),
    formUnlistComment.toString()
  );
  return err ? processApiError("Error in /unlist-comic", err) : createSuccessJson();
}
async function unlistComic(urlBase, comicId, unlistComment) {
  let logCtx = { comicId, unlistComment }, getDetailsQuery = "SELECT comicId FROM comicmetadata WHERE comicId = ?", comicUpdateQuery = "UPDATE comic SET publishStatus = 'unlisted' WHERE id = ?", [detailsDbRes, updateDbRes] = await Promise.all([
    queryDb(urlBase, getDetailsQuery, [comicId]),
    queryDb(urlBase, comicUpdateQuery, [comicId])
  ]);
  if (detailsDbRes.isError)
    return makeDbErr(detailsDbRes, "Could not get metadata", logCtx);
  if (updateDbRes.isError)
    return makeDbErr(updateDbRes, "Could not update publishStatus", logCtx);
  let metadataDbRes;
  if (detailsDbRes.result?.length === 0 ? metadataDbRes = await queryDb(urlBase, "INSERT INTO comicmetadata (comicId, unlistComment) VALUES (?, ?)", [comicId, unlistComment]) : metadataDbRes = await queryDb(urlBase, "UPDATE comicmetadata SET unlistComment = ? WHERE comicId = ?", [unlistComment, comicId]), metadataDbRes.isError)
    return makeDbErr(metadataDbRes, "Could not insert/update comicmetadata", logCtx);
}

// app/routes/api/admin/toggle-artist-ban.tsx
async function action20(args) {
  let user = await redirectIfNotMod(args), urlBase = args.context.DB_API_URL_BASE, formDataBody = await args.request.formData(), formArtistId = formDataBody.get("artistId");
  if (!formArtistId)
    return create400Json("Missing artistId");
  let formIsBanned = formDataBody.get("isBanned");
  if (!formIsBanned)
    return create400Json("Missing isBanned");
  if (formIsBanned = formIsBanned.toString(), formIsBanned !== "true" && formIsBanned !== "false")
    return create400Json("isBanned must be true or false");
  let err = await toggleArtistBan(
    urlBase,
    parseInt(formArtistId.toString()),
    formIsBanned === "true",
    user.userId
  );
  return err ? processApiError("Error in /toggle-artist-ban", err) : createSuccessJson();
}
async function toggleArtistBan(urlBase, artistId, isBanned, modId) {
  let logCtx = { artistId, isBanned, modId }, dbRes = await queryDb(urlBase, "UPDATE artist SET isBanned = ? WHERE id = ?", [isBanned, artistId]);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error banning/unbanning artist", logCtx);
  if (!isBanned)
    return;
  let { comics, err } = await getComicsByArtistId(urlBase, artistId);
  if (err)
    return wrapApiError(err, "Error banning/unbanning artist", logCtx);
  if (!comics || comics.length === 0)
    return;
  let liveComics = comics.filter((c) => c.publishStatus === "published"), pendingComics = comics.filter((c) => c.publishStatus === "pending"), uploadedComics = comics.filter((c) => c.publishStatus === "uploaded"), processComicPromises = [
    ...liveComics.map((c) => unlistComic(urlBase, c.id, "Artist banned")),
    ...pendingComics.map((c) => rejectComic(urlBase, c.id)),
    ...uploadedComics.map(
      (c) => processUserUpload(
        modId,
        urlBase,
        c.id,
        c.name,
        "rejected",
        "Artist rejected/banned"
      )
    )
  ], processErrors = await Promise.all(processComicPromises);
  for (let err2 of processErrors)
    if (err2)
      return wrapApiError(err2, "Error banning/unbanning artist", logCtx);
}

// app/routes/api/admin/update-comic-data.ts
var update_comic_data_exports = {};
__export(update_comic_data_exports, {
  action: () => action21,
  updateComicData: () => updateComicData
});

// app/routes/api/funcs/get-comic.ts
var get_comic_exports = {};
__export(get_comic_exports, {
  getComicById: () => getComicById
});
async function getComicById(urlBase, comicId, excludeMetadata = !1) {
  let logCtx = { comicId, excludeMetadata }, [comicRes, linksRes, tagsRes] = await Promise.all([
    getDbComicByField(urlBase, "id", comicId),
    getLinksByComicId(urlBase, comicId),
    getTagsByComicId(urlBase, comicId)
  ]);
  return comicRes.err ? {
    err: wrapApiError(comicRes.err, "Error getting comic by id", logCtx)
  } : linksRes.err ? {
    err: wrapApiError(linksRes.err, "Error getting comic by id", logCtx)
  } : tagsRes.err ? {
    err: wrapApiError(tagsRes.err, "Error getting comic by id", logCtx)
  } : { comic: mergeDbFieldsToComic(
    comicRes.comic,
    linksRes.links,
    tagsRes.tags,
    excludeMetadata
  ) };
}
function mergeDbFieldsToComic(dbComic, dbLinksRows, dbTagsRows, excludeMetadata) {
  let comic = {
    id: dbComic.id,
    name: dbComic.name,
    state: dbComic.state,
    publishStatus: dbComic.publishStatus,
    classification: dbComic.classification,
    category: dbComic.category,
    numberOfPages: dbComic.numberOfPages,
    published: dbComic.published,
    updated: dbComic.updated,
    artist: {
      id: dbComic.artistId,
      name: dbComic.artistName,
      isPending: dbComic.artistIsPending === 1
    },
    tags: dbTagsRows.map((tag) => ({
      id: tag.tagId,
      name: tag.tagName
    }))
  };
  if (dbLinksRows.length > 0)
    for (let link of dbLinksRows)
      link.firstComicId === dbComic.id ? comic.nextComic = {
        id: link.lastComicId,
        name: link.lastComicName
      } : link.lastComicId === dbComic.id && (comic.previousComic = {
        id: link.firstComicId,
        name: link.firstComicName
      });
  return excludeMetadata || (comic.metadata = {
    timestamp: dbComic.timestamp,
    errorText: dbComic.errorText,
    publishDate: dbComic.publishDate,
    modId: dbComic.modId,
    modComment: dbComic.modComment,
    verdict: dbComic.verdict,
    uploadUserId: dbComic.uploadUserId,
    uploadUserIP: dbComic.uploadUserIP,
    uploadUsername: dbComic.uploadUsername,
    originalNameIfRejected: dbComic.originalNameIfRejected,
    originalArtistIfRejected: dbComic.originalArtistIfRejected,
    unlistComment: dbComic.unlistComment,
    pendingProblemModId: dbComic.pendingProblemModId
  }), comic;
}
async function getDbComicByField(urlBase, fieldName, fieldValue) {
  let comicQuery = `SELECT
      comic.id,
      comic.name,
      state,
      publishStatus,
      cat AS classification,
      tag AS category,
      numberOfPages,
      published,
      updated,
      artist.id AS artistId,
      artist.name AS artistName,
      artist.isPending AS artistIsPending,
      comicmetadata.timestamp,
      comicmetadata.errorText,
      comicmetadata.publishDate,
      comicmetadata.modId,
      comicmetadata.modComment,
      comicmetadata.verdict,
      comicmetadata.uploadUserId,
      comicmetadata.uploadUserIP,
      user.username AS uploadUsername,
      comicmetadata.originalNameIfRejected,
      comicmetadata.originalArtistIfRejected,
      comicmetadata.unlistComment,
      comicmetadata.pendingProblemModId
    FROM comic
    INNER JOIN artist ON (artist.id = comic.artist)
    LEFT JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
    LEFT JOIN user ON (user.id = comicmetadata.uploadUserId)
    WHERE comic.${fieldName} = ?`, comicDbRes = await queryDb(urlBase, comicQuery, [fieldValue]);
  return comicDbRes.isError || !comicDbRes.result ? makeDbErrObj(comicDbRes, "Error getting comic", { fieldName, fieldValue }) : { comic: comicDbRes.result[0] };
}
async function getLinksByComicId(urlBase, comicId) {
  let linksDbRes = await queryDb(urlBase, `SELECT
    Q1.*, comic.name AS lastComicName
    FROM (
      SELECT 
        firstComic AS firstComicId,
        lastComic AS lastComicId,
        comic.name AS firstComicName
      FROM comiclink
      INNER JOIN comic ON (firstComic = comic.id) 
    ) AS Q1
    INNER JOIN comic ON (lastComicId = comic.id)
    WHERE firstComicId = ? OR lastComicId = ?`, [comicId, comicId]);
  return linksDbRes.isError || !linksDbRes.result ? makeDbErrObj(linksDbRes, "Error getting comic links", { comicId }) : { links: linksDbRes.result };
}
async function getTagsByComicId(urlBase, comicId) {
  let tagsDbRes = await queryDb(urlBase, `SELECT
      keyword.id AS tagId,
      keyword.keywordName AS tagName
      FROM comickeyword
      INNER JOIN keyword ON (keyword.id = comickeyword.keywordId)
    WHERE comicId = ?`, [comicId]);
  return tagsDbRes.isError || !tagsDbRes.result ? makeDbErrObj(tagsDbRes, "Error getting tags", { comicId }) : { tags: tagsDbRes.result };
}

// app/routes/api/admin/update-comic-data.ts
async function action21(args) {
  let urlBase = args.context.DB_API_URL_BASE;
  await redirectIfNotMod(args);
  let formData = await args.request.formData(), body = JSON.parse(formData.get("body")), err = await updateComicData(urlBase, body);
  return err ? processApiError("Error in /update-comic-data", err, body) : createSuccessJson();
}
async function updateComicData(urlBase, changes) {
  let { comic: existingComic, err } = await getComicById(urlBase, changes.comicId);
  if (err)
    return wrapApiError(err, "Could not update comic data", changes);
  if (existingComic = existingComic, changes.name && (err = await updateComicName(
    urlBase,
    changes.comicId,
    existingComic.name,
    changes.name
  ), err))
    return wrapApiError(err, "Could not update comic name", changes);
  if (changes.nextComicId && (err = await updateComicLink(
    urlBase,
    changes.comicId,
    existingComic.nextComic?.id,
    changes.nextComicId,
    "next"
  ), err))
    return wrapApiError(err, "Error updating comic links (next)", changes);
  if (changes.previousComicId && (err = await updateComicLink(
    urlBase,
    changes.comicId,
    existingComic.previousComic?.id,
    changes.previousComicId,
    "prev"
  ), err))
    return wrapApiError(err, "Error updating comic links (prev)", changes);
  if (changes.tagIds && (err = await updateTags(
    urlBase,
    changes.comicId,
    existingComic.tags.map((t) => t.id),
    changes.tagIds
  ), err))
    return wrapApiError(err, "Error updating comic tags", changes);
  if ((changes.category || changes.classification || changes.artistId || changes.state) && (err = await updateGeneralDetails2(urlBase, changes), err))
    return wrapApiError(err, "Error updating general comic details", changes);
}
async function updateTags(urlBase, comicId, oldTagIds, tagIds) {
  let logCtx = { comicId, oldTagIds, tagIds }, newTagIds = tagIds.filter((id) => !oldTagIds.includes(id)), deletedTagIds = oldTagIds.filter((id) => !tagIds.includes(id)), dbPromises = [];
  if (newTagIds.length > 0) {
    let newTagsQuery = `INSERT INTO comickeyword (comicId, keywordId) VALUES ${newTagIds.map((_) => "(?, ?)").join(", ")}`;
    dbPromises.push(
      queryDb(
        urlBase,
        newTagsQuery,
        newTagIds.flatMap((id) => [comicId, id])
      )
    );
  }
  if (deletedTagIds.length > 0) {
    let deletedTagsQuery = `DELETE FROM comickeyword WHERE comicId = ? AND keywordId IN (${deletedTagIds.map(() => "?").join(", ")})`;
    dbPromises.push(queryDb(urlBase, deletedTagsQuery, [comicId, ...deletedTagIds]));
  }
  let dbResponses = await Promise.all(dbPromises);
  for (let dbRes of dbResponses)
    if (dbRes.isError)
      return makeDbErr(dbRes, "Error updating tags", logCtx);
}
async function updateGeneralDetails2(urlBase, changes) {
  let updateFieldStr = "", updateFieldValues = [];
  changes.category && (updateFieldStr += "tag = ?, ", updateFieldValues.push(changes.category)), changes.classification && (updateFieldStr += "cat = ?, ", updateFieldValues.push(changes.classification)), changes.artistId && (updateFieldStr += "artist = ?, ", updateFieldValues.push(changes.artistId)), changes.state && (updateFieldStr += "state = ?, ", updateFieldValues.push(changes.state)), updateFieldStr = updateFieldStr.slice(0, -2), updateFieldValues.push(changes.comicId);
  let updateQuery = `UPDATE comic SET ${updateFieldStr} WHERE id = ?`, dbRes = await queryDb(urlBase, updateQuery, updateFieldValues);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error updating comic details", changes);
}
async function updateComicName(urlBase, comicId, oldName, newName) {
  return {
    logMessage: "Not implemented!"
  };
}
async function updateComicLink(urlBase, comicId, oldLinkedId, newLinkedComicId, type) {
  if (oldLinkedId === newLinkedComicId)
    return;
  let logCtx = { comicId, oldLinkedId, newLinkedComicId, type };
  if (oldLinkedId) {
    let delDbRes = await queryDb(urlBase, `DELETE FROM comiclink WHERE ${type === "next" ? "first" : "last"}Comic = ?`, [comicId]);
    if (delDbRes.isError)
      return makeDbErr(delDbRes, "Error deleting comic link", logCtx);
  }
  if (newLinkedComicId) {
    let newDbRes = await queryDb(urlBase, "INSERT INTO comiclink (firstComic, lastComic) VALUES (?, ?)", [
      type === "next" ? comicId : newLinkedComicId,
      type === "next" ? newLinkedComicId : comicId
    ]);
    if (newDbRes.isError)
      return makeDbErr(newDbRes, "Error inserting new comic link", logCtx);
  }
}

// app/routes/api/admin/unschedule-comic.ts
var unschedule_comic_exports = {};
__export(unschedule_comic_exports, {
  action: () => action22,
  unScheduleComic: () => unScheduleComic
});
async function action22(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, formComicId = (await args.request.formData()).get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let err = await unScheduleComic(urlBase, parseInt(formComicId.toString()));
  return err ? processApiError("Error in /unschedule-comic", err) : createSuccessJson();
}
async function unScheduleComic(urlBase, comicId) {
  let metadataQuery = "UPDATE comicmetadata SET publishDate = NULL, scheduleModId = NULL, publishingQueuePos = NULL WHERE comicId = ?", comicQuery = "UPDATE comic SET publishStatus = 'pending' WHERE id = ?", [metadataDbRes, comicDbRes] = await Promise.all([
    queryDb(urlBase, metadataQuery, [comicId]),
    queryDb(urlBase, comicQuery, [comicId])
  ]);
  if (metadataDbRes.isError)
    return makeDbErr(metadataDbRes, "Could not update comicmetadata", { comicId });
  if (comicDbRes.isError)
    return makeDbErr(comicDbRes, "Could not update comic table", { comicId });
  recalculatePublishingQueue(urlBase);
}

// app/routes/api/admin/set-comic-error.ts
var set_comic_error_exports = {};
__export(set_comic_error_exports, {
  action: () => action23,
  setComicError: () => setComicError
});
async function action23(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, formDataBody = await args.request.formData(), formComicId = formDataBody.get("comicId");
  if (!formComicId)
    return new Response("Missing comicId", { status: 400 });
  let formErrorText = formDataBody.get("errorText"), errorText = formErrorText ? formErrorText.toString() : null;
  errorText === "" && (errorText = null);
  let err = await setComicError(urlBase, parseInt(formComicId.toString()), errorText);
  return err ? processApiError("Error in /set-comic-error", err) : createSuccessJson();
}
async function setComicError(urlBase, comicId, errorText) {
  let dbRes = await queryDb(urlBase, "UPDATE comicmetadata SET errorText = ? WHERE comicId = ?", [errorText, comicId]);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error updating comicmetadata", { comicId, errorText });
  if (!errorText && (dbRes = await queryDb(urlBase, "UPDATE comicmetadata SET pendingProblemModId = NULL WHERE comicId = ?", [comicId]), dbRes.isError))
    return makeDbErr(dbRes, "Error removing mod id", { comicId, errorText });
}

// app/routes/api/admin/unassign-action.ts
var unassign_action_exports = {};
__export(unassign_action_exports, {
  action: () => action24
});
async function action24(args) {
  let { fields, isUnauthorized } = await parseFormJson(args, "mod");
  if (isUnauthorized)
    return new Response("Unauthorized", { status: 401 });
  let urlBase = args.context.DB_API_URL_BASE, err = await unAssignActionToMod(urlBase, fields.actionId, fields.actionType);
  return err ? processApiError("Error in /unassign-action", err) : createSuccessJson();
}
async function unAssignActionToMod(urlBase, actionId, actionType) {
  let table = "", identifyingColumn = "id", modIdColumn = "modId";
  actionType === "comicUpload" && (table = "comicmetadata", identifyingColumn = "comicId"), actionType === "comicSuggestion" && (table = "comicsuggestion"), actionType === "comicProblem" && (table = "comicproblem"), actionType === "pendingComicProblem" && (table = "comicmetadata", identifyingColumn = "comicId", modIdColumn = "pendingProblemModId");
  let query = `UPDATE ${table} SET ${modIdColumn} = NULL WHERE ${identifyingColumn} = ?`, dbRes = await queryDb(urlBase, query, [actionId]);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error unassigning mod action", {
      actionId,
      actionType
    });
}

// app/routes/api/search-similar-artist.ts
var search_similar_artist_exports = {};
__export(search_similar_artist_exports, {
  action: () => action25,
  getSimilarArtists: () => getSimilarArtists
});
var action25 = async function({ request, context }) {
  let urlBase = context.DB_API_URL_BASE, body = await request.formData(), artistName = body.get("artistName"), excludeName = body.get("excludeName"), { artists, err } = await getSimilarArtists(
    urlBase,
    artistName,
    excludeName ? excludeName.toString() : void 0
  );
  return err ? processApiError("Error in /search-similar-artist", err) : createSuccessJson(artists);
};
async function getSimilarArtists(urlBase, newArtistName, excludeName) {
  let logCtx = { newArtistName, excludeName }, similar = {
    similarArtists: [],
    exactMatchArtist: "",
    similarBannedArtists: [],
    exactMatchBannedArtist: ""
  };
  if (newArtistName.length < 2)
    return { artists: similar };
  let distanceThreshold = 4;
  newArtistName.length < 14 && (distanceThreshold = 3), newArtistName.length < 5 && (distanceThreshold = 2);
  let allArtistsRes = await queryDb(
    urlBase,
    "SELECT name, isBanned FROM artist"
  );
  if (allArtistsRes.isError)
    return makeDbErrObj(allArtistsRes, "Error getting all artists from db", logCtx);
  for (let artist of allArtistsRes.result) {
    if (artist.name === excludeName)
      continue;
    let distance = stringDistance(artist.name, newArtistName);
    distance === 0 ? artist.isBanned ? similar.exactMatchBannedArtist = artist.name : similar.exactMatchArtist = artist.name : distance <= distanceThreshold && (artist.isBanned ? similar.similarBannedArtists.push(artist.name) : similar.similarArtists.push(artist.name));
  }
  return { artists: similar };
}

// app/routes/contribute/feedback/index.tsx
var feedback_exports = {};
__export(feedback_exports, {
  action: () => action26,
  default: () => Feedback,
  loader: () => authLoader
});
var import_react37 = require("@remix-run/react"), import_react38 = require("react");
var import_jsx_dev_runtime42 = require("react/jsx-dev-runtime");
function Feedback() {
  let userSession = (0, import_react37.useLoaderData)(), transition = (0, import_react37.useNavigation)(), actionData = (0, import_react37.useActionData)(), [feedback, setFeedback] = (0, import_react38.useState)(""), [feedbackType, setFeedbackType] = (0, import_react38.useState)(), radioOptions = [
    { text: "General feedback", value: "general" },
    { text: "Bug report", value: "bug" }
  ];
  return userSession && radioOptions.push({ text: "Support", value: "support" }), /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)("section", { className: "container mx-auto justify-items-center", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)("h1", { className: "mb-2", children: "Feedback & Support" }, void 0, !1, {
      fileName: "app/routes/contribute/feedback/index.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)("p", { className: "mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(BackToContribute, {}, void 0, !1, {
      fileName: "app/routes/contribute/feedback/index.tsx",
      lineNumber: 38,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/feedback/index.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(TopGradientBox, { containerClassName: "my-10 mx-auto shadow-lg max-w-2xl", children: /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(import_react37.Form, { method: "post", className: "mx-8 py-6", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)("h3", { children: "Submit feedback" }, void 0, !1, {
        fileName: "app/routes/contribute/feedback/index.tsx",
        lineNumber: 43,
        columnNumber: 11
      }, this),
      actionData?.success ? /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
        InfoBox,
        {
          variant: "success",
          text: feedbackType === "support" ? "Your support request has been submitted. We will look at it as soon as possible. If we deem it necessary, we will contact you via the email associated with your account." : "Your feedback has been submitted. Thank you!",
          className: "mt-4",
          disableElevation: !0
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/feedback/index.tsx",
          lineNumber: 46,
          columnNumber: 13
        },
        this
      ) : /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(import_jsx_dev_runtime42.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
          RadioButtonGroup,
          {
            name: "feedbackType",
            title: "Type of feedback",
            className: "mb-4 mt-2",
            value: feedbackType,
            onChange: setFeedbackType,
            options: radioOptions
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/feedback/index.tsx",
            lineNumber: 58,
            columnNumber: 15
          },
          this
        ),
        feedbackType === "support" && /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
          InfoBox,
          {
            variant: "info",
            showIcon: !0,
            text: "Please do not use the support feature to ask questions. We will only respond to support requests if you have an issue that requires our attention. If we deem it necessary, we will contact you via the email associated with your account.",
            className: "mb-4",
            disableElevation: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/feedback/index.tsx",
            lineNumber: 68,
            columnNumber: 17
          },
          this
        ),
        feedbackType === "bug" && /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
          InfoBox,
          {
            variant: "info",
            showIcon: !0,
            text: "Please report any crashes or obvious errors here. Do not use this to request new features - use the general feedback option above for that.",
            className: "mb-4",
            disableElevation: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/feedback/index.tsx",
            lineNumber: 77,
            columnNumber: 17
          },
          this
        ),
        feedbackType === "general" && /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
          InfoBox,
          {
            variant: "info",
            showIcon: !0,
            text: "Please note that we will not answer any questions.",
            className: "mb-4",
            disableElevation: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/feedback/index.tsx",
            lineNumber: 86,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
          Textarea,
          {
            label: "Your feedback",
            name: "feedbackText",
            value: feedback,
            onChange: setFeedback,
            className: "mb-2"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/feedback/index.tsx",
            lineNumber: 95,
            columnNumber: 15
          },
          this
        ),
        actionData?.error && /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
          InfoBox,
          {
            variant: "error",
            text: "An error occurred when saving your feedback. Please try again!",
            className: "my-4"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/feedback/index.tsx",
            lineNumber: 104,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime42.jsxDEV)(
          LoadingButton,
          {
            isLoading: transition.state === "submitting",
            text: "Submit feedback",
            variant: "contained",
            color: "primary",
            disabled: feedback.length < 3,
            className: "mx-auto mt-2",
            isSubmit: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/contribute/feedback/index.tsx",
            lineNumber: 111,
            columnNumber: 15
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/feedback/index.tsx",
        lineNumber: 57,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/feedback/index.tsx",
      lineNumber: 42,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/feedback/index.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/feedback/index.tsx",
    lineNumber: 35,
    columnNumber: 5
  }, this);
}
async function action26(args) {
  let reqBody = await args.request.formData(), urlBase = args.context.DB_API_URL_BASE, { feedbackText, feedbackType } = Object.fromEntries(reqBody), user = await getUserSession(args.request, args.context.JWT_CONFIG_STR), insertQuery = "INSERT INTO feedback (text, type, userId) VALUES (?, ?, ?)", insertParams = [feedbackText, feedbackType, user?.userId ?? null], dbRes = await queryDb(urlBase, insertQuery, insertParams);
  return dbRes.isError ? (logApiError(void 0, {
    logMessage: "Error saving user feedback",
    error: dbRes,
    context: { feedbackText, feedbackType, user: user?.userId }
  }), create500Json()) : createSuccessJson();
}

// app/routes/contribute/upload/success.tsx
var success_exports = {};
__export(success_exports, {
  default: () => SuccessMessage
});
var import_jsx_dev_runtime43 = require("react/jsx-dev-runtime");
function SuccessMessage({ isLoggedIn }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime43.jsxDEV)(InfoBox, { variant: "success", title: "Upload successful!", boldText: !1, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime43.jsxDEV)("p", { className: "my-4", children: "Your comic has been uploaded successfully. It will be reviewed by our moderator team shortly." }, void 0, !1, {
      fileName: "app/routes/contribute/upload/success.tsx",
      lineNumber: 11,
      columnNumber: 7
    }, this),
    isLoggedIn ? /* @__PURE__ */ (0, import_jsx_dev_runtime43.jsxDEV)("p", { children: [
      "You can view the status of your submission at the",
      " ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime43.jsxDEV)(Link, { href: "/contribute/your-contributions", text: "your contributions" }, void 0, !1, {
        fileName: "app/routes/contribute/upload/success.tsx",
        lineNumber: 18,
        columnNumber: 11
      }, this),
      " page."
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/success.tsx",
      lineNumber: 16,
      columnNumber: 9
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime43.jsxDEV)("p", { children: "Since you are not logged in, you cannot track the status of your submission. We recommend logging in or creating a user for next time! This will also allow you to collect reward points for your submissions." }, void 0, !1, {
      fileName: "app/routes/contribute/upload/success.tsx",
      lineNumber: 21,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/upload/success.tsx",
    lineNumber: 10,
    columnNumber: 5
  }, this);
}

// app/routes/api/admin/dashboard-data.ts
var dashboard_data_exports = {};
__export(dashboard_data_exports, {
  getPendingComicProblems: () => getPendingComicProblems,
  loader: () => loader13
});
async function loader13(args) {
  let urlBase = args.context.DB_API_URL_BASE, dataResponses = await Promise.all(
    [
      getTagSuggestions(urlBase),
      getProblems(urlBase),
      getComicUploads(urlBase),
      getComicSuggestions(urlBase),
      getPendingComicProblems(urlBase)
    ]
  ), allSuggestions = [];
  for (let response of dataResponses) {
    if (response.err)
      return processApiError("Error fetching admin dashboard data", response.err);
    response.data && allSuggestions.push(...response.data);
  }
  return allSuggestions.sort((a, b) => a.timestamp.localeCompare(b.timestamp, void 0, {}) * -1), createSuccessJson(allSuggestions);
}
async function getTagSuggestions(urlBase) {
  let dbRes = await queryDb(urlBase, `SELECT Q1.*, user.username AS modName 
      FROM (
        SELECT
            keywordsuggestion.id AS id,
            keywordsuggestion.keywordId AS keywordId,
            keyword.KeywordName AS keywordName,
            comic.name AS comicName,
            comic.id AS comicId,
            isAdding,
            status,
            keywordsuggestion.timestamp,
            userId,
            username,
            userIP,
            modId
          FROM keywordsuggestion
          INNER JOIN comic ON (comic.id = keywordsuggestion.comicId)
          INNER JOIN keyword ON (keyword.Id = keywordsuggestion.keywordId)
          LEFT JOIN user ON (user.id = keywordsuggestion.userId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting tag suggestions") : {
    data: dbRes.result.map((dbTagSugg) => ({
      type: "tagSuggestion",
      id: dbTagSugg.id,
      primaryField: dbTagSugg.comicName,
      secondaryField: `${dbTagSugg.isAdding === 1 ? "ADD" : "REMOVE"} ${dbTagSugg.keywordName}`,
      isProcessed: dbTagSugg.status !== "pending",
      timestamp: dbTagSugg.timestamp,
      user: dbTagSugg.userId ? { userId: dbTagSugg.userId, username: dbTagSugg.username } : { ip: dbTagSugg.userIP },
      verdict: dbTagSugg.status === "approved" ? "Approved" : dbTagSugg.status === "rejected" ? "Rejected" : void 0,
      assignedMod: dbTagSugg.modId && dbTagSugg.modName ? { userId: dbTagSugg.modId, username: dbTagSugg.modName } : void 0,
      isAdding: dbTagSugg.isAdding === 1,
      tagId: dbTagSugg.keywordId,
      comicId: dbTagSugg.comicId
    }))
  };
}
async function getProblems(urlBase) {
  let dbRes = await queryDb(urlBase, `SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comicproblem.id AS id,
          comicproblemcategory.Name AS categoryName,
          description,
          comic.name AS comicName,
          comic.id AS comicId,
          comicproblem.status,
          comicproblem.timestamp,
          userId,
          userIP,
          user.username AS username,
          modId
        FROM comicproblem
        INNER JOIN comicproblemcategory ON (comicproblemcategory.id = comicproblem.problemCategoryId)
        INNER JOIN comic ON (comic.id = comicproblem.comicId)
        LEFT JOIN user ON (user.id = comicproblem.userId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting comic problems") : {
    data: dbRes.result.map((dbComicProblem) => ({
      type: "comicProblem",
      id: dbComicProblem.id,
      comicId: dbComicProblem.comicId,
      primaryField: dbComicProblem.comicName,
      secondaryField: dbComicProblem.categoryName,
      description: dbComicProblem.description,
      isProcessed: dbComicProblem.status !== "pending",
      timestamp: dbComicProblem.timestamp,
      user: dbComicProblem.userId ? { userId: dbComicProblem.userId, username: dbComicProblem.username } : { ip: dbComicProblem.userIP },
      verdict: dbComicProblem.status === "approved" ? "Approved" : dbComicProblem.status === "rejected" ? "Rejected" : void 0,
      assignedMod: dbComicProblem.modId && dbComicProblem.modName ? { userId: dbComicProblem.modId, username: dbComicProblem.modName } : void 0
    }))
  };
}
async function getComicSuggestions(urlBase) {
  let dbRes = await queryDb(urlBase, `SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comicsuggestion.id AS id,
          comicsuggestion.name AS comicName,
          description AS description,
          artistName AS artistName,
          comicsuggestion.status AS status,
          comicsuggestion.timestamp AS timestamp,
          verdict,
          userId,
          userIP,
          user.username AS username,
          modId AS modId,
          modComment
        FROM comicsuggestion
        LEFT JOIN user ON (user.id = comicsuggestion.userId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting comic suggestions") : {
    data: dbRes.result.map((dbComicSugg) => {
      let verdictText;
      return (dbComicSugg.status === "approved" || dbComicSugg.status === "rejected") && (verdictText = dbComicSugg.status === "approved" ? "Approved" : "Rejected"), dbComicSugg.verdict === "bad" && (verdictText += " - bad info"), dbComicSugg.verdict === "good" && (verdictText += " - excellent info"), dbComicSugg.modComment && (verdictText += ` - mod comment: ${dbComicSugg.modComment}`), {
        type: "comicSuggestion",
        id: dbComicSugg.id,
        primaryField: `${dbComicSugg.comicName} - ${dbComicSugg.artistName}`,
        description: dbComicSugg.description,
        isProcessed: dbComicSugg.status !== "pending",
        timestamp: dbComicSugg.timestamp,
        user: dbComicSugg.userId ? { userId: dbComicSugg.userId, username: dbComicSugg.username } : { ip: dbComicSugg.userIP },
        verdict: verdictText,
        assignedMod: dbComicSugg.modId && dbComicSugg.modName ? { userId: dbComicSugg.modId, username: dbComicSugg.modName } : void 0
      };
    })
  };
}
async function getComicUploads(urlBase) {
  let dbRes = await queryDb(urlBase, `
      SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comic.id,
          comic.name AS comicName,
          comic.id AS comicId,
          artist.name AS artistName,
          publishStatus,
          verdict,
          timestamp,
          comicmetadata.uploadUserId,
          comicmetadata.uploadUserIP,
          comicmetadata.originalNameIfRejected,
          user.username AS uploadUsername,
          modId,
          modComment
        FROM comic
        INNER JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
        INNER JOIN artist ON (artist.id = comic.artist)
        LEFT JOIN user ON (user.id = comicmetadata.uploadUserId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting comic uploads") : {
    data: dbRes.result.filter(
      (dbComicUpload) => !(dbComicUpload.publishStatus !== "uploaded" && !dbComicUpload.modId)
    ).map((dbComicUpload) => {
      let fullVerdictText = "", isProcessed = dbComicUpload.publishStatus !== "uploaded";
      if (isProcessed && !dbComicUpload.uploadUserId && (dbComicUpload.publishStatus === "pending" && (fullVerdictText = "Approved, set to pending"), dbComicUpload.publishStatus === "rejected" && (fullVerdictText = "Rejected"), dbComicUpload.publishStatus === "rejected-list" && (fullVerdictText = "Rejected, added to ban list")), isProcessed && dbComicUpload.verdict) {
        let verdictText = CONTRIBUTION_POINTS.comicUpload[dbComicUpload.verdict].actionDashboardDescription;
        fullVerdictText = dbComicUpload.verdict === "rejected" || dbComicUpload.verdict === "rejected-list" ? "Rejected" : "Approved", verdictText && (fullVerdictText += ` - ${verdictText}`), dbComicUpload.modComment && (fullVerdictText += ` - mod comment: ${dbComicUpload.modComment}`);
      }
      let comicName = dbComicUpload.comicName;
      return dbComicUpload.publishStatus === "rejected" && (comicName = dbComicUpload.originalNameIfRejected || comicName), {
        type: "comicUpload",
        id: dbComicUpload.id,
        comicId: dbComicUpload.comicId,
        primaryField: `${comicName} - ${dbComicUpload.artistName}`,
        isProcessed: dbComicUpload.publishStatus !== "uploaded",
        timestamp: dbComicUpload.timestamp,
        user: dbComicUpload.uploadUsername ? { userId: dbComicUpload.uploadUserId, username: dbComicUpload.uploadUsername } : { ip: dbComicUpload.uploadUserIP },
        verdict: isProcessed ? fullVerdictText : void 0,
        assignedMod: dbComicUpload.modId && dbComicUpload.modName ? { userId: dbComicUpload.modId, username: dbComicUpload.modName } : void 0
      };
    })
  };
}
async function getPendingComicProblems(urlBase) {
  let dbRes = await queryDb(urlBase, `
    SELECT Q1.*, user.username AS pendingProblemModName
    FROM (
      SELECT
        comic.name AS comicName,
        comic.id AS comicId,
        artist.name AS artistName,
        comicmetadata.uploadUserId,
        comicmetadata.uploadUserIP,
        user.username AS uploadUsername,
        pendingProblemModId,
        timestamp,
        errorText
      FROM comic
      INNER JOIN artist ON (artist.id = comic.artist)
      INNER JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
      LEFT JOIN user ON (user.id = comicmetadata.uploadUserId)
      WHERE publishStatus = 'pending'
      AND errorText IS NOT NULL
    ) AS Q1
    LEFT JOIN user ON (Q1.pendingProblemModId = user.id)
  `);
  return dbRes.isError ? makeDbErrObj(dbRes, "Error getting pending comics") : {
    data: dbRes.result.map((dbPending) => ({
      type: "pendingComicProblem",
      id: dbPending.comicId,
      comicId: dbPending.comicId,
      primaryField: `${dbPending.comicName} - ${dbPending.artistName}`,
      isProcessed: !1,
      timestamp: dbPending.timestamp,
      user: dbPending.uploadUserId && dbPending.uploadUsername ? {
        userId: dbPending.uploadUserId,
        username: dbPending.uploadUsername
      } : { ip: dbPending.uploadUserIP },
      verdict: void 0,
      assignedMod: dbPending.pendingProblemModId && dbPending.pendingProblemModName ? {
        userId: dbPending.pendingProblemModId,
        username: dbPending.pendingProblemModName
      } : void 0
    }))
  };
}

// app/routes/api/admin/schedule-comic.ts
var schedule_comic_exports = {};
__export(schedule_comic_exports, {
  action: () => action27,
  scheduleComic: () => scheduleComic2
});
async function action27(args) {
  let user = await redirectIfNotMod(args), urlBase = args.context.DB_API_URL_BASE, formDataBody = await args.request.formData(), formComicId = formDataBody.get("comicId"), formPublishDate = formDataBody.get("publishDate");
  if (!formComicId)
    return create400Json("Missing comicId");
  if (!formPublishDate)
    return create400Json("Missing publishDate");
  let err = await scheduleComic2(
    urlBase,
    parseInt(formComicId.toString()),
    formPublishDate.toString(),
    user.userId
  );
  return err ? processApiError("Error in /schedule-comic", err) : createSuccessJson();
}
async function scheduleComic2(urlBase, comicId, publishDate, modId) {
  let metadataQuery = "UPDATE comicmetadata SET publishDate = ?, scheduleModId = ?, publishingQueuePos = NULL WHERE comicId = ?", comicQuery = "UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?", [metadataDbRes, comicDbRes] = await Promise.all([
    queryDb(urlBase, metadataQuery, [publishDate, modId, comicId]),
    queryDb(urlBase, comicQuery, [comicId])
  ]), logCtx = { comicId, publishDate, modId };
  if (metadataDbRes.isError)
    return makeDbErr(metadataDbRes, "Could not update metadata table", logCtx);
  if (comicDbRes.isError)
    return makeDbErr(comicDbRes, "Could not update comic table", logCtx);
  recalculatePublishingQueue(urlBase);
}

// app/routes/contribute/join-us/index.tsx
var join_us_exports = {};
__export(join_us_exports, {
  default: () => JoinUs,
  loader: () => authLoader
});
var import_react39 = require("@remix-run/react"), import_md14 = require("react-icons/md");
var import_jsx_dev_runtime44 = require("react/jsx-dev-runtime");
function JoinUs() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("h1", { children: "Becoming a mod" }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 12,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("p", { className: "mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)(BackToContribute, {}, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 14,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 13,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("p", { className: "mb-4", children: "Yiffer.xyz would not be what it is without our wonderful mods." }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 17,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("p", { className: "mb-4", children: "If we are satisfied with the amount of mods we currently have, you may be put on a waiting list. While it might be the case that more is better, we believe it wise to keep the number from being too high." }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 20,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)(ApplyLink, {}, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("h3", { className: "font-bold", children: "What are a mod's tasks?" }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("p", { children: "In short, helping out with keeping comics up to date, adding new ones, and processing user suggestions. We have built a very well functioning admin panel which should make this as comfortable as possible, you should even be able to do the last part - processing user suggestions - on your phone comfortably. Longer and more comprehensive list of the tasks:" }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("ul", { className: "pl-4 mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("li", { className: "mt-3", children: "Processing comic suggestions from others (rejecting them, or uploading the comic with pages, information, and tags)" }, void 0, !1, {
        fileName: "app/routes/contribute/join-us/index.tsx",
        lineNumber: 36,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("li", { className: "mt-3", children: "Adding pages to existing comics as they are updated. Additionally swap, replace, insert pages, and update thumbnails as needed" }, void 0, !1, {
        fileName: "app/routes/contribute/join-us/index.tsx",
        lineNumber: 40,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("li", { className: "mt-3", children: "Processing tag suggestions from other users (suggestions of adding/removing tags to a comic)" }, void 0, !1, {
        fileName: "app/routes/contribute/join-us/index.tsx",
        lineNumber: 44,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("li", { className: "mt-3", children: "Adding tags to comics where needed" }, void 0, !1, {
        fileName: "app/routes/contribute/join-us/index.tsx",
        lineNumber: 48,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("li", { className: "mt-3", children: "Keeping artist information up to date" }, void 0, !1, {
        fileName: "app/routes/contribute/join-us/index.tsx",
        lineNumber: 49,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("li", { className: "mt-3", children: "When we implement comments at some point, moderating these will also be a mod's job" }, void 0, !1, {
        fileName: "app/routes/contribute/join-us/index.tsx",
        lineNumber: 50,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("h3", { className: "font-bold", children: 'How much do I have to "work"?' }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 56,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("p", { className: "mb-4", children: 'There is no defined lower requirement for how much a mod should contribute. In the admin panel, there is a "Mod scoreboard" that we hope might motivate people to do more, but you should not feel bad for not being far up. If we notice that someone is really slacking off, and see no activity for months, we will always message the person in question before taking any action. If you at any point wish to stop being a mod, please do say so instead of simply going inactive.' }, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 57,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)(ApplyLink, {}, void 0, !1, {
      fileName: "app/routes/contribute/join-us/index.tsx",
      lineNumber: 65,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/join-us/index.tsx",
    lineNumber: 11,
    columnNumber: 5
  }, this);
}
var ApplyLink = () => (0, import_react39.useLoaderData)() ? /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("p", { className: "mb-6", children: /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)(
  Link,
  {
    href: "/contribute/join-us/apply",
    text: "Apply as a mod here",
    IconRight: import_md14.MdArrowForward
  },
  void 0,
  !1,
  {
    fileName: "app/routes/contribute/join-us/index.tsx",
    lineNumber: 75,
    columnNumber: 7
  },
  this
) }, void 0, !1, {
  fileName: "app/routes/contribute/join-us/index.tsx",
  lineNumber: 74,
  columnNumber: 5
}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("p", { className: "mb-6", children: [
  /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)("b", { children: "To apply as a mod, " }, void 0, !1, {
    fileName: "app/routes/contribute/join-us/index.tsx",
    lineNumber: 83,
    columnNumber: 7
  }, this),
  /* @__PURE__ */ (0, import_jsx_dev_runtime44.jsxDEV)(Link, { href: "/login", text: "Log in", Icon: import_md14.MdLogin }, void 0, !1, {
    fileName: "app/routes/contribute/join-us/index.tsx",
    lineNumber: 84,
    columnNumber: 7
  }, this)
] }, void 0, !0, {
  fileName: "app/routes/contribute/join-us/index.tsx",
  lineNumber: 82,
  columnNumber: 5
}, this);

// app/routes/api/admin/assign-action.ts
var assign_action_exports = {};
__export(assign_action_exports, {
  action: () => action28
});
async function action28(args) {
  let { fields, isUnauthorized } = await parseFormJson(args, "mod");
  if (isUnauthorized)
    return new Response("Unauthorized", { status: 401 });
  let urlBase = args.context.DB_API_URL_BASE, err = await assignActionToMod(
    urlBase,
    fields.actionId,
    fields.actionType,
    fields.modId
  );
  return err ? processApiError("Error in /assign-action", err) : createSuccessJson();
}
async function assignActionToMod(urlBase, actionId, actionType, modId) {
  let table = "", identifyingColumn = "id", modIdColumn = "modId";
  actionType === "comicUpload" && (table = "comicmetadata", identifyingColumn = "comicId"), actionType === "comicSuggestion" && (table = "comicsuggestion"), actionType === "comicProblem" && (table = "comicproblem"), actionType === "pendingComicProblem" && (table = "comicmetadata", identifyingColumn = "comicId", modIdColumn = "pendingProblemModId");
  let query = `UPDATE ${table} SET ${modIdColumn} = ? WHERE ${identifyingColumn} = ?`, dbRes = await queryDb(urlBase, query, [modId, actionId]);
  if (dbRes.isError)
    return makeDbErr(dbRes, "Error assigning action to mod", {
      actionId,
      actionType,
      modId
    });
}

// app/routes/contribute/upload/index.tsx
var upload_exports = {};
__export(upload_exports, {
  action: () => action29,
  default: () => Upload2,
  links: () => links2,
  loader: () => loader14
});
var import_react47 = require("@remix-run/react"), import_react48 = require("react");

// app/routes/contribute/upload/step1.tsx
var step1_exports = {};
__export(step1_exports, {
  default: () => Step1
});
var import_ri2 = require("react-icons/ri"), import_react40 = require("react"), import_jsx_dev_runtime45 = require("react/jsx-dev-runtime");
function Step1({ onNext }) {
  let [hasCheckedPublic, setHasCheckedPublic] = (0, import_react40.useState)(!1), [hasCheckedResolution, setHasCheckedResolution] = (0, import_react40.useState)(!1);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)(import_jsx_dev_runtime45.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("h2", { children: "Introduction" }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 16,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("p", { children: "Thank you for helping out! We believe in the community, and allow anyone to contribute. If this feature is abused, we will have to restrict it. Please help us make this site even better by following the rules below carefully. If we repeatedly have to reject your suggestions, you will be prohibited from suggesting comics." }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 17,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("p", { className: "mt-4", children: "If you would like to follow your suggestion\u2019s status, create an account! You can then follow updates in the \u201Cview your contributions\u201D section above. Having a user will also earn you points in the scoreboard on the previous page. The more accurate the information you provide is, the higher your contribution score will be." }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("h2", { className: "mt-4", children: "Before you begin: requirements" }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("ul", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("li", { children: "The comic must be at least four pages long." }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 32,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("li", { children: [
        "The comic must be a ",
        /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("i", { children: "comic" }, void 0, !1, {
          fileName: "app/routes/contribute/upload/step1.tsx",
          lineNumber: 34,
          columnNumber: 31
        }, this),
        ", not a collage (group of pictures with no story)."
      ] }, void 0, !0, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 33,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("li", { children: "The comic cannot have censoring bars." }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 36,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("li", { children: "Colored comics are preferred. If not, it must be of good quality." }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 37,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("li", { children: "In general, low quality (\u201Cpoorly drawn\u201D) comics will not be accepted." }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 38,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("li", { children: "No cub comics." }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 39,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("li", { children: "Pages must be in jpg og png format." }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 40,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("h2", { className: "mt-4", children: "Checklist" }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 43,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("u", { children: "All" }, void 0, !1, {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 45,
        columnNumber: 9
      }, this),
      " pages uploaded must be publicly visible. A comic with some of its pages exclusive to Patreon or similar services will be rejected."
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 44,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)(
      Checkbox,
      {
        label: "I confirm that the pages are publicly available",
        checked: hasCheckedPublic,
        onChange: (v) => setHasCheckedPublic(v),
        className: "mt-2"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 48,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)("p", { className: "mt-4", children: "The pages uploaded must be of the highest possible resolution that is publicly available. Resized and compressed pages, often found on third-party websites, we not be accepted. Please check the artist's public galleries (like FurAffinity) to ensure that the page resolution is correct." }, void 0, !1, {
      fileName: "app/routes/contribute/upload/step1.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)(
      Checkbox,
      {
        label: "I confirm that the pages are in the highest resolution publicly available",
        checked: hasCheckedResolution,
        onChange: (v) => setHasCheckedResolution(v),
        className: "mt-2"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 61,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime45.jsxDEV)(
      Button,
      {
        text: "Continue",
        disabled: !hasCheckedPublic || !hasCheckedResolution,
        endIcon: import_ri2.RiArrowRightLine,
        variant: "contained",
        color: "primary",
        onClick: onNext,
        className: "mt-6"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/contribute/upload/step1.tsx",
        lineNumber: 68,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/upload/step1.tsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}

// app/components/ComicManager/ComicData.tsx
var import_react45 = require("react");

// app/components/Checkbox/CheckboxUncontrolled.tsx
var import_react41 = require("react");
var import_jsx_dev_runtime46 = require("react/jsx-dev-runtime");
function CheckboxUncontrolled({
  label,
  className = "",
  onChange,
  ...props
}) {
  let [state, setState] = (0, import_react41.useState)(!1);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime46.jsxDEV)(
    Checkbox,
    {
      label,
      className,
      checked: state,
      onChange: (newVal) => {
        setState(newVal), onChange && onChange(newVal);
      },
      ...props
    },
    void 0,
    !1,
    {
      fileName: "app/components/Checkbox/CheckboxUncontrolled.tsx",
      lineNumber: 19,
      columnNumber: 5
    },
    this
  );
}

// app/components/SearchableSelect/SearchableSelect.tsx
var import_react42 = require("react"), import_ri3 = require("react-icons/ri");
var import_jsx_dev_runtime47 = require("react/jsx-dev-runtime");
function SearchableSelect({
  options,
  title = "",
  value,
  onValueCleared,
  onChange,
  error = !1,
  maxWidth = 999999,
  isFullWidth = !1,
  initialWidth = 0,
  // TODO needed?
  placeholder = "",
  name,
  disabled = !1,
  mobileCompact = !1,
  equalValueFunc,
  className = "",
  ...props
}) {
  let [isOpen, setIsOpen] = (0, import_react42.useState)(!1), [searchText, setSearchText] = (0, import_react42.useState)(""), [minWidth, setMinWidth] = (0, import_react42.useState)(0), [width, setWidth] = (0, import_react42.useState)(0), [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = (0, import_react42.useState)(-1), windowSize = useWindowSize(), selectItemContainerRef = (0, import_react42.useRef)(null), inputRef = (0, import_react42.useRef)(null), windowWidth = windowSize.width || 0;
  (0, import_react42.useEffect)(() => {
    tryComputeWidth();
  }, []), (0, import_react42.useEffect)(() => {
    searchText && !isOpen && setIsOpen(!0), setCurrentlyHighlightedIndex(-1);
  }, [searchText]);
  async function tryComputeWidth() {
    let isFinished = !1;
    for (; !isFinished; )
      await waitMillisec2(25), isFinished = computeWidth();
  }
  function computeWidth() {
    let container = selectItemContainerRef.current;
    if (container && container.children.length > 0) {
      let maxChildWidth = 0;
      for (let child of container.children)
        child.clientWidth > maxChildWidth && (maxChildWidth = child.clientWidth);
      return minWidth > maxWidth ? setWidth(maxWidth) : setMinWidth(maxChildWidth), !0;
    }
    return !1;
  }
  let minWidthStyle = (0, import_react42.useMemo)(() => width || isFullWidth ? {} : minWidth ? { minWidth: `${minWidth + 0}px` } : initialWidth ? { minWidth: `${initialWidth + 0}px` } : {}, [initialWidth, isFullWidth, minWidth, width]), widthStyle = (0, import_react42.useMemo)(() => isFullWidth ? { width: "100%" } : width ? { width: `${width}px` } : {}, [isFullWidth, width]);
  async function waitMillisec2(millisec) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), millisec);
    });
  }
  function onSelected(clickedValue) {
    onChange(clickedValue), clearAndCloseSearch();
  }
  function clearAndCloseSearch({ avoidIfHighlighted = !1 } = {}) {
    avoidIfHighlighted && currentlyHighlightedIndex !== -1 || (setSearchText(""), setIsOpen(!1), setHighlightedIndex(-1), inputRef.current?.blur());
  }
  function onKeyDown(event) {
    event.key === "Enter" ? currentlyHighlightedIndex !== -1 && filteredOptions.length > 0 ? onSelected(filteredOptions[currentlyHighlightedIndex].value) : currentlyHighlightedIndex === -1 && filteredOptions.length > 0 && isOpen && onSelected(filteredOptions[0].value) : event.key === "ArrowDown" ? isOpen ? currentlyHighlightedIndex === filteredOptions.length - 1 ? setHighlightedIndex(0) : setHighlightedIndex(currentlyHighlightedIndex + 1) : (setIsOpen(!0), setHighlightedIndex(0)) : event.key === "ArrowUp" ? isOpen ? setHighlightedIndex(currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1 ? filteredOptions.length - 1 : currentlyHighlightedIndex - 1) : (setIsOpen(!0), setHighlightedIndex(filteredOptions.length - 1)) : event.key === "Escape" && clearAndCloseSearch();
  }
  function setHighlightedIndex(indexNum) {
    if (indexNum !== -1 && selectItemContainerRef.current) {
      let option = selectItemContainerRef.current.children[indexNum];
      option && option.scrollIntoView({ block: "nearest", inline: "start" });
    }
    setCurrentlyHighlightedIndex(indexNum);
  }
  let filteredOptions = (0, import_react42.useMemo)(() => searchText ? options.filter((option) => option.text.toLowerCase().includes(searchText.toLowerCase())) : options, [options, searchText]);
  function onFilledInputActivated() {
    onValueCleared(), setIsOpen(!0);
  }
  let convertedValue = (0, import_react42.useMemo)(() => equalValueFunc ? options.find((option) => equalValueFunc(option.value, value)) : options.find((option) => option.value === value), [options, value]), borderStyle = error || disabled ? "" : { borderImage: "linear-gradient(to right, #9aebe7, #adfee0) 1" }, inputClassname = `text-text-light dark:text-text-dark bg-transparent border border-0 border-b-2 px-2 after:absolute
    disabled:border-gray-800 dark:disabled:border-gray-600
    after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
    after:border-t-text-light dark:after:border-t-text-dark after:right-3
    placeholder-gray-800 dark:placeholder-gray-700 w-full outline-none`;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
    "div",
    {
      onKeyDown,
      className: `hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit outline-none h-9 leading-9 pt-3 box-content ${className}`,
      style: { ...minWidthStyle, ...widthStyle },
      ...props,
      children: [
        title && /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)("label", { className: "absolute text-sm top-0 left-2", children: title }, void 0, !1, {
          fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
          lineNumber: 226,
          columnNumber: 17
        }, this),
        value ? /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
          "input",
          {
            type: "text",
            autoComplete: "off",
            value: convertedValue?.text || "",
            disabled,
            style: { ...borderStyle },
            onFocus: onFilledInputActivated,
            className: inputClassname,
            onChange: () => {
            }
          },
          void 0,
          !1,
          {
            fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
            lineNumber: 229,
            columnNumber: 9
          },
          this
        ) : /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
          "input",
          {
            type: "text",
            autoComplete: "off",
            value: searchText || "",
            disabled,
            name,
            onChange: (e) => setSearchText(e.target.value),
            onFocus: () => setIsOpen(!0),
            onClick: () => setIsOpen(!0),
            style: { ...borderStyle },
            className: inputClassname,
            placeholder,
            onBlur: () => clearAndCloseSearch({ avoidIfHighlighted: !0 }),
            ref: inputRef
          },
          void 0,
          !1,
          {
            fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
            lineNumber: 240,
            columnNumber: 9
          },
          this
        ),
        value && /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
          "span",
          {
            className: "absolute right-2 top-3 hover:cursor-pointer",
            onClick: onValueCleared,
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(import_ri3.RiCloseLine, {}, void 0, !1, {
              fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
              lineNumber: 262,
              columnNumber: 11
            }, this)
          },
          void 0,
          !1,
          {
            fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
            lineNumber: 258,
            columnNumber: 9
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
          "div",
          {
            className: `${isOpen ? "" : "invisible"} overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`,
            ref: selectItemContainerRef,
            children: [
              filteredOptions.map(({ text, value: optionValue }, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
                "div",
                {
                  onClick: () => onSelected(optionValue),
                  onMouseEnter: () => setHighlightedIndex(index),
                  onMouseLeave: () => setHighlightedIndex(-1),
                  className: `z-40 hover:cursor-pointer px-3 whitespace-nowrap  ${currentlyHighlightedIndex === index ? "bg-gradient-to-r from-theme1-primary to-theme2-primary text-text-light " : ""}}`,
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)("p", { className: mobileCompact && windowWidth < 460 ? "text-sm leading-7" : "", children: text }, void 0, !1, {
                    fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
                    lineNumber: 284,
                    columnNumber: 13
                  }, this)
                },
                text,
                !1,
                {
                  fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
                  lineNumber: 273,
                  columnNumber: 11
                },
                this
              )),
              filteredOptions.length === 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
                "div",
                {
                  className: "z-40 px-3 whitespace-nowrap text-gray-700 hover:cursor-default",
                  onClick: () => onSelected(null),
                  children: "No results"
                },
                void 0,
                !1,
                {
                  fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
                  lineNumber: 290,
                  columnNumber: 11
                },
                this
              )
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
            lineNumber: 266,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime47.jsxDEV)(
          "input",
          {
            type: "text",
            name,
            value: convertedValue?.text || "",
            disabled,
            onChange: () => {
            },
            readOnly: !0,
            hidden: !0
          },
          void 0,
          !1,
          {
            fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
            lineNumber: 299,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/components/SearchableSelect/SearchableSelect.tsx",
      lineNumber: 219,
      columnNumber: 5
    },
    this
  );
}

// app/components/ComicManager/ComicNameEditor.tsx
var import_react43 = require("react");
var import_jsx_dev_runtime48 = require("react/jsx-dev-runtime");
function ComicNameEditor({
  comicName,
  setIsLegalComicnameState,
  // For parent component, validation
  onUpdate,
  existingComic
}) {
  let similarComicsFetcher = useGoodFetcher({
    url: "/api/search-similarly-named-comic",
    method: "post",
    onFinish: () => {
      setSimilarComics(similarComicsFetcher.data);
    }
  }), [similarComics, setSimilarComics] = (0, import_react43.useState)(), [hasConfirmedNewComic, setHasConfirmedNewComic] = (0, import_react43.useState)(!1), debounceTimeoutRef = (0, import_react43.useRef)(null);
  (0, import_react43.useEffect)(onComicNameChange, [comicName]), (0, import_react43.useEffect)(() => {
    if (!similarComics) {
      setIsLegalComicnameState(!1);
      return;
    }
    let isExactMatch = similarComics.exactMatchComic || similarComics.exactMatchRejectedComic, isAnySimilar2 = similarComics.similarComics.length > 0 || similarComics.similarRejectedComics.length > 0, isLegal = !1;
    !isExactMatch && comicName.length > 2 && (isLegal = !isAnySimilar2 || hasConfirmedNewComic), setIsLegalComicnameState(isLegal);
  }, [similarComics, hasConfirmedNewComic]);
  function onComicNameChange() {
    if (setIsLegalComicnameState(!1), setHasConfirmedNewComic(!1), setSimilarComics(void 0), existingComic && existingComic.name === comicName) {
      setIsLegalComicnameState(!0);
      return;
    }
    debounceTimeoutRef.current && clearTimeout(debounceTimeoutRef.current), !(comicName.length < 3) && (debounceTimeoutRef.current = setTimeout(() => {
      let body = { comicName };
      existingComic && (body.excludeName = existingComic.name), similarComicsFetcher.submit(body);
    }, 1e3));
  }
  let isExactMath = similarComics?.exactMatchComic || similarComics?.exactMatchRejectedComic, isAnySimilar = similarComics && !isExactMath && (similarComics.similarComics.length > 0 || similarComics.similarRejectedComics.length > 0);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(import_jsx_dev_runtime48.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)("div", { className: "flex flex-row gap-4 flex-wrap", children: /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(
      TextInput,
      {
        label: "Comic name",
        name: "comicName",
        value: comicName,
        onChange: onUpdate
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/ComicNameEditor.tsx",
        lineNumber: 91,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/components/ComicManager/ComicNameEditor.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, this),
    similarComics && /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(import_jsx_dev_runtime48.Fragment, { children: [
      isAnySimilar && /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(import_jsx_dev_runtime48.Fragment, { children: [
        !hasConfirmedNewComic && /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(InfoBox, { variant: "warning", boldText: !1, className: "mt-2 w-fit", children: [
          similarComics.similarComics.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(import_jsx_dev_runtime48.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)("p", { children: "The following comics with similar names already exist in the system:" }, void 0, !1, {
              fileName: "app/components/ComicManager/ComicNameEditor.tsx",
              lineNumber: 107,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)("ul", { children: similarComics.similarComics.map((comicName2) => /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)("li", { children: comicName2 }, comicName2, !1, {
              fileName: "app/components/ComicManager/ComicNameEditor.tsx",
              lineNumber: 113,
              columnNumber: 27
            }, this)) }, void 0, !1, {
              fileName: "app/components/ComicManager/ComicNameEditor.tsx",
              lineNumber: 111,
              columnNumber: 23
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/ComicManager/ComicNameEditor.tsx",
            lineNumber: 106,
            columnNumber: 21
          }, this),
          similarComics.similarRejectedComics.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(import_jsx_dev_runtime48.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)("p", { children: "The following comics with similar names have been rejected. If one of these is your comic, do not upload it:" }, void 0, !1, {
              fileName: "app/components/ComicManager/ComicNameEditor.tsx",
              lineNumber: 120,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)("ul", { children: similarComics.similarRejectedComics.map((comicName2) => /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)("li", { children: comicName2 }, comicName2, !1, {
              fileName: "app/components/ComicManager/ComicNameEditor.tsx",
              lineNumber: 126,
              columnNumber: 27
            }, this)) }, void 0, !1, {
              fileName: "app/components/ComicManager/ComicNameEditor.tsx",
              lineNumber: 124,
              columnNumber: 23
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/ComicManager/ComicNameEditor.tsx",
            lineNumber: 119,
            columnNumber: 21
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/ComicManager/ComicNameEditor.tsx",
          lineNumber: 104,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(
          Checkbox,
          {
            label: "This is not one of the above comics",
            checked: hasConfirmedNewComic,
            onChange: setHasConfirmedNewComic,
            className: "mt-2"
          },
          void 0,
          !1,
          {
            fileName: "app/components/ComicManager/ComicNameEditor.tsx",
            lineNumber: 134,
            columnNumber: 15
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/ComicManager/ComicNameEditor.tsx",
        lineNumber: 102,
        columnNumber: 13
      }, this),
      similarComics.exactMatchComic && /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(
        InfoBox,
        {
          text: `A comic with this name already exists in the system. You cannot submit this comic name. If you think this is a different comic with the same name, you can add "(<artistname>)" to the end of the comic's name. Please verify that this is not a duplicate before submitting.`,
          variant: "error",
          className: "mt-2 w-fit"
        },
        void 0,
        !1,
        {
          fileName: "app/components/ComicManager/ComicNameEditor.tsx",
          lineNumber: 144,
          columnNumber: 13
        },
        this
      ),
      similarComics.exactMatchRejectedComic && /* @__PURE__ */ (0, import_jsx_dev_runtime48.jsxDEV)(
        InfoBox,
        {
          text: "A comic with this name has been rejected. You cannot submit this comic name.",
          variant: "error",
          className: "mt-2 w-fit"
        },
        void 0,
        !1,
        {
          fileName: "app/components/ComicManager/ComicNameEditor.tsx",
          lineNumber: 151,
          columnNumber: 13
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/components/ComicManager/ComicNameEditor.tsx",
      lineNumber: 100,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/ComicManager/ComicNameEditor.tsx",
    lineNumber: 89,
    columnNumber: 5
  }, this);
}

// app/components/ArtistEditor.tsx
var import_react44 = require("react"), import_md15 = require("react-icons/md");
var import_jsx_dev_runtime49 = require("react/jsx-dev-runtime");
function ArtistEditor({
  newArtistData,
  existingArtist,
  onUpdate,
  hideBorderTitle = !1,
  className = ""
}) {
  let similarArtistsFetcher = useGoodFetcher({
    url: "/api/search-similar-artist",
    method: "post",
    onFinish: () => {
      setSimilarArtists(similarArtistsFetcher.data);
    }
  }), [similarArtists, setSimilarArtists] = (0, import_react44.useState)(), [hasConfirmedNewArtist, setHasConfirmedNewArtist] = (0, import_react44.useState)(!1), [noLinks, setNoLinks] = (0, import_react44.useState)(!1), [isLinksError, setIsLinksError] = (0, import_react44.useState)(!0), debounceTimeoutRef = (0, import_react44.useRef)(null);
  function updateArtist(newArtist) {
    onUpdate(newArtist);
  }
  (0, import_react44.useEffect)(() => {
    setHasConfirmedNewArtist(!1), setSimilarArtists(void 0), debounceTimeoutRef.current && clearTimeout(debounceTimeoutRef.current), !(newArtistData.artistName.length < 3 || newArtistData.artistName === existingArtist?.name) && (debounceTimeoutRef.current = setTimeout(() => {
      let body = { artistName: newArtistData.artistName };
      existingArtist && (body.excludeName = existingArtist.name), similarArtistsFetcher.submit(body);
    }, 1e3));
  }, [newArtistData.artistName, existingArtist?.name]), (0, import_react44.useEffect)(() => {
    let links3 = newArtistData.links;
    links3.length > 0 && links3.every((l) => l.length > 0) && updateArtist({ ...newArtistData, links: [...links3, ""] }), links3.every((l) => l.length === 0) || setNoLinks(!1);
  }, [newArtistData.links]), (0, import_react44.useEffect)(() => {
    let isLegal = !1;
    if (similarArtists) {
      let isExactMatch2 = similarArtists.exactMatchArtist || similarArtists.exactMatchBannedArtist, isAnyKindOfSimilarArtist = similarArtists.similarArtists.length > 0 || similarArtists.similarBannedArtists.length > 0;
      !isExactMatch2 && newArtistData.artistName.length > 2 && (isLegal = !isAnyKindOfSimilarArtist || hasConfirmedNewArtist);
    }
    updateArtist({
      ...newArtistData,
      isValidName: isLegal,
      areLinksValid: isLinksError
    });
  }, [similarArtists, hasConfirmedNewArtist, isLinksError]);
  let isExactMatch = similarArtists && (similarArtists.exactMatchArtist || similarArtists.exactMatchBannedArtist), isAnySimilar = !isExactMatch && similarArtists && (similarArtists.similarArtists.length > 0 || similarArtists.similarBannedArtists.length > 0);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
    "div",
    {
      className: `${hideBorderTitle ? "flex flex-col" : "my-4 p-4 border border-4 border-theme1-primary flex flex-col"} ${className}`,
      children: [
        !hideBorderTitle && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("h3", { children: "New artist" }, void 0, !1, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 123,
          columnNumber: 28
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
          TextInput,
          {
            label: "Artist name",
            name: "artistName",
            value: newArtistData.artistName,
            onChange: (newVal) => updateArtist({ ...newArtistData, artistName: newVal })
          },
          void 0,
          !1,
          {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 125,
            columnNumber: 7
          },
          this
        ),
        isExactMatch && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
          InfoBox,
          {
            variant: "error",
            className: "mt-2",
            text: similarArtists.exactMatchArtist ? "An artist with this name already exists in the system" : "An artist with this name has been banned or has requested their comics not be published here"
          },
          void 0,
          !1,
          {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 133,
            columnNumber: 9
          },
          this
        ),
        isAnySimilar && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(import_jsx_dev_runtime49.Fragment, { children: [
          !hasConfirmedNewArtist && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(InfoBox, { variant: "warning", className: "mt-2", boldText: !1, children: [
            similarArtists.similarArtists.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(import_jsx_dev_runtime49.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("p", { children: "The following existing artist names are somewhat similar to the one you entered:" }, void 0, !1, {
                fileName: "app/components/ArtistEditor.tsx",
                lineNumber: 150,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("ul", { children: similarArtists.similarArtists.map((name) => /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("li", { children: name }, name, !1, {
                fileName: "app/components/ArtistEditor.tsx",
                lineNumber: 156,
                columnNumber: 23
              }, this)) }, void 0, !1, {
                fileName: "app/components/ArtistEditor.tsx",
                lineNumber: 154,
                columnNumber: 19
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/ArtistEditor.tsx",
              lineNumber: 149,
              columnNumber: 17
            }, this),
            similarArtists.similarBannedArtists.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(import_jsx_dev_runtime49.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("p", { children: "The artists are somewhat similar to the one you entered, and have been banned or have requested their comics not be published here:" }, void 0, !1, {
                fileName: "app/components/ArtistEditor.tsx",
                lineNumber: 163,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("ul", { children: similarArtists.similarBannedArtists.map((name) => /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("li", { children: name }, name, !1, {
                fileName: "app/components/ArtistEditor.tsx",
                lineNumber: 169,
                columnNumber: 23
              }, this)) }, void 0, !1, {
                fileName: "app/components/ArtistEditor.tsx",
                lineNumber: 167,
                columnNumber: 19
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/ArtistEditor.tsx",
              lineNumber: 162,
              columnNumber: 17
            }, this)
          ] }, void 0, !0, {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 147,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
            Checkbox,
            {
              label: "This is not one of the above artists",
              checked: hasConfirmedNewArtist,
              onChange: setHasConfirmedNewArtist,
              className: "mt-2"
            },
            void 0,
            !1,
            {
              fileName: "app/components/ArtistEditor.tsx",
              lineNumber: 177,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 145,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("h4", { className: "mt-8", children: "E621 and Patreon" }, void 0, !1, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 186,
          columnNumber: 7
        }, this),
        !newArtistData.hasConfirmedNoE621Name && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
          TextInput,
          {
            label: "E621 name",
            name: "e621Name",
            value: newArtistData.e621Name,
            onChange: (newVal) => updateArtist({ ...newArtistData, e621Name: newVal }),
            className: "mt-2",
            helperText: "Only the name - not the full link",
            placeholder: 'e.g. "braeburned"',
            disabled: newArtistData.hasConfirmedNoE621Name
          },
          void 0,
          !1,
          {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 189,
            columnNumber: 9
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
          Checkbox,
          {
            label: "Artist is not on e621 (this is unlikely!)",
            checked: !!newArtistData.hasConfirmedNoE621Name,
            onChange: (newVal) => {
              let newArtist = { ...newArtistData, hasConfirmedNoE621Name: newVal };
              newVal && (newArtist.e621Name = ""), updateArtist(newArtist);
            },
            className: "mt-2"
          },
          void 0,
          !1,
          {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 201,
            columnNumber: 7
          },
          this
        ),
        !newArtistData.hasConfirmedNoPatreonName && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
          TextInput,
          {
            label: "Patreon name",
            name: "patreonName",
            value: newArtistData.patreonName,
            onChange: (newVal) => updateArtist({ ...newArtistData, patreonName: newVal }),
            className: "mt-6",
            helperText: "Only the name - not the full link",
            placeholder: 'e.g. "braeburned"',
            disabled: newArtistData.hasConfirmedNoPatreonName
          },
          void 0,
          !1,
          {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 215,
            columnNumber: 9
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
          Checkbox,
          {
            label: "Artist is not on Patreon",
            checked: !!newArtistData.hasConfirmedNoPatreonName,
            onChange: (newVal) => {
              let newArtist = { ...newArtistData, hasConfirmedNoPatreonName: newVal };
              newVal && (newArtist.patreonName = ""), updateArtist(newArtist);
            },
            className: "mt-2"
          },
          void 0,
          !1,
          {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 227,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("h4", { className: "mt-8", children: "Other links" }, void 0, !1, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 240,
          columnNumber: 7
        }, this),
        !hideBorderTitle && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("p", { className: "mb-4", children: "It's important to be on good terms with artists. Links to their profiles are vital. If you do not provide any links, or vastly insufficient ones, the comic might be rejected. Any website links go below here. Examples: Twitter, FurAffinity, Inkbunny, personal websites, etc. Full URLs." }, void 0, !1, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 242,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("p", { children: `Tips for finding good links: Check FurAffinity, and check the e621 artist page, by clicking the \u201C?\u201D next to the artist's name in the top left of any post tagged by them, as illustrated in the picture below. If you cannot find any other sites, make one last attempt by Googling "furry <artist name>"".` }, void 0, !1, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 250,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("p", { children: "!!!!e621 pic here!!!!" }, void 0, !1, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 257,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)("div", { className: "flex flex-col gap-2 mt-4", children: [
          !noLinks && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(import_jsx_dev_runtime49.Fragment, { children: [
            newArtistData.links.map((link, i) => {
              let isLastLink = i === newArtistData.links.length - 1;
              return /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
                "div",
                {
                  className: `flex flex-row -mt-1 items-end ${isLastLink ? "mr-10" : ""}`,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
                      TextInput,
                      {
                        label: "Link:",
                        name: `otherLink${i}`,
                        value: link,
                        placeholder: "e.g. https://twitter.com/braeburned",
                        onChange: (newVal) => {
                          let newLinks = [...newArtistData.links];
                          newLinks[i] = newVal, updateArtist({ ...newArtistData, links: newLinks });
                        },
                        className: "mt-2 grow",
                        disabled: noLinks
                      },
                      i,
                      !1,
                      {
                        fileName: "app/components/ArtistEditor.tsx",
                        lineNumber: 269,
                        columnNumber: 19
                      },
                      this
                    ),
                    !isLastLink && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
                      IconButton,
                      {
                        className: "ml-2 mt-4",
                        color: "primary",
                        variant: "naked",
                        icon: import_md15.MdDelete,
                        onClick: () => {
                          let newLinks = [...newArtistData.links];
                          newLinks.splice(i, 1), updateArtist({ ...newArtistData, links: newLinks });
                        }
                      },
                      void 0,
                      !1,
                      {
                        fileName: "app/components/ArtistEditor.tsx",
                        lineNumber: 285,
                        columnNumber: 21
                      },
                      this
                    )
                  ]
                },
                i,
                !0,
                {
                  fileName: "app/components/ArtistEditor.tsx",
                  lineNumber: 265,
                  columnNumber: 17
                },
                this
              );
            }),
            isLinksError && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
              InfoBox,
              {
                variant: "error",
                className: "mt-2 w-fit",
                text: 'Links must include "http://" or "https://"',
                showIcon: !0
              },
              void 0,
              !1,
              {
                fileName: "app/components/ArtistEditor.tsx",
                lineNumber: 302,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/components/ArtistEditor.tsx",
            lineNumber: 261,
            columnNumber: 11
          }, this),
          newArtistData.links.every((l) => l.length === 0) && /* @__PURE__ */ (0, import_jsx_dev_runtime49.jsxDEV)(
            Checkbox,
            {
              label: "Artist has no links (unlikely!)",
              checked: noLinks,
              onChange: setNoLinks,
              className: "mt-2"
            },
            void 0,
            !1,
            {
              fileName: "app/components/ArtistEditor.tsx",
              lineNumber: 313,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/ArtistEditor.tsx",
          lineNumber: 259,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/components/ArtistEditor.tsx",
      lineNumber: 118,
      columnNumber: 5
    },
    this
  );
}

// app/components/ComicManager/ComicData.tsx
var import_md16 = require("react-icons/md"), import_jsx_dev_runtime50 = require("react/jsx-dev-runtime"), categoryOptions = ["M", "F", "MF", "MM", "FF", "MF+", "I"].map((c) => ({
  value: c,
  text: c
})), classificationOptions = ["Furry", "Pokemon", "MLP", "Other"].map((c) => ({
  value: c,
  text: c
})), stateOptions = [
  { text: "Finished", value: "finished" },
  { text: "WIP", value: "wip" },
  { text: "Cancelled", value: "cancelled" }
];
function ComicDataEditor({
  artists,
  comics,
  comicData,
  onUpdate,
  existingComic,
  isAdminPanel = !1
}) {
  let [artistNotInList, setArtistNotInList] = (0, import_react45.useState)(!1), artistOptions = (0, import_react45.useMemo)(
    () => artists.map((a) => ({ value: a.id, text: a.name })),
    [artists]
  ), allComicOptions = (0, import_react45.useMemo)(() => comics.map((c) => ({ value: c, text: c.name })), [comics]);
  function getComicLink(comic) {
    if (comic.publishStatus === "published")
      return `/${comic.name}`;
    if ((comic.publishStatus === "pending" || comic.publishStatus === "uploaded") && isAdminPanel)
      return `/admin/comics/${comic.id}`;
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(import_jsx_dev_runtime50.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
      ComicNameEditor,
      {
        comicName: comicData.comicName,
        setIsLegalComicnameState: (isLegal) => onUpdate({
          ...comicData,
          validation: { ...comicData.validation, isLegalComicName: isLegal }
        }),
        onUpdate: (newVal) => onUpdate({ ...comicData, comicName: newVal }),
        existingComic
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 69,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { className: "flex flex-row flex-wrap mt-6 items-end gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-x-4 gap-y-1 items-end", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
          SearchableSelect,
          {
            value: comicData.artistId,
            onChange: (newVal) => onUpdate({ ...comicData, artistId: newVal }),
            onValueCleared: () => onUpdate({ ...comicData, artistId: void 0 }),
            options: artistOptions,
            disabled: artistNotInList,
            title: "Artist",
            name: "artistId"
          },
          void 0,
          !1,
          {
            fileName: "app/components/ComicManager/ComicData.tsx",
            lineNumber: 83,
            columnNumber: 11
          },
          this
        ),
        comicData.artistId && /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
          ViewArtistLink,
          {
            artist: artists.find((a) => a.id === comicData.artistId),
            isAdminPanel
          },
          void 0,
          !1,
          {
            fileName: "app/components/ComicManager/ComicData.tsx",
            lineNumber: 94,
            columnNumber: 15
          },
          this
        ) }, void 0, !1, {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 93,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 82,
        columnNumber: 9
      }, this),
      !isAdminPanel && /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
        CheckboxUncontrolled,
        {
          label: "Artist is not in the list",
          name: "artistNotInList",
          onChange: (newVal) => {
            setArtistNotInList(newVal), newVal === !0 && onUpdate({ ...comicData, artistId: void 0 });
          }
        },
        void 0,
        !1,
        {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 102,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 81,
      columnNumber: 7
    }, this),
    artistNotInList && /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
      ArtistEditor,
      {
        newArtistData: comicData.newArtist,
        onUpdate: (newArtist) => onUpdate({ ...comicData, newArtist })
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 116,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-4 mt-8", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
        Select,
        {
          title: "Category",
          name: "language",
          value: comicData.category,
          onChange: (newVal) => onUpdate({ ...comicData, category: newVal }),
          options: categoryOptions,
          minWidth: 72
        },
        void 0,
        !1,
        {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 123,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
        Select,
        {
          title: "Classification",
          name: "classification",
          value: comicData.classification,
          onChange: (newVal) => onUpdate({ ...comicData, classification: newVal }),
          options: classificationOptions,
          minWidth: 108
        },
        void 0,
        !1,
        {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 132,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
        Select,
        {
          title: "State",
          name: "state",
          value: comicData.state,
          onChange: (newVal) => onUpdate({ ...comicData, state: newVal }),
          options: stateOptions,
          minWidth: 111
        },
        void 0,
        !1,
        {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 141,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 122,
      columnNumber: 7
    }, this),
    !isAdminPanel && /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { style: { fontSize: "0.75rem" }, className: "mt-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("p", { children: "M, F: Male only, female only." }, void 0, !1, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 153,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("p", { children: "MF: One male on one female." }, void 0, !1, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 154,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("p", { children: "MM, FF: Two or more males or females together." }, void 0, !1, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 155,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("p", { children: "MF+: One or more male on one or more female action." }, void 0, !1, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 156,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("p", { children: "I: Anything involving intersex characters or nonbinary genders." }, void 0, !1, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 157,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 152,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("h4", { className: "mt-8", children: "Connected comics" }, void 0, !1, {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 161,
      columnNumber: 7
    }, this),
    !isAdminPanel && /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(import_jsx_dev_runtime50.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("p", { children: "If this is a standalone comic, leave these fields empty. If it's part of a series, fill in the previous and/or next comics." }, void 0, !1, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 164,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("p", { children: 'If you are uploading multiple chapters of a series, you can leave the "next comic" empty and only fill in the previous comic for each.' }, void 0, !1, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 168,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 163,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-4 mt-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
          SearchableSelect,
          {
            value: comicData.previousComic,
            onChange: (newVal) => onUpdate({ ...comicData, previousComic: newVal }),
            onValueCleared: () => onUpdate({ ...comicData, previousComic: void 0 }),
            options: allComicOptions,
            title: "Previous comic",
            name: "previousComicId",
            placeholder: "Leave blank if none",
            mobileCompact: !0,
            equalValueFunc: (a, b) => a.id === b?.id
          },
          void 0,
          !1,
          {
            fileName: "app/components/ComicManager/ComicData.tsx",
            lineNumber: 177,
            columnNumber: 11
          },
          this
        ),
        comicData.previousComic && getComicLink(comicData.previousComic) && /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { className: "mt-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
          ViewComicLink,
          {
            comic: comicData.previousComic,
            isAdminPanel
          },
          void 0,
          !1,
          {
            fileName: "app/components/ComicManager/ComicData.tsx",
            lineNumber: 190,
            columnNumber: 15
          },
          this
        ) }, void 0, !1, {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 189,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 176,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
          SearchableSelect,
          {
            value: comicData.nextComic,
            onChange: (newVal) => onUpdate({ ...comicData, nextComic: newVal }),
            onValueCleared: () => onUpdate({ ...comicData, nextComic: void 0 }),
            options: allComicOptions,
            title: "Next comic",
            name: "nextComicId",
            placeholder: "Leave blank if none",
            mobileCompact: !0,
            equalValueFunc: (a, b) => a.id === b?.id
          },
          void 0,
          !1,
          {
            fileName: "app/components/ComicManager/ComicData.tsx",
            lineNumber: 199,
            columnNumber: 11
          },
          this
        ),
        comicData.nextComic && getComicLink(comicData.nextComic) && /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)("div", { className: "mt-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(ViewComicLink, { comic: comicData.nextComic, isAdminPanel }, void 0, !1, {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 212,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "app/components/ComicManager/ComicData.tsx",
          lineNumber: 211,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 198,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 175,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/ComicManager/ComicData.tsx",
    lineNumber: 68,
    columnNumber: 5
  }, this);
}
function ViewArtistLink({
  artist,
  isAdminPanel
}) {
  return artist ? isAdminPanel && isAdminPanel && !artist.isPending && !artist.isBanned ? /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(import_jsx_dev_runtime50.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
      Link,
      {
        href: `/admin/artists/${artist.id}`,
        text: "View admin",
        IconRight: import_md16.MdArrowForward,
        className: "ml-2"
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 239,
        columnNumber: 11
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
      Link,
      {
        href: `/artists/${artist.name}`,
        text: "View live",
        IconRight: import_md16.MdOpenInNew,
        className: "ml-4",
        newTab: !0
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 245,
        columnNumber: 11
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/ComicManager/ComicData.tsx",
    lineNumber: 238,
    columnNumber: 9
  }, this) : isAdminPanel ? /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
    Link,
    {
      href: `/admin/artists/${artist.id}`,
      text: "View admin",
      IconRight: import_md16.MdArrowForward,
      className: "ml-2"
    },
    void 0,
    !1,
    {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 259,
      columnNumber: 7
    },
    this
  ) : !artist.isPending && !artist.isBanned ? /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
    Link,
    {
      href: `/artist/${artist.name}`,
      text: "View artist",
      IconRight: import_md16.MdOpenInNew,
      newTab: !0
    },
    void 0,
    !1,
    {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 270,
      columnNumber: 7
    },
    this
  ) : null : null;
}
function ViewComicLink({
  comic,
  isAdminPanel
}) {
  return isAdminPanel && comic.publishStatus === "published" ? /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(import_jsx_dev_runtime50.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
      Link,
      {
        href: `/admin/comics/${comic.id}`,
        text: "View admin",
        IconRight: import_md16.MdArrowForward,
        className: "ml-2"
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 292,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
      Link,
      {
        href: `/${comic.name}`,
        text: "View live",
        IconRight: import_md16.MdOpenInNew,
        className: "ml-4",
        newTab: !0
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/ComicData.tsx",
        lineNumber: 298,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/ComicManager/ComicData.tsx",
    lineNumber: 291,
    columnNumber: 7
  }, this) : isAdminPanel ? /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
    Link,
    {
      href: `/admin/comics/${comic.id}`,
      text: "View admin",
      IconRight: import_md16.MdArrowForward,
      className: "ml-2"
    },
    void 0,
    !1,
    {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 311,
      columnNumber: 7
    },
    this
  ) : comic.publishStatus === "published" ? /* @__PURE__ */ (0, import_jsx_dev_runtime50.jsxDEV)(
    Link,
    {
      href: `/${comic.name}`,
      text: "View comic",
      IconRight: import_md16.MdOpenInNew,
      newTab: !0,
      className: "ml-2"
    },
    void 0,
    !1,
    {
      fileName: "app/components/ComicManager/ComicData.tsx",
      lineNumber: 322,
      columnNumber: 7
    },
    this
  ) : null;
}

// app/components/MultiSelect/MultiSelect.tsx
var import_react46 = require("react"), import_ri4 = require("react-icons/ri"), import_jsx_dev_runtime51 = require("react/jsx-dev-runtime");
function MultiSelect({
  options,
  title = "",
  value,
  onChange,
  equalSingleItemValueFunc,
  maxWidth = 999999,
  initialWidth = 0,
  // TODO needed?
  name,
  placeholder = "",
  className = "",
  ...props
}) {
  let [isOpen, setIsOpen] = (0, import_react46.useState)(!1), [searchText, setSearchText] = (0, import_react46.useState)(""), [minWidth, setMinWidth] = (0, import_react46.useState)(0), [width, setWidth] = (0, import_react46.useState)(0), selectItemContainerRef = (0, import_react46.useRef)(null), [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = (0, import_react46.useState)(-1);
  (0, import_react46.useEffect)(() => {
    tryComputeWidth();
  }, []), (0, import_react46.useEffect)(() => {
    searchText && !isOpen && setIsOpen(!0), setCurrentlyHighlightedIndex(-1);
  }, [searchText]);
  let availableOptions = (0, import_react46.useMemo)(() => !value && !searchText ? options : options.filter((option) => {
    let isValidOption = !0;
    return searchText && (isValidOption = option.text.toLowerCase().includes(searchText.toLowerCase())), value && (equalSingleItemValueFunc ? isValidOption = isValidOption && !value.find((val) => equalSingleItemValueFunc(option.value, val)) : isValidOption = isValidOption && !value.find((val) => val === option.value)), isValidOption;
  }), [options, value, searchText]);
  async function tryComputeWidth() {
    let isFinished = !1;
    for (; !isFinished; )
      await waitMillisec2(25), isFinished = computeWidth();
  }
  function computeWidth() {
    let container = selectItemContainerRef.current;
    if (container && container.children.length > 0) {
      let maxChildWidth = 0;
      for (let child of container.children)
        child.clientWidth > maxChildWidth && (maxChildWidth = child.clientWidth);
      return minWidth > maxWidth ? setWidth(maxWidth) : setMinWidth(maxChildWidth), !0;
    } else
      return !1;
  }
  let minWidthStyle = (0, import_react46.useMemo)(() => width ? {} : minWidth ? { minWidth: `${minWidth + 16}px` } : initialWidth ? { minWidth: `${initialWidth + 16}px` } : {}, [initialWidth, minWidth, width]), widthStyle = (0, import_react46.useMemo)(() => ({ width: "100%" }), [width]);
  async function waitMillisec2(millisec) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), millisec);
    });
  }
  function onSelected(clickedValue) {
    let newValues = [...value ?? [], clickedValue];
    onChange(newValues), clearAndCloseSearch();
  }
  function onDeselected(clickedValue) {
    let newValues = (value ?? []).filter((val) => val !== clickedValue);
    onChange(newValues);
  }
  function getTextFromValue(value2) {
    return equalSingleItemValueFunc ? options.find((option) => equalSingleItemValueFunc(option.value, value2))?.text : options.find((option) => option.value === value2)?.text;
  }
  function removeAllSelected() {
    onChange([]), setHighlightedIndex(-1);
  }
  function clearAndCloseSearch({ avoidIfHighlighted = !1 } = {}) {
    avoidIfHighlighted && currentlyHighlightedIndex !== -1 || (setSearchText(""), setIsOpen(!1), setHighlightedIndex(-1));
  }
  function onKeyDown(event) {
    event.key === "Enter" ? currentlyHighlightedIndex !== -1 && availableOptions.length > 0 ? onSelected(availableOptions[currentlyHighlightedIndex].value) : currentlyHighlightedIndex === -1 && availableOptions.length > 0 && isOpen && onSelected(availableOptions[0].value) : event.key === "ArrowDown" ? isOpen ? currentlyHighlightedIndex === availableOptions.length - 1 ? setHighlightedIndex(0) : setHighlightedIndex(currentlyHighlightedIndex + 1) : (setIsOpen(!0), setHighlightedIndex(0)) : event.key === "ArrowUp" ? isOpen ? setHighlightedIndex(currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1 ? availableOptions.length - 1 : currentlyHighlightedIndex - 1) : (setIsOpen(!0), setHighlightedIndex(availableOptions.length - 1)) : event.key === "Escape" && clearAndCloseSearch();
  }
  function setHighlightedIndex(indexNum) {
    if (indexNum !== -1 && selectItemContainerRef.current) {
      let option = selectItemContainerRef.current.children[indexNum];
      option && option.scrollIntoView({ block: "nearest", inline: "start" });
    }
    setCurrentlyHighlightedIndex(indexNum);
  }
  let inputClassname = `text-text-light dark:text-text-dark bg-transparent  px-2 after:absolute
    after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
    after:border-t-text-light dark:after:border-t-text-dark after:right-3
    placeholder-gray-800 dark:placeholder-gray-700 w-fit min-w-8 flex-grow outline-none`;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(
    "div",
    {
      onKeyDown,
      className: `hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit h-fit min-h-9 outline-none leading-9 pt-5 box-content ${className} border border-0 border-theme1-primary border-b-2
    disabled:border-gray-800 dark:disabled:border-gray-600`,
      style: {
        ...minWidthStyle,
        ...widthStyle
      },
      ...props,
      children: [
        title && /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)("label", { className: "absolute text-sm top-0 left-2", children: title }, void 0, !1, {
          fileName: "app/components/MultiSelect/MultiSelect.tsx",
          lineNumber: 228,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)("div", { className: "flex flex-row gap-1 flex-wrap pr-8", children: [
          value !== void 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(import_jsx_dev_runtime51.Fragment, { children: value.map((singleVal) => /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(
            "div",
            {
              className: "px-2 bg-theme1-primaryTrans h-fit rounded hover:bg-theme1-primaryLessTrans hover:line-through",
              onClick: () => onDeselected(singleVal),
              children: /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)("p", { className: "", children: getTextFromValue(singleVal) }, void 0, !1, {
                fileName: "app/components/MultiSelect/MultiSelect.tsx",
                lineNumber: 239,
                columnNumber: 17
              }, this)
            },
            JSON.stringify(singleVal),
            !1,
            {
              fileName: "app/components/MultiSelect/MultiSelect.tsx",
              lineNumber: 234,
              columnNumber: 15
            },
            this
          )) }, void 0, !1, {
            fileName: "app/components/MultiSelect/MultiSelect.tsx",
            lineNumber: 232,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(
            "input",
            {
              type: "text",
              autoComplete: "off",
              value: searchText || "",
              name,
              onChange: (e) => setSearchText(e.target.value),
              onFocus: () => setIsOpen(!0),
              onClick: () => setIsOpen(!0),
              className: inputClassname,
              placeholder,
              onBlur: () => clearAndCloseSearch({ avoidIfHighlighted: !0 })
            },
            void 0,
            !1,
            {
              fileName: "app/components/MultiSelect/MultiSelect.tsx",
              lineNumber: 245,
              columnNumber: 9
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/MultiSelect/MultiSelect.tsx",
          lineNumber: 230,
          columnNumber: 7
        }, this),
        value && /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(
          "span",
          {
            className: "absolute right-2 top-4 hover:cursor-pointer",
            onClick: removeAllSelected,
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(import_ri4.RiCloseLine, {}, void 0, !1, {
              fileName: "app/components/MultiSelect/MultiSelect.tsx",
              lineNumber: 265,
              columnNumber: 11
            }, this)
          },
          void 0,
          !1,
          {
            fileName: "app/components/MultiSelect/MultiSelect.tsx",
            lineNumber: 261,
            columnNumber: 9
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(
          "div",
          {
            className: `${isOpen ? "" : "invisible"} overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`,
            ref: selectItemContainerRef,
            children: [
              availableOptions.map(({ text, value: optionValue }, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(
                "div",
                {
                  onClick: () => onSelected(optionValue),
                  onMouseEnter: () => setHighlightedIndex(index),
                  onMouseLeave: () => setHighlightedIndex(-1),
                  className: `z-40 hover:cursor-pointer px-3 whitespace-nowrap 
              ${currentlyHighlightedIndex === index ? "bg-gradient-to-r from-theme1-primary to-theme2-primary text-text-light " : ""}}
            `,
                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)("p", { children: text }, void 0, !1, {
                    fileName: "app/components/MultiSelect/MultiSelect.tsx",
                    lineNumber: 290,
                    columnNumber: 13
                  }, this)
                },
                text,
                !1,
                {
                  fileName: "app/components/MultiSelect/MultiSelect.tsx",
                  lineNumber: 277,
                  columnNumber: 11
                },
                this
              )),
              options.length === 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime51.jsxDEV)(
                "div",
                {
                  className: "z-40 px-3 whitespace-nowrap text-gray-700 hover:cursor-default",
                  onClick: () => onSelected(null),
                  children: "No results"
                },
                void 0,
                !1,
                {
                  fileName: "app/components/MultiSelect/MultiSelect.tsx",
                  lineNumber: 294,
                  columnNumber: 11
                },
                this
              )
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/components/MultiSelect/MultiSelect.tsx",
            lineNumber: 270,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/components/MultiSelect/MultiSelect.tsx",
      lineNumber: 218,
      columnNumber: 5
    },
    this
  );
}

// app/components/ComicManager/Tags.tsx
var import_jsx_dev_runtime52 = require("react/jsx-dev-runtime");
function TagsEditor({
  allTags,
  comicData,
  onUpdate,
  className = ""
}) {
  let tagOptions = allTags.map((tag) => ({ value: tag, text: tag.name }));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime52.jsxDEV)("div", { className, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime52.jsxDEV)("h4", { children: "Tags" }, void 0, !1, {
      fileName: "app/components/ComicManager/Tags.tsx",
      lineNumber: 22,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime52.jsxDEV)(
      MultiSelect,
      {
        name: "tags",
        title: "Tags",
        options: tagOptions,
        value: comicData.tags,
        onChange: (newTags) => onUpdate({ ...comicData, tags: newTags }),
        equalSingleItemValueFunc: (a, b) => a.id === b?.id
      },
      void 0,
      !1,
      {
        fileName: "app/components/ComicManager/Tags.tsx",
        lineNumber: 24,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/ComicManager/Tags.tsx",
    lineNumber: 21,
    columnNumber: 5
  }, this);
}

// node_modules/cropperjs/dist/cropper.min.css
var cropper_min_default = "/build/_assets/cropper.min-7X5LLKF5.css";

// app/routes/contribute/upload/index.tsx
var import_jsx_dev_runtime53 = require("react/jsx-dev-runtime"), illegalComicNameChars = ["#", "/", "?", "\\"], maxUploadBodySize = 80 * 1024 * 1024;
function links2() {
  return [{ rel: "stylesheet", href: cropper_min_default }];
}
function Upload2() {
  let { artists, comics, context, user, tags } = (0, import_react47.useLoaderData)(), [step, setStep] = (0, import_react48.useState)(2), [comicData, setComicData] = (0, import_react48.useState)(createEmptyUploadData()), [error, setError] = (0, import_react48.useState)(null), [isSubmitting, setIsSubmitting] = (0, import_react48.useState)(!1), submitFetcher = useGoodFetcher({
    method: "post",
    encType: "multipart/form-data",
    toastError: !1,
    onFinish: () => {
      setIsSubmitting(!1), submitFetcher.success && setStep("success"), submitFetcher.isError && setError(submitFetcher.errorMessage);
    }
  }), uploadPagesFetcher = useGoodFetcher({
    url: "/api/upload-comic-pages",
    method: "post",
    encType: "multipart/form-data",
    toastError: !0
  });
  async function uploadFiles(comicData2, uploadId) {
    let thumbnailFile = comicData2.thumbnail?.file, filesFormDatas = Array(), currentFormData = new FormData();
    currentFormData.append(
      "files",
      thumbnailFile,
      `thumbnail.${getFileExtension(thumbnailFile.name)}`
    ), currentFormData.append("comicName", comicData2.comicName), currentFormData.append("uploadId", uploadId);
    let currentFormDataSize = 0;
    for (let i = 0; i < comicData2.files.length; i++) {
      let file = comicData2.files[i];
      currentFormDataSize + file.file.size > maxUploadBodySize && (filesFormDatas.push(currentFormData), currentFormData = new FormData(), currentFormData.append("comicName", comicData2.comicName), currentFormDataSize = 0), currentFormData.append(
        "files",
        file.file,
        pageNumberToPageName(i + 1, file.file.name)
      ), currentFormDataSize += file.file.size;
    }
    filesFormDatas.push(currentFormData);
    for (let formData of filesFormDatas)
      await uploadPagesFetcher.awaitSubmit(formData);
    return {};
  }
  async function submit() {
    let randomId = generateRandomId(), uploadId = `${comicData.comicName}-${randomId}`;
    if (setError(null), !comicData.validation.isLegalComicName) {
      setError("There is an error regarding the comic name");
      return;
    }
    if (comicData.newArtist.artistName) {
      let isNameIllegal = !comicData.artistId && !comicData.newArtist.isValidName, isE621Illegal = !comicData.newArtist.e621Name && !comicData.newArtist.hasConfirmedNoE621Name, isPatreonIllegal = !comicData.newArtist.patreonName && !comicData.newArtist.hasConfirmedNoPatreonName;
      if (!comicData.newArtist.areLinksValid) {
        setError("Some of the artist links are invalid");
        return;
      }
      if (isNameIllegal) {
        setError("There is an error regarding the artist name");
        return;
      }
      if (isE621Illegal) {
        setError("You must confirm that the artist does not have an e621 name");
        return;
      }
      if (isPatreonIllegal) {
        setError("You must confirm that the artist does not have a patreon name");
        return;
      }
    }
    let newArtist;
    comicData.newArtist.artistName && (newArtist = {
      ...comicData.newArtist,
      links: comicData.newArtist.links.filter((link) => link.length > 0)
    });
    let uploadBody = {
      uploadId,
      comicName: comicData.comicName,
      category: comicData.category,
      classification: comicData.classification,
      state: comicData.state,
      tagIds: comicData.tags.map((tag) => tag.id),
      newArtist,
      artistId: comicData.artistId,
      numberOfPages: comicData.files.length,
      previousComic: comicData.previousComic?.id ? comicData.previousComic : void 0,
      nextComic: comicData.nextComic?.id ? comicData.nextComic : void 0
    }, formData = new FormData();
    formData.append("body", JSON.stringify(uploadBody));
    let { error: error2 } = validateUploadForm(uploadBody);
    if (error2) {
      setError(error2);
      return;
    }
    if (comicData.files.length < 3 || !comicData.thumbnail) {
      setError("You need at least 3 pages and a thumbnail");
      return;
    }
    setIsSubmitting(!0);
    let { error: uploadError } = await uploadFiles(comicData, uploadId);
    if (console.log("error2: ", uploadError), uploadError) {
      setError(uploadError), setIsSubmitting(!1);
      return;
    }
    submitFetcher.submit(formData);
  }
  function fillWithStuff() {
    setComicData({
      ...comicData,
      comicName: "Test " + randomString(12),
      category: "MF",
      classification: "Furry",
      state: "finished",
      validation: {
        isLegalComicName: !0
      },
      tags: Array.from(
        /* @__PURE__ */ new Set(
          [
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)]
          ]
        )
      ),
      previousComic: comics[Math.floor(Math.random() * comics.length)],
      nextComic: comics[Math.floor(Math.random() * comics.length)],
      artistId: artists[Math.floor(Math.random() * artists.length)].id
    });
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)("div", { className: "container mx-auto pb-16", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)("h1", { children: "Upload a comic" }, void 0, !1, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 240,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)("p", { className: "mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(BackToContribute, {}, void 0, !1, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 243,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 242,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(Button, { color: "error", text: "FILL WITH STUFF", onClick: fillWithStuff }, void 0, !1, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 246,
      columnNumber: 7
    }, this),
    user?.userType === "moderator" && /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(InfoBox, { variant: "info", showIcon: !0, className: "mb-4", children: "You're logged in as a mod. Your comic (and artist, if it's a new one) will therefore skip the regular user upload queue and go straight to 'pending'." }, void 0, !1, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 249,
      columnNumber: 7
    }, this),
    step === "success" && /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(SuccessMessage, { isLoggedIn: !!user }, void 0, !1, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 255,
      columnNumber: 30
    }, this),
    step === 1 && /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(Step1, { onNext: () => setStep(2) }, void 0, !1, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 257,
      columnNumber: 22
    }, this),
    step === 2 && /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(import_jsx_dev_runtime53.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(
        ComicDataEditor,
        {
          comicData,
          onUpdate: setComicData,
          artists,
          comics
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/index.tsx",
          lineNumber: 261,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(Step3Pagemanager, { comicData, onUpdate: setComicData }, void 0, !1, {
        fileName: "app/routes/contribute/upload/index.tsx",
        lineNumber: 268,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(Step4Thumbnail, { comicData, onUpdate: setComicData }, void 0, !1, {
        fileName: "app/routes/contribute/upload/index.tsx",
        lineNumber: 270,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(
        TagsEditor,
        {
          allTags: tags,
          comicData,
          onUpdate: setComicData,
          className: "mt-8"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/index.tsx",
          lineNumber: 272,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)("h4", { className: "mt-8", children: "Finish" }, void 0, !1, {
        fileName: "app/routes/contribute/upload/index.tsx",
        lineNumber: 279,
        columnNumber: 11
      }, this),
      error && /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(InfoBox, { variant: "error", text: error, className: "mt-2 mb-4 w-fit" }, void 0, !1, {
        fileName: "app/routes/contribute/upload/index.tsx",
        lineNumber: 281,
        columnNumber: 21
      }, this),
      isSubmitting && /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(InfoBox, { variant: "info", boldText: !1, className: "mt-2 mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)("p", { children: "Uploading comic - this could take a little while, please be patient!" }, void 0, !1, {
        fileName: "app/routes/contribute/upload/index.tsx",
        lineNumber: 285,
        columnNumber: 15
      }, this) }, void 0, !1, {
        fileName: "app/routes/contribute/upload/index.tsx",
        lineNumber: 284,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime53.jsxDEV)(
        LoadingButton,
        {
          text: "Submit",
          color: "primary",
          variant: "contained",
          isLoading: isSubmitting,
          onClick: submit
        },
        void 0,
        !1,
        {
          fileName: "app/routes/contribute/upload/index.tsx",
          lineNumber: 289,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/contribute/upload/index.tsx",
      lineNumber: 260,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/contribute/upload/index.tsx",
    lineNumber: 239,
    columnNumber: 5
  }, this);
}
async function loader14(args) {
  let urlBase = args.context.DB_API_URL_BASE, allArtistsPromise = getAllArtists(urlBase, {
    includePending: !0,
    modifyNameIncludeType: !0
  }), comicsPromise = getAllComicNamesAndIDs(urlBase, { modifyNameIncludeType: !0 }), tagsPromise = getAllTags(urlBase), userPromise = authLoader(args), [artistsRes, comicsRes, tagsRes, user] = await Promise.all(
    [
      allArtistsPromise,
      comicsPromise,
      tagsPromise,
      userPromise
    ]
  );
  return artistsRes.err || !artistsRes.artists ? processApiError(
    "Error getting artists in upload",
    artistsRes.err || { logMessage: "Artists returned as undefined" }
  ) : comicsRes.err || !comicsRes.comics ? processApiError(
    "Error getting comics in upload",
    comicsRes.err || { logMessage: "Comics returned as undefined" }
  ) : tagsRes.err || !tagsRes.tags ? processApiError(
    "Error getting tags in upload",
    tagsRes.err || { logMessage: "Tags returned as undefined" }
  ) : {
    artists: artistsRes.artists,
    comics: comicsRes.comics,
    tags: tagsRes.tags,
    user,
    uploadUrlBase: args.context.DB_API_URL_BASE,
    context: Object.keys(args.context)
  };
}
async function action29(args) {
  let user = await authLoader(args), formData = await args.request.formData(), body = JSON.parse(formData.get("body")), { error } = validateUploadForm(body);
  if (error)
    return create400Json(error);
  let err = await processUpload(
    args.context.DB_API_URL_BASE,
    body,
    user,
    args.request.headers.get("CF-Connecting-IP") || "unknown"
  );
  return err ? (logApiError("Error in upload comic submit", err, body), create500Json()) : createSuccessJson();
}
function pageNumberToPageName(pageNum, filename) {
  return `${pageNum < 100 ? pageNum < 10 ? "00" + pageNum : "0" + pageNum : pageNum.toString()}.${getFileExtension(filename)}`;
}
function getFileExtension(filename) {
  return filename.substring(filename.lastIndexOf(".") + 1).replace("jpeg", "jpg");
}
function validateUploadForm(uploadBody) {
  if (!uploadBody.comicName)
    return { error: "Comic name is required" };
  if (uploadBody.comicName.length < 2)
    return { error: "Comic name must be at least 2 characters" };
  if (illegalComicNameChars.some((char) => uploadBody.comicName.includes(char)))
    return { error: "Comic name contains illegal characters" };
  if (!uploadBody.category)
    return { error: "Category is required" };
  if (!uploadBody.classification)
    return { error: "Classification is required" };
  if (!uploadBody.state)
    return { error: "State is required" };
  if (!uploadBody.artistId && !uploadBody.newArtist)
    return { error: "Artist is required" };
  if (uploadBody.newArtist) {
    if (uploadBody.newArtist.e621Name && isUsernameUrl(uploadBody.newArtist.e621Name))
      return { error: "e621 name must be a username, not a URL" };
    if (uploadBody.newArtist.patreonName && isUsernameUrl(uploadBody.newArtist.patreonName))
      return { error: "Patreon name must be a username, not a URL" };
  }
  return {};
}
function generateRandomId() {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", result = "";
  for (let i = 0; i < 6; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  return result;
}
function createEmptyUploadData() {
  return {
    comicName: "",
    category: "",
    classification: "",
    state: "",
    tags: [],
    newArtist: {
      artistName: "",
      e621Name: "",
      patreonName: "",
      links: [""],
      isValidName: !1,
      areLinksValid: !0
    },
    // Validation that must be computed from within components, rather than on submit
    validation: {
      isLegalComicName: !1
    },
    files: []
  };
}

// app/routes/api/admin/relist-comic.tsx
var relist_comic_exports = {};
__export(relist_comic_exports, {
  action: () => action30,
  loader: () => noGetRoute,
  relistComic: () => relistComic
});
async function action30(args) {
  await redirectIfNotMod(args);
  let urlBase = args.context.DB_API_URL_BASE, formComicId = (await args.request.formData()).get("comicId");
  if (!formComicId)
    return create400Json("Missing comicId");
  let err = await relistComic(urlBase, parseInt(formComicId.toString()));
  return err ? processApiError("Error relisting comic", err) : createSuccessJson();
}
async function relistComic(urlBase, comicId) {
  let comicQuery = "UPDATE comic SET publishStatus = 'published' WHERE id = ?", metadataQuery = "UPDATE comicmetadata SET unlistComment = NULL WHERE comicId = ?", [comicDbRes, metadataDbRes] = await Promise.all([
    queryDb(urlBase, comicQuery, [comicId]),
    queryDb(urlBase, metadataQuery, [comicId])
  ]);
  if (comicDbRes.isError)
    return makeDbErr(comicDbRes, "Could not update comic table", {
      comicId
    });
  if (metadataDbRes.isError)
    return makeDbErr(comicDbRes, "Could not update metadata table", {
      comicId
    });
}

// app/routes/api/upload-comic-pages.ts
var upload_comic_pages_exports = {};
__export(upload_comic_pages_exports, {
  action: () => action31
});
async function action31(args) {
  let bucket = args.context.COMICS_BUCKET, body = await args.request.formData(), comicName = body.get("comicName"), allFiles = body.getAll("files");
  try {
    let filePutPromises = allFiles.map(async (blob, i) => {
      if (blob instanceof File) {
        let fileContents = await blob.arrayBuffer();
        return bucket.put(`${comicName}/${blob.name}`, fileContents);
      }
      let filename = i === 0 ? "thumbnail.jpg" : `${i.toString().padStart(3, "0")}.jpg`, arrayBuffer = await new Blob([blob], { type: "image/jpeg" }).arrayBuffer();
      return bucket.put(`${comicName}/${filename}`, arrayBuffer);
    });
    await Promise.all(filePutPromises);
  } catch (e) {
    return console.error(e), create500Json(
      `Files length: ${allFiles.length}.
 First file type: ${allFiles[0].constructor.name}. Or ${typeof allFiles[0]}. 
Error uploading files: ` + e.message
    );
  }
  return createSuccessJson();
}

// app/routes/api/set-theme.ts
var set_theme_exports = {};
__export(set_theme_exports, {
  action: () => action32,
  loader: () => loader15
});
var import_cloudflare6 = require("@remix-run/cloudflare");
var action32 = async function({ request }) {
  let themeSession = await getThemeSession(request), requestText = await request.text(), theme = new URLSearchParams(requestText).get("theme");
  return isTheme(theme) ? (themeSession.setTheme(theme), (0, import_cloudflare6.json)(
    {
      success: !0
    },
    {
      headers: {
        "Set-Cookie": await themeSession.commit()
      }
    }
  )) : (0, import_cloudflare6.json)({
    success: !1,
    message: `Theme value ${theme} is not valid`
  });
}, loader15 = async function({ request }) {
  return (0, import_cloudflare6.redirect)("/");
};

// app/routes/admin/dashboard/PendingComicProblem.tsx
var PendingComicProblem_exports = {};
__export(PendingComicProblem_exports, {
  PendingComicProblem: () => PendingComicProblem
});
var import_react49 = require("react"), import_md17 = require("react-icons/md");

// app/components/Chip.tsx
var import_jsx_dev_runtime54 = require("react/jsx-dev-runtime");
function Chip({ text, color, className = "" }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime54.jsxDEV)(
    "div",
    {
      className: `w-fit px-2 rounded-xl whitespace-nowrap ${className}`,
      style: { backgroundColor: color, paddingTop: "2px", paddingBottom: "2px" },
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime54.jsxDEV)("p", { className: "text-sm text-white", children: text }, void 0, !1, {
        fileName: "app/components/Chip.tsx",
        lineNumber: 13,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/components/Chip.tsx",
      lineNumber: 9,
      columnNumber: 5
    },
    this
  );
}

// app/routes/admin/dashboard/PendingComicProblem.tsx
var import_jsx_dev_runtime55 = require("react/jsx-dev-runtime");
function PendingComicProblem({
  action: action33,
  isLoading,
  onAssignMe,
  onUnassignMe,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName
}) {
  let [isOpen, setIsOpen] = (0, import_react49.useState)(!1), [theme] = useTheme(), themedColor = theme === "light" ? "#65bf70" : "#268f33";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)(
    "div",
    {
      className: `flex flex-col w-full gap-2 ${action33.isProcessed ? "cursor-pointer" : ""}`,
      onClick: () => setIsOpen(!isOpen),
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("div", { className: innerContainerClassName, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("div", { className: "flex flex-col justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)(Chip, { color: themedColor, text: "Pending problem" }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
            lineNumber: 43,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("div", { className: "flex flex-col md:flex-row gap-x-12 gap-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)(
              Link,
              {
                href: `/admin/comics/${action33.comicId}`,
                text: action33.primaryField,
                IconRight: import_md17.MdOpenInNew,
                newTab: !0
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
                lineNumber: 45,
                columnNumber: 13
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("p", { children: action33.secondaryField }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
              lineNumber: 51,
              columnNumber: 13
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
            lineNumber: 44,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
          lineNumber: 42,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("div", { className: "flex flex-col md:items-end justify-between gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("p", { className: "text-sm" }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
            lineNumber: 56,
            columnNumber: 11
          }, this),
          isAssignedToOther && /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("i", { children: [
            "Assigned to: ",
            action33.assignedMod.username
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
            lineNumber: 60,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
            lineNumber: 59,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)("div", { className: "flex flex-row gap-2 self-end", children: [
            isAssignedToMe && /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)(
              LoadingButton,
              {
                color: "error",
                onClick: () => onUnassignMe(action33),
                text: "Unassign from me",
                isLoading: isLoading && loadingAction === "unassign"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
                lineNumber: 66,
                columnNumber: 15
              },
              this
            ),
            !action33.isProcessed && !action33.assignedMod && /* @__PURE__ */ (0, import_jsx_dev_runtime55.jsxDEV)(
              LoadingButton,
              {
                color: "primary",
                onClick: () => onAssignMe(action33),
                text: "I'm on it",
                isLoading: isLoading && loadingAction === "assign"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
                lineNumber: 74,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
            lineNumber: 64,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
          lineNumber: 55,
          columnNumber: 9
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
        lineNumber: 41,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin/dashboard/PendingComicProblem.tsx",
      lineNumber: 35,
      columnNumber: 5
    },
    this
  );
}

// app/routes/admin/dashboard/ComicSuggestion.tsx
var ComicSuggestion_exports = {};
__export(ComicSuggestion_exports, {
  ComicSuggestion: () => ComicSuggestion
});
var import_react55 = require("@remix-run/react"), import_react56 = require("react"), import_io54 = require("react-icons/io5");

// app/components/Buttons/DropdownButton.tsx
var import_react50 = require("react"), import_io5 = require("react-icons/io5");
var import_jsx_dev_runtime56 = require("react/jsx-dev-runtime");
function DropdownButton({
  options,
  isLoading,
  text,
  ...props
}) {
  let [isOpen, setIsOpen] = (0, import_react50.useState)(!1), [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = (0, import_react50.useState)(-1), [width, setWidth] = (0, import_react50.useState)(), [areChildrenWider, setAreChildrenWider] = (0, import_react50.useState)(!1), itemsContainerRef = (0, import_react50.useRef)(null), mainButtonRef = (0, import_react50.useRef)(null), closeTimeout = (0, import_react50.useRef)(null);
  (0, import_react50.useEffect)(() => {
    tryComputeWidth();
  }, []), (0, import_react50.useEffect)(() => {
    setCurrentlyHighlightedIndex(-1);
  }, [isOpen]);
  function closeSoonIfOpen() {
    closeTimeout.current = setTimeout(() => {
      isOpen && setIsOpen(!1);
    }, 300);
  }
  function cancelCloseTimeout() {
    closeTimeout.current && clearTimeout(closeTimeout.current);
  }
  function onKeyDown(e) {
    if (e.key === "Tab" || e.key === "Escape")
      setIsOpen(!1);
    else if (e.key === "ArrowDown")
      e.preventDefault(), setCurrentlyHighlightedIndex(
        currentlyHighlightedIndex === options.length - 1 ? 0 : currentlyHighlightedIndex + 1
      );
    else if (e.key === "ArrowUp")
      e.preventDefault(), setCurrentlyHighlightedIndex(
        currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1 ? options.length - 1 : currentlyHighlightedIndex - 1
      );
    else if (e.key === "Enter" || e.key === " ") {
      if (e.preventDefault(), !isOpen) {
        setIsOpen(!0);
        return;
      }
      currentlyHighlightedIndex === -1 || options[currentlyHighlightedIndex].onClick(), setIsOpen(!1);
    }
  }
  async function tryComputeWidth() {
    let isFinished = !1;
    for (; !isFinished; )
      await waitMillisec(25), isFinished = computeWidth();
  }
  function computeWidth() {
    let container = itemsContainerRef.current, button = mainButtonRef.current;
    if (container && button && container.children.length > 0) {
      let maxChildWidth = 0;
      for (let child of container.children)
        child.clientWidth > maxChildWidth && (maxChildWidth = child.clientWidth);
      let buttonWidth = button.clientWidth, areChildrenWider2 = maxChildWidth > buttonWidth;
      return setAreChildrenWider(areChildrenWider2), setWidth(Math.max(maxChildWidth, buttonWidth)), !0;
    } else
      return !1;
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime56.jsxDEV)("div", { className: "relative inline-block text-left", onKeyDown, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime56.jsxDEV)(
      Button,
      {
        ...props,
        text,
        endIcon: isLoading ? Spinner2 : import_io5.IoCaretDown,
        onClick: (e) => {
          isLoading || (setIsOpen((isOpenCurrently) => !isOpenCurrently), e.stopPropagation());
        },
        onMouseLeave: closeSoonIfOpen,
        onMouseEnter: cancelCloseTimeout,
        style: { ...width && areChildrenWider ? { width } : {}, ...props.style },
        buttonRef: mainButtonRef,
        onBlur: () => {
          currentlyHighlightedIndex === -1 && setTimeout(() => setIsOpen(!1), 50);
        },
        className: isLoading ? "opacity-70" : ""
      },
      void 0,
      !1,
      {
        fileName: "app/components/Buttons/DropdownButton.tsx",
        lineNumber: 114,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime56.jsxDEV)(
      "div",
      {
        className: `
          origin-top-right absolute left-0 shadow-lg bg-white dark:bg-gray-400 focus:outline-none rounded overflow-hidden
          ${isOpen ? "" : "invisible"}`,
        onMouseLeave: closeSoonIfOpen,
        onMouseEnter: cancelCloseTimeout,
        children: /* @__PURE__ */ (0, import_jsx_dev_runtime56.jsxDEV)(
          "div",
          {
            role: "menu",
            "aria-orientation": "vertical",
            "aria-labelledby": "options-menu",
            ref: itemsContainerRef,
            children: options.map((option, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime56.jsxDEV)(
              "div",
              {
                className: `
                  block w-full text-left px-4 py-2 text-sm cursor-pointer whitespace-nowrap
                  font-semibold text-blue-weak-100 dark:text-text-dark
                  ${index === currentlyHighlightedIndex ? "bg-blue-trans dark:bg-gray-600 " : ""}
                `,
                role: "menuitem",
                onMouseEnter: () => setCurrentlyHighlightedIndex(index),
                onMouseLeave: () => setCurrentlyHighlightedIndex(-1),
                onClick: (e) => {
                  e.stopPropagation(), option.onClick(), setIsOpen(!1);
                },
                style: width ? { width } : {},
                children: option.text
              },
              index,
              !1,
              {
                fileName: "app/components/Buttons/DropdownButton.tsx",
                lineNumber: 148,
                columnNumber: 13
              },
              this
            ))
          },
          void 0,
          !1,
          {
            fileName: "app/components/Buttons/DropdownButton.tsx",
            lineNumber: 141,
            columnNumber: 9
          },
          this
        )
      },
      void 0,
      !1,
      {
        fileName: "app/components/Buttons/DropdownButton.tsx",
        lineNumber: 134,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/components/Buttons/DropdownButton.tsx",
    lineNumber: 113,
    columnNumber: 5
  }, this);
}
var Spinner2 = () => /* @__PURE__ */ (0, import_jsx_dev_runtime56.jsxDEV)("div", { className: "ml-2 w-4 h-4 animate-spin border-solid border-transparent border-r-white border rounded-full" }, void 0, !1, {
  fileName: "app/components/Buttons/DropdownButton.tsx",
  lineNumber: 179,
  columnNumber: 3
}, this);

// app/routes/admin/dashboard/index.tsx
var dashboard_exports = {};
__export(dashboard_exports, {
  ErrorBoundary: () => ErrorBoundary,
  default: () => Dashboard,
  getTimeAgo: () => getTimeAgo,
  loader: () => loader16
});
var import_react53 = require("@remix-run/react");
var import_react54 = require("react"), import_date_fns3 = require("date-fns");

// app/routes/admin/dashboard/TagSuggestion.tsx
var TagSuggestion_exports = {};
__export(TagSuggestion_exports, {
  TagSuggestion: () => TagSuggestion
});
var import_md18 = require("react-icons/md");
var import_jsx_dev_runtime57 = require("react/jsx-dev-runtime");
function TagSuggestion({
  action: action33,
  onProcessSuggestion,
  isLoading,
  loadingAction,
  innerContainerClassName
}) {
  let [theme] = useTheme();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("div", { className: innerContainerClassName, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("div", { className: "flex flex-col justify-between gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)(Chip, { color: theme === "light" ? "#51bac8" : "#2299a9", text: "Tag suggestion" }, void 0, !1, {
        fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
        lineNumber: 35,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("div", { className: "flex flex-col md:flex-row gap-x-12 gap-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("div", { className: "flex flex-row gap-x-3", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("b", { children: action33.primaryField }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
            lineNumber: 38,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)(
            Link,
            {
              href: `/admin/comics/${action33.comicId}`,
              text: "Admin",
              IconRight: import_md18.MdOpenInNew,
              newTab: !0
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
              lineNumber: 39,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)(
            Link,
            {
              href: `/comics/${action33.primaryField}`,
              text: "Live",
              IconRight: import_md18.MdOpenInNew,
              newTab: !0
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
              lineNumber: 45,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
          lineNumber: 37,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("p", { children: action33.secondaryField }, void 0, !1, {
          fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
          lineNumber: 52,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
        lineNumber: 36,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
      lineNumber: 34,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("div", { className: "flex flex-col md:items-end justify-between gap-2 flex-shrink-0", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("p", { className: "text-sm", children: [
        action33.user.username || action33.user.ip,
        " - ",
        getTimeAgo(action33.timestamp)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
        lineNumber: 56,
        columnNumber: 9
      }, this),
      action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("i", { children: [
        "Completed by: ",
        action33.assignedMod?.username
      ] }, void 0, !0, {
        fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
        lineNumber: 64,
        columnNumber: 13
      }, this) }, void 0, !1, {
        fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
        lineNumber: 63,
        columnNumber: 11
      }, this),
      !action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)("div", { className: "flex flex-row gap-2 self-end", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)(
          LoadingButton,
          {
            color: "error",
            onClick: () => onProcessSuggestion(action33, !1),
            text: "Reject",
            isLoading: isLoading && loadingAction === "reject-tag"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
            lineNumber: 69,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime57.jsxDEV)(
          LoadingButton,
          {
            color: "primary",
            onClick: () => onProcessSuggestion(action33, !0),
            text: "Approve",
            isLoading: isLoading && loadingAction === "approve-tag"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
            lineNumber: 75,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
        lineNumber: 68,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/dashboard/TagSuggestion.tsx",
    lineNumber: 33,
    columnNumber: 5
  }, this);
}

// app/routes/admin/dashboard/ComicUpload.tsx
var ComicUpload_exports = {};
__export(ComicUpload_exports, {
  ComicUpload: () => ComicUpload
});
var import_react51 = require("react"), import_io52 = require("react-icons/io5"), import_md19 = require("react-icons/md");
var import_jsx_dev_runtime58 = require("react/jsx-dev-runtime");
function ComicUpload({
  action: action33,
  isLoading,
  onAssignMe,
  onUnassignMe,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName
}) {
  let [isOpen, setIsOpen] = (0, import_react51.useState)(!1), [theme] = useTheme(), themedColor = theme === "light" ? "#8c7ad5" : "#6751be";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(
    "div",
    {
      className: `flex flex-col w-full gap-2 ${action33.isProcessed ? "cursor-pointer" : ""}`,
      onClick: () => setIsOpen(!isOpen),
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("div", { className: innerContainerClassName, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("div", { className: "flex flex-col justify-between gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(Chip, { color: themedColor, text: "Comic upload" }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 45,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("div", { className: "flex flex-col md:flex-row gap-x-12 gap-y-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("div", { className: "flex flex-row gap-x-3", children: /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(
              Link,
              {
                href: `/admin/comics/${action33.comicId}`,
                text: action33.primaryField,
                IconRight: import_md19.MdOpenInNew,
                newTab: !0
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
                lineNumber: 48,
                columnNumber: 15
              },
              this
            ) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 47,
              columnNumber: 13
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 46,
              columnNumber: 11
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
            lineNumber: 44,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("div", { className: "flex flex-col md:items-end justify-between gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("p", { className: "text-sm", children: [
              action33.user.username || action33.user.ip,
              " - ",
              getTimeAgo(action33.timestamp)
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 59,
              columnNumber: 11
            }, this),
            action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("i", { children: [
              "Completed by: ",
              action33.assignedMod?.username
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 67,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 66,
              columnNumber: 13
            }, this),
            isAssignedToOther && /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("i", { children: [
              "Assigned to: ",
              action33.assignedMod.username
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 72,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 71,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("div", { className: "flex flex-row gap-2 self-end", children: [
              isAssignedToMe && /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(
                LoadingButton,
                {
                  color: "error",
                  onClick: () => onUnassignMe(action33),
                  text: "Unassign from me",
                  isLoading: isLoading && loadingAction === "unassign"
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
                  lineNumber: 78,
                  columnNumber: 15
                },
                this
              ),
              !action33.isProcessed && !action33.assignedMod && /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(
                LoadingButton,
                {
                  color: "primary",
                  onClick: () => onAssignMe(action33),
                  text: "I'm on it",
                  isLoading: isLoading && loadingAction === "assign"
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
                  lineNumber: 86,
                  columnNumber: 15
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
              lineNumber: 76,
              columnNumber: 11
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
            lineNumber: 58,
            columnNumber: 9
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
          lineNumber: 43,
          columnNumber: 7
        }, this),
        action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(import_jsx_dev_runtime58.Fragment, { children: isOpen ? /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(import_jsx_dev_runtime58.Fragment, { children: [
          action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)("b", { children: [
            "Verdict: ",
            action33.verdict
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
            lineNumber: 103,
            columnNumber: 19
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
            lineNumber: 102,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(import_io52.IoCaretUp, { className: "mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
            lineNumber: 107,
            columnNumber: 15
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
          lineNumber: 100,
          columnNumber: 13
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime58.jsxDEV)(import_io52.IoCaretDown, { className: "mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" }, void 0, !1, {
          fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
          lineNumber: 110,
          columnNumber: 13
        }, this) }, void 0, !1, {
          fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
          lineNumber: 98,
          columnNumber: 9
        }, this)
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/routes/admin/dashboard/ComicUpload.tsx",
      lineNumber: 37,
      columnNumber: 5
    },
    this
  );
}

// app/routes/admin/dashboard/ComicProblem.tsx
var ComicProblem_exports = {};
__export(ComicProblem_exports, {
  ComicProblem: () => ComicProblem
});
var import_react52 = require("react"), import_io53 = require("react-icons/io5");
var import_jsx_dev_runtime59 = require("react/jsx-dev-runtime");
function ComicProblem({
  action: action33,
  isLoading,
  onAssignMe,
  onUnassignMe,
  onProcessed,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName
}) {
  let [isOpen, setIsOpen] = (0, import_react52.useState)(!1), [theme] = useTheme(), themedColor = theme === "light" ? "#d7a74a" : "#b28734", isChooseActionButtonLoading = isLoading && !!loadingAction && ["unassign", "process-problem"].includes(loadingAction);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(
    "div",
    {
      className: "flex flex-col w-full gap-2 cursor-pointer",
      onClick: () => setIsOpen(!isOpen),
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("div", { className: innerContainerClassName, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("div", { className: "flex flex-col justify-between gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(Chip, { color: themedColor, text: "Comic problem" }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 49,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("div", { className: "flex flex-col md:flex-row gap-x-12 gap-y-1", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("b", { children: action33.primaryField }, void 0, !1, {
                fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
                lineNumber: 52,
                columnNumber: 15
              }, this) }, void 0, !1, {
                fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
                lineNumber: 51,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("p", { children: action33.secondaryField }, void 0, !1, {
                fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
                lineNumber: 54,
                columnNumber: 13
              }, this)
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 50,
              columnNumber: 11
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
            lineNumber: 48,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("div", { className: "flex flex-col md:items-end justify-between gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("p", { className: "text-sm", children: [
              action33.user.username || action33.user.ip,
              " - ",
              getTimeAgo(action33.timestamp)
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 59,
              columnNumber: 11
            }, this),
            action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("i", { children: [
              "Completed by: ",
              action33.assignedMod?.username
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 67,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 66,
              columnNumber: 13
            }, this),
            isAssignedToOther && /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("i", { children: [
              "Assigned to: ",
              action33.assignedMod.username
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 72,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 71,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("div", { className: "flex flex-row gap-2 self-end", children: [
              isAssignedToMe && /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(
                DropdownButton,
                {
                  text: "Choose action",
                  color: "primary",
                  isLoading: isChooseActionButtonLoading,
                  options: [
                    {
                      text: "Unassign from me",
                      onClick: () => onUnassignMe(action33)
                    },
                    {
                      text: "Remove, irrelevant",
                      onClick: () => onProcessed(action33, !1)
                    },
                    {
                      text: "Completed",
                      onClick: () => onProcessed(action33, !0)
                    }
                  ]
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
                  lineNumber: 78,
                  columnNumber: 15
                },
                this
              ),
              !action33.isProcessed && !action33.assignedMod && /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(
                LoadingButton,
                {
                  color: "primary",
                  onClick: (e) => {
                    e.stopPropagation(), onAssignMe(action33);
                  },
                  text: "I'm on it",
                  isLoading: isLoading && loadingAction === "assign"
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
                  lineNumber: 99,
                  columnNumber: 15
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 76,
              columnNumber: 11
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
            lineNumber: 58,
            columnNumber: 9
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
          lineNumber: 47,
          columnNumber: 7
        }, this),
        isOpen ? /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(import_jsx_dev_runtime59.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(
            "p",
            {
              className: "whitespace-pre-wrap cursor-auto",
              onClick: (e) => e.stopPropagation(),
              children: action33.description
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
              lineNumber: 115,
              columnNumber: 11
            },
            this
          ),
          action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)("b", { children: [
            "Verdict: ",
            action33.verdict
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
            lineNumber: 124,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
            lineNumber: 123,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(import_io53.IoCaretUp, { className: "mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
            lineNumber: 128,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
          lineNumber: 114,
          columnNumber: 9
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime59.jsxDEV)(import_io53.IoCaretDown, { className: "mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" }, void 0, !1, {
          fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
          lineNumber: 131,
          columnNumber: 9
        }, this)
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/routes/admin/dashboard/ComicProblem.tsx",
      lineNumber: 43,
      columnNumber: 5
    },
    this
  );
}

// app/routes/admin/dashboard/index.tsx
var import_jsx_dev_runtime60 = require("react/jsx-dev-runtime"), allActionTypes = [
  "tagSuggestion",
  "comicUpload",
  "comicSuggestion",
  "comicProblem",
  "pendingComicProblem"
], actionTypeToLabel = {
  tagSuggestion: "Tag suggestions",
  comicUpload: "Comic uploads",
  comicSuggestion: "Comic suggestions",
  comicProblem: "Comic problems",
  pendingComicProblem: "Pending problems"
};
async function loader16(args) {
  return { user: await redirectIfNotMod(args) };
}
function Dashboard({}) {
  let { user } = (0, import_react53.useLoaderData)(), [latestSubmittedId, setLatestSubmittedId] = (0, import_react54.useState)(), [latestSubmittedAction, setLatestSubmittedAction] = (0, import_react54.useState)(), [showMobileFilters, setShowMobileFilters] = (0, import_react54.useState)(!1), [showOthersTasks, setShowOthersTasks] = (0, import_react54.useState)(!1), [showCompleted, setShowCompleted] = (0, import_react54.useState)(!1), [typeFilter, setTypeFilter] = (0, import_react54.useState)([
    ...allActionTypes
  ]), dashboardDataFetcher = useGoodFetcher({
    url: "/api/admin/dashboard-data",
    fetchGetOnLoad: !0
  }), processTagFetcher = useGoodFetcher({
    url: "/api/admin/process-tag-suggestion",
    method: "post",
    toastSuccessMessage: "Tag suggestion processed"
  }), assignModFetcher = useGoodFetcher({
    url: "/api/admin/assign-action",
    method: "post"
  }), unassignModFetcher = useGoodFetcher({
    url: "/api/admin/unassign-action",
    method: "post"
  }), problemFetcher = useGoodFetcher({
    url: "/api/admin/process-comic-problem",
    method: "post",
    toastSuccessMessage: "Problem processed"
  }), comicSuggestionFetcher = useGoodFetcher({
    url: "/api/admin/process-comic-suggestion",
    method: "post",
    toastSuccessMessage: "Comic suggestion processed"
  }), allDashboardItems = dashboardDataFetcher.data || [], filteredDashboardItems = (0, import_react54.useMemo)(() => allDashboardItems.filter((action33) => !(action33.assignedMod && action33.assignedMod.userId !== user.userId && !showOthersTasks || action33.isProcessed && !showCompleted || !typeFilter.includes(action33.type))), [allDashboardItems, showOthersTasks, showCompleted, typeFilter]);
  async function processTagSuggestion2(action33, isApproved) {
    let body = {
      isApproved,
      actionId: action33.id,
      isAdding: action33.isAdding,
      comicId: action33.comicId,
      tagId: action33.tagId,
      suggestingUserId: action33.user.userId
    };
    setLatestSubmittedId(action33.id), setLatestSubmittedAction(isApproved ? "approve-tag" : "reject-tag"), processTagFetcher.submit({ body: JSON.stringify(body) });
  }
  function assignActionToMod2(action33) {
    let body = {
      actionId: action33.id,
      modId: user.userId,
      actionType: action33.type
    };
    setLatestSubmittedId(action33.id), setLatestSubmittedAction("assign"), assignModFetcher.submit({ body: JSON.stringify(body) });
  }
  function unassignActionFromMod(action33) {
    let body = {
      actionId: action33.id,
      actionType: action33.type
    };
    setLatestSubmittedId(action33.id), setLatestSubmittedAction("unassign"), unassignModFetcher.submit({ body: JSON.stringify(body) });
  }
  function processComicProblem2(action33, isApproved) {
    let body = {
      isApproved,
      actionId: action33.id,
      reportingUserId: action33.user.userId
    };
    setLatestSubmittedId(action33.id), setLatestSubmittedAction("process-problem"), problemFetcher.submit({ body: JSON.stringify(body) });
  }
  function processComicSuggestion2(action33, isApproved, verdict, modComment) {
    let body = {
      actionId: action33.id,
      isApproved,
      verdict,
      // always if approved, otherwise none
      modComment,
      // only potentially if rejected
      suggestingUserId: action33.user.userId
    };
    setLatestSubmittedId(action33.id), setLatestSubmittedAction("process-upload"), comicSuggestionFetcher.submit({ body: JSON.stringify(body) });
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(import_jsx_dev_runtime60.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)("h1", { children: "Action dashboard" }, void 0, !1, {
      fileName: "app/routes/admin/dashboard/index.tsx",
      lineNumber: 177,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
      Button,
      {
        className: "md:hidden mb-3",
        onClick: () => setShowMobileFilters(!showMobileFilters),
        text: showMobileFilters ? "Hide filters" : "Show filters",
        variant: "outlined"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/dashboard/index.tsx",
        lineNumber: 179,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)("div", { className: showMobileFilters ? "" : "hidden md:block", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)("div", { className: "flex flex-row flex-wrap mb-3 md:mt-2 gap-x-8 gap-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
          Checkbox,
          {
            label: "Show others' tasks",
            checked: showOthersTasks,
            onChange: () => setShowOthersTasks(!showOthersTasks)
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/dashboard/index.tsx",
            lineNumber: 188,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
          Checkbox,
          {
            label: "Show completed",
            checked: showCompleted,
            onChange: () => setShowCompleted(!showCompleted)
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/dashboard/index.tsx",
            lineNumber: 194,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/dashboard/index.tsx",
        lineNumber: 187,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)("div", { className: "flex flex-row flex-wrap mb-4 gap-x-8 gap-y-1", children: allActionTypes.map((type) => /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
        Checkbox,
        {
          label: actionTypeToLabel[type],
          checked: typeFilter.includes(type),
          onChange: () => {
            typeFilter.includes(type) ? setTypeFilter(typeFilter.filter((t) => t !== type)) : setTypeFilter([...typeFilter, type]);
          }
        },
        type,
        !1,
        {
          fileName: "app/routes/admin/dashboard/index.tsx",
          lineNumber: 202,
          columnNumber: 13
        },
        this
      )) }, void 0, !1, {
        fileName: "app/routes/admin/dashboard/index.tsx",
        lineNumber: 200,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/dashboard/index.tsx",
      lineNumber: 186,
      columnNumber: 7
    }, this),
    allDashboardItems.length === 0 && !dashboardDataFetcher.hasFetchedOnce && /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(import_jsx_dev_runtime60.Fragment, { children: Array(6).fill(0).map((_, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
      "div",
      {
        className: "w-full max-w-3xl h-20 mb-4 bg-gray-900 dark:bg-gray-300 rounded"
      },
      i,
      !1,
      {
        fileName: "app/routes/admin/dashboard/index.tsx",
        lineNumber: 223,
        columnNumber: 15
      },
      this
    )) }, void 0, !1, {
      fileName: "app/routes/admin/dashboard/index.tsx",
      lineNumber: 219,
      columnNumber: 9
    }, this),
    filteredDashboardItems.map((action33) => {
      let isAssignedToOther = !action33.isProcessed && action33.assignedMod && action33.assignedMod.userId !== user.userId, isAssignedToMe = !action33.isProcessed && action33.assignedMod && action33.assignedMod.userId === user.userId, assignationBgClass = "bg-white dark:bg-gray-300 shadow-md";
      (isAssignedToOther || action33.isProcessed) && (assignationBgClass = "bg-gray-900 dark:bg-gray-250"), isAssignedToMe && (assignationBgClass = "bg-theme1-primaryLessTrans dark:bg-theme1-primaryTrans shadow-md");
      let innerContainerClassName = "flex flex-col gap-2 md:flex-row justify-between";
      return /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
        "div",
        {
          className: `p-3 w-full mb-4 max-w-3xl rounded 
              ${assignationBgClass}
            `,
          children: [
            action33.type === "tagSuggestion" && /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
              TagSuggestion,
              {
                action: action33,
                onProcessSuggestion: processTagSuggestion2,
                loadingAction: latestSubmittedAction,
                isLoading: latestSubmittedId === action33.id && processTagFetcher.isLoading,
                innerContainerClassName
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/index.tsx",
                lineNumber: 260,
                columnNumber: 15
              },
              this
            ),
            action33.type === "comicUpload" && /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
              ComicUpload,
              {
                action: action33,
                onAssignMe: assignActionToMod2,
                onUnassignMe: unassignActionFromMod,
                isLoading: latestSubmittedId === action33.id && (assignModFetcher.isLoading || unassignModFetcher.isLoading),
                loadingAction: latestSubmittedAction,
                isAssignedToOther,
                isAssignedToMe,
                innerContainerClassName
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/index.tsx",
                lineNumber: 270,
                columnNumber: 15
              },
              this
            ),
            action33.type === "comicSuggestion" && /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
              ComicSuggestion,
              {
                action: action33,
                onAssignMe: assignActionToMod2,
                onUnassignMe: unassignActionFromMod,
                onProcessed: processComicSuggestion2,
                isLoading: latestSubmittedId === action33.id && (assignModFetcher.isLoading || unassignModFetcher.isLoading || comicSuggestionFetcher.isLoading),
                loadingAction: latestSubmittedAction,
                isAssignedToOther,
                isAssignedToMe,
                innerContainerClassName
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/index.tsx",
                lineNumber: 286,
                columnNumber: 15
              },
              this
            ),
            action33.type === "comicProblem" && /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
              ComicProblem,
              {
                action: action33,
                onAssignMe: assignActionToMod2,
                onUnassignMe: unassignActionFromMod,
                onProcessed: processComicProblem2,
                isLoading: latestSubmittedId === action33.id && (assignModFetcher.isLoading || unassignModFetcher.isLoading || problemFetcher.isLoading),
                loadingAction: latestSubmittedAction,
                isAssignedToOther,
                isAssignedToMe,
                innerContainerClassName
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/index.tsx",
                lineNumber: 305,
                columnNumber: 15
              },
              this
            ),
            action33.type === "pendingComicProblem" && /* @__PURE__ */ (0, import_jsx_dev_runtime60.jsxDEV)(
              PendingComicProblem,
              {
                action: action33,
                onAssignMe: assignActionToMod2,
                onUnassignMe: unassignActionFromMod,
                isLoading: latestSubmittedId === action33.id && (assignModFetcher.isLoading || unassignModFetcher.isLoading),
                loadingAction: latestSubmittedAction,
                isAssignedToOther,
                isAssignedToMe,
                innerContainerClassName
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/dashboard/index.tsx",
                lineNumber: 324,
                columnNumber: 15
              },
              this
            )
          ]
        },
        action33.id,
        !0,
        {
          fileName: "app/routes/admin/dashboard/index.tsx",
          lineNumber: 253,
          columnNumber: 11
        },
        this
      );
    })
  ] }, void 0, !0, {
    fileName: "app/routes/admin/dashboard/index.tsx",
    lineNumber: 176,
    columnNumber: 5
  }, this);
}
function getTimeAgo(time) {
  return (0, import_date_fns3.formatDistanceToNow)(new Date(time), {
    addSuffix: !1
  });
}

// app/routes/admin/dashboard/ComicSuggestion.tsx
var import_jsx_dev_runtime61 = require("react/jsx-dev-runtime");
function ComicSuggestion({
  action: action33,
  isLoading,
  onAssignMe,
  onUnassignMe,
  onProcessed,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName
}) {
  let [isOpen, setIsOpen] = (0, import_react56.useState)(!1), [isRejectingWithComment, setIsRejectingWithComment] = (0, import_react56.useState)(!1), [rejectComment, setRejectComment] = (0, import_react56.useState)(""), [theme] = useTheme(), themedColor = theme === "light" ? "#db72ab" : "#c54b8d", isChooseActionButtonLoading = isLoading && !!loadingAction && ["unassign", "process-upload"].includes(loadingAction);
  function onInitiateRejectComment() {
    isOpen || setIsOpen(!0), setIsRejectingWithComment(!0), setRejectComment("");
  }
  function finishRejectWithComment() {
    onProcessed(action33, !1, void 0, rejectComment);
  }
  return loadingAction === "process-upload" && !isLoading && isRejectingWithComment && setIsRejectingWithComment(!1), /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(
    "div",
    {
      className: "flex flex-col w-full gap-2 cursor-pointer",
      onClick: () => setIsOpen(!isOpen),
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("div", { className: innerContainerClassName, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("div", { className: "flex flex-col justify-between gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(Chip, { color: themedColor, text: "Comic suggestion" }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 75,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("b", { children: action33.primaryField }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 77,
              columnNumber: 13
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 76,
              columnNumber: 11
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
            lineNumber: 74,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("div", { className: "flex flex-col md:items-end justify-between gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("p", { className: "text-sm", children: [
              action33.user.username || action33.user.ip,
              " - ",
              getTimeAgo(action33.timestamp)
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 82,
              columnNumber: 11
            }, this),
            action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("i", { children: [
              "Completed by: ",
              action33.assignedMod?.username
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 90,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 89,
              columnNumber: 13
            }, this),
            isAssignedToOther && /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("i", { children: [
              "Assigned to: ",
              action33.assignedMod.username
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 95,
              columnNumber: 15
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 94,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("div", { className: "flex flex-row gap-2 self-end", children: [
              isAssignedToMe && /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(
                DropdownButton,
                {
                  text: "Choose action",
                  color: "primary",
                  isLoading: isChooseActionButtonLoading,
                  options: [
                    {
                      text: "Unassign from me",
                      onClick: () => onUnassignMe(action33)
                    },
                    {
                      text: "Reject with comment",
                      onClick: onInitiateRejectComment
                    },
                    {
                      text: "Reject as spam/dupl.",
                      onClick: () => onProcessed(action33, !1)
                    },
                    {
                      text: "Completed - excellent info",
                      onClick: () => onProcessed(action33, !0, "good")
                    },
                    {
                      text: "Completed - lacking info",
                      onClick: () => onProcessed(action33, !0, "bad")
                    }
                  ]
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
                  lineNumber: 101,
                  columnNumber: 15
                },
                this
              ),
              !action33.isProcessed && !action33.assignedMod && /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(
                LoadingButton,
                {
                  color: "primary",
                  onClick: (e) => {
                    e.stopPropagation(), onAssignMe(action33);
                  },
                  text: "I'm on it",
                  isLoading: isLoading && loadingAction === "assign"
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
                  lineNumber: 130,
                  columnNumber: 15
                },
                this
              )
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 99,
              columnNumber: 11
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
            lineNumber: 81,
            columnNumber: 9
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
          lineNumber: 73,
          columnNumber: 7
        }, this),
        isOpen ? /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(import_jsx_dev_runtime61.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(
            "p",
            {
              className: "whitespace-pre-wrap cursor-auto",
              onClick: (e) => e.stopPropagation(),
              children: action33.description
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 146,
              columnNumber: 11
            },
            this
          ),
          isRejectingWithComment && /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("div", { className: "mt-4 mb-2 cursor-auto", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("b", { children: "Reject with comment" }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 156,
              columnNumber: 17
            }, this) }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 155,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("p", { children: "This comment will be visible to the user. Keep it short and grammatically correct!" }, void 0, !1, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 158,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(import_react55.Form, { children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(
                TextInput,
                {
                  value: rejectComment,
                  onChange: setRejectComment,
                  placeholder: 'E.g. "quality too low" or "paywalled content"',
                  label: "Comment",
                  name: "comment",
                  className: "mt-2 mb-2"
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
                  lineNumber: 163,
                  columnNumber: 17
                },
                this
              ),
              /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(
                  LoadingButton,
                  {
                    color: "primary",
                    onClick: finishRejectWithComment,
                    disabled: !rejectComment,
                    text: "Reject suggestion",
                    isSubmit: !0,
                    isLoading: isLoading && loadingAction === "process-upload"
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
                    lineNumber: 172,
                    columnNumber: 19
                  },
                  this
                ),
                /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(
                  Button,
                  {
                    color: "error",
                    variant: "outlined",
                    onClick: () => setIsRejectingWithComment(!1),
                    text: "Cancel"
                  },
                  void 0,
                  !1,
                  {
                    fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
                    lineNumber: 180,
                    columnNumber: 19
                  },
                  this
                )
              ] }, void 0, !0, {
                fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
                lineNumber: 171,
                columnNumber: 17
              }, this)
            ] }, void 0, !0, {
              fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
              lineNumber: 162,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
            lineNumber: 154,
            columnNumber: 13
          }, this),
          action33.isProcessed && /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)("b", { children: [
            "Verdict: ",
            action33.verdict
          ] }, void 0, !0, {
            fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
            lineNumber: 193,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
            lineNumber: 192,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(import_io54.IoCaretUp, { className: "mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" }, void 0, !1, {
            fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
            lineNumber: 197,
            columnNumber: 11
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
          lineNumber: 145,
          columnNumber: 9
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime61.jsxDEV)(import_io54.IoCaretDown, { className: "mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" }, void 0, !1, {
          fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
          lineNumber: 200,
          columnNumber: 9
        }, this)
      ]
    },
    void 0,
    !0,
    {
      fileName: "app/routes/admin/dashboard/ComicSuggestion.tsx",
      lineNumber: 69,
      columnNumber: 5
    },
    this
  );
}

// app/routes/admin/pending-comics.tsx
var pending_comics_exports = {};
__export(pending_comics_exports, {
  default: () => PendingComics,
  loader: () => loader17
});
var import_react57 = require("@remix-run/react"), import_date_fns4 = require("date-fns"), import_react58 = require("react"), import_md20 = require("react-icons/md");

// app/components/Buttons/LoadingIconButton.tsx
var import_jsx_dev_runtime62 = require("react/jsx-dev-runtime");
function LoadingIconButton({
  isLoading,
  variant = "contained",
  color = "primary",
  icon,
  onClick,
  ...props
}) {
  let className = (isLoading ? "opacity-70 " : "") + props.className;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime62.jsxDEV)(
    IconButton,
    {
      ...props,
      variant,
      color,
      className,
      icon: isLoading ? Spinner3(variant, color) : icon,
      onClick: isLoading ? () => {
      } : onClick
    },
    void 0,
    !1,
    {
      fileName: "app/components/Buttons/LoadingIconButton.tsx",
      lineNumber: 20,
      columnNumber: 5
    },
    this
  );
}
var Spinner3 = (variant, color) => {
  let borderRightColor = "";
  return variant === "contained" ? borderRightColor = "border-r-white" : (borderRightColor = "dark:border-r-white", color === "error" ? (borderRightColor += " border-r-red-weak-200", variant !== "naked" && (borderRightColor += " hover:border-r-white")) : (borderRightColor += " border-r-blue-weak-200", variant !== "naked" && (borderRightColor += " hover:border-r-white"))), () => /* @__PURE__ */ (0, import_jsx_dev_runtime62.jsxDEV)(
    "div",
    {
      className: `w-4 h-4 animate-spin border-solid border-transparent ${borderRightColor} border border-r-2 rounded-full`
    },
    void 0,
    !1,
    {
      fileName: "app/components/Buttons/LoadingIconButton.tsx",
      lineNumber: 51,
      columnNumber: 5
    },
    this
  );
};

// app/routes/admin/pending-comics.tsx
var import_jsx_dev_runtime63 = require("react/jsx-dev-runtime"), filterOptions = [
  { value: "all", text: "All" },
  { value: "scheduled", text: "Publishing queue" },
  { value: "unscheduled", text: "Unscheduled only" },
  { value: "problematic", text: "Problematic only" }
];
function PendingComics() {
  let { pendingComics, dailySchedulePublishCount } = (0, import_react57.useLoaderData)(), { isMobile } = useWindowSize(), moveUpFetcher = useGoodFetcher({
    url: "/api/admin/move-queued-comic",
    method: "post"
  }), moveDownFetcher = useGoodFetcher({
    url: "/api/admin/move-queued-comic",
    method: "post"
  }), recalculateFetcher = useGoodFetcher({
    url: "/api/admin/recalculate-publishing-queue",
    method: "post",
    toastSuccessMessage: "Successfully recalculated queue"
  }), [filter, setFilter] = (0, import_react58.useState)("all"), totalPublishingQueueLength = (0, import_react58.useMemo)(
    () => pendingComics.filter((comic) => comic.publishingQueuePos).length,
    [pendingComics]
  );
  function moveComic(comicId, direction) {
    direction === "up" && moveUpFetcher.submit({ comicId: comicId.toString(), direction: "up" }), direction === "down" && moveDownFetcher.submit({ comicId: comicId.toString(), direction: "down" });
  }
  let filteredComics = (0, import_react58.useMemo)(() => filter === "all" ? pendingComics : filter === "scheduled" ? pendingComics.filter((comic) => comic.publishStatus === "scheduled").sort((a, b) => a.publishingQueuePos && b.publishingQueuePos ? a.publishingQueuePos - b.publishingQueuePos : a.publishingQueuePos ? 1 : b.publishingQueuePos ? -1 : 0) : filter === "unscheduled" ? pendingComics.filter(
    (comic) => comic.publishStatus === "pending" && !isProblematic(comic)
  ) : filter === "problematic" ? pendingComics.filter((comic) => isProblematic(comic)) : pendingComics, [filter, pendingComics]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_jsx_dev_runtime63.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("h1", { children: "Pending comics" }, void 0, !1, {
      fileName: "app/routes/admin/pending-comics.tsx",
      lineNumber: 96,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: "This is the home of comics that have been uploaded by mods, or by users and then passed a mod review." }, void 0, !1, {
      fileName: "app/routes/admin/pending-comics.tsx",
      lineNumber: 97,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { className: "mt-2", children: "Only admins can set schedule pending comics for publishing or add them to the publishing queue." }, void 0, !1, {
      fileName: "app/routes/admin/pending-comics.tsx",
      lineNumber: 101,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { className: "mt-2", children: [
      "Comics in the publishing queue are published daily at noon, ET.",
      " ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("b", { children: dailySchedulePublishCount }, void 0, !1, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 107,
        columnNumber: 9
      }, this),
      " comics are scheduled daily, as long as there are enough in the queue."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/pending-comics.tsx",
      lineNumber: 105,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("div", { className: "flex flex-row flex-wrap my-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(
      RadioButtonGroup,
      {
        direction: isMobile ? "vertical" : "horizontal",
        options: filterOptions,
        value: filter,
        onChange: (val) => setFilter(val),
        name: "filter"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 112,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/admin/pending-comics.tsx",
      lineNumber: 111,
      columnNumber: 7
    }, this),
    filter === "scheduled" && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_jsx_dev_runtime63.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(
        LoadingButton,
        {
          isLoading: recalculateFetcher.isLoading,
          onClick: () => recalculateFetcher.submit(),
          text: "Recalculate publishing queue positions"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 123,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { className: "text-sm mb-4", children: "In case some comics are missing placement or something else is wrong" }, void 0, !1, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 128,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/pending-comics.tsx",
      lineNumber: 122,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("div", { className: `flex flex-col gap-2 ${isMobile ? "w-full" : "w-fit"}`, children: filteredComics.map((comic) => {
      let nameLink = /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(
        Link,
        {
          href: `/admin/comics/${comic.comicId}`,
          text: `${comic.comicName} - ${comic.artistName}`
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 137,
          columnNumber: 13
        },
        this
      ), publishedP = comic.publishStatus === "scheduled" && comic.publishDate && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_md20.MdCheck, {}, void 0, !1, {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 145,
          columnNumber: 15
        }, this),
        " Scheduled: ",
        (0, import_date_fns4.format)(new Date(comic.publishDate), "MMM do")
      ] }, void 0, !0, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 144,
        columnNumber: 13
      }, this), scheduledP = comic.publishStatus === "scheduled" && !comic.publishDate && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("div", { className: "flex flex-row items-center", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_md20.MdCheck, {}, void 0, !1, {
            fileName: "app/routes/admin/pending-comics.tsx",
            lineNumber: 153,
            columnNumber: 19
          }, this),
          " Publishing queue, ",
          comic.publishingQueuePos ?? "?",
          "/",
          totalPublishingQueueLength
        ] }, void 0, !0, {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 152,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(
          LoadingIconButton,
          {
            icon: import_md20.MdArrowDownward,
            variant: "naked",
            isLoading: moveDownFetcher.isLoading,
            onClick: () => moveComic(comic.comicId, "down"),
            disabled: comic.publishingQueuePos === totalPublishingQueueLength,
            className: "ml-2"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/pending-comics.tsx",
            lineNumber: 156,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(
          LoadingIconButton,
          {
            icon: import_md20.MdArrowUpward,
            variant: "naked",
            isLoading: moveUpFetcher.isLoading,
            disabled: comic.publishingQueuePos === 1,
            onClick: () => moveComic(comic.comicId, "up")
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/pending-comics.tsx",
            lineNumber: 164,
            columnNumber: 17
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 151,
        columnNumber: 15
      }, this), noTagsP = comic.numberOfTags === 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_md20.MdError, {}, void 0, !1, {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 176,
          columnNumber: 15
        }, this),
        " No tags"
      ] }, void 0, !0, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 175,
        columnNumber: 13
      }, this), errorP = comic.errorText && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_md20.MdError, {}, void 0, !1, {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 182,
          columnNumber: 15
        }, this),
        " Error: ",
        comic.errorText,
        comic.pendingProblemModId && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("span", { children: " (mod has been assigned)" }, void 0, !1, {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 183,
          columnNumber: 45
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 181,
        columnNumber: 13
      }, this), addedReviewerP = /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
        "Added by ",
        comic.uploadUsername || comic.uploadUserIP,
        ",",
        " ",
        (0, import_date_fns4.format)(new Date(comic.timestamp), "MMM do"),
        comic.reviewerModName && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_jsx_dev_runtime63.Fragment, { children: [
          " - reviewer: ",
          comic.reviewerModName
        ] }, void 0, !0, {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 191,
          columnNumber: 41
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 188,
        columnNumber: 13
      }, this), scheduledByP = comic.scheduleModName && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
        "Scheduled by: ",
        comic.scheduleModName
      ] }, void 0, !0, {
        fileName: "app/routes/admin/pending-comics.tsx",
        lineNumber: 196,
        columnNumber: 13
      }, this);
      return /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(
        "div",
        {
          className: `flex flex-row shadow rounded-sm justify-between gap-x-6 px-3 py-2 ${getBgColor(
            comic
          )}`,
          children: isMobile ? /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("div", { children: [
            nameLink,
            publishedP,
            scheduledP,
            noTagsP,
            errorP,
            /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
              "Added by ",
              comic.uploadUsername || comic.uploadUserIP,
              ",",
              " ",
              (0, import_date_fns4.format)(new Date(comic.timestamp), "MMM do")
            ] }, void 0, !0, {
              fileName: "app/routes/admin/pending-comics.tsx",
              lineNumber: 213,
              columnNumber: 19
            }, this),
            comic.reviewerModName && /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("p", { children: [
              "Reviewer: ",
              comic.reviewerModName
            ] }, void 0, !0, {
              fileName: "app/routes/admin/pending-comics.tsx",
              lineNumber: 217,
              columnNumber: 45
            }, this),
            scheduledByP
          ] }, void 0, !0, {
            fileName: "app/routes/admin/pending-comics.tsx",
            lineNumber: 207,
            columnNumber: 17
          }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)(import_jsx_dev_runtime63.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("div", { className: "w-fit", children: [
              nameLink,
              publishedP,
              scheduledP,
              noTagsP,
              errorP
            ] }, void 0, !0, {
              fileName: "app/routes/admin/pending-comics.tsx",
              lineNumber: 222,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime63.jsxDEV)("div", { className: "w-fit flex flex-col items-end text-end justify-between", children: [
              addedReviewerP,
              scheduledByP
            ] }, void 0, !0, {
              fileName: "app/routes/admin/pending-comics.tsx",
              lineNumber: 230,
              columnNumber: 19
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/pending-comics.tsx",
            lineNumber: 221,
            columnNumber: 17
          }, this)
        },
        comic.comicId,
        !1,
        {
          fileName: "app/routes/admin/pending-comics.tsx",
          lineNumber: 200,
          columnNumber: 13
        },
        this
      );
    }) }, void 0, !1, {
      fileName: "app/routes/admin/pending-comics.tsx",
      lineNumber: 134,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/pending-comics.tsx",
    lineNumber: 95,
    columnNumber: 5
  }, this);
}
async function loader17(args) {
  let { err, pendingComics } = await getPendingComics(args.context.DB_API_URL_BASE);
  return err ? processApiError("Error getting pending comics in mod panel", err) : {
    pendingComics: pendingComics || [],
    dailySchedulePublishCount: parseInt(args.context.DAILY_SCHEDULE_PUBLISH_COUNT)
  };
}
function getBgColor(pendingComic) {
  return pendingComic.publishStatus === "scheduled" ? "bg-theme1-primaryMoreTrans dark:bg-theme1-primaryTrans" : pendingComic.errorText || pendingComic.numberOfTags === 0 ? "bg-red-moreTrans dark:bg-red-trans" : "bg-white dark:bg-gray-300";
}
function isProblematic(pendingComic) {
  return !!pendingComic.errorText || pendingComic.numberOfTags === 0;
}

// app/routes/admin/thumbnails.tsx
var thumbnails_exports = {};
__export(thumbnails_exports, {
  default: () => UpdateThumbnails
});
var import_react59 = require("@remix-run/react"), import_react60 = __toESM(require("react")), import_md21 = require("react-icons/md");
var import_jsx_dev_runtime64 = require("react/jsx-dev-runtime");
function UpdateThumbnails({}) {
  let globalContext = (0, import_react59.useOutletContext)(), numTotalComics = globalContext.comics.length, numMissingComics = numTotalComics - globalContext.comics.filter((comic) => comic.temp_hasHighresThumbnail).length, orderedMissingComics = globalContext.comics.filter((comic) => !comic.temp_hasHighresThumbnail).sort((a, b) => b.temp_published.localeCompare(a.temp_published)).map((comic) => ({
    id: comic.id,
    name: comic.name,
    daysSincePublished: Math.floor(
      (Date.now() - new Date(comic.temp_published).getTime()) / (1e3 * 60 * 60 * 24)
    )
  }));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)(import_jsx_dev_runtime64.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)("h1", { children: "Update old thumbnails" }, void 0, !1, {
      fileName: "app/routes/admin/thumbnails.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)("p", { className: "mb-2", children: "Thumbnails uploaded to old Yiffer were converted to a too low resolution. We should work on replacing them with higher res ones until all have been replaced. Doing so will give you points in the contributions score system." }, void 0, !1, {
      fileName: "app/routes/admin/thumbnails.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)("p", { className: "mb-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)("b", { children: [
      "Current progress: ",
      numMissingComics,
      "/",
      numTotalComics,
      " need fixing."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/thumbnails.tsx",
      lineNumber: 36,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/admin/thumbnails.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)("p", { className: "mb-2", children: "Ordered by time since published date (the first column). More recent = more important." }, void 0, !1, {
      fileName: "app/routes/admin/thumbnails.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)("div", { className: "grid gap-x-3 w-fit", style: { gridTemplateColumns: "auto auto" }, children: orderedMissingComics.map((comic) => /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)(import_react60.default.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)("p", { children: getTimeSincePublishString(comic.daysSincePublished) }, void 0, !1, {
        fileName: "app/routes/admin/thumbnails.tsx",
        lineNumber: 49,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime64.jsxDEV)(
        Link,
        {
          href: `/admin/comics/${comic.id}`,
          newTab: !0,
          text: comic.name,
          IconRight: import_md21.MdArrowForward
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/thumbnails.tsx",
          lineNumber: 50,
          columnNumber: 13
        },
        this
      )
    ] }, comic.id, !0, {
      fileName: "app/routes/admin/thumbnails.tsx",
      lineNumber: 48,
      columnNumber: 11
    }, this)) }, void 0, !1, {
      fileName: "app/routes/admin/thumbnails.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/thumbnails.tsx",
    lineNumber: 28,
    columnNumber: 5
  }, this);
}
function getTimeSincePublishString(daysSincePublished) {
  if (daysSincePublished < 32)
    return `${daysSincePublished} days`;
  if (daysSincePublished < 365) {
    let months = Math.floor(daysSincePublished / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    let years = Math.floor(daysSincePublished / 365), months = Math.floor(daysSincePublished % 365 / 30);
    return `${years}y` + (months > 0 ? ` ${months}m` : "");
  }
}

// app/routes/admin/artists.tsx
var artists_exports = {};
__export(artists_exports, {
  default: () => ManageArtists
});
var import_react61 = require("@remix-run/react"), import_react62 = require("react");
var import_jsx_dev_runtime65 = require("react/jsx-dev-runtime");
function ManageArtists({}) {
  let navigate = (0, import_react61.useNavigate)(), [selectedArtist, setSelectedArtist] = (0, import_react62.useState)(), globalContext = (0, import_react61.useOutletContext)(), artistOptions = globalContext.artists.map((artist) => ({
    value: artist,
    text: artist.name
  }));
  return (0, import_react62.useEffect)(() => {
    selectedArtist && navigate(`/admin/artists/${selectedArtist.id}`);
  }, [selectedArtist]), /* @__PURE__ */ (0, import_jsx_dev_runtime65.jsxDEV)(import_jsx_dev_runtime65.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime65.jsxDEV)("h1", { children: "Artist manager" }, void 0, !1, {
      fileName: "app/routes/admin/artists.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime65.jsxDEV)(
      SearchableSelect,
      {
        options: artistOptions,
        value: selectedArtist,
        onChange: setSelectedArtist,
        onValueCleared: () => setSelectedArtist(void 0),
        title: "Select artist",
        name: "artist",
        className: "mb-8"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/artists.tsx",
        lineNumber: 29,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime65.jsxDEV)(import_react61.Outlet, { context: globalContext }, void 0, !1, {
      fileName: "app/routes/admin/artists.tsx",
      lineNumber: 39,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/artists.tsx",
    lineNumber: 26,
    columnNumber: 5
  }, this);
}

// app/routes/admin/artists/$artist.tsx
var artist_exports = {};
__export(artist_exports, {
  default: () => ManageArtist,
  loader: () => loader18
});
var import_react63 = require("@remix-run/react"), import_react64 = require("react"), import_md22 = require("react-icons/md");
var import_jsx_dev_runtime66 = require("react/jsx-dev-runtime");
function ManageArtist() {
  let { isMobile } = useWindowSize(), { artist, comics, user } = (0, import_react63.useLoaderData)(), banArtistFetcher = useGoodFetcher({
    url: "/api/admin/toggle-artist-ban",
    method: "post",
    toastSuccessMessage: "Artist ban status updated"
  }), saveChangesFetcher = useGoodFetcher({
    url: "/api/admin/update-artist-data",
    method: "post",
    toastSuccessMessage: "Artist updated",
    onFinish: () => {
      setNeedsUpdate(!0), setIsBanning(!1);
    }
  }), [updatedArtistData, setUpdatedArtistData] = (0, import_react64.useState)(), [needsUpdate, setNeedsUpdate] = (0, import_react64.useState)(!1), [isBanning, setIsBanning] = (0, import_react64.useState)(!1);
  (0, import_react64.useEffect)(() => {
    (!updatedArtistData?.artistName || updatedArtistData.id !== artist?.id || needsUpdate) && (setInitialArtistData(), setNeedsUpdate(!1));
  }, [artist]);
  function setInitialArtistData() {
    let newUpdatedArtistData = setupInitialUpdatedArtist(artist);
    setUpdatedArtistData(newUpdatedArtistData);
  }
  let artistChanges = (0, import_react64.useMemo)(() => updatedArtistData ? getChanges(artist, updatedArtistData) : [], [updatedArtistData, artist]);
  function saveChanges() {
    if (!artistChanges)
      return;
    let body = {
      artistId: artist.id
    };
    for (let change of artistChanges)
      change.field === "Name" ? body.name = change.newDataValue : change.field === "E621 name" ? body.e621Name = change.newDataValue : change.field === "Patreon name" ? body.patreonName = change.newDataValue : change.field === "Links" && (body.links = change.newDataValue);
    saveChangesFetcher.submit({ body: JSON.stringify(body) });
  }
  let canSave = (0, import_react64.useMemo)(() => !(!updatedArtistData || updatedArtistData.artistName !== artist.name && !updatedArtistData.isValidName || !updatedArtistData.e621Name && !updatedArtistData.hasConfirmedNoE621Name || !updatedArtistData.patreonName && !updatedArtistData.hasConfirmedNoPatreonName || !updatedArtistData.areLinksValid), [artistChanges, updatedArtistData]);
  function toggleArtistBan2() {
    banArtistFetcher.submit({
      isBanned: artist.isBanned ? "false" : "true",
      artistId: artist.id.toString()
    });
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_jsx_dev_runtime66.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("h2", { className: "mb-2", children: artist.name }, void 0, !1, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 110,
      columnNumber: 7
    }, this),
    artist.isBanned && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "bg-theme1-primaryTrans p-4 pt-3 w-fit mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("h3", { children: "Banned artist" }, void 0, !1, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 114,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { children: "This artist cannot be chosen for new/existing comics, and cannot be suggested. The reasons could be that they've asked not to be featured on the site, or anything else." }, void 0, !1, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 115,
        columnNumber: 11
      }, this),
      user.userType === "admin" ? /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_jsx_dev_runtime66.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { className: "mt-4 mb-2", children: "If unbanning an artist with unlisted comics, you will still have to re-list the comics individually if they should be shown on the site." }, void 0, !1, {
          fileName: "app/routes/admin/artists/$artist.tsx",
          lineNumber: 123,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
          LoadingButton,
          {
            onClick: toggleArtistBan2,
            className: "mt-2",
            isLoading: banArtistFetcher.isLoading,
            color: "error",
            text: "Unban artist"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/artists/$artist.tsx",
            lineNumber: 127,
            columnNumber: 15
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 122,
        columnNumber: 13
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { children: "Only admins can unban artists." }, void 0, !1, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 136,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 113,
      columnNumber: 9
    }, this),
    artist.isPending && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "bg-theme1-primaryTrans p-4 pt-3 w-fit mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("h3", { children: "Pending artist" }, void 0, !1, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 143,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { children: "This artist is pending. This means that a user has uploaded a comic and in the same process created a new artist. If the comic is approved, the artist stops being pending. If the comic is rejected, this artist is deleted (fully - not banned, actually deleted)." }, void 0, !1, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 144,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 142,
      columnNumber: 9
    }, this),
    !artist.isBanned && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "mb-6", children: !artist.isPending && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { className: "text-lg text-theme1-darker", children: [
      "This artist is live!",
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
        Link,
        {
          href: `/artist/${artist.name}`,
          className: "ml-2",
          text: "View live artist page",
          IconRight: import_md22.MdOpenInNew,
          newTab: !0
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/artists/$artist.tsx",
          lineNumber: 158,
          columnNumber: 15
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 156,
      columnNumber: 13
    }, this) }, void 0, !1, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 154,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("h4", { className: "mt-2", children: "Comics" }, void 0, !1, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 170,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "flex flex-wrap gap-x-3 gap-y-2 mb-6", children: comics.length ? comics.map((comic) => /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
      "div",
      {
        className: "px-2 py-1 bg-theme1-primaryTrans dark:bg-theme1-primaryMoreTrans flex flex-row flex-wrap gap-x-3",
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { children: comic.name }, void 0, !1, {
            fileName: "app/routes/admin/artists/$artist.tsx",
            lineNumber: 178,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "flex flex-row gap-3", children: [
            comic.publishStatus === "published" && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
              Link,
              {
                href: `/${comic.name}`,
                text: "Live",
                newTab: !0,
                IconRight: import_md22.MdOpenInNew
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/artists/$artist.tsx",
                lineNumber: 181,
                columnNumber: 19
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
              Link,
              {
                href: `/admin/comics/${comic.id}`,
                text: "Admin",
                IconRight: import_md22.MdArrowForward
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/artists/$artist.tsx",
                lineNumber: 188,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/artists/$artist.tsx",
            lineNumber: 179,
            columnNumber: 15
          }, this)
        ]
      },
      comic.id,
      !0,
      {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 174,
        columnNumber: 13
      },
      this
    )) : /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { children: "This artist has no comics that are uploaded, pending, or live." }, void 0, !1, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 197,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 171,
      columnNumber: 7
    }, this),
    updatedArtistData && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
      ArtistEditor,
      {
        newArtistData: updatedArtistData,
        existingArtist: artist,
        onUpdate: setUpdatedArtistData,
        hideBorderTitle: !0,
        className: "max-w-3xl"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 202,
        columnNumber: 9
      },
      this
    ),
    artistChanges.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_jsx_dev_runtime66.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
        "div",
        {
          className: `py-2 px-4 bg-theme1-primaryTrans flex flex-col gap-1 mt-6 ${isMobile ? "" : "w-fit"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("h4", { children: "Changes" }, void 0, !1, {
              fileName: "app/routes/admin/artists/$artist.tsx",
              lineNumber: 218,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
              "div",
              {
                className: `grid ${isMobile ? "gap-y-2" : "gap-x-4"}`,
                style: { gridTemplateColumns: isMobile ? "auto" : "auto auto" },
                children: artistChanges.map((change) => {
                  let hasDetails = !!change.newValue;
                  return isMobile ? /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "grid gap-y-2", children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { className: hasDetails ? "" : "col-span-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("b", { children: [
                      change.field,
                      ":"
                    ] }, void 0, !0, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 229,
                      columnNumber: 23
                    }, this) }, void 0, !1, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 228,
                      columnNumber: 21
                    }, this),
                    hasDetails && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { children: change.oldValue ? /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_jsx_dev_runtime66.Fragment, { children: [
                      change.oldValue,
                      " ",
                      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_md22.MdArrowForward, {}, void 0, !1, {
                        fileName: "app/routes/admin/artists/$artist.tsx",
                        lineNumber: 235,
                        columnNumber: 47
                      }, this),
                      " ",
                      change.newValue
                    ] }, void 0, !0, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 234,
                      columnNumber: 27
                    }, this) : change.newValue }, void 0, !1, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 232,
                      columnNumber: 23
                    }, this)
                  ] }, change.field, !0, {
                    fileName: "app/routes/admin/artists/$artist.tsx",
                    lineNumber: 227,
                    columnNumber: 19
                  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_react64.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { className: hasDetails ? "" : "col-span-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("b", { children: change.field }, void 0, !1, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 246,
                      columnNumber: 23
                    }, this) }, void 0, !1, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 245,
                      columnNumber: 21
                    }, this),
                    hasDetails && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { children: change.oldValue ? /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_jsx_dev_runtime66.Fragment, { children: [
                      change.oldValue,
                      " ",
                      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_md22.MdArrowForward, {}, void 0, !1, {
                        fileName: "app/routes/admin/artists/$artist.tsx",
                        lineNumber: 252,
                        columnNumber: 47
                      }, this),
                      " ",
                      change.newValue
                    ] }, void 0, !0, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 251,
                      columnNumber: 27
                    }, this) : change.newValue }, void 0, !1, {
                      fileName: "app/routes/admin/artists/$artist.tsx",
                      lineNumber: 249,
                      columnNumber: 23
                    }, this)
                  ] }, change.field, !0, {
                    fileName: "app/routes/admin/artists/$artist.tsx",
                    lineNumber: 244,
                    columnNumber: 19
                  }, this);
                })
              },
              void 0,
              !1,
              {
                fileName: "app/routes/admin/artists/$artist.tsx",
                lineNumber: 219,
                columnNumber: 13
              },
              this
            )
          ]
        },
        void 0,
        !0,
        {
          fileName: "app/routes/admin/artists/$artist.tsx",
          lineNumber: 213,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "flex flex-row gap-2 mt-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
          Button,
          {
            variant: "outlined",
            text: "Revert changes",
            onClick: setInitialArtistData,
            startIcon: import_md22.MdReplay
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/artists/$artist.tsx",
            lineNumber: 266,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
          LoadingButton,
          {
            text: "Save changes",
            isLoading: saveChangesFetcher.isLoading,
            onClick: saveChanges,
            startIcon: import_md22.MdCheck,
            disabled: !canSave
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/artists/$artist.tsx",
            lineNumber: 272,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 265,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 212,
      columnNumber: 9
    }, this),
    user.userType === "admin" && !artist.isBanned && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "mt-10", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("h3", { children: "Admin tools" }, void 0, !1, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 285,
        columnNumber: 11
      }, this),
      !isBanning && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
        Button,
        {
          text: "Ban artist",
          onClick: () => setIsBanning(!0),
          color: "error",
          className: "mt-2"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/artists/$artist.tsx",
          lineNumber: 287,
          columnNumber: 13
        },
        this
      ),
      isBanning && /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(import_jsx_dev_runtime66.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("h4", { children: "Ban artist" }, void 0, !1, {
          fileName: "app/routes/admin/artists/$artist.tsx",
          lineNumber: 296,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("p", { className: "mt-2", children: "Banning an artist will unlist any comics they have, and prevent users from suggesting or uploading comics by them. It will also reject any pending and user uploaded comic by them." }, void 0, !1, {
          fileName: "app/routes/admin/artists/$artist.tsx",
          lineNumber: 297,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)("div", { className: "flex flex-row gap-2 flex-wrap mt-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
            Button,
            {
              variant: "outlined",
              text: "Cancel",
              onClick: () => setIsBanning(!1),
              startIcon: import_md22.MdClose
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/artists/$artist.tsx",
              lineNumber: 303,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime66.jsxDEV)(
            LoadingButton,
            {
              isLoading: banArtistFetcher.isLoading,
              text: "Ban artist",
              onClick: toggleArtistBan2,
              color: "error",
              startIcon: import_md22.MdCheck
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/artists/$artist.tsx",
              lineNumber: 309,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/admin/artists/$artist.tsx",
          lineNumber: 302,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/artists/$artist.tsx",
        lineNumber: 295,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/artists/$artist.tsx",
      lineNumber: 284,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/artists/$artist.tsx",
    lineNumber: 109,
    columnNumber: 5
  }, this);
}
async function loader18(args) {
  let user = await redirectIfNotMod(args), urlBase = args.context.DB_API_URL_BASE, artistParam = args.params.artist, artistId = parseInt(artistParam), artistPromise = getArtistById(urlBase, artistId), comicsPromise = getComicsByArtistId(urlBase, artistId, { includeUnlisted: !0 }), [artistRes, comicsRes] = await Promise.all([artistPromise, comicsPromise]);
  if (artistRes.err)
    return processApiError("Error getting artist for admin>artist", artistRes.err);
  if (comicsRes.err)
    return processApiError("Error getting comic for admin>artist", comicsRes.err);
  if (artistRes.notFound || !artistRes.artist)
    throw new Response("Artist not found", {
      status: 404
    });
  return {
    artist: artistRes.artist,
    comics: comicsRes.comics,
    user
  };
}
function getChanges(initialArtist, updatedArtist) {
  let changes = [];
  initialArtist.name !== updatedArtist.artistName && changes.push({
    field: "Name",
    oldValue: initialArtist.name,
    newValue: updatedArtist.artistName,
    newDataValue: updatedArtist.artistName
  }), initialArtist.e621Name !== updatedArtist.e621Name && changes.push({
    field: "E621 name",
    oldValue: initialArtist.e621Name || "None",
    newValue: updatedArtist.e621Name || "None",
    newDataValue: updatedArtist.e621Name
  }), initialArtist.patreonName !== updatedArtist.patreonName && changes.push({
    field: "Patreon name",
    oldValue: initialArtist.patreonName || "None",
    newValue: updatedArtist.patreonName || "None",
    newDataValue: updatedArtist.patreonName
  });
  let realNewLinks = updatedArtist.links.filter((link) => link !== "");
  if (initialArtist.links.length !== realNewLinks.length)
    changes.push({
      field: "Links",
      newDataValue: realNewLinks
    });
  else
    for (let i = 0; i < initialArtist.links.length; i++)
      if (initialArtist.links[i] !== realNewLinks[i]) {
        changes.push({
          field: "Links",
          newDataValue: realNewLinks
        });
        break;
      }
  return changes;
}
function setupInitialUpdatedArtist(artist) {
  let newArtist = {
    id: artist.id,
    artistName: artist.name,
    e621Name: artist.e621Name,
    patreonName: artist.patreonName,
    links: [...artist.links, ""]
  };
  return artist.e621Name || (newArtist.hasConfirmedNoE621Name = !0), artist.patreonName || (newArtist.hasConfirmedNoPatreonName = !0), newArtist;
}

// app/routes/admin/comics.tsx
var comics_exports = {};
__export(comics_exports, {
  default: () => ManageComics
});
var import_react65 = require("@remix-run/react"), import_react66 = require("react");
var import_jsx_dev_runtime67 = require("react/jsx-dev-runtime");
function ManageComics({}) {
  let navigate = (0, import_react65.useNavigate)(), [selectedComic, setSelectedComic] = (0, import_react66.useState)(), globalContext = (0, import_react65.useOutletContext)(), comicOptions = globalContext.comics.map((comic) => ({
    value: comic,
    text: comic.name
  }));
  return (0, import_react66.useEffect)(() => {
    selectedComic && navigate(`/admin/comics/${selectedComic.id}`);
  }, [selectedComic]), /* @__PURE__ */ (0, import_jsx_dev_runtime67.jsxDEV)(import_jsx_dev_runtime67.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime67.jsxDEV)("h1", { children: "Comic manager" }, void 0, !1, {
      fileName: "app/routes/admin/comics.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime67.jsxDEV)(
      SearchableSelect,
      {
        options: comicOptions,
        value: selectedComic,
        onChange: setSelectedComic,
        onValueCleared: () => setSelectedComic(void 0),
        title: "Select comic",
        name: "comic",
        className: "mb-8"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/comics.tsx",
        lineNumber: 29,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime67.jsxDEV)(import_react65.Outlet, { context: globalContext }, void 0, !1, {
      fileName: "app/routes/admin/comics.tsx",
      lineNumber: 39,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics.tsx",
    lineNumber: 26,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/AnonUploadedComicSection.tsx
var AnonUploadedComicSection_exports = {};
__export(AnonUploadedComicSection_exports, {
  default: () => AnonUploadSection
});
var import_react67 = require("react");
var import_date_fns5 = require("date-fns");
var import_jsx_dev_runtime68 = require("react/jsx-dev-runtime");
function AnonUploadSection({
  comicData,
  updateComic
}) {
  let fetcher = useGoodFetcher({
    url: "/api/admin/process-anon-upload",
    method: "post",
    toastSuccessMessage: "Comic processed",
    onFinish: updateComic
  }), [verdict, setVerdict] = (0, import_react67.useState)();
  function processComic() {
    if (!verdict)
      return;
    let body = {
      comicId: comicData.id.toString(),
      comicName: comicData.name,
      verdict
    };
    fetcher.submit(body);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)(import_jsx_dev_runtime68.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("p", { className: "mt-2", children: "This comic is not live. It has been uploaded by a user and is now up for mod review." }, void 0, !1, {
      fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("p", { children: [
      "You should ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("b", { children: "fix errors" }, void 0, !1, {
        fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
        lineNumber: 46,
        columnNumber: 20
      }, this),
      " before approving. If the quality of the uploaded content is not good enough, you should ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("b", { children: "reject it" }, void 0, !1, {
        fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
        lineNumber: 47,
        columnNumber: 48
      }, this),
      "."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
      lineNumber: 45,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("p", { children: [
      "Uploaded by a guest user with IP ",
      comicData.metadata?.uploadUserIP,
      "."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("p", { children: [
      "Uploaded ",
      (0, import_date_fns5.format)(new Date(comicData.metadata?.timestamp || ""), "PPPPp")
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
      lineNumber: 50,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)(
      RadioButtonGroup,
      {
        onChange: (val) => setVerdict(val),
        value: verdict,
        name: "verdict",
        className: "mt-4",
        options: [
          { value: "approved", text: "Approve submission - set comic pending" },
          {
            value: "rejected-list",
            text: "Reject submission due to the nature of the comic - add to ban list (click to read more)"
          },
          {
            value: "rejected",
            text: "Reject submission due to poorly provided info in the submission (click to read more)"
          }
        ]
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
        lineNumber: 52,
        columnNumber: 7
      },
      this
    ),
    (verdict === "rejected" || verdict === "rejected-list") && /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)(
      InfoBox,
      {
        variant: "info",
        title: "Rejecting",
        showIcon: !0,
        className: "mt-4 max-w-4xl",
        boldText: !1,
        disableElevation: !0,
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("p", { className: "mt-2", children: [
            "If the comic should not be on Yiffer.xyz at all - for example if the art quality is too bad, if it's a cub comic, if it's not in English, or if it's got censoring bars (etc.) - use the upper of the two reject options. This will add the comic's name to a ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("u", { children: "ban list" }, void 0, !1, {
              fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
              lineNumber: 83,
              columnNumber: 39
            }, this),
            ", preventing others from uploading it. It is therefore important that you ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("u", { children: "fix the name" }, void 0, !1, {
              fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
              lineNumber: 84,
              columnNumber: 52
            }, this),
            " in case it's misspelled. If choosing this, you should absolutely leave a brief comment explaining why."
          ] }, void 0, !0, {
            fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
            lineNumber: 79,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)("p", { className: "mt-4", children: "If the comic could be on Yiffer.xyz but the quality upload is garbage, use the lower of the two options. Use this one if it's spam/trolling as well." }, void 0, !1, {
            fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
            lineNumber: 88,
            columnNumber: 11
          }, this)
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
        lineNumber: 71,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime68.jsxDEV)(
      LoadingButton,
      {
        text: "Submit",
        className: "mt-4",
        isLoading: fetcher.isLoading,
        disabled: !verdict,
        onClick: processComic
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
        lineNumber: 95,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/AnonUploadedComicSection.tsx",
    lineNumber: 40,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/UserUploadedComicSection.tsx
var UserUploadedComicSection_exports = {};
__export(UserUploadedComicSection_exports, {
  default: () => UserUploadSection
});
var import_react68 = require("react"), import_io55 = require("react-icons/io5");
var import_date_fns6 = require("date-fns");
var import_jsx_dev_runtime69 = require("react/jsx-dev-runtime"), reviewOptions = Object.entries(CONTRIBUTION_POINTS.comicUpload).map(
  ([verdict, value]) => ({
    value: verdict,
    text: value.modPanelDescription
  })
);
function UserUploadSection({
  comicData,
  updateComic
}) {
  let fetcher = useGoodFetcher({
    url: "/api/admin/process-user-upload",
    method: "post",
    toastSuccessMessage: "Comic processed",
    onFinish: updateComic
  }), [verdict, setVerdict] = (0, import_react68.useState)(), [modComment, setModComment] = (0, import_react68.useState)("");
  function submitReview() {
    if (!verdict)
      return;
    let body = {
      comicId: comicData.id.toString(),
      comicName: comicData.name,
      verdict,
      uploaderId: comicData.metadata?.uploadUserId
    };
    modComment && (body.modComment = modComment), fetcher.submit(body);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)(import_jsx_dev_runtime69.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { className: "mt-2", children: "This comic is not live. It has been uploaded by a user and is now up for mod review." }, void 0, !1, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { children: [
      "Uploaded by ",
      comicData.metadata?.uploadUsername,
      "."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 57,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { children: [
      "Uploaded ",
      (0, import_date_fns6.format)(new Date(comicData.metadata?.timestamp || ""), "PPPPp")
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 58,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("h4", { className: "mt-4", children: "Review submission" }, void 0, !1, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 60,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { children: [
      "You should ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("b", { children: "fix errors before you submit the review" }, void 0, !1, {
        fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
        lineNumber: 62,
        columnNumber: 20
      }, this),
      ". Submitting the review will turn the comic into a pending one, unless you reject it."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)(
      RadioButtonGroup,
      {
        options: reviewOptions,
        name: "review",
        value: verdict,
        onChange: setVerdict,
        className: "mt-2"
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
        lineNumber: 66,
        columnNumber: 7
      },
      this
    ),
    (verdict === "rejected" || verdict === "rejected-list") && /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)(
      InfoBox,
      {
        variant: "info",
        title: "Rejecting",
        showIcon: !0,
        className: "mt-4 max-w-4xl",
        boldText: !1,
        disableElevation: !0,
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { className: "mt-2", children: [
            "If the comic should not be on Yiffer.xyz at all - for example if the art quality is too bad, if it's a cub comic, if it's not in English, or if it's got censoring bars (etc.) - use the upper of the two reject options. This will add the comic's name to a ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("u", { children: "ban list" }, void 0, !1, {
              fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
              lineNumber: 87,
              columnNumber: 39
            }, this),
            ", preventing others from uploading it. It is therefore important that you ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("u", { children: "fix the name" }, void 0, !1, {
              fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
              lineNumber: 88,
              columnNumber: 52
            }, this),
            " in case it's misspelled."
          ] }, void 0, !0, {
            fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
            lineNumber: 83,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { className: "mt-4", children: "If the comic could be on Yiffer.xyz but the quality upload is garbage, use the lower of the two options. Use this one if it's spam/trolling as well." }, void 0, !1, {
            fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
            lineNumber: 91,
            columnNumber: 11
          }, this)
        ]
      },
      void 0,
      !0,
      {
        fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
        lineNumber: 75,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { className: "mt-4", children: [
      "You can add a comment for the user to see. Keep it ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("u", { children: "short" }, void 0, !1, {
        fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
        lineNumber: 99,
        columnNumber: 60
      }, this),
      " and constructive! The goal is to help the user do better next time."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 98,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("p", { children: [
      "You ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)("i", { children: "can" }, void 0, !1, {
        fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
        lineNumber: 103,
        columnNumber: 13
      }, this),
      " leave it blank even if there are issues, but helping the user helps us in the long run. Do not comment on obvious trolling."
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 102,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)(
      TextInput,
      {
        name: "modComment",
        label: "Comment - optional",
        className: "mt-4",
        value: modComment,
        onChange: setModComment
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
        lineNumber: 107,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)(fetcher.Form, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime69.jsxDEV)(
      LoadingButton,
      {
        text: "Save review and process comic",
        isLoading: fetcher.isLoading,
        onClick: submitReview,
        startIcon: import_io55.IoCheckmark,
        className: "mt-6",
        disabled: !verdict
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
        lineNumber: 116,
        columnNumber: 9
      },
      this
    ) }, void 0, !1, {
      fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
      lineNumber: 115,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/UserUploadedComicSection.tsx",
    lineNumber: 52,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/UnlistedComicSection.tsx
var UnlistedComicSection_exports = {};
__export(UnlistedComicSection_exports, {
  default: () => UnlistedComicSection
});
var import_jsx_dev_runtime70 = require("react/jsx-dev-runtime");
function UnlistedComicSection({
  comicData,
  user,
  updateComic
}) {
  let fetcher = useGoodFetcher({
    url: "/api/admin/relist-comic",
    method: "post",
    toastSuccessMessage: "Comic re-listed",
    onFinish: updateComic
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime70.jsxDEV)(import_jsx_dev_runtime70.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime70.jsxDEV)("p", { className: "mb-2", children: "This comic is not live. It has been removed from the available comics on Yiffer.xyz for one reason or another. It can be re-listed by an admin." }, void 0, !1, {
      fileName: "app/routes/admin/comics/UnlistedComicSection.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime70.jsxDEV)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime70.jsxDEV)("b", { children: "Reason for unlisting" }, void 0, !1, {
        fileName: "app/routes/admin/comics/UnlistedComicSection.tsx",
        lineNumber: 31,
        columnNumber: 9
      }, this),
      ": ",
      comicData.metadata?.unlistComment
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/UnlistedComicSection.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    user.userType === "admin" && /* @__PURE__ */ (0, import_jsx_dev_runtime70.jsxDEV)(fetcher.Form, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime70.jsxDEV)(
        LoadingButton,
        {
          text: "Re-list comic",
          isLoading: fetcher.isLoading,
          isSubmit: !0,
          className: "mt-2"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/comics/UnlistedComicSection.tsx",
          lineNumber: 36,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime70.jsxDEV)("input", { type: "hidden", name: "comicId", value: comicData.id.toString() }, void 0, !1, {
        fileName: "app/routes/admin/comics/UnlistedComicSection.tsx",
        lineNumber: 43,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/UnlistedComicSection.tsx",
      lineNumber: 35,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/UnlistedComicSection.tsx",
    lineNumber: 24,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/scheduling/Scheduled.tsx
var Scheduled_exports = {};
__export(Scheduled_exports, {
  ScheduledComic: () => ScheduledComic
});
var import_io56 = require("react-icons/io5");
var import_date_fns7 = require("date-fns");
var import_jsx_dev_runtime71 = require("react/jsx-dev-runtime");
function ScheduledComic({
  comicData,
  onReschedule,
  onUnscheduleFinished
}) {
  let fetcher = useGoodFetcher({
    url: "/api/admin/unschedule-comic",
    method: "post",
    toastSuccessMessage: "Comic unscheduled",
    onFinish: onUnscheduleFinished
  }), hasDate = comicData.metadata?.publishDate;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)(import_jsx_dev_runtime71.Fragment, { children: [
    hasDate ? /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)("p", { className: "mb-2 -mt-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)("b", { children: [
      "Scheduled for ",
      (0, import_date_fns7.format)(new Date(comicData.metadata?.publishDate || ""), "PPP")
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
      lineNumber: 33,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
      lineNumber: 32,
      columnNumber: 7
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)("p", { className: "mb-2 -mt-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)("b", { children: "Comic is in the publishing queue." }, void 0, !1, {
      fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
      lineNumber: 39,
      columnNumber: 11
    }, this) }, void 0, !1, {
      fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
      lineNumber: 38,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)(fetcher.Form, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)("div", { className: "flex flex-row gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)("input", { type: "hidden", name: "comicId", value: comicData.id }, void 0, !1, {
        fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
        lineNumber: 45,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)("div", { className: "flex flex-row gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)(
          LoadingButton,
          {
            text: hasDate ? "Unschedule (set pending)" : "Remove from queue (set pending)",
            startIcon: import_io56.IoClose,
            isLoading: fetcher.isLoading,
            color: "error",
            isSubmit: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
            lineNumber: 47,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime71.jsxDEV)(
          Button,
          {
            text: hasDate ? "Re-schedule" : "Schedule for specific date",
            onClick: onReschedule,
            variant: "outlined"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
            lineNumber: 56,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
        lineNumber: 46,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
      lineNumber: 44,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
      lineNumber: 43,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/scheduling/Scheduled.tsx",
    lineNumber: 30,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/PendingComicSection.tsx
var PendingComicSection_exports = {};
__export(PendingComicSection_exports, {
  default: () => PendingComicSection
});
var import_react70 = require("react");
var import_react71 = require("@remix-run/react");

// app/routes/admin/comics/pending/Error.tsx
var Error_exports = {};
__export(Error_exports, {
  HasError: () => HasError,
  SetError: () => SetError
});
var import_io57 = require("react-icons/io5"), import_md23 = require("react-icons/md");
var import_jsx_dev_runtime72 = require("react/jsx-dev-runtime");
function SetError({ comicData, onCancel, onFinish }) {
  let fetcher = useGoodFetcher({
    url: "/api/admin/set-comic-error",
    method: "post",
    onFinish,
    toastSuccessMessage: "Error set"
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(import_jsx_dev_runtime72.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("h4", { children: "Set error" }, void 0, !1, {
      fileName: "app/routes/admin/comics/pending/Error.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(fetcher.Form, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("input", { type: "hidden", name: "comicId", value: comicData.id }, void 0, !1, {
        fileName: "app/routes/admin/comics/pending/Error.tsx",
        lineNumber: 27,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(
        TextInputUncontrolled,
        {
          label: "Short error text",
          placeholder: 'Eg. "low page res", "bad thumbnail"',
          name: "errorText",
          className: "max-w-sm"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/comics/pending/Error.tsx",
          lineNumber: 29,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("div", { className: "flex flex-row gap-4 mt-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(
          Button,
          {
            text: "Cancel",
            variant: "outlined",
            onClick: onCancel,
            startIcon: import_io57.IoClose
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/pending/Error.tsx",
            lineNumber: 36,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(
          LoadingButton,
          {
            text: "Save",
            startIcon: import_io57.IoCheckmark,
            isLoading: fetcher.isLoading,
            isSubmit: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/pending/Error.tsx",
            lineNumber: 42,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/pending/Error.tsx",
        lineNumber: 35,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/pending/Error.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/pending/Error.tsx",
    lineNumber: 24,
    columnNumber: 5
  }, this);
}
function HasError({ comicData, onFinish }) {
  let fetcher = useGoodFetcher({
    url: "/api/admin/set-comic-error",
    method: "post",
    onFinish,
    toastSuccessMessage: "Error removed"
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(import_jsx_dev_runtime72.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("div", { className: "mt-2 mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("p", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("b", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(import_md23.MdError, {}, void 0, !1, {
          fileName: "app/routes/admin/comics/pending/Error.tsx",
          lineNumber: 72,
          columnNumber: 13
        }, this),
        " Error: ",
        comicData.metadata?.errorText
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/pending/Error.tsx",
        lineNumber: 71,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/routes/admin/comics/pending/Error.tsx",
        lineNumber: 70,
        columnNumber: 9
      }, this),
      comicData.metadata?.pendingProblemModId && /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(import_md23.MdCheck, {}, void 0, !1, {
          fileName: "app/routes/admin/comics/pending/Error.tsx",
          lineNumber: 77,
          columnNumber: 13
        }, this),
        " A mod has been assigned to fix this problem"
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/pending/Error.tsx",
        lineNumber: 76,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/pending/Error.tsx",
      lineNumber: 69,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(fetcher.Form, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("input", { type: "hidden", name: "comicId", value: comicData.id }, void 0, !1, {
        fileName: "app/routes/admin/comics/pending/Error.tsx",
        lineNumber: 83,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)("input", { type: "hidden", name: "errorText", value: "" }, void 0, !1, {
        fileName: "app/routes/admin/comics/pending/Error.tsx",
        lineNumber: 84,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime72.jsxDEV)(
        LoadingButton,
        {
          text: "Remove error status",
          isLoading: fetcher.isLoading,
          isSubmit: !0
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/comics/pending/Error.tsx",
          lineNumber: 85,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/pending/Error.tsx",
      lineNumber: 82,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/pending/Error.tsx",
    lineNumber: 68,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/pending/Reject.tsx
var Reject_exports = {};
__export(Reject_exports, {
  Reject: () => Reject
});
var import_io58 = require("react-icons/io5");
var import_jsx_dev_runtime73 = require("react/jsx-dev-runtime");
function Reject({ comicData, onCancel, onFinish }) {
  let fetcher = useGoodFetcher({
    url: "/api/admin/reject-pending-comic",
    method: "post",
    onFinish,
    toastSuccessMessage: "Comic rejected"
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime73.jsxDEV)(import_jsx_dev_runtime73.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime73.jsxDEV)("h4", { className: "mb-2", children: "Reject comic" }, void 0, !1, {
      fileName: "app/routes/admin/comics/pending/Reject.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime73.jsxDEV)(fetcher.Form, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime73.jsxDEV)("input", { type: "hidden", name: "comicId", value: comicData.id }, void 0, !1, {
        fileName: "app/routes/admin/comics/pending/Reject.tsx",
        lineNumber: 25,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime73.jsxDEV)("div", { className: "flex flex-row gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime73.jsxDEV)(
          Button,
          {
            text: "Cancel",
            variant: "outlined",
            onClick: onCancel,
            startIcon: import_io58.IoClose
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/pending/Reject.tsx",
            lineNumber: 28,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime73.jsxDEV)(
          LoadingButton,
          {
            text: "Reject comic",
            startIcon: import_io58.IoCheckmark,
            color: "error",
            isLoading: fetcher.isLoading,
            isSubmit: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/pending/Reject.tsx",
            lineNumber: 34,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/pending/Reject.tsx",
        lineNumber: 27,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/pending/Reject.tsx",
      lineNumber: 24,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/pending/Reject.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/scheduling/Schedule.tsx
var Schedule_exports = {};
__export(Schedule_exports, {
  Schedule: () => Schedule
});
var import_react69 = require("react"), import_io59 = require("react-icons/io5");
var import_react_calendar = __toESM(require("react-calendar"));
var import_date_fns8 = require("date-fns");
var import_jsx_dev_runtime74 = require("react/jsx-dev-runtime");
function Schedule({ comicData, onCancel, onFinish }) {
  let [publishDate, setPublishDate] = (0, import_react69.useState)(
    comicData.metadata?.publishDate ? new Date(comicData.metadata.publishDate) : /* @__PURE__ */ new Date()
  ), fetcher = useGoodFetcher({
    url: "/api/admin/schedule-comic",
    method: "post",
    onFinish,
    toastSuccessMessage: "Comic scheduled"
  }), dateString = publishDate ? (0, import_date_fns8.format)(publishDate, "yyyy-MM-dd") : "";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)(import_jsx_dev_runtime74.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)("h4", { className: "mb-2", children: "Schedule comic" }, void 0, !1, {
      fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)(fetcher.Form, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)("input", { type: "hidden", name: "comicId", value: comicData.id }, void 0, !1, {
        fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
        lineNumber: 37,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)("input", { type: "hidden", name: "publishDate", value: dateString }, void 0, !1, {
        fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
        lineNumber: 38,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)(import_react_calendar.default, { value: publishDate, onChange: setPublishDate, className: "pb-2 w-fit" }, void 0, !1, {
        fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
        lineNumber: 40,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)("p", { className: "mb-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)("b", { children: publishDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }) }, void 0, !1, {
        fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
        lineNumber: 43,
        columnNumber: 11
      }, this) }, void 0, !1, {
        fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
        lineNumber: 42,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)("div", { className: "flex flex-row gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)(
          Button,
          {
            text: "Cancel",
            variant: "outlined",
            onClick: onCancel,
            startIcon: import_io59.IoClose
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
            lineNumber: 54,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime74.jsxDEV)(
          LoadingButton,
          {
            text: "Schedule comic",
            startIcon: import_io59.IoCheckmark,
            isLoading: fetcher.isLoading,
            isSubmit: !0,
            disabled: !dateString
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
            lineNumber: 60,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
        lineNumber: 53,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/scheduling/Schedule.tsx",
    lineNumber: 34,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/PendingComicSection.tsx
var import_jsx_dev_runtime75 = require("react/jsx-dev-runtime");
function PendingComicSection({
  comicData,
  updateComic
}) {
  let navigate = (0, import_react71.useNavigate)(), metadata = comicData.metadata, [actionState, setActionState] = (0, import_react70.useState)("none"), publishNowFetcher = useGoodFetcher({
    url: "/api/admin/publish-comic",
    method: "post",
    toastSuccessMessage: "Comic published",
    onFinish: updateComic
  }), addToQueueFetcher = useGoodFetcher({
    url: "/api/admin/schedule-comic-to-queue",
    method: "post",
    toastSuccessMessage: "Added to publishing queue",
    onFinish: updateComic
  }), comicState = (0, import_react70.useMemo)(() => comicData.publishStatus === "rejected" ? "rejected" : comicData.publishStatus === "scheduled" ? "scheduled" : metadata.errorText ? "has-error" : "initial", [comicData]);
  return actionState === "set-error" ? /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
    SetError,
    {
      comicData,
      onCancel: () => setActionState("none"),
      onFinish: () => {
        setActionState("none"), updateComic();
      }
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin/comics/PendingComicSection.tsx",
      lineNumber: 48,
      columnNumber: 7
    },
    this
  ) : comicState === "has-error" ? /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(HasError, { comicData, onFinish: updateComic }, void 0, !1, {
    fileName: "app/routes/admin/comics/PendingComicSection.tsx",
    lineNumber: 60,
    columnNumber: 12
  }, this) : actionState === "rejecting" ? /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
    Reject,
    {
      comicData,
      onCancel: () => setActionState("none"),
      onFinish: () => {
        setActionState("none"), updateComic(), navigate("/admin/comics");
      }
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin/comics/PendingComicSection.tsx",
      lineNumber: 65,
      columnNumber: 7
    },
    this
  ) : actionState === "scheduling" ? /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
    Schedule,
    {
      comicData,
      onCancel: () => setActionState("none"),
      onFinish: () => {
        setActionState("none"), updateComic();
      }
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin/comics/PendingComicSection.tsx",
      lineNumber: 79,
      columnNumber: 7
    },
    this
  ) : comicData.publishStatus === "scheduled" ? /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
    ScheduledComic,
    {
      comicData,
      onReschedule: () => setActionState("scheduling"),
      onUnscheduleFinished: updateComic
    },
    void 0,
    !1,
    {
      fileName: "app/routes/admin/comics/PendingComicSection.tsx",
      lineNumber: 92,
      columnNumber: 7
    },
    this
  ) : /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)("div", { className: "mb-4 -mt-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)("p", { children: "Normally, add the comic to the publishing queue. Only in specific cases (for example per an artist's request) should a comic be scheduled for a specific date." }, void 0, !1, {
        fileName: "app/routes/admin/comics/PendingComicSection.tsx",
        lineNumber: 103,
        columnNumber: 9
      }, this),
      comicData.artist.isPending && /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)("p", { className: "mt-2", children: [
        "This comic's ",
        /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)("b", { children: "artist is pending" }, void 0, !1, {
          fileName: "app/routes/admin/comics/PendingComicSection.tsx",
          lineNumber: 111,
          columnNumber: 26
        }, this),
        ". Once this or any other pending comic by the artist is published, the artist will automatically do the same."
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/PendingComicSection.tsx",
        lineNumber: 110,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/PendingComicSection.tsx",
      lineNumber: 102,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)("div", { className: "flex flex-row gap-4 flex-wrap", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
          LoadingButton,
          {
            text: "Add to publishing queue",
            onClick: () => addToQueueFetcher.submit({ comicId: comicData.id.toString() }),
            isLoading: addToQueueFetcher.isLoading,
            className: "min-w-40"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/PendingComicSection.tsx",
            lineNumber: 119,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
          Button,
          {
            text: "Schedule for specific date",
            onClick: () => setActionState("scheduling"),
            className: "min-w-40"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/PendingComicSection.tsx",
            lineNumber: 125,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
          LoadingButton,
          {
            text: "Publish now",
            onClick: () => publishNowFetcher.submit({ comicId: comicData.id.toString() }),
            isLoading: publishNowFetcher.isLoading,
            className: "min-w-40"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/PendingComicSection.tsx",
            lineNumber: 130,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/PendingComicSection.tsx",
        lineNumber: 118,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
        Button,
        {
          text: "Set error",
          color: "error",
          onClick: () => setActionState("set-error"),
          className: "min-w-40"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/comics/PendingComicSection.tsx",
          lineNumber: 137,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime75.jsxDEV)(
        Button,
        {
          text: "Reject comic",
          color: "error",
          onClick: () => setActionState("rejecting"),
          className: "min-w-40"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/comics/PendingComicSection.tsx",
          lineNumber: 143,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/PendingComicSection.tsx",
      lineNumber: 117,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/PendingComicSection.tsx",
    lineNumber: 101,
    columnNumber: 5
  }, this);
}

// app/routes/admin/comics/LiveComic.tsx
var LiveComic_exports = {};
__export(LiveComic_exports, {
  default: () => LiveComic
});
var import_react72 = require("react"), import_md24 = require("react-icons/md");
var import_jsx_dev_runtime76 = require("react/jsx-dev-runtime");
function LiveComic({
  comic,
  user,
  allComics,
  allArtists,
  allTags,
  PAGES_PATH
}) {
  let unlistFetcher = useGoodFetcher({
    url: "/api/admin/unlist-comic",
    method: "post",
    toastSuccessMessage: "Comic unlisted",
    onFinish: cancelUnlisting
  }), saveChangesFetcher = useGoodFetcher({
    url: "/api/admin/update-comic-data",
    method: "post",
    toastSuccessMessage: "Changes saved",
    onFinish: () => setNeedsUpdate(!0)
  }), { isMobile } = useWindowSize(), [isUnlisting, setIsUnlisting] = (0, import_react72.useState)(!1), [unlistComment, setUnlistComment] = (0, import_react72.useState)(""), [updatedComicData, setUpdatedComicData] = (0, import_react72.useState)(), [comicDataChanges, setComicDataChanges] = (0, import_react72.useState)([]), [needsUpdate, setNeedsUpdate] = (0, import_react72.useState)(!1);
  (0, import_react72.useEffect)(() => {
    setComicDataChanges(
      getComicDataChanges(updatedComicData, comic, allArtists, allComics)
    );
  }, [updatedComicData]), (0, import_react72.useEffect)(() => {
    (!updatedComicData?.comicName || needsUpdate || comic.id !== updatedComicData.comicId) && (setInitialComicData(), setNeedsUpdate(!1));
  }, [comic]);
  function setInitialComicData() {
    let newUpdatedComicData = setupInitialUpdatedComic(comic);
    setUpdatedComicData(newUpdatedComicData);
  }
  function saveComicDataChanges() {
    if (!comicDataChanges)
      return;
    let body = {
      comicId: comic.id
    };
    for (let change of comicDataChanges)
      change.field === "Name" ? body.name = change.newDataValue : change.field === "Artist" ? body.artistId = change.newDataValue : change.field === "New tags" || change.field === "Removed tags" ? body.tagIds = change.newDataValue : change.field === "Category" ? body.category = change.newDataValue : change.field === "Classification" ? body.classification = change.newDataValue : change.field === "State" ? body.state = change.newDataValue : change.field === "Previous comic" ? body.previousComicId = change.newDataValue : change.field === "Next comic" && (body.nextComicId = change.newDataValue);
    saveChangesFetcher.submit({ body: JSON.stringify(body) });
  }
  function unlistComic2() {
    unlistFetcher.submit({ comicId: comic.id.toString(), unlistComment });
  }
  function cancelUnlisting() {
    setIsUnlisting(!1), setUnlistComment("");
  }
  let canSave = !(comicDataChanges.some((change) => change.field === "Name") && !updatedComicData?.validation.isLegalComicName) && updatedComicData?.artistId && updatedComicData.comicName, comicPages = [];
  for (let i = 0; i < comic.numberOfPages; i++)
    comicPages.push({
      url: `${PAGES_PATH}/${comic.name}/00${i + 1}.jpg`
    });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_jsx_dev_runtime76.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { className: "mt-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("h4", { className: "mb-1", children: "Comic data" }, void 0, !1, {
        fileName: "app/routes/admin/comics/LiveComic.tsx",
        lineNumber: 129,
        columnNumber: 9
      }, this),
      updatedComicData && /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_jsx_dev_runtime76.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
          ComicDataEditor,
          {
            comicData: updatedComicData,
            artists: allArtists,
            comics: allComics,
            onUpdate: setUpdatedComicData,
            existingComic: comic,
            isAdminPanel: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/LiveComic.tsx",
            lineNumber: 132,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
          TagsEditor,
          {
            allTags,
            comicData: updatedComicData,
            onUpdate: setUpdatedComicData,
            className: "mt-8 max-w-5xl"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/LiveComic.tsx",
            lineNumber: 141,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/LiveComic.tsx",
        lineNumber: 131,
        columnNumber: 11
      }, this),
      comicDataChanges.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_jsx_dev_runtime76.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
          "div",
          {
            className: `py-2 px-4 bg-theme1-primaryTrans flex flex-col gap-1 mt-6 ${isMobile ? "" : "w-fit"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("h4", { children: "Changes" }, void 0, !1, {
                fileName: "app/routes/admin/comics/LiveComic.tsx",
                lineNumber: 157,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
                "div",
                {
                  className: `grid ${isMobile ? "gap-y-2" : "gap-x-4"}`,
                  style: { gridTemplateColumns: isMobile ? "auto" : "auto auto" },
                  children: comicDataChanges.map((change) => {
                    let hasDetails = !!change.newValue;
                    return isMobile ? /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("p", { className: hasDetails ? "" : "col-span-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("b", { children: [
                        change.field,
                        ":"
                      ] }, void 0, !0, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 168,
                        columnNumber: 25
                      }, this) }, void 0, !1, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 167,
                        columnNumber: 23
                      }, this),
                      hasDetails && /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("p", { children: change.oldValue ? /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_jsx_dev_runtime76.Fragment, { children: [
                        change.oldValue,
                        " ",
                        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_md24.MdArrowForward, {}, void 0, !1, {
                          fileName: "app/routes/admin/comics/LiveComic.tsx",
                          lineNumber: 174,
                          columnNumber: 49
                        }, this),
                        " ",
                        change.newValue
                      ] }, void 0, !0, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 173,
                        columnNumber: 29
                      }, this) : change.newValue }, void 0, !1, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 171,
                        columnNumber: 25
                      }, this)
                    ] }, change.field, !0, {
                      fileName: "app/routes/admin/comics/LiveComic.tsx",
                      lineNumber: 166,
                      columnNumber: 21
                    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_react72.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("p", { className: hasDetails ? "" : "col-span-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("b", { children: change.field }, void 0, !1, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 185,
                        columnNumber: 25
                      }, this) }, void 0, !1, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 184,
                        columnNumber: 23
                      }, this),
                      hasDetails && /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("p", { children: change.oldValue ? /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_jsx_dev_runtime76.Fragment, { children: [
                        change.oldValue,
                        " ",
                        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(import_md24.MdArrowForward, {}, void 0, !1, {
                          fileName: "app/routes/admin/comics/LiveComic.tsx",
                          lineNumber: 191,
                          columnNumber: 49
                        }, this),
                        " ",
                        change.newValue
                      ] }, void 0, !0, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 190,
                        columnNumber: 29
                      }, this) : change.newValue }, void 0, !1, {
                        fileName: "app/routes/admin/comics/LiveComic.tsx",
                        lineNumber: 188,
                        columnNumber: 25
                      }, this)
                    ] }, change.field, !0, {
                      fileName: "app/routes/admin/comics/LiveComic.tsx",
                      lineNumber: 183,
                      columnNumber: 21
                    }, this);
                  })
                },
                void 0,
                !1,
                {
                  fileName: "app/routes/admin/comics/LiveComic.tsx",
                  lineNumber: 158,
                  columnNumber: 15
                },
                this
              )
            ]
          },
          void 0,
          !0,
          {
            fileName: "app/routes/admin/comics/LiveComic.tsx",
            lineNumber: 152,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { className: "flex flex-row gap-2 mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
            Button,
            {
              variant: "outlined",
              text: "Revert changes",
              onClick: setInitialComicData,
              startIcon: import_md24.MdReplay
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/comics/LiveComic.tsx",
              lineNumber: 205,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
            LoadingButton,
            {
              text: "Save changes",
              isLoading: saveChangesFetcher.isLoading,
              onClick: saveComicDataChanges,
              startIcon: import_md24.MdCheck,
              disabled: !canSave
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/comics/LiveComic.tsx",
              lineNumber: 211,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/admin/comics/LiveComic.tsx",
          lineNumber: 204,
          columnNumber: 13
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/LiveComic.tsx",
        lineNumber: 151,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/LiveComic.tsx",
      lineNumber: 128,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { className: "mt-8", children: /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("h3", { children: "Thumbnail" }, void 0, !1, {
      fileName: "app/routes/admin/comics/LiveComic.tsx",
      lineNumber: 224,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "app/routes/admin/comics/LiveComic.tsx",
      lineNumber: 223,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { className: "mt-8", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("h3", { children: "Pages" }, void 0, !1, {
        fileName: "app/routes/admin/comics/LiveComic.tsx",
        lineNumber: 228,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
        PageManager,
        {
          files: comicPages,
          onChange: (newFiles) => {
            console.log(newFiles);
          }
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/comics/LiveComic.tsx",
          lineNumber: 230,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/LiveComic.tsx",
      lineNumber: 227,
      columnNumber: 7
    }, this),
    user.userType === "admin" && comic.publishStatus !== "unlisted" && /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { className: "mt-8", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("h3", { children: "Admin tools" }, void 0, !1, {
        fileName: "app/routes/admin/comics/LiveComic.tsx",
        lineNumber: 240,
        columnNumber: 11
      }, this),
      !isUnlisting && /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
        Button,
        {
          text: "Unlist comic",
          className: "mt-2",
          onClick: () => setIsUnlisting(!0),
          color: "error"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/admin/comics/LiveComic.tsx",
          lineNumber: 243,
          columnNumber: 13
        },
        this
      ),
      isUnlisting && /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { className: "mt-2", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("h4", { children: "Unlist comic" }, void 0, !1, {
          fileName: "app/routes/admin/comics/LiveComic.tsx",
          lineNumber: 253,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
          TextInput,
          {
            label: "Reason for unlisting",
            value: unlistComment,
            onChange: setUnlistComment,
            className: "mb-2 max-w-lg",
            name: "unlistComment"
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/LiveComic.tsx",
            lineNumber: 254,
            columnNumber: 15
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)("div", { className: "flex flex-row gap-2 mt-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(Button, { text: "Cancel", onClick: cancelUnlisting, variant: "outlined" }, void 0, !1, {
            fileName: "app/routes/admin/comics/LiveComic.tsx",
            lineNumber: 262,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime76.jsxDEV)(
            LoadingButton,
            {
              text: "Confirm unlisting",
              isLoading: unlistFetcher.isLoading,
              onClick: unlistComic2,
              color: "error"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/admin/comics/LiveComic.tsx",
              lineNumber: 263,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/admin/comics/LiveComic.tsx",
          lineNumber: 261,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/LiveComic.tsx",
        lineNumber: 252,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/LiveComic.tsx",
      lineNumber: 239,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/LiveComic.tsx",
    lineNumber: 127,
    columnNumber: 5
  }, this);
}
var emptyUnusedNewArtist = {
  artistName: "",
  e621Name: "",
  patreonName: "",
  links: []
};
function setupInitialUpdatedComic(comic) {
  return {
    comicId: comic.id,
    comicName: comic.name,
    artistId: comic.artist.id,
    category: comic.category,
    classification: comic.classification,
    state: comic.state,
    validation: {
      isLegalComicName: !0
    },
    tags: comic.tags,
    previousComic: comicLinkToTinyComic(comic.previousComic),
    nextComic: comicLinkToTinyComic(comic.nextComic),
    files: [],
    newArtist: emptyUnusedNewArtist
  };
}
function comicLinkToTinyComic(comic) {
  if (comic && comic)
    return {
      id: comic.id,
      name: comic.name,
      publishStatus: "published"
    };
}
function getComicDataChanges(updatedComicData, comic, allArtists, allComics) {
  if (!updatedComicData)
    return [];
  let changes = [];
  comic.name !== updatedComicData.comicName && changes.push({
    field: "Name",
    oldValue: comic.name,
    newValue: updatedComicData.comicName,
    newDataValue: updatedComicData.comicName
  }), comic.artist.id !== updatedComicData.artistId && changes.push({
    field: "Artist",
    oldValue: comic.artist.name,
    newValue: allArtists.find((a) => a.id === updatedComicData.artistId)?.name,
    newDataValue: updatedComicData.artistId
  }), comic.category !== updatedComicData.category && changes.push({
    field: "Category",
    oldValue: comic.category,
    newValue: updatedComicData.category,
    newDataValue: updatedComicData.category
  }), comic.classification !== updatedComicData.classification && changes.push({
    field: "Classification",
    oldValue: comic.classification,
    newValue: updatedComicData.classification,
    newDataValue: updatedComicData.classification
  }), comic.state !== updatedComicData.state && changes.push({
    field: "State",
    oldValue: comic.state,
    newValue: updatedComicData.state,
    newDataValue: updatedComicData.state
  }), comic.previousComic?.id !== updatedComicData.previousComic?.id && changes.push({
    field: "Previous comic",
    oldValue: comic.previousComic?.name || "None",
    newValue: allComics.find((c) => c.id === updatedComicData.previousComic?.id)?.name || "None",
    newDataValue: updatedComicData.previousComic?.id
  }), comic.nextComic?.id !== updatedComicData.nextComic?.id && changes.push({
    field: "Next comic",
    oldValue: comic.nextComic?.name || "None",
    newValue: allComics.find((c) => c.id === updatedComicData.nextComic?.id)?.name || "None",
    newDataValue: updatedComicData.nextComic?.id
  });
  let newTags = [], removedTags = [];
  for (let tag of comic.tags)
    updatedComicData.tags.find((t) => t.id === tag.id) || removedTags.push(tag);
  for (let tag of updatedComicData.tags)
    comic.tags.find((t) => t.id === tag.id) || newTags.push(tag);
  return newTags.length > 0 && changes.push({
    field: "New tags",
    oldValue: void 0,
    newValue: `${newTags.length}: ${newTags.map((t) => t.name).join(", ")}`,
    newDataValue: updatedComicData.tags.map((t) => t.id)
  }), removedTags.length > 0 && changes.push({
    field: "Removed tags",
    oldValue: void 0,
    newValue: `${removedTags.length}: ${removedTags.map((t) => t.name).join(", ")}`,
    newDataValue: updatedComicData.tags.map((t) => t.id)
  }), changes;
}

// app/routes/admin/comics/$comic.tsx
var comic_exports = {};
__export(comic_exports, {
  default: () => ManageComicInner,
  loader: () => loader19
});
var import_react73 = require("@remix-run/react"), import_date_fns9 = require("date-fns"), import_md25 = require("react-icons/md");
var import_jsx_dev_runtime77 = require("react/jsx-dev-runtime");
function ManageComicInner() {
  let revalidator = (0, import_react73.useRevalidator)(), globalContext = (0, import_react73.useOutletContext)(), { comic: maybeComic, user, PAGES_PATH } = (0, import_react73.useLoaderData)();
  if (!maybeComic)
    return /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("div", { children: "Comic not found" }, void 0, !1, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 22,
      columnNumber: 12
    }, this);
  let comic = maybeComic, isAnonUpload = comic.publishStatus === "uploaded" && !comic.metadata?.uploadUserId, isUserUpload = comic.publishStatus === "uploaded" && comic.metadata?.uploadUserId, isPendingOrScheduled = comic.publishStatus === "pending" || comic.publishStatus === "scheduled", isRejected = comic.publishStatus === "rejected" || comic.publishStatus === "rejected-list";
  function updateComic() {
    revalidator.revalidate();
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(import_jsx_dev_runtime77.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("h2", { className: "mb-2", children: comic.name }, void 0, !1, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 40,
      columnNumber: 7
    }, this),
    isRejected && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("div", { className: "bg-theme1-primaryTrans p-4 pt-3 w-fit", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("h3", { children: "Rejected comic" }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 44,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { className: "mb-2", children: "This comic has been rejected." }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 45,
        columnNumber: 11
      }, this),
      comic.publishStatus === "rejected" && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { children: "It has not been added to the ban list." }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 47,
        columnNumber: 13
      }, this),
      comic.publishStatus === "rejected-list" && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(import_jsx_dev_runtime77.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { children: "It has been added to the ban list, so users will be warned when trying to suggest or upload comics with this name." }, void 0, !1, {
          fileName: "app/routes/admin/comics/$comic.tsx",
          lineNumber: 51,
          columnNumber: 15
        }, this),
        comic.metadata?.modComment && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { children: [
          "Mod comment: ",
          comic.metadata.modComment
        ] }, void 0, !0, {
          fileName: "app/routes/admin/comics/$comic.tsx",
          lineNumber: 56,
          columnNumber: 17
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 50,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 43,
      columnNumber: 9
    }, this),
    isAnonUpload && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("div", { className: "bg-theme1-primaryTrans p-4 pt-3 w-fit", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("h3", { children: "User-uploaded comic, anonymous" }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 65,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(AnonUploadSection, { comicData: comic, updateComic }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 66,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 64,
      columnNumber: 9
    }, this),
    isUserUpload && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("div", { className: "bg-theme1-primaryTrans p-4 pt-3 w-fit", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("h3", { children: "User-uploaded comic" }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 72,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(UserUploadSection, { comicData: comic, updateComic }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 73,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this),
    isPendingOrScheduled && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("div", { className: "bg-theme1-primaryTrans p-4 pt-3 w-fit", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("h3", { children: "Pending comic" }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 79,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { className: "mb-4", children: "This comic is not live. It has been uploaded by a mod, or by a user and then passed mod review. Once all data is correct, an admin can schedule or publish the comic." }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 80,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(PendingComicSection, { comicData: comic, updateComic }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 86,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 78,
      columnNumber: 9
    }, this),
    comic.publishStatus === "unlisted" && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("div", { className: "bg-theme1-primaryTrans p-4 pt-3 w-fit", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("h3", { children: "Unlisted comic" }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 92,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(UnlistedComicSection, { comicData: comic, updateComic, user }, void 0, !1, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 93,
        columnNumber: 11
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 91,
      columnNumber: 9
    }, this),
    comic.publishStatus === "published" && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(import_jsx_dev_runtime77.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { className: "text-lg text-theme1-darker", children: [
        "This comic is live!",
        /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(
          Link,
          {
            href: `/${comic.name}`,
            className: "ml-2",
            text: "View live comic",
            IconRight: import_md25.MdOpenInNew,
            newTab: !0
          },
          void 0,
          !1,
          {
            fileName: "app/routes/admin/comics/$comic.tsx",
            lineNumber: 101,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 99,
        columnNumber: 11
      }, this),
      comic.published && comic.updated && /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(import_jsx_dev_runtime77.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { children: [
          "Published: ",
          (0, import_date_fns9.format)(new Date(comic.published), "PPP")
        ] }, void 0, !0, {
          fileName: "app/routes/admin/comics/$comic.tsx",
          lineNumber: 111,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)("p", { children: [
          "Last updated: ",
          (0, import_date_fns9.format)(new Date(comic.updated), "PPP")
        ] }, void 0, !0, {
          fileName: "app/routes/admin/comics/$comic.tsx",
          lineNumber: 112,
          columnNumber: 15
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 110,
        columnNumber: 13
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/comics/$comic.tsx",
      lineNumber: 98,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime77.jsxDEV)(
      LiveComic,
      {
        comic,
        user,
        allComics: globalContext.comics,
        allArtists: globalContext.artists,
        allTags: globalContext.tags,
        PAGES_PATH
      },
      void 0,
      !1,
      {
        fileName: "app/routes/admin/comics/$comic.tsx",
        lineNumber: 118,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, !0, {
    fileName: "app/routes/admin/comics/$comic.tsx",
    lineNumber: 39,
    columnNumber: 5
  }, this);
}
async function loader19(args) {
  let user = await redirectIfNotMod(args), urlBase = args.context.DB_API_URL_BASE, comicParam = args.params.comic, comicId = parseInt(comicParam), { comic, err } = await getComicById(urlBase, comicId);
  return err ? processApiError("Error getting comic in admin>comic", err) : { comic, user, PAGES_PATH: args.context.PAGES_PATH };
}

// app/routes/admin/stats.tsx
var stats_exports = {};
__export(stats_exports, {
  default: () => Stats,
  loader: () => loader20
});
var import_react74 = require("@remix-run/react"), import_md26 = require("react-icons/md");
var import_jsx_dev_runtime78 = require("react/jsx-dev-runtime");
async function loader20(args) {
  let urlBase = args.context.DB_API_URL_BASE, dbRes = await queryDbMultiple(urlBase, [
    { query: "SELECT COUNT(*) AS count FROM user" },
    {
      query: "SELECT COUNT(*) AS count FROM comic WHERE publishStatus = 'published'"
    },
    {
      query: "SELECT COUNT(*) AS count FROM artist WHERE isBanned = 0 AND isPending = 0 AND isRejected = 0"
    },
    {
      query: "SELECT SUM(numberOfpages) AS count FROM comic WHERE publishStatus = 'published'"
    },
    {
      query: `SELECT
      COUNT(*) AS count, status, adType FROM advertisement WHERE status = 'ACTIVE' || status = 'ENDED'
      GROUP BY status, adType`
    },
    {
      query: `SELECT
      ISNULL(userid) AS isGuest,
      SUM(tagSuggestion) AS tagSuggestion,
      SUM(tagSuggestionRejected) AS tagSuggestionRejected,
      SUM(comicProblem) AS comicProblem,
      SUM(comicProblemRejected) AS comicProblemRejected,
      SUM(comicSuggestiongood) AS comicSuggestiongood,
      SUM(comicSuggestionbad) AS comicSuggestionbad,
      SUM(comicSuggestionRejected) AS comicSuggestionRejected,
      SUM(comicUploadexcellent) AS comicUploadexcellent,
      SUM(comicUploadminorissues) AS comicUploadminorissues,
      SUM(comicUploadmajorissues) AS comicUploadmajorissues,
      SUM(comicUploadpageissues) AS comicUploadpageissues,
      SUM(comicUploadterrible) AS comicUploadterrible,
      SUM(comicUploadRejected) AS comicUploadRejected
    FROM contributionpoints
    LEFT JOIN user ON (user.id = contributionpoints.userId)
    WHERE (
      user.UserType IS NULL
      OR (user.UserType != 'moderator' AND user.userType != 'admin')
    )
    GROUP BY isGuest`
    },
    {
      query: `SELECT SUM(amount) AS amount, YEAR(registeredDate) AS year
      FROM advertisementpayment GROUP BY year ORDER BY year desc`
    }
  ]);
  if (dbRes.isError || !dbRes.result)
    return await processApiError("Error in GET /stats", makeDbErr(dbRes, "DB error"));
  let adsRes = dbRes.result[4].result, contribRes = dbRes.result[5].result;
  return {
    totalUsers: dbRes.result[0].result[0].count,
    totalComics: dbRes.result[1].result[0].count,
    totalArtists: dbRes.result[2].result[0].count,
    totalPages: dbRes.result[3].result[0].count,
    adPayments: dbRes.result[6].result,
    ads: {
      banner: {
        active: adsRes.find((adRes) => adRes.adType === "banner" && adRes.status === "ACTIVE")?.count || 0,
        expired: adsRes.find((adRes) => adRes.adType === "banner" && adRes.status === "ENDED")?.count || 0
      },
      card: {
        active: adsRes.find((adRes) => adRes.adType === "card" && adRes.status === "ACTIVE")?.count || 0,
        expired: adsRes.find((adRes) => adRes.adType === "card" && adRes.status === "ENDED")?.count || 0
      },
      topSmall: {
        active: adsRes.find((adRes) => adRes.adType === "topSmall" && adRes.status === "ACTIVE")?.count || 0,
        expired: adsRes.find((adRes) => adRes.adType === "topSmall" && adRes.status === "ENDED")?.count || 0
      }
    },
    contributions: {
      loggedIn: contribRes.find((c) => c.isGuest === 0),
      guests: contribRes.find((c) => c.isGuest === 1)
    }
  };
}
function Stats({}) {
  let stats = (0, import_react74.useLoaderData)(), ads = stats.ads, contrib = stats.contributions, guestUploadTotal = contrib.guests.comicUploadRejected + contrib.guests.comicUploadexcellent + contrib.guests.comicUploadmajorissues + contrib.guests.comicUploadminorissues + contrib.guests.comicUploadpageissues + contrib.guests.comicUploadterrible, guestUploadAccepted = guestUploadTotal - contrib.guests.comicUploadRejected, guestUploadRejected = guestUploadTotal - guestUploadAccepted, userUploadTotal = contrib.loggedIn.comicUploadRejected + contrib.loggedIn.comicUploadexcellent + contrib.loggedIn.comicUploadmajorissues + contrib.loggedIn.comicUploadminorissues + contrib.loggedIn.comicUploadpageissues + contrib.loggedIn.comicUploadterrible, userUploadAccepted = userUploadTotal - contrib.loggedIn.comicUploadRejected, userUploadRejected = userUploadTotal - userUploadAccepted, uploadsTotal = guestUploadTotal + userUploadTotal, comicSuggLoggedIn = contrib.loggedIn.comicSuggestiongood + contrib.loggedIn.comicSuggestionbad, comicSuggGuests = contrib.guests.comicSuggestiongood + contrib.guests.comicSuggestionbad, comicSuggTotal = comicSuggLoggedIn + comicSuggGuests, comicProbTotal = contrib.loggedIn.comicProblem + contrib.guests.comicProblem + contrib.loggedIn.comicProblemRejected + contrib.guests.comicProblemRejected, tagSuggTotal = contrib.loggedIn.tagSuggestion + contrib.guests.tagSuggestion + contrib.loggedIn.tagSuggestionRejected + contrib.guests.tagSuggestionRejected;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_jsx_dev_runtime78.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("h1", { children: "Stats" }, void 0, !1, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 244,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("h2", { children: "General" }, void 0, !1, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 246,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: stats.totalUsers }, void 0, !1, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 248,
        columnNumber: 9
      }, this),
      " users"
    ] }, void 0, !0, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 247,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: stats.totalComics }, void 0, !1, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 251,
        columnNumber: 9
      }, this),
      " comics"
    ] }, void 0, !0, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 250,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: stats.totalArtists }, void 0, !1, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 254,
        columnNumber: 9
      }, this),
      " artists"
    ] }, void 0, !0, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 253,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: stats.totalPages }, void 0, !1, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 257,
        columnNumber: 9
      }, this),
      " pages"
    ] }, void 0, !0, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 256,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("h2", { className: "mt-4", children: "Contributions" }, void 0, !1, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 260,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(Table, { horizontalScroll: !0, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableHeadRow, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: " " }, void 0, !1, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 263,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Total" }, void 0, !1, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 264,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Users" }, void 0, !1, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 265,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Guests" }, void 0, !1, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 266,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 262,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableBody, { className: "text-green-600 dark:text-green-400", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: "Uploads total" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 271,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 270,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: uploadsTotal }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 273,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: userUploadTotal }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 274,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: guestUploadTotal }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 275,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 269,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 280,
              columnNumber: 17
            }, this),
            " Accepted tot"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 279,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 278,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            guestUploadAccepted + userUploadAccepted,
            " ",
            getRoundedPercent(guestUploadAccepted + userUploadAccepted, uploadsTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 283,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            userUploadAccepted,
            " ",
            getRoundedPercent(userUploadAccepted, userUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 287,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            guestUploadAccepted,
            " ",
            getRoundedPercent(guestUploadAccepted, guestUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 291,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 277,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 298,
              columnNumber: 15
            }, this),
            " Excellent"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 297,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadexcellent + contrib.guests.comicUploadexcellent,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicUploadexcellent + contrib.guests.comicUploadexcellent,
              uploadsTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 300,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadexcellent,
            " ",
            getRoundedPercent(contrib.loggedIn.comicUploadexcellent, userUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 309,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicUploadexcellent,
            " ",
            getRoundedPercent(contrib.guests.comicUploadexcellent, guestUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 313,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 296,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 320,
              columnNumber: 15
            }, this),
            " Minor issues"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 319,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadminorissues + contrib.guests.comicUploadminorissues,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicUploadminorissues + contrib.guests.comicUploadminorissues,
              uploadsTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 322,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadminorissues,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicUploadminorissues,
              userUploadTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 331,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicUploadminorissues,
            " ",
            getRoundedPercent(contrib.guests.comicUploadminorissues, guestUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 338,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 318,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 345,
              columnNumber: 15
            }, this),
            " Major issues"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 344,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadmajorissues + contrib.guests.comicUploadmajorissues,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicUploadmajorissues + contrib.guests.comicUploadmajorissues,
              uploadsTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 347,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadmajorissues,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicUploadmajorissues,
              userUploadTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 356,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicUploadmajorissues,
            " ",
            getRoundedPercent(contrib.guests.comicUploadmajorissues, guestUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 363,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 343,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 370,
              columnNumber: 15
            }, this),
            " Page issues"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 369,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadpageissues + contrib.guests.comicUploadpageissues,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicUploadpageissues + contrib.guests.comicUploadpageissues,
              uploadsTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 372,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadpageissues,
            " ",
            getRoundedPercent(contrib.loggedIn.comicUploadpageissues, userUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 381,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicUploadpageissues,
            " ",
            getRoundedPercent(contrib.guests.comicUploadpageissues, guestUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 385,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 368,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 392,
              columnNumber: 15
            }, this),
            " Terrible"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 391,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadterrible + contrib.guests.comicUploadterrible,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicUploadterrible + contrib.guests.comicUploadterrible,
              uploadsTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 394,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicUploadterrible,
            " ",
            getRoundedPercent(contrib.loggedIn.comicUploadterrible, userUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 401,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicUploadterrible,
            " ",
            getRoundedPercent(contrib.guests.comicUploadterrible, guestUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 405,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 390,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdClose, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 413,
              columnNumber: 17
            }, this),
            " Rejected"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 412,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 411,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            guestUploadRejected + userUploadRejected,
            " ",
            getRoundedPercent(guestUploadRejected + userUploadRejected, uploadsTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 416,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            userUploadRejected,
            " ",
            getRoundedPercent(userUploadRejected, userUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 420,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            guestUploadRejected,
            " ",
            getRoundedPercent(guestUploadRejected, guestUploadTotal)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 424,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 410,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 268,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableBody, { className: "dark:text-blue-400 text-blue-600", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: "Comic suggestions" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 433,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 432,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: comicSuggTotal }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 435,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: comicSuggLoggedIn }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 436,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: comicSuggGuests }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 437,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 431,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 441,
              columnNumber: 15
            }, this),
            " Good"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 440,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicSuggestiongood + contrib.guests.comicSuggestiongood,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicSuggestiongood + contrib.guests.comicSuggestiongood,
              comicSuggTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 443,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicSuggestiongood,
            " ",
            getRoundedPercent(contrib.loggedIn.comicSuggestiongood, comicSuggLoggedIn)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 450,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicSuggestiongood,
            " ",
            getRoundedPercent(contrib.guests.comicSuggestiongood, comicSuggGuests)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 454,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 439,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 461,
              columnNumber: 15
            }, this),
            " Bad"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 460,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicSuggestionbad + contrib.guests.comicSuggestionbad,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicSuggestionbad + contrib.guests.comicSuggestionbad,
              comicSuggTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 463,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicSuggestionbad,
            " ",
            getRoundedPercent(contrib.loggedIn.comicSuggestionbad, comicSuggLoggedIn)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 470,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicSuggestionbad,
            " ",
            getRoundedPercent(contrib.guests.comicSuggestionbad, comicSuggGuests)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 474,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 459,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdClose, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 481,
              columnNumber: 15
            }, this),
            " Rejected"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 480,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicSuggestionRejected + contrib.guests.comicSuggestionRejected,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicSuggestionRejected + contrib.guests.comicSuggestionRejected,
              comicSuggTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 483,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicSuggestionRejected,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicSuggestionRejected,
              comicSuggLoggedIn
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 492,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicSuggestionRejected,
            " ",
            getRoundedPercent(contrib.guests.comicSuggestionRejected, comicSuggGuests)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 499,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 479,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 430,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableBody, { className: "dark:text-purple-400 text-purple-600", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: "Comic problems" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 508,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 507,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: comicProbTotal }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 510,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: contrib.loggedIn.comicProblem + contrib.loggedIn.comicProblemRejected }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 511,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: contrib.guests.comicProblem + contrib.guests.comicProblemRejected }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 514,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 506,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 520,
              columnNumber: 15
            }, this),
            " Approved"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 519,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicProblem + contrib.guests.comicProblem,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicProblem + contrib.guests.comicProblem,
              comicProbTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 522,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.comicProblem,
            " ",
            getRoundedPercent(
              contrib.loggedIn.comicProblem,
              contrib.loggedIn.comicProblem + contrib.loggedIn.comicProblemRejected
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 529,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.comicProblem,
            " ",
            getRoundedPercent(
              contrib.guests.comicProblem,
              contrib.guests.comicProblem + contrib.guests.comicProblemRejected
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 536,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 518,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 505,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableBody, { className: "dark:text-yellow-500 text-yellow-600", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("b", { children: "Tag suggestions" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 548,
            columnNumber: 15
          }, this) }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 547,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: tagSuggTotal }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 550,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: contrib.loggedIn.tagSuggestion + contrib.guests.tagSuggestionRejected }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 551,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: contrib.guests.tagSuggestion + contrib.guests.tagSuggestionRejected }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 554,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 546,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(import_md26.MdCheck, {}, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 560,
              columnNumber: 15
            }, this),
            " Approved"
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 559,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.tagSuggestion + contrib.guests.tagSuggestion,
            " ",
            getRoundedPercent(
              contrib.loggedIn.tagSuggestion + contrib.guests.tagSuggestion,
              tagSuggTotal
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 562,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.loggedIn.tagSuggestion,
            " ",
            getRoundedPercent(
              contrib.loggedIn.tagSuggestion,
              contrib.loggedIn.tagSuggestion + contrib.loggedIn.tagSuggestionRejected
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 569,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            contrib.guests.tagSuggestion,
            " ",
            getRoundedPercent(
              contrib.guests.tagSuggestion,
              contrib.guests.tagSuggestion + contrib.guests.tagSuggestionRejected
            )
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 576,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 558,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 545,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 261,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("h2", { className: "mt-4", children: "Avertising" }, void 0, !1, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 587,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-x-8 gap-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(Table, { className: "h-fit", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableHeadRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Ad type" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 591,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Active" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 592,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Expired" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 593,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 590,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableBody, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Total" }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 597,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.banner.active + ads.card.active + ads.topSmall.active }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 598,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.banner.expired + ads.card.expired + ads.topSmall.expired }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 601,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 596,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Card" }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 606,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.card.active }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 607,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.card.expired }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 608,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 605,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Banner" }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 611,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.banner.active }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 612,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.banner.expired }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 613,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 610,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Top of page" }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 616,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.topSmall.active }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 617,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: ads.topSmall.expired }, void 0, !1, {
              fileName: "app/routes/admin/stats.tsx",
              lineNumber: 618,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 615,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 595,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 589,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(Table, { className: "h-fit", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableHeadRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Year" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 625,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: "Money" }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 626,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 624,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableBody, { children: stats.adPayments.map(({ year, amount }) => /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableRow, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: year }, void 0, !1, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 631,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime78.jsxDEV)(TableCell, { children: [
            "$",
            amount
          ] }, void 0, !0, {
            fileName: "app/routes/admin/stats.tsx",
            lineNumber: 632,
            columnNumber: 17
          }, this)
        ] }, year, !0, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 630,
          columnNumber: 15
        }, this)) }, void 0, !1, {
          fileName: "app/routes/admin/stats.tsx",
          lineNumber: 628,
          columnNumber: 11
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/admin/stats.tsx",
        lineNumber: 623,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/admin/stats.tsx",
      lineNumber: 588,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/admin/stats.tsx",
    lineNumber: 243,
    columnNumber: 5
  }, this);
}
function getRoundedPercent(num, total) {
  return !num || !total ? "" : "(" + Math.round(num / total * 100) + "%)";
}

// app/routes/admin/tags.tsx
var tags_exports = {};
__export(tags_exports, {
  default: () => TagManager
});
var import_jsx_dev_runtime79 = require("react/jsx-dev-runtime");
function TagManager({}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime79.jsxDEV)(import_jsx_dev_runtime79.Fragment, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime79.jsxDEV)("h1", { children: "Tag manager" }, void 0, !1, {
    fileName: "app/routes/admin/tags.tsx",
    lineNumber: 4,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "app/routes/admin/tags.tsx",
    lineNumber: 3,
    columnNumber: 5
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-TY6G7OQA.js", imports: ["/build/_shared/chunk-GIAAE3CH.js", "/build/_shared/chunk-NOZAJOD3.js", "/build/_shared/chunk-XU7DNSPJ.js", "/build/_shared/chunk-GYC7E6GP.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-BOXFZXVX.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-YN5CMY25.js", imports: ["/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-GA6XGWX7.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/admin": { id: "routes/admin", parentId: "root", path: "admin", index: void 0, caseSensitive: void 0, module: "/build/routes/admin-ANBBMAVX.js", imports: ["/build/_shared/chunk-G7RFWOIH.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !0 }, "routes/admin/artists": { id: "routes/admin/artists", parentId: "routes/admin", path: "artists", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/artists-POSLSZVG.js", imports: ["/build/_shared/chunk-TGGKCCFQ.js", "/build/_shared/chunk-KEMJ7ID2.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/artists/$artist": { id: "routes/admin/artists/$artist", parentId: "routes/admin/artists", path: ":artist", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/artists/$artist-W7BLBN3V.js", imports: ["/build/_shared/chunk-T7R3HSKW.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-G7RFWOIH.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-GA6XGWX7.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/admin/comics": { id: "routes/admin/comics", parentId: "routes/admin", path: "comics", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics-6MQ5EKIY.js", imports: ["/build/_shared/chunk-TGGKCCFQ.js", "/build/_shared/chunk-KEMJ7ID2.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/$comic": { id: "routes/admin/comics/$comic", parentId: "routes/admin/comics", path: ":comic", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/$comic-OG4TNGG2.js", imports: ["/build/_shared/chunk-DWON2V7Z.js", "/build/_shared/chunk-U4XMYBJF.js", "/build/_shared/chunk-447JW342.js", "/build/_shared/chunk-L5XC6NM2.js", "/build/_shared/chunk-4YY65RFW.js", "/build/_shared/chunk-XMAFLJMK.js", "/build/_shared/chunk-EYUBCDIQ.js", "/build/_shared/chunk-T7R3HSKW.js", "/build/_shared/chunk-SP3O2GUC.js", "/build/_shared/chunk-7ZL2YVHF.js", "/build/_shared/chunk-YARPHBWQ.js", "/build/_shared/chunk-MLHRPB57.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-MXFDKN7O.js", "/build/_shared/chunk-KNUP74JU.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-G7RFWOIH.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-GA6XGWX7.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/admin/comics/AnonUploadedComicSection": { id: "routes/admin/comics/AnonUploadedComicSection", parentId: "routes/admin/comics", path: "AnonUploadedComicSection", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/AnonUploadedComicSection-EPMI7XYD.js", imports: ["/build/_shared/chunk-U4XMYBJF.js", "/build/_shared/chunk-7ZL2YVHF.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/LiveComic": { id: "routes/admin/comics/LiveComic", parentId: "routes/admin/comics", path: "LiveComic", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/LiveComic-3UBG2TQH.js", imports: ["/build/_shared/chunk-DWON2V7Z.js", "/build/_shared/chunk-EYUBCDIQ.js", "/build/_shared/chunk-T7R3HSKW.js", "/build/_shared/chunk-SP3O2GUC.js", "/build/_shared/chunk-YARPHBWQ.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-MXFDKN7O.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-G7RFWOIH.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/PendingComicSection": { id: "routes/admin/comics/PendingComicSection", parentId: "routes/admin/comics", path: "PendingComicSection", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/PendingComicSection-6DYAQZLE.js", imports: ["/build/_shared/chunk-4YY65RFW.js", "/build/_shared/chunk-XMAFLJMK.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-KNUP74JU.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/UnlistedComicSection": { id: "routes/admin/comics/UnlistedComicSection", parentId: "routes/admin/comics", path: "UnlistedComicSection", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/UnlistedComicSection-N6GBP2HD.js", imports: ["/build/_shared/chunk-L5XC6NM2.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/UserUploadedComicSection": { id: "routes/admin/comics/UserUploadedComicSection", parentId: "routes/admin/comics", path: "UserUploadedComicSection", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/UserUploadedComicSection-RCHDGPWT.js", imports: ["/build/_shared/chunk-447JW342.js", "/build/_shared/chunk-XMAFLJMK.js", "/build/_shared/chunk-7ZL2YVHF.js", "/build/_shared/chunk-MLHRPB57.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/pending/Error": { id: "routes/admin/comics/pending/Error", parentId: "routes/admin/comics", path: "pending/Error", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/pending/Error-4UUP72JA.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/pending/Reject": { id: "routes/admin/comics/pending/Reject", parentId: "routes/admin/comics", path: "pending/Reject", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/pending/Reject-US3MNLCJ.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/scheduling/Schedule": { id: "routes/admin/comics/scheduling/Schedule", parentId: "routes/admin/comics", path: "scheduling/Schedule", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/scheduling/Schedule-WK3YFI5R.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/comics/scheduling/Scheduled": { id: "routes/admin/comics/scheduling/Scheduled", parentId: "routes/admin/comics", path: "scheduling/Scheduled", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/comics/scheduling/Scheduled-TWQFH4LV.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/dashboard/ComicProblem": { id: "routes/admin/dashboard/ComicProblem", parentId: "routes/admin", path: "dashboard/ComicProblem", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/dashboard/ComicProblem-SVKVJST5.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/dashboard/ComicSuggestion": { id: "routes/admin/dashboard/ComicSuggestion", parentId: "routes/admin", path: "dashboard/ComicSuggestion", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/dashboard/ComicSuggestion-L65PRR4J.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/dashboard/ComicUpload": { id: "routes/admin/dashboard/ComicUpload", parentId: "routes/admin", path: "dashboard/ComicUpload", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/dashboard/ComicUpload-ELLWS2DM.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/dashboard/PendingComicProblem": { id: "routes/admin/dashboard/PendingComicProblem", parentId: "routes/admin", path: "dashboard/PendingComicProblem", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/dashboard/PendingComicProblem-22D2UR64.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/dashboard/TagSuggestion": { id: "routes/admin/dashboard/TagSuggestion", parentId: "routes/admin", path: "dashboard/TagSuggestion", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/dashboard/TagSuggestion-EJRHOORR.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/dashboard/index": { id: "routes/admin/dashboard/index", parentId: "routes/admin", path: "dashboard", index: !0, caseSensitive: void 0, module: "/build/routes/admin/dashboard/index-YSFEWPNM.js", imports: ["/build/_shared/chunk-XMAFLJMK.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-MXFDKN7O.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-GA6XGWX7.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !0 }, "routes/admin/pending-comics": { id: "routes/admin/pending-comics", parentId: "routes/admin", path: "pending-comics", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/pending-comics-UBR33LVP.js", imports: ["/build/_shared/chunk-7ZL2YVHF.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-PVQP6LHP.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-GA6XGWX7.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/admin/stats": { id: "routes/admin/stats", parentId: "routes/admin", path: "stats", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/stats-TFMU54SU.js", imports: ["/build/_shared/chunk-65272WMF.js", "/build/_shared/chunk-GA6XGWX7.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/admin/tags": { id: "routes/admin/tags", parentId: "routes/admin", path: "tags", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/tags-KIYSOAER.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/admin/thumbnails": { id: "routes/admin/thumbnails", parentId: "routes/admin", path: "thumbnails", index: void 0, caseSensitive: void 0, module: "/build/routes/admin/thumbnails-4F5FGAIV.js", imports: ["/build/_shared/chunk-IROW2AMK.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/assign-action": { id: "routes/api/admin/assign-action", parentId: "root", path: "api/admin/assign-action", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/assign-action-ZSHY64UM.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/dashboard-data": { id: "routes/api/admin/dashboard-data", parentId: "root", path: "api/admin/dashboard-data", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/dashboard-data-2ZFPG557.js", imports: void 0, hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/api/admin/manage-artist": { id: "routes/api/admin/manage-artist", parentId: "root", path: "api/admin/manage-artist", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/manage-artist-7EREDL26.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/move-queued-comic": { id: "routes/api/admin/move-queued-comic", parentId: "root", path: "api/admin/move-queued-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/move-queued-comic-JDH7JPON.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/process-anon-upload": { id: "routes/api/admin/process-anon-upload", parentId: "root", path: "api/admin/process-anon-upload", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/process-anon-upload-KZJMVF6V.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/process-comic-problem": { id: "routes/api/admin/process-comic-problem", parentId: "root", path: "api/admin/process-comic-problem", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/process-comic-problem-PAAR6AOW.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/process-comic-suggestion": { id: "routes/api/admin/process-comic-suggestion", parentId: "root", path: "api/admin/process-comic-suggestion", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/process-comic-suggestion-FQVDP735.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/process-tag-suggestion": { id: "routes/api/admin/process-tag-suggestion", parentId: "root", path: "api/admin/process-tag-suggestion", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/process-tag-suggestion-SO6BR7L3.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/process-user-upload": { id: "routes/api/admin/process-user-upload", parentId: "root", path: "api/admin/process-user-upload", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/process-user-upload-P33X4XXS.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/publish-comic": { id: "routes/api/admin/publish-comic", parentId: "root", path: "api/admin/publish-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/publish-comic-YSBHBSES.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/publish-comics-cron": { id: "routes/api/admin/publish-comics-cron", parentId: "root", path: "api/admin/publish-comics-cron", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/publish-comics-cron-UTCL3D5T.js", imports: void 0, hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/api/admin/recalculate-publishing-queue": { id: "routes/api/admin/recalculate-publishing-queue", parentId: "root", path: "api/admin/recalculate-publishing-queue", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/recalculate-publishing-queue-RBBKFGFP.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/reject-pending-comic": { id: "routes/api/admin/reject-pending-comic", parentId: "root", path: "api/admin/reject-pending-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/reject-pending-comic-32HNKDLF.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/relist-comic": { id: "routes/api/admin/relist-comic", parentId: "root", path: "api/admin/relist-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/relist-comic-NJHZA6I2.js", imports: void 0, hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/api/admin/schedule-comic": { id: "routes/api/admin/schedule-comic", parentId: "root", path: "api/admin/schedule-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/schedule-comic-JGB72US5.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/schedule-comic-to-queue": { id: "routes/api/admin/schedule-comic-to-queue", parentId: "root", path: "api/admin/schedule-comic-to-queue", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/schedule-comic-to-queue-OMTZWTI2.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/set-comic-error": { id: "routes/api/admin/set-comic-error", parentId: "root", path: "api/admin/set-comic-error", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/set-comic-error-BSQ7JZ4C.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/toggle-artist-ban": { id: "routes/api/admin/toggle-artist-ban", parentId: "root", path: "api/admin/toggle-artist-ban", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/toggle-artist-ban-V4OWDFEA.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/unassign-action": { id: "routes/api/admin/unassign-action", parentId: "root", path: "api/admin/unassign-action", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/unassign-action-LIF564OL.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/unlist-comic": { id: "routes/api/admin/unlist-comic", parentId: "root", path: "api/admin/unlist-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/unlist-comic-MFMAF7Q5.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/unschedule-comic": { id: "routes/api/admin/unschedule-comic", parentId: "root", path: "api/admin/unschedule-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/unschedule-comic-E2LRPEPN.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/update-artist-data": { id: "routes/api/admin/update-artist-data", parentId: "root", path: "api/admin/update-artist-data", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/update-artist-data-KXASFKH4.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/admin/update-comic-data": { id: "routes/api/admin/update-comic-data", parentId: "root", path: "api/admin/update-comic-data", index: void 0, caseSensitive: void 0, module: "/build/routes/api/admin/update-comic-data-5NSHPGOR.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/add-contribution-points": { id: "routes/api/funcs/add-contribution-points", parentId: "root", path: "api/funcs/add-contribution-points", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/add-contribution-points-3DVI2U7N.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/get-artist": { id: "routes/api/funcs/get-artist", parentId: "root", path: "api/funcs/get-artist", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/get-artist-Z3HVHDFT.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/get-artists": { id: "routes/api/funcs/get-artists", parentId: "root", path: "api/funcs/get-artists", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/get-artists-C76CQ4OP.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/get-comic": { id: "routes/api/funcs/get-comic", parentId: "root", path: "api/funcs/get-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/get-comic-KFEBJKLZ.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/get-comics": { id: "routes/api/funcs/get-comics", parentId: "root", path: "api/funcs/get-comics", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/get-comics-BHWWDGYV.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/get-mod-application": { id: "routes/api/funcs/get-mod-application", parentId: "root", path: "api/funcs/get-mod-application", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/get-mod-application-YJNGVLCA.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/get-pending-comics": { id: "routes/api/funcs/get-pending-comics", parentId: "root", path: "api/funcs/get-pending-comics", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/get-pending-comics-6HKY6GND.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/get-tags": { id: "routes/api/funcs/get-tags", parentId: "root", path: "api/funcs/get-tags", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/get-tags-TMFNKPOI.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/funcs/publishing-queue": { id: "routes/api/funcs/publishing-queue", parentId: "root", path: "api/funcs/publishing-queue", index: void 0, caseSensitive: void 0, module: "/build/routes/api/funcs/publishing-queue-EQX3QLU2.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/search-similar-artist": { id: "routes/api/search-similar-artist", parentId: "root", path: "api/search-similar-artist", index: void 0, caseSensitive: void 0, module: "/build/routes/api/search-similar-artist-SGKSOEAO.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/search-similarly-named-comic": { id: "routes/api/search-similarly-named-comic", parentId: "root", path: "api/search-similarly-named-comic", index: void 0, caseSensitive: void 0, module: "/build/routes/api/search-similarly-named-comic-BQ7XNDB7.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/api/set-theme": { id: "routes/api/set-theme", parentId: "root", path: "api/set-theme", index: void 0, caseSensitive: void 0, module: "/build/routes/api/set-theme-74DKX3RK.js", imports: void 0, hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/api/upload-comic-pages": { id: "routes/api/upload-comic-pages", parentId: "root", path: "api/upload-comic-pages", index: void 0, caseSensitive: void 0, module: "/build/routes/api/upload-comic-pages-FBFEOINS.js", imports: void 0, hasAction: !0, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute": { id: "routes/contribute", parentId: "root", path: "contribute", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/index-QNESKWSF.js", imports: ["/build/_shared/chunk-DPPBPQ7M.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/index": { id: "routes/contribute/index", parentId: "root", path: "contribute", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/index-QNESKWSF.js", imports: ["/build/_shared/chunk-DPPBPQ7M.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/BackToContribute": { id: "routes/contribute/BackToContribute", parentId: "root", path: "contribute/BackToContribute", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/BackToContribute-3QGGG6UH.js", imports: ["/build/_shared/chunk-SECVNS4V.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute/feedback/index": { id: "routes/contribute/feedback/index", parentId: "root", path: "contribute/feedback", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/feedback/index-RNAXM5Q2.js", imports: ["/build/_shared/chunk-7ZL2YVHF.js", "/build/_shared/chunk-7IMHRCVJ.js", "/build/_shared/chunk-SECVNS4V.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/join-us/apply/index": { id: "routes/contribute/join-us/apply/index", parentId: "root", path: "contribute/join-us/apply", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/join-us/apply/index-MOGISO62.js", imports: ["/build/_shared/chunk-7IMHRCVJ.js", "/build/_shared/chunk-KNUP74JU.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/join-us/index": { id: "routes/contribute/join-us/index", parentId: "root", path: "contribute/join-us", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/join-us/index-MWOLYSXZ.js", imports: ["/build/_shared/chunk-SECVNS4V.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/scoreboard/index": { id: "routes/contribute/scoreboard/index", parentId: "root", path: "contribute/scoreboard", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/scoreboard/index-6DVEQW3N.js", imports: ["/build/_shared/chunk-7NC2HCUX.js", "/build/_shared/chunk-65272WMF.js", "/build/_shared/chunk-MLHRPB57.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-KEMJ7ID2.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-SECVNS4V.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/suggest-comic/index": { id: "routes/contribute/suggest-comic/index", parentId: "root", path: "contribute/suggest-comic", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/suggest-comic/index-74D4Y5I2.js", imports: ["/build/_shared/chunk-7IMHRCVJ.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-SECVNS4V.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/upload/index": { id: "routes/contribute/upload/index", parentId: "root", path: "contribute/upload", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/upload/index-4FBSNLPG.js", imports: ["/build/_shared/chunk-EYUBCDIQ.js", "/build/_shared/chunk-T7R3HSKW.js", "/build/_shared/chunk-TGGKCCFQ.js", "/build/_shared/chunk-BLXOIMHH.js", "/build/_shared/chunk-JAPRM4DZ.js", "/build/_shared/chunk-D7KEIL4Q.js", "/build/_shared/chunk-SP3O2GUC.js", "/build/_shared/chunk-7ZL2YVHF.js", "/build/_shared/chunk-RZCJ7RWW.js", "/build/_shared/chunk-YARPHBWQ.js", "/build/_shared/chunk-LCW5FZYE.js", "/build/_shared/chunk-KEMJ7ID2.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-SECVNS4V.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-MXFDKN7O.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-G7RFWOIH.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/contribute/upload/step1": { id: "routes/contribute/upload/step1", parentId: "root", path: "contribute/upload/step1", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/upload/step1-PATKZRN3.js", imports: ["/build/_shared/chunk-BLXOIMHH.js", "/build/_shared/chunk-KEMJ7ID2.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute/upload/step3-pagemanager": { id: "routes/contribute/upload/step3-pagemanager", parentId: "root", path: "contribute/upload/step3-pagemanager", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/upload/step3-pagemanager-KJVNAXWF.js", imports: ["/build/_shared/chunk-RZCJ7RWW.js", "/build/_shared/chunk-YARPHBWQ.js", "/build/_shared/chunk-LCW5FZYE.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-MXFDKN7O.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-G7RFWOIH.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute/upload/step4-thumbnail": { id: "routes/contribute/upload/step4-thumbnail", parentId: "root", path: "contribute/upload/step4-thumbnail", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/upload/step4-thumbnail-MKA6QCLO.js", imports: ["/build/_shared/chunk-D7KEIL4Q.js", "/build/_shared/chunk-SP3O2GUC.js", "/build/_shared/chunk-7ZL2YVHF.js", "/build/_shared/chunk-LCW5FZYE.js", "/build/_shared/chunk-MXFDKN7O.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-G7RFWOIH.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute/upload/success": { id: "routes/contribute/upload/success", parentId: "root", path: "contribute/upload/success", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/upload/success-FBJ3EYUQ.js", imports: ["/build/_shared/chunk-JAPRM4DZ.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute/upload/upload-handler.server": { id: "routes/contribute/upload/upload-handler.server", parentId: "root", path: "contribute/upload/upload-handler/server", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/upload/upload-handler.server-KKXA72NA.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute/your-contributions/data-fetchers": { id: "routes/contribute/your-contributions/data-fetchers", parentId: "root", path: "contribute/your-contributions/data-fetchers", index: void 0, caseSensitive: void 0, module: "/build/routes/contribute/your-contributions/data-fetchers-PXYEWMKC.js", imports: void 0, hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/contribute/your-contributions/index": { id: "routes/contribute/your-contributions/index", parentId: "root", path: "contribute/your-contributions", index: !0, caseSensitive: void 0, module: "/build/routes/contribute/your-contributions/index-PQZ6OYQT.js", imports: ["/build/_shared/chunk-7NC2HCUX.js", "/build/_shared/chunk-65272WMF.js", "/build/_shared/chunk-MLHRPB57.js", "/build/_shared/chunk-CHHLOFTP.js", "/build/_shared/chunk-KEMJ7ID2.js", "/build/_shared/chunk-U5M3GG4V.js", "/build/_shared/chunk-SECVNS4V.js", "/build/_shared/chunk-TMKGCAS4.js", "/build/_shared/chunk-MXFDKN7O.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/error": { id: "routes/error", parentId: "root", path: "error", index: void 0, caseSensitive: void 0, module: "/build/routes/error-66BV474U.js", imports: ["/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !0 }, "routes/forgotten-password": { id: "routes/forgotten-password", parentId: "root", path: "forgotten-password", index: void 0, caseSensitive: void 0, module: "/build/routes/forgotten-password-PPMVAR4W.js", imports: ["/build/_shared/chunk-IROW2AMK.js"], hasAction: !1, hasLoader: !0, hasErrorBoundary: !1 }, "routes/index": { id: "routes/index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/index-TFFSDTPY.js", imports: ["/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !1, hasLoader: !1, hasErrorBoundary: !1 }, "routes/login": { id: "routes/login", parentId: "root", path: "login", index: void 0, caseSensitive: void 0, module: "/build/routes/login-IUZF42UH.js", imports: ["/build/_shared/chunk-R4RPDCQD.js", "/build/_shared/chunk-KNUP74JU.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/logout": { id: "routes/logout", parentId: "root", path: "logout", index: void 0, caseSensitive: void 0, module: "/build/routes/logout-GGSXPJWV.js", imports: void 0, hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 }, "routes/signup": { id: "routes/signup", parentId: "root", path: "signup", index: void 0, caseSensitive: void 0, module: "/build/routes/signup-67QUUQE3.js", imports: ["/build/_shared/chunk-R4RPDCQD.js", "/build/_shared/chunk-KNUP74JU.js", "/build/_shared/chunk-DJPO7VRC.js", "/build/_shared/chunk-XUF3G4EY.js", "/build/_shared/chunk-JOXLHWZN.js", "/build/_shared/chunk-N3P7HA7R.js", "/build/_shared/chunk-IROW2AMK.js", "/build/_shared/chunk-2TN4O6PS.js", "/build/_shared/chunk-3IJKRM2T.js", "/build/_shared/chunk-NJVP5TAD.js", "/build/_shared/chunk-QX4QACTM.js"], hasAction: !0, hasLoader: !0, hasErrorBoundary: !1 } }, version: "99705f95", hmr: { runtime: "/build/_shared/chunk-GYC7E6GP.js", timestamp: 1700058445882 }, url: "/build/manifest-99705F95.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/forgotten-password": {
    id: "routes/forgotten-password",
    parentId: "root",
    path: "forgotten-password",
    index: void 0,
    caseSensitive: void 0,
    module: forgotten_password_exports
  },
  "routes/contribute": {
    id: "routes/contribute",
    parentId: "root",
    path: "contribute",
    index: void 0,
    caseSensitive: void 0,
    module: contribute_exports
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: logout_exports
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "root",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: signup_exports
  },
  "routes/admin": {
    id: "routes/admin",
    parentId: "root",
    path: "admin",
    index: void 0,
    caseSensitive: void 0,
    module: admin_exports
  },
  "routes/error": {
    id: "routes/error",
    parentId: "root",
    path: "error",
    index: void 0,
    caseSensitive: void 0,
    module: error_exports
  },
  "routes/index": {
    id: "routes/index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: routes_exports
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: login_exports
  },
  "routes/contribute/your-contributions/data-fetchers": {
    id: "routes/contribute/your-contributions/data-fetchers",
    parentId: "root",
    path: "contribute/your-contributions/data-fetchers",
    index: void 0,
    caseSensitive: void 0,
    module: data_fetchers_exports
  },
  "routes/contribute/upload/upload-handler.server": {
    id: "routes/contribute/upload/upload-handler.server",
    parentId: "root",
    path: "contribute/upload/upload-handler/server",
    index: void 0,
    caseSensitive: void 0,
    module: upload_handler_server_exports
  },
  "routes/api/admin/recalculate-publishing-queue": {
    id: "routes/api/admin/recalculate-publishing-queue",
    parentId: "root",
    path: "api/admin/recalculate-publishing-queue",
    index: void 0,
    caseSensitive: void 0,
    module: recalculate_publishing_queue_exports
  },
  "routes/contribute/upload/step3-pagemanager": {
    id: "routes/contribute/upload/step3-pagemanager",
    parentId: "root",
    path: "contribute/upload/step3-pagemanager",
    index: void 0,
    caseSensitive: void 0,
    module: step3_pagemanager_exports
  },
  "routes/contribute/your-contributions/index": {
    id: "routes/contribute/your-contributions/index",
    parentId: "root",
    path: "contribute/your-contributions",
    index: !0,
    caseSensitive: void 0,
    module: your_contributions_exports
  },
  "routes/api/admin/process-comic-suggestion": {
    id: "routes/api/admin/process-comic-suggestion",
    parentId: "root",
    path: "api/admin/process-comic-suggestion",
    index: void 0,
    caseSensitive: void 0,
    module: process_comic_suggestion_exports
  },
  "routes/api/admin/schedule-comic-to-queue": {
    id: "routes/api/admin/schedule-comic-to-queue",
    parentId: "root",
    path: "api/admin/schedule-comic-to-queue",
    index: void 0,
    caseSensitive: void 0,
    module: schedule_comic_to_queue_exports
  },
  "routes/api/funcs/add-contribution-points": {
    id: "routes/api/funcs/add-contribution-points",
    parentId: "root",
    path: "api/funcs/add-contribution-points",
    index: void 0,
    caseSensitive: void 0,
    module: add_contribution_points_exports
  },
  "routes/contribute/upload/step4-thumbnail": {
    id: "routes/contribute/upload/step4-thumbnail",
    parentId: "root",
    path: "contribute/upload/step4-thumbnail",
    index: void 0,
    caseSensitive: void 0,
    module: step4_thumbnail_exports
  },
  "routes/api/admin/process-tag-suggestion": {
    id: "routes/api/admin/process-tag-suggestion",
    parentId: "root",
    path: "api/admin/process-tag-suggestion",
    index: void 0,
    caseSensitive: void 0,
    module: process_tag_suggestion_exports
  },
  "routes/api/search-similarly-named-comic": {
    id: "routes/api/search-similarly-named-comic",
    parentId: "root",
    path: "api/search-similarly-named-comic",
    index: void 0,
    caseSensitive: void 0,
    module: search_similarly_named_comic_exports
  },
  "routes/api/admin/process-comic-problem": {
    id: "routes/api/admin/process-comic-problem",
    parentId: "root",
    path: "api/admin/process-comic-problem",
    index: void 0,
    caseSensitive: void 0,
    module: process_comic_problem_exports
  },
  "routes/api/admin/reject-pending-comic": {
    id: "routes/api/admin/reject-pending-comic",
    parentId: "root",
    path: "api/admin/reject-pending-comic",
    index: void 0,
    caseSensitive: void 0,
    module: reject_pending_comic_exports
  },
  "routes/contribute/join-us/apply/index": {
    id: "routes/contribute/join-us/apply/index",
    parentId: "root",
    path: "contribute/join-us/apply",
    index: !0,
    caseSensitive: void 0,
    module: apply_exports
  },
  "routes/contribute/suggest-comic/index": {
    id: "routes/contribute/suggest-comic/index",
    parentId: "root",
    path: "contribute/suggest-comic",
    index: !0,
    caseSensitive: void 0,
    module: suggest_comic_exports
  },
  "routes/api/admin/process-anon-upload": {
    id: "routes/api/admin/process-anon-upload",
    parentId: "root",
    path: "api/admin/process-anon-upload",
    index: void 0,
    caseSensitive: void 0,
    module: process_anon_upload_exports
  },
  "routes/api/admin/process-user-upload": {
    id: "routes/api/admin/process-user-upload",
    parentId: "root",
    path: "api/admin/process-user-upload",
    index: void 0,
    caseSensitive: void 0,
    module: process_user_upload_exports
  },
  "routes/api/admin/publish-comics-cron": {
    id: "routes/api/admin/publish-comics-cron",
    parentId: "root",
    path: "api/admin/publish-comics-cron",
    index: void 0,
    caseSensitive: void 0,
    module: publish_comics_cron_exports
  },
  "routes/api/funcs/get-mod-application": {
    id: "routes/api/funcs/get-mod-application",
    parentId: "root",
    path: "api/funcs/get-mod-application",
    index: void 0,
    caseSensitive: void 0,
    module: get_mod_application_exports
  },
  "routes/api/admin/update-artist-data": {
    id: "routes/api/admin/update-artist-data",
    parentId: "root",
    path: "api/admin/update-artist-data",
    index: void 0,
    caseSensitive: void 0,
    module: update_artist_data_exports
  },
  "routes/api/funcs/get-pending-comics": {
    id: "routes/api/funcs/get-pending-comics",
    parentId: "root",
    path: "api/funcs/get-pending-comics",
    index: void 0,
    caseSensitive: void 0,
    module: get_pending_comics_exports
  },
  "routes/api/admin/move-queued-comic": {
    id: "routes/api/admin/move-queued-comic",
    parentId: "root",
    path: "api/admin/move-queued-comic",
    index: void 0,
    caseSensitive: void 0,
    module: move_queued_comic_exports
  },
  "routes/api/admin/toggle-artist-ban": {
    id: "routes/api/admin/toggle-artist-ban",
    parentId: "root",
    path: "api/admin/toggle-artist-ban",
    index: void 0,
    caseSensitive: void 0,
    module: toggle_artist_ban_exports
  },
  "routes/api/admin/update-comic-data": {
    id: "routes/api/admin/update-comic-data",
    parentId: "root",
    path: "api/admin/update-comic-data",
    index: void 0,
    caseSensitive: void 0,
    module: update_comic_data_exports
  },
  "routes/contribute/BackToContribute": {
    id: "routes/contribute/BackToContribute",
    parentId: "root",
    path: "contribute/BackToContribute",
    index: void 0,
    caseSensitive: void 0,
    module: BackToContribute_exports
  },
  "routes/contribute/scoreboard/index": {
    id: "routes/contribute/scoreboard/index",
    parentId: "root",
    path: "contribute/scoreboard",
    index: !0,
    caseSensitive: void 0,
    module: scoreboard_exports
  },
  "routes/api/admin/unschedule-comic": {
    id: "routes/api/admin/unschedule-comic",
    parentId: "root",
    path: "api/admin/unschedule-comic",
    index: void 0,
    caseSensitive: void 0,
    module: unschedule_comic_exports
  },
  "routes/api/funcs/publishing-queue": {
    id: "routes/api/funcs/publishing-queue",
    parentId: "root",
    path: "api/funcs/publishing-queue",
    index: void 0,
    caseSensitive: void 0,
    module: publishing_queue_exports
  },
  "routes/api/admin/set-comic-error": {
    id: "routes/api/admin/set-comic-error",
    parentId: "root",
    path: "api/admin/set-comic-error",
    index: void 0,
    caseSensitive: void 0,
    module: set_comic_error_exports
  },
  "routes/api/admin/unassign-action": {
    id: "routes/api/admin/unassign-action",
    parentId: "root",
    path: "api/admin/unassign-action",
    index: void 0,
    caseSensitive: void 0,
    module: unassign_action_exports
  },
  "routes/api/search-similar-artist": {
    id: "routes/api/search-similar-artist",
    parentId: "root",
    path: "api/search-similar-artist",
    index: void 0,
    caseSensitive: void 0,
    module: search_similar_artist_exports
  },
  "routes/contribute/feedback/index": {
    id: "routes/contribute/feedback/index",
    parentId: "root",
    path: "contribute/feedback",
    index: !0,
    caseSensitive: void 0,
    module: feedback_exports
  },
  "routes/contribute/upload/success": {
    id: "routes/contribute/upload/success",
    parentId: "root",
    path: "contribute/upload/success",
    index: void 0,
    caseSensitive: void 0,
    module: success_exports
  },
  "routes/api/admin/dashboard-data": {
    id: "routes/api/admin/dashboard-data",
    parentId: "root",
    path: "api/admin/dashboard-data",
    index: void 0,
    caseSensitive: void 0,
    module: dashboard_data_exports
  },
  "routes/api/admin/schedule-comic": {
    id: "routes/api/admin/schedule-comic",
    parentId: "root",
    path: "api/admin/schedule-comic",
    index: void 0,
    caseSensitive: void 0,
    module: schedule_comic_exports
  },
  "routes/contribute/join-us/index": {
    id: "routes/contribute/join-us/index",
    parentId: "root",
    path: "contribute/join-us",
    index: !0,
    caseSensitive: void 0,
    module: join_us_exports
  },
  "routes/api/admin/assign-action": {
    id: "routes/api/admin/assign-action",
    parentId: "root",
    path: "api/admin/assign-action",
    index: void 0,
    caseSensitive: void 0,
    module: assign_action_exports
  },
  "routes/api/admin/manage-artist": {
    id: "routes/api/admin/manage-artist",
    parentId: "root",
    path: "api/admin/manage-artist",
    index: void 0,
    caseSensitive: void 0,
    module: manage_artist_exports
  },
  "routes/api/admin/publish-comic": {
    id: "routes/api/admin/publish-comic",
    parentId: "root",
    path: "api/admin/publish-comic",
    index: void 0,
    caseSensitive: void 0,
    module: publish_comic_exports
  },
  "routes/contribute/upload/index": {
    id: "routes/contribute/upload/index",
    parentId: "root",
    path: "contribute/upload",
    index: !0,
    caseSensitive: void 0,
    module: upload_exports
  },
  "routes/contribute/upload/step1": {
    id: "routes/contribute/upload/step1",
    parentId: "root",
    path: "contribute/upload/step1",
    index: void 0,
    caseSensitive: void 0,
    module: step1_exports
  },
  "routes/api/admin/relist-comic": {
    id: "routes/api/admin/relist-comic",
    parentId: "root",
    path: "api/admin/relist-comic",
    index: void 0,
    caseSensitive: void 0,
    module: relist_comic_exports
  },
  "routes/api/admin/unlist-comic": {
    id: "routes/api/admin/unlist-comic",
    parentId: "root",
    path: "api/admin/unlist-comic",
    index: void 0,
    caseSensitive: void 0,
    module: unlist_comic_exports
  },
  "routes/api/upload-comic-pages": {
    id: "routes/api/upload-comic-pages",
    parentId: "root",
    path: "api/upload-comic-pages",
    index: void 0,
    caseSensitive: void 0,
    module: upload_comic_pages_exports
  },
  "routes/api/funcs/get-artists": {
    id: "routes/api/funcs/get-artists",
    parentId: "root",
    path: "api/funcs/get-artists",
    index: void 0,
    caseSensitive: void 0,
    module: get_artists_exports
  },
  "routes/api/funcs/get-artist": {
    id: "routes/api/funcs/get-artist",
    parentId: "root",
    path: "api/funcs/get-artist",
    index: void 0,
    caseSensitive: void 0,
    module: get_artist_exports
  },
  "routes/api/funcs/get-comics": {
    id: "routes/api/funcs/get-comics",
    parentId: "root",
    path: "api/funcs/get-comics",
    index: void 0,
    caseSensitive: void 0,
    module: get_comics_exports
  },
  "routes/api/funcs/get-comic": {
    id: "routes/api/funcs/get-comic",
    parentId: "root",
    path: "api/funcs/get-comic",
    index: void 0,
    caseSensitive: void 0,
    module: get_comic_exports
  },
  "routes/api/funcs/get-tags": {
    id: "routes/api/funcs/get-tags",
    parentId: "root",
    path: "api/funcs/get-tags",
    index: void 0,
    caseSensitive: void 0,
    module: get_tags_exports
  },
  "routes/contribute/index": {
    id: "routes/contribute/index",
    parentId: "root",
    path: "contribute",
    index: !0,
    caseSensitive: void 0,
    module: contribute_exports
  },
  "routes/api/set-theme": {
    id: "routes/api/set-theme",
    parentId: "root",
    path: "api/set-theme",
    index: void 0,
    caseSensitive: void 0,
    module: set_theme_exports
  },
  "routes/admin/dashboard/PendingComicProblem": {
    id: "routes/admin/dashboard/PendingComicProblem",
    parentId: "routes/admin",
    path: "dashboard/PendingComicProblem",
    index: void 0,
    caseSensitive: void 0,
    module: PendingComicProblem_exports
  },
  "routes/admin/dashboard/ComicSuggestion": {
    id: "routes/admin/dashboard/ComicSuggestion",
    parentId: "routes/admin",
    path: "dashboard/ComicSuggestion",
    index: void 0,
    caseSensitive: void 0,
    module: ComicSuggestion_exports
  },
  "routes/admin/dashboard/TagSuggestion": {
    id: "routes/admin/dashboard/TagSuggestion",
    parentId: "routes/admin",
    path: "dashboard/TagSuggestion",
    index: void 0,
    caseSensitive: void 0,
    module: TagSuggestion_exports
  },
  "routes/admin/dashboard/ComicProblem": {
    id: "routes/admin/dashboard/ComicProblem",
    parentId: "routes/admin",
    path: "dashboard/ComicProblem",
    index: void 0,
    caseSensitive: void 0,
    module: ComicProblem_exports
  },
  "routes/admin/dashboard/ComicUpload": {
    id: "routes/admin/dashboard/ComicUpload",
    parentId: "routes/admin",
    path: "dashboard/ComicUpload",
    index: void 0,
    caseSensitive: void 0,
    module: ComicUpload_exports
  },
  "routes/admin/dashboard/index": {
    id: "routes/admin/dashboard/index",
    parentId: "routes/admin",
    path: "dashboard",
    index: !0,
    caseSensitive: void 0,
    module: dashboard_exports
  },
  "routes/admin/pending-comics": {
    id: "routes/admin/pending-comics",
    parentId: "routes/admin",
    path: "pending-comics",
    index: void 0,
    caseSensitive: void 0,
    module: pending_comics_exports
  },
  "routes/admin/thumbnails": {
    id: "routes/admin/thumbnails",
    parentId: "routes/admin",
    path: "thumbnails",
    index: void 0,
    caseSensitive: void 0,
    module: thumbnails_exports
  },
  "routes/admin/artists": {
    id: "routes/admin/artists",
    parentId: "routes/admin",
    path: "artists",
    index: void 0,
    caseSensitive: void 0,
    module: artists_exports
  },
  "routes/admin/artists/$artist": {
    id: "routes/admin/artists/$artist",
    parentId: "routes/admin/artists",
    path: ":artist",
    index: void 0,
    caseSensitive: void 0,
    module: artist_exports
  },
  "routes/admin/comics": {
    id: "routes/admin/comics",
    parentId: "routes/admin",
    path: "comics",
    index: void 0,
    caseSensitive: void 0,
    module: comics_exports
  },
  "routes/admin/comics/AnonUploadedComicSection": {
    id: "routes/admin/comics/AnonUploadedComicSection",
    parentId: "routes/admin/comics",
    path: "AnonUploadedComicSection",
    index: void 0,
    caseSensitive: void 0,
    module: AnonUploadedComicSection_exports
  },
  "routes/admin/comics/UserUploadedComicSection": {
    id: "routes/admin/comics/UserUploadedComicSection",
    parentId: "routes/admin/comics",
    path: "UserUploadedComicSection",
    index: void 0,
    caseSensitive: void 0,
    module: UserUploadedComicSection_exports
  },
  "routes/admin/comics/UnlistedComicSection": {
    id: "routes/admin/comics/UnlistedComicSection",
    parentId: "routes/admin/comics",
    path: "UnlistedComicSection",
    index: void 0,
    caseSensitive: void 0,
    module: UnlistedComicSection_exports
  },
  "routes/admin/comics/scheduling/Scheduled": {
    id: "routes/admin/comics/scheduling/Scheduled",
    parentId: "routes/admin/comics",
    path: "scheduling/Scheduled",
    index: void 0,
    caseSensitive: void 0,
    module: Scheduled_exports
  },
  "routes/admin/comics/PendingComicSection": {
    id: "routes/admin/comics/PendingComicSection",
    parentId: "routes/admin/comics",
    path: "PendingComicSection",
    index: void 0,
    caseSensitive: void 0,
    module: PendingComicSection_exports
  },
  "routes/admin/comics/scheduling/Schedule": {
    id: "routes/admin/comics/scheduling/Schedule",
    parentId: "routes/admin/comics",
    path: "scheduling/Schedule",
    index: void 0,
    caseSensitive: void 0,
    module: Schedule_exports
  },
  "routes/admin/comics/pending/Reject": {
    id: "routes/admin/comics/pending/Reject",
    parentId: "routes/admin/comics",
    path: "pending/Reject",
    index: void 0,
    caseSensitive: void 0,
    module: Reject_exports
  },
  "routes/admin/comics/pending/Error": {
    id: "routes/admin/comics/pending/Error",
    parentId: "routes/admin/comics",
    path: "pending/Error",
    index: void 0,
    caseSensitive: void 0,
    module: Error_exports
  },
  "routes/admin/comics/LiveComic": {
    id: "routes/admin/comics/LiveComic",
    parentId: "routes/admin/comics",
    path: "LiveComic",
    index: void 0,
    caseSensitive: void 0,
    module: LiveComic_exports
  },
  "routes/admin/comics/$comic": {
    id: "routes/admin/comics/$comic",
    parentId: "routes/admin/comics",
    path: ":comic",
    index: void 0,
    caseSensitive: void 0,
    module: comic_exports
  },
  "routes/admin/stats": {
    id: "routes/admin/stats",
    parentId: "routes/admin",
    path: "stats",
    index: void 0,
    caseSensitive: void 0,
    module: stats_exports
  },
  "routes/admin/tags": {
    id: "routes/admin/tags",
    parentId: "routes/admin",
    path: "tags",
    index: void 0,
    caseSensitive: void 0,
    module: tags_exports
  }
};

// server.ts
var handleRequest2 = (0, import_cloudflare_pages.createPagesFunctionHandler)({
  build: server_build_exports,
  mode: "development",
  getLoadContext: (context) => ({
    ...context.env
  })
});
function onRequest(context) {
  return handleRequest2(context);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  onRequest
});
//# sourceMappingURL=index.js.map
