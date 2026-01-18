var st = Object.defineProperty, rt = Object.defineProperties, ot = Object.getOwnPropertyDescriptors, _e = Object.getOwnPropertySymbols, it = Object.prototype.hasOwnProperty, at = Object.prototype.propertyIsEnumerable, Se = (t, e, n) => e in t ? st(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, N = (t, e) => {
  for (var n in e || (e = {}))
    it.call(e, n) && Se(t, n, e[n]);
  if (_e)
    for (var n of _e(e))
      at.call(e, n) && Se(t, n, e[n]);
  return t;
}, U = (t, e) => rt(t, ot(e)), lt = class extends Error {
  constructor(t, e, n) {
    super(e || t.toString(), {
      cause: n
    }), this.status = t, this.statusText = e, this.error = n;
  }
}, ct = async (t, e) => {
  var n, s, r, i, o, l;
  let a = e || {};
  const c = {
    onRequest: [e == null ? void 0 : e.onRequest],
    onResponse: [e == null ? void 0 : e.onResponse],
    onSuccess: [e == null ? void 0 : e.onSuccess],
    onError: [e == null ? void 0 : e.onError],
    onRetry: [e == null ? void 0 : e.onRetry]
  };
  if (!e || !(e != null && e.plugins))
    return {
      url: t,
      options: a,
      hooks: c
    };
  for (const d of (e == null ? void 0 : e.plugins) || []) {
    if (d.init) {
      const h = await ((n = d.init) == null ? void 0 : n.call(d, t.toString(), e));
      a = h.options || a, t = h.url;
    }
    c.onRequest.push((s = d.hooks) == null ? void 0 : s.onRequest), c.onResponse.push((r = d.hooks) == null ? void 0 : r.onResponse), c.onSuccess.push((i = d.hooks) == null ? void 0 : i.onSuccess), c.onError.push((o = d.hooks) == null ? void 0 : o.onError), c.onRetry.push((l = d.hooks) == null ? void 0 : l.onRetry);
  }
  return {
    url: t,
    options: a,
    hooks: c
  };
}, Te = class {
  constructor(t) {
    this.options = t;
  }
  shouldAttemptRetry(t, e) {
    return this.options.shouldRetry ? Promise.resolve(
      t < this.options.attempts && this.options.shouldRetry(e)
    ) : Promise.resolve(t < this.options.attempts);
  }
  getDelay() {
    return this.options.delay;
  }
}, dt = class {
  constructor(t) {
    this.options = t;
  }
  shouldAttemptRetry(t, e) {
    return this.options.shouldRetry ? Promise.resolve(
      t < this.options.attempts && this.options.shouldRetry(e)
    ) : Promise.resolve(t < this.options.attempts);
  }
  getDelay(t) {
    return Math.min(
      this.options.maxDelay,
      this.options.baseDelay * 2 ** t
    );
  }
};
function ut(t) {
  if (typeof t == "number")
    return new Te({
      type: "linear",
      attempts: t,
      delay: 1e3
    });
  switch (t.type) {
    case "linear":
      return new Te(t);
    case "exponential":
      return new dt(t);
    default:
      throw new Error("Invalid retry strategy");
  }
}
var ht = async (t) => {
  const e = {}, n = async (s) => typeof s == "function" ? await s() : s;
  if (t != null && t.auth) {
    if (t.auth.type === "Bearer") {
      const s = await n(t.auth.token);
      if (!s)
        return e;
      e.authorization = `Bearer ${s}`;
    } else if (t.auth.type === "Basic") {
      const s = n(t.auth.username), r = n(t.auth.password);
      if (!s || !r)
        return e;
      e.authorization = `Basic ${btoa(`${s}:${r}`)}`;
    } else if (t.auth.type === "Custom") {
      const s = n(t.auth.value);
      if (!s)
        return e;
      e.authorization = `${n(t.auth.prefix)} ${s}`;
    }
  }
  return e;
}, ft = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function pt(t) {
  const e = t.headers.get("content-type"), n = /* @__PURE__ */ new Set([
    "image/svg",
    "application/xml",
    "application/xhtml",
    "application/html"
  ]);
  if (!e)
    return "json";
  const s = e.split(";").shift() || "";
  return ft.test(s) ? "json" : n.has(s) || s.startsWith("text/") ? "text" : "blob";
}
function mt(t) {
  try {
    return JSON.parse(t), !0;
  } catch {
    return !1;
  }
}
function Fe(t) {
  if (t === void 0)
    return !1;
  const e = typeof t;
  return e === "string" || e === "number" || e === "boolean" || e === null ? !0 : e !== "object" ? !1 : Array.isArray(t) ? !0 : t.buffer ? !1 : t.constructor && t.constructor.name === "Object" || typeof t.toJSON == "function";
}
function ke(t) {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
function Re(t) {
  return typeof t == "function";
}
function gt(t) {
  if (t != null && t.customFetchImpl)
    return t.customFetchImpl;
  if (typeof globalThis < "u" && Re(globalThis.fetch))
    return globalThis.fetch;
  if (typeof window < "u" && Re(window.fetch))
    return window.fetch;
  throw new Error("No fetch implementation found");
}
async function wt(t) {
  const e = new Headers(t == null ? void 0 : t.headers), n = await ht(t);
  for (const [s, r] of Object.entries(n || {}))
    e.set(s, r);
  if (!e.has("content-type")) {
    const s = yt(t == null ? void 0 : t.body);
    s && e.set("content-type", s);
  }
  return e;
}
function yt(t) {
  return Fe(t) ? "application/json" : null;
}
function bt(t) {
  if (!(t != null && t.body))
    return null;
  const e = new Headers(t == null ? void 0 : t.headers);
  if (Fe(t.body) && !e.has("content-type")) {
    for (const [n, s] of Object.entries(t == null ? void 0 : t.body))
      s instanceof Date && (t.body[n] = s.toISOString());
    return JSON.stringify(t.body);
  }
  return t.body;
}
function Et(t, e) {
  var n;
  if (e != null && e.method)
    return e.method.toUpperCase();
  if (t.startsWith("@")) {
    const s = (n = t.split("@")[1]) == null ? void 0 : n.split("/")[0];
    return Ge.includes(s) ? s.toUpperCase() : e != null && e.body ? "POST" : "GET";
  }
  return e != null && e.body ? "POST" : "GET";
}
function Ct(t, e) {
  let n;
  return !(t != null && t.signal) && (t != null && t.timeout) && (n = setTimeout(() => e == null ? void 0 : e.abort(), t == null ? void 0 : t.timeout)), {
    abortTimeout: n,
    clearTimeout: () => {
      n && clearTimeout(n);
    }
  };
}
var vt = class qe extends Error {
  constructor(e, n) {
    super(n || JSON.stringify(e, null, 2)), this.issues = e, Object.setPrototypeOf(this, qe.prototype);
  }
};
async function re(t, e) {
  let n = await t["~standard"].validate(e);
  if (n.issues)
    throw new vt(n.issues);
  return n.value;
}
var Ge = ["get", "post", "put", "patch", "delete"], _t = (t) => ({
  id: "apply-schema",
  name: "Apply Schema",
  version: "1.0.0",
  async init(e, n) {
    var s, r, i, o;
    const l = ((r = (s = t.plugins) == null ? void 0 : s.find(
      (a) => {
        var c;
        return (c = a.schema) != null && c.config ? e.startsWith(a.schema.config.baseURL || "") || e.startsWith(a.schema.config.prefix || "") : !1;
      }
    )) == null ? void 0 : r.schema) || t.schema;
    if (l) {
      let a = e;
      (i = l.config) != null && i.prefix && a.startsWith(l.config.prefix) && (a = a.replace(l.config.prefix, ""), l.config.baseURL && (e = e.replace(l.config.prefix, l.config.baseURL))), (o = l.config) != null && o.baseURL && a.startsWith(l.config.baseURL) && (a = a.replace(l.config.baseURL, ""));
      const c = l.schema[a];
      if (c) {
        let d = U(N({}, n), {
          method: c.method,
          output: c.output
        });
        return n != null && n.disableValidation || (d = U(N({}, d), {
          body: c.input ? await re(c.input, n == null ? void 0 : n.body) : n == null ? void 0 : n.body,
          params: c.params ? await re(c.params, n == null ? void 0 : n.params) : n == null ? void 0 : n.params,
          query: c.query ? await re(c.query, n == null ? void 0 : n.query) : n == null ? void 0 : n.query
        })), {
          url: e,
          options: d
        };
      }
    }
    return {
      url: e,
      options: n
    };
  }
}), St = (t) => {
  async function e(n, s) {
    const r = U(N(N({}, t), s), {
      plugins: [...(t == null ? void 0 : t.plugins) || [], _t(t || {})]
    });
    if (t != null && t.catchAllError)
      try {
        return await me(n, r);
      } catch (i) {
        return {
          data: null,
          error: {
            status: 500,
            statusText: "Fetch Error",
            message: "Fetch related error. Captured by catchAllError option. See error property for more details.",
            error: i
          }
        };
      }
    return await me(n, r);
  }
  return e;
};
function Tt(t, e) {
  let { baseURL: n, params: s, query: r } = e || {
    query: {},
    params: {},
    baseURL: ""
  }, i = t.startsWith("http") ? t.split("/").slice(0, 3).join("/") : n || "";
  if (t.startsWith("@")) {
    const h = t.toString().split("@")[1].split("/")[0];
    Ge.includes(h) && (t = t.replace(`@${h}/`, "/"));
  }
  i.endsWith("/") || (i += "/");
  let [o, l] = t.replace(i, "").split("?");
  const a = new URLSearchParams(l);
  for (const [h, p] of Object.entries(r || {}))
    p != null && a.set(h, String(p));
  if (s)
    if (Array.isArray(s)) {
      const h = o.split("/").filter((p) => p.startsWith(":"));
      for (const [p, m] of h.entries()) {
        const y = s[p];
        o = o.replace(m, y);
      }
    } else
      for (const [h, p] of Object.entries(s))
        o = o.replace(`:${h}`, String(p));
  o = o.split("/").map(encodeURIComponent).join("/"), o.startsWith("/") && (o = o.slice(1));
  let c = a.toString();
  return c = c.length > 0 ? `?${c}`.replace(/\+/g, "%20") : "", i.startsWith("http") ? new URL(`${o}${c}`, i) : `${i}${o}${c}`;
}
var me = async (t, e) => {
  var n, s, r, i, o, l, a, c;
  const {
    hooks: d,
    url: h,
    options: p
  } = await ct(t, e), m = gt(p), y = new AbortController(), w = (n = p.signal) != null ? n : y.signal, f = Tt(h, p), b = bt(p), v = await wt(p), S = Et(h, p);
  let g = U(N({}, p), {
    url: f,
    headers: v,
    body: b,
    method: S,
    signal: w
  });
  for (const P of d.onRequest)
    if (P) {
      const R = await P(g);
      R instanceof Object && (g = R);
    }
  ("pipeTo" in g && typeof g.pipeTo == "function" || typeof ((s = e == null ? void 0 : e.body) == null ? void 0 : s.pipe) == "function") && ("duplex" in g || (g.duplex = "half"));
  const { clearTimeout: _ } = Ct(p, y);
  let E = await m(g.url, g);
  _();
  const I = {
    response: E,
    request: g
  };
  for (const P of d.onResponse)
    if (P) {
      const R = await P(U(N({}, I), {
        response: (r = e == null ? void 0 : e.hookOptions) != null && r.cloneResponse ? E.clone() : E
      }));
      R instanceof Response ? E = R : R instanceof Object && (E = R.response);
    }
  if (E.ok) {
    if (!(g.method !== "HEAD"))
      return {
        data: "",
        error: null
      };
    const R = pt(E), B = {
      data: "",
      response: E,
      request: g
    };
    if (R === "json" || R === "text") {
      const V = await E.text(), nt = await ((i = g.jsonParser) != null ? i : ke)(V);
      B.data = nt;
    } else
      B.data = await E[R]();
    g != null && g.output && g.output && !g.disableValidation && (B.data = await re(
      g.output,
      B.data
    ));
    for (const V of d.onSuccess)
      V && await V(U(N({}, B), {
        response: (o = e == null ? void 0 : e.hookOptions) != null && o.cloneResponse ? E.clone() : E
      }));
    return e != null && e.throw ? B.data : {
      data: B.data,
      error: null
    };
  }
  const ee = (l = e == null ? void 0 : e.jsonParser) != null ? l : ke, j = await E.text(), J = mt(j), C = J ? await ee(j) : null, ae = {
    response: E,
    responseText: j,
    request: g,
    error: U(N({}, C), {
      status: E.status,
      statusText: E.statusText
    })
  };
  for (const P of d.onError)
    P && await P(U(N({}, ae), {
      response: (a = e == null ? void 0 : e.hookOptions) != null && a.cloneResponse ? E.clone() : E
    }));
  if (e != null && e.retry) {
    const P = ut(e.retry), R = (c = e.retryAttempt) != null ? c : 0;
    if (await P.shouldAttemptRetry(R, E)) {
      for (const V of d.onRetry)
        V && await V(I);
      const B = P.getDelay(R);
      return await new Promise((V) => setTimeout(V, B)), await me(t, U(N({}, e), {
        retryAttempt: R + 1
      }));
    }
  }
  if (e != null && e.throw)
    throw new lt(
      E.status,
      E.statusText,
      J ? C : j
    );
  return {
    data: null,
    error: U(N({}, C), {
      status: E.status,
      statusText: E.statusText
    })
  };
};
const oe = /* @__PURE__ */ Object.create(null), K = (t) => {
  var e, n;
  return ((e = globalThis.process) == null ? void 0 : e.env) || //@ts-expect-error
  ((n = globalThis.Deno) == null ? void 0 : n.env.toObject()) || //@ts-expect-error
  globalThis.__env__ || (t ? oe : globalThis);
}, x = new Proxy(oe, {
  get(t, e) {
    return K()[e] ?? oe[e];
  },
  has(t, e) {
    const n = K();
    return e in n || e in oe;
  },
  set(t, e, n) {
    const s = K(!0);
    return s[e] = n, !0;
  },
  deleteProperty(t, e) {
    if (!e)
      return !1;
    const n = K(!0);
    return delete n[e], !0;
  },
  ownKeys() {
    const t = K(!0);
    return Object.keys(t);
  }
});
typeof process < "u" && process.env && process.env.NODE_ENV;
function T(t, e) {
  return typeof process < "u" && process.env ? process.env[t] ?? e : typeof Deno < "u" ? Deno.env.get(t) ?? e : typeof Bun < "u" ? Bun.env[t] ?? e : e;
}
const Q = 1, k = 4, M = 8, L = 24, Ie = {
  eterm: k,
  cons25: k,
  console: k,
  cygwin: k,
  dtterm: k,
  gnome: k,
  hurd: k,
  jfbterm: k,
  konsole: k,
  kterm: k,
  mlterm: k,
  mosh: L,
  putty: k,
  st: k,
  // http://lists.schmorp.de/pipermail/rxvt-unicode/2016q2/002261.html
  "rxvt-unicode-24bit": L,
  // https://bugs.launchpad.net/terminator/+bug/1030562
  terminator: L,
  "xterm-kitty": L
}, kt = new Map(
  Object.entries({
    APPVEYOR: M,
    BUILDKITE: M,
    CIRCLECI: L,
    DRONE: M,
    GITEA_ACTIONS: L,
    GITHUB_ACTIONS: L,
    GITLAB_CI: M,
    TRAVIS: M
  })
), Rt = [
  /ansi/,
  /color/,
  /linux/,
  /direct/,
  /^con[0-9]*x[0-9]/,
  /^rxvt/,
  /^screen/,
  /^xterm/,
  /^vt100/,
  /^vt220/
];
function It() {
  if (T("FORCE_COLOR") !== void 0)
    switch (T("FORCE_COLOR")) {
      case "":
      case "1":
      case "true":
        return k;
      case "2":
        return M;
      case "3":
        return L;
      default:
        return Q;
    }
  if (T("NODE_DISABLE_COLORS") !== void 0 && T("NODE_DISABLE_COLORS") !== "" || // See https://no-color.org/
  T("NO_COLOR") !== void 0 && T("NO_COLOR") !== "" || // The "dumb" special terminal, as defined by terminfo, doesn't support
  // ANSI color control codes.
  // See https://invisible-island.net/ncurses/terminfo.ti.html#toc-_Specials
  T("TERM") === "dumb")
    return Q;
  if (T("TMUX"))
    return L;
  if ("TF_BUILD" in x && "AGENT_NAME" in x)
    return k;
  if ("CI" in x) {
    for (const { 0: t, 1: e } of kt)
      if (t in x)
        return e;
    return T("CI_NAME") === "codeship" ? M : Q;
  }
  if ("TEAMCITY_VERSION" in x)
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.exec(
      T("TEAMCITY_VERSION")
    ) !== null ? k : Q;
  switch (T("TERM_PROGRAM")) {
    case "iTerm.app":
      return !T("TERM_PROGRAM_VERSION") || /^[0-2]\./.exec(T("TERM_PROGRAM_VERSION")) !== null ? M : L;
    case "HyperTerm":
    case "MacTerm":
      return L;
    case "Apple_Terminal":
      return M;
  }
  if (T("COLORTERM") === "truecolor" || T("COLORTERM") === "24bit")
    return L;
  if (T("TERM")) {
    if (/truecolor/.exec(T("TERM")) !== null)
      return L;
    if (/^xterm-256/.exec(T("TERM")) !== null)
      return M;
    const t = T("TERM").toLowerCase();
    if (Ie[t])
      return Ie[t];
    if (Rt.some((e) => e.exec(t) !== null))
      return k;
  }
  return T("COLORTERM") ? k : Q;
}
const D = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  fg: {
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m"
  }
}, ge = ["info", "success", "warn", "error", "debug"];
function Lt(t, e) {
  return ge.indexOf(e) <= ge.indexOf(t);
}
const Pt = {
  info: D.fg.blue,
  success: D.fg.green,
  warn: D.fg.yellow,
  error: D.fg.red,
  debug: D.fg.magenta
}, xt = (t, e, n) => {
  const s = (/* @__PURE__ */ new Date()).toISOString();
  return n ? `${D.dim}${s}${D.reset} ${Pt[t]}${t.toUpperCase()}${D.reset} ${D.bright}[Better Auth]:${D.reset} ${e}` : `${s} ${t.toUpperCase()} [Better Auth]: ${e}`;
}, At = (t) => {
  const e = "error", n = It() !== 1, s = (i, o, l = []) => {
    if (!Lt(e, i))
      return;
    const a = xt(i, o, n);
    {
      i === "error" ? console.error(a, ...l) : i === "warn" ? console.warn(a, ...l) : console.log(a, ...l);
      return;
    }
  };
  return {
    ...Object.fromEntries(
      ge.map((i) => [
        i,
        (...[o, ...l]) => s(i, o, l)
      ])
    ),
    get level() {
      return e;
    }
  };
};
At();
class Ot extends Error {
  constructor(e, n) {
    super(e), this.name = "BetterAuthError", this.message = e, this.cause = n, this.stack = "";
  }
}
function Nt(t) {
  try {
    return (new URL(t).pathname.replace(/\/+$/, "") || "/") !== "/";
  } catch {
    throw new Ot(
      `Invalid base URL: ${t}. Please provide a valid base URL.`
    );
  }
}
function le(t, e = "/api/auth") {
  if (Nt(t))
    return t;
  const s = t.replace(/\/+$/, "");
  return !e || e === "/" ? s : (e = e.startsWith("/") ? e : `/${e}`, `${s}${e}`);
}
function Ut(t, e, n, s) {
  if (t)
    return le(t, e);
  {
    const r = x.BETTER_AUTH_URL || x.NEXT_PUBLIC_BETTER_AUTH_URL || x.PUBLIC_BETTER_AUTH_URL || x.NUXT_PUBLIC_BETTER_AUTH_URL || x.NUXT_PUBLIC_AUTH_URL || (x.BASE_URL !== "/" ? x.BASE_URL : void 0);
    if (r)
      return le(r, e);
  }
  if (typeof window < "u" && window.location)
    return le(window.location.origin, e);
}
let we = Symbol("clean"), A = [], q = 0;
const te = 4;
let He = (t) => {
  let e = [], n = {
    get() {
      return n.lc || n.listen(() => {
      })(), n.value;
    },
    lc: 0,
    listen(s) {
      return n.lc = e.push(s), () => {
        for (let i = q + te; i < A.length; )
          A[i] === s ? A.splice(i, te) : i += te;
        let r = e.indexOf(s);
        ~r && (e.splice(r, 1), --n.lc || n.off());
      };
    },
    notify(s, r) {
      let i = !A.length;
      for (let o of e)
        A.push(o, n.value, s, r);
      if (i) {
        for (q = 0; q < A.length; q += te)
          A[q](
            A[q + 1],
            A[q + 2],
            A[q + 3]
          );
        A.length = 0;
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(s) {
      let r = n.value;
      r !== s && (n.value = s, n.notify(r));
    },
    subscribe(s) {
      let r = n.listen(s);
      return s(n.value), r;
    },
    value: t
  };
  return process.env.NODE_ENV !== "production" && (n[we] = () => {
    e = [], n.lc = 0, n.off();
  }), n;
};
const Mt = 5, W = 6, ne = 10;
let Dt = (t, e, n, s) => (t.events = t.events || {}, t.events[n + ne] || (t.events[n + ne] = s((r) => {
  t.events[n].reduceRight((i, o) => (o(i), i), {
    shared: {},
    ...r
  });
})), t.events[n] = t.events[n] || [], t.events[n].push(e), () => {
  let r = t.events[n], i = r.indexOf(e);
  r.splice(i, 1), r.length || (delete t.events[n], t.events[n + ne](), delete t.events[n + ne]);
}), Bt = 1e3, Vt = (t, e) => Dt(t, (s) => {
  let r = e(s);
  r && t.events[W].push(r);
}, Mt, (s) => {
  let r = t.listen;
  t.listen = (...o) => (!t.lc && !t.active && (t.active = !0, s()), r(...o));
  let i = t.off;
  if (t.events[W] = [], t.off = () => {
    i(), setTimeout(() => {
      if (t.active && !t.lc) {
        t.active = !1;
        for (let o of t.events[W]) o();
        t.events[W] = [];
      }
    }, Bt);
  }, process.env.NODE_ENV !== "production") {
    let o = t[we];
    t[we] = () => {
      for (let l of t.events[W]) l();
      t.events[W] = [], t.active = !1, o();
    };
  }
  return () => {
    t.listen = r, t.off = i;
  };
});
const $t = typeof window > "u", Ft = (t, e, n, s) => {
  const r = He({
    data: null,
    error: null,
    isPending: !0,
    isRefetching: !1,
    refetch: (l) => i(l)
  }), i = (l) => {
    const a = typeof s == "function" ? s({
      data: r.get().data,
      error: r.get().error,
      isPending: r.get().isPending
    }) : s;
    n(e, {
      ...a,
      query: {
        ...a == null ? void 0 : a.query,
        ...l == null ? void 0 : l.query
      },
      async onSuccess(c) {
        var d;
        r.set({
          data: c.data,
          error: null,
          isPending: !1,
          isRefetching: !1,
          refetch: r.value.refetch
        }), await ((d = a == null ? void 0 : a.onSuccess) == null ? void 0 : d.call(a, c));
      },
      async onError(c) {
        var m, y;
        const { request: d } = c, h = typeof d.retry == "number" ? d.retry : (m = d.retry) == null ? void 0 : m.attempts, p = d.retryAttempt || 0;
        h && p < h || (r.set({
          error: c.error,
          data: null,
          isPending: !1,
          isRefetching: !1,
          refetch: r.value.refetch
        }), await ((y = a == null ? void 0 : a.onError) == null ? void 0 : y.call(a, c)));
      },
      async onRequest(c) {
        var h;
        const d = r.get();
        r.set({
          isPending: d.data === null,
          data: d.data,
          error: null,
          isRefetching: !0,
          refetch: r.value.refetch
        }), await ((h = a == null ? void 0 : a.onRequest) == null ? void 0 : h.call(a, c));
      }
    }).catch((c) => {
      r.set({
        error: c,
        data: null,
        isPending: !1,
        isRefetching: !1,
        refetch: r.value.refetch
      });
    });
  };
  t = Array.isArray(t) ? t : [t];
  let o = !1;
  for (const l of t)
    l.subscribe(() => {
      $t || (o ? i() : Vt(r, () => {
        const a = setTimeout(() => {
          o || (i(), o = !0);
        }, 0);
        return () => {
          r.off(), l.off(), clearTimeout(a);
        };
      }));
    });
  return r;
}, qt = {
  proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
  constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
  protoShort: /"__proto__"\s*:/,
  constructorShort: /"constructor"\s*:/
}, Gt = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/, Le = {
  true: !0,
  false: !1,
  null: null,
  undefined: void 0,
  nan: Number.NaN,
  infinity: Number.POSITIVE_INFINITY,
  "-infinity": Number.NEGATIVE_INFINITY
}, Ht = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function jt(t) {
  return t instanceof Date && !isNaN(t.getTime());
}
function Wt(t) {
  const e = Ht.exec(t);
  if (!e) return null;
  const [
    ,
    n,
    s,
    r,
    i,
    o,
    l,
    a,
    c,
    d,
    h
  ] = e;
  let p = new Date(
    Date.UTC(
      parseInt(n, 10),
      parseInt(s, 10) - 1,
      parseInt(r, 10),
      parseInt(i, 10),
      parseInt(o, 10),
      parseInt(l, 10),
      a ? parseInt(a.padEnd(3, "0"), 10) : 0
    )
  );
  if (c) {
    const m = (parseInt(d, 10) * 60 + parseInt(h, 10)) * (c === "+" ? -1 : 1);
    p.setUTCMinutes(p.getUTCMinutes() + m);
  }
  return jt(p) ? p : null;
}
function Yt(t, e = {}) {
  const {
    strict: n = !1,
    warnings: s = !1,
    reviver: r,
    parseDates: i = !0
  } = e;
  if (typeof t != "string")
    return t;
  const o = t.trim();
  if (o.length > 0 && o[0] === '"' && o.endsWith('"') && !o.slice(1, -1).includes('"'))
    return o.slice(1, -1);
  const l = o.toLowerCase();
  if (l.length <= 9 && l in Le)
    return Le[l];
  if (!Gt.test(o)) {
    if (n)
      throw new SyntaxError("[better-json] Invalid JSON");
    return t;
  }
  if (Object.entries(qt).some(
    ([c, d]) => {
      const h = d.test(o);
      return h && s && console.warn(
        `[better-json] Detected potential prototype pollution attempt using ${c} pattern`
      ), h;
    }
  ) && n)
    throw new Error(
      "[better-json] Potential prototype pollution attempt detected"
    );
  try {
    return JSON.parse(o, (d, h) => {
      if (d === "__proto__" || d === "constructor" && h && typeof h == "object" && "prototype" in h) {
        s && console.warn(
          `[better-json] Dropping "${d}" key to prevent prototype pollution`
        );
        return;
      }
      if (i && typeof h == "string") {
        const p = Wt(h);
        if (p)
          return p;
      }
      return r ? r(d, h) : h;
    });
  } catch (c) {
    if (n)
      throw c;
    return t;
  }
}
function zt(t, e = { strict: !0 }) {
  return Yt(t, e);
}
const Xt = {
  id: "redirect",
  name: "Redirect",
  hooks: {
    onSuccess(t) {
      var e, n;
      if ((e = t.data) != null && e.url && ((n = t.data) != null && n.redirect) && typeof window < "u" && window.location && window.location)
        try {
          window.location.href = t.data.url;
        } catch {
        }
    }
  }
};
function Jt(t) {
  const e = He(!1);
  return {
    session: Ft(e, "/get-session", t, {
      method: "GET"
    }),
    $sessionSignal: e
  };
}
const Kt = (t, e) => {
  var g, _, E, I, ee, j, J;
  const n = "credentials" in Request.prototype, s = Ut(t == null ? void 0 : t.baseURL, t == null ? void 0 : t.basePath) ?? "/api/auth", r = ((g = t == null ? void 0 : t.plugins) == null ? void 0 : g.flatMap((C) => C.fetchPlugins).filter((C) => C !== void 0)) || [], i = {
    id: "lifecycle-hooks",
    name: "lifecycle-hooks",
    hooks: {
      onSuccess: (_ = t == null ? void 0 : t.fetchOptions) == null ? void 0 : _.onSuccess,
      onError: (E = t == null ? void 0 : t.fetchOptions) == null ? void 0 : E.onError,
      onRequest: (I = t == null ? void 0 : t.fetchOptions) == null ? void 0 : I.onRequest,
      onResponse: (ee = t == null ? void 0 : t.fetchOptions) == null ? void 0 : ee.onResponse
    }
  }, { onSuccess: o, onError: l, onRequest: a, onResponse: c, ...d } = (t == null ? void 0 : t.fetchOptions) || {}, h = St({
    baseURL: s,
    ...n ? { credentials: "include" } : {},
    method: "GET",
    jsonParser(C) {
      return C ? zt(C, {
        strict: !1
      }) : null;
    },
    customFetchImpl: fetch,
    ...d,
    plugins: [
      i,
      ...d.plugins || [],
      ...t != null && t.disableDefaultFetchPlugins ? [] : [Xt],
      ...r
    ]
  }), { $sessionSignal: p, session: m } = Jt(h), y = (t == null ? void 0 : t.plugins) || [];
  let w = {}, f = {
    $sessionSignal: p,
    session: m
  }, b = {
    "/sign-out": "POST",
    "/revoke-sessions": "POST",
    "/revoke-other-sessions": "POST",
    "/delete-user": "POST"
  };
  const v = [
    {
      signal: "$sessionSignal",
      matcher(C) {
        return C === "/sign-out" || C === "/update-user" || C.startsWith("/sign-in") || C.startsWith("/sign-up") || C === "/delete-user" || C === "/verify-email";
      }
    }
  ];
  for (const C of y)
    C.getAtoms && Object.assign(f, (j = C.getAtoms) == null ? void 0 : j.call(C, h)), C.pathMethods && Object.assign(b, C.pathMethods), C.atomListeners && v.push(...C.atomListeners);
  const S = {
    notify: (C) => {
      f[C].set(
        !f[C].get()
      );
    },
    listen: (C, ae) => {
      f[C].subscribe(ae);
    },
    atoms: f
  };
  for (const C of y)
    C.getActions && Object.assign(
      w,
      (J = C.getActions) == null ? void 0 : J.call(C, h, S, t)
    );
  return {
    get baseURL() {
      return s;
    },
    pluginsActions: w,
    pluginsAtoms: f,
    pluginPathMethods: b,
    atomListeners: v,
    $fetch: h,
    $store: S
  };
};
function Qt(t) {
  return typeof t == "object" && t !== null && "get" in t && typeof t.get == "function" && "lc" in t && typeof t.lc == "number";
}
function Zt(t, e, n) {
  const s = e[t], { fetchOptions: r, query: i, ...o } = n || {};
  return s || (r != null && r.method ? r.method : o && Object.keys(o).length > 0 ? "POST" : "GET");
}
function en(t, e, n, s, r) {
  function i(o = []) {
    return new Proxy(function() {
    }, {
      get(l, a) {
        if (typeof a != "string" || a === "then" || a === "catch" || a === "finally")
          return;
        const c = [...o, a];
        let d = t;
        for (const h of c)
          if (d && typeof d == "object" && h in d)
            d = d[h];
          else {
            d = void 0;
            break;
          }
        return typeof d == "function" || Qt(d) ? d : i(c);
      },
      apply: async (l, a, c) => {
        const d = "/" + o.map(
          (v) => v.replace(/[A-Z]/g, (S) => `-${S.toLowerCase()}`)
        ).join("/"), h = c[0] || {}, p = c[1] || {}, { query: m, fetchOptions: y, ...w } = h, f = {
          ...p,
          ...y
        }, b = Zt(d, n, h);
        return await e(d, {
          ...f,
          body: b === "GET" ? void 0 : {
            ...w,
            ...(f == null ? void 0 : f.body) || {}
          },
          query: m || (f == null ? void 0 : f.query),
          method: b,
          async onSuccess(v) {
            var g;
            if (await ((g = f == null ? void 0 : f.onSuccess) == null ? void 0 : g.call(f, v)), !r) return;
            const S = r.filter((_) => _.matcher(d));
            if (S.length)
              for (const _ of S) {
                const E = s[_.signal];
                if (!E) return;
                const I = E.get();
                setTimeout(() => {
                  E.set(!I);
                }, 10);
              }
          }
        });
      }
    });
  }
  return i();
}
function tn(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function nn(t) {
  const {
    pluginPathMethods: e,
    pluginsActions: n,
    pluginsAtoms: s,
    $fetch: r,
    atomListeners: i,
    $store: o
  } = Kt(t);
  let l = {};
  for (const [d, h] of Object.entries(s))
    l[`use${tn(d)}`] = h;
  const a = {
    ...n,
    ...l,
    $fetch: r,
    $store: o
  };
  return en(
    a,
    r,
    e,
    s,
    i
  );
}
const sn = () => ({
  id: "anonymous",
  $InferServerPlugin: {},
  pathMethods: {
    "/sign-in/anonymous": "POST"
  }
}), Z = "__EDGESPARK_CLIENT__";
function rn() {
  const t = globalThis;
  return t[Z] || (t[Z] = {}), t[Z].snapshots || (t[Z].snapshots = {}), t[Z];
}
function je(t) {
  if (typeof window > "u" || typeof fetch > "u") {
    const e = `[EDGESPARK_CLIENT] ${t} is browser-only. Detected non-browser runtime; run in a browser or provide a client-side environment before calling ${t}.`;
    throw console.warn(e), new Error(e);
  }
}
function on(t, e, n, s) {
  if (e)
    for (const r of s) {
      const i = n[r], o = e[r];
      if (!(i === void 0 || o === void 0) && !ln(o, i))
        throw an(t, r, o, i);
    }
}
function an(t, e, n, s) {
  const r = `[EDGESPARK_CLIENT] ${t} conflict on "${e}": existing=${Pe(
    n
  )}, incoming=${Pe(s)}. Destroy the existing instance before reinitializing.`;
  return new Error(r);
}
function ln(t, e) {
  if (t === e) return !0;
  if (typeof t == "object" && typeof e == "object")
    try {
      return JSON.stringify(t) === JSON.stringify(e);
    } catch {
      return !1;
    }
  return !1;
}
function Pe(t) {
  if (typeof t == "function") return t.name || "[function]";
  try {
    return JSON.stringify(t);
  } catch {
    return String(t);
  }
}
function cn() {
  if (typeof window > "u") return null;
  const t = window.__YW_CONFIG__;
  if (!t) return null;
  if (typeof t == "string")
    try {
      return JSON.parse(t);
    } catch {
      return null;
    }
  return typeof t == "object" ? t : null;
}
function X() {
  const t = cn();
  return (t == null ? void 0 : t.environment) === "staging";
}
function dn() {
  if (typeof window > "u") return !1;
  try {
    return window.self !== window.top;
  } catch {
    return !0;
  }
}
function un() {
  return X() && dn();
}
const We = "EDGESPARK_TOKEN_SYNC", ye = "_es_sync";
function Ye(t, e) {
  if (X() && window.opener)
    try {
      const n = { type: We, token: t, origin: e };
      window.opener.postMessage(n, "*");
    } catch {
    }
}
function hn(t) {
  if (!X()) return () => {
  };
  const e = (n) => {
    const s = n.data;
    !s || s.type !== We || typeof s.token != "string" || typeof s.origin != "string" || t(s.token, s.origin);
  };
  return window.addEventListener("message", e), () => window.removeEventListener("message", e);
}
function fn(t) {
  if (!X() || typeof window > "u" || !window.opener) return;
  const e = new URL(window.location.href);
  if (e.searchParams.get(ye) !== "1") return;
  e.searchParams.delete(ye), window.history.replaceState({}, "", e.toString());
  const n = t(), s = Object.entries(n);
  s.length !== 0 && s.forEach(([r, i]) => {
    Ye(i, r);
  });
}
function pn(t) {
  if (!X()) return t;
  try {
    const e = new URL(t);
    return e.searchParams.set(ye, "1"), e.toString();
  } catch {
    return t;
  }
}
const ze = "EDGESPARK_SESSION_TOKEN", mn = "default-origin";
function gn(t) {
  const e = t || {};
  return {
    key: e.key || ze,
    persist: e.persist || "session",
    hasCustomStorage: !!e.storage
  };
}
function wn(t) {
  const e = t || {}, n = e.key || ze, s = e.persist || "session", r = /* @__PURE__ */ new Set(), i = e.serialize || ((f) => f), o = e.deserialize || ((f) => f), l = En(), a = yn(s, e.storage);
  let c = a ? bn(a, n, o, l) : {};
  const d = (f) => {
    r.forEach((b) => {
      try {
        b.origin === f && b.listener();
      } catch {
      }
    });
  }, h = () => {
    if (!a) return;
    const f = { byOrigin: {} };
    if (Object.entries(c).forEach(([b, v]) => {
      v && (f.byOrigin[b] = i(v));
    }), Object.keys(f.byOrigin).length === 0) {
      a.removeItem(n);
      return;
    }
    a.setItem(n, JSON.stringify(f));
  }, p = (f = l) => c[f] || null, m = (f, b = l) => {
    c[b] !== f && (c[b] = f, a && h(), d(b), Ye(f, b));
  }, y = (f = l) => {
    delete c[f], h(), d(f);
  }, w = () => {
    r.forEach((f) => {
      try {
        f.listener();
      } catch {
      }
    });
  };
  return hn((f, b) => {
    c[b] = f, a && h(), w();
  }), fn(() => ({ ...c })), {
    getToken: p,
    setToken: m,
    clear: y,
    subscribe(f, b = l) {
      const v = { origin: b, listener: f };
      return r.add(v), () => r.delete(v);
    }
  };
}
function Xe(t) {
  var r;
  je("TokenStore");
  const e = rn(), n = gn(t);
  if (e.tokenStore)
    return on("TokenStore", (r = e.snapshots) == null ? void 0 : r.tokenStore, n, ["key", "persist", "hasCustomStorage"]), e.tokenStore;
  const s = wn(t);
  return e.tokenStore = s, e.snapshots && (e.snapshots.tokenStore = n), s;
}
function yn(t, e) {
  if (e) return e;
  if (t === "session")
    return xe(() => window.sessionStorage);
  if (t === "local")
    return xe(() => window.localStorage);
}
function xe(t) {
  return {
    getItem(e) {
      try {
        return t().getItem(e);
      } catch {
        return null;
      }
    },
    setItem(e, n) {
      try {
        t().setItem(e, n);
      } catch {
      }
    },
    removeItem(e) {
      try {
        t().removeItem(e);
      } catch {
      }
    }
  };
}
function bn(t, e, n, s) {
  try {
    const r = t.getItem(e);
    if (!r) return {};
    try {
      const o = JSON.parse(r);
      if (o && typeof o == "object" && o.byOrigin && typeof o.byOrigin == "object") {
        const l = {};
        return Object.entries(o.byOrigin).forEach(([a, c]) => {
          try {
            l[a] = n(c);
          } catch {
            l[a] = c;
          }
        }), l;
      }
    } catch {
    }
    const i = n(r);
    return i ? { [s]: i } : {};
  } catch {
    return {};
  }
}
function En() {
  var t;
  try {
    if (typeof window < "u" && ((t = window.location) != null && t.origin))
      return window.location.origin;
  } catch {
  }
  return mn;
}
const Cn = "[HTTP-CALL]", vn = 512, _n = /* @__PURE__ */ new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "set-auth-token"
]);
function be(t) {
  const e = new Headers(t || {}), n = {}, s = [];
  let r = !1;
  return e.forEach((i, o) => {
    const l = o.toLowerCase();
    _n.has(l) ? (s.push(l), n[o] = `[redacted len=${i.length}]`, l === "authorization" && (r = !0)) : n[o] = i;
  }), {
    headers: n,
    meta: {
      redactedHeaders: s,
      hasAuthHeader: r
    }
  };
}
function Ee(t, e = vn) {
  if (t == null) return {};
  const n = t.length;
  return n <= e ? { bodySample: t, bodyLength: n, bodyTruncated: !1 } : {
    bodySample: t.slice(0, e),
    bodyLength: n,
    bodyTruncated: !0
  };
}
function Je(t) {
  return t == null ? {} : typeof t == "string" ? Ee(t) : t instanceof URLSearchParams ? Ee(t.toString()) : t instanceof FormData ? { bodySample: "[omitted FormData]", bodyTruncated: !0 } : t instanceof Blob ? { bodySample: "[omitted Blob]", bodyLength: t.size, bodyTruncated: !0 } : t.arrayBuffer ? { bodySample: "[omitted binary]", bodyTruncated: !0 } : { bodySample: "[uninspectable body]", bodyTruncated: !0 };
}
async function Ke(t) {
  try {
    const n = await t.clone().text();
    return Ee(n);
  } catch {
    return { bodySample: "[uninspectable body]", bodyTruncated: !0 };
  }
}
function Sn(t) {
  if (t)
    return t.split(`
`).slice(0, 5).join(`
`);
}
function Ce(t) {
  const { requestId: e, start: n, input: s, init: r, res: i, error: o, responseBody: l } = t, a = Date.now() - n, c = typeof s == "string" ? s : s.toString(), d = (r.method || "GET").toUpperCase(), h = !!(i != null && i.ok) && !o, p = {
    stage: "request-complete",
    requestId: e,
    ts: n,
    durationMs: a,
    success: h,
    request: {
      method: d,
      url: c,
      credentials: r.credentials,
      headers: be(r.headers),
      ...Je(r.body)
    }
  };
  if (i && (p.response = {
    status: i.status,
    ok: i.ok,
    headers: be(i.headers),
    ...l || {}
  }), o) {
    const m = o;
    p.error = {
      message: m == null ? void 0 : m.message,
      name: m == null ? void 0 : m.name,
      stackSample: Sn(m == null ? void 0 : m.stack)
    };
  }
  return p;
}
function se(t, e) {
  if (typeof console > "u") return;
  const n = `${Cn} [${t.toUpperCase()}]`;
  switch (t) {
    case "error":
      console.error(n, e);
      break;
    case "warn":
      console.warn(n, e);
      break;
    case "info":
      console.info(n, e);
      break;
    default:
      console.debug(n, e);
  }
}
const z = {
  debug: (t) => se("debug", t),
  info: (t) => se("info", t),
  warn: (t) => se("warn", t),
  error: (t) => se("error", t),
  redactHeaders: be,
  sampleRequestBody: Je,
  sampleResponseBody: Ke,
  buildCompleteEvent: Ce
}, ce = "__EDGESPARK_AUTH__", ie = "/api/_es/auth", Qe = "data-edgespark-auth", u = {
  root: "edgespark-auth",
  section: "edgespark-auth__section",
  fields: "edgespark-auth__fields",
  field: "edgespark-auth__field",
  label: "edgespark-auth__label",
  input: "edgespark-auth__input",
  btn: "edgespark-auth__btn",
  btnPrimary: "edgespark-auth__btn edgespark-auth__btn--primary",
  btnOAuth: "edgespark-auth__btn edgespark-auth__btn--oauth",
  btnOAuthProvider: (t) => `edgespark-auth__btn edgespark-auth__btn--oauth edgespark-auth__btn--${t}`,
  link: "edgespark-auth__link",
  error: "edgespark-auth__error",
  warning: "edgespark-auth__warning",
  info: "edgespark-auth__info",
  divider: "edgespark-auth__divider",
  providers: "edgespark-auth__providers",
  icon: "edgespark-auth__icon",
  iconProvider: (t) => `edgespark-auth__icon edgespark-auth__icon--${t}`,
  // 新增的组件类名
  header: "edgespark-auth__header",
  headerTitle: "edgespark-auth__header-title",
  headerSubtitle: "edgespark-auth__header-subtitle",
  logo: "edgespark-auth__logo",
  highlight: "edgespark-auth__highlight",
  codeInput: "edgespark-auth__code-input",
  codeInputDigit: "edgespark-auth__code-input-digit",
  spinner: "edgespark-auth__spinner",
  footer: "edgespark-auth__footer",
  footerText: "edgespark-auth__footer-text",
  backButton: "edgespark-auth__back-button",
  guestLink: "edgespark-auth__guest-link",
  emailIcon: "edgespark-auth__email-icon",
  // Iframe OAuth Modal 相关类名
  iframeModalOverlay: "edgespark-auth__iframe-modal-overlay",
  iframeModalClose: "edgespark-auth__iframe-modal-close",
  iframeModalCard: "edgespark-auth__iframe-modal-card",
  iframeModalHeader: "edgespark-auth__iframe-modal-header",
  iframeModalIcon: "edgespark-auth__iframe-modal-icon",
  iframeModalTitle: "edgespark-auth__iframe-modal-title",
  iframeModalContent: "edgespark-auth__iframe-modal-content",
  iframeModalBlur: "edgespark-auth__iframe-modal-blur",
  iframeModalMessage: "edgespark-auth__iframe-modal-message",
  iframeModalAction: "edgespark-auth__iframe-modal-action",
  iframeModalActionIcon: "edgespark-auth__iframe-modal-action-icon",
  // Skeleton Loading
  skeleton: "edgespark-auth__skeleton",
  skeletonItem: "edgespark-auth__skeleton-item",
  skeletonTitle: "edgespark-auth__skeleton-title",
  skeletonSubtitle: "edgespark-auth__skeleton-subtitle",
  skeletonInput: "edgespark-auth__skeleton-input",
  skeletonButton: "edgespark-auth__skeleton-button"
};
function Tn(t, e) {
  try {
    const s = new URL(t).search;
    if (!s || s === "?") return null;
    const i = s.slice(1).split("&");
    for (const o of i) {
      if (!o) continue;
      const [l, ...a] = o.split("=");
      if (l === e)
        return a.join("=") ?? null;
    }
    return null;
  } catch {
    return null;
  }
}
function kn(t, e) {
  if (typeof window > "u") return null;
  try {
    return typeof t == "string" ? new URL(t, e || window.location.origin).origin : t instanceof URL ? t.origin : t instanceof Request ? new URL(t.url, e || window.location.origin).origin : null;
  } catch {
    return null;
  }
}
const Rn = "set-auth-token";
function In() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function Ae(t) {
  return (typeof t == "string" ? t : t.toString()).includes(ie);
}
function Ln(t) {
  return (typeof t == "string" ? t : t.toString()).includes(`${ie}/sign-out`);
}
function Ze(t = {}) {
  const e = Rn, n = t.tokenStore, s = t.defaultCredentials || "include", r = t.baseOrigin;
  return async (i, o = {}) => {
    const l = new Headers(o.headers || {}), a = kn(i, r);
    if (n) {
      const m = a ? n.getToken(a) : null;
      m && l.set("authorization", `Bearer ${m}`);
    }
    const c = {
      ...o,
      credentials: o.credentials || s,
      headers: l
    }, d = X(), h = d ? In() : "", p = Date.now();
    try {
      const m = await fetch(i, c);
      if (d) {
        const y = await Ke(m), w = Ce({
          requestId: h,
          start: p,
          input: i,
          init: c,
          res: m,
          responseBody: y
        });
        m.ok || Ae(i) && m.status < 500 ? z.info(w) : z.warn(w);
      }
      if (n && a) {
        const y = m.headers.get(e);
        y && n.setToken(y, a), m.ok && Ln(i) && n.clear(a);
      }
      return m;
    } catch (m) {
      if (d) {
        const y = Ce({
          requestId: h,
          start: p,
          input: i,
          init: c,
          error: m
        }), w = (m == null ? void 0 : m.code) || (m == null ? void 0 : m.name);
        Ae(i) && w ? z.info(y) : z.warn(y);
      }
      throw m;
    }
  };
}
const Pn = /^https?:\/\//i;
function xn(t, e) {
  return typeof t != "string" || Pn.test(t) ? t : t.startsWith("/") ? `${e.replace(/\/$/, "")}${t}` : `${e.replace(/\/$/, "")}/${t}`;
}
function An(t) {
  je("createHttpClient");
  const { baseUrl: e, fetchCredentials: n } = t, s = new URL(e).origin, r = Xe({ persist: "local" }), i = Ze({
    tokenStore: r,
    defaultCredentials: n,
    baseOrigin: s
  });
  return async (l, a = {}) => {
    const c = xn(l, e);
    return i(c, a);
  };
}
class On extends Error {
  constructor(e, n, s) {
    super(n), this.name = "AuthError", this.code = e, this.meta = s;
  }
}
const H = (t, e, n) => new On(t, e, n), Nn = {
  config: "/config"
};
function et(t) {
  return typeof t == "string" ? t : "";
}
function Un(t) {
  const e = et(t);
  return e ? e + ie : "";
}
function Mn(t, e) {
  return Un(e) + t;
}
function Dn(t) {
  if (!t || typeof t != "object")
    throw H("CONFIG_INVALID", "Config must be an object");
  if (typeof t.disableSignUp != "boolean" || typeof t.enableAnonymous != "boolean")
    throw H("CONFIG_INVALID", "Config missing global flags");
  if (!t.providerEmailPassword || typeof t.providerEmailPassword.enabled != "boolean")
    throw H("CONFIG_INVALID", "Email/password provider missing");
  if (!t.providerGoogle || typeof t.providerGoogle.enabled != "boolean")
    throw H("CONFIG_INVALID", "Google provider missing");
}
async function Bn(t) {
  var c, d;
  const e = et(t);
  if (!e)
    throw H(
      "BASE_URL_UNAVAILABLE",
      "baseUrl must be provided before fetching config"
    );
  const n = globalThis, s = (c = n[ce]) == null ? void 0 : c.config;
  if (s && ve(s))
    return s;
  const r = Mn(Nn.config, e);
  let i;
  try {
    i = await fetch(r, { method: "GET" });
  } catch (h) {
    throw H("CONFIG_NOT_FOUND", "Failed to fetch auth config", { cause: h });
  }
  if (!i.ok)
    throw new Error(`HTTP ${i.status} while fetching ${r}`);
  const o = await i.json(), l = Vn(o);
  Dn(l);
  const a = {
    config: l,
    version: (d = n[ce]) == null ? void 0 : d.version,
    lastFetchedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return n[ce] = a, l;
}
function ve(t) {
  if (!t || typeof t != "object" || typeof t.disableSignUp != "boolean" || typeof t.enableAnonymous != "boolean") return !1;
  const e = t.providerEmailPassword, n = t.providerGoogle;
  return !(!e || typeof e != "object" || typeof e.enabled != "boolean" || !n || typeof n != "object" || typeof n.enabled != "boolean");
}
function Vn(t) {
  if (ve(t))
    return t;
  if (t && typeof t == "object" && ve(t.data))
    return t.data;
  throw H("CONFIG_INVALID", "Invalid auth config structure");
}
function $n(t) {
  const e = [];
  return t.providerGoogle && e.push(Fn(t.providerGoogle)), {
    emailPassword: t.providerEmailPassword,
    oauthProviders: e,
    disableSignUp: t.disableSignUp,
    enableAnonymous: t.enableAnonymous
  };
}
function de(t) {
  var e;
  return !!((e = t.emailPassword) != null && e.enabled);
}
function Oe(t) {
  return t.oauthProviders.filter((e) => e.enabled);
}
function Fn(t) {
  return {
    id: "google",
    enabled: !!(t != null && t.enabled),
    config: t
  };
}
function ue(t) {
  return !t || typeof t != "string" ? !1 : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.trim());
}
function Ne(t, e = 6) {
  return !t || typeof t != "string" ? !1 : t.length === e && /^\d+$/.test(t);
}
function he(t, e) {
  return t === e;
}
function fe(t) {
  const {
    level: e,
    context: n,
    message: s,
    reason: r,
    suggestion: i,
    rawCallbackUrl: o,
    fallbackUrl: l,
    fallbackApplied: a,
    success: c
  } = t, d = {
    stage: "callback-url",
    ts: Date.now(),
    success: typeof c == "boolean" ? c : e === "info",
    context: n,
    message: s,
    reason: r,
    suggestion: i,
    rawCallbackUrl: o,
    fallbackUrl: l,
    fallbackApplied: a
  };
  z[e](d);
}
function qn(t) {
  try {
    const e = new URL(t);
    return e.protocol === "http:" || e.protocol === "https:";
  } catch {
    return !1;
  }
}
function $(t, e) {
  if (typeof window > "u" || typeof window.location > "u") {
    fe({
      level: "warn",
      context: e,
      message: "callbackUrl resolution failed; no browser location available",
      reason: "window is undefined",
      suggestion: "Call from a browser runtime or pass an absolute URL with protocol",
      rawCallbackUrl: t,
      fallbackApplied: !1,
      success: !1
    });
    return;
  }
  const n = window.location.href, s = t == null ? void 0 : t.trim();
  return s ? qn(s) ? new URL(s).toString() : (fe({
    level: "warn",
    context: e,
    message: "callbackUrl invalid; using current location as fallback",
    reason: "URL must include http/https protocol",
    suggestion: "Use a full URL starting with https:// or http://",
    rawCallbackUrl: t,
    fallbackUrl: n,
    fallbackApplied: !0,
    success: !0
  }), n) : (fe({
    level: "info",
    context: e,
    message: "callbackUrl not provided; using current location",
    reason: "Missing callbackUrl",
    suggestion: "Provide a full URL including protocol (e.g. https://example.com)",
    rawCallbackUrl: t,
    fallbackUrl: n,
    fallbackApplied: !0,
    success: !0
  }), n);
}
const Gn = "https://public.youware.com/youbase/auth";
function tt(t) {
  const e = encodeURIComponent(t || "");
  return `${Gn}/${e}.png`;
}
const Hn = "Sign in with {provider}", jn = "{provider} sign-up needs to be completed in a new tab due to preview page limitations.", Wn = "Preview in New Tab", Ue = "edgespark-auth-iframe-modal-styles";
class Yn {
  constructor(e) {
    this.overlay = null, this.options = e, this.injectStyles();
  }
  /**
   * 挂载 Modal 到指定容器
   */
  mount(e = document.body) {
    this.overlay && this.destroy();
    const { providerId: n, providerName: s, onClose: r } = this.options, i = this.options.titleTemplate || Hn, o = this.options.messageTemplate || jn, l = this.options.actionButtonText || Wn, a = i.replace(/{provider}/g, s), c = o.replace(/{provider}/g, s), d = document.createElement("div");
    d.className = u.iframeModalOverlay;
    const h = document.createElement("button");
    h.className = u.iframeModalClose, h.type = "button", h.innerHTML = this.getCloseIconSvg(), h.addEventListener("click", () => {
      r();
    }), d.appendChild(h);
    const p = document.createElement("div");
    p.className = u.iframeModalCard;
    const m = document.createElement("div");
    m.className = u.iframeModalHeader;
    const y = document.createElement("span");
    y.className = u.iframeModalIcon, y.style.backgroundImage = `url(${tt(n)})`, m.appendChild(y);
    const w = document.createElement("span");
    w.className = u.iframeModalTitle, w.textContent = a, m.appendChild(w), p.appendChild(m);
    const f = document.createElement("div");
    f.className = u.iframeModalContent;
    const b = this.createBackgroundLayer();
    f.appendChild(b);
    const v = document.createElement("div");
    v.className = u.iframeModalBlur;
    const S = document.createElement("p");
    S.className = u.iframeModalMessage, S.textContent = c, v.appendChild(S);
    const g = document.createElement("button");
    g.className = u.iframeModalAction, g.type = "button";
    const _ = document.createElement("span");
    _.className = u.iframeModalActionIcon, _.innerHTML = this.getArrowIconSvg(), g.appendChild(_);
    const E = document.createTextNode(l);
    g.appendChild(E), g.addEventListener("click", () => {
      const I = pn(window.location.href);
      window.open(I, "_blank");
    }), v.appendChild(g), f.appendChild(v), p.appendChild(f), d.appendChild(p), e.appendChild(d), this.overlay = d, document.body.style.overflow = "hidden";
  }
  /**
   * 销毁 Modal
   */
  destroy() {
    this.overlay && this.overlay.parentElement && this.overlay.parentElement.removeChild(this.overlay), this.overlay = null, document.body.style.overflow = "";
  }
  /**
   * 注入样式
   */
  injectStyles() {
    if (document.getElementById(Ue))
      return;
    const e = document.createElement("style");
    e.id = Ue, e.textContent = `
      /* Iframe OAuth Modal 样式 */
      .${u.iframeModalOverlay} {
        position: fixed;
        inset: 0;
        background: #f6f5f8;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .${u.iframeModalClose} {
        position: absolute;
        top: 24px;
        right: 24px;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
      }

      .${u.iframeModalClose}:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .${u.iframeModalClose} svg {
        width: 20px;
        height: 20px;
        color: rgba(0, 0, 0, 0.6);
      }

      .${u.iframeModalCard} {
        width: 878px;
        max-width: 90vw;
        background: white;
        border-radius: 30px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      }

      .${u.iframeModalHeader} {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 20px;
        height: 64px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .${u.iframeModalIcon} {
        width: 24px;
        height: 24px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        flex-shrink: 0;
      }

      .${u.iframeModalTitle} {
        font-size: 14px;
        font-weight: 580;
        color: rgba(0, 0, 0, 0.95);
        line-height: 1.4;
        letter-spacing: -0.21px;
      }

      .${u.iframeModalContent} {
        position: relative;
        min-height: 335px;
      }

      .${u.iframeModalBlur} {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 32px;
        padding: 88px;
        box-sizing: border-box;
      }

      .${u.iframeModalMessage} {
        font-size: 16px;
        font-weight: 580;
        color: rgba(0, 0, 0, 0.95);
        text-align: center;
        max-width: 390px;
        line-height: 1.4;
        letter-spacing: -0.16px;
        margin: 0;
      }

      .${u.iframeModalAction} {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0 16px 0 12px;
        height: 36px;
        background: #2c2c2c;
        color: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 580;
        cursor: pointer;
        transition: background-color 0.2s;
        line-height: 1.4;
        letter-spacing: -0.21px;
      }

      .${u.iframeModalAction}:hover {
        background: #1a1a1a;
      }

      .${u.iframeModalActionIcon} {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 10.667px;
        height: 10.667px;
      }

      .${u.iframeModalActionIcon} svg {
        width: 100%;
        height: 100%;
      }

      /* 背景装饰层（毛玻璃之下） */
      .edgespark-auth__iframe-modal-bg {
        position: absolute;
        top: 40px;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        gap: 48px;
        padding: 0 28px;
        z-index: 1;
      }

      .edgespark-auth__iframe-modal-bg-header {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .edgespark-auth__iframe-modal-bg-title {
        font-size: 34px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.95);
        line-height: 1.2;
      }

      .edgespark-auth__iframe-modal-bg-subtitle {
        font-size: 14px;
        font-weight: 420;
        color: rgba(0, 0, 0, 0.4);
        line-height: 1.3;
        letter-spacing: 0.042px;
      }

      .edgespark-auth__iframe-modal-bg-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .edgespark-auth__iframe-modal-bg-input {
        height: 64px;
        border: 1px solid rgba(0, 0, 0, 0.95);
        border-radius: 12px;
        box-sizing: border-box;
      }

      .edgespark-auth__iframe-modal-bg-input-small {
        width: 127px;
        height: 20px;
        background: rgba(0, 0, 0, 0.95);
        border-radius: 12px;
        opacity: 0.2;
      }

      .edgespark-auth__iframe-modal-bg-input-medium {
        height: 32px;
        background: rgba(0, 0, 0, 0.95);
        border-radius: 12px;
        opacity: 0.2;
      }

      .edgespark-auth__iframe-modal-bg-button {
        position: absolute;
        bottom: 30px;
        right: 28px;
        width: 100px;
        height: 48px;
        background: #0d0d0d;
        border-radius: 9999px;
        opacity: 0.15;
      }

      /* 确保毛玻璃层在背景装饰层之上 */
      .${u.iframeModalBlur} {
        z-index: 2;
      }

      /* ========== 移动端适配 ========== */
      @media (max-width: 768px) {
        .${u.iframeModalCard} {
          width: 100%;
          max-width: 100%;
          height: 100%;
          border-radius: 0;
        }

        .${u.iframeModalClose} {
          top: 16px;
          right: 16px;
        }

        .${u.iframeModalContent} {
          min-height: calc(100vh - 64px);
        }

        .${u.iframeModalBlur} {
          padding: 40px 24px;
        }

        .${u.iframeModalMessage} {
          font-size: 14px;
          max-width: 100%;
        }

        /* 背景装饰层移动端适配 */
        .edgespark-auth__iframe-modal-bg {
          flex-direction: column;
          gap: 24px;
          padding: 0 20px;
          top: 24px;
        }

        .edgespark-auth__iframe-modal-bg-header {
          flex: none;
        }

        .edgespark-auth__iframe-modal-bg-title {
          font-size: 24px;
        }

        .edgespark-auth__iframe-modal-bg-subtitle {
          font-size: 12px;
        }

        .edgespark-auth__iframe-modal-bg-form {
          flex: none;
        }

        .edgespark-auth__iframe-modal-bg-input {
          height: 48px;
        }

        .edgespark-auth__iframe-modal-bg-input-small {
          width: 80px;
          height: 16px;
        }

        .edgespark-auth__iframe-modal-bg-input-medium {
          height: 24px;
        }

        .edgespark-auth__iframe-modal-bg-button {
          bottom: 20px;
          right: 20px;
          width: 80px;
          height: 40px;
        }
      }
    `, document.head.appendChild(e);
  }
  /**
   * 创建背景装饰层（在毛玻璃之下，用于产生模糊效果）
   */
  createBackgroundLayer() {
    const e = document.createElement("div");
    e.className = "edgespark-auth__iframe-modal-bg";
    const n = document.createElement("div");
    n.className = "edgespark-auth__iframe-modal-bg-header";
    const s = document.createElement("div");
    s.className = "edgespark-auth__iframe-modal-bg-title", s.textContent = "Sign in", n.appendChild(s);
    const r = document.createElement("div");
    r.className = "edgespark-auth__iframe-modal-bg-subtitle", r.textContent = "Sign up to Continue", n.appendChild(r), e.appendChild(n);
    const i = document.createElement("div");
    i.className = "edgespark-auth__iframe-modal-bg-form";
    const o = document.createElement("div");
    o.className = "edgespark-auth__iframe-modal-bg-input", i.appendChild(o);
    const l = document.createElement("div");
    l.className = "edgespark-auth__iframe-modal-bg-input-small", i.appendChild(l);
    const a = document.createElement("div");
    a.className = "edgespark-auth__iframe-modal-bg-input-medium", i.appendChild(a), e.appendChild(i);
    const c = document.createElement("div");
    return c.className = "edgespark-auth__iframe-modal-bg-button", e.appendChild(c), e;
  }
  /**
   * 获取关闭图标 SVG
   */
  getCloseIconSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
  }
  /**
   * 获取箭头图标 SVG（右上箭头）
   */
  getArrowIconSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>`;
  }
}
class zn {
  constructor(e) {
    this.options = e, this.listeners = /* @__PURE__ */ new Set(), this.countdownInterval = null, this.iframeModal = null, this.tokenUnsubscribe = null, this.state = {
      flow: "sign-in",
      mode: "email-password",
      error: null,
      data: {},
      loading: !1
    };
  }
  getState() {
    return { ...this.state };
  }
  subscribe(e) {
    return this.listeners.add(e), () => this.listeners.delete(e);
  }
  setState(e) {
    this.state = { ...this.state, ...e }, this.notifyListeners();
  }
  notifyListeners() {
    this.listeners.forEach((e) => {
      try {
        e(this.getState());
      } catch (n) {
        console.error("Listener error:", n);
      }
    });
  }
  /**
   * 切换认证流程
   * 数据清理：切换流程时只保留必要数据（email/name），清除密码、验证码等敏感字段
   * 倒计时管理：自动为需要倒计时的流程启动定时器
   * 状态重置：清除错误、loading 状态
   * @param flow 认证流程
   * @param data 认证数据
   * @returns void
   */
  transitionTo(e, n) {
    this.countdownInterval && (clearInterval(this.countdownInterval), this.countdownInterval = null);
    let s;
    (e === "verify-code" || e === "verify-email" || e === "set-new-password") && (s = 60);
    const r = { ...n || {} };
    r.email === void 0 && this.state.data.email && (r.email = this.state.data.email), r.name === void 0 && this.state.data.name && (r.name = this.state.data.name), this.setState({
      flow: e,
      error: null,
      errorMessage: void 0,
      oauthLoadingProvider: void 0,
      // 切换流程时清除 OAuth loading
      data: r,
      resendCountdown: s
      // 设置倒计时初始值，确保首次渲染时显示
    }), (e === "verify-code" || e === "verify-email" || e === "set-new-password") && setTimeout(() => {
      this.state.resendCountdown || (this.state.resendCountdown = 60), this.startCountdownTimer();
    }, 0);
  }
  /**
   * 更新数据（静默更新，不触发重新渲染）
   * 用于表单输入时的实时数据更新，避免频繁重新渲染导致输入框失去焦点
   */
  updateData(e) {
    this.state = {
      ...this.state,
      data: { ...this.state.data, ...e }
    };
  }
  /**
   * 设置错误
   */
  setError(e, n) {
    this.setState({
      error: e,
      errorMessage: n || this.getErrorMessage(e),
      loading: !1
    });
  }
  /**
   * 清除错误
   */
  clearError() {
    this.setState({
      error: null,
      errorMessage: void 0
    });
  }
  /**
   * 获取错误消息
   */
  getErrorMessage(e) {
    if (!e) return "";
    const { errors: n } = this.options.labels;
    switch (e) {
      case "INVALID_EMAIL":
      case "INVALID_CODE":
      case "CODE_EXPIRED":
      case "PASSWORD_MISMATCH":
      case "ACCOUNT_EXISTS":
      case "ACCOUNT_NOT_FOUND":
      case "WRONG_PASSWORD":
      case "EMAIL_NOT_VERIFIED":
      case "EMAIL_MISMATCH":
      case "GENERIC_ERROR":
        return (n == null ? void 0 : n[e]) || this.options.labels.common.unknownError;
      default:
        return this.options.labels.common.unknownError;
    }
  }
  /**
   * 处理登录
   */
  async handleSignIn() {
    var s, r, i, o, l;
    const { email: e, password: n } = this.state.data;
    if (!e || !ue(e)) {
      this.setError("INVALID_EMAIL");
      return;
    }
    if (!n) {
      this.setError("GENERIC_ERROR", this.options.labels.errors.required);
      return;
    }
    this.setState({ loading: !0, error: null, anonymousLoading: !1 });
    try {
      const a = (r = (s = this.options.config.emailPassword) == null ? void 0 : s.config) == null ? void 0 : r.requireEmailVerification, c = $(
        this.resolveEmailCallback(a),
        a ? "emailVerification" : "emailPassword"
      ), d = { email: e, password: n };
      c && (d.callbackURL = c);
      const h = await this.options.authClient.signIn.email(d);
      if (h.error) {
        await this.handleBetterAuthError(h.error, { email: e });
        return;
      }
      if (this.setState({ loading: !1 }), (l = (o = this.options).onLogin) == null || l.call(o, (i = h.data) == null ? void 0 : i.user), c && this.redirectTo(c))
        return;
      this.transitionTo("success");
    } catch (a) {
      await this.handleBetterAuthError(a, { email: e });
    }
  }
  /**
   * 处理注册
   */
  async handleSignUp() {
    var r, i, o;
    const { email: e, password: n, confirmPassword: s } = this.state.data;
    if (!e || !ue(e)) {
      this.setError("INVALID_EMAIL");
      return;
    }
    if (!s || !he(n || "", s)) {
      this.setError("PASSWORD_MISMATCH");
      return;
    }
    this.setState({ loading: !0, error: null, anonymousLoading: !1 });
    try {
      const l = (r = this.options.redirects) == null ? void 0 : r.emailVerification, a = $(l, "emailVerification"), c = {
        name: e.split("@")[0] || "User",
        // 如果没有 name，使用邮箱用户名部分
        email: e,
        password: n
      };
      a && (c.callbackURL = a);
      const d = await this.options.authClient.signUp.email(c);
      if (d.error) {
        await this.handleBetterAuthError(d.error, { email: e });
        return;
      }
      this.setState({ loading: !1 }), ((o = (i = this.options.config.emailPassword) == null ? void 0 : i.config) == null ? void 0 : o.requireEmailVerification) ? this.transitionTo("verify-email", { email: e }) : this.transitionTo("sign-in");
    } catch (l) {
      await this.handleBetterAuthError(l, { email: e });
    }
  }
  /**
   * 处理 OAuth 登录
   */
  async handleOAuthSignIn(e) {
    var n, s, r, i, o, l;
    if (un()) {
      this.showIframeOAuthModal(e);
      return;
    }
    this.setState({ oauthLoadingProvider: e, error: null });
    try {
      const a = await this.options.authClient.signIn.social({
        provider: e,
        callbackURL: $((s = (n = this.options.redirects) == null ? void 0 : n.oauth) == null ? void 0 : s.success, "oauth.success"),
        newUserCallbackURL: $((i = (r = this.options.redirects) == null ? void 0 : r.oauth) == null ? void 0 : i.newUser, "oauth.newUser"),
        errorCallbackURL: $((l = (o = this.options.redirects) == null ? void 0 : o.oauth) == null ? void 0 : l.error, "oauth.error")
      });
      if (a.error) {
        await this.handleBetterAuthError(a.error), this.setState({ oauthLoadingProvider: void 0 });
        return;
      }
    } catch (a) {
      await this.handleBetterAuthError(a), this.setState({ oauthLoadingProvider: void 0 });
    }
  }
  /**
   * 显示 Iframe OAuth Modal
   * 在 staging + iframe 环境下，拦截 OAuth 登录，提示用户在新标签页中打开
   */
  showIframeOAuthModal(e) {
    this.destroyIframeModal(), this.setState({ oauthLoadingProvider: e, error: null });
    const n = e.charAt(0).toUpperCase() + e.slice(1), s = this.options.labels.iframeModal;
    this.iframeModal = new Yn({
      providerId: e,
      providerName: n,
      titleTemplate: s == null ? void 0 : s.titleTemplate,
      messageTemplate: s == null ? void 0 : s.messageTemplate,
      actionButtonText: s == null ? void 0 : s.actionButton,
      onClose: () => {
        this.destroyIframeModal(), this.setState({ oauthLoadingProvider: void 0 });
      }
    }), this.iframeModal.mount(), this.options.onAuthStateChange && (this.tokenUnsubscribe = this.options.onAuthStateChange(async () => {
      var r, i, o;
      this.destroyIframeModal(), this.setState({ oauthLoadingProvider: void 0 });
      try {
        const l = await this.options.authClient.getSession();
        (r = l == null ? void 0 : l.data) != null && r.user && this.options.onLogin && this.options.onLogin(l.data.user);
        const a = $((o = (i = this.options.redirects) == null ? void 0 : i.oauth) == null ? void 0 : o.success, "oauth.success");
        if (a && this.redirectTo(a))
          return;
      } catch {
      }
    }));
  }
  /**
   * 销毁 Iframe OAuth Modal
   */
  destroyIframeModal() {
    this.tokenUnsubscribe && (this.tokenUnsubscribe(), this.tokenUnsubscribe = null), this.iframeModal && (this.iframeModal.destroy(), this.iframeModal = null);
  }
  /**
   * 重发密码重置 OTP
   */
  async handleResendPasswordResetCode() {
    const { email: e } = this.state.data;
    if (!e) {
      this.setError("GENERIC_ERROR", this.options.labels.errors.required);
      return;
    }
    try {
      const n = await this.options.authClient.forgetPassword.emailOtp({
        email: e
      });
      if (n.error) {
        await this.handleBetterAuthError(n.error);
        return;
      }
      this.startResendCountdown(60);
    } catch (n) {
      await this.handleBetterAuthError(n);
    }
  }
  /**
   * 匿名/临时账号登录
   */
  async handleAnonymousSignIn() {
    var e, n, s, r;
    if (!this.options.config.enableAnonymous) {
      this.setError("GENERIC_ERROR", this.options.labels.common.unknownError);
      return;
    }
    this.setState({ anonymousLoading: !0, error: null, loading: this.state.loading });
    try {
      const i = $((e = this.options.redirects) == null ? void 0 : e.anonymous, "anonymous"), o = await this.options.authClient.signIn.anonymous(
        i ? { callbackURL: i } : {}
      );
      if (o != null && o.error) {
        await this.handleBetterAuthError(o.error), this.setState({ anonymousLoading: !1 });
        return;
      }
      if (this.setState({ anonymousLoading: !1 }), (r = (s = this.options).onLogin) == null || r.call(s, (n = o == null ? void 0 : o.data) == null ? void 0 : n.user), i && this.redirectTo(i))
        return;
      this.transitionTo("success");
    } catch (i) {
      this.setState({ anonymousLoading: !1 }), await this.handleBetterAuthError(i);
    }
  }
  /**
   * 重发验证邮件
   */
  async handleResendVerificationEmail() {
    var n, s, r, i, o;
    const { email: e } = this.state.data;
    if (!e) {
      this.setError("GENERIC_ERROR", this.options.labels.errors.required);
      return;
    }
    this.setState({ loading: !0, error: null, anonymousLoading: !1 });
    try {
      const l = await this.options.authClient.sendVerificationEmail({
        email: e,
        callbackURL: $((n = this.options.redirects) == null ? void 0 : n.emailVerification, "emailVerification")
      });
      if (l != null && l.error) {
        this.setError("GENERIC_ERROR", l.error.message), (r = (s = this.options).onError) == null || r.call(s, l.error);
        return;
      }
      this.setState({ loading: !1 }), this.startResendCountdown(60);
    } catch (l) {
      this.setError("GENERIC_ERROR", l == null ? void 0 : l.message), (o = (i = this.options).onError) == null || o.call(i, l);
    }
  }
  /**
   * 验证验证码
   */
  async handleVerifyCode() {
    var s, r, i, o, l;
    const { email: e, code: n } = this.state.data;
    if (!n || !Ne(n)) {
      this.setError("INVALID_CODE", this.options.labels.verifyCode.invalidCode);
      return;
    }
    this.setState({ loading: !0, error: null, anonymousLoading: !1 });
    try {
      await new Promise((c) => setTimeout(c, 1e3)), this.setState({ loading: !1 });
      const a = await this.options.authClient.getSession();
      (i = (r = this.options).onLogin) == null || i.call(r, (s = a == null ? void 0 : a.data) == null ? void 0 : s.user), this.transitionTo("success");
    } catch (a) {
      this.setError("GENERIC_ERROR", a == null ? void 0 : a.message), (l = (o = this.options).onError) == null || l.call(o, a);
    }
  }
  /**
   * 发送密码重置 OTP
   */
  async handleSendPasswordReset() {
    var n, s, r, i;
    const { email: e } = this.state.data;
    if (!e || !ue(e)) {
      this.setError("INVALID_EMAIL");
      return;
    }
    this.setState({ loading: !0, error: null, anonymousLoading: !1 });
    try {
      const o = await this.options.authClient.forgetPassword.emailOtp({
        email: e
      });
      if (o.error) {
        this.setError("GENERIC_ERROR", o.error.message), (s = (n = this.options).onError) == null || s.call(n, o.error), this.setState({ loading: !1 });
        return;
      }
      this.setState({ loading: !1 }), this.transitionTo("set-new-password", { email: e });
    } catch (o) {
      this.setError("GENERIC_ERROR", o == null ? void 0 : o.message), (i = (r = this.options).onError) == null || i.call(r, o), this.setState({ loading: !1 });
    }
  }
  /**
   * 设置新密码（包含验证码验证）
   */
  async handleSetNewPassword() {
    var i, o, l, a;
    const { email: e, code: n, password: s, confirmPassword: r } = this.state.data;
    if (!n || !Ne(n)) {
      this.setError("INVALID_CODE", this.options.labels.verifyCode.invalidCode);
      return;
    }
    if (!he(s || "", r || "")) {
      this.setError("PASSWORD_MISMATCH");
      return;
    }
    this.setState({ loading: !0, error: null, anonymousLoading: !1 });
    try {
      const c = await this.options.authClient.emailOtp.resetPassword({
        email: e,
        otp: n,
        password: s
      });
      if (c.error) {
        const d = c.error.code || c.error.name;
        d === "INVALID_OTP" ? this.setError("INVALID_CODE", this.options.labels.verifyCode.invalidCode) : d === "OTP_EXPIRED" ? this.setError("CODE_EXPIRED", this.options.labels.verifyCode.codeExpired) : d === "TOO_MANY_ATTEMPTS" ? this.setError("GENERIC_ERROR", this.getErrorMessageByCode(d, c.error.message)) : this.setError("GENERIC_ERROR", c.error.message), (o = (i = this.options).onError) == null || o.call(i, c.error), this.setState({ loading: !1 });
        return;
      }
      this.setState({ loading: !1 }), this.transitionTo("success", { successType: "password-reset" });
    } catch (c) {
      this.setError("GENERIC_ERROR", c == null ? void 0 : c.message), (a = (l = this.options).onError) == null || a.call(l, c), this.setState({ loading: !1 });
    }
  }
  /**
   * 修改密码（已登录用户）
   */
  async handleChangePassword(e = !1) {
    var i, o, l, a, c, d, h;
    const { currentPassword: n, newPassword: s, confirmPassword: r } = this.state.data;
    if (!n) {
      this.setError("GENERIC_ERROR", this.options.labels.errors.required);
      return;
    }
    if (!he(s || "", r || "")) {
      this.setError("PASSWORD_MISMATCH");
      return;
    }
    this.setState({ loading: !0, error: null, anonymousLoading: !1 });
    try {
      const p = await this.options.authClient.changePassword({
        currentPassword: n,
        newPassword: s,
        revokeOtherSessions: e
      });
      if (p != null && p.error) {
        this.setError("GENERIC_ERROR", p.error.message), (o = (i = this.options).onError) == null || o.call(i, p.error);
        return;
      }
      this.setState({ loading: !1 });
      const m = await this.options.authClient.getSession();
      (c = (a = this.options).onLogin) == null || c.call(a, (l = m == null ? void 0 : m.data) == null ? void 0 : l.user), this.transitionTo("success", { successType: "password-changed" });
    } catch (p) {
      this.setError("GENERIC_ERROR", p == null ? void 0 : p.message), (h = (d = this.options).onError) == null || h.call(d, p);
    }
  }
  resolveEmailCallback(e) {
    var n, s;
    return e ? (n = this.options.redirects) == null ? void 0 : n.emailVerification : (s = this.options.redirects) == null ? void 0 : s.emailPassword;
  }
  redirectTo(e) {
    return !e || typeof window > "u" ? !1 : (window.location.assign(e), !0);
  }
  /**
   * 开始重发倒计时
   */
  startResendCountdown(e = 60) {
    this.countdownInterval && (clearInterval(this.countdownInterval), this.countdownInterval = null), this.state = { ...this.state, resendCountdown: e }, this.notifyCountdownUpdate(), this.startCountdownTimer();
  }
  /**
   * 启动倒计时定时器（不设置初始状态，只负责定时更新）
   */
  startCountdownTimer() {
    this.countdownInterval && (clearInterval(this.countdownInterval), this.countdownInterval = null), !(typeof window > "u") && (this.countdownInterval = window.setInterval(() => {
      const e = this.state.resendCountdown || 0;
      e <= 1 ? (this.countdownInterval && (clearInterval(this.countdownInterval), this.countdownInterval = null), this.state = { ...this.state, resendCountdown: void 0 }, this.notifyCountdownUpdate()) : (this.state = { ...this.state, resendCountdown: e - 1 }, this.notifyCountdownUpdate());
    }, 1e3));
  }
  /**
   * 通知倒计时更新（触发完整重新渲染，确保各视图倒计时文本刷新）
   */
  notifyCountdownUpdate() {
    const e = this.getState();
    this.listeners.forEach((n) => {
      try {
        n({ ...e, resendCountdown: this.state.resendCountdown });
      } catch (s) {
        console.error("Listener error:", s);
      }
    });
  }
  /**
   * 统一的 better-auth 错误处理：优先用 code，缺 code 时输出 console.error，UI 显示 message 或兜底文案
   */
  async handleBetterAuthError(e, n) {
    var i, o, l, a, c;
    const s = e && typeof e == "object" && e.code || "UNKNOWN", r = e && typeof e == "object" && e.message || this.options.labels.common.unknownError;
    switch (s === "UNKNOWN" && console.error("[EDGESPARK_AUTH] Missing error code", { code: e == null ? void 0 : e.code, message: r, error: e }), s) {
      case "EMAIL_NOT_VERIFIED":
        this.setError("GENERIC_ERROR", this.getErrorMessageByCode(s, r)), this.transitionTo("verify-email", { email: n == null ? void 0 : n.email }), this.startResendCountdown(60);
        try {
          await this.options.authClient.sendVerificationEmail({
            email: n == null ? void 0 : n.email,
            callbackURL: $((i = this.options.redirects) == null ? void 0 : i.emailVerification, "emailVerification")
          });
        } catch (d) {
          (l = (o = this.options).onError) == null || l.call(o, d);
        }
        break;
      case "USER_ALREADY_EXISTS":
      case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
        this.setError("GENERIC_ERROR", this.getErrorMessageByCode(s, r));
        break;
      case "USER_NOT_FOUND":
      case "ACCOUNT_NOT_FOUND":
      case "CREDENTIAL_ACCOUNT_NOT_FOUND":
        this.setError("GENERIC_ERROR", this.getErrorMessageByCode(s, r));
        break;
      case "INVALID_EMAIL_OR_PASSWORD":
      case "INVALID_PASSWORD":
      case "INVALID_TOKEN":
        this.setError("GENERIC_ERROR", this.getErrorMessageByCode(s, r));
        break;
      case "INVALID_EMAIL":
        this.setError("GENERIC_ERROR", this.getErrorMessageByCode(s, r));
        break;
      case "PASSWORD_TOO_SHORT":
      case "PASSWORD_TOO_LONG":
        this.setError("GENERIC_ERROR", this.getErrorMessageByCode(s, r));
        break;
      default:
        this.setError("GENERIC_ERROR", this.getErrorMessageByCode(s, r));
    }
    (c = (a = this.options).onError) == null || c.call(a, e);
  }
  getErrorMessageByCode(e, n) {
    var r, i;
    const s = (i = (r = this.options.labels) == null ? void 0 : r.errors) == null ? void 0 : i[e];
    return s || n || this.options.labels.common.unknownError;
  }
}
class G {
  constructor(e) {
    if (this.config = e, this.element = document.createElement("div"), this.element.className = u.header, e.showLogo) {
      const s = this.createLogo();
      this.element.appendChild(s);
    }
    const n = document.createElement("h1");
    if (n.className = u.headerTitle, n.textContent = e.title, this.element.appendChild(n), e.subtitle) {
      const s = this.createSubtitle();
      this.element.appendChild(s);
    }
  }
  createLogo() {
    const e = document.createElement("div");
    return e.className = u.logo, e;
  }
  createSubtitle() {
    const e = document.createElement("div");
    if (e.className = u.headerSubtitle, this.config.highlightedText) {
      const n = this.config.subtitle.split(this.config.highlightedText);
      if (n.length > 1) {
        e.textContent = n[0];
        const s = document.createElement("span");
        s.className = u.highlight, s.textContent = this.config.highlightedText, e.appendChild(s);
        const r = document.createTextNode(n[1]);
        e.appendChild(r);
      } else
        e.textContent = this.config.subtitle;
    } else
      e.textContent = this.config.subtitle;
    return e;
  }
  update(e) {
    if (e.title) {
      const n = this.element.querySelector(`.${u.headerTitle}`);
      n && (n.textContent = e.title);
    }
    if (e.subtitle !== void 0) {
      const n = this.element.querySelector(`.${u.headerSubtitle}`);
      if (n && n.remove(), e.subtitle) {
        this.config.subtitle = e.subtitle, this.config.highlightedText = e.highlightedText;
        const s = this.createSubtitle();
        this.element.appendChild(s);
      }
    }
  }
  destroy() {
  }
}
class O {
  constructor(e) {
    this.config = e, this.cleanup = [], this.element = document.createElement("div"), this.element.className = u.field;
    const n = document.createElement("label");
    n.className = u.label, n.textContent = e.label, this.input = document.createElement("input"), this.input.className = u.input, this.input.type = e.type, this.input.name = e.name, this.input.required = e.required ?? !1, this.input.disabled = e.disabled ?? !1, this.input.value = e.value || "";
    const s = e.placeholder ?? e.label;
    s && (this.input.placeholder = s), e.autocomplete && (this.input.autocomplete = e.autocomplete), this.errorDiv = document.createElement("div"), this.errorDiv.className = u.error, this.errorDiv.style.display = "none", e.error && (this.errorDiv.textContent = e.error, this.errorDiv.style.display = "block"), this.element.appendChild(n), this.element.appendChild(this.input), this.element.appendChild(this.errorDiv), this.bindEvents();
  }
  bindEvents() {
    const e = (n) => {
      n.target;
    };
    this.input.addEventListener("input", e), this.cleanup.push(() => this.input.removeEventListener("input", e));
  }
  getValue() {
    return this.input.value.trim();
  }
  setValue(e) {
    this.input.value = e;
  }
  setError(e) {
    this.errorDiv.textContent = e, this.errorDiv.style.display = "block", this.input.classList.add("error");
  }
  clearError() {
    this.errorDiv.style.display = "none", this.input.classList.remove("error");
  }
  setDisabled(e) {
    this.input.disabled = e;
  }
  focus() {
    this.input.focus();
  }
  destroy() {
    this.cleanup.forEach((e) => {
      try {
        e();
      } catch {
      }
    }), this.cleanup = [];
  }
}
class Me {
  constructor(e) {
    this.inputs = [], this.cleanup = [], this.config = e, this.element = document.createElement("div"), this.element.className = u.codeInput;
    for (let n = 0; n < e.length; n++) {
      const s = this.createInput(n);
      this.inputs.push(s), this.element.appendChild(s);
    }
    e.value && this.setValue(e.value);
  }
  createInput(e) {
    const n = document.createElement("input");
    n.className = u.codeInputDigit, n.type = "text", n.maxLength = 1, n.pattern = "[0-9]", n.inputMode = "numeric", n.disabled = this.config.disabled ?? !1;
    const s = (o) => {
      const l = o.target, a = l.value;
      if (a && !/^\d$/.test(a)) {
        l.value = "";
        return;
      }
      a && e < this.inputs.length - 1 && this.inputs[e + 1].focus(), this.updateValue();
    }, r = (o) => {
      o.key === "Backspace" && !n.value && e > 0 && this.inputs[e - 1].focus();
    }, i = (o) => {
      var d;
      o.preventDefault();
      const l = (d = o.clipboardData) == null ? void 0 : d.getData("text");
      if (!l) return;
      const a = l.replace(/\D/g, "").slice(0, this.config.length);
      this.setValue(a);
      const c = Math.min(a.length, this.inputs.length - 1);
      this.inputs[c].focus();
    };
    return n.addEventListener("input", s), n.addEventListener("keydown", r), n.addEventListener("paste", i), this.cleanup.push(() => {
      n.removeEventListener("input", s), n.removeEventListener("keydown", r), n.removeEventListener("paste", i);
    }), n;
  }
  updateValue() {
    const e = this.inputs.map((n) => n.value).join("");
    this.config.onChange(e), e.length === this.config.length && this.config.onComplete && this.config.onComplete(e);
  }
  getValue() {
    return this.inputs.map((e) => e.value).join("");
  }
  setValue(e) {
    e.slice(0, this.config.length).split("").forEach((s, r) => {
      this.inputs[r] && (this.inputs[r].value = s);
    });
  }
  setError(e) {
    this.inputs.forEach((n) => {
      e ? n.classList.add("error") : n.classList.remove("error");
    });
  }
  setDisabled(e) {
    this.inputs.forEach((n) => {
      n.disabled = e;
    });
  }
  clear() {
    this.inputs.forEach((e) => {
      e.value = "";
    }), this.inputs[0].focus();
  }
  focus() {
    const e = this.inputs.findIndex((n) => !n.value);
    e >= 0 ? this.inputs[e].focus() : this.inputs[0].focus();
  }
  destroy() {
    this.cleanup.forEach((e) => {
      try {
        e();
      } catch {
      }
    }), this.cleanup = [];
  }
}
class F {
  constructor(e) {
    if (this.cleanup = [], this.isLoading = !1, this.config = e, this.originalText = e.text, this.element = document.createElement("button"), this.element.type = "button", this.element.className = this.getClassName(), this.element.disabled = e.disabled ?? !1, e.icon) {
      const s = document.createElement("span");
      s.className = e.icon, this.element.appendChild(s);
    }
    const n = document.createElement("span");
    n.textContent = e.text, this.element.appendChild(n), this.bindEvents(), e.loading && this.setLoading(!0);
  }
  getClassName() {
    const e = u.btn;
    switch (this.config.variant) {
      case "primary":
        return u.btnPrimary;
      case "oauth":
        return u.btnOAuth;
      case "secondary":
      default:
        return e;
    }
  }
  bindEvents() {
    const e = async () => {
      if (!(this.isLoading || this.element.disabled))
        try {
          this.setLoading(!0), await this.config.onClick();
        } catch (n) {
          console.error("Button onClick error:", n);
        } finally {
          this.setLoading(!1);
        }
    };
    this.element.addEventListener("click", e), this.cleanup.push(() => this.element.removeEventListener("click", e));
  }
  setLoading(e) {
    if (this.isLoading = e, e) {
      this.element.disabled = !0, this.element.innerHTML = "";
      const n = document.createElement("span");
      n.className = u.spinner, this.element.appendChild(n);
      const s = document.createElement("span");
      s.textContent = this.config.text, this.element.appendChild(s);
    } else {
      if (this.element.disabled = this.config.disabled ?? !1, this.element.innerHTML = "", this.config.icon) {
        const s = document.createElement("span");
        s.className = this.config.icon, this.element.appendChild(s);
      }
      const n = document.createElement("span");
      n.textContent = this.originalText, this.element.appendChild(n);
    }
  }
  setText(e) {
    this.originalText = e;
    const n = this.element.querySelector("span:last-child");
    n && (n.textContent = e);
  }
  setDisabled(e) {
    this.config.disabled = e, this.isLoading || (this.element.disabled = e);
  }
  destroy() {
    this.cleanup.forEach((e) => {
      try {
        e();
      } catch {
      }
    }), this.cleanup = [];
  }
}
function Xn(t) {
  return new Promise((e) => {
    const n = t.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(0)" }
      ],
      {
        duration: 400,
        easing: "ease-in-out"
      }
    );
    n.onfinish = () => e();
  });
}
class Y {
  constructor(e) {
    this.config = e, this.element = document.createElement("div"), this.element.className = this.getClassName(), this.element.style.display = e.visible ? "block" : "none", e.message && (this.element.textContent = e.message);
  }
  getClassName() {
    const e = u.error;
    return this.config.type === "warning" ? `${e} ${u.warning}` : this.config.type === "info" ? `${e} ${u.info}` : e;
  }
  setMessage(e, n = !0) {
    this.config.message = e, this.element.textContent = e, this.show(), n && Xn(this.element);
  }
  show() {
    this.config.visible = !0, this.element.style.display = "block";
  }
  hide() {
    this.config.visible = !1, this.element.style.display = "none";
  }
  setType(e) {
    this.config.type = e, this.element.className = this.getClassName();
  }
  destroy() {
  }
}
class De {
  constructor(e = "or") {
    this.text = e, this.element = document.createElement("div"), this.element.className = u.divider, this.element.textContent = e;
  }
  setText(e) {
    this.text = e, this.element.textContent = e;
  }
  destroy() {
  }
}
class Be {
  constructor(e, n, s) {
    this.provider = e, this.labels = n, this.onClick = s, this.cleanup = [], this.element = document.createElement("button"), this.element.type = "button", this.element.className = u.btnOAuthProvider(e.id);
    const r = document.createElement("span");
    r.className = u.iconProvider(e.id), r.style.backgroundImage = `url(${tt(e.id)})`, this.element.appendChild(r);
    const i = document.createElement("span");
    i.className = "edgespark-auth__btn-text";
    const o = `${e.id}BtnName`, l = this.labels[o];
    i.textContent = l || `${this.labels.buttonTextPrefix} ${e.name}`, this.element.appendChild(i), this.bindEvents();
  }
  bindEvents() {
    const e = async () => {
      try {
        this.setLoading(!0), await this.onClick();
      } catch (n) {
        console.error("OAuth button click error:", n), this.setLoading(!1);
      }
    };
    this.element.addEventListener("click", e), this.cleanup.push(() => this.element.removeEventListener("click", e));
  }
  setLoading(e) {
    this.element.disabled = e;
    const n = this.element.querySelector(`.${u.icon}`);
    if (e) {
      if (this.element.classList.add("loading"), n && (n.style.display = "none"), !this.element.querySelector(`.${u.spinner}`)) {
        const s = document.createElement("span");
        s.className = u.spinner, this.element.insertBefore(s, this.element.firstChild);
      }
    } else {
      this.element.classList.remove("loading"), n && (n.style.display = "");
      const s = this.element.querySelector(`.${u.spinner}`);
      s && s.remove();
    }
  }
  /**
   * 外部调用的 loading 状态设置方法
   */
  setLoadingState(e) {
    this.setLoading(e);
  }
  setDisabled(e) {
    this.element.disabled = e;
    const n = this.element.querySelector(`.${u.icon}`);
    if (e) {
      if (this.element.classList.add("loading"), n && (n.style.display = "none"), !this.element.querySelector(`.${u.spinner}`)) {
        const s = document.createElement("span");
        s.className = u.spinner, this.element.insertBefore(s, this.element.firstChild);
      }
    } else {
      this.element.classList.remove("loading"), n && (n.style.display = "");
      const s = this.element.querySelector(`.${u.spinner}`);
      s && s.remove();
    }
  }
  destroy() {
    this.cleanup.forEach((e) => {
      try {
        e();
      } catch {
      }
    }), this.cleanup = [];
  }
}
class Ve {
  constructor(e) {
    this.options = e, this.components = [];
  }
  /**
   * 创建视图的主方法
   */
  createView() {
    this.cleanup();
    const { state: e } = this.options;
    switch (e.flow) {
      case "sign-in":
        return this.buildSignInView();
      case "sign-up":
        return this.buildSignUpView();
      case "verify-email":
        return this.buildVerifyEmailView();
      case "verify-code":
        return this.buildVerifyCodeView();
      case "reset-password":
        return this.buildResetPasswordView();
      case "set-new-password":
        return this.buildSetNewPasswordView();
      case "change-password":
        return this.buildChangePasswordView();
      case "success":
        return this.buildSuccessView();
      default:
        return this.buildSignInView();
    }
  }
  /**
   * 构建登录视图
   */
  buildSignInView() {
    var v, S;
    const e = document.createElement("div"), { labels: n, state: s, config: r } = this.options, i = n.signIn.emailPlaceholder || n.signIn.emailLabel, o = n.signIn.passwordPlaceholder || n.signIn.passwordLabel, l = new G({
      title: n.signIn.title,
      subtitle: n.signIn.subtitle
    });
    s.error && l.element.classList.add("has-error-below"), this.components.push(l), e.appendChild(l.element);
    const a = document.createElement("div");
    a.className = u.section, s.error && a.classList.add("has-error");
    const c = new Y({
      message: s.errorMessage || "",
      visible: !!s.error
    });
    this.components.push(c), a.appendChild(c.element);
    const d = document.createElement("div");
    d.className = u.fields;
    const h = new O({
      type: "email",
      name: "email",
      label: n.signIn.emailLabel,
      placeholder: i,
      value: s.data.email || "",
      autocomplete: "email",
      required: !0,
      disabled: !!s.oauthLoadingProvider
      // OAuth 登录时禁用输入框
    });
    this.components.push(h), d.appendChild(h.element);
    const p = new O({
      type: "password",
      name: "password",
      label: n.signIn.passwordLabel,
      placeholder: o,
      value: s.data.password || "",
      autocomplete: "current-password",
      required: !0,
      disabled: !!s.oauthLoadingProvider
      // OAuth 登录时禁用输入框
    });
    this.components.push(p), d.appendChild(p.element), a.appendChild(d);
    const m = n.signIn.emailOnlyButton || n.signIn.loginButton, y = new F({
      text: m,
      onClick: async () => {
        this.options.onStateChange({
          data: {
            ...s.data,
            email: h.getValue(),
            password: p.getValue()
          }
        }), await this.options.onAction("signIn");
      },
      variant: "primary",
      fullWidth: !0,
      loading: s.loading,
      disabled: !!s.oauthLoadingProvider || !!s.anonymousLoading
      // 其他登录进行时禁用
    });
    this.components.push(y), a.appendChild(y.element);
    const w = Oe(r);
    if (de(r) && w.length > 0) {
      const g = new De(n.common.orText);
      this.components.push(g), a.appendChild(g.element);
    }
    if (w.length > 0) {
      const g = document.createElement("div");
      g.className = u.providers, w.forEach((_) => {
        const E = !!s.loading || !!s.anonymousLoading, I = new Be(
          { id: _.id, name: _.id, enabled: _.enabled && !E },
          n.oauth,
          async () => {
            await this.options.onAction("oauthSignIn", { provider: _.id });
          }
        );
        s.oauthLoadingProvider === _.id && I.setLoadingState(!0), E && s.oauthLoadingProvider !== _.id && I.element.setAttribute("disabled", "true"), this.components.push(I), g.appendChild(I.element);
      }), a.appendChild(g);
    }
    const f = document.createElement("div");
    if (f.className = u.footer, !r.disableSignUp && de(r)) {
      const g = document.createElement("span");
      g.className = u.footerText, n.signIn.signUpPrompt && g.append(document.createTextNode(`${n.signIn.signUpPrompt} `));
      const _ = document.createElement("a");
      _.className = u.link, _.textContent = n.signIn.toggleToSignUp, _.href = "#", _.addEventListener("click", (E) => {
        E.preventDefault(), this.options.onAction("switchToSignUp");
      }), g.appendChild(_), f.appendChild(g);
    }
    if (!!((S = (v = r.emailPassword) == null ? void 0 : v.config) != null && S.requirePasswordResetEmailVerification)) {
      const g = document.createElement("a");
      g.className = u.link, g.textContent = n.signIn.forgotPassword, g.href = "#", g.addEventListener("click", (_) => {
        _.preventDefault(), this.options.onAction("switchToResetPassword");
      }), f.appendChild(g);
    }
    return a.appendChild(f), e.appendChild(a), e;
  }
  /**
   * 构建注册视图
   */
  buildSignUpView() {
    const e = document.createElement("div"), { labels: n, state: s, config: r } = this.options, i = new G({
      title: n.signUp.title,
      subtitle: n.signUp.subtitle
    });
    s.error && i.element.classList.add("has-error-below"), this.components.push(i), e.appendChild(i.element);
    const o = document.createElement("div");
    o.className = u.section, s.error && o.classList.add("has-error");
    const l = new Y({
      message: s.errorMessage || "",
      visible: !!s.error
    });
    this.components.push(l), o.appendChild(l.element);
    const a = document.createElement("div");
    a.className = u.fields;
    const c = n.signUp.emailPlaceholder || n.signUp.emailLabel, d = new O({
      type: "email",
      name: "email",
      label: n.signUp.emailLabel,
      placeholder: c,
      value: s.data.email || "",
      autocomplete: "email",
      required: !0,
      disabled: !!s.oauthLoadingProvider
      // OAuth 登录时禁用输入框
    });
    this.components.push(d), a.appendChild(d.element);
    const h = n.signUp.passwordPlaceholder || n.signUp.passwordLabel, p = new O({
      type: "password",
      name: "password",
      label: n.signUp.passwordLabel,
      placeholder: h,
      value: s.data.password || "",
      autocomplete: "new-password",
      required: !0,
      disabled: !!s.oauthLoadingProvider
      // OAuth 登录时禁用输入框
    });
    this.components.push(p), a.appendChild(p.element);
    const m = n.signUp.confirmPasswordPlaceholder || n.signUp.confirmPasswordLabel, y = new O({
      type: "password",
      name: "confirmPassword",
      label: n.signUp.confirmPasswordLabel,
      placeholder: m,
      value: s.data.confirmPassword || "",
      autocomplete: "new-password",
      required: !0,
      disabled: !!s.oauthLoadingProvider
      // OAuth 登录时禁用输入框
    });
    this.components.push(y), a.appendChild(y.element), o.appendChild(a);
    const w = new F({
      text: n.signUp.signUpButton,
      onClick: async () => {
        this.options.onStateChange({
          data: {
            ...s.data,
            email: d.getValue(),
            password: p.getValue(),
            confirmPassword: y.getValue()
          }
        }), await this.options.onAction("signUp");
      },
      variant: "primary",
      fullWidth: !0,
      loading: s.loading,
      disabled: !!s.oauthLoadingProvider
      // OAuth 登录时禁用邮箱密码按钮
    });
    this.components.push(w), o.appendChild(w.element);
    const f = Oe(r);
    if (de(r) && f.length > 0) {
      const g = new De(n.common.orText);
      this.components.push(g), o.appendChild(g.element);
    }
    if (f.length > 0) {
      const g = document.createElement("div");
      g.className = u.providers, f.forEach((_) => {
        const E = new Be(
          { id: _.id, name: _.id, enabled: _.enabled },
          n.oauth,
          async () => {
            await this.options.onAction("oauthSignIn", { provider: _.id });
          }
        );
        s.oauthLoadingProvider === _.id && E.setLoadingState(!0), this.components.push(E), g.appendChild(E.element);
      }), o.appendChild(g);
    }
    const b = document.createElement("div");
    b.className = u.footer;
    const v = document.createElement("span");
    v.className = u.footerText, n.signUp.toggleToSignIn && v.append(document.createTextNode(`${n.signUp.toggleToSignIn} `));
    const S = document.createElement("a");
    return S.className = u.link, S.textContent = n.signUp.toggleToSignInLink || "Sign in now.", S.href = "#", S.addEventListener("click", (g) => {
      g.preventDefault(), this.options.onAction("switchToSignIn");
    }), v.appendChild(S), b.appendChild(v), o.appendChild(b), e.appendChild(o), e;
  }
  /**
   * 构建邮箱验证视图
   */
  buildVerifyEmailView() {
    const e = document.createElement("div"), { labels: n, state: s } = this.options, r = new G({
      title: n.verifyEmail.title,
      subtitle: n.verifyEmail.subtitle || n.verifyEmail.checkInbox
    });
    this.components.push(r), e.appendChild(r.element);
    const i = document.createElement("div");
    i.className = u.emailIcon;
    const o = document.createElement("div");
    o.style.width = "50px", o.style.height = "10px", o.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='50' height='10' viewBox='0 0 50 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='5' cy='5' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='25' cy='5' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='45' cy='5' r='2' fill='%23D1D5DB'/%3E%3C/svg%3E")`, o.style.backgroundRepeat = "no-repeat", o.style.backgroundPosition = "center", i.appendChild(o);
    const l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    l.setAttribute("xmlns", "http://www.w3.org/2000/svg"), l.setAttribute("width", "59"), l.setAttribute("height", "48"), l.setAttribute("viewBox", "0 0 59 48"), l.setAttribute("fill", "none"), l.style.flexShrink = "0";
    const a = document.createElementNS("http://www.w3.org/2000/svg", "path");
    a.setAttribute("d", "M5.33333 6.66667V2.64907C5.33333 1.18603 6.54749 0 7.97813 0H56.0219C57.4827 0 58.6667 1.18653 58.6667 2.64907V45.3509C58.6667 46.8139 57.4525 48 56.0219 48H7.97813C6.51747 48 5.33333 46.8136 5.33333 45.3509V42.6667H53.3333V11.4667L32 30.6667L5.33333 6.66667ZM0 18.6667H13.3333V24H0V18.6667ZM0 32H21.3333V37.3333H0V32Z"), a.setAttribute("fill", "black"), a.setAttribute("fill-opacity", "0.06"), l.appendChild(a), i.appendChild(l);
    const c = document.createElement("div");
    c.style.width = "50px", c.style.height = "10px", c.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='50' height='10' viewBox='0 0 50 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='5' cy='5' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='25' cy='5' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='45' cy='5' r='2' fill='%23D1D5DB'/%3E%3C/svg%3E")`, c.style.backgroundRepeat = "no-repeat", c.style.backgroundPosition = "center", i.appendChild(c), e.appendChild(i);
    const d = document.createElement("div");
    d.className = u.section;
    const h = new F({
      text: n.verifyEmail.resendButton,
      onClick: async () => {
        await this.options.onAction("resendVerificationEmail");
      },
      variant: "oauth",
      // 使用 OAuth 按钮样式（灰色背景）
      disabled: !!s.resendCountdown,
      fullWidth: !0,
      loading: s.loading
    }), p = h.element.querySelector("span");
    if (p && (p.classList.add("edgespark-auth__countdown-text"), s.resendCountdown)) {
      const m = (n.verifyEmail.resendButtonWithCountdown || n.verifyEmail.resendButton).replace(
        "{seconds}",
        String(s.resendCountdown)
      );
      p.textContent = m;
    }
    return this.components.push(h), d.appendChild(h.element), e.appendChild(d), e;
  }
  /**
   * 构建验证码视图
   */
  buildVerifyCodeView() {
    const e = document.createElement("div"), { labels: n, state: s } = this.options, r = s.data.email || "", i = new G({
      title: n.verifyCode.title,
      subtitle: `${n.verifyCode.sentTo} ${r}`,
      highlightedText: r
    });
    this.components.push(i), e.appendChild(i.element);
    const o = new Me({
      length: 6,
      value: s.data.code || "",
      onChange: (h) => {
        this.options.onStateChange({
          data: { ...s.data, code: h }
        });
      },
      onComplete: async (h) => {
        this.options.onStateChange({
          data: { ...s.data, code: h }
        }), await this.options.onAction("verifyCode");
      },
      error: !!s.error,
      disabled: s.loading
    });
    this.components.push(o), e.appendChild(o.element);
    const l = new Y({
      message: s.errorMessage || "",
      visible: !!s.error
    });
    this.components.push(l), e.appendChild(l.element);
    const a = new F({
      text: n.verifyCode.verifyButton,
      onClick: async () => {
        await this.options.onAction("verifyCode");
      },
      variant: "primary",
      fullWidth: !0,
      loading: s.loading
    });
    this.components.push(a), e.appendChild(a.element);
    const c = document.createElement("div");
    c.className = u.footer;
    const d = new F({
      text: s.resendCountdown ? n.verifyCode.resendCountdown.replace("{seconds}", String(s.resendCountdown)) : n.verifyCode.resendCode,
      onClick: async () => {
        await this.options.onAction("resendCode");
      },
      variant: "oauth",
      fullWidth: !0,
      disabled: !!s.resendCountdown
    });
    return this.components.push(d), c.appendChild(d.element), e.appendChild(c), e;
  }
  /**
   * 构建重置密码视图
   */
  buildResetPasswordView() {
    const e = document.createElement("div"), { labels: n, state: s } = this.options, r = new G({
      title: n.resetPassword.title,
      subtitle: n.resetPassword.subtitle
    });
    s.error && r.element.classList.add("has-error-below"), this.components.push(r), e.appendChild(r.element);
    const i = document.createElement("div");
    i.className = u.section, s.error && i.classList.add("has-error");
    const o = new Y({
      message: s.errorMessage || "",
      visible: !!s.error
    });
    this.components.push(o), i.appendChild(o.element);
    const l = document.createElement("div");
    l.className = u.fields;
    const a = new O({
      type: "email",
      name: "email",
      label: n.resetPassword.emailLabel,
      placeholder: n.resetPassword.emailLabel,
      value: s.data.email || "",
      autocomplete: "email",
      required: !0
    });
    this.components.push(a), l.appendChild(a.element);
    const c = new F({
      text: n.resetPassword.sendResetButton,
      onClick: async () => {
        this.options.onStateChange({
          data: { ...s.data, email: a.getValue() }
        }), await this.options.onAction("sendPasswordReset");
      },
      variant: "primary",
      fullWidth: !0,
      loading: s.loading
    });
    return this.components.push(c), l.appendChild(c.element), i.appendChild(l), e.appendChild(i), e;
  }
  /**
   * 构建设置新密码视图（合并验证码和密码输入）
   */
  buildSetNewPasswordView() {
    const e = document.createElement("div"), { labels: n, state: s } = this.options, r = s.data.email || "", i = new G({
      title: n.setNewPassword.title,
      subtitle: n.setNewPassword.subtitle || "A code has send to"
      // 需要预先创建副标题元素以挂载倒计时
    }), o = i.element.querySelector(`.${u.headerSubtitle}`);
    if (o) {
      o.innerHTML = "", o.append(document.createTextNode(`${n.setNewPassword.subtitle || "A code has send to"} `));
      const y = document.createElement("span");
      y.className = u.highlight, y.textContent = `${r}`, o.appendChild(y), o.append(document.createTextNode(". "));
      const w = document.createElement("span");
      w.className = "edgespark-auth__countdown-text";
      const f = s.resendCountdown;
      if (f != null && f > 0) {
        const b = Math.floor(f / 60), v = f % 60, S = `${String(b).padStart(2, "0")}:${String(v).padStart(2, "0")}`;
        w.textContent = `Resend in ${S}`;
      } else {
        w.textContent = "";
        const b = document.createElement("a");
        b.className = u.link, b.textContent = n.setNewPassword.resendCode || "Resend", b.href = "#", b.addEventListener("click", async (v) => {
          v.preventDefault(), await this.options.onAction("resendPasswordResetCode");
        }), w.appendChild(b);
      }
      o.appendChild(w);
    }
    s.error && i.element.classList.add("has-error-below"), this.components.push(i), e.appendChild(i.element);
    const l = document.createElement("div");
    l.className = u.section, s.error && l.classList.add("has-error");
    const a = new Y({
      message: s.errorMessage || "",
      visible: !!s.error
    });
    this.components.push(a), l.appendChild(a.element);
    const c = new Me({
      length: 6,
      value: s.data.code || "",
      onChange: (y) => {
        this.options.onStateChange({
          data: { ...s.data, code: y }
        });
      },
      onComplete: (y) => {
        this.options.onStateChange({
          data: { ...s.data, code: y }
        });
      }
    });
    this.components.push(c), l.appendChild(c.element);
    const d = document.createElement("div");
    d.className = u.fields;
    const h = new O({
      type: "password",
      name: "password",
      label: n.setNewPassword.newPasswordLabel,
      placeholder: n.setNewPassword.newPasswordLabel,
      value: s.data.password || "",
      autocomplete: "new-password",
      required: !0
    });
    this.components.push(h), d.appendChild(h.element);
    const p = new O({
      type: "password",
      name: "confirmPassword",
      label: n.setNewPassword.confirmPasswordLabel,
      placeholder: n.setNewPassword.confirmPasswordLabel,
      value: s.data.confirmPassword || "",
      autocomplete: "new-password",
      required: !0
    });
    this.components.push(p), d.appendChild(p.element), l.appendChild(d);
    const m = new F({
      text: n.setNewPassword.setPasswordButton,
      onClick: async () => {
        this.options.onStateChange({
          data: {
            ...s.data,
            code: c.getValue(),
            password: h.getValue(),
            confirmPassword: p.getValue()
          }
        }), await this.options.onAction("setNewPassword");
      },
      variant: "primary",
      fullWidth: !0,
      loading: s.loading
    });
    return this.components.push(m), l.appendChild(m.element), e.appendChild(l), e;
  }
  /**
   * 构建修改密码视图
   */
  buildChangePasswordView() {
    const e = document.createElement("div"), { labels: n, state: s } = this.options, r = new G({
      title: n.changePassword.title
    });
    this.components.push(r), e.appendChild(r.element);
    const i = document.createElement("div");
    i.className = u.fields;
    const o = new O({
      type: "password",
      name: "currentPassword",
      label: n.changePassword.currentPasswordLabel,
      value: s.data.currentPassword || "",
      autocomplete: "current-password",
      required: !0
    });
    this.components.push(o), i.appendChild(o.element);
    const l = new O({
      type: "password",
      name: "newPassword",
      label: n.changePassword.newPasswordLabel,
      value: s.data.newPassword || "",
      autocomplete: "new-password",
      required: !0
    });
    this.components.push(l), i.appendChild(l.element);
    const a = new O({
      type: "password",
      name: "confirmPassword",
      label: n.changePassword.confirmPasswordLabel,
      value: s.data.confirmPassword || "",
      autocomplete: "new-password",
      required: !0
    });
    this.components.push(a), i.appendChild(a.element), e.appendChild(i);
    const c = new Y({
      message: s.errorMessage || "",
      visible: !!s.error
    });
    this.components.push(c), e.appendChild(c.element);
    const d = new F({
      text: n.changePassword.changeButton,
      onClick: async () => {
        this.options.onStateChange({
          data: {
            ...s.data,
            currentPassword: o.getValue(),
            newPassword: l.getValue(),
            confirmPassword: a.getValue()
          }
        }), await this.options.onAction("changePassword");
      },
      variant: "primary",
      fullWidth: !0,
      loading: s.loading
    });
    return this.components.push(d), e.appendChild(d.element), e;
  }
  /**
   * 构建成功视图
   */
  buildSuccessView() {
    const e = document.createElement("div"), { labels: n, state: s } = this.options, r = s.data.successType || "sign-in";
    let i, o, l, a;
    switch (r) {
      case "password-changed":
        i = n.success.passwordChanged || "Password Updated", o = n.success.passwordChangedMessage || "You can now sign in with your new password.", l = n.success.backToSignIn || "Back to Sign In", a = "switchToSignIn";
        break;
      case "password-reset":
        i = n.success.passwordReset || "Password Reset", o = n.success.passwordResetMessage || "Your password has been reset successfully.", l = n.success.continueButton, a = "switchToSignIn";
        break;
      case "email-verified":
        i = n.success.emailVerified || "Email Verified", o = n.success.emailVerifiedMessage || "Your email has been verified successfully.", l = n.success.continueButton, a = "continue";
        break;
      case "sign-up":
        i = n.success.title, o = n.success.signUpComplete, l = n.success.continueButton, a = "continue";
        break;
      default:
        i = n.success.title, o = n.success.signInComplete, l = n.success.continueButton, a = "continue";
    }
    const c = new G({
      title: i,
      subtitle: o
    });
    s.error && c.element.classList.add("has-error-below"), this.components.push(c), e.appendChild(c.element);
    const d = document.createElement("div");
    d.className = u.section;
    const h = new F({
      text: l,
      onClick: () => {
        this.options.onAction(a);
      },
      variant: "primary",
      fullWidth: !0
    });
    return this.components.push(h), d.appendChild(h.element), e.appendChild(d), e;
  }
  /**
   * 清理所有组件
   */
  cleanup() {
    this.components.forEach((e) => {
      if (e && typeof e.destroy == "function")
        try {
          e.destroy();
        } catch (n) {
          console.error("Component cleanup error:", n);
        }
    }), this.components = [];
  }
}
const pe = {
  common: {
    orText: "OR",
    loadingText: "Loading...",
    requiredError: "This field is required",
    unknownError: "Something went wrong",
    backButton: "Back",
    continueButton: "Continue",
    confirmButton: "Confirm"
  },
  signIn: {
    title: "Welcome",
    subtitle: "Sign in to Continue",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Continue with email",
    forgotPassword: "Forget Password",
    toggleToSignUp: "Sign up now",
    emailOnlyButton: "Continue with email",
    signUpPrompt: "Don’t have an account?",
    guestPrompt: "Not ready to sign up yet?",
    guestLinkText: "Continue with Temporary Account"
  },
  signUp: {
    title: "Welcome",
    subtitle: "Sign up to Continue",
    nameLabel: "Name",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter new password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm new password",
    signUpButton: "Continue with email",
    toggleToSignIn: "Already have an account?",
    toggleToSignInLink: "Sign in now."
  },
  verifyEmail: {
    title: "Check Your Inbox",
    subtitle: "We've sent a sign-in link to your email. Click it to get started.",
    sentTo: "We sent an email to",
    checkInbox: "Check your inbox and click the verification link to continue",
    notReceived: "Didn't receive the email?",
    resendButton: "Resend Email",
    resendButtonWithCountdown: "Resend Email ({seconds}s)",
    changeEmail: "Change email address",
    emailSent: "Verification email sent successfully"
  },
  verifyCode: {
    title: "Enter verification code",
    sentTo: "We sent a verification code to",
    codeLabel: "Verification code",
    verifyButton: "Verify",
    invalidCode: "Invalid verification code",
    codeExpired: "Verification code has expired",
    resendCode: "Resend code",
    resendCountdown: "Resend in {seconds}s",
    codeSent: "Verification code sent successfully"
  },
  resetPassword: {
    title: "Reset password",
    subtitle: "Enter your email to receive reset instructions",
    emailLabel: "Email",
    sendResetButton: "Send reset link",
    backToSignIn: "Back to sign in",
    emailSent: "Password reset email sent",
    instructions: "We'll send you an email with instructions to reset your password"
  },
  setNewPassword: {
    title: "Set New Password",
    subtitle: "A code has send to",
    newPasswordLabel: "Enter new password",
    confirmPasswordLabel: "Confirm new password",
    setPasswordButton: "Set New Password",
    resendCode: "Resend",
    resendCountdown: "Resend in {seconds}"
  },
  changePassword: {
    title: "Change password",
    currentPasswordLabel: "Current password",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm new password",
    changeButton: "Change password"
  },
  errors: {
    // Frontend/local validation
    INVALID_EMAIL: "Invalid email",
    INVALID_CODE: "Invalid verification code",
    CODE_EXPIRED: "Verification code expired",
    PASSWORD_MISMATCH: "Passwords do not match",
    GENERIC_ERROR: "Something went wrong",
    // Backend/common codes (BetterAuth base)
    USER_NOT_FOUND: "User not found",
    FAILED_TO_CREATE_USER: "Failed to create user",
    FAILED_TO_CREATE_SESSION: "Failed to create session",
    FAILED_TO_UPDATE_USER: "Failed to update user",
    FAILED_TO_GET_SESSION: "Failed to get session",
    INVALID_PASSWORD: "Invalid password",
    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
    SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
    PROVIDER_NOT_FOUND: "Provider not found",
    INVALID_TOKEN: "Invalid token",
    ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
    FAILED_TO_GET_USER_INFO: "Failed to get user info",
    USER_EMAIL_NOT_FOUND: "User email not found",
    EMAIL_NOT_VERIFIED: "Email not verified",
    PASSWORD_TOO_SHORT: "Password too short",
    PASSWORD_TOO_LONG: "Password too long",
    USER_ALREADY_EXISTS: "User already exists",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "User already exists. Use another email.",
    EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
    CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
    SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
    FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
    ACCOUNT_NOT_FOUND: "Account not found",
    USER_ALREADY_HAS_PASSWORD: "User already has a password. Provide that to delete the account.",
    TOO_MANY_ATTEMPTS: "Too many attempts. Try again later."
  },
  oauth: {
    buttonTextPrefix: "Continue with",
    googleBtnName: "Continue with Google",
    githubBtnName: "Continue with GitHub"
  },
  success: {
    title: "Success!",
    signUpComplete: "Your account has been created successfully",
    signInComplete: "Welcome back!",
    passwordReset: "Password reset successfully",
    passwordResetMessage: "Your password has been reset successfully.",
    passwordChanged: "Password Updated",
    passwordChangedMessage: "You can now sign in with your new password.",
    emailVerified: "Email verified successfully",
    emailVerifiedMessage: "Your email has been verified successfully.",
    continueButton: "Continue",
    backToSignIn: "Back to Sign In"
  },
  iframeModal: {
    titleTemplate: "Sign in with {provider}",
    messageTemplate: "{provider} sign-up needs to be completed in a new tab due to preview page limitations.",
    actionButton: "Preview in New Tab"
  }
};
function Jn(t, e) {
  return e ? {
    common: { ...t.common, ...e.common },
    signIn: { ...t.signIn, ...e.signIn },
    signUp: { ...t.signUp, ...e.signUp },
    verifyEmail: { ...t.verifyEmail, ...e.verifyEmail },
    verifyCode: { ...t.verifyCode, ...e.verifyCode },
    resetPassword: { ...t.resetPassword, ...e.resetPassword },
    setNewPassword: { ...t.setNewPassword, ...e.setNewPassword },
    changePassword: { ...t.changePassword, ...e.changePassword },
    errors: { ...t.errors, ...e.errors },
    oauth: { ...t.oauth, ...e.oauth },
    success: { ...t.success, ...e.success },
    iframeModal: { ...t.iframeModal, ...e.iframeModal }
  } : t;
}
class Kn {
  constructor(e) {
    this.container = e.container, this.labels = Jn(pe, e.labels || {}), this.config = e.config, this.authClient = e.authClient, this.onLogin = e.onLogin, this.onError = e.onError, this.redirects = e.redirects, this.onAuthStateChange = e.onAuthStateChange;
  }
  render() {
    if (!(this.container instanceof HTMLElement))
      throw H("UI_INVALID_CONTAINER", "Container must be an HTMLElement");
    this.container.innerHTML = "";
    const e = document.createElement("div");
    e.setAttribute(Qe, ""), this.root = e, this.container.appendChild(e), this.flowManager = new zn({
      authClient: this.authClient,
      config: this.config,
      labels: this.labels,
      onLogin: this.onLogin,
      onError: this.onError,
      redirects: this.redirects,
      onAuthStateChange: this.onAuthStateChange
    }), this.viewFactory = new Ve({
      labels: this.labels,
      config: this.config,
      state: this.flowManager.getState(),
      onAction: this.handleAction.bind(this),
      onStateChange: (n) => {
        n.data && this.flowManager.updateData(n.data);
      }
    }), this.lastState = this.flowManager.getState(), this.unsubscribe = this.flowManager.subscribe((n) => {
      if (this.isCountdownOnlyChange(n)) {
        this.updateCountdownDisplay(n.resendCountdown), this.lastState = n;
        return;
      }
      this.lastState = n, this.renderView();
    }), this.renderView(), this.onAuthStateChange && (this.tokenUnsubscribe = this.onAuthStateChange(async () => {
      var n;
      try {
        const s = await this.authClient.getSession();
        (n = s == null ? void 0 : s.data) != null && n.user && this.onLogin && this.onLogin(s.data.user);
      } catch {
      }
    }));
  }
  /**
   * 渲染视图
   */
  renderView() {
    if (!this.root) return;
    const e = this.flowManager.getState(), n = document.activeElement;
    let s = null;
    if (n && this.root.contains(n)) {
      const o = n;
      if (s = {
        name: o.name,
        type: o.type
      }, o.classList.contains(u.codeInputDigit)) {
        const l = o.closest(`.${u.codeInput}`);
        if (l) {
          const a = l.querySelectorAll(`.${u.codeInputDigit}`);
          s.index = Array.from(a).indexOf(o);
        }
      }
    }
    this.root.innerHTML = "";
    const r = document.createElement("div");
    r.className = u.root, this.viewFactory = new Ve({
      labels: this.labels,
      config: this.config,
      state: e,
      onAction: this.handleAction.bind(this),
      onStateChange: (o) => {
        o.data && this.flowManager.updateData(o.data);
      }
    });
    const i = this.viewFactory.createView();
    if (r.appendChild(i), this.root.appendChild(r), e.flow === "sign-in" && this.config.enableAnonymous) {
      const o = document.createElement("div");
      o.className = u.guestLink;
      const l = this.labels.signIn.guestPrompt || pe.signIn.guestPrompt, a = this.labels.signIn.guestLinkText || pe.signIn.guestLinkText;
      l && o.append(document.createTextNode(`${l} `));
      const c = document.createElement("a");
      c.className = u.link, c.textContent = a, c.href = "#", c.addEventListener("click", async (d) => {
        d.preventDefault();
        const h = this.flowManager.getState();
        h.loading || h.oauthLoadingProvider || h.anonymousLoading || await this.handleAction("signInAnonymous");
      }), o.appendChild(c), this.root.appendChild(o);
    }
    s && setTimeout(() => {
      var l, a;
      let o = null;
      if ((s == null ? void 0 : s.index) !== void 0) {
        const c = (l = this.root) == null ? void 0 : l.querySelector(`.${u.codeInput}`);
        if (c) {
          const d = c.querySelectorAll(`.${u.codeInputDigit}`);
          d[s.index] && (o = d[s.index]);
        }
      } else if (s != null && s.name) {
        const c = (a = this.root) == null ? void 0 : a.querySelector(`input[name="${s.name}"][type="${s.type}"]`);
        c && (o = c);
      }
      if (o && (o.focus(), o instanceof HTMLInputElement)) {
        const c = o.value.length;
        o.setSelectionRange(c, c);
      }
    }, 0);
  }
  /**
   * 更新倒计时显示（不重新渲染整个视图）
   */
  updateCountdownDisplay(e) {
    var r;
    if (!this.root) return;
    const n = this.flowManager.getState(), s = this.root.querySelector(".edgespark-auth__countdown-text");
    if (s) {
      if (n.flow === "verify-email") {
        const i = this.root.querySelector(".edgespark-auth__btn--oauth");
        if (e !== void 0 && e > 0) {
          const o = ((r = this.labels.verifyEmail.resendButtonWithCountdown) == null ? void 0 : r.replace("{seconds}", String(e))) || `Resend Email (${e}s)`;
          s.textContent = o, i && i.setAttribute("disabled", "true");
        } else
          s.textContent = this.labels.verifyEmail.resendButton, i && i.removeAttribute("disabled");
        return;
      }
      if (e !== void 0 && e > 0) {
        const i = Math.floor(e / 60), o = e % 60, l = `${String(i).padStart(2, "0")}:${String(o).padStart(2, "0")}`;
        n.flow === "set-new-password" ? s.textContent = `Resend in ${l}` : n.flow === "verify-code" && (s.textContent = this.labels.verifyCode.resendCountdown.replace("{seconds}", String(e)));
      } else {
        s.innerHTML = "";
        const i = document.createElement("a");
        i.className = u.link, n.flow === "set-new-password" ? i.textContent = this.labels.setNewPassword.resendCode || "Resend" : n.flow === "verify-code" && (i.textContent = this.labels.verifyCode.resendCode), i.href = "#", i.addEventListener("click", async (o) => {
          o.preventDefault(), n.flow === "set-new-password" ? await this.handleAction("resendPasswordResetCode") : n.flow === "verify-code" && await this.handleAction("resendCode");
        }), s.appendChild(i);
      }
    }
  }
  /**
   * 处理动作
   */
  async handleAction(e, n) {
    var s, r, i;
    switch (e) {
      case "signIn":
        await this.flowManager.handleSignIn();
        break;
      case "signUp":
        await this.flowManager.handleSignUp();
        break;
      case "oauthSignIn":
        await this.flowManager.handleOAuthSignIn(n.provider);
        break;
      case "switchToSignIn":
        this.flowManager.transitionTo("sign-in");
        break;
      case "switchToSignUp":
        this.flowManager.transitionTo("sign-up");
        break;
      case "switchToResetPassword":
        (r = (s = this.config.emailPassword) == null ? void 0 : s.config) != null && r.requirePasswordResetEmailVerification && this.flowManager.transitionTo("reset-password");
        break;
      case "resendVerificationEmail":
        await this.flowManager.handleResendVerificationEmail(), this.flowManager.startResendCountdown(60);
        break;
      case "verifyCode":
        await this.flowManager.handleVerifyCode();
        break;
      case "resendCode":
        this.flowManager.startResendCountdown(60);
        break;
      case "sendPasswordReset":
        await this.flowManager.handleSendPasswordReset();
        break;
      case "setNewPassword":
        await this.flowManager.handleSetNewPassword();
        break;
      case "resendPasswordResetCode":
        await this.flowManager.handleResendPasswordResetCode();
        break;
      case "changePassword":
        await this.flowManager.handleChangePassword(n == null ? void 0 : n.revokeOtherSessions);
        break;
      case "continue":
        (i = this.onLogin) == null || i.call(this, { action: "continue" });
        break;
      case "signInAnonymous":
        await this.flowManager.handleAnonymousSignIn();
        break;
      default:
        console.warn("Unknown action:", e);
    }
  }
  /**
   * 切换认证流程（公共 API）
   */
  switchFlow(e) {
    this.flowManager.transitionTo(e);
  }
  /**
   * 获取当前流程（公共 API）
   */
  getCurrentFlow() {
    return this.flowManager.getState().flow;
  }
  /**
   * 销毁组件
   */
  destroy() {
    this.unsubscribe && (this.unsubscribe(), this.unsubscribe = void 0), this.tokenUnsubscribe && (this.tokenUnsubscribe(), this.tokenUnsubscribe = void 0), this.viewFactory && this.viewFactory.cleanup(), this.root && this.root.parentElement && this.root.parentElement.removeChild(this.root);
  }
  isCountdownOnlyChange(e) {
    return this.lastState ? this.shallowEqualStateExceptCountdown(this.lastState, e) && this.lastState.resendCountdown !== e.resendCountdown : !1;
  }
  shallowEqualStateExceptCountdown(e, n) {
    const { resendCountdown: s, ...r } = e, { resendCountdown: i, ...o } = n;
    return this.shallowEqual(r, o);
  }
  shallowEqual(e, n) {
    const s = Object.keys(e), r = Object.keys(n);
    if (s.length !== r.length) return !1;
    for (const i of s)
      if (e[i] !== n[i]) return !1;
    return !0;
  }
}
class Qn {
  constructor(e) {
    this.root = null, this.container = e.container;
  }
  /**
   * 渲染骨架屏到容器
   */
  render() {
    this.container.innerHTML = "";
    const e = document.createElement("div");
    e.setAttribute(Qe, ""), this.root = e;
    const n = document.createElement("div");
    n.className = u.skeleton;
    const s = document.createElement("div");
    s.className = `${u.skeletonItem} ${u.skeletonTitle}`, n.appendChild(s);
    const r = document.createElement("div");
    r.className = `${u.skeletonItem} ${u.skeletonSubtitle}`, n.appendChild(r);
    for (let o = 0; o < 2; o++) {
      const l = document.createElement("div");
      l.className = `${u.skeletonItem} ${u.skeletonInput}`, n.appendChild(l);
    }
    const i = document.createElement("div");
    i.className = `${u.skeletonItem} ${u.skeletonButton}`, n.appendChild(i), e.appendChild(n), this.container.appendChild(e);
  }
  /**
   * 从 DOM 中移除骨架屏
   */
  destroy() {
    this.root && this.root.parentElement && this.root.parentElement.removeChild(this.root), this.root = null;
  }
}
function Zn(t, e) {
  return Tn(t, e);
}
function es(t, e) {
  try {
    const n = new URL(t);
    return n.searchParams.has(e) ? (n.searchParams.delete(e), n.search = n.searchParams.toString(), n.toString()) : t;
  } catch {
    return null;
  }
}
const $e = "es_auth_token";
function ns(t) {
  const { baseUrl: e, fetchCredentials: n = "include" } = t;
  if (!e)
    throw new Error("[EdgeSpark] baseUrl is required");
  const s = new URL(e).origin, r = Xe({ persist: "local" });
  if (typeof window < "u") {
    const w = Zn(window.location.href, $e);
    if (w) {
      r.setToken(w, s);
      const f = es(window.location.href, $e);
      f && f !== window.location.href && window.history.replaceState(null, "", f);
    }
  }
  const i = Ze({ tokenStore: r, baseOrigin: s }), o = [sn()], l = nn({
    baseURL: e,
    basePath: ie,
    plugins: o,
    fetchOptions: {
      credentials: n,
      auth: {
        type: "Bearer",
        token: () => r.getToken(s) || void 0
      },
      customFetchImpl: i
    }
  });
  let a = null, c = null;
  const d = async () => (a || (a = Bn(e).then($n)), a), h = (w = {}) => {
    let f;
    return w.redirects ? f = w.redirects : w.redirectTo && (f = {
      oauth: {
        success: w.redirectTo,
        newUser: w.redirectTo,
        error: w.redirectTo
      },
      emailPassword: w.redirectTo,
      emailVerification: w.redirectTo,
      anonymous: w.redirectTo
    }), {
      labels: w.labels,
      redirects: f,
      onLogin: w.onLogin,
      onError: w.onError
    };
  }, p = {
    renderAuthUI: async (w, f = {}) => {
      var v;
      if (!(w instanceof HTMLElement))
        throw new Error("[EdgeSpark] Container must be an HTMLElement");
      c == null || c.destroy();
      const b = new Qn({ container: w });
      b.render();
      try {
        const S = await d();
        b.destroy(), c = new Kn({
          container: w,
          labels: f.labels || {},
          config: S,
          authClient: l,
          onAuthStateChange: (g) => r.subscribe(g, s),
          ...h(f)
        }), c.render();
      } catch (S) {
        throw b.destroy(), (v = f.onError) == null || v.call(f, S), S;
      }
    },
    // Token management (same API as old AuthClient)
    onAuthStateChange: (w) => r.subscribe(w, s)
  }, m = new Proxy(l, {
    get(w, f, b) {
      return f in p ? p[f] : Reflect.get(w, f, b);
    }
  }), y = {
    fetch: An({
      baseUrl: e,
      fetchCredentials: n
    })
  };
  return {
    auth: m,
    // better-auth + renderAuthUI
    api: y,
    destroy: (w) => {
      c == null || c.destroy(), c = null, a = null, w != null && w.clearToken && r.clear(s);
    }
  };
}
export {
  ns as createEdgeSpark
};
