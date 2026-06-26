// VOCA multi-language course curriculum
// Category metadata is shared; words are per target-language.

export const LANGS = [
  { code: 'zh', name: 'Хятад',    native: '中文',     flag: '🇨🇳', sttLang: 'zh-CN' },
  { code: 'en', name: 'Англи',    native: 'English',  flag: '🇬🇧', sttLang: 'en-US' },
  { code: 'ja', name: 'Япон',     native: '日本語',   flag: '🇯🇵', sttLang: 'ja-JP', soon: true },
  { code: 'ko', name: 'Солонгос', native: '한국어',   flag: '🇰🇷', sttLang: 'ko-KR', soon: true },
];

export const CATEGORY_META = [
  { id: 'greetings',     num: 1,  name: 'Мэндчилгээ',       emoji: '👋', color: '#F59E0B', desc: 'Танилцах, мэндлэх, баяртай гэх өдөр тутмын мэндчилгээ.' },
  { id: 'introductions', num: 2,  name: 'Танилцах',          emoji: '🧑‍🤝‍🧑', color: '#3B82F6', desc: 'Өөрийгөө танилцуулах, нэр, нас, гарал үүсэл.' },
  { id: 'family',        num: 3,  name: 'Гэр бүл',           emoji: '👨‍👩‍👧', color: '#10B981', desc: 'Гэр бүлийн гишүүд, садан төрөл.' },
  { id: 'home',          num: 4,  name: 'Гэр',               emoji: '🏠', color: '#FB923C', desc: 'Гэр орон, тавилга, өрөөнүүд.' },
  { id: 'food',          num: 5,  name: 'Хоол',              emoji: '🍜', color: '#FACC15', desc: 'Хоол хүнс, ундаа, ресторан.' },
  { id: 'shopping',      num: 6,  name: 'Худалдаа',          emoji: '🛒', color: '#EC4899', desc: 'Дэлгүүр хэсэх, үнэ асуух, төлбөр.' },
  { id: 'payment',       num: 7,  name: 'Төлбөр, мөнгө',     emoji: '💳', color: '#14B8A6', desc: 'Мөнгө, төлбөр, банк.' },
  { id: 'transport',     num: 8,  name: 'Нийтийн тээвэр',    emoji: '🚌', color: '#0EA5E9', desc: 'Унаа, тээвэр, зам.' },
  { id: 'taxi',          num: 9,  name: 'Такси',             emoji: '🚕', color: '#F59E0B', desc: 'Такси дуудах, чиглэл хэлэх.' },
  { id: 'directions',    num: 10, name: 'Зам асуух',         emoji: '🗺️', color: '#FBBF24', desc: 'Чиглэл, байршил асуух.' },
  { id: 'hospital',      num: 11, name: 'Эмнэлэг',           emoji: '🏥', color: '#EF4444', desc: 'Эрүүл мэнд, эмнэлэг.' },
  { id: 'pharmacy',      num: 12, name: 'Эмийн сан',         emoji: '💊', color: '#06B6D4', desc: 'Эмийн сан, эм тан.' },
  { id: 'work',          num: 13, name: 'Ажил',              emoji: '💼', color: '#8B5CF6', desc: 'Ажил мэргэжил, ажлын байр.' },
  { id: 'school',        num: 14, name: 'Сургууль',          emoji: '🎓', color: '#7C3AED', desc: 'Сургууль, хичээл, суралцах.' },
  { id: 'technology',    num: 15, name: 'Технологи',         emoji: '📱', color: '#FBBF24', desc: 'Утас, компьютер, интернэт.' },
  { id: 'clothes',       num: 16, name: 'Хувцас',            emoji: '👕', color: '#EC4899', desc: 'Хувцас, өмсгөл.' },
  { id: 'weather',       num: 17, name: 'Цаг агаар',         emoji: '🌤️', color: '#38BDF8', desc: 'Цаг агаар, улирал.' },
  { id: 'freetime',      num: 18, name: 'Чөлөөт цаг',        emoji: '🏀', color: '#22C55E', desc: 'Хобби, спорт, амралт.' },
  { id: 'travel',        num: 19, name: 'Аялал',             emoji: '✈️', color: '#60A5FA', desc: 'Аялал, онгоц, зочид буудал.' },
  { id: 'emergency',     num: 20, name: 'Яаралтай нөхцөл',   emoji: '🚨', color: '#EF4444', desc: 'Яаралтай, аюултай нөхцөл.' },
];

