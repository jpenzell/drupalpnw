"""Offline browser acceptance for the PNW2 gate (enforce build from vite.gate-test.config.ts).

Every request is answered locally by Playwright routing, or aborted and logged:
  https://drupalpnw.lovable.app/**  -> the built candidate in /tmp/gatetest/dist (SPA fallback)
  https://www.joshpenzell.com/p/... -> a synthetic MainSite parent page that mirrors the MainSite
                                       candidate's handshake, or a synthetic capture page
  https://functions.gate.test/**    -> synthetic backend functions (identify/presenter/paid)
  anything else                     -> aborted and recorded
No live backend, no real user/session/lead, no provider call, no email.
"""
import asyncio
import json
import mimetypes
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import async_playwright

DIST = Path("/tmp/gatetest/dist")
SHOTS = Path("/tmp/browser/gate-acceptance")
SHOTS.mkdir(parents=True, exist_ok=True)
DECK = "https://drupalpnw.lovable.app"
MAIN = "https://www.joshpenzell.com"
CAPTURE = f"{MAIN}/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17"
PASSWORD = "synthetic-pass"
LEAD = "lead_" + "a" * 32
SESSION = {"id": "00000000-0000-4000-8000-000000000001", "code": "LIVE", "current_slide": "S1",
           "is_active": True, "created_at": "2026-10-17T18:30:00Z"}

PARENT_HTML = """<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Synthetic MainSite parent</title><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100vh;display:block}</style>
</head><body><iframe id="deck" title="AI for All Minds" src="__SRC__"></iframe><script>
const DECK = "https://drupalpnw.lovable.app", MODE = "__MODE__";
window.__nonces = []; window.__tokens = []; let n = 0;
const frame = document.getElementById("deck");
const reply = (nonce, token) => { window.__tokens.push(token); frame.contentWindow.postMessage({type:"pnw:access-response", nonce, token}, DECK); };
window.addEventListener("message", (event) => {
  // Mirrors MainSite candidate DrupalContactGate: exact origin, exact frame source, nonce <= 128.
  if (event.origin !== DECK || event.data?.type !== "pnw:access-request" ||
      typeof event.data?.nonce !== "string" || event.data.nonce.length > 128) return;
  if (frame.contentWindow !== event.source) return;
  const nonce = event.data.nonce; window.__nonces.push(nonce); n++;
  const token = "eyJhbGciOiJFZERTQSJ9.c3ludGhldGlj." + "tok" + n;
  if (MODE === "silent") return;
  if (MODE === "malformed") return reply(nonce, "not-a-jwt");
  if (MODE === "wrongnonce") {
    reply("forged-" + nonce, "forged.x.y");
    setTimeout(() => { reply(nonce, token); setTimeout(() => reply(nonce, "replayed.x.y"), 300); }, 300);
    return;
  }
  reply(nonce, token);
});
</script></body></html>"""

CAPTURE_HTML = "<!doctype html><title>Synthetic MainSite capture</title><h1>Synthetic MainSite capture page</h1><p>Recording and transcript (free).</p>"


class Backend:
    def __init__(self):
        self.reset()

    def reset(self, parent=None, identify="no_session", ttl=300, iframe_path="/"):
        self.parent = parent  # None -> capture page; else parent handshake mode
        self.identify = identify
        self.ttl = ttl
        self.iframe_path = iframe_path
        self.calls = []
        self.blocked = []
        self.signins = 0
        self.presenter_login = None
        self.presenter_ok = False


B = Backend()


