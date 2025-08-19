import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private db: admin.firestore.Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin) {
    this.db = this.firebaseAdmin.firestore();
  }

  async createEvent(eventData: any): Promise<any> {
    const eventRef = await this.db.collection('events').add({
      ...eventData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const event = await eventRef.get();
    return { id: eventRef.id, ...event.data() };
  }

  async getEvent(id: string): Promise<any> {
    const eventDoc = await this.db.collection('events').doc(id).get();
    if (!eventDoc.exists) {
      return null;
    }
    return { id: eventDoc.id, ...eventDoc.data() };
  }

  async getAllEvents(): Promise<any[]> {
    const eventsSnapshot = await this.db.collection('events').orderBy('startTime').get();
    return eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async updateEvent(id: string, eventData: any): Promise<any> {
    await this.db.collection('events').doc(id).update({
      ...eventData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return this.getEvent(id);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.db.collection('events').doc(id).delete();
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const eventsSnapshot = await this.db
      .collection('events')
      .where('startTime', '>=', startDate)
      .where('startTime', '<=', endDate)
      .orderBy('startTime')
      .get();
    
    return eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
} 