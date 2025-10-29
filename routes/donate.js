const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Notion client and cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const donDb = process.env.DONATE_DB;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); 
// Cache for 5 minutes (adjust TTL as needed)

// GET - Donate Page
router.get('/', async (req, res) => {
    try {
        // Check if data exists in cache
        const cachedDonate = cache.get('donateData');
        if (cachedDonate) {
            return res.render('donate', cachedDonate);
        }

        const responseDon = await notion.databases.query({
            database_id: donDb,
        });

        const donate = responseDon.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            donTitle: page.properties["donTitle"]?.rich_text?.[0]?.plain_text || "",
            donDescription: page.properties["donDescription"]?.rich_text?.[0]?.plain_text || "",
            bankTransferDetails: page.properties["bankTransferDetails"]?.url || "",
            cause: page.properties["cause"]?.url || "",
            taxInfo: page.properties["taxInfo"]?.rich_text?.[0]?.plain_text || "",
        }));

        const locals = {
            Title: donate[0]?.title || "Donate",
            Description: donate[0]?.description || "",
            Keywords: donate[0]?.keywords || "",
            Author: donate[0]?.author || "",
        };

        // Save in cache
        const cacheData = { locals, donate };
        cache.set('donateData', cacheData);

        res.render('donate', cacheData);

    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
