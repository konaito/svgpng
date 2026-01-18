'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [svgFile, setSvgFile] = useState<File | null>(null)
  const [svgUrl, setSvgUrl] = useState<string>('')
  const [pngDataUrl, setPngDataUrl] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string>('')
  const [scale, setScale] = useState(1)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.svg')) {
        setError('SVGファイルを選択してください')
        return
      }
      setSvgFile(file)
      setError('')
      setPngDataUrl('')
      const url = URL.createObjectURL(file)
      setSvgUrl(url)
    }
  }

  const convertSvgToPng = async () => {
    if (!svgFile) return

    setIsConverting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', svgFile)
      formData.append('scale', scale.toString())

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '変換に失敗しました')
      }

      const result = await response.json()
      setPngDataUrl(result.dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : '変換中にエラーが発生しました')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!pngDataUrl || !svgFile) return

    const link = document.createElement('a')
    link.href = pngDataUrl
    link.download = `${svgFile.name.replace('.svg', '')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleTestSvgSelect = (testFile: string) => {
    fetch(`/test-svg/${testFile}`)
      .then(res => res.text())
      .then(svgContent => {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' })
        const file = new File([blob], testFile, { type: 'image/svg+xml' })
        setSvgFile(file)
        setError('')
        setPngDataUrl('')
        const url = URL.createObjectURL(blob)
        setSvgUrl(url)
      })
      .catch(() => setError('テストSVGの読み込みに失敗しました'))
  }

  useEffect(() => {
    return () => {
      if (svgUrl) {
        URL.revokeObjectURL(svgUrl)
      }
    }
  }, [svgUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          SVG to PNG Converter
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">
              SVGファイルをアップロード
            </label>
            <input
              type="file"
              accept=".svg"
              onChange={handleFileSelect}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600"
            />
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">
              またはテストSVGを選択:
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleTestSvgSelect('test1.svg')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                テスト1
              </button>
              <button
                onClick={() => handleTestSvgSelect('test2.svg')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                テスト2
              </button>
              <button
                onClick={() => handleTestSvgSelect('test3.svg')}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                テスト3
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {svgUrl && (
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">
                拡大倍率:
              </p>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <button
            onClick={convertSvgToPng}
            disabled={!svgUrl || isConverting}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
              !svgUrl || isConverting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isConverting ? '変換中...' : 'PNGに変換'}
          </button>
        </div>

        {svgUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              プレビュー（SVG）
            </h2>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex justify-center bg-gray-50 dark:bg-gray-700">
              <img src={svgUrl} alt="SVG Preview" className="max-w-full h-auto" />
            </div>
          </div>
        )}

        {pngDataUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              PNG結果
            </h2>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex justify-center bg-gray-50 dark:bg-gray-700 mb-6">
              <img src={pngDataUrl} alt="PNG Preview" className="max-w-full h-auto" />
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-4 px-6 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              PNGをダウンロード
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
