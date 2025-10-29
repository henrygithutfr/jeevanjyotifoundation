const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Notion client and cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const ow = process.env.OURWORK_DB;
const cache = new NodeCache({ stdTTL: 600 }); // cache for 10 minutes

router.get('/', async (req, res) => {
    try {
        // Check if data exists in cache
        const cachedData = cache.get('ourWork');
        if (cachedData) {
            console.log('Serving from cache: ourWork');
            const { ourWork, locals } = cachedData;
            return res.render('our-work', { locals, ourWork });
        }

        // Fetch data from Notion
        const responseOw = await notion.databases.query({
            database_id: ow,
        });

        const ourWork = responseOw.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            owTitle: page.properties["owTitle"]?.rich_text?.[0]?.plain_text || "",
            owDescription: page.properties["owDescription"]?.rich_text?.[0]?.plain_text || "",

            categories: page.properties["categories"]?.url || "",
            stories: page.properties["stories"]?.url || "",
            progress: page.properties["progress"]?.rich_text?.[0]?.plain_text || "",
            reach: page.properties["reach"]?.url || "",
            involved: page.properties["involved"]?.rich_text?.[0]?.plain_text || "",
        }));

        // Locals for page metadata
        const locals = {
            Title: ourWork[0]?.title,
            Description: ourWork[0]?.description,
            Keywords: ourWork[0]?.keywords,
            Author: ourWork[0]?.author
        };

        // Store data in cache
        cache.set('ourWork', { ourWork, locals });
        console.log('Data cached: ourWork');

        res.render('our-work', { locals, ourWork });
    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
