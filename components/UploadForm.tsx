"use client"
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES, DEFAULT_VOICE } from '@/lib/constants'
import { BookUploadFormValues } from '@/types'
import { Button, Input } from '@base-ui/react'
import { Book, ImageIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { UploadSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FileUploader from './FileUploader'
import LoadingOverlay from './LoadingOverlay'
import VoiceSelector from './VoiceSelector'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { checkBookExists, createBook, saveBookSegments } from '@/lib/actions/book.actions'
import { useRouter } from 'next/navigation'
import { parsePDFFile } from '@/lib/utils'
import { upload } from '@vercel/blob/client'

const UploadForm = () => {

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { userId } = useAuth()
  const router = useRouter()

  const form = useForm<BookUploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      title: "",
      author: "",
      persona: DEFAULT_VOICE,
      pdfFile: undefined,
      coverImage: undefined,
    }
  })

  const onSubmit = async (data: BookUploadFormValues) => {
    if (!userId) {
      return toast.error("Please login to upload books")
    }
    setIsSubmitting(true)
    try {
      const existsCheck = await checkBookExists(data.title)

      if(existsCheck?.exists && existsCheck.book) {
        toast.error("Book with same title already exists. Please try a different title!")
        form.reset()
        router.push(`/books/${existsCheck.book.slug}`)
        return
      }

      const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase()
      const pdfFile = data.pdfFile

      const parsedPDF = await parsePDFFile(pdfFile)

      if(parsedPDF.content.length === 0){
        toast.error("Failed to parse PDF. Please try again with a different file.")
        return
      }

      const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: "application/pdf"
      })

      let coverUrl: string

      if(data.coverImage) {
        const coverFile = data.coverImage
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: coverFile.type
        })
        coverUrl = uploadedCoverBlob.url
      } else {
        const response = await fetch(parsedPDF.cover)
        const blob = await response.blob()

        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: "image/png"
        })
        coverUrl = uploadedCoverBlob.url
      }

      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.persona,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        fileSize: pdfFile.size
      })
      if(!book.success) throw new Error("Failed to create book.")

      if(book.alreadyExists) {
        toast.info("Book already exists")
        form.reset()
        router.push(`/books/${existsCheck.book.slug}`)
        return
      }

      const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content)
      if(!segments?.success) {
        toast.error("Failed to save book segments")
        throw new Error("Failed to save book segments")
      }

      form.reset()
      router.push('/')

    } catch (error) {
      console.log(error)
    }finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isSubmitting && <LoadingOverlay />}

      <div className='new-book-wrapper'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* book pdf upload */}
            <FileUploader
              control={form.control}
              name="pdfFile"
              label="Book PDF File"
              acceptTypes={ACCEPTED_PDF_TYPES}
              icon={Upload}
              placeholder="Upload your book PDF"
              hint="PDF file max(50MB)"
              disabled={isSubmitting}
            />

            {/* Cover image uplaod */}
            <FileUploader
              control={form.control}
              name="coverImage"
              label="Cover Image (optional)"
              acceptTypes={ACCEPTED_IMAGE_TYPES}
              icon={ImageIcon}
              placeholder="Upload a cover image"
              hint="JPG, PNG, or WebP max(10MB)"
              disabled={isSubmitting}
            />

            {/* book title input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Title</FormLabel>
                  <FormControl>
                    <Input
                      className={'form-input'}
                      placeholder='ex: Rich Dad Poor Dad'
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Author input */}
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Author name</FormLabel>
                  <FormControl>
                    <Input
                      className={'form-input'}
                      placeholder='ex: Robert Kiyosaki'
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="persona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                  <FormControl>
                    <VoiceSelector
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className={'form-btn'} disabled={isSubmitting}>
              Begin Synthesis
            </Button>
          </form>
        </Form>
      </div>
    </>
  )
}

export default UploadForm
