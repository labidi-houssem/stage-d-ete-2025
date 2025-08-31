import { prisma } from './prisma';
import { sendMail } from './sendMail';

export type NotificationType = 
  | 'NEW_CANDIDATE_SIGNUP'
  | 'NEW_EVALUATION'
  | 'INTERVIEW_REQUEST'
  | 'RESERVATION_CREATED'
  | 'RESERVATION_CANCELLED'
  | 'RESERVATION_UPDATED'
  | 'CANDIDATE_ASSIGNED'
  | 'MEETING_SCHEDULED'
  | 'SYSTEM_ALERT';

export interface CreateNotificationData {
  type: NotificationType;
  message: string;
  link?: string;
  userId?: string; // If not provided, will notify all admins
  sendEmail?: boolean;
  emailSubject?: string;
  emailContent?: string;
}

export async function createNotification(data: CreateNotificationData) {
  try {
    let targetUsers: string[] = [];

    if (data.userId) {
      // Notify specific user
      targetUsers = [data.userId];
    } else {
      // Notify all admins
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, name: true }
      });
      targetUsers = admins.map(admin => admin.id);
    }

    // Create notifications for all target users
    const notifications = await Promise.all(
      targetUsers.map(userId =>
        prisma.notification.create({
          data: {
            userId,
            type: data.type,
            message: data.message,
            link: data.link,
          }
        })
      )
    );

    // Send email notifications if requested
    if (data.sendEmail && data.emailSubject && data.emailContent) {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, name: true }
      });

      await Promise.all(
        admins.map(admin =>
          sendMail({
            to: admin.email,
            subject: data.emailSubject,
            html: data.emailContent
          }).catch(error => {
            console.error(`Failed to send email to ${admin.email}:`, error);
          })
        )
      );
    }

    return notifications;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Specific notification creators
export async function notifyNewCandidateSignup(candidate: {
  id: string;
  name: string;
  email: string;
  prenom?: string;
  nom?: string;
}) {
  const candidateName = candidate.prenom && candidate.nom 
    ? `${candidate.prenom} ${candidate.nom}`
    : candidate.name || candidate.email;

  return createNotification({
    type: 'NEW_CANDIDATE_SIGNUP',
    message: `Nouveau candidat inscrit: ${candidateName}`,
    link: `/admin/candidate-cv/${candidate.id}`,
    sendEmail: true,
    emailSubject: 'Nouveau candidat inscrit - ESPRIT',
    emailContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ESPRIT</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Plateforme d'entretiens</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin-bottom: 20px;">🎯 Nouveau candidat inscrit</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #0c4a6e; margin: 0 0 10px 0;">Informations du candidat:</h3>
            <p style="color: #0c4a6e; margin: 5px 0;"><strong>Nom:</strong> ${candidateName}</p>
            <p style="color: #0c4a6e; margin: 5px 0;"><strong>Email:</strong> ${candidate.email}</p>
            <p style="color: #0c4a6e; margin: 5px 0;"><strong>Date d'inscription:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/candidate-cv/${candidate.id}" 
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
              👁️ Voir le profil du candidat
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
            Cordialement,<br>
            L'équipe ESPRIT
          </p>
        </div>
      </div>
    `
  });
}

export async function notifyNewEvaluation(evaluation: {
  id: string;
  candidatId: string;
  enseignantId: string;
  note: number;
  commentaire?: string;
  candidatName?: string;
  enseignantName?: string;
}) {
  return createNotification({
    type: 'NEW_EVALUATION',
    message: `Nouvelle évaluation: ${evaluation.candidatName || 'Candidat'} - Note: ${evaluation.note}/20`,
    link: `/admin/evaluations`,
    sendEmail: true,
    emailSubject: 'Nouvelle évaluation soumise - ESPRIT',
    emailContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ESPRIT</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Plateforme d'entretiens</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin-bottom: 20px;">📊 Nouvelle évaluation soumise</h2>
          
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #166534; margin: 0 0 15px 0;">Détails de l'évaluation:</h3>
            <p style="color: #166534; margin: 8px 0;"><strong>Candidat:</strong> ${evaluation.candidatName || 'Non spécifié'}</p>
            <p style="color: #166534; margin: 8px 0;"><strong>Enseignant:</strong> ${evaluation.enseignantName || 'Non spécifié'}</p>
            <p style="color: #166534; margin: 8px 0;"><strong>Note:</strong> <span style="font-size: 18px; font-weight: bold; color: ${evaluation.note >= 10 ? '#22c55e' : '#ef4444'};">${evaluation.note}/20</span></p>
            ${evaluation.commentaire ? `<p style="color: #166534; margin: 8px 0;"><strong>Commentaire:</strong> ${evaluation.commentaire}</p>` : ''}
            <p style="color: #166534; margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/evaluations" 
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
              📋 Voir toutes les évaluations
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
            Cordialement,<br>
            L'équipe ESPRIT
          </p>
        </div>
      </div>
    `
  });
}

