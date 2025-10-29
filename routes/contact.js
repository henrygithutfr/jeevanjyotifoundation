const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize Notion client and cache
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const conDb = process.env.CON_DB;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); 
// stdTTL = 300 seconds (5 min) cache duration, can adjust as needed

// GET - Contact Page
router.get('/', async (req, res) => {
    try {
        // Check if cached data exists
        const cachedContact = cache.get('contactData');
        if (cachedContact) {
            return res.render('contact', cachedContact);
        }

        const responseCon = await notion.databases.query({
            database_id: conDb,
        });

        const contact = responseCon.results.map(page => ({
            title: page.properties.Title?.title?.[0]?.plain_text || 'Unnamed',
            description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
            keywords: page.properties.Keywords?.rich_text?.[0]?.plain_text || '',
            author: page.properties.Author?.rich_text?.[0]?.plain_text || '',
            conTitle: page.properties["conTitle"]?.rich_text?.[0]?.plain_text || "",
            conDescription: page.properties["conDescription"]?.rich_text?.[0]?.plain_text || "",
            leftContact: page.properties["leftContact"]?.rich_text?.[0]?.plain_text || "",
            rightContact: page.properties["rightContact"]?.rich_text?.[0]?.plain_text || "",
            bgImage: page.properties["bgImage"]?.url || "",
            bigMap: page.properties["biggerMap"]?.url || "",
            rightConTitle: page.properties["rightConTitle"]?.rich_text?.[0]?.plain_text || "",
            rightConDesc: page.properties["rightConDesc"]?.rich_text?.[0]?.plain_text || "",
            address: page.properties["address"]?.rich_text?.[0]?.plain_text || "",
            phone: page.properties["phone"]?.rich_text?.[0]?.plain_text || "",
            email: page.properties["email"]?.url || "",
            hours: page.properties["hours"]?.rich_text?.[0]?.plain_text || "",
            socials: page.properties["socials"]?.rich_text?.[0]?.plain_text || "",
        }));

        const locals = {
            Title: contact[0]?.title || "Contact Us",
            Description: contact[0]?.description || "",
            Keywords: contact[0]?.keywords || "",
            Author: contact[0]?.author || "",
        };

        // Store the rendered data in cache
        const cacheData = { locals, contact };
        cache.set('contactData', cacheData);

        res.render('contact', cacheData);

    } catch (error) {
        console.error('Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

// POST - Handle form submission
router.post('/', async (req, res) => {

    const { name, email, number, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_GMAIL,
            pass: process.env.CONTACT_APP_PASS,
        },
    });

    const mailOptions = {
        from: {
            name: 'Jeeva Jyoti Foundation',
            address: process.env.USER_GMAIL
        },
        to: process.env.USER_GMAIL,
        subject: `New Contact Form Submission from ${name}`,
        text: `You got a message from:
Name: ${name}
Email: ${email}
Phone: ${number}
Subject: ${subject}
Message: ${message}`,
        html: `<p><b>Name:</b> ${name}</p>
               <p><b>Email:</b> ${email}</p>
               <p><b>Phone:</b> ${number}</p>
               <p><b>Subject:</b> ${subject}</p>
               <p><b>Message:</b><br>${message}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.render('contact-success', { success: true });
    } catch (error) {
        console.error("Error sending email:", error);
        res.render('contact-failure', { success: false });
    }

});

module.exports = router;
