import { NextRequest, NextResponse } from "next/server";
import { sendReservationConfirmationEmail } from "../../../../lib/send-email";

export async function POST(req: NextRequest) {
  try {
    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: "reservationId est requis" },
        { status: 400 }
      );
    }

    const result = await sendReservationConfirmationEmail(reservationId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, emailId: result.emailId });
  } catch (error: any) {
    console.error("Erreur envoi email:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

