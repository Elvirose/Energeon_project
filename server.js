const express = require("express");
const nodemailer = require("nodemailer");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const mongoose = require("mongoose");

const User = require("./models/user");
const Setting = require("./models/setting");
const Bill = require("./models/bill");

let sessionUserEmail = "";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + "/media"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://127.0.0.1:27017/project");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

app.get("/user/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/user/login", (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user != null && req.body.password == user.password) {
      console.log("Authentication successful");
      sessionUserEmail = user.email;
      res.redirect("/views/settings");
    } else {
      console.log("Authentication failed");
      res.redirect("/user/login");
    }
  });
});

app.get("/user/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/user/signup", (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  user.save();
  const emptySetting = new Setting({
    email: req.body.email,
    fan_power: 0,
    bulb_power: 0,
    tv_power: 0,
    wash_power: 0,
    ironbox_power: 0,
    refrigerator_power: 0,
    heater_power: 0,
    oven_power: 0,
    ac_power: 0,
    device1_power: 0,
    device2_power: 0,
    device3_power: 0,
    fan_quantity: 0,
    bulb_quantity: 0,
    tv_quantity: 0,
    wash_quantity: 0,
    ironbox_quantity: 0,
    refrigerator_quantity: 0,
    heater_quantity: 0,
    oven_quantity: 0,
    ac_quantity: 0,
    device1_quantity: 0,
    device2_quantity: 0,
    device3_quantity: 0,
  });
  emptySetting.save();
  res.redirect("/");
});

app.get("/views/optimize", (req, res) => {
  Setting.findOne({ email: sessionUserEmail }).then((settings) => {
    res.render("optimize", { settings });
  });
});

app.get("/views/settings", (req, res) => {
  Setting.findOne({ email: sessionUserEmail }).then((settings) => {
    res.render("settings", { settings });
  });
});

app.get("/chart/doughnut", (req, res) => {
  res.sendFile(__dirname + "/doughnut.html");
});
app.get("/actualbill", (req, res) => {
  res.sendFile(__dirname + "/actualbill.html");
});

app.get("/visualization", (req, res) => {
  res.sendFile(__dirname + "/visualization.html");
});

app.get("/analysis", (req, res) => {
  res.sendFile(__dirname + "/analysis.html");
});

app.post("/save/settings", (req, res) => {
  Setting.findOneAndUpdate(
    { email: sessionUserEmail },
    {
      $set: {
        fan_power: parseInt(req.body.pow_fan) || 0,
        fan_quantity: parseInt(req.body.qty_fan) || 0,
        bulb_power: parseInt(req.body.pow_bulb) || 0,
        bulb_quantity: parseInt(req.body.qty_bulb) || 0,
        tv_power: parseInt(req.body.pow_tv) || 0,
        tv_quantity: parseInt(req.body.qty_tv) || 0,
        wash_power: parseInt(req.body.pow_wash) || 0,
        wash_quantity: parseInt(req.body.qty_wash) || 0,
        ironbox_power: parseInt(req.body.pow_ironbox) || 0,
        ironbox_quantity: parseInt(req.body.qty_ironbox) || 0,
        refrigerator_power: parseInt(req.body.pow_refrigerator) || 0,
        refrigerator_quantity: parseInt(req.body.qty_refrigerator) || 0,
        heater_power: parseInt(req.body.pow_heater) || 0,
        heater_quantity: parseInt(req.body.qty_heater) || 0,
        oven_power: parseInt(req.body.pow_oven) || 0,
        oven_quantity: parseInt(req.body.qty_oven) || 0,
        ac_power: parseInt(req.body.pow_ac) || 0,
        ac_quantity: parseInt(req.body.qty_ac) || 0,
        device1_power: parseInt(req.body.pow_device1) || 0,
        device1_quantity: parseInt(req.body.qty_device1) || 0,
        device2_power: parseInt(req.body.pow_device2) || 0,
        device2_quantity: parseInt(req.body.qty_device2) || 0,
        device3_power: parseInt(req.body.pow_device3) || 0,
        device3_quantity: parseInt(req.body.qty_device3) || 0,
      },
    }
  ).then((doc) => {
    console.log("Update successful");
  });
  // redirect to GET /view/settings
  res.redirect("/views/settings");
});

