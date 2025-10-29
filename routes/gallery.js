const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Notion client and cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const galDb = process.env.GALLERY_DB;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); // Cache for 5 minutes

// GET - Gallery Page
router.get('/', async (req, res) => {
    try {
        // ✅ Check cache first
        const cachedGallery = cache.get('galleryData');
        if (cachedGallery) {
            return res.render('gallery', cachedGallery);
        }

        const responseGal = await notion.databases.query({
            database_id: galDb,
        });

        const gallery = responseGal.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            galTitle: page.properties["galTitle"]?.rich_text?.[0]?.plain_text || "",
            galDescription: page.properties["galDescription"]?.rich_text?.[0]?.plain_text || "",
            galImages: page.properties["galImages"]?.url || "",
            galText: page.properties["galText"]?.rich_text?.[0]?.plain_text || "",
        }));

        const locals = {
            Title: gallery[0]?.title || "Gallery",
            Description: gallery[0]?.description || "",
            Keywords: gallery[0]?.keywords || "",
            Author: gallery[0]?.author || "",
        };

        // ✅ Save to cache
        const cacheData = { locals, gallery };
        cache.set('galleryData', cacheData);

        res.render('gallery', cacheData);
    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
