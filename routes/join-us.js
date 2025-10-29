const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client & cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const cache = new NodeCache({ stdTTL: 600 }); // cache for 10 minutes

const conDb = process.env.CON_DB;
const joinDb = process.env.JOIN_DB;

router.get('/', async (req, res) => {
    try {
        // ✅ Check cache first
        const cachedData = cache.get('joinPageData');
        if (cachedData) {
            return res.render('join-us', cachedData);
        }

        // --- Fetch Contact DB ---
        const responseCon = await notion.databases.query({ database_id: conDb });
        const contact = responseCon.results.map(page => ({
            conTitle: page.properties["conTitle"]?.rich_text?.[0]?.plain_text || "",
            conDescription: page.properties["conDescription"]?.rich_text?.[0]?.plain_text || "",
            leftContact: page.properties["leftContact"]?.rich_text?.[0]?.plain_text || "",
            rightContact: page.properties["rightContact"]?.rich_text?.[0]?.plain_text || "",
            bgImage: page.properties["bgImage"]?.files?.[0]?.file?.url || "",
            bigMap: page.properties["biggerMap"]?.files?.[0]?.file?.url || "",
            rightConTitle: page.properties["rightConTitle"]?.rich_text?.[0]?.plain_text || "",
            rightConDesc: page.properties["rightConDesc"]?.rich_text?.[0]?.plain_text || "",
            address: page.properties["address"]?.rich_text?.[0]?.plain_text || "",
            phone: page.properties["phone"]?.rich_text?.[0]?.plain_text || "",
            email: page.properties["email"]?.email || "",
            hours: page.properties["hours"]?.rich_text?.[0]?.plain_text || "",
            socials: page.properties["socials"]?.rich_text?.[0]?.plain_text || "",
        }));

        // --- Fetch Join DB ---
        const responseJoin = await notion.databases.query({ database_id: joinDb });
        const join = responseJoin.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',
            joinTitle: page.properties["joinTitle"]?.rich_text?.[0]?.plain_text || "",
            joinDescription: page.properties["joinDescription"]?.rich_text?.[0]?.plain_text || "",
            wayGrid: page.properties["way-grid"]?.rich_text?.[0]?.plain_text || "",
            volunteer: page.properties["volunteer"]?.rich_text?.[0]?.plain_text || "",
            donations: page.properties["donations"]?.rich_text?.[0]?.plain_text || "",
            community: page.properties["community"]?.rich_text?.[0]?.plain_text || "",
            impact: page.properties["impact"]?.rich_text?.[0]?.plain_text || "",
            growth: page.properties["growth"]?.rich_text?.[0]?.plain_text || "",
        }));

        // --- Metadata ---
        const locals = {
            Title: join[0]?.title || "Join Us",
            Description: join[0]?.description || "",
            Keywords: join[0]?.keywords || "",
            Author: join[0]?.author || ""
        };

        const pageData = { locals, contact, join };

        // ✅ Save to cache
        cache.set('joinPageData', pageData);

        // --- Render page ---
        res.render('join-us', pageData);

    } catch (error) {
        console.error('❌ Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
