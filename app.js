const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const { Client } = require("@notionhq/client");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// Import Route Files
// ---------------------
const indexRouter = require("./routes/index");
const aboutRouter = require("./routes/about");
const ourTeamRouter = require("./routes/our-team");
const missionVision = require("./routes/mission-vision");
const legalGovernance = require("./routes/legal-governance");
const history = require("./routes/history");
const ourWork = require("./routes/our-work");
const events = require("./routes/events");
const gallery = require("./routes/gallery");
const joinUsRouter = require("./routes/join-us");
const donateRouter = require("./routes/donate");
const qrRouter = require("./routes/qr");
const contactRouter = require("./routes/contact");
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

// ---------------------
// Initialize Notion
// ---------------------
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const navDb = process.env.NAVBAR_DB;
const footerDb = process.env.FOOTER_DB;

// ---------------------
// Middleware
// ---------------------

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:', 'i.ibb.co'],
      scriptSrc: ["'self'", 'https:', 'http:'],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    },
  })
);
app.use(compression());

app.use(express.static("public", { maxAge: "30d" }));
app.use(morgan('tiny'));

// ---------------------
// Global Navbar & Footer Middleware
// ---------------------
app.use(async (req, res, next) => {
  try {
    // ✅ Fetch Navbar data
    const responseNavbar = await notion.databases.query({
      database_id: navDb,
    });

    const navbar = responseNavbar.results.map((page) => ({
      logo: page.properties["logo"]?.url || "",
      logoText: page.properties["logoText"]?.rich_text?.[0]?.plain_text || "",
      navlink1: page.properties["navlink1"]?.rich_text?.[0]?.plain_text || "",
      navlink2: page.properties["navlink2"]?.rich_text?.[0]?.plain_text || "",
      navlink3: page.properties["navlink3"]?.rich_text?.[0]?.plain_text || "",
      navlink4: page.properties["navlink4"]?.rich_text?.[0]?.plain_text || "",
      navlink5: page.properties["navlink5"]?.rich_text?.[0]?.plain_text || "",
      navlink6: page.properties["navlink6"]?.rich_text?.[0]?.plain_text || "",
      btn1: page.properties["btn1"]?.rich_text?.[0]?.plain_text || "",
      btn2: page.properties["btn2"]?.rich_text?.[0]?.plain_text || "",
      lang: page.properties["lang"]?.rich_text?.[0]?.plain_text || "",
    }));

    // ✅ Fetch Footer data
    const responseFooter = await notion.databases.query({
      database_id: footerDb,
    });

    const footer = responseFooter.results.map((page) => ({
      description: page.properties.logoDescription?.rich_text?.[0]?.plain_text || "",
      logo: page.properties["logo"]?.url || "",
      logoText: page.properties["logoText"]?.rich_text?.[0]?.plain_text || "",
      logoDescription: page.properties["logoDescription"]?.rich_text?.[0]?.plain_text || "",
      socials: page.properties["socials"]?.rich_text?.[0]?.plain_text || "",
      map: page.properties["map"]?.url || "",
      contactInfo: page.properties["contactInfo"]?.url || "",
      quickLinks: page.properties["quickLinks"]?.rich_text?.[0]?.plain_text || "",
      copyrightText: page.properties["copyrightText"]?.rich_text?.[0]?.plain_text || "",
      copyrightLinks: page.properties["copyrightLinks"]?.rich_text?.[0]?.plain_text || "",
    }));

    // ✅ Make navbar/footer accessible in all views
    res.locals.navbar = navbar;
    res.locals.footer = footer;

    next();
  } catch (err) {
    console.error("❌ Error fetching navbar/footer:", err.message);
    next(); // Continue even if Notion fails
  }
});

// ---------------------
// Routes
// ---------------------
app.use("/", indexRouter);
app.use("/about", aboutRouter);
app.use("/about/our-team", ourTeamRouter);
app.use("/about/mission-vision", missionVision);
app.use("/about/legal-governance", legalGovernance);
app.use("/about/history", history);
app.use("/our-work", ourWork);
app.use("/events", events);
app.use("/gallery", gallery);
app.use("/join", joinUsRouter);
app.use("/donate", donateRouter);
app.use("/donate/qr-scanner", qrRouter);
app.use("/contact", contactRouter); // ✅ Only this one — supports GET & POST

// ---------------------
// Server Start
// ---------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
