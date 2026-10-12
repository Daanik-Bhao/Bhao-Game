import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:4173")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the Sign In page by clicking the 'Sign In' link in the top-right corner of the page.
        # Sign In link
        elem = page.get_by_text('Play Now', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Sign In', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Email field with sen.tathagata5@gmail.com, fill the Password field with 123456, then click the 'Sign In' button to submit the form.
        # Email Address email field
        elem = page.locator('[id="email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("sen.tathagata5@gmail.com")
        
        # -> Fill the Email field with sen.tathagata5@gmail.com, fill the Password field with 123456, then click the 'Sign In' button to submit the form.
        # Password password field
        elem = page.locator('[id="password"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("123456")
        
        # -> Fill the Email field with sen.tathagata5@gmail.com, fill the Password field with 123456, then click the 'Sign In' button to submit the form.
        # Sign In button
        elem = page.get_by_text('Email', exact=True).locator("xpath=ancestor-or-self::*[.//button][1]").get_by_role('button', name='Sign In', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Play Online' button to open the online play / lobby where rooms can be created and managed.
        # Play Online button
        elem = page.get_by_role('button', name='Play Online', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Create a Room' button to create a new multiplayer room and then verify that the newly created room appears in the lobby.
        # Create a Room button
        elem = page.get_by_role('button', name='Create a Room', exact=True)
        await elem.click(timeout=10000)
        
        # -> click
        # Create Room button
        elem = page.get_by_role('button', name='Create Room', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify a newly created room appears in the lobby
        # Assert: The lobby shows the new room invite code 'R4G8LG'.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/div[1]/div[2]/span[1]").nth(0)).to_have_text("R4G8LG", timeout=15000), "The lobby shows the new room invite code 'R4G8LG'."
        # Assert: The lobby shows 'Players ( 1 / 2 )', indicating the room is listed with one player.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/div[2]").nth(0)).to_contain_text("Players ( 1 / 2 )", timeout=15000), "The lobby shows 'Players ( 1 / 2 )', indicating the room is listed with one player."
        # Assert: The lobby lists the host name 'sagar', confirming the created room has a host.
        await expect(page.locator("xpath=/html/body/div[1]/div/div/div[2]").nth(0)).to_contain_text("sagar", timeout=15000), "The lobby lists the host name 'sagar', confirming the created room has a host."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    