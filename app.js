'use strict'

const fastify = require('fastify');
const models = require('./models');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const fastifyCron = require('fastify-cron');
const RssParser = require('rss-parser');
const compareAsc = require('date-fns/compareAsc')

const rssParser = new RssParser();
const Entry = models.Entry;

function build(opts={}) {
  const app = fastify(opts);

  app.get('/', async function (request, reply) {
    await Entry.sync();
    const entries = await Entry.findAll();
    return { entries };
  });

  app.get('/update', async function (request, reply) {
    await Entry.sync();
    const entries = await Entry.findAll();

    const feed = await rssParser.parseURL("https://www.gamekult.com/feed.xml");

    const today = new Date();
    const closestEntry = entries.reduce((a, b) => a.pubDate - today < b.pubDate - today ? a : b);
    const closest = new Date(closestEntry.pubDate);

    const items = feed.items
    items.forEach(el => {
      const elDate = new Date(el.pubDate);
      if(compareAsc(elDate, closest) > 0) {
        const obj = {
          guid: el.guid,
          title: el.title,
          creator: el.creator,
          link: el.link,
          pubDate: el.pubDate,
          description: el.content,
          image: el.enclosure.url,
          content: ""
        }
        Entry.create({
            ...obj
        });
      }
    })

    return await Entry.findAll();
  });

  app.get('/fetchContent/:entryId', async function (request, reply) {
    await Entry.sync();
    const id = request.params.entryId
    const entry = await Entry.findAll({
        where: {
            id: id
        }
    });
    if(entry.content == undefined) {
      const entryContent = await fetchContent(entry[0])
      entry[0].content = entryContent
    }
    return {entry}
  });

  return app;
}

async function fetchContent(entry) {
  const response = await fetch(entry.guid, {
      method: 'GET',
  });
  const body = await response.text()
  const root = HTMLParser.parse(body)
  const content = root.querySelector('.gk__content__container')
  return content.toString()
}

module.exports = build;
