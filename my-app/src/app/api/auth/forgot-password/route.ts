import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendMail } from '@/lib/sendMail';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'L\'adresse email est requise' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec cette adresse email.' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/Auth/ResetPassword?token=${resetToken}`;

    // Send email
    try {
      await sendMail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe - ESPRIT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">ESPRIT</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Plateforme d'entretiens</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #374151; margin-bottom: 20px;">Réinitialisation de votre mot de passe</h2>
              
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                Bonjour ${user.prenom || user.name || 'Utilisateur'},
              </p>
              
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #dc2626, #b91c1c); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
                  🔑 Réinitialiser mon mot de passe
                </a>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; word-break: break-all; color: #374151; font-family: monospace;">
                ${resetUrl}
              </p>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="color: #92400e; margin: 0; font-weight: bold;">⚠️ Important :</p>
                <ul style="color: #92400e; margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Ce lien expire dans 1 heure</li>
                  <li>Ne partagez ce lien avec personne</li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                Cordialement,<br>
                L'équipe ESPRIT
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        `,
      });

      return NextResponse.json(
        { message: 'Email de réinitialisation envoyé avec succès ! Vérifiez votre boîte de réception.' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Clean up the reset token if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
