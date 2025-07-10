import axios from 'axios';
import fs from 'fs';
import nodemailer from 'nodemailer';
import 'dotenv/config';



const API_KEY = process.env.INTAKE_API_KEY;



const businessEmailMap = {
 
  "My Ageless Lounge Note": "christa@skinbychrista.com",
  "Replenish Health Spa Note": "samanthalahall@gmail.com",
  "California Aesthetics Note": "sgatla9@gmail.com",
  "SevenReveries Note": "ale.tkachenko@gmail.com",
  "New SevenReveries Note": "ale.tkachenko@gmail.com",
  "Regenesis Wellness Note": "riley@regenesis-wellness.com",
  "Reclaim Health Note": "info@reclaim-nc.com",
  "Cryogenix Renovation & Recovery":"cryogenixrr@gmail.com",
  "Extravagant Pampering Note": "extravagantpampering@yahoo.com",
  "Impact Body Worx Note": "info@impactbodyworx.com",
  "Vita Nova Medical Note":"info@vitanovamedical.com",
  "Diamond's Unique Wellness Note": "Diamondsuniquewellness@gmail.com",
  "TinyTox Collab Note": "michelle@tinytoxcollab.com",
  "Regen Therapeutics Atlanta Note":"nsprphg@gmail.com",
  "Acne Clinic Note":"sevaramatyakubova44@gmail.com",
  "Sage Revive Note":"rjmalhotra@gmail.com",
  "Dr. Danilevsky Aesthetic Medicine Note":"endorphinmedcorp@gmail.com",
  "Sample Note for Testing":"admin@aderishealth.com"
 
};

// 🟢 Webhook: handles form submission
export const intakeWebhook = async (req, res) => {
  const { NoteId } = req.body;


  if (!NoteId) {
    return res.status(400).json({ message: "Missing IntakeId from webhook" });
  }

  try {
      let fulldetails = await axios.get(`https://intakeq.com/api/v1/notes/${NoteId}`,{
        headers: { "X-Auth-Key": API_KEY }
      })
      const{data} = fulldetails;
  
        const businessName = data?.NoteName?.trim();
     
    const toEmail = businessEmailMap[businessName];
    console.log(toEmail);

    if (!toEmail) {
      console.log(`❌ No matching email found for "${businessName}"`);
      return res.status(404).json({ message: `No matching email found for "${businessName}"` });
    }

    const filePath = await downloadIntakePdf(NoteId);
 

    if (!filePath) {
      return res.status(500).json({ message: "Could not get email or PDF" });
    }

    const sent = await sendEmailWithPdf(filePath,toEmail);
    if (sent) {
      return res.status(200).json({ message: "Email sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send email" });
    }
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// // 🟠 Download PDF
const downloadIntakePdf = async (NoteId) => {
  try {
    const res = await axios.get(`https://intakeq.com/api/v1/notes/${NoteId}/pdf`, {
      headers: { "X-Auth-Key": API_KEY },
      responseType: 'arraybuffer',
    });

    const filePath = `intake-${NoteId}.pdf`;
    fs.writeFileSync(filePath, res.data);
    console.log("✅ PDF downloaded:", filePath);
    return filePath;
  } catch (err) {
    console.error("❌ Error downloading PDF:", err.message);
    return null;
  }
};

// // 🔵 Send email with attachment
const sendEmailWithPdf = async (filePath,toEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.USER_EMAIL}` ,    // e.g. your.email@gmail.com
        pass: `${process.env.USER_PASS}`,     // App password, not your actual Gmail password
      },
    });

    const mailOptions = {
      from: `"MedScape GFE" <info@medscapegfe.com>`,
      to: toEmail,
      subject: 'GFE Documentation – PDF Attached',
      text: 'Please find the GFE note attached in PDF format for your reference',
      attachments: [
        {
          filename: filePath.split("/").pop(),
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
      fs.unlinkSync(filePath);
    console.log("🧹 PDF deleted after sending:", filePath);
    return true;
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    return false;
  }
};

