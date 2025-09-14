import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { StudentsModule } from './students/students.module';
import { AcademicTermsModule } from './academic-terms/academic-terms.module';
import { GradeLevelsModule } from './grade-levels/grade-levels.module';
import { ClassesModule } from './classes/classes.module';
import { TextbooksModule } from './textbooks/textbooks.module';
import { UsersModule } from './users/users.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { StaffRolesModule } from './staff-roles/staff-roles.module';
import { ExamsModule } from './exams/exams.module';
import { StudentEnrollmentsModule } from './student-enrollments/student-enrollments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'], // apps/api/.env
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? 'atrenabavi-next',
      autoLoadEntities: true,
      logging: process.env.TYPEORM_LOGGING === 'true',
      synchronize: process.env.TYPEORM_SYNC === 'true', // در DEV true
      charset: 'utf8mb4_general_ci',
    }),
    AuthModule,
    AcademicYearsModule,
    StudentsModule,
    AcademicTermsModule,
    GradeLevelsModule,
    ClassesModule,
    TextbooksModule,
    UsersModule,
    EnrollmentsModule,
    StaffRolesModule,
    ExamsModule,
    StudentEnrollmentsModule,
  ],
})
export class AppModule {}
