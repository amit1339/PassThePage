import { writeBatch, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { seedBooks, seedStudents, seedRentals } from './seedData';

export async function populateFirestoreWithSeedData(onProgress?: (msg: string) => void) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  onProgress?.('Uploading books...');
  const batch1 = writeBatch(db);
  for (const book of seedBooks) {
    const ref = doc(db, 'books', book.id);
    batch1.set(ref, book);
  }
  await batch1.commit();

  onProgress?.('Uploading students...');
  const batch2 = writeBatch(db);
  for (const student of seedStudents) {
    const ref = doc(db, 'students', student.id);
    batch2.set(ref, student);
  }
  await batch2.commit();

  onProgress?.('Uploading rentals...');
  // Commit rentals in batches if needed
  const batch3 = writeBatch(db);
  for (const rental of seedRentals) {
    const ref = doc(db, 'rentals', rental.id);
    batch3.set(ref, rental);
  }
  await batch3.commit();

  onProgress?.('Done! All sample data populated into Firestore.');
}
