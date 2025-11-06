const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');
const nodemailer = require('nodemailer');
require('dotenv').config();

// === Notion + Cache Setup ===
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const conDb = process.env.CON_DB;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

// === GET Route ===
router.get('/', async (req, res) => {
    try {
        const cached = cache.get('contactData');
        if (cached) return res.render('contact', cached);

        const responseCon = await notion.databases.query({ database_id: conDb });
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

        const data = { locals, contact };
        cache.set('contactData', data);
        res.render('contact', data);
    } catch (error) {
        console.error('❌ Error fetching Notion data:', error.message);
        res.status(500).send('Failed to fetch data');
    }
});

// === POST Route (Send Email via Brevo SMTP) ===
router.post('/', async (req, res) => {
    const { name, email, number, subject, message } = req.body;

    // Brevo SMTP Transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: {
            name: "Jeevan Jyoti Foundation",
            address: "contact@jeevanjyotifoundation.co.in", // must be verified sender
        },
        to: process.env.USER_GMAIL,
        replyTo: email,
        subject: `📩 New Contact Form Message from ${name}`,
        html: `
    <h2>New Contact Form Submission</h2>
    <p><b>Name:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Phone:</b> ${number}</p>
    <p><b>Subject:</b> ${subject}</p>
    <p><b>Message:</b><br>${message}</p>
  `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully via Brevo!");
        res.render('contact-success', { success: true });
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        res.render('contact-failure', { success: false });
    }
});

module.exports = router;
