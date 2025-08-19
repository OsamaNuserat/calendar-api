import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        if (!admin.apps.length) {
          const serviceAccount = configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
          const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
          
          if (serviceAccount && serviceAccount.trim()) {
            try {
              // Parse service account from environment variable
              const serviceAccountJson = JSON.parse(serviceAccount);
              admin.initializeApp({
                credential: admin.credential.cert(serviceAccountJson),
                databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
              });
            } catch (error) {
              console.warn('Invalid Firebase service account, using default credentials');
              admin.initializeApp({
                projectId: projectId || 'test-project',
              });
            }
          } else {
            // Use default credentials (for local development)
            admin.initializeApp({
              projectId: projectId || 'test-project',
            });
          }
        }
        return admin;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {} 