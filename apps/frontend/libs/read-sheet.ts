import { google } from 'googleapis'

export const readSheet = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const client = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: client as never })
  const range = 'Sheet1!A1:A4'

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
      range,
    })
    return response.data.values
  } catch (error) {
    console.error(error)
    return []
  }
}
