import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.js';
import { LibraryBook } from '../models/LibraryBook.js';
import { BookCirculation } from '../models/BookCirculation.js';
import { Types } from 'mongoose';

// Helper to seed books if empty
async function ensureBooksExist(schoolId: Types.ObjectId) {
  const count = await LibraryBook.countDocuments({ schoolId });
  if (count === 0) {
    const defaultBooks = [
      { title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-0538497909', category: 'Mathematics', totalCopies: 10, availableCopies: 6, shelf: 'M-01' },
      { title: 'Concepts of Physics Vol. 1', author: 'H.C. Verma', isbn: '978-8177091878', category: 'Physics', totalCopies: 15, availableCopies: 8, shelf: 'P-01' },
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 5, availableCopies: 5, shelf: 'CS-03' },
      { title: 'Organic Chemistry', author: 'Paula Yurkanis Bruice', isbn: '978-0134074580', category: 'Chemistry', totalCopies: 8, availableCopies: 3, shelf: 'C-02' }
    ];

    for (const b of defaultBooks) {
      await LibraryBook.create({
        schoolId,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        totalCopies: b.totalCopies,
        availableCopies: b.availableCopies,
        shelf: b.shelf,
        createdBy: new Types.ObjectId("000000000000000000000001"),
        updatedBy: new Types.ObjectId("000000000000000000000001")
      });
    }
  }
}

export class LibraryController {
  static async getLibraryBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { category } = req.query;

      const sId = new Types.ObjectId(schoolId as string);
      await ensureBooksExist(sId);

      const match: any = { schoolId: sId };
      if (category && typeof category === 'string') match.category = category;

      const books = await LibraryBook.find(match);

      const formatted = books.map(b => ({
        id: b._id.toString(),
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        total_copies: b.totalCopies,
        available_copies: b.availableCopies,
        shelf: b.shelf,
        created_at: (b as any).createdAt,
        updated_at: (b as any).updatedAt
      }));

      sendResponse(res, 200, 'Books retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async issueBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { bookId, studentId, studentName, dueDateDays } = req.body;

      const sId = new Types.ObjectId(schoolId as string);
      const bId = new Types.ObjectId(bookId);

      const book = await LibraryBook.findOne({ schoolId: sId, _id: bId });
      if (!book) {
        res.status(404).json({ success: false, message: 'Book not found' });
        return;
      }

      if (book.availableCopies <= 0) {
        res.status(400).json({ success: false, message: 'No copies available for issue' });
        return;
      }

      book.availableCopies -= 1;
      await book.save();

      const days = Number(dueDateDays) || 14;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      const circulation = new BookCirculation({
        schoolId: sId,
        bookId: bId,
        bookTitle: book.title,
        studentId: new Types.ObjectId(studentId),
        studentName,
        issuedDate: new Date(),
        dueDate,
        status: 'issued',
        createdBy: new Types.ObjectId(req.user?.id || "000000000000000000000001"),
        updatedBy: new Types.ObjectId(req.user?.id || "000000000000000000000001")
      });

      await circulation.save();

      sendResponse(res, 201, 'Book issued successfully', {
        id: circulation._id.toString(),
        book_id: circulation.bookId.toString(),
        book_title: circulation.bookTitle,
        student_id: circulation.studentId.toString(),
        student_name: circulation.studentName,
        issued_date: circulation.issuedDate.toISOString().split('T')[0],
        due_date: circulation.dueDate.toISOString().split('T')[0],
        returned_date: null,
        status: circulation.status,
        created_at: (circulation as any).createdAt,
        updated_at: (circulation as any).updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async returnBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { id } = req.params;

      const sId = new Types.ObjectId(schoolId as string);
      const circulation = await BookCirculation.findOne({ schoolId: sId, _id: new Types.ObjectId(id as string) });

      if (!circulation) {
        res.status(404).json({ success: false, message: 'Circulation record not found' });
        return;
      }

      if (circulation.status === 'returned') {
        res.status(400).json({ success: false, message: 'Book has already been returned' });
        return;
      }

      circulation.status = 'returned';
      circulation.returnedDate = new Date();
      await circulation.save();

      const book = await LibraryBook.findOne({ schoolId: sId, _id: circulation.bookId });
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
        await book.save();
      }

      sendResponse(res, 200, 'Book returned successfully', {
        id: circulation._id.toString(),
        book_id: circulation.bookId.toString(),
        book_title: circulation.bookTitle,
        student_id: circulation.studentId.toString(),
        student_name: circulation.studentName,
        issued_date: circulation.issuedDate.toISOString().split('T')[0],
        due_date: circulation.dueDate.toISOString().split('T')[0],
        returned_date: circulation.returnedDate.toISOString().split('T')[0],
        status: circulation.status,
        created_at: (circulation as any).createdAt,
        updated_at: (circulation as any).updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentCirculations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { studentId } = req.params;

      const sId = new Types.ObjectId(schoolId as string);
      const circs = await BookCirculation.find({ schoolId: sId, studentId: new Types.ObjectId(studentId as string) });

      const formatted = circs.map(c => ({
        id: c._id.toString(),
        book_id: c.bookId.toString(),
        book_title: c.bookTitle,
        student_id: c.studentId.toString(),
        student_name: c.studentName,
        issued_date: c.issuedDate.toISOString().split('T')[0],
        due_date: c.dueDate.toISOString().split('T')[0],
        returned_date: c.returnedDate ? c.returnedDate.toISOString().split('T')[0] : null,
        status: c.status,
        created_at: (c as any).createdAt,
        updated_at: (c as any).updatedAt
      }));

      sendResponse(res, 200, 'Circulation history retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async getAllCirculations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const sId = new Types.ObjectId(schoolId as string);
      const circs = await BookCirculation.find({ schoolId: sId }).sort({ createdAt: -1 });
      const formatted = circs.map(c => ({
        id: c._id.toString(),
        book_id: c.bookId.toString(),
        book_title: c.bookTitle,
        student_id: c.studentId.toString(),
        student_name: c.studentName,
        issued_date: c.issuedDate.toISOString().split('T')[0],
        due_date: c.dueDate.toISOString().split('T')[0],
        returned_date: c.returnedDate ? c.returnedDate.toISOString().split('T')[0] : null,
        status: c.status,
        created_at: (c as any).createdAt,
        updated_at: (c as any).updatedAt
      }));
      sendResponse(res, 200, 'Circulations retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async addLibraryBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { title, author, isbn, category, totalCopies, available, shelf } = req.body;
      const sId = new Types.ObjectId(schoolId as string);
      
      const book = new LibraryBook({
        schoolId: sId,
        title,
        author,
        isbn,
        category,
        totalCopies,
        availableCopies: available ?? totalCopies,
        shelf,
        createdBy: new Types.ObjectId(req.user?.id || "000000000000000000000001"),
        updatedBy: new Types.ObjectId(req.user?.id || "000000000000000000000001")
      });
      await book.save();
      sendResponse(res, 201, 'Book created', book);
    } catch (error) {
      next(error);
    }
  }
}
