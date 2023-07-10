const handler = require("../functions/dist/origin-request").handler;

const request = {
  clientIp: "49.207.204.222",
  headers: {
    "x-forwarded-for": [
      {
        key: "X-Forwarded-For",
        value: "49.207.204.222",
      },
    ],
    "user-agent": [
      {
        key: "User-Agent",
        value: "Amazon CloudFront",
      },
    ],
    via: [
      {
        key: "Via",
        value:
          "2.0 76d9b50884e58e2463b175e34e790838.cloudfront.net (CloudFront)",
      },
    ],
    "accept-encoding": [
      {
        key: "Accept-Encoding",
        value: "gzip",
      },
    ],
    "sec-ch-ua": [
      {
        key: "sec-ch-ua",
        value:
          '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      },
    ],
    "sec-ch-ua-mobile": [
      {
        key: "sec-ch-ua-mobile",
        value: "?0",
      },
    ],
    "sec-ch-ua-platform": [
      {
        key: "sec-ch-ua-platform",
        value: '"macOS"',
      },
    ],
    "upgrade-insecure-requests": [
      {
        key: "upgrade-insecure-requests",
        value: "1",
      },
    ],
    "sec-fetch-site": [
      {
        key: "sec-fetch-site",
        value: "none",
      },
    ],
    "sec-fetch-mode": [
      {
        key: "sec-fetch-mode",
        value: "navigate",
      },
    ],
    "sec-fetch-user": [
      {
        key: "sec-fetch-user",
        value: "?1",
      },
    ],
    "sec-fetch-dest": [
      {
        key: "sec-fetch-dest",
        value: "document",
      },
    ],
    host: [
      {
        key: "Host",
        value: "my-bucket-2202.s3.us-east-1.amazonaws.com",
      },
    ],
    "cache-control": [
      {
        key: "Cache-Control",
        value: "max-age=0",
      },
    ],
  },
  method: "GET",
  origin: {
    s3: {
      authMethod: "origin-access-identity",
      customHeaders: {},
      domainName: "my-bucket-2202.s3.us-east-1.amazonaws.com",
      path: "",
      region: "us-east-1",
    },
  },
  querystring: "width=500&height=500&fit=contain&background=green",
  uri: "/a.png",
};

const event = {
  Records: [
    {
      cf: {
        request,
      },
    },
  ],
};

async function main(event) {
  await handler(event);
}

main(event);