// word helper: target, reading, mn, type, examples[[target,mn]], extra{syn,ant,rel,mn(mnemonic),emoji}
function w(target, reading, mn, type, examples = [], extra = {}) {
  const id = (reading || target).toLowerCase().replace(/[^a-z0-9]+/g, '-') || encodeURIComponent(target);
  return {
    id,
    target, reading, mn, type,
    word: target, ipa: reading, // aliases for UI compatibility
    examples: examples.map(([t, m]) => ({ en: t, mn: m })),
    synonyms: extra.syn || [], antonyms: extra.ant || [], related: extra.rel || [],
    mnemonic: extra.mn || '', emoji: extra.emoji || '',
  };
}

// ── ENGLISH ──
const EN = {
  greetings: [
    w('hello', 'həˈloʊ', 'сайн уу', 'Interjection', [['Hello, how are you?', 'Сайн уу, юу байна?']], { syn: ['hi'], ant: ['goodbye'], rel: ['hi', 'welcome'], emoji: '👋' }),
    w('goodbye', 'ɡʊdˈbaɪ', 'баяртай', 'Interjection', [['Goodbye, see you tomorrow.', 'Баяртай, маргааш уулзъя.']], { syn: ['bye'], ant: ['hello'], emoji: '👋' }),
    w('thanks', 'θæŋks', 'баярлалаа', 'Interjection', [['Thanks for your help.', 'Тусалсанд баярлалаа.']], { emoji: '🙏' }),
    w('please', 'pliːz', 'гуйя', 'Adverb', [['Please sit down.', 'Сууна уу.']], { emoji: '🙏' }),
    w('sorry', 'ˈsɒri', 'уучлаарай', 'Interjection', [['Sorry, I am late.', 'Уучлаарай, хоцорлоо.']], { emoji: '😔' }),
  ],
  introductions: [
    w('name', 'neɪm', 'нэр', 'Noun', [['My name is Bat.', 'Миний нэр Бат.']], { emoji: '📛' }),
    w('age', 'eɪdʒ', 'нас', 'Noun', [['What is your age?', 'Та хэдэн настай вэ?']], { emoji: '🎂' }),
    w('friend', 'frend', 'найз', 'Noun', [['He is my friend.', 'Тэр миний найз.']], { emoji: '🤝' }),
    w('meet', 'miːt', 'уулзах', 'Verb', [['Nice to meet you.', 'Танилцсандаа баяртай.']], { emoji: '👋' }),
  ],
  family: [
    w('mother', 'ˈmʌðər', 'ээж', 'Noun', [['My mother is a teacher.', 'Миний ээж багш.']], { syn: ['mom'], ant: ['father'], emoji: '👩' }),
    w('father', 'ˈfɑːðər', 'аав', 'Noun', [['His father works hard.', 'Түүний аав шаргуу ажилладаг.']], { ant: ['mother'], emoji: '👨' }),
    w('sister', 'ˈsɪstər', 'эгч/дүү', 'Noun', [['I have one sister.', 'Надад нэг эгчтэй.']], { ant: ['brother'], emoji: '👧' }),
    w('brother', 'ˈbrʌðər', 'ах/дүү', 'Noun', [['My brother is tall.', 'Миний ах өндөр.']], { ant: ['sister'], emoji: '👦' }),
  ],
  home: [
    w('house', 'haʊs', 'байшин', 'Noun', [['This is a big house.', 'Энэ том байшин.']], { emoji: '🏠' }),
    w('room', 'ruːm', 'өрөө', 'Noun', [['My room is clean.', 'Миний өрөө цэвэрхэн.']], { emoji: '🚪' }),
    w('door', 'dɔːr', 'хаалга', 'Noun', [['Open the door.', 'Хаалгаа онгойлго.']], { emoji: '🚪' }),
    w('table', 'ˈteɪbl', 'ширээ', 'Noun', [['The book is on the table.', 'Ном ширээн дээр.']], { emoji: '🪑' }),
  ],
  food: [
    w('food', 'fuːd', 'хоол', 'Noun', [['The food is delicious.', 'Хоол амттай.']], { emoji: '🍲' }),
    w('water', 'ˈwɔːtər', 'ус', 'Noun', [['I drink water.', 'Би ус уудаг.']], { emoji: '💧' }),
    w('eat', 'iːt', 'идэх', 'Verb', [['Let us eat.', 'Хооллоё.']], { emoji: '🍽️' }),
    w('tea', 'tiː', 'цай', 'Noun', [['She likes tea.', 'Тэр цайнд дуртай.']], { emoji: '🍵' }),
    w('coffee', 'ˈkɒfi', 'кофе', 'Noun', [['One coffee, please.', 'Нэг кофе авъя.']], { emoji: '☕' }),
  ],
  shopping: [
    w('price', 'praɪs', 'үнэ', 'Noun', [['What is the price of this?', 'Энэ ямар үнэтэй вэ?'], ['The price is too high.', 'Үнэ хэт өндөр байна.']], { syn: ['cost', 'value'], ant: ['discount'], rel: ['expensive', 'cheap', 'buy'], mn: 'PRICE = Pay + Amount → Үнэ', emoji: '🏷️' }),
    w('expensive', 'ɪkˈspensɪv', 'үнэтэй', 'Adjective', [['This bag is expensive.', 'Энэ цүнх үнэтэй.']], { ant: ['cheap'], rel: ['price'], emoji: '💵' }),
    w('cheap', 'tʃiːp', 'хямд', 'Adjective', [['This shirt is cheap.', 'Энэ цамц хямд.']], { ant: ['expensive'], emoji: '👛' }),
    w('buy', 'baɪ', 'худалдан авах', 'Verb', [['I want to buy this.', 'Би үүнийг авмаар байна.']], { ant: ['sell'], emoji: '🛍️' }),
    w('sell', 'sel', 'зарах', 'Verb', [['They sell electronics.', 'Тэд цахилгаан бараа зардаг.']], { ant: ['buy'], emoji: '🎁' }),
    w('discount', 'ˈdɪskaʊnt', 'хямдрал', 'Noun', [['There is a 20% discount.', '20% хямдралтай.']], { emoji: '🏷️' }),
  ],
  payment: [
    w('money', 'ˈmʌni', 'мөнгө', 'Noun', [['I have no money.', 'Надад мөнгө байхгүй.']], { emoji: '💰' }),
    w('pay', 'peɪ', 'төлөх', 'Verb', [['How can I pay?', 'Би яаж төлөх вэ?']], { emoji: '💳' }),
    w('cash', 'kæʃ', 'бэлэн мөнгө', 'Noun', [['Do you accept cash?', 'Бэлэн мөнгө авах уу?']], { ant: ['card'], emoji: '💵' }),
    w('card', 'kɑːrd', 'карт', 'Noun', [['I will pay by card.', 'Картаар төлнө.']], { emoji: '💳' }),
  ],
  transport: [
    w('bus', 'bʌs', 'автобус', 'Noun', [['The bus is late.', 'Автобус хоцорч байна.']], { emoji: '🚌' }),
    w('train', 'treɪn', 'галт тэрэг', 'Noun', [['The train is fast.', 'Галт тэрэг хурдан.']], { emoji: '🚆' }),
    w('ticket', 'ˈtɪkɪt', 'тасалбар', 'Noun', [['I need two tickets.', 'Хоёр тасалбар хэрэгтэй.']], { emoji: '🎫' }),
  ],
  taxi: [
    w('taxi', 'ˈtæksi', 'такси', 'Noun', [['Call a taxi, please.', 'Такси дуудаач.']], { emoji: '🚕' }),
    w('driver', 'ˈdraɪvər', 'жолооч', 'Noun', [['The driver is kind.', 'Жолооч эелдэг.']], { emoji: '🧑‍✈️' }),
    w('stop', 'stɒp', 'зогсох', 'Verb', [['Please stop here.', 'Энд зогсооно уу.']], { emoji: '🛑' }),
  ],
  directions: [
    w('left', 'left', 'зүүн', 'Noun', [['Turn left here.', 'Энд зүүн эргэ.']], { ant: ['right'], emoji: '⬅️' }),
    w('right', 'raɪt', 'баруун', 'Noun', [['Go to the right.', 'Баруун тийш яв.']], { ant: ['left'], emoji: '➡️' }),
    w('straight', 'streɪt', 'чигээрээ', 'Adverb', [['Go straight ahead.', 'Чигээрээ яв.']], { emoji: '⬆️' }),
  ],
  hospital: [
    w('doctor', 'ˈdɒktər', 'эмч', 'Noun', [['I need a doctor.', 'Надад эмч хэрэгтэй.']], { emoji: '🧑‍⚕️' }),
    w('medicine', 'ˈmedɪsɪn', 'эм', 'Noun', [['Take this medicine.', 'Энэ эмийг уу.']], { emoji: '💊' }),
    w('sick', 'sɪk', 'өвчтэй', 'Adjective', [['I feel sick.', 'Би өвчтэй байна.']], { emoji: '🤒' }),
  ],
  pharmacy: [
    w('pill', 'pɪl', 'шахмал', 'Noun', [['Take one pill a day.', 'Өдөрт нэг шахмал уу.']], { emoji: '💊' }),
    w('fever', 'ˈfiːvər', 'халуурах', 'Noun', [['I have a fever.', 'Би халуурч байна.']], { emoji: '🌡️' }),
  ],
  work: [
    w('work', 'wɜːrk', 'ажил', 'Noun', [['I go to work at 9.', '9 цагт ажилдаа очдог.']], { syn: ['job'], emoji: '💼' }),
    w('office', 'ˈɒfɪs', 'оффис', 'Noun', [['The office is downtown.', 'Оффис хотын төвд.']], { emoji: '🏢' }),
    w('meeting', 'ˈmiːtɪŋ', 'хурал', 'Noun', [['We have a meeting.', 'Бид хуралтай.']], { emoji: '📅' }),
  ],
  school: [
    w('school', 'skuːl', 'сургууль', 'Noun', [['I study at school.', 'Би сургуульд сурдаг.']], { emoji: '🏫' }),
    w('teacher', 'ˈtiːtʃər', 'багш', 'Noun', [['Our teacher is kind.', 'Манай багш эелдэг.']], { ant: ['student'], emoji: '🧑‍🏫' }),
    w('student', 'ˈstuːdnt', 'оюутан', 'Noun', [['He is a good student.', 'Тэр сайн оюутан.']], { ant: ['teacher'], emoji: '🧑‍🎓' }),
    w('learn', 'lɜːrn', 'сурах', 'Verb', [['I want to learn.', 'Би сурмаар байна.']], { emoji: '🧠' }),
  ],
  technology: [
    w('phone', 'foʊn', 'утас', 'Noun', [['My phone is new.', 'Миний утас шинэ.']], { emoji: '📱' }),
    w('computer', 'kəmˈpjuːtər', 'компьютер', 'Noun', [['I work on a computer.', 'Компьютер дээр ажилладаг.']], { emoji: '💻' }),
    w('internet', 'ˈɪntərnet', 'интернэт', 'Noun', [['The internet is slow.', 'Интернэт удаан.']], { emoji: '🌐' }),
  ],
  clothes: [
    w('shirt', 'ʃɜːrt', 'цамц', 'Noun', [['This shirt is blue.', 'Энэ цамц цэнхэр.']], { emoji: '👕' }),
    w('shoes', 'ʃuːz', 'гутал', 'Noun', [['My shoes are new.', 'Миний гутал шинэ.']], { emoji: '👟' }),
    w('hat', 'hæt', 'малгай', 'Noun', [['He wears a hat.', 'Тэр малгай өмссөн.']], { emoji: '🧢' }),
  ],
  weather: [
    w('weather', 'ˈweðər', 'цаг агаар', 'Noun', [['The weather is nice.', 'Цаг агаар сайхан.']], { emoji: '🌤️' }),
    w('rain', 'reɪn', 'бороо', 'Noun', [['It will rain today.', 'Өнөөдөр бороо орно.']], { emoji: '🌧️' }),
    w('hot', 'hɒt', 'халуун', 'Adjective', [['It is hot today.', 'Өнөөдөр халуун.']], { ant: ['cold'], emoji: '🔥' }),
    w('cold', 'koʊld', 'хүйтэн', 'Adjective', [['It is cold.', 'Хүйтэн байна.']], { ant: ['hot'], emoji: '🥶' }),
  ],
  freetime: [
    w('music', 'ˈmjuːzɪk', 'хөгжим', 'Noun', [['I love music.', 'Би хөгжимд дуртай.']], { emoji: '🎵' }),
    w('game', 'ɡeɪm', 'тоглоом', 'Noun', [['Let us play a game.', 'Тоглоом тоглоё.']], { emoji: '🎮' }),
    w('movie', 'ˈmuːvi', 'кино', 'Noun', [['We watched a movie.', 'Бид кино үзлээ.']], { emoji: '🎬' }),
  ],
  travel: [
    w('airport', 'ˈeəpɔːrt', 'нисэх буудал', 'Noun', [['The airport is far.', 'Буудал хол.']], { emoji: '🛫' }),
    w('hotel', 'hoʊˈtel', 'зочид буудал', 'Noun', [['Our hotel is nice.', 'Манай буудал сайхан.']], { emoji: '🏨' }),
    w('passport', 'ˈpɑːspɔːrt', 'пасспорт', 'Noun', [['Show your passport.', 'Пасспортоо үзүүл.']], { emoji: '🛂' }),
  ],
  emergency: [
    w('help', 'help', 'тусламж', 'Noun', [['Help me, please!', 'Туслаач!']], { emoji: '🆘' }),
    w('police', 'pəˈliːs', 'цагдаа', 'Noun', [['Call the police!', 'Цагдаа дуудаарай!']], { emoji: '👮' }),
    w('fire', 'ˈfaɪər', 'гал', 'Noun', [['There is a fire!', 'Гал гарлаа!']], { emoji: '🔥' }),
  ],
};

