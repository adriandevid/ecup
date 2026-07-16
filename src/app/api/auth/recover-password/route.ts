import { query, queryOne } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
   try {
     const { email } = await req.json();

    const url = process.env.RECOVER_PASSWORD_URL;

    const existingUserWithEmail = await queryOne<{ id: number } | undefined | null>('SELECT id FROM users WHERE email = $1;', [email]);

    if(existingUserWithEmail == undefined || existingUserWithEmail == null) {
        return NextResponse.json({ message: "Usuário referente ao email não encontrado!" }, { status: 400 });
    }

    const existing = await queryOne<{ id: number, expiration_date: string }| undefined | null>('SELECT id, expiration_date FROM reset_tokens WHERE email = $1  order by id desc;', [email]);
    
    if(existing != null) {
        if(new Date() < new Date(existing.expiration_date)) {
            return NextResponse.json({ message: "Existe um token válido que já foi enviado ao seu email!" }, { status: 400 });
        }
    }

    const aleatoryHash = Math.random().toString(36).substring(2, 12);

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 5);

    await query<{ id: number, expiration_date: string, hash_code: string, email: string } | undefined | null>(
        'INSERT INTO public.reset_tokens(hash_code, expiration_date, email) VALUES($1, $2, $3)  RETURNING id, hash_code, expiration_date, email;',
        [aleatoryHash, expirationDate, email]
    );

    const messageResult = await sendEmail({
        from: 'adriandevid36@gmail.com',
        to: email,
        subject: 'Recuperação de Senha do sistema Ecup',
        html: `
            <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ecup - Recuperação de Senha</title>
    <style type="text/css">
        /* Client-specific Resets */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* Hover styles */
        .btn-action:hover {
            opacity: 0.9 !important;
        }
    </style>
</head>

<body
    style="background-color: #0b0c10; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0;">

    <!-- Wrapper Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%"
        style="background-color: #0b0c10; table-layout: fixed;">
        <tr>
            <td align="center" valign="top">

                <!-- Spacing block -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td height="40" style="font-size: 0px; line-height: 0px;">&nbsp;</td>
                    </tr>
                </table>

                <!-- Main Container (Standard Max 600px) -->
                <table border="0" cellpadding="0" cellspacing="0" width="600"
                    style="background-color: #1a1d24; border-radius: 12px; border: 1px solid #2e3541; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

                    <!-- Decorative Neon Brand Line (Header Accent) -->
                    <tr>
                        <td height="4" style="background: #10b981; line-height: 4px; font-size: 0px;">&nbsp;</td>
                    </tr>

                    <!-- Header Segment -->
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 40px 20px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <!-- Esports Logo -->
                                        <div
                                            style="font-family: 'Segoe UI', -apple-system, sans-serif; font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 10px rgba(255,255,255,0.05);">
                                            e<span style="color: #10b981;">cup</span>
                                        </div>
                                        <div
                                            style="font-size: 11px; font-weight: 700; color: #7a889b; letter-spacing: 4px; text-transform: uppercase; margin-top: 8px;">
                                            VIRTUAL TOURNAMENTS HUB
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content Segment -->
                    <tr>
                        <td align="center" valign="top" style="padding: 20px 40px 40px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <!-- Separation Line -->
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="80">
                                            <tr>
                                                <td height="2"
                                                    style="background-color: #10b981; opacity: 0.6; line-height: 2px; font-size: 0px;">
                                                    &nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Headline Header -->
                                <tr>
                                    <td align="center" style="padding-bottom: 15px;">
                                        <h1
                                            style="color: #ffffff; font-family: 'Segoe UI', -apple-system, sans-serif; font-size: 24px; font-weight: 800; margin: 0; line-height: 1.3; tracking: -0.5px;">
                                            Pronto para voltar ao jogo?
                                        </h1>
                                    </td>
                                </tr>

                                <!-- Body Text -->
                                <tr>
                                    <td align="center" style="padding-bottom: 35px;">
                                        <p
                                            style="color: #94a3b8; font-family: 'Segoe UI', -apple-system, sans-serif; font-size: 15px; line-height: 1.6; margin: 0; max-width: 480px;">
                                            Recebemos uma solicitação para redefinir a senha da sua conta na plataforma
                                            de copas de jogos virtuais ecup. Use o código de verificação seguro abaixo
                                            no aplicativo ou navegador para completar a operação:
                                        </p>
                                    </td>
                                </tr>

                                <!-- Gaming Passcode Verification Box (The Hero Element) -->
                                <tr>
                                    <td align="center" style="padding-bottom: 35px;">
                                        <table border="0" cellpadding="0" cellspacing="0"
                                            style="background-color: #0b0c10; border-radius: 8px; border: 1.5px dashed #10b981;">
                                            <tr>
                                                <td align="center" style="padding: 24px 45px;">
                                                    <span
                                                        style="color: #ffffff; font-family: 'Consolas', 'JetBrains Mono', monospace; font-size: 34px; font-weight: 700; letter-spacing: 5px; line-height: 1; text-shadow: 0 0 12px #10b98160;">
                                                        ${aleatoryHash}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                 <tr>
                                    <td align="center" style="padding-bottom: 35px;">
                                        <a style="padding: 12px; background-color: #10b981; border: none; border-radius: 10px; color: white; font-size: 30px; font-family: inherit; text-decoration: none;" class="button" href="${url}?recorver-hashcode=${aleatoryHash}" target="_blank">Recuperar Senha</a>
                                    </td>
                                </tr>

                                <!-- Security Expiry Notice -->
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                            style="background-color: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid #2e3541;">
                                            <tr>
                                                <td align="left"
                                                    style="padding: 15px 20px; font-family: 'Segoe UI', -apple-system, sans-serif; font-size: 13px; line-height: 1.5; color: #64748b;">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td valign="top" width="24"
                                                                style="color: #10b981; font-size: 14px; font-weight: bold; line-height: 1;">
                                                                ℹ
                                                            </td>
                                                            <td style="color: #94a3b8; font-size: 12.5px;">
                                                                Este código expira em 15 minutos e só pode ser utilizado
                                                                uma única vez. Se você não solicitou este ajuste, por
                                                                favor desconsidere este e-mail.
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    <!-- Footer / Branding Base Section -->
                    <tr>
                        <td align="center" valign="top"
                            style="background-color: #0f1115; border-top: 1px solid #2e3541; padding: 35px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center"
                                        style="color: #475569; font-family: 'Segoe UI', -apple-system, sans-serif; font-size: 11px; line-height: 1.6;">
                                        <p
                                            style="margin: 0 0 8px 0; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                                            Equipe de Suporte ecup
                                        </p>
                                        <p style="margin: 0 0 15px 0; color: #475569;">
                                            Esta é uma mensagem automática enviada por motivos de segurança. Não
                                            responda diretamente a este e-mail.
                                        </p>
                                        <p style="margin: 0; color: #475569;">
                                            Precisa de suporte especializado? Fale conosco em <a
                                                href="mailto:suporte@ecup.gg"
                                                style="color: #10b981; text-decoration: none; font-weight: 500;">suporte@ecup.gg</a>
                                        </p>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                            style="margin-top: 25px;">
                                            <tr>
                                                <td height="1"
                                                    style="background-color: #2e3541; opacity: 0.3; line-height: 1px; font-size: 0px;">
                                                    &nbsp;</td>
                                            </tr>
                                        </table>
                                        <p style="margin: 15px 0 0 0; font-size: 10px; color: #334155;">
                                            © 2026 ecup Arena Games. Todas as ligas e torneios esportivos virtuais são
                                            propriedade dos seus respectivos organizadores.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                <!-- End of Main Container -->

                <!-- Spacing block -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td height="40" style="font-size: 0px; line-height: 0px;">&nbsp;</td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>

</html>
        `
    });
     return NextResponse.json(messageResult, { status: 200 });
   } catch(ex) {
        return NextResponse.json({ error: (ex as Error).message }, { status: 400 });
   }
}