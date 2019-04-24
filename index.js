const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const config = require('./config');

const updateHolidays = (country, html) => {
  let result = [];
  let $ = cheerio.load(html);

  let $items = $('.zebra tbody tr');
  if ($items.length) {
    $items.each((index, element) => {
      let date = $(element)
        .find('th:first-child')
        .text();
      let holidayName = $(element)
        .find('td:last-child a')
        .text();

      result.push({
        date,
        holidayName
      });
    });

    fs.writeFile(`./holidays/${country}.json`, JSON.stringify(result), err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`${country}.json has been created`);
    });
  }
};

const getHolidays = (country, targetUrl) => {
  let pageUrl = `${targetUrl}/${country}/`;

  https
    .get(
      pageUrl,
      {
        headers: {
          'accept-language': 'en-US,en;'
        }
      },
      res => {
        const statusCode = res.statusCode;

        if (statusCode === 200) {
          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', chunk => (rawData += chunk));
          res.on('end', () => {
            updateHolidays(country, rawData);
          });
        }
      }
    )
    .on('error', e => {
      console.log(`Got error: ${e.message}`);
    });
};

config.countries.forEach(country => {
  console.log(country);
  getHolidays(country, 'https://www.timeanddate.com/holidays/');
});