app.post("/save/optimize", async (req, res) => {
  Bill.findOneAndUpdate(
    { email: sessionUserEmail, yearMonth: req.body.year_month },
    {
      $set: {
        targetBill: parseFloat(req.body.target_bill),
        estimatedBill: parseFloat(req.body.estimated_bill),
      },
    },
    { upsert: true }
  ).then((doc) => {
    console.log("Bill insert/update successful");
  });

  //mail

  const emailBody = `
        Energeon - Electricity Usage Summary (${req.body.year_month})

        Your Target Bill is: ${req.body.target_bill}
        Your Estimated Bill is: ${req.body.estimated_bill}

        Proposed Daily Usage:

        *  Fan Usage: ${req.body.hrs_fan} Hrs
        *  Bulb Usage: ${req.body.hrs_bulb} Hrs
        *  TV Usage: ${req.body.hrs_tv} Hrs
        *  Washing Machine Usage: ${req.body.hrs_wash} Hrs
        *  Iron Box Usage: ${req.body.hrs_ironbox} Hrs
        *  Refrigerator Usage: ${req.body.hrs_refrigerator} Hrs
        *  Heater Usage: ${req.body.hrs_heater} Hrs
        *  Oven Usage: ${req.body.hrs_oven} Hrs
        *  AC Usage: ${req.body.hrs_ac} Hrs
        *  Device 1 Usage: ${req.body.hrs_device1} Hrs
        *  Device 2 Usage: ${req.body.hrs_device2} Hrs
        *  Device 3 Usage: ${req.body.hrs_device3} Hrs
    `;

  const existingPdfBytes = fs.readFileSync(
    "/Users/Sneha Baby Francis/Documents/mini-project/media/template.pdf"
  );
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();
  firstPage.drawText(emailBody, {
    x: 15,
    y: height / 2 + 300,
    font: timesRomanFont,
    size: 12,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(
    "/Users/Sneha Baby Francis/Documents/mini-project/media/attachment.pdf",
    modifiedPdfBytes
  );

  // send email using nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "energeon2025@gmail.com",
      pass: "ujgi dhcn sxva jqdx", // app pass key
    },
  });

  const emailContent = `
        Dear  ${sessionUserEmail},

          In our continued effort to help you manage and optimize your electricity consumption,
          we are pleased to share your Electricity Usage Summary for ${req.body.year_month}

          For a detailed breakdown, please find the attached Electricity Usage Report.
          Thank you for choosing Energeon to manage your energy consumption efficiently.

          Best regards,
          Team Energeon

    `;

  const mailOptions = {
    from: "energeon2025@gmail.com",
    to: sessionUserEmail,
    subject: `Energeon - Electricity Usage Summary (${req.body.year_month})`,
    text: emailContent,
    attachments: [
      {
        filename: "attachment.pdf",
        path: "/Users/Sneha Baby Francis/Documents/mini-project/media/attachment.pdf",
        contentType: "application/pdf",
      },
    ],
  };

  try {
    // send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }

  res.redirect(
    "/chart/doughnut?fan=" +
      req.body.hrs_fan +
      "&bulb=" +
      req.body.hrs_bulb +
      "&tv=" +
      req.body.hrs_tv +
      "&wash=" +
      req.body.hrs_wash +
      "&ironbox=" +
      req.body.hrs_ironbox +
      "&refrigerator=" +
      req.body.hrs_refrigerator +
      "&heater=" +
      req.body.hrs_heater +
      "&oven=" +
      req.body.hrs_oven +
      "&ac=" +
      req.body.hrs_ac +
      "&device1=" +
      req.body.hrs_device1 +
      "&device2=" +
      req.body.hrs_device2 +
      "&device3=" +
      req.body.hrs_device3
  );
});

app.post("/save/actualbill", async (req, res) => {
  Bill.findOneAndUpdate(
    { email: sessionUserEmail, yearMonth: req.body.year_month },
    {
      $set: {
        actualBill: parseFloat(req.body.actual_bill),
      },
    },
    { upsert: true }
  ).then((doc) => {
    console.log("Bill insert/update successful");
  });
  res.sendFile(__dirname + "/visualization.html");
});

app.get("/get-bill-data", async (req, res) => {
  try {
    const bills = await Bill.find({ email: sessionUserEmail }).sort({
      yearMonth: 1,
    }); // Fetch and sort data
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bill data" });
  }
});

app.listen(port, () => {
  console.log("Energeon server is listening on port: " + port);
});