export async function notifyInterviewRequest(request: {
  id: string;
  candidatId: string;
  enseignantId: string;
  candidatName?: string;
  enseignantName?: string;
  dateDebut: Date;
  dateFin: Date;
}) {
  return createNotification({
    type: 'INTERVIEW_REQUEST',
    message: `Nouvelle demande d'entretien: ${request.candidatName || 'Candidat'} avec ${request.enseignantName || 'Enseignant'}`,
    link: `/admin/interview-requests`,
    sendEmail: true,
    emailSubject: 'Nouvelle demande d\'entretien - ESPRIT',
    emailContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ESPRIT</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Plateforme d'entretiens</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin-bottom: 20px;">🎤 Nouvelle demande d'entretien</h2>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">Détails de la demande:</h3>
            <p style="color: #92400e; margin: 8px 0;"><strong>Candidat:</strong> ${request.candidatName || 'Non spécifié'}</p>
            <p style="color: #92400e; margin: 8px 0;"><strong>Enseignant:</strong> ${request.enseignantName || 'Non spécifié'}</p>
            <p style="color: #92400e; margin: 8px 0;"><strong>Date de début:</strong> ${new Date(request.dateDebut).toLocaleString('fr-FR')}</p>
            <p style="color: #92400e; margin: 8px 0;"><strong>Date de fin:</strong> ${new Date(request.dateFin).toLocaleString('fr-FR')}</p>
            <p style="color: #92400e; margin: 8px 0;"><strong>Date de demande:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/interview-requests" 
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
              📅 Gérer les demandes d'entretien
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
            Cordialement,<br>
            L'équipe ESPRIT
          </p>
        </div>
      </div>
    `
  });
}

export async function notifyReservationCreated(reservation: {
  id: string;
  candidatId: string;
  enseignantId: string;
  candidatName?: string;
  enseignantName?: string;
  dateDebut: Date;
  dateFin: Date;
}) {
  return createNotification({
    type: 'RESERVATION_CREATED',
    message: `Nouvelle réservation créée: ${reservation.candidatName || 'Candidat'} avec ${reservation.enseignantName || 'Enseignant'}`,
    link: `/admin/reservations`,
    sendEmail: true,
    emailSubject: 'Nouvelle réservation créée - ESPRIT',
    emailContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ESPRIT</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Plateforme d'entretiens</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin-bottom: 20px;">📅 Nouvelle réservation créée</h2>
          
          <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">Détails de la réservation:</h3>
            <p style="color: #0c4a6e; margin: 8px 0;"><strong>Candidat:</strong> ${reservation.candidatName || 'Non spécifié'}</p>
            <p style="color: #0c4a6e; margin: 8px 0;"><strong>Enseignant:</strong> ${reservation.enseignantName || 'Non spécifié'}</p>
            <p style="color: #0c4a6e; margin: 8px 0;"><strong>Date de début:</strong> ${new Date(reservation.dateDebut).toLocaleString('fr-FR')}</p>
            <p style="color: #0c4a6e; margin: 8px 0;"><strong>Date de fin:</strong> ${new Date(reservation.dateFin).toLocaleString('fr-FR')}</p>
            <p style="color: #0c4a6e; margin: 8px 0;"><strong>Date de création:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/reservations" 
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
              📋 Voir toutes les réservations
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
            Cordialement,<br>
            L'équipe ESPRIT
          </p>
        </div>
      </div>
    `
  });
}
