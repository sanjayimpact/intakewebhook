import axios from 'axios';
import fs from 'fs';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const API_KEY = process.env.INTAKE_API_KEY;


// 🟢 Webhook: handles form submission
export const intakeWebhook = async (req, res) => {
  const { NoteId } = req.body;

  if (!NoteId) {
    return res.status(400).json({ message: "Missing IntakeId from webhook" });
  }

  try {
    const filePath = await downloadIntakePdf(NoteId);
 

    if (!filePath) {
      return res.status(500).json({ message: "Could not get email or PDF" });
    }

    const sent = await sendEmailWithPdf(filePath);
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

    const filePath = `./pdfs/intake-${NoteId}.pdf`;
    fs.writeFileSync(filePath, res.data);
    console.log("✅ PDF downloaded:", filePath);
    return filePath;
  } catch (err) {
    console.error("❌ Error downloading PDF:", err.message);
    return null;
  }
};

// // 🔵 Send email with attachment
const sendEmailWithPdf = async (filePath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "sanjay.impactmindz@gmail.com" ,    // e.g. your.email@gmail.com
        pass: 'yucmlwtuaxdgpgrj',     // App password, not your actual Gmail password
      },
    });

    const mailOptions = {
      from: `"MedScape GFE" <${process.env.EMAIL_USER}>`,
      to: "sanjay.impactmindz@gmail.com",
      subject: 'Your Intake Form PDF',
      text: 'Please find your intake form attached as a PDF.',
      attachments: [
        {
          filename: filePath.split("/").pop(),
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  
    return true;
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    return false;
  }
};

// export const intakeWebhook = async(req,res)=>{
//   try{
//         console.log(req.body);
//   }catch(err){
//     console.log(err);
//   }
// }