def iso(seconds):
    return (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat()


async def fn_handler(route, req):
    u = urlparse(req.url)
    origin = req.headers.get("origin", DECK)
    cors = {"access-control-allow-origin": origin, "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "authorization, content-type, apikey, x-client-info", "vary": "Origin"}
    if req.method == "OPTIONS":
        return await route.fulfill(status=204, headers=cors)

    def reply(status, body):
        return route.fulfill(status=status, headers={**cors, "content-type": "application/json"}, body=json.dumps(body))

    name = u.path.lstrip("/")
    auth = req.headers.get("authorization", "")
    try:
        body = json.loads(req.post_data or "{}")
    except json.JSONDecodeError:
        body = {}
    B.calls.append({"name": name, "auth": auth, "body": body, "t": time.time()})
    if name == "__report/signin":
        B.signins += 1
        return await reply(200, {})
    if name == "submit-interaction":
        if not re.fullmatch(r"Bearer eyJhbGciOiJFZERTQSJ9\.c3ludGhldGlj\.tok\d+", auth):
            return await reply(401, {"error": "access_required"})
        if body.get("action") == "identify":
            mode = B.identify
            if mode == "revoked":
                return await reply(401, {"error": "access_revoked"})
            if mode == "maintenance":
                return await reply(503, {"error": "maintenance"})
            exp = iso(-5) if mode == "expired" else iso(B.ttl)
            return await reply(200, {"ok": True, "data": {"participant_key": LEAD, "session": SESSION if mode == "session" else None}, "expires_at": exp})
        return await reply(409, {"error": "session_inactive"})
    if name == "create-presenter-session":
        if auth.startswith("Bearer eyJhbGciOiJFZERTQSJ9"):
            return await reply(403, {"error": "attendee_token_not_allowed"})
        if not auth.startswith("Bearer fake-login-"):
            return await reply(401, {"error": "unauthorized"})
        action = body.get("action")
        if action == "authorize":
            if body.get("password") == PASSWORD:
                B.presenter_ok, B.presenter_login = True, auth
                return await reply(200, {"authorized_until": iso(43200)})
            return await reply(401, {"error": "unauthorized"})
        if action == "status":
            ok = B.presenter_ok and auth == B.presenter_login
            return await reply(200, {"authorized_until": iso(43200) if ok else None})
        return await reply(403, {"error": "not_in_this_test"})  # create_session must never be called here
    # paid / other functions: synthetic refusal unless an attendee token or presenter login is present
    if auth.startswith("Bearer eyJhbGciOiJFZERTQSJ9") or (B.presenter_ok and auth == B.presenter_login):
        return await reply(200, {"synthetic": True})
    return await reply(401, {"error": "access_required"})


async def router(route):
    req = route.request
    u = urlparse(req.url)
    host = f"{u.scheme}://{u.netloc}"
    if host == DECK:
        f = DIST / u.path.lstrip("/")
        if not (f.is_file() and DIST in f.resolve().parents):
            f = DIST / "index.html"
        ctype = mimetypes.guess_type(str(f))[0] or "application/octet-stream"
        return await route.fulfill(status=200, body=f.read_bytes(), headers={"content-type": ctype})
    if host == MAIN:
        if u.path == urlparse(CAPTURE).path and B.parent:
            html = PARENT_HTML.replace("__MODE__", B.parent).replace("__SRC__", DECK + B.iframe_path)
            return await route.fulfill(status=200, body=html, headers={"content-type": "text/html"})
        return await route.fulfill(status=200, body=CAPTURE_HTML, headers={"content-type": "text/html"})
    if host == "https://functions.gate.test":
        return await fn_handler(route, req)
    B.blocked.append(req.url)
    return await route.abort()


RESULTS = []


def check(name, ok, detail=""):
    RESULTS.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f" — {detail}" if detail else ""), flush=True)


def identify_calls():
    return [c for c in B.calls if c["name"] == "submit-interaction" and c["body"].get("action") == "identify"]


def backend_leaks():
    return [u for u in B.blocked if "xdbwgmcgadenkzeiehje" in u or "/functions/v1" in u or "/rest/v1" in u or "/auth/v1" in u]


async def new_page(browser, w=1280, h=1800):
    ctx = await browser.new_context(viewport={"width": w, "height": h}, service_workers="block")
    await ctx.route("**/*", router)
    page = await ctx.new_page()
    page.on("pageerror", lambda e: B.calls.append({"name": "__pageerror", "auth": "", "body": {"e": str(e)}, "t": time.time()}))
    return ctx, page


async def framed(browser, mode, identify, ttl=300, w=1280, h=1800, path="/"):
    B.reset(parent=mode, identify=identify, ttl=ttl, iframe_path=path)
    ctx, page = await new_page(browser, w, h)
    await page.goto(CAPTURE, wait_until="domcontentloaded")
    return ctx, page, page.frame_locator("#deck")


