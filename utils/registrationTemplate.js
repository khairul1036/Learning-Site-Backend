const fs = require("fs")
const path = require("path")
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib")
const fontkit = require("fontkit")
const logger = require("@logger")

async function getImageMimeType(url) {
  const res = await fetch(url, { method: "HEAD" })
  return res.headers.get("content-type")
}

async function generateRegistrationPDF(
  imageUrl,
  name,
  father,
  mother,
  gender,
  birthday,
  number,
  registration,
  sid,
  courseSession
) {
  try {
    const formData = [
      name,
      father,
      mother,
      gender,
      birthday,
      number,
      registration,
      sid,
    ]

    const pdfPath = path.join(__dirname, "templates", "pdf", "registration.pdf")
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    // Registering FontKit
    pdfDoc.registerFontkit(fontkit)

    // Embed the font

    const fontPath = path.join(__dirname, "fonts", "roboto.ttf")
    const customFontBytes = fs.readFileSync(fontPath)
    const robotoFont = await pdfDoc.embedFont(customFontBytes)

    // Get the first page
    const [page] = pdfDoc.getPages()

    // Initial Y-position and gap between rows
    const startX = 279
    const startY = 464
    const lineSpacing = 29

    formData.forEach((text, index) => {
      page.drawText(text, {
        x: startX,
        y: startY - index * lineSpacing,
        size: 13,
        font: robotoFont,
        color: rgb(0, 0, 0),
      })
    })

    page.drawText(courseSession, {
      x: 403,
      y: 264,
      size: 13,
      font: robotoFont,
      color: rgb(0, 0, 0),
    })

    // Load and embed image (JPEG)

    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const imageBytes = Buffer.from(arrayBuffer)

    const imgType = await getImageMimeType(imageUrl)

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
    const { width, height } = image

    // Define image box dimensions and position
    const targetWidth = 100
    const targetHeight = 150
    const xPos = 407
    const yPos = 492

    // Maintain aspect ratio while scaling
    const scale = Math.min(targetWidth / width, targetHeight / height)
    const scaledWidth = width * scale
    const scaledHeight = height * scale

    // Optional: Draw a rectangle around the image (as a frame)
    page.drawRectangle({
      x: xPos - 1,
      y: yPos - 1,
      width: scaledWidth + 2,
      height: scaledHeight + 2,
      borderColor: rgb(0, 0.4, 0.8),
      borderWidth: 1,
    })

    // Draw the image inside the rectangle
    page.drawImage(image, {
      x: xPos,
      y: yPos,
      width: scaledWidth,
      height: scaledHeight,
    })

    // Save the updated PDF
    const updatedPdfBytes = await pdfDoc.save()

    logger.info({
      issue: "Registration",
      student: {
        name,
        sid,
        registration,
      },
      message: "✅ PDF updated successfully.",
    })
    return updatedPdfBytes
  } catch (error) {
    logger.error("❌ Failed to edit PDF:", error)
    return error
  }
}

module.exports = generateRegistrationPDF
