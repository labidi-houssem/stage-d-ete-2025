# CV Builder Setup Instructions

## 🔧 Database Migration Required

You need to run the following commands to create the CV tables in your database:

### 1. Generate and Apply Migration
```bash
cd my-app
npx prisma migrate dev --name add_cv_models
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Restart Your Development Server
```bash
npm run dev
```

## ✅ What This Will Create

The migration will create these new tables:
- `Cv` - Main CV table
- `CvPersonalInfo` - Personal information
- `CvEducation` - Education entries
- `CvExperience` - Work experience
- `CvSkill` - Skills with levels
- `CvLanguage` - Language proficiency
- `CvProject` - Projects
- `CvCertification` - Certifications

## 🎯 After Migration

Once the migration is complete, candidates will be able to:
1. Access CV builder from the sidebar "Mon CV" link
2. Create and edit their professional CV
3. Preview and print their CV
4. Teachers can view candidate CVs during interviews

## 🚨 Important Notes

- Make sure your database is running before running the migration
- The migration will add new tables without affecting existing data
- All CV data is linked to candidate users with proper foreign keys
- The system includes proper cascade deletes for data integrity

## 🔍 Troubleshooting

If you encounter any issues:
1. Make sure your database connection is working
2. Check that no other processes are using the database
3. Verify your `.env` file has the correct DATABASE_URL
4. Try running `npx prisma db push` as an alternative to migrate

## 🎉 Ready to Use

After successful migration, the CV builder will be fully functional and integrated with your existing interview system!