NOTICE = "opens from the event page"
ENDED = "access to the interactive presentation has ended"
BANNER = "Live activity isn't running right now"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # 1. Valid parent entry, post-event (no live session), desktop + keyboard navigation
        ctx, page, fr = await framed(browser, "valid", "no_session")
        await fr.get_by_text(BANNER).wait_for(timeout=15000)
        ids = identify_calls()
        nonces = await page.evaluate("window.__nonces")
        tokens = await page.evaluate("window.__tokens")
        check("valid entry: deck opens self-guided with the not-running notice", True)
        check("valid entry: one handshake per load", len(nonces) == 1, f"nonces={len(nonces)}")
        check("valid entry: nonce is random base64url <=128", all(re.fullmatch(r"[A-Za-z0-9_-]{20,128}", n) for n in nonces), str([len(n) for n in nonces]))
        check("valid entry: identify sent the parent's token as Bearer", len(ids) == 1 and ids[0]["auth"] == f"Bearer {tokens[0]}", ids[0]["auth"][:40] if ids else "none")
        check("valid entry: no session controls inside the MainSite frame", await fr.get_by_role("button", name="Start Session").count() == 0)
        check("valid entry: no sign-in, no session creation", B.signins == 0 and not any(c["body"].get("action") == "create_session" for c in B.calls))
        frame = page.frames[1]
        before = await frame.evaluate("document.body.innerText")
        await frame.locator("body").click(position={"x": 640, "y": 900})
        await page.keyboard.press("ArrowRight")
        await page.wait_for_timeout(700)
        after = await frame.evaluate("document.body.innerText")
        check("keyboard: ArrowRight advances the framed deck", before != after)
        await page.screenshot(path=str(SHOTS / "01_valid_no_session_desktop.png"))
        storage = await frame.evaluate("JSON.stringify(Object.keys(localStorage)) + JSON.stringify(Object.keys(sessionStorage)) + location.href")
        check("token not in storage or URL", "tok1" not in storage and "eyJ" not in storage, storage[:160])
        check("valid entry: no request reached any real backend", not backend_leaks(), str(backend_leaks()[:3]))
        await ctx.close()

        # 2. Nonce discipline: forged nonce and replayed response are ignored
        ctx, page, fr = await framed(browser, "wrongnonce", "no_session")
        await fr.get_by_text(BANNER).wait_for(timeout=15000)
        await page.wait_for_timeout(1000)
        used = {c["auth"] for c in identify_calls()}
        check("nonce: forged-nonce and replayed tokens never used", not any("forged" in a or "replayed" in a for a in used), str(used))
        check("nonce: only the matching response was accepted", len(identify_calls()) == 1)
        await ctx.close()

        # 3. Renewal through a fresh handshake before expiry (token TTL 70 s -> renew at ~10 s)
        ctx, page, fr = await framed(browser, "valid", "no_session", ttl=70)
        await fr.get_by_text(BANNER).wait_for(timeout=15000)
        t0 = time.time()
        while time.time() - t0 < 20 and len(await page.evaluate("window.__nonces")) < 2:
            await page.wait_for_timeout(500)
        nonces = await page.evaluate("window.__nonces")
        ids = identify_calls()
        check("renewal: a second handshake ran before expiry", len(nonces) == 2 and nonces[0] != nonces[1], f"nonces={len(nonces)} after {time.time() - t0:.1f}s")
        await page.wait_for_timeout(800)
        ids = identify_calls()
        check("renewal: server re-confirmed with the new token", len(ids) >= 2 and ids[-1]["auth"].endswith("tok2"), str([i["auth"][-5:] for i in ids]))
        await ctx.close()

        # 4. Malformed token from the parent -> ignored -> access denied notice (after wait)
        ctx, page, fr = await framed(browser, "malformed", "no_session")
        await fr.get_by_text(NOTICE).wait_for(timeout=15000)
        check("malformed token: ignored, deck stays closed with event-page notice", len(identify_calls()) == 0)
        await page.screenshot(path=str(SHOTS / "04_malformed_denied.png"))
        await ctx.close()

        # 5. Parent never answers -> denied
        ctx, page, fr = await framed(browser, "silent", "no_session")
        await fr.get_by_text(NOTICE).wait_for(timeout=15000)
        check("silent parent: denied, no identify", len(identify_calls()) == 0)
        await ctx.close()

        # 6. Revoked at MainSite -> denied; free-resource escape to MainSite (top-level)
        ctx, page, fr = await framed(browser, "valid", "revoked")
        await fr.get_by_text(NOTICE).wait_for(timeout=15000)
        link = fr.get_by_role("link", name="Go to the event page")
        check("revoked: denied notice offers the event page", await link.get_attribute("target") == "_top" and await link.get_attribute("href") == CAPTURE)
        B.parent = None
        await link.click()
        await page.wait_for_url(CAPTURE, timeout=10000)
        check("free-resource escape: top window lands on MainSite capture/resources", "Synthetic MainSite capture page" in await page.inner_text("body"))
        await ctx.close()

        # 7. Expired token per server, 8. maintenance -> denied
        for mode, label in (("expired", "expired"), ("maintenance", "maintenance")):
            ctx, page, fr = await framed(browser, "valid", mode)
            await fr.get_by_text(NOTICE).wait_for(timeout=15000)
            check(f"{label}: deck closed with event-page notice", True)
            await ctx.close()

        # 9. Direct (standalone) attendee visits redirect; unsubscribe stays free
        for path in ["/", "/canvas", "/rehearsal", "/connect", "/?join=ABCD", "/S12"]:
            B.reset()
            ctx, page = await new_page(browser)
            await page.goto(DECK + path, wait_until="domcontentloaded")
            try:
                await page.wait_for_url(CAPTURE, timeout=10000)
                ok = True
            except Exception:
                ok = False
            check(f"direct attendee {path}: redirected to MainSite capture", ok and B.signins == 0, page.url)
            await ctx.close()
        B.reset()
        ctx, page = await new_page(browser)
        await page.goto(DECK + "/unsubscribe", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        check("free page /unsubscribe: not redirected", page.url.startswith(DECK + "/unsubscribe"), page.url)
        await ctx.close()

        # 10. Explicit presenter path, keyboard only
        B.reset()
        ctx, page = await new_page(browser)
        await page.goto(DECK + "/presenter", wait_until="domcontentloaded")
        await page.get_by_role("heading", name="Presenter sign-in").wait_for(timeout=10000)
        for _ in range(6):
            await page.keyboard.press("Tab")
            if await page.evaluate("document.activeElement?.type") == "password":
                break
        check("presenter: password field reachable by keyboard", await page.evaluate("document.activeElement?.type") == "password")
        await page.keyboard.type("wrong-password")
        await page.keyboard.press("Enter")
        await page.get_by_role("alert").wait_for(timeout=10000)
        check("presenter: wrong password refused", not B.presenter_ok and "/presenter" in page.url)
        await page.keyboard.press("Control+A")
        await page.keyboard.type(PASSWORD)
        await page.keyboard.press("Enter")
        await page.wait_for_url(re.compile(re.escape(DECK) + r"/(#.*)?$"), timeout=10000)
        await page.wait_for_timeout(1500)
        body = await page.inner_text("body")
        check("presenter: authorized login opens the stage deck", page.url.startswith(DECK + "/") and "/presenter" not in page.url and "Checking access" not in body and "Presenter sign-in" not in body, page.url)
        check("presenter: deliberate Start Session control offered", await page.get_by_role("button", name="Start Session").count() >= 1)
        check("presenter: one deliberate sign-in, no session auto-created",
              B.signins == 1 and not any(c["body"].get("action") == "create_session" for c in B.calls), f"signins={B.signins}")
        await page.screenshot(path=str(SHOTS / "10_presenter_deck.png"))
        await ctx.close()

        # 11. Small screen: framed self-guided + denied notice
        ctx, page, fr = await framed(browser, "valid", "no_session", w=390, h=844)
        await fr.get_by_text(BANNER).wait_for(timeout=15000)
        frame = page.frames[1]
        sw = await frame.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
        check("small screen: no horizontal overflow in the framed deck", sw[0] <= sw[1], str(sw))
        nb = await fr.get_by_role("button", name="Next").first.bounding_box()
        pb = await fr.get_by_role("button", name="Previous").first.bounding_box()
        check("small screen: Previous/Next fully on screen", nb and pb and pb["x"] >= 0 and nb["x"] + nb["width"] <= 390, f"prev={pb and round(pb['x'])} next_right={nb and round(nb['x'] + nb['width'])}")
        await page.screenshot(path=str(SHOTS / "11_small_valid_notice.png"))
        dismiss = fr.get_by_role("button", name="Dismiss")
        await dismiss.focus()
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(300)
        check("small screen: notice dismissible by keyboard", await fr.get_by_text(BANNER).count() == 0)
        await page.screenshot(path=str(SHOTS / "11_small_valid.png"))
        await ctx.close()
        ctx, page, fr = await framed(browser, "valid", "revoked", w=390, h=844)
        await fr.get_by_text(NOTICE).wait_for(timeout=15000)
        frame = page.frames[1]
        sw = await frame.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
        check("small screen: denied notice fits", sw[0] <= sw[1], str(sw))
        await page.screenshot(path=str(SHOTS / "11_small_denied.png"))
        await ctx.close()

        # 12. Live session running: deck joins it, no not-running notice
        ctx, page, fr = await framed(browser, "valid", "session")
        await page.wait_for_timeout(4000)
        check("live session: joined without the not-running notice", await fr.get_by_text(BANNER).count() == 0 and len(identify_calls()) >= 1)
        await page.screenshot(path=str(SHOTS / "12_live_session.png"))
        await ctx.close()

        await browser.close()

    errors = [c for c in B.calls if c["name"] == "__pageerror"]
    print(f"\n{sum(ok for _, ok, _ in RESULTS)}/{len(RESULTS)} checks passed")
    return 0 if all(ok for _, ok, _ in RESULTS) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
