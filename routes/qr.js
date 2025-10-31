const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
require('dotenv').config();

router.get('/', async (req, res) => {
    try {

        const locals = {
            Title:  "About Us",
            Description:  "",
            Keywords:  "",
            Author:  "",
        };

        res.render('qr', locals);
    } catch (error) {
        console.error('❌ Error fetching About page data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;
