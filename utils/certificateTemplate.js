const fs = require("fs")
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib")
const QRCode = require("qrcode")
const fontkit = require("fontkit")
const path = require("path")
const logger = require("@logger")

const formatDate = (issueDate) => {
  const options = { day: "numeric", month: "long", year: "numeric" }
  const date = new Date(issueDate)
  return date.toLocaleDateString("en-US", options)
}

async function getImageMimeType(url) {
  const res = await fetch(url, { method: "HEAD" }) // just fetch headers
  return res.headers.get("content-type") // e.g., image/jpeg or image/png
}

async function generateCertificate(
  name,
  course,
  grade,
  courseDuration,
  issueDate,
  certificateId,
  sid,
  regId,
  instructorName,
  instructorSign
) {
  // Importing the Template

  try {
    const pdfPath = path.join(__dirname, "templates", "pdf", "certificate.pdf")
    const pdfBytes = fs.readFileSync(pdfPath) // Read file as buffer
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const page = pdfDoc.getPages()[0]

    // Generate QR Code
    const qrDataUrl = await QRCode.toDataURL(
      `https://lifelineitinstitute.com/certificate?find=${certificateId}`
    )
    const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64")
    const qrImage = await pdfDoc.embedPng(qrImageBytes)

    const qrDims = qrImage.scale(0.4)

    page.drawImage(qrImage, {
      x: 702,
      y: 360,
      width: qrDims.width,
      height: qrDims.height,
    })

    const response = await fetch(instructorSign)
    const arrayBuffer = await response.arrayBuffer()
    const imageBytes = Buffer.from(arrayBuffer)

    const signDims = qrImage.scale(0.6)
    const imgType = await getImageMimeType(instructorSign)

    let image
    if (imgType == "image/jpeg" || imgType == "image/jpg") {
      image = await pdfDoc.embedJpg(imageBytes)
    } else if (imgType == "image/png") {
      image = await pdfDoc.embedPng(imageBytes)
    } else {
      throw new Error(
        "Unsupported image format. Only JPEG and PNG are allowed."
      )
    }

    page.drawImage(image, {
      x: 140,
      y: 93,
      width: signDims.width,
      height: signDims.height,
    })

    // Initializing for using custom fonts
    pdfDoc.registerFontkit(fontkit)

    // Embed the font
    const exomediumFontBytes = fs.readFileSync(
      path.join(__dirname, "./fonts/exomedium.otf")
    )
    const robotoFontBytes = fs.readFileSync(
      path.join(__dirname, "./fonts/roboto.ttf")
    )
    const robotoBoldFontBytes = fs.readFileSync(
      path.join(__dirname, "./fonts/robotobold.ttf")
    )

    const exomediumFont = await pdfDoc.embedFont(exomediumFontBytes)
    const robotoFont = await pdfDoc.embedFont(robotoFontBytes)
    const robotoBoldFont = await pdfDoc.embedFont(robotoBoldFontBytes)

    const { width } = page.getSize() // Get Page Width
    const centerX = width / 2 // Page's Center (divided by 2)

    // Get text width (How long width the text will take) in PDF points
    const nameTextWidth = exomediumFont.widthOfTextAtSize(name, 25)

    // Calculate X position to center the text
    let x = centerX - nameTextWidth / 2

    page.drawText(name, {
      x,
      y: 295,
      size: 25,
      font: exomediumFont,
      color: rgb(0, 0, 0),
    })

    const courseTextWidth = robotoFont.widthOfTextAtSize(course, 18)

    x = centerX - courseTextWidth / 2

    page.drawText(course, {
      x: x + courseTextWidth * 0.1,
      y: 210,
      size: 16,
      font: robotoBoldFont,
      color: rgb(0 / 255, 146 / 255, 210 / 255),
    })

    page.drawText(grade, {
      x: 603,
      y: 234,
      size: 16,
      font: robotoBoldFont,
      color: rgb(0.988, 0.337, 0.012),
    })

    page.drawText(courseDuration, {
      x: 444,
      y: 189,
      size: 14,
      font: robotoFont,
      color: rgb(0, 0, 0),
    })

    page.drawText(certificateId, {
      x: 425,
      y: 117,
      size: 11,
      font: robotoFont,
      color: rgb(0.31, 0.31, 0.31),
    })

    page.drawText(sid, {
      x: 425,
      y: 100,
      size: 11,
      font: robotoFont,
      color: rgb(0.31, 0.31, 0.31),
    })

    page.drawText(regId, {
      x: 425,
      y: 82,
      size: 11,
      font: robotoFont,
      color: rgb(0.31, 0.31, 0.31),
    })

    page.drawText(formatDate(issueDate), {
      x: 420,
      y: 56,
      size: 10,
      font: robotoFont,
      color: rgb(0.31, 0.31, 0.31),
    })

    const instructorTextWidth = robotoFont.widthOfTextAtSize(instructorName, 18)

    page.drawText(instructorName, {
      x: page.getWidth() / 5 - instructorTextWidth / 3,
      y: 78,
      size: 13.5,
      font: robotoFont,
      color: rgb(0, 0, 0),
    })

    page.drawText("Instructor", {
      x: page.getWidth() / 6 + 14,
      y: 67,
      size: 9,
      font: robotoFont,
      color: rgb(0, 0, 0),
    })

    const updatedPdfBytes = await pdfDoc.save()

    logger.info({
      issue: "Certificate",
      student: {
        name,
        sid,
        regId,
        certificateId,
      },
      message: "✅ PDF updated successfully.",
    })
    return updatedPdfBytes
  } catch (error) {
    logger.error(error)
    return error
  }
}

module.exports = generateCertificate
