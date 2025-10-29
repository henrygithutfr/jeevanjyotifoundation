const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Notion client and cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const eventsDb = process.env.EVENTS_DB;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); 
// Cache for 5 minutes (you can increase or decrease this)

// GET - Events Page
router.get('/', async (req, res) => {
    try {
        // Check for cached data first
        const cachedEvents = cache.get('eventsData');
        if (cachedEvents) {
            return res.render('events', cachedEvents);
        }

        const responseEvents = await notion.databases.query({
            database_id: eventsDb,
        });

        const events = responseEvents.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            eventsTitle: page.properties["eventsTitle"]?.rich_text?.[0]?.plain_text || "",
            eventsDescription: page.properties["eventsDescription"]?.rich_text?.[0]?.plain_text || "",
            eventsContainer: page.properties["eventsContainer"]?.url || "",
        }));

        const locals = {
            Title: events[0]?.title || "Events",
            Description: events[0]?.description || "",
            Keywords: events[0]?.keywords || "",
            Author: events[0]?.author || "",
        };

        // Store data in cache
        const cacheData = { locals, events };
        cache.set('eventsData', cacheData);

        res.render('events', cacheData);

    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
