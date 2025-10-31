const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

// Notion setup
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const heroDb = process.env.HERO_DB;
const aboutDb = process.env.ABOUT_DB;
const objDb = process.env.OBJ_DB;
const milDb = process.env.MIL_DB;
const conDb = process.env.CON_DB;

// Initialize cache (cache for 5 minutes)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

router.get('/', async (req, res) => {
    try {
        // ✅ Check if homepage data is already cached
        const cachedData = cache.get('homePageData');
        if (cachedData) {
            return res.render('index', cachedData);
        }

        // Fetch from Notion databases
        const [responseHero, responseAbout, responseObj, responseMil, responseCon] = await Promise.all([
            notion.databases.query({ database_id: heroDb }),
            notion.databases.query({ database_id: aboutDb }),
            notion.databases.query({ database_id: objDb }),
            notion.databases.query({
                database_id: milDb,
                sorts: [{ property: 'Index', direction: 'ascending' }],
            }),
            notion.databases.query({ database_id: conDb }),
        ]);

        // Parse data
        const hero = responseHero.results
            .sort((a, b) => (a.properties.Order?.number || 999) - (b.properties.Order?.number || 999))
            .map(page => ({
                order: page.properties.Order?.number || 999,
                title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
                description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
                keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
                author: page.properties.Author?.rich_text?.[0]?.plain_text || '',
                heroTitle: page.properties["heroTitle"]?.rich_text?.[0]?.plain_text || "",
                heroDescription: page.properties["heroDescription"]?.rich_text?.[0]?.plain_text || "",
                img: page.properties["heroImage"]?.url || 'https://via.placeholder.com/1920x1080',
                heroBtn1: {
                    text: page.properties["heroBtn1"]?.rich_text?.[0]?.plain_text || "Learn More",
                    link: page.properties["heroLink1"]?.url || "#"
                },
                heroBtn2: {
                    text: page.properties["heroBtn2"]?.rich_text?.[0]?.plain_text || "Learn More",
                    link: page.properties["heroLink2"]?.url || "#"
                }
            }));

        const about = responseAbout.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',
            aboutTitle: page.properties["aboutTitle"]?.rich_text?.[0]?.plain_text || "",
            aboutParagraph: page.properties["aboutParagraph"]?.rich_text?.[0]?.plain_text || "",
            img: page.properties["aboutImage"]?.url || "",
            aboutBtn: {
                text: page.properties["aboutBtnText"]?.rich_text?.[0]?.plain_text || "Learn More",
                link: page.properties["aboutBtnLink"]?.url || "#"
            }
        }));

        const objective = responseObj.results.map(page => ({
            objTitle: page.properties["objTitle"]?.rich_text?.[0]?.plain_text || "",
            objDescription: page.properties["objDescription"]?.rich_text?.[0]?.plain_text || "",
            objBoxIcon: page.properties["objBoxIcon"]?.rich_text?.[0]?.plain_text || "",
            objBoxTitle: page.properties["objBoxTitle"]?.rich_text?.[0]?.plain_text || "",
            objBoxDescription: page.properties["objBoxDescription"]?.rich_text?.[0]?.plain_text || "",
        }));

        const milestone = responseMil.results.map(page => ({
            Title: page.properties.Name?.title?.[0]?.plain_text || 'Unnamed',
            Description: page.properties["headingDescription"]?.rich_text?.[0]?.plain_text || "",
            milIcon: page.properties["milIcon"]?.rich_text?.[0]?.plain_text || "",
            milNum: page.properties["milNum"]?.rich_text?.[0]?.plain_text || "",
            milTitle: page.properties["milTitle"]?.rich_text?.[0]?.plain_text || "",
            milDescription: page.properties["milDescription"]?.rich_text?.[0]?.plain_text || "",
            milImg: page.properties["milImage"]?.url || "",
        }));

        const contact = responseCon.results.map(page => ({
            conTitle: page.properties["conTitle"]?.rich_text?.[0]?.plain_text || "",
            conDescription: page.properties["conDescription"]?.rich_text?.[0]?.plain_text || "",
            leftContact: page.properties["leftContact"]?.rich_text?.[0]?.plain_text || "",
            rightContact: page.properties["rightContact"]?.rich_text?.[0]?.plain_text || "",
            bgImage: page.properties["bgImage"]?.url || "",
            bigMap: page.properties["biggerMap"]?.url || "",
            map: page.properties["map"]?.url || "",
            rightConTitle: page.properties["rightConTitle"]?.rich_text?.[0]?.plain_text || "",
            rightConDesc: page.properties["rightConDesc"]?.rich_text?.[0]?.plain_text || "",
            address: page.properties["address"]?.rich_text?.[0]?.plain_text || "",
            phone: page.properties["phone"]?.rich_text?.[0]?.plain_text || "",
            email: page.properties["email"]?.url || "",
            hours: page.properties["hours"]?.rich_text?.[0]?.plain_text || "",
            socials: page.properties["socials"]?.rich_text?.[0]?.plain_text || "",
        }));

        const locals = {
            Title: hero[0]?.title,
            Description: hero[0]?.description,
            Keywords: hero[0]?.keywords,
            Author: hero[0]?.author
        };

        // ✅ Save everything to cache
        const cacheData = { locals, hero, about, objective, milestone, contact };
        cache.set('homePageData', cacheData);

        res.render('index', cacheData);
    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
