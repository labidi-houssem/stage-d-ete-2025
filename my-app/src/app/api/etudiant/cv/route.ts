import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ETUDIANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find the user's CV
    const cv = await prisma.cv.findUnique({
      where: { candidatId: userId },
      include: {
        personalInfo: true,
        education: {
          orderBy: { order: 'asc' }
        },
        experience: {
          orderBy: { order: 'asc' }
        },
        skills: {
          orderBy: { order: 'asc' }
        },
        languages: {
          orderBy: { order: 'asc' }
        },
        projects: {
          orderBy: { order: 'asc' }
        },
        certifications: {
          orderBy: { order: 'asc' }
        },
      }
    });

    if (!cv) {
      return NextResponse.json({ cv: null });
    }

    return NextResponse.json({ cv });
  } catch (error) {
    console.error("Error fetching CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ETUDIANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cvData = await request.json();

    // Check if CV exists
    const existingCV = await prisma.cv.findUnique({
      where: { candidatId: userId }
    });

    if (existingCV) {
      // Update existing CV
      const updatedCV = await prisma.cv.update({
        where: { candidatId: userId },
        data: {
          title: cvData.title,
          template: cvData.template,
          isPublic: cvData.isPublic,
          personalInfo: {
            upsert: {
              create: {
                firstName: cvData.personalInfo?.firstName || '',
                lastName: cvData.personalInfo?.lastName || '',
                email: cvData.personalInfo?.email || '',
                phone: cvData.personalInfo?.phone || '',
                address: cvData.personalInfo?.address || '',
                city: cvData.personalInfo?.city || '',
                country: cvData.personalInfo?.country || '',
                summary: cvData.personalInfo?.summary || '',
                linkedIn: cvData.personalInfo?.linkedIn || '',
                github: cvData.personalInfo?.github || '',
                website: cvData.personalInfo?.website || '',
              },
              update: {
                firstName: cvData.personalInfo?.firstName || '',
                lastName: cvData.personalInfo?.lastName || '',
                email: cvData.personalInfo?.email || '',
                phone: cvData.personalInfo?.phone || '',
                address: cvData.personalInfo?.address || '',
                city: cvData.personalInfo?.city || '',
                country: cvData.personalInfo?.country || '',
                summary: cvData.personalInfo?.summary || '',
                linkedIn: cvData.personalInfo?.linkedIn || '',
                github: cvData.personalInfo?.github || '',
                website: cvData.personalInfo?.website || '',
              }
            }
          },
          education: {
            deleteMany: {},
            create: cvData.education.map((edu: any, index: number) => ({
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              current: edu.current,
              grade: edu.grade,
              description: edu.description,
              order: index
            }))
          },
          experience: {
            deleteMany: {},
            create: cvData.experience.map((exp: any, index: number) => ({
              company: exp.company,
              position: exp.position,
              location: exp.location,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current,
              description: exp.description,
              achievements: exp.achievements || [],
              order: index
            }))
          },
          skills: {
            deleteMany: {},
            create: cvData.skills.map((skill: any, index: number) => ({
              name: skill.name,
              level: skill.level,
              category: skill.category,
              order: index
            }))
          },
          languages: {
            deleteMany: {},
            create: cvData.languages.map((lang: any, index: number) => ({
              name: lang.name,
              level: lang.level,
              order: index
            }))
          },
          projects: {
            deleteMany: {},
            create: cvData.projects.map((project: any, index: number) => ({
              name: project.name,
              description: project.description,
              technologies: project.technologies || [],
              url: project.url,
              githubUrl: project.githubUrl,
              startDate: project.startDate ? new Date(project.startDate) : null,
              endDate: project.endDate ? new Date(project.endDate) : null,
              order: index
            }))
          },
          certifications: {
            deleteMany: {},
            create: cvData.certifications.map((cert: any, index: number) => ({
              name: cert.name,
              issuer: cert.issuer,
              issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
              credentialId: cert.credentialId,
              url: cert.url,
              order: index
            }))
          }
        },
        include: {
          personalInfo: true,
          education: true,
          experience: true,
          skills: true,
          languages: true,
          projects: true,
          certifications: true,
        }
      });

      return NextResponse.json({ 
        message: "CV updated successfully",
        cv: updatedCV
      });
    } else {
      // Create new CV
      const newCV = await prisma.cv.create({
        data: {
          candidatId: userId,
          title: cvData.title,
          template: cvData.template,
          isPublic: cvData.isPublic,
          personalInfo: {
            create: {
              firstName: cvData.personalInfo?.firstName || '',
              lastName: cvData.personalInfo?.lastName || '',
              email: cvData.personalInfo?.email || '',
              phone: cvData.personalInfo?.phone || '',
              address: cvData.personalInfo?.address || '',
              city: cvData.personalInfo?.city || '',
              country: cvData.personalInfo?.country || '',
              summary: cvData.personalInfo?.summary || '',
              linkedIn: cvData.personalInfo?.linkedIn || '',
              github: cvData.personalInfo?.github || '',
              website: cvData.personalInfo?.website || '',
            }
          },
          education: {
            create: cvData.education.map((edu: any, index: number) => ({
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              current: edu.current,
              grade: edu.grade,
              description: edu.description,
              order: index
            }))
          },
          experience: {
            create: cvData.experience.map((exp: any, index: number) => ({
              company: exp.company,
              position: exp.position,
              location: exp.location,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current,
              description: exp.description,
              achievements: exp.achievements || [],
              order: index
            }))
          },
          skills: {
            create: cvData.skills.map((skill: any, index: number) => ({
              name: skill.name,
              level: skill.level,
              category: skill.category,
              order: index
            }))
          },
          languages: {
            create: cvData.languages.map((lang: any, index: number) => ({
              name: lang.name,
              level: lang.level,
              order: index
            }))
          },
          projects: {
            create: cvData.projects.map((project: any, index: number) => ({
              name: project.name,
              description: project.description,
              technologies: project.technologies || [],
              url: project.url,
              githubUrl: project.githubUrl,
              startDate: project.startDate ? new Date(project.startDate) : null,
              endDate: project.endDate ? new Date(project.endDate) : null,
              order: index
            }))
          },
          certifications: {
            create: cvData.certifications.map((cert: any, index: number) => ({
              name: cert.name,
              issuer: cert.issuer,
              issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
              credentialId: cert.credentialId,
              url: cert.url,
              order: index
            }))
          }
        },
        include: {
          personalInfo: true,
          education: true,
          experience: true,
          skills: true,
          languages: true,
          projects: true,
          certifications: true,
        }
      });

      return NextResponse.json({ 
        message: "CV created successfully",
        cv: newCV
      });
    }
  } catch (error) {
    console.error("Error updating CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
