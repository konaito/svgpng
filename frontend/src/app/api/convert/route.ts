import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const scale = parseFloat(formData.get('scale') as string) || 1

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const metadata = await sharp(buffer).metadata()
    const width = Math.round((metadata.width || 0) * scale)
    const height = Math.round((metadata.height || 0) * scale)

    const pngBuffer = await sharp(buffer)
      .resize(width, height)
      .png()
      .toBuffer()

    const base64 = pngBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({
      success: true,
      dataUrl,
      width,
      height
    })
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: '変換中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
