import Link from 'next/link';

export const metadata = { title: 'Тусламж — Voca' };

const FAQ = [
  {
    q: 'Нууц үгээ мартсан бол яах вэ?',
    a: 'Нэвтрэх хуудсан дээрх "Нууц үгээ мартсан уу?" холбоос дээр дараад, бүртгэлтэй имэйл хаягаараа шинэ нууц үг тохируулна уу.',
  },
  {
    q: 'Багц (Стандарт/Premium) яаж авах вэ?',
    a: 'Апп доторх Профайл → Эрх сунгалт хэсэгт орж, хүссэн багцаа сонгоод QPay-ээр (QR код эсвэл банкны апп) төлбөрөө хийхэд багц шууд идэвхжинэ.',
  },
  {
    q: 'Багцаа цуцлах эсвэл сунгахгүй байх боломжтой юу?',
    a: 'Тийм ээ. Багц 30 хоногийн хугацаатай бөгөөд автоматаар дахин төлбөр тооцдоггүй — дараагийн сар дахин QPay-ээр төлбөрөө хийж сунгана уу.',
  },
  {
    q: 'Төлбөр хийсэн ч багц идэвхжсэнгүй.',
    a: 'QPay-ийн баталгаажуулалт ихэвчлэн хэдхэн секундэд хийгддэг ч заримдаа саатаж болно. Апп-аа хааж дахин нээгээд Профайл хэсгээ шалгана уу. Хэрэв 10 минутаас дээш хугацаанд идэвхжээгүй бол доорх имэйлээр холбогдоно уу — гүйлгээний баримтаа хавсаргавал түргэн шийдвэрлэнэ.',
  },
  {
    q: 'Бүртгэлээ бүрмөсөн устгамаар байна.',
    a: (
      <>Энэ хуудаснаас устгах хүсэлтээ илгээж болно: <Link href="/delete-account">vocamongolia.cc/delete-account</Link></>
    ),
  },
];

export default function SupportPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 64px' }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 8 }}>
        Тусламж — Voca
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 14.5, fontWeight: 500, marginBottom: 32, lineHeight: 1.6 }}>
        Асуулт, санал хүсэлт, эсвэл техникийн асуудал гарвал доорх түгээмэл асуултуудыг үзэх эсвэл шууд бидэнтэй холбогдоорой.
      </p>

      <div className="card" style={{ padding: '8px 24px', marginBottom: 24 }}>
        {FAQ.map((item, i) => (
          <div key={i} style={{ padding: '18px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{item.q}</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>Шууд холбогдох</div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 4 }}>
          Имэйл: <a href="mailto:pilotpandora77@gmail.com" style={{ color: 'var(--purple)', fontWeight: 700 }}>pilotpandora77@gmail.com</a>
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12 }}>
          Бид ихэвчлэн 1–2 ажлын өдрийн дотор хариу өгдөг.
        </p>
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 24, textAlign: 'center' }}>
        <a href="https://voca-api-e7re.onrender.com/privacy" style={{ color: 'var(--purple)', fontWeight: 700 }}>Нууцлалын бодлого</a>
        {'  ·  '}
        <Link href="/delete-account" style={{ color: 'var(--purple)', fontWeight: 700 }}>Бүртгэл устгах</Link>
      </p>
    </div>
  );
}
