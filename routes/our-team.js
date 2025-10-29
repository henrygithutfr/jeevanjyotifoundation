const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Notion client and cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const ot = process.env.OT_DB;
const cache = new NodeCache({ stdTTL: 600 }); // cache for 10 minutes (600 sec)

router.get('/', async (req, res) => {
    try {
        // Check cache first
        const cachedData = cache.get('ourTeam');
        if (cachedData) {
            console.log('Serving from cache: ourTeam');
            const { ourTeam, locals } = cachedData;
            return res.render('our-team', { locals, ourTeam });
        }

        // Fetch data from Notion
        const responseOt = await notion.databases.query({
            database_id: ot,   
        });

        const ourTeam = responseOt.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            otTitle: page.properties["otTitle"]?.rich_text?.[0]?.plain_text || "",
            otDescription: page.properties["otDescription"]?.rich_text?.[0]?.plain_text || "",

            founder: page.properties["founder"]?.url || "",
            trustee: page.properties["trustees"]?.rich_text?.[0]?.plain_text || "",
            team: page.properties["team"]?.rich_text?.[0]?.plain_text || "",
            principles: page.properties["principles"]?.rich_text?.[0]?.plain_text || "",
            mission: page.properties["mission"]?.rich_text?.[0]?.plain_text || "",
        }));

        // Locals for page metadata
        const locals = {
            Title: ourTeam[0]?.title,
            Description: ourTeam[0]?.description,
            Keywords: ourTeam[0]?.keywords,
            Author: ourTeam[0]?.author
        };

        // Save to cache
        cache.set('ourTeam', { ourTeam, locals });
        console.log('Data cached: ourTeam');

        res.render('our-team', { locals, ourTeam });
    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
