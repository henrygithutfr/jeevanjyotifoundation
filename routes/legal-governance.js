const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client & cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const cache = new NodeCache({ stdTTL: 600 }); // cache for 10 minutes

const lg = process.env.LG_DB;

router.get('/', async (req, res) => {
    try {
        // ✅ Check cache first
        const cachedData = cache.get('legalGovernanceData');
        if (cachedData) {
            return res.render('legal-governance', cachedData);
        }

        // --- Fetch Legal Governance DB ---
        const responseLg = await notion.databases.query({
            database_id: lg,
        });

        const legalGovernance = responseLg.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',

            lgTitle: page.properties["govTitle"]?.rich_text?.[0]?.plain_text || "",
            lgDescription: page.properties["govDescription"]?.rich_text?.[0]?.plain_text || "",

            trustee: page.properties["trustee"]?.url || "",
            framework: page.properties["framework"]?.rich_text?.[0]?.plain_text || "",
            complines: page.properties["complines"]?.rich_text?.[0]?.plain_text || "",
            policies: page.properties["policies"]?.rich_text?.[0]?.plain_text || "",
            financial: page.properties["financial"]?.rich_text?.[0]?.plain_text || "",
            documents: page.properties["documents"]?.rich_text?.[0]?.plain_text || "",
            contact: page.properties["contact"]?.rich_text?.[0]?.plain_text || "",
        }));

        // --- Metadata ---
        const locals = {
            Title: legalGovernance[0]?.title,
            Description: legalGovernance[0]?.description,
            Keywords: legalGovernance[0]?.keywords,
            Author: legalGovernance[0]?.author
        };

        const pageData = { locals, legalGovernance };

        // ✅ Save to cache
        cache.set('legalGovernanceData', pageData);

        // --- Render page ---
        res.render('legal-governance', pageData);

    } catch (error) {
        console.error('❌ Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
