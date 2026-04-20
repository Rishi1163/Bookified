"use client"
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES, DEFAULT_VOICE } from '@/lib/constants'
import { BookUploadFormValues } from '@/types'
import { Button, Input } from '@base-ui/react'
import { ImageIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { UploadSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FileUploader from './FileUploader'
import LoadingOverlay from './LoadingOverlay'
import VoiceSelector from './VoiceSelector'

const UploadForm = () => {

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BookUploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      title: "",
      author: "",
      persona: DEFAULT_VOICE,
      coverImage: undefined,
    }
  })

  const onSubmit = async (values: BookUploadFormValues) => {
    setIsSubmitting(true)
    console.log(values)

    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsSubmitting(false)
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
