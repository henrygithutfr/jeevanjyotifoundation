const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Notion client and cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const hisDb = process.env.HISTORY_DB;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); // Cache for 5 minutes

// GET - History Page
router.get('/', async (req, res) => {
    try {
        // ✅ Check cache first
        const cachedHistory = cache.get('historyData');
        if (cachedHistory) {
            return res.render('history', cachedHistory);
        }
        const responseHistory = await notion.databases.query({
            database_id: hisDb,
        });

        const history = responseHistory.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            hisTitle: page.properties["hisTitle"]?.rich_text?.[0]?.plain_text || "",
            hisDescription: page.properties["hisDescription"]?.rich_text?.[0]?.plain_text || "",
            foundingStory: page.properties["foundingStory"]?.url || "",
            timeline: page.properties["timeline"]?.url || "",
            milestones: page.properties["milestones"]?.rich_text?.[0]?.plain_text || "",
            growth: page.properties["growth"]?.url || "",
            legacy: page.properties["legacy"]?.url || "",
            futureVision: page.properties["futureVision"]?.rich_text?.[0]?.plain_text || "",
        }));

        const locals = {
            Title: history[0]?.title || "Our History",
            Description: history[0]?.description || "",
            Keywords: history[0]?.keywords || "",
            Author: history[0]?.author || "",
        };

        // ✅ Save to cache
        const cacheData = { locals, history };
        cache.set('historyData', cacheData);

        res.render('history', cacheData);
    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
