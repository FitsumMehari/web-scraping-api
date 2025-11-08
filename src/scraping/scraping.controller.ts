/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('youtube')
  async getYoutubeData(@Query('channelName') channelName: string) {
    return this.scrapingService.scrapeYoutube(channelName);
  }

  @Get('instagram')
  async getInstagramData(@Query('username') username: string) {
    return this.scrapingService.scrapeInstagram(username);
  }

  @Get('twitter')
  async getTwitterData(@Query('username') username: string) {
    return this.scrapingService.scrapeTwitter(username);
  }

  @Get('tiktok')
  async getTikTokData(@Query('username') username: string) {
    return this.scrapingService.scrapeTikTok(username);
  }

  @Get('facebook')
  async getFacebookData(@Query('pageSlug') pageSlug: string) {
    return this.scrapingService.scrapeFacebookPage(pageSlug);
  }

  @Get('facebook-group')
  async getFacebookGroupData(@Query('pageSlug') pageSlug: string) {
    return this.scrapingService.scrapeFacebookGroup(pageSlug);
  }

  @Get('linkedin')
  async getLinkedinData(@Query('companySlug') companySlug: string) {
    return this.scrapingService.scrapeLinkedinCompany(companySlug);
  }

  @Get('threads')
  async getThreadsData(@Query('username') username: string) {
    return this.scrapingService.scrapeThreadsProfile(username);
  }

  @Get('reddit')
  async getRedditData(@Query('username') username: string) {
    return this.scrapingService.scrapeReddit(username);
  }
}
