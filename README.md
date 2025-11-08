# Social Media Scraper - Backend

This is the backend for the Social Media Scraper application. It is built with NestJS and provides a RESTful API for scraping data from various social media platforms.

## Description

This NestJS application uses `puppeteer` and `cheerio` to scrape data from YouTube, Instagram, Twitter, TikTok, Facebook, LinkedIn, and Threads. It provides a set of API endpoints that can be used to retrieve data from these platforms.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

The backend provides the following API endpoints:

- `GET /scraping/youtube?channelName=<channel_name>`
- `GET /scraping/instagram?username=<username>`
- `GET /scraping/twitter?username=<username>`
- `GET /scraping/tiktok?username=<username>`
- `GET /scraping/facebook?pageSlug=<page_slug>`
- `GET /scraping/facebook-group?pageSlug=<page_slug>`
- `GET /scraping/linkedin?companySlug=<company_slug>`
- `GET /scraping/threads?username=<username>`

## Stay in touch

- Author - [Your Name](https://your-website.com)
- Website - [https://your-website.com](https://your-website.com)
- Twitter - [@your-twitter](https://twitter.com/your-twitter)

## License

Nest is [MIT licensed](LICENSE).
