const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const aboutDb = process.env.ABOUT_DB;

// Initialize cache (TTL = 300 seconds = 5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

router.get('/', async (req, res) => {
    try {
        // ✅ Check if cached data exists
        const cachedData = cache.get('aboutData');
        if (cachedData) {
            return res.render('about', cachedData);
        }

        const responseAbout = await notion.databases.query({
            database_id: aboutDb,
        });

        const about = responseAbout.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            aboutTitle: page.properties["indexAboutTitle"]?.rich_text?.[0]?.plain_text || "",
            aboutDescription: page.properties["indexAboutDescription"]?.rich_text?.[0]?.plain_text || "",
            indexAboutDetails: page.properties["indexAboutDetails"]?.url || "",
            missionObjectives: page.properties["missionObjectives"]?.rich_text?.[0]?.plain_text || "",
            visionMission: page.properties["visionMission"]?.url || "",
            teamMembers: page.properties["teamMembers"]?.rich_text?.[0]?.plain_text || "",
            governance: page.properties["governance"]?.rich_text?.[0]?.plain_text || "",
            promise: page.properties["promise"]?.rich_text?.[0]?.plain_text || "",
        }));

        const locals = {
            Title: about[0]?.title || "About Us",
            Description: about[0]?.description || "",
            Keywords: about[0]?.keywords || "",
            Author: about[0]?.author || "",
        };

        const renderData = { locals, about };

        // ✅ Store result in cache
        cache.set('aboutData', renderData);

        res.render('about', renderData);
    } catch (error) {
        console.error('❌ Error fetching About page data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
