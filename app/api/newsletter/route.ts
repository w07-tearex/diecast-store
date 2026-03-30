import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Save to Supabase 'subscribers' table
    const { error: dbError } = await supabase
      .from('subscribers')
      .insert([{ email }]);

    if (dbError) {
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'Email này đã đăng ký trước đó rồi ạ!' }, { status: 400 });
      }
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Lỗi hệ thống. Vui lòng thử lại.' }, { status: 500 });
    }

    // 2. Send Real Email via Resend
    if (process.env.RESEND_API_KEY) {
      console.log('Attempting to send email via Resend to:', email);
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Diecast Store <onboarding@resend.dev>',
        to: [email],
        subject: 'Chào mừng bạn đến với DIECAST STORE VN! 🏎️',
        html: `
          <div style="font-family: sans-serif; background-color: #0b0d17; padding: 40px; color: #ffffff; text-align: center; border-radius: 20px;">
            <h1 style="color: #FF42B0; font-size: 28px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px;">DIECAST STORE VN</h1>
            <p style="font-size: 16px; color: #a1a1aa; line-height: 1.6;">Cảm ơn bạn đã quan tâm và đăng ký nhận tin từ <strong>DIECAST STORE VN</strong>.</p>
            <p style="font-size: 14px; color: #71717a; margin-top: 10px;">Chúng tôi sẽ sớm gửi cho bạn những bộ sưu tập xe Mô Hình tỉ lệ 1:64 cực hiếm và Hot nhất thị trường.</p>
            <div style="margin: 40px 0;">
              <a href="https://yourstore.com" style="background-color: #FF42B0; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase;">Ghé thăm Store ngay</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #1f2937; margin: 40px 0;" />
            <p style="font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 2px;">© 2026 Diecast Store Việt Nam - 15 năm uy tín</p>
          </div>
        `
      });

      if (sendError) {
        console.error('Resend Send Error:', sendError);
      } else {
        console.log('Resend Success!', data);
      }
    } else {
      // DEV MODE: Print to Console instead of failing
      console.log('\n================================================');
      console.log('🚀 [DEV MODE] NEW NEWSLETTER SUBSCRIPTION!');
      console.log('📧 TO:', email);
      console.log('📝 SUBJECT: Chào mừng bạn đến với DIECAST STORE VN!');
      console.log('------------------------------------------------');
      console.log('Diecast Store Welcome Template Rendered Successfully.');
      console.log('Tip: Verify your domain in Resend for real delivery.');
      console.log('================================================\n');
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Newsletter API General Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
