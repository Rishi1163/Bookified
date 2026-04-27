"use server"

import { connectToDb } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/Book.models";
import BookSegment from "@/database/models/BookSegment.models";

export const checkBookExists = async (title: string) => {
    try {
        await connectToDb()

        const slug = generateSlug(title)

        const existingBook = await Book.findOne({ slug }).lean()

        if (existingBook) {
            return {
                exists: true,
                book: serializeData(existingBook)
            }
        }

        return {
            exists: false
        }

    } catch (error) {
        console.log("Error checking book exists", error)
        return {
            exists: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDb();
        const slug = generateSlug(data.title)

        const existingBook = await Book.findOne({ slug }).lean()

        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true
            }
        }

        //check subscription limits before creating a book
        const book = await Book.create({ ...data, slug, totalSegments: 0 })

        return {
            success: true,
            data: serializeData(book)
        }
    } catch (error) {
        console.error("Error creating book", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDb()
        console.log("Saving book segments...")

        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }, index) => ({
            clerkId,
            bookId,
            content: text,
            segmentIndex,
            pageNumber: pageNumber ?? index + 1, 
            wordCount
        }))

        await BookSegment.insertMany(segmentsToInsert)

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length })

        console.log("Book segments saved successfully!")

        return {
            success: true,
            data: { segmentCreated: segments.length }
        }
    } catch (error) {
        console.error("Error saving book segments.", error)

        await BookSegment.deleteMany({ bookId })
        await Book.findByIdAndUpdate(bookId)
        console.log("Deleted book segments and book due to failure to save segments")
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

export const getAllBooks = async() => {
    try {
        await connectToDb()

        const books = await Book.find().sort({createdAt: -1}).lean()

        return {
            success: true,
            data: serializeData(books)
        }
    } catch (e) {
        console.error("Error connecting to db", e)
        return {
            success: false,
            error: e
        }
    }
}

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDb()

        const book = await Book.findOne({ slug }).lean()

        if (!book) {
            return {
                success: false,
                data: null
            }
        }

        return {
            success: true,
            data: serializeData(book)
        }
    } catch (error) {
        console.error("Error fetching book by slug", error)
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}
