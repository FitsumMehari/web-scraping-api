/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrapingService {
  /** Scrapes YouTube channel data. */
  async scrapeYoutube(username: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
      await page.goto(`https://www.youtube.com/c/${username}`, {
        waitUntil: 'networkidle2',
      });

      await page.waitForSelector(
        'div.yt-page-header-view-model__page-header-headline-info',
      );

      const data = await page.evaluate(() => {
        const metadataContainer = document.querySelector(
          'yt-content-metadata-view-model.yt-page-header-view-model__page-header-content-metadata',
        );

        if (!metadataContainer) {
          return { subscribers: 'N/A', videos: 'N/A' };
        }

        const statsRow = metadataContainer.querySelector(
          'div.yt-content-metadata-view-model__metadata-row:nth-of-type(2)',
        );

        if (!statsRow) {
          return { subscribers: 'N/A', videos: 'N/A' };
        }

        const statsSpans = statsRow.querySelectorAll('span[role="text"]');

        const subscribers = statsSpans[0]?.textContent?.trim() || 'N/A';

        const videos = statsSpans[1]?.textContent?.trim() || 'N/A';

        return { subscribers, videos };
      });

      await browser.close();
      return data;
    } catch (error) {
      console.error('Error scraping YouTube:', error);
      await browser.close();
      return { error: 'Error occurred while scraping' };
    }
  }

  /** Scrapes Instagram profile data. */
  async scrapeInstagram(username: string): Promise<Record<string, string>> {
    const url = `https://www.instagram.com/${username}/`;

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const fullStatsString =
        $('meta[name="description"]').attr('content')?.split('·')[0]?.trim() ||
        'N/A';

      let followersCount = 'N/A';
      let followingCount = 'N/A';

      if (fullStatsString !== 'N/A') {
        const statsPart = fullStatsString.split('-')[0]?.trim();

        if (statsPart) {
          const parts = statsPart.split(', ');

          if (parts[0]) {
            followersCount = parts[0].replace(' Followers', '').trim();
          }

          if (parts[1]) {
            followingCount = parts[1].replace(' Following', '').trim();
          }
        }
      }

      return {
        followers: followersCount,
        following: followingCount,
      };
    } catch (error) {
      console.error('Instagram Scraping Error:', error);
      throw new InternalServerErrorException(
        'Could not fetch or parse data from Instagram. The site is heavily protected against scraping.',
      );
    }
  }

  /** Scrapes Twitter profile data. */
  async scrapeTwitter(username: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
      // Open the Twitter profile page
      await page.goto(`https://twitter.com/${username}`, {
        waitUntil: 'networkidle2',
      });

      await page.waitForSelector('[data-testid="primaryColumn"]');

      const data = await page.evaluate(() => {
        const followingElement = document.querySelector(
          'a[href*="/following"] > span:first-child span',
        );

        const followersElement = document.querySelector(
          'a[href*="/followers"] > span:first-child span',
        );

        if (!followersElement) {
          const verifiedFollowersElement = document.querySelector(
            'a[href*="/verified_followers"] > span:first-child span',
          );
          if (verifiedFollowersElement) {
            return {
              following: followingElement
                ? followingElement.textContent.trim()
                : 'N/A',
              followers: verifiedFollowersElement.textContent.trim(),
            };
          }
        }

        const following = followingElement
          ? followingElement.textContent.trim()
          : 'N/A';

        const followers = followersElement
          ? followersElement.textContent.trim()
          : 'N/A';

        return { following, followers };
      });

      await browser.close();
      return data;
    } catch (error) {
      console.error('Error scraping Twitter:', error);
      await browser.close();
      return { error: 'Error occurred while scraping' };
    }
  }

  /** Scrapes TikTok profile data. */
  async scrapeTikTok(username: string): Promise<Record<string, string>> {
    let browser: puppeteer.Browser | null = null;
    try {
      const url = `https://www.tiktok.com/@${username}`;

      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      // Use 'networkidle2' for a better chance of full page load, although 'domcontentloaded' can be faster.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // We wait for a general user stats element (e.g., a post item) to ensure the page is loaded.
      await page.waitForSelector('[data-e2e="user-post-item"]', {
        timeout: 10000,
      });

      const data = await page.evaluate(() => {
        // --- ADDED FOLLOWING ELEMENT EXTRACTION ---
        const followingElement = document.querySelector(
          'strong[data-e2e="following-count"]',
        );

        // --- EXISTING FOLLOWERS ELEMENT EXTRACTION ---
        const followersElement = document.querySelector(
          'strong[data-e2e="followers-count"]',
        );

        // --- EXISTING LIKES ELEMENT EXTRACTION ---
        const likesElement = document.querySelector(
          'strong[data-e2e="likes-count"]',
        );

        return {
          // Extract text for all three fields
          following: followingElement?.textContent?.trim() || 'N/A',
          followers: followersElement?.textContent?.trim() || 'N/A',
          likes: likesElement?.textContent?.trim() || 'N/A',
        };
      });

      return data;
    } catch (error) {
      console.error('TikTok Scraping Error:', error);
      throw new InternalServerErrorException(
        'Could not fetch data from TikTok. Check username or site changes.',
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // social-media-scraper.service.ts

  /**
   * Scrapes public Likes and Followers count from a Facebook Page.
   * NOTE: This is highly susceptible to Facebook's login walls and constant UI changes.
   * @param pageSlug The unique slug/username of the Facebook Page (e.g., 'Google').
   */
  async scrapeFacebookPage(pageSlug: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
      // Navigate to the Facebook Page or Group URL
      await page.goto(`https://www.facebook.com/${pageSlug}/`, {
        waitUntil: 'networkidle2',
      });

      // --- Selectors for Page and Group Data ---

      // 1. Selector for Followers Count (for a Page)
      const FOLLOWERS_COUNT_SELECTOR = 'a[href*="/followers/"] strong';

      // 2. TIGHT Selector for Members Count (for a Group, based on the provided HTML)
      // This targets the specific <div> with role="button" that contains the member count.
      const MEMBERS_COUNT_SELECTOR = 'div[role="button"][tabindex="0"]'; // Using role and tabindex is highly unique here

      // Wait for either the page or group selector to be present.
      // If a group is truly private, both waits will fail and we rely on the error check.
      try {
        await Promise.race([
          page.waitForSelector(FOLLOWERS_COUNT_SELECTOR, { timeout: 10000 }),
          page.waitForSelector(MEMBERS_COUNT_SELECTOR, { timeout: 10000 }),
        ]);
      } catch (e) {
        // Continue, the evaluation step will catch the "Go back" message.
      }

      const data = await page.evaluate(
        (followersSelector, membersSelector) => {
          const result = { type: 'Unknown', count: 'N/A' };

          // --- 1. Failure State Check ---
          // Check for the "Go back" failure state, indicating a private or restricted page/group.
          if (document.body.innerText.includes('Go back')) {
            return {
              error:
                'Access restricted or login required (Private Group/Page).',
            };
          }

          // --- 2. Try to find the Members Count (Group) ---
          const membersElement = document.querySelector(membersSelector);
          const membersText = membersElement?.textContent?.trim();

          if (
            membersText &&
            (membersText.includes('members') || membersText.includes('member'))
          ) {
            // Found the group members count
            result.type = 'Group';
            result.count = membersText;
            return result;
          }

          // --- 3. Try to find the Followers Count (Page) ---
          const followersElement = document.querySelector(followersSelector);
          if (followersElement) {
            result.type = 'Page';
            // Extract the text content, which should be the formatted count (e.g., "5.8M")
            result.count = followersElement.textContent?.trim() || 'N/A';
            return result;
          }

          // If no specific selector matched, it might be a public page with a different layout.
          return result;
        },
        FOLLOWERS_COUNT_SELECTOR,
        MEMBERS_COUNT_SELECTOR,
      );

      await browser.close();
      return data;
    } catch (error) {
      console.error(`Error scraping Facebook page/group '${pageSlug}':`, error);
      await browser.close();
      return { error: 'Error occurred while scraping' };
    }
  }

  async scrapeFacebookGroup(pageSlug: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
      // --- ROBUST URL Construction (Group Priority) ---
      let targetUrl = `https://www.facebook.com/groups/${pageSlug}/`;

      // Navigate to the Facebook Group URL
      await page.goto(targetUrl, {
        waitUntil: 'networkidle2',
      });

      // --- Selectors and XPaths ---
      const FOLLOWERS_COUNT_SELECTOR = 'a[href*="/followers/"] strong';
      // Robust XPath that searches for any element containing the text 'member' or 'members'
      const MEMBERS_COUNT_XPATH =
        "//div[contains(text(), 'member') or contains(text(), 'members')]";

      // Wait for the most reliable element (XPath for groups, or selector for pages)
      try {
        await page.waitForSelector(MEMBERS_COUNT_XPATH, { timeout: 15000 });
      } catch (e) {
        try {
          await page.waitForSelector(FOLLOWERS_COUNT_SELECTOR, {
            timeout: 5000,
          });
        } catch (err) {
          // Continue to evaluation for error checks
        }
      }

      // 1. Scrape Data using page.evaluate
      const data = await page.evaluate(
        (followersSelector, membersXPath) => {
          const result = { type: 'Unknown', rawCount: 'N/A' };

          // --- Failure/Access Check ---
          if (
            document.body.innerText.includes('Go back') ||
            document.body.innerText.includes('Log In')
          ) {
            return { error: 'Access restricted or login required.' };
          }

          // --- Try to find the Members Count (Group) using XPath ---
          const membersNode = document.evaluate(
            membersXPath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
          ).singleNodeValue as HTMLElement;

          if (membersNode) {
            const membersText = membersNode.textContent?.trim();
            if (membersText) {
              result.type = 'Group';
              result.rawCount = membersText;
              return result;
            }
          }

          // --- Try to find the Followers Count (Page) ---
          const followersElement = document.querySelector(followersSelector);
          if (followersElement) {
            result.type = 'Page';
            result.rawCount = followersElement.textContent?.trim() || 'N/A';
            return result;
          }

          return result;
        },
        FOLLOWERS_COUNT_SELECTOR,
        MEMBERS_COUNT_XPATH,
      );

      await browser.close();

      // 2. --- INLINE DATA CLEANING LOGIC (TypeScript Safe) ---
      // Use the 'in' operator for safe property access.
      if ('rawCount' in data && data.rawCount && data.rawCount !== 'N/A') {
        let countText = data.rawCount;
        let cleaned = countText.toLowerCase().replace(/[^0-9.km,]/g, '');
        let multiplier = 1;

        if (cleaned.endsWith('m')) {
          multiplier = 1000000;
          cleaned = cleaned.slice(0, -1);
        } else if (cleaned.endsWith('k')) {
          multiplier = 1000;
          cleaned = cleaned.slice(0, -1);
        }

        // Remove commas for clean parsing
        cleaned = cleaned.replace(/,/g, '');

        const numericValue = parseFloat(cleaned);
        const cleanNumber = isNaN(numericValue)
          ? 0
          : Math.floor(numericValue * multiplier);

        // Return the final clean object
        return {
          type: data.type,
          rawCount: data.rawCount,
          cleanCount: cleanNumber, // The standardized number
        };
      }

      // Return the error object or the unpopulated data object
      return data;
    } catch (error) {
      console.error(`Error scraping Facebook page/group '${pageSlug}':`, error);
      await browser.close();
      return { error: 'Error occurred while scraping' };
    }
  }
  // social-media-scraper.service.ts

  /**
   * Scrapes the public follower count from a LinkedIn Company page.
   * @param companySlug The unique slug of the LinkedIn Company (e.g., 'microsoft').
   */
  async scrapeLinkedinCompany(companySlug: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito'],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    try {
      // NOTE: Assume loginToLinkedIn has been successfully called here
      // ... (Login logic goes here)

      // Navigate to the company page while logged in
      await page.goto(`https://www.linkedin.com/company/${companySlug}/`, {
        // Wait until there are no more than 2 network connections for at least 500ms
        waitUntil: 'networkidle2',
      });

      // --- Selectors for evaluation ---
      // 1. CSS Selector for the element containing the location and follower count
      const FOLLOWER_CONTAINER_SELECTOR = '.top-card-layout__first-subline';
      // 2. CSS Selector for the element containing the employee count text
      const EMPLOYEE_COUNT_SELECTOR = 'p.face-pile__text';

      // Wait for the main container of the top card to ensure page is loaded
      await page.waitForSelector('.top-card-layout__entity-info-container', {
        timeout: 15000,
      });

      // --- Data Evaluation (Scraping) ---
      const data = await page.evaluate(
        (followerContainerSelector, employeeSelector) => {
          const result = { followers: 'N/A', employees: 'N/A' };

          // --- 1. Scrape Follower Count (Content Search in H3) ---
          const followerContainer = document.querySelector(
            followerContainerSelector,
          );

          if (followerContainer) {
            const text = followerContainer.textContent?.trim() || '';
            // Regex to capture the number before the word "followers"
            // It handles spaces and commas
            const match = text.match(/([\d,]+)\s+followers/);
            if (match && match[1]) {
              result.followers = match[1];
            }
          }

          // --- 2. Scrape Employee Count (Content Search in P) ---
          const employeeElement = document.querySelector(employeeSelector);

          if (employeeElement) {
            const employeesText = employeeElement.textContent?.trim() || '';
            // Regex to capture the number before the word "employees"
            const match = employeesText.match(/(\d[\d,]*)\s+employees/);
            if (match && match[1]) {
              result.employees = match[1];
            }
          }

          // Final Check: If both are N/A, we still failed to get the data.
          if (result.followers === 'N/A' && result.employees === 'N/A') {
            // Re-checking for login wall just in case.
            if (
              document.body.innerText.includes('Sign in') ||
              document.body.innerText.includes('Join now')
            ) {
              return {
                error: 'Access blocked: Sign-in prompt found after navigation.',
              };
            }
            return {
              error:
                'Scraping failed: Data elements were not found after page load.',
            };
          }

          return result;
        },
        FOLLOWER_CONTAINER_SELECTOR,
        EMPLOYEE_COUNT_SELECTOR,
      );

      await browser.close();
      return data;
    } catch (error) {
      console.error('Fatal error during LinkedIn scraping:', error);
      await browser.close();
      return {
        error:
          'Fatal error occurred during scraping. Check network/credentials.',
      };
    }
  }

  // social-media-scraper.service.ts

  /**
   * Conceptual method to scrape a Threads profile's follower count.
   * NOTE: Threads' web UI is highly inconsistent for scraping and often requires login.
   * This is a conceptual example for a Threads profile URL structure.
   * @param username The username of the Threads profile.
   */
  async scrapeThreadsProfile(username: string) {
    // Input validation check
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return { error: 'Invalid or missing username provided.' };
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
      await page.goto(`https://www.threads.net/@${username}`, {
        // Use 'domcontentloaded' as Threads relies heavily on JS
        waitUntil: 'domcontentloaded',
      });

      // --- ROBUST XPATH (No change to the XPath string itself) ---
      const FOLLOWER_XPATH = "//span[contains(text(), 'followers')]/..";

      // 1. Scroll the page to ensure the element is loaded into the viewport
      await page.evaluate(() => window.scrollTo(0, 150));

      // 2. CRITICAL FIX: Use page.waitForSelector and prefix the XPath with 'xpath/'
      await page.waitForSelector(`xpath/${FOLLOWER_XPATH}`, { timeout: 45000 });

      const data = await page.evaluate((xpath) => {
        // --- Find Element using XPath ---
        // Note: document.evaluate remains the correct way to find the element inside evaluate()
        const followerNode = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue as HTMLElement;

        if (!followerNode) {
          return { error: 'Follower element not found.', rawFollowers: 'N/A' };
        }

        // The text content will be the full string, e.g., "1.7M followers"
        const followersText = followerNode.textContent?.trim() || 'N/A';

        // --- INLINE DATA CLEANING LOGIC ---
        if (followersText !== 'N/A') {
          // Isolate the count part (e.g., "1.7M")
          const rawCountText = followersText.split(' ')[0] || 'N/A';
          let cleaned = rawCountText.toLowerCase().replace(/[^0-9.km,]/g, '');

          let multiplier = 1;

          if (cleaned.endsWith('m')) {
            multiplier = 1000000;
            cleaned = cleaned.slice(0, -1);
          } else if (cleaned.endsWith('k')) {
            multiplier = 1000;
            cleaned = cleaned.slice(0, -1);
          }

          const numericValue = parseFloat(cleaned);
          const cleanCount = isNaN(numericValue)
            ? 0
            : Math.floor(numericValue * multiplier);

          return {
            rawFollowers: followersText, // Full text (e.g., "1.7M followers")
            cleanFollowers: cleanCount, // Integer (e.g., 1700000)
          };
        }

        return { rawFollowers: followersText };
      }, FOLLOWER_XPATH); // Pass the raw XPath string to evaluate()

      await browser.close();
      return data;
    } catch (error) {
      await browser.close();

      if (error instanceof Error && error.message.includes('timeout')) {
        console.error(`Timeout waiting for element on @${username}.`);
        return {
          error: `Profile not found, restricted, or loading failed for @${username}. (Timeout)`,
        };
      }

      console.error(`Error scraping Threads profile @${username}:`, error);
      return { error: 'An unexpected error occurred while scraping.' };
    }
  }
}
