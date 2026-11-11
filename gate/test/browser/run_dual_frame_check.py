"""Offline check of the DUAL build inside the MainSite frame (the live Stage 2/3 setting).

Reuses the enforce harness's routing (every request answered locally or aborted) but serves the
dual build from /tmp/gatetest/dist-dual. Reproduces the Stage 3 root-acceptance finding: a browser
whose deck frame still holds an anonymous login and a presenter room saved by the pre-gate deck.
No live backend, no real user/session/lead, no provider call, no email.
"""
import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

import run_browser_acceptance as h

h.DIST = Path("/tmp/gatetest/dist-dual")
STALE = {"id": "00000000-0000-4000-8000-0000000000ee", "code": "STAL", "current_slide": "S0-sponsors",
         "is_active": True, "created_at": "2026-11-02T22:07:41Z", "presenter_id": "00000000-0000-4000-8000-0000000000aa"}
SEED = {"user_id": STALE["presenter_id"], "row": STALE}


def seed_script():
    # Runs only in the deck origin; synthetic values only (no real login, token or session).
    return ("if (location.origin === %s && !localStorage.getItem('presenter_session_id')) {"
            "localStorage.setItem('presenter_session_id', %s);"
            "localStorage.setItem('__gate_test_seed', %s);}") % (
        json.dumps(h.DECK), json.dumps(STALE["id"]), json.dumps(json.dumps(SEED)))


def writes():
    return [c["body"] for c in h.B.calls if c["name"] == "__report/write"]


async def framed(browser, seeded):
    h.B.reset(parent="valid", identify="no_session")
    ctx, page = await h.new_page(browser)
    if seeded:
        await ctx.add_init_script(seed_script())
    await page.goto(h.CAPTURE, wait_until="domcontentloaded")
    return ctx, page, page.frame_locator("#deck")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for seeded in (False, True):
            label = "stale presenter room saved" if seeded else "clean frame"
            ctx, page, fr = await framed(browser, seeded)
            try:
                await fr.get_by_text(h.BANNER).wait_for(timeout=12000)
                banner = True
            except Exception:
                banner = False
            await page.wait_for_timeout(1500)
            nonces = await page.evaluate("window.__nonces")
            tokens = await page.evaluate("window.__tokens")
            ids = h.identify_calls()
            body = await page.frames[1].evaluate("document.body.innerText")
            h.check(f"dual/{label}: deck asked MainSite for access", len(nonces) >= 1, f"nonces={len(nonces)}")
            h.check(f"dual/{label}: identify used the parent's token", bool(ids) and ids[0]["auth"] == f"Bearer {tokens[0] if tokens else ''}", f"identify={len(ids)}")
            h.check(f"dual/{label}: not-running notice shown", banner)
            h.check(f"dual/{label}: no saved room shown or driven", "STAL" not in body and not writes(), f"writes={writes()}")
            h.check(f"dual/{label}: no Start Session control in the frame", await fr.get_by_role("button", name="Start Session").count() == 0)
            h.check(f"dual/{label}: no request reached any real backend", not h.backend_leaks(), str(h.backend_leaks()[:3]))
            await page.screenshot(path=str(h.SHOTS / f"dual_{'stale' if seeded else 'clean'}.png"))
            # Keyboard stepping inside the frame must not move any room.
            await page.frames[1].locator("body").click(position={"x": 640, "y": 900})
            for _ in range(3):
                await page.keyboard.press("ArrowRight")
                await page.wait_for_timeout(250)
            h.check(f"dual/{label}: stepping slides writes nothing", not writes(), f"writes={writes()}")
            await ctx.close()
        await browser.close()
    print(f"\n{sum(ok for _, ok, _ in h.RESULTS)}/{len(h.RESULTS)} checks passed")
    return 0 if all(ok for _, ok, _ in h.RESULTS) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
