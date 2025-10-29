const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client & cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const mv = process.env.MV_DB;

router.get('/', async (req, res) => {
    try {
        // ✅ Check cache first
        const cachedData = cache.get('missionVisionData');
        if (cachedData) {
            return res.render('mission-vision', cachedData);
        }

        // --- Fetch Mission & Vision DB ---
        const responseMv = await notion.databases.query({
            database_id: mv,
        });

        const missionVision = responseMv.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            mvTitle: page.properties["mvTitle"]?.rich_text?.[0]?.plain_text || "",
            mvDescription: page.properties["mvDescription"]?.rich_text?.[0]?.plain_text || "",

            purpose: page.properties["purpose"]?.url || "",
            vmcards: page.properties["vmcards"]?.rich_text?.[0]?.plain_text || "",
            values: page.properties["values"]?.rich_text?.[0]?.plain_text || "",
            approach: page.properties["approach"]?.rich_text?.[0]?.plain_text || "",
            impact: page.properties["impact"]?.rich_text?.[0]?.plain_text || "",
            mission: page.properties["mission"]?.rich_text?.[0]?.plain_text || "",
        }));

        // --- Metadata ---
        const locals = {
            Title: missionVision[0]?.title,
            Description: missionVision[0]?.description,
            Keywords: missionVision[0]?.keywords,
            Author: missionVision[0]?.author
        };

        const pageData = { locals, missionVision };

        // ✅ Save to cache
        cache.set('missionVisionData', pageData);

        // --- Render page ---
        res.render('mission-vision', pageData);

    } catch (error) {
        console.error('❌ Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