// ── CHINESE (primary) ──
const ZH = {
  greetings: [
    w('你好', 'nǐ hǎo', 'сайн уу', 'Мэндчилгээ', [['你好！你好吗？', 'Сайн уу! Сайн байна уу?']], { rel: ['谢谢', '再见'], mn: '你 (чи) + 好 (сайн) = сайн уу', emoji: '👋' }),
    w('再见', 'zài jiàn', 'баяртай', 'Мэндчилгээ', [['再见，明天见！', 'Баяртай, маргааш уулзъя!']], { ant: ['你好'], emoji: '👋' }),
    w('谢谢', 'xiè xie', 'баярлалаа', 'Мэндчилгээ', [['谢谢你的帮助。', 'Тусалсанд баярлалаа.']], { rel: ['不客气'], emoji: '🙏' }),
    w('对不起', 'duì bu qǐ', 'уучлаарай', 'Мэндчилгээ', [['对不起，我迟到了。', 'Уучлаарай, хоцорлоо.']], { emoji: '😔' }),
    w('请', 'qǐng', 'гуйя', 'Үйл үг', [['请坐。', 'Сууна уу.']], { emoji: '🙏' }),
  ],
  introductions: [
    w('名字', 'míng zi', 'нэр', 'Нэр үг', [['我的名字是巴特。', 'Миний нэр Бат.']], { emoji: '📛' }),
    w('我', 'wǒ', 'би', 'Төлөөний үг', [['我是学生。', 'Би оюутан.']], { rel: ['你', '他'], emoji: '🙋' }),
    w('你', 'nǐ', 'чи', 'Төлөөний үг', [['你好吗？', 'Чи сайн уу?']], { rel: ['我'], emoji: '👉' }),
    w('朋友', 'péng you', 'найз', 'Нэр үг', [['他是我的朋友。', 'Тэр миний найз.']], { emoji: '🤝' }),
  ],
  family: [
    w('妈妈', 'mā ma', 'ээж', 'Нэр үг', [['我妈妈是老师。', 'Миний ээж багш.']], { ant: ['爸爸'], emoji: '👩' }),
    w('爸爸', 'bà ba', 'аав', 'Нэр үг', [['爸爸在工作。', 'Аав ажиллаж байна.']], { ant: ['妈妈'], emoji: '👨' }),
    w('姐姐', 'jiě jie', 'эгч', 'Нэр үг', [['我有一个姐姐。', 'Надад нэг эгчтэй.']], { ant: ['哥哥'], emoji: '👧' }),
    w('哥哥', 'gē ge', 'ах', 'Нэр үг', [['我哥哥很高。', 'Миний ах өндөр.']], { ant: ['姐姐'], emoji: '👦' }),
  ],
  home: [
    w('家', 'jiā', 'гэр', 'Нэр үг', [['这是我的家。', 'Энэ миний гэр.']], { emoji: '🏠' }),
    w('门', 'mén', 'хаалга', 'Нэр үг', [['请开门。', 'Хаалгаа онгойлго.']], { emoji: '🚪' }),
    w('桌子', 'zhuō zi', 'ширээ', 'Нэр үг', [['书在桌子上。', 'Ном ширээн дээр.']], { emoji: '🪑' }),
    w('床', 'chuáng', 'ор', 'Нэр үг', [['我在床上睡觉。', 'Би ороороо унтдаг.']], { emoji: '🛏️' }),
  ],
  food: [
    w('吃', 'chī', 'идэх', 'Үйл үг', [['我们一起吃饭。', 'Хамт хооллоё.']], { emoji: '🍽️' }),
    w('水', 'shuǐ', 'ус', 'Нэр үг', [['我每天喝水。', 'Би өдөр бүр ус уудаг.']], { emoji: '💧' }),
    w('米饭', 'mǐ fàn', 'будаа', 'Нэр үг', [['我要炒饭。', 'Би шарсан будаа авна.']], { emoji: '🍚' }),
    w('茶', 'chá', 'цай', 'Нэр үг', [['她喜欢绿茶。', 'Тэр ногоон цайнд дуртай.']], { emoji: '🍵' }),
    w('咖啡', 'kā fēi', 'кофе', 'Нэр үг', [['一杯咖啡。', 'Нэг кофе.']], { emoji: '☕' }),
  ],
  shopping: [
    w('价格', 'jià gé', 'үнэ', 'Нэр үг', [['这个多少钱？', 'Энэ ямар үнэтэй вэ?'], ['价格太高了。', 'Үнэ хэт өндөр.']], { syn: ['钱'], rel: ['贵', '便宜', '买'], emoji: '🏷️' }),
    w('贵', 'guì', 'үнэтэй', 'Тэмдэг нэр', [['这个包很贵。', 'Энэ цүнх үнэтэй.']], { ant: ['便宜'], emoji: '💵' }),
    w('便宜', 'pián yi', 'хямд', 'Тэмдэг нэр', [['这件衬衫很便宜。', 'Энэ цамц хямд.']], { ant: ['贵'], emoji: '👛' }),
    w('买', 'mǎi', 'худалдан авах', 'Үйл үг', [['我想买这个。', 'Би үүнийг авмаар байна.']], { ant: ['卖'], emoji: '🛍️' }),
    w('卖', 'mài', 'зарах', 'Үйл үг', [['他们卖电器。', 'Тэд цахилгаан бараа зардаг.']], { ant: ['买'], emoji: '🎁' }),
    w('钱', 'qián', 'мөнгө', 'Нэр үг', [['我没有钱。', 'Надад мөнгө байхгүй.']], { emoji: '💰' }),
  ],
  payment: [
    w('钱', 'qián', 'мөнгө', 'Нэр үг', [['我没有钱。', 'Надад мөнгө байхгүй.']], { emoji: '💰' }),
    w('付', 'fù', 'төлөх', 'Үйл үг', [['我怎么付钱？', 'Би яаж төлөх вэ?']], { emoji: '💳' }),
    w('银行', 'yín háng', 'банк', 'Нэр үг', [['银行开门了。', 'Банк нээлттэй.']], { emoji: '🏦' }),
  ],
  transport: [
    w('公共汽车', 'gōng gòng qì chē', 'автобус', 'Нэр үг', [['公共汽车晚了。', 'Автобус хоцорлоо.']], { emoji: '🚌' }),
    w('火车', 'huǒ chē', 'галт тэрэг', 'Нэр үг', [['火车很快。', 'Галт тэрэг хурдан.']], { emoji: '🚆' }),
    w('票', 'piào', 'тасалбар', 'Нэр үг', [['我要两张票。', 'Хоёр тасалбар авна.']], { emoji: '🎫' }),
  ],
  taxi: [
    w('出租车', 'chū zū chē', 'такси', 'Нэр үг', [['请叫出租车。', 'Такси дуудаач.']], { emoji: '🚕' }),
    w('司机', 'sī jī', 'жолооч', 'Нэр үг', [['司机很好。', 'Жолооч сайн хүн.']], { emoji: '🧑‍✈️' }),
    w('停', 'tíng', 'зогсох', 'Үйл үг', [['请在这里停。', 'Энд зогсооно уу.']], { emoji: '🛑' }),
  ],
  directions: [
    w('左', 'zuǒ', 'зүүн', 'Нэр үг', [['在这里左转。', 'Энд зүүн эргэ.']], { ant: ['右'], emoji: '⬅️' }),
    w('右', 'yòu', 'баруун', 'Нэр үг', [['往右走。', 'Баруун тийш яв.']], { ant: ['左'], emoji: '➡️' }),
    w('直走', 'zhí zǒu', 'чигээрээ явах', 'Үйл үг', [['一直走。', 'Чигээрээ яв.']], { emoji: '⬆️' }),
  ],
  hospital: [
    w('医生', 'yī shēng', 'эмч', 'Нэр үг', [['我需要医生。', 'Надад эмч хэрэгтэй.']], { emoji: '🧑‍⚕️' }),
    w('药', 'yào', 'эм', 'Нэр үг', [['吃这个药。', 'Энэ эмийг уу.']], { emoji: '💊' }),
    w('病', 'bìng', 'өвчин', 'Нэр үг', [['我生病了。', 'Би өвчтэй боллоо.']], { emoji: '🤒' }),
  ],
  pharmacy: [
    w('发烧', 'fā shāo', 'халуурах', 'Үйл үг', [['我发烧了。', 'Би халуурч байна.']], { emoji: '🌡️' }),
    w('咳嗽', 'ké sou', 'ханиалгах', 'Үйл үг', [['我咳嗽。', 'Би ханиаж байна.']], { emoji: '😷' }),
  ],
  work: [
    w('工作', 'gōng zuò', 'ажил', 'Нэр үг', [['我去工作。', 'Би ажилдаа явна.']], { emoji: '💼' }),
    w('办公室', 'bàn gōng shì', 'оффис', 'Нэр үг', [['办公室在市中心。', 'Оффис хотын төвд.']], { emoji: '🏢' }),
    w('会议', 'huì yì', 'хурал', 'Нэр үг', [['我们有会议。', 'Бид хуралтай.']], { emoji: '📅' }),
  ],
  school: [
    w('学校', 'xué xiào', 'сургууль', 'Нэр үг', [['我在学校学习。', 'Би сургуульд сурдаг.']], { emoji: '🏫' }),
    w('老师', 'lǎo shī', 'багш', 'Нэр үг', [['我们的老师很好。', 'Манай багш сайн.']], { ant: ['学生'], emoji: '🧑‍🏫' }),
    w('学生', 'xué sheng', 'оюутан', 'Нэр үг', [['他是好学生。', 'Тэр сайн оюутан.']], { ant: ['老师'], emoji: '🧑‍🎓' }),
    w('学习', 'xué xí', 'суралцах', 'Үйл үг', [['我想学习中文。', 'Би хятад хэл сурмаар байна.']], { emoji: '🧠' }),
  ],
  technology: [
    w('手机', 'shǒu jī', 'утас', 'Нэр үг', [['我的手机是新的。', 'Миний утас шинэ.']], { emoji: '📱' }),
    w('电脑', 'diàn nǎo', 'компьютер', 'Нэр үг', [['我在电脑上工作。', 'Компьютер дээр ажилладаг.']], { emoji: '💻' }),
    w('网络', 'wǎng luò', 'интернэт', 'Нэр үг', [['网络很慢。', 'Интернэт удаан.']], { emoji: '🌐' }),
  ],
  clothes: [
    w('衬衫', 'chèn shān', 'цамц', 'Нэр үг', [['这件衬衫是蓝色的。', 'Энэ цамц цэнхэр.']], { emoji: '👕' }),
    w('鞋', 'xié', 'гутал', 'Нэр үг', [['我的鞋是新的。', 'Миний гутал шинэ.']], { emoji: '👟' }),
    w('帽子', 'mào zi', 'малгай', 'Нэр үг', [['他戴帽子。', 'Тэр малгай өмссөн.']], { emoji: '🧢' }),
  ],
  weather: [
    w('天气', 'tiān qì', 'цаг агаар', 'Нэр үг', [['天气很好。', 'Цаг агаар сайхан.']], { emoji: '🌤️' }),
    w('雨', 'yǔ', 'бороо', 'Нэр үг', [['今天会下雨。', 'Өнөөдөр бороо орно.']], { emoji: '🌧️' }),
    w('热', 'rè', 'халуун', 'Тэмдэг нэр', [['今天很热。', 'Өнөөдөр халуун.']], { ant: ['冷'], emoji: '🔥' }),
    w('冷', 'lěng', 'хүйтэн', 'Тэмдэг нэр', [['很冷。', 'Хүйтэн байна.']], { ant: ['热'], emoji: '🥶' }),
  ],
  freetime: [
    w('音乐', 'yīn yuè', 'хөгжим', 'Нэр үг', [['我喜欢音乐。', 'Би хөгжимд дуртай.']], { emoji: '🎵' }),
    w('游戏', 'yóu xì', 'тоглоом', 'Нэр үг', [['我们玩游戏吧。', 'Тоглоом тоглоё.']], { emoji: '🎮' }),
    w('电影', 'diàn yǐng', 'кино', 'Нэр үг', [['我们看电影了。', 'Бид кино үзлээ.']], { emoji: '🎬' }),
  ],
  travel: [
    w('机场', 'jī chǎng', 'нисэх буудал', 'Нэр үг', [['机场很远。', 'Буудал хол.']], { emoji: '🛫' }),
    w('酒店', 'jiǔ diàn', 'зочид буудал', 'Нэр үг', [['我们的酒店很好。', 'Манай буудал сайхан.']], { emoji: '🏨' }),
    w('护照', 'hù zhào', 'пасспорт', 'Нэр үг', [['请出示护照。', 'Пасспортоо үзүүл.']], { emoji: '🛂' }),
  ],
  emergency: [
    w('帮助', 'bāng zhù', 'тусламж', 'Нэр үг', [['请帮助我！', 'Туслаач!']], { emoji: '🆘' }),
    w('警察', 'jǐng chá', 'цагдаа', 'Нэр үг', [['叫警察！', 'Цагдаа дуудаарай!']], { emoji: '👮' }),
    w('火', 'huǒ', 'гал', 'Нэр үг', [['着火了！', 'Гал гарлаа!']], { emoji: '🔥' }),
  ],
};

const WORDS = { zh: ZH, en: EN, ja: {}, ko: {} };

export function getCourses(lang = 'zh') {
  const data = WORDS[lang] || {};
  return CATEGORY_META.map(c => ({ ...c, words: data[c.id] || [] }));
}
export function findCategory(lang, id) { return getCourses(lang).find(c => c.id === id); }
export function findWord(lang, catId, wid) {
  const c = findCategory(lang, catId);
  return c ? c.words.find(x => x.id === wid) : null;
}
