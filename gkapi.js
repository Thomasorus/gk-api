'use strict'

const fastify = require('fastify')();
const models = require('./models');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const RssParser = require('rss-parser');
const compareAsc = require('date-fns/compareAsc')
const parseISO = require('date-fns/parseISO')

fastify.register(require('fastify-rate-limit'), {
    max: 100,
    timeWindow: '1 minute'
})


fastify.register(require('fastify-cors'), {
  origin: true,
  methods: ["GET"]
})


const rssParser = new RssParser();
const Entry = models.Entry;

function build(opts={}) {

  fastify.get('/', async function (request, reply) {
    await Entry.sync();
    const entries = await Entry.findAll();

    entries.sort(function(a,b){
      const aTime = new Date(a.pubDate)
      const bTime = new Date(b.pubDate)
      return bTime - aTime
    });

    return { entries };
  });

  fastify.get('/update', async function (request, reply) {

    const feed = await rssParser.parseURL("https://www.gamekult.com/feed.xml?page=3");
    const items = feed.items

    await Entry.sync();
    const entries = await Entry.findAll();

    let  closest = null
    if(entries.length > 0) {
      const today = new Date();
      const closestEntry = entries.reduce((a, b) => a.pubDate - today < b.pubDate - today ? a : b);
      closest = new Date(closestEntry.pubDate);
    }

    items.forEach(el => {
      if (closest) {
        const elDate = new Date(el.pubDate)
        const compare = compareAsc(closest, elDate)
        console.log({elDate})
        console.log({compare})
          if(compare === -1) {
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
      } else {
        // If closest does not exist then there's 0 entries, create them all
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

    const newEntries = await Entry.findAll();

    newEntries.sort(function(a,b){
      const aTime = new Date(a.pubDate)
      const bTime = new Date(b.pubDate)
      return bTime - aTime
    });

    return newEntries
  });

  fastify.get('/fetchContent/:entryId', async function (request, reply) {
    await Entry.sync();
    const id = request.params.entryId
    const entry = await Entry.findAll({
        where: {
            id: id
        }
    });
    if(entry.content == undefined) {
      const entryContent = await fetchContent(entry[0])
      const cleanedContent = entryContent
          .replace(/src=".*.svg"/g, "")
          .replace(/data-src=/g, "src=")
          .replace(/w283.jpg/g, "w500.jpg")
          .replace(/h200.jpg/g, 'h500.jpg')
      entry[0].content = cleanedContent
    }
    return {entry}
  });

  return fastify;
}

async function fetchContent(entry) {
  const response = await fetch(entry.guid, {
      method: 'GET',
  });
  const body = await response.text()
  const options = {
  lowerCaseTagName: false,
  comment: false,
  blockTextElements: {
    script: false, // keep text content when parsing
    noscript: true, // keep text content when parsing
    style: false,    // keep text content when parsing
    pre: false     // keep text content when parsing
  }
}
  const root = HTMLParser.parse(body, options)
  const content = root.querySelector('.gk__content__container')
  return content.toString()
}

module.exports = build;
