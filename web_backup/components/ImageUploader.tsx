"use client"

import { useState, useRef } from 'react'
import { Button } from "./ui/button"
import { Upload, Image as ImageIcon, Clipboard, Pencil } from "lucide-react"
import Image from 'next/image'

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void
  onMultipleImagesUploaded?: (imageUrls: string[]) => void
  onEditDetails?: (imageUrl: string) => void
}

export default function ImageUploader({ onImageUploaded, onMultipleImagesUploaded, onEditDetails }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  // Função para processar uma única imagem
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Arquivo não é uma imagem válida'))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Erro ao ler o arquivo'))
        }
      }
      reader.onerror = () => reject(new Error('Erro ao processar a imagem'))
      reader.readAsDataURL(file)
    })
  }

  // Função para lidar com o upload de múltiplos arquivos
  const handleFilesUpload = async (files: FileList) => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    setUploadProgress(0)
    
    try {
      const imagePromises: Promise<string>[] = []
      
      // Criar um array de promessas para processar cada arquivo
      for (let i = 0; i < files.length; i++) {
        imagePromises.push(processImage(files[i]))
      }
      
      // Processar as imagens em lotes para mostrar progresso
      const results: string[] = []
      const totalFiles = imagePromises.length
      
      for (let i = 0; i < totalFiles; i++) {
        const imageUrl = await imagePromises[i]
        results.push(imageUrl)
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
      }
      
      setUploadedImages(results)
      
      // Se houver apenas uma imagem, usar o callback de imagem única
      if (results.length === 1) {
        onImageUploaded(results[0])
      } 
      // Se houver múltiplas imagens e o callback estiver disponível
      else if (results.length > 1 && onMultipleImagesUploaded) {
        onMultipleImagesUploaded(results)
      }
      // Caso contrário, usar apenas a primeira imagem
      else if (results.length > 1) {
        onImageUploaded(results[0])
      }
    } catch (error) {
      console.error('Erro ao processar imagens:', error)
      alert('Ocorreu um erro ao processar as imagens.')
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }

  // Função para lidar com a seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files)
    }
  }

  // Funções para lidar com o drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files)
    }
  }

  // Função para lidar com a colagem da área de transferência
  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], 'clipboard-image.png', { type })
            
            // Criar um FileList simulado com o arquivo da área de transferência
            const dt = new DataTransfer()
            dt.items.add(file)
            handleFilesUpload(dt.files)
            return
          }
        }
      }
      
      alert('Nenhuma imagem encontrada na área de transferência.')
    } catch (err) {
      console.error('Erro ao acessar a área de transferência:', err)
      alert('Não foi possível acessar a área de transferência. Verifique as permissões do navegador.')
    }
  }

  return (
    <div className="space-y-4">
      <div 
        ref={dropAreaRef}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileSelect}
          multiple // Permitir seleção múltipla
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-300">
            Arraste e solte imagens aqui, ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500">
            Formatos suportados: JPG, PNG, GIF (múltiplas imagens permitidas)
          </p>
        </div>
      </div>
      
      {isProcessing && (
        <div className="bg-gray-800 rounded-md p-2">
          <div className="text-xs text-gray-300 mb-1">Processando imagens... {uploadProgress}%</div>
          <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-1 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {uploadedImages.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 mb-1">{uploadedImages.length} imagens carregadas:</p>
          <div className="grid grid-cols-3 gap-2">
            {uploadedImages.slice(0, 6).map((img, index) => (
              <div key={index} className="relative aspect-[63/88] bg-gray-800 rounded-md overflow-hidden group">
                <img 
                  src={img} 
                  alt={`Imagem ${index + 1}`} 
                  className="w-full h-full object-contain"
                />
                {onEditDetails && (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditDetails(img)}
                      className="bg-blue-900/50 border-blue-700 text-blue-300"
                    >
                      Editar Detalhes
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {uploadedImages.length > 6 && (
              <div className="relative aspect-[63/88] bg-gray-800/50 rounded-md flex items-center justify-center">
                <div className="text-gray-400 text-sm">+{uploadedImages.length - 6}</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          Selecionar Imagens
        </Button>
        
        <Button
          variant="outline"
          className="flex-1"
          onClick={handlePaste}
          disabled={isProcessing}
        >
          <Clipboard className="w-4 h-4 mr-1" />
          Colar da Área de Transferência
        </Button>
      </div>
    </div>
  )
}