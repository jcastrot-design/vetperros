import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "PetMatch <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[EMAIL SKIP] No RESEND_API_KEY. To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
  }
}

export async function sendBookingCreatedEmail(
  providerEmail: string,
  providerName: string,
  serviceName: string,
  clientName: string,
  date: string,
) {
  await sendEmail(
    providerEmail,
    `Nueva reserva: ${serviceName}`,
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#f97316">Nueva Reserva Recibida</h2>
      <p>Hola ${providerName},</p>
      <p><strong>${clientName}</strong> ha solicitado tu servicio <strong>${serviceName}</strong> para el <strong>${date}</strong>.</p>
      <p>Ingresa a PetMatch para confirmar o rechazar la reserva.</p>
      <a href="${process.env.AUTH_URL || "http://localhost:3000"}/provider/bookings" style="display:inline-block;padding:12px 24px;background:#f97316;color:white;text-decoration:none;border-radius:8px;margin-top:8px">Ver Reserva</a>
      <p style="color:#666;font-size:12px;margin-top:24px">— Equipo PetMatch</p>
    </div>
    `,
  );
}

export async function sendBookingConfirmedEmail(
  clientEmail: string,
  clientName: string,
  serviceName: string,
  providerName: string,
  bookingId: string,
) {
  const paymentUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/bookings/${bookingId}`;
  await sendEmail(
    clientEmail,
    `Reserva aceptada: ${serviceName}`,
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#22c55e">Tu Reserva fue Aceptada</h2>
      <p>Hola ${clientName},</p>
      <p><strong>${providerName}</strong> ha aceptado tu reserva de <strong>${serviceName}</strong>.</p>
      <p>Completa el pago para confirmar tu reserva:</p>
      <a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;margin-top:8px">Completar Pago</a>
      <p style="color:#666;font-size:12px;margin-top:24px">— Equipo PetMatch</p>
    </div>
    `,
  );
}

export async function sendPaymentSuccessEmail(
  clientEmail: string,
  clientName: string,
  serviceName: string,
  amount: number,
) {
  await sendEmail(
    clientEmail,
    `Pago confirmado: ${serviceName}`,
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#22c55e">Pago Confirmado</h2>
      <p>Hola ${clientName},</p>
      <p>Tu pago de <strong>$${amount.toLocaleString()} CLP</strong> por <strong>${serviceName}</strong> ha sido procesado exitosamente.</p>
      <p>El proveedor ha sido notificado y tu servicio esta confirmado.</p>
      <a href="${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/bookings" style="display:inline-block;padding:12px 24px;background:#f97316;color:white;text-decoration:none;border-radius:8px;margin-top:8px">Ver mis Reservas</a>
      <p style="color:#666;font-size:12px;margin-top:24px">— Equipo PetMatch</p>
    </div>
    `,
  );
}

export async function sendReminderEmail(
  userEmail: string,
  userName: string,
  reminderTitle: string,
  petName: string,
  dueDate: string,
) {
  await sendEmail(
    userEmail,
    `Recordatorio: ${reminderTitle}`,
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#f97316">Recordatorio de Salud</h2>
      <p>Hola ${userName},</p>
      <p>Tienes un recordatorio proximo para <strong>${petName}</strong>:</p>
      <div style="padding:16px;background:#fff7ed;border-radius:8px;border-left:4px solid #f97316;margin:16px 0">
        <p style="font-weight:bold;margin:0">${reminderTitle}</p>
        <p style="color:#666;margin:4px 0 0">Fecha: ${dueDate}</p>
      </div>
      <a href="${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/reminders" style="display:inline-block;padding:12px 24px;background:#f97316;color:white;text-decoration:none;border-radius:8px;margin-top:8px">Ver Recordatorios</a>
      <p style="color:#666;font-size:12px;margin-top:24px">— Equipo PetMatch</p>
    </div>
    `,
  );
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await sendEmail(
    email,
    "Restablecer contrasena - PetMatch",
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#f97316">Restablecer Contrasena</h2>
      <p>Recibimos una solicitud para restablecer tu contrasena.</p>
      <p>Haz click en el siguiente enlace para crear una nueva contrasena:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#f97316;color:white;text-decoration:none;border-radius:8px;margin-top:8px">Restablecer Contrasena</a>
      <p style="color:#666;font-size:13px;margin-top:16px">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.</p>
      <p style="color:#666;font-size:12px;margin-top:24px">— Equipo PetMatch</p>
    </div>
    `,
  );
}

export async function sendCheckinEmail(
  clientEmail: string,
  clientName: string,
  providerName: string,
  serviceName: string,
) {
  await sendEmail(
    clientEmail,
    `${providerName} ha llegado - ${serviceName}`,
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#a855f7">Servicio Iniciado</h2>
      <p>Hola ${clientName},</p>
      <p><strong>${providerName}</strong> ha realizado el check-in para tu servicio <strong>${serviceName}</strong>.</p>
      <p>El servicio esta en curso. Recibiras una notificacion cuando finalice.</p>
      <a href="${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/bookings" style="display:inline-block;padding:12px 24px;background:#a855f7;color:white;text-decoration:none;border-radius:8px;margin-top:8px">Ver Detalle</a>
      <p style="color:#666;font-size:12px;margin-top:24px">— Equipo PetMatch</p>
    </div>
    `,
  );
}

export async function sendCheckoutEmail(
  clientEmail: string,
  clientName: string,
  providerName: string,
  serviceName: string,
) {
  await sendEmail(
    clientEmail,
    `Servicio finalizado - ${serviceName}`,
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#22c55e">Servicio Completado</h2>
      <p>Hola ${clientName},</p>
      <p><strong>${providerName}</strong> ha finalizado tu servicio <strong>${serviceName}</strong>.</p>
      <p>Dejanos una resena para ayudar a otros usuarios:</p>
      <a href="${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/bookings" style="display:inline-block;padding:12px 24px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;margin-top:8px">Dejar Resena</a>
      <p style="color:#666;font-size:12px;margin-top:24px">— Equipo PetMatch</p>
    </div>
    `,
  );
}
