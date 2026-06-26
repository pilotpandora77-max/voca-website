// VOCA Learning Flow — ангилалд суурилсан үгийн багцууд (course curriculum)

function w(word, ipa, mn, type, examples = [], extra = {}) {
  return {
    id: word.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    word, ipa, mn, type,
    examples: examples.map(([en, m]) => ({ en, mn: m })),
    synonyms: extra.syn || [],
    antonyms: extra.ant || [],
    related: extra.rel || [],
    mnemonic: extra.mn || '',
    emoji: extra.emoji || '',
  };
}

const CATEGORIES = [
  {
    id: 'greetings', num: 1, name: 'Мэндчилгээ', emoji: '👋', color: '#F59E0B',
    desc: 'Танилцах, мэндлэх, баяртай гэх зэрэг өдөр тутмын мэндчилгээний үгс.',
    words: [
      w('hello', 'həˈloʊ', 'сайн уу', 'Interjection', [['Hello, how are you?', 'Сайн уу, юу байна?']], { syn: ['hi', 'hey'], ant: ['goodbye'], rel: ['hi', 'greet', 'welcome'], mn: 'HELLO = сайн уу гэж хэлэх', emoji: '👋' }),
      w('goodbye', 'ɡʊdˈbaɪ', 'баяртай', 'Interjection', [['Goodbye, see you tomorrow.', 'Баяртай, маргааш уулзъя.']], { syn: ['bye', 'farewell'], ant: ['hello'], rel: ['bye', 'leave'], emoji: '👋' }),
      w('thanks', 'θæŋks', 'баярлалаа', 'Interjection', [['Thanks for your help.', 'Тусалсанд баярлалаа.']], { syn: ['thank you'], rel: ['please', 'welcome'], emoji: '🙏' }),
      w('please', 'pliːz', 'гуйя', 'Adverb', [['Please sit down.', 'Сууна уу.']], { rel: ['thanks'], emoji: '🙏' }),
      w('sorry', 'ˈsɒri', 'уучлаарай', 'Interjection', [['Sorry, I am late.', 'Уучлаарай, би хоцорлоо.']], { syn: ['excuse me'], emoji: '😔' }),
      w('welcome', 'ˈwelkəm', 'тавтай морил', 'Interjection', [['Welcome to Mongolia!', 'Монголд тавтай морил!']], { rel: ['hello'], emoji: '🎉' }),
    ],
  },
  {
    id: 'introductions', num: 2, name: 'Танилцах', emoji: '🧑‍🤝‍🧑', color: '#3B82F6',
    desc: 'Өөрийгөө танилцуулах, нэр, нас, гарал үүсэлтэй холбоотой үгс.',
    words: [
      w('name', 'neɪm', 'нэр', 'Noun', [['My name is Bat.', 'Миний нэр Бат.']], { emoji: '📛' }),
      w('age', 'eɪdʒ', 'нас', 'Noun', [['What is your age?', 'Та хэдэн настай вэ?']], { emoji: '🎂' }),
      w('country', 'ˈkʌntri', 'улс', 'Noun', [['Which country are you from?', 'Та аль улсаас ирсэн бэ?']], { rel: ['city'], emoji: '🌍' }),
      w('friend', 'frend', 'найз', 'Noun', [['He is my friend.', 'Тэр миний найз.']], { ant: ['enemy'], emoji: '🤝' }),
      w('meet', 'miːt', 'уулзах', 'Verb', [['Nice to meet you.', 'Танилцсандаа баяртай байна.']], { emoji: '👋' }),
    ],
  },
  {
    id: 'family', num: 3, name: 'Гэр бүл', emoji: '👨‍👩‍👧', color: '#10B981',
    desc: 'Гэр бүлийн гишүүд, садан төрлийн үгс.',
    words: [
      w('mother', 'ˈmʌðər', 'ээж', 'Noun', [['My mother is a teacher.', 'Миний ээж багш.']], { syn: ['mom'], ant: ['father'], emoji: '👩' }),
      w('father', 'ˈfɑːðər', 'аав', 'Noun', [['His father works hard.', 'Түүний аав шаргуу ажилладаг.']], { syn: ['dad'], ant: ['mother'], emoji: '👨' }),
      w('sister', 'ˈsɪstər', 'эгч/дүү', 'Noun', [['I have one sister.', 'Надад нэг эгчтэй.']], { ant: ['brother'], emoji: '👧' }),
      w('brother', 'ˈbrʌðər', 'ах/дүү', 'Noun', [['My brother is tall.', 'Миний ах өндөр.']], { ant: ['sister'], emoji: '👦' }),
      w('child', 'tʃaɪld', 'хүүхэд', 'Noun', [['The child is sleeping.', 'Хүүхэд унтаж байна.']], { rel: ['baby'], emoji: '🧒' }),
    ],
  },
  {
    id: 'home', num: 4, name: 'Гэр', emoji: '🏠', color: '#FB923C',
    desc: 'Гэр орон, тавилга, өрөөнүүдтэй холбоотой үгс.',
    words: [
      w('house', 'haʊs', 'байшин', 'Noun', [['This is a big house.', 'Энэ том байшин.']], { syn: ['home'], emoji: '🏠' }),
      w('room', 'ruːm', 'өрөө', 'Noun', [['My room is clean.', 'Миний өрөө цэвэрхэн.']], { emoji: '🚪' }),
      w('door', 'dɔːr', 'хаалга', 'Noun', [['Open the door.', 'Хаалгаа онгойлго.']], { ant: ['window'], emoji: '🚪' }),
      w('table', 'ˈteɪbl', 'ширээ', 'Noun', [['The book is on the table.', 'Ном ширээн дээр байна.']], { emoji: '🪑' }),
      w('bed', 'bed', 'ор', 'Noun', [['I sleep in my bed.', 'Би ороороо унтдаг.']], { emoji: '🛏️' }),
    ],
  },
  {
    id: 'food', num: 5, name: 'Хоол', emoji: '🍜', color: '#FACC15',
    desc: 'Хоол хүнс, ундаа, ресторанд хэрэгтэй үгс.',
    words: [
      w('food', 'fuːd', 'хоол', 'Noun', [['The food is delicious.', 'Хоол амттай байна.']], { rel: ['eat', 'drink'], emoji: '🍲' }),
      w('water', 'ˈwɔːtər', 'ус', 'Noun', [['I drink water every day.', 'Би өдөр бүр ус уудаг.']], { rel: ['drink'], emoji: '💧' }),
      w('eat', 'iːt', 'идэх', 'Verb', [['Let us eat together.', 'Хамт хооллоё.']], { ant: ['drink'], emoji: '🍽️' }),
      w('rice', 'raɪs', 'будаа', 'Noun', [['I want fried rice.', 'Би шарсан будаа авмаар байна.']], { emoji: '🍚' }),
      w('tea', 'tiː', 'цай', 'Noun', [['She likes green tea.', 'Тэр ногоон цайнд дуртай.']], { rel: ['coffee'], emoji: '🍵' }),
      w('coffee', 'ˈkɒfi', 'кофе', 'Noun', [['One coffee, please.', 'Нэг кофе авъя.']], { rel: ['tea'], emoji: '☕' }),
    ],
  },
  {
    id: 'shopping', num: 6, name: 'Худалдаа', emoji: '🛒', color: '#EC4899',
    desc: 'Дэлгүүр хэсэх, үнэ асуух, төлбөр хийх үед хэрэгтэй үгс.',
    words: [
      w('price', 'praɪs', 'үнэ', 'Noun',
        [['What is the price of this?', 'Энэ ямар үнэтэй вэ?'], ['The price is too high.', 'Үнэ нь хэт өндөр байна.'], ['The prices have gone up.', 'Үнэ өссөн.'], ['Can you give me a better price?', 'Та надад арай хямд өгч болох уу?']],
        { syn: ['cost', 'value', 'charge', 'fee'], ant: ['discount', 'cheapness'], rel: ['expensive', 'cheap', 'cost', 'pay', 'buy'], mn: 'PRICE = Pay + Amount → Үнэ = Төлбөрийн хэмжээ', emoji: '🏷️' }),
      w('expensive', 'ɪkˈspensɪv', 'үнэтэй', 'Adjective',
        [['This bag is expensive.', 'Энэ цүнх үнэтэй.'], ['Cars are expensive here.', 'Энд машин үнэтэй.']],
        { syn: ['costly', 'pricey'], ant: ['cheap'], rel: ['price', 'cost'], emoji: '💵' }),
      w('cheap', 'tʃiːp', 'хямд', 'Adjective',
        [['This shirt is cheap.', 'Энэ цамц хямд.'], ['I found a cheap hotel.', 'Би хямд зочид буудал оллоо.']],
        { syn: ['inexpensive', 'affordable'], ant: ['expensive'], rel: ['price', 'discount'], emoji: '👛' }),
      w('buy', 'baɪ', 'худалдан авах', 'Verb',
        [['I want to buy this.', 'Би үүнийг авмаар байна.'], ['Where can I buy bread?', 'Би хаанаас талх авах вэ?']],
        { syn: ['purchase'], ant: ['sell'], rel: ['sell', 'pay', 'shop'], emoji: '🛍️' }),
      w('sell', 'sel', 'зарах', 'Verb',
        [['They sell electronics.', 'Тэд цахилгаан бараа зардаг.']],
        { ant: ['buy'], rel: ['buy', 'price'], emoji: '🎁' }),
      w('size', 'saɪz', 'хэмжээ', 'Noun',
        [['What size are you?', 'Та ямар хэмжээтэй вэ?']],
        { rel: ['big', 'small'], emoji: '📏' }),
      w('color', 'ˈkʌlər', 'өнгө', 'Noun',
        [['I like this color.', 'Би энэ өнгөнд дуртай.']],
        { rel: ['red', 'blue'], emoji: '🎨' }),
      w('receipt', 'rɪˈsiːt', 'баримт', 'Noun',
        [['Can I have the receipt?', 'Та надад баримт өгөх үү?']],
        { rel: ['pay', 'money'], emoji: '🧾' }),
      w('return', 'rɪˈtɜːrn', 'буцаах', 'Verb',
        [['I want to return this.', 'Би үүнийг буцаамаар байна.']],
        { rel: ['refund'], emoji: '↩️' }),
      w('discount', 'ˈdɪskaʊnt', 'хямдрал', 'Noun',
        [['There is a 20% discount.', '20% хямдралтай байна.']],
        { syn: ['sale'], ant: ['price'], rel: ['cheap', 'price'], emoji: '🏷️' }),
    ],
  },
  {
    id: 'payment', num: 7, name: 'Төлбөр, мөнгө', emoji: '💳', color: '#14B8A6',
    desc: 'Мөнгө, төлбөр, банктай холбоотой үгс.',
    words: [
      w('money', 'ˈmʌni', 'мөнгө', 'Noun', [['I have no money.', 'Надад мөнгө байхгүй.']], { rel: ['cash', 'pay'], emoji: '💰' }),
      w('pay', 'peɪ', 'төлөх', 'Verb', [['How can I pay?', 'Би яаж төлөх вэ?']], { rel: ['money', 'card'], emoji: '💳' }),
      w('cash', 'kæʃ', 'бэлэн мөнгө', 'Noun', [['Do you accept cash?', 'Та бэлэн мөнгө авах уу?']], { ant: ['card'], emoji: '💵' }),
      w('card', 'kɑːrd', 'карт', 'Noun', [['I will pay by card.', 'Би картаар төлнө.']], { rel: ['pay', 'bank'], emoji: '💳' }),
      w('bank', 'bæŋk', 'банк', 'Noun', [['The bank is open.', 'Банк нээлттэй.']], { rel: ['money'], emoji: '🏦' }),
    ],
  },
  {
    id: 'transport', num: 8, name: 'Нийтийн тээвэр', emoji: '🚌', color: '#0EA5E9',
    desc: 'Унаа, тээвэр, замтай холбоотой үгс.',
    words: [
      w('bus', 'bʌs', 'автобус', 'Noun', [['The bus is late.', 'Автобус хоцорч байна.']], { rel: ['taxi', 'train'], emoji: '🚌' }),
      w('train', 'treɪn', 'галт тэрэг', 'Noun', [['The train is fast.', 'Галт тэрэг хурдан.']], { rel: ['bus'], emoji: '🚆' }),
      w('ticket', 'ˈtɪkɪt', 'тасалбар', 'Noun', [['I need two tickets.', 'Надад хоёр тасалбар хэрэгтэй.']], { rel: ['bus'], emoji: '🎫' }),
      w('station', 'ˈsteɪʃn', 'буудал', 'Noun', [['Where is the station?', 'Буудал хаана байна?']], { emoji: '🚉' }),
    ],
  },
  {
    id: 'taxi', num: 9, name: 'Такси', emoji: '🚕', color: '#F59E0B',
    desc: 'Такси дуудах, чиглэл хэлэхэд хэрэгтэй үгс.',
    words: [
      w('taxi', 'ˈtæksi', 'такси', 'Noun', [['Call a taxi, please.', 'Такси дуудаач.']], { rel: ['driver'], emoji: '🚕' }),
      w('driver', 'ˈdraɪvər', 'жолооч', 'Noun', [['The driver is kind.', 'Жолооч эелдэг.']], { emoji: '🧑‍✈️' }),
      w('stop', 'stɒp', 'зогсох', 'Verb', [['Please stop here.', 'Энд зогсооно уу.']], { ant: ['go'], emoji: '🛑' }),
      w('address', 'əˈdres', 'хаяг', 'Noun', [['What is the address?', 'Хаяг нь хаана вэ?']], { emoji: '📍' }),
    ],
  },
  {
    id: 'directions', num: 10, name: 'Зам асуух', emoji: '🗺️', color: '#FBBF24',
    desc: 'Чиглэл, байршил асуухад хэрэгтэй үгс.',
    words: [
      w('left', 'left', 'зүүн', 'Noun', [['Turn left here.', 'Энд зүүн тийш эргэ.']], { ant: ['right'], emoji: '⬅️' }),
      w('right', 'raɪt', 'баруун', 'Noun', [['Go to the right.', 'Баруун тийш яв.']], { ant: ['left'], emoji: '➡️' }),
      w('straight', 'streɪt', 'чигээрээ', 'Adverb', [['Go straight ahead.', 'Чигээрээ яв.']], { emoji: '⬆️' }),
      w('near', 'nɪər', 'ойрхон', 'Adjective', [['Is it near?', 'Ойрхон уу?']], { ant: ['far'], emoji: '📍' }),
    ],
  },
  {
    id: 'hospital', num: 11, name: 'Эмнэлэг', emoji: '🏥', color: '#EF4444',
    desc: 'Эрүүл мэнд, эмнэлэгт хэрэгтэй үгс.',
    words: [
      w('doctor', 'ˈdɒktər', 'эмч', 'Noun', [['I need a doctor.', 'Надад эмч хэрэгтэй.']], { rel: ['nurse', 'medicine'], emoji: '🧑‍⚕️' }),
      w('pain', 'peɪn', 'өвдөлт', 'Noun', [['I have a pain here.', 'Энд өвдөж байна.']], { emoji: '🤕' }),
      w('medicine', 'ˈmedɪsɪn', 'эм', 'Noun', [['Take this medicine.', 'Энэ эмийг уу.']], { rel: ['doctor'], emoji: '💊' }),
      w('sick', 'sɪk', 'өвчтэй', 'Adjective', [['I feel sick.', 'Би өвчтэй байна.']], { ant: ['healthy'], emoji: '🤒' }),
    ],
  },
  {
    id: 'pharmacy', num: 12, name: 'Эмийн сан', emoji: '💊', color: '#06B6D4',
    desc: 'Эмийн сан, эм тангаар авахад хэрэгтэй үгс.',
    words: [
      w('pill', 'pɪl', 'шахмал', 'Noun', [['Take one pill a day.', 'Өдөрт нэг шахмал уу.']], { rel: ['medicine'], emoji: '💊' }),
      w('fever', 'ˈfiːvər', 'халуурах', 'Noun', [['I have a fever.', 'Би халуурч байна.']], { emoji: '🌡️' }),
      w('cough', 'kɒf', 'ханиалга', 'Noun', [['I have a cough.', 'Би ханиаж байна.']], { emoji: '😷' }),
      w('headache', 'ˈhedeɪk', 'толгой өвдөх', 'Noun', [['I have a headache.', 'Толгой өвдөж байна.']], { emoji: '🤕' }),
    ],
  },
  {
    id: 'work', num: 13, name: 'Ажил', emoji: '💼', color: '#8B5CF6',
    desc: 'Ажил мэргэжил, ажлын байртай холбоотой үгс.',
    words: [
      w('work', 'wɜːrk', 'ажил', 'Noun', [['I go to work at 9.', 'Би 9 цагт ажилдаа очдог.']], { syn: ['job'], emoji: '💼' }),
      w('job', 'dʒɒb', 'ажлын байр', 'Noun', [['She has a new job.', 'Тэр шинэ ажилтай боллоо.']], { syn: ['work'], emoji: '🧑‍💼' }),
      w('office', 'ˈɒfɪs', 'оффис', 'Noun', [['The office is downtown.', 'Оффис хотын төвд.']], { emoji: '🏢' }),
      w('meeting', 'ˈmiːtɪŋ', 'хурал', 'Noun', [['We have a meeting now.', 'Бид одоо хуралтай.']], { emoji: '📅' }),
    ],
  },
  {
    id: 'school', num: 14, name: 'Сургууль', emoji: '🎓', color: '#7C3AED',
    desc: 'Сургууль, хичээл, суралцахтай холбоотой үгс.',
    words: [
      w('school', 'skuːl', 'сургууль', 'Noun', [['I study at school.', 'Би сургуульд сурдаг.']], { emoji: '🏫' }),
      w('teacher', 'ˈtiːtʃər', 'багш', 'Noun', [['Our teacher is kind.', 'Манай багш эелдэг.']], { ant: ['student'], emoji: '🧑‍🏫' }),
      w('student', 'ˈstuːdnt', 'оюутан', 'Noun', [['He is a good student.', 'Тэр сайн оюутан.']], { ant: ['teacher'], emoji: '🧑‍🎓' }),
      w('book', 'bʊk', 'ном', 'Noun', [['Read this book.', 'Энэ номыг уншаарай.']], { emoji: '📖' }),
      w('learn', 'lɜːrn', 'сурах', 'Verb', [['I want to learn English.', 'Би англи хэл сурмаар байна.']], { rel: ['study'], emoji: '🧠' }),
    ],
  },
  {
    id: 'technology', num: 15, name: 'Технологи', emoji: '📱', color: '#FBBF24',
    desc: 'Утас, компьютер, интернеттэй холбоотой үгс.',
    words: [
      w('phone', 'foʊn', 'утас', 'Noun', [['My phone is new.', 'Миний утас шинэ.']], { emoji: '📱' }),
      w('computer', 'kəmˈpjuːtər', 'компьютер', 'Noun', [['I work on a computer.', 'Би компьютер дээр ажилладаг.']], { emoji: '💻' }),
      w('internet', 'ˈɪntərnet', 'интернэт', 'Noun', [['The internet is slow.', 'Интернэт удаан байна.']], { emoji: '🌐' }),
      w('email', 'ˈiːmeɪl', 'имэйл', 'Noun', [['Send me an email.', 'Надад имэйл илгээ.']], { emoji: '📧' }),
    ],
  },
  {
    id: 'clothes', num: 16, name: 'Хувцас', emoji: '👕', color: '#EC4899',
    desc: 'Хувцас, өмсгөлтэй холбоотой үгс.',
    words: [
      w('shirt', 'ʃɜːrt', 'цамц', 'Noun', [['This shirt is blue.', 'Энэ цамц цэнхэр.']], { emoji: '👕' }),
      w('shoes', 'ʃuːz', 'гутал', 'Noun', [['My shoes are new.', 'Миний гутал шинэ.']], { emoji: '👟' }),
      w('jacket', 'ˈdʒækɪt', 'хүрэм', 'Noun', [['Wear a warm jacket.', 'Дулаан хүрэм өмс.']], { emoji: '🧥' }),
      w('hat', 'hæt', 'малгай', 'Noun', [['He wears a hat.', 'Тэр малгай өмссөн.']], { emoji: '🧢' }),
    ],
  },
  {
    id: 'weather', num: 17, name: 'Цаг агаар', emoji: '🌤️', color: '#38BDF8',
    desc: 'Цаг агаар, улирал, температуртай холбоотой үгс.',
    words: [
      w('weather', 'ˈweðər', 'цаг агаар', 'Noun', [['The weather is nice.', 'Цаг агаар сайхан байна.']], { emoji: '🌤️' }),
      w('rain', 'reɪn', 'бороо', 'Noun', [['It will rain today.', 'Өнөөдөр бороо орно.']], { rel: ['snow'], emoji: '🌧️' }),
      w('snow', 'snoʊ', 'цас', 'Noun', [['Snow is falling.', 'Цас орж байна.']], { rel: ['rain'], emoji: '❄️' }),
      w('hot', 'hɒt', 'халуун', 'Adjective', [['It is hot today.', 'Өнөөдөр халуун байна.']], { ant: ['cold'], emoji: '🔥' }),
      w('cold', 'koʊld', 'хүйтэн', 'Adjective', [['It is very cold.', 'Маш хүйтэн байна.']], { ant: ['hot'], emoji: '🥶' }),
    ],
  },
  {
    id: 'freetime', num: 18, name: 'Чөлөөт цаг', emoji: '🏀', color: '#22C55E',
    desc: 'Хобби, спорт, амралттай холбоотой үгс.',
    words: [
      w('music', 'ˈmjuːzɪk', 'хөгжим', 'Noun', [['I love music.', 'Би хөгжимд дуртай.']], { emoji: '🎵' }),
      w('game', 'ɡeɪm', 'тоглоом', 'Noun', [['Let us play a game.', 'Тоглоом тоглоё.']], { emoji: '🎮' }),
      w('movie', 'ˈmuːvi', 'кино', 'Noun', [['We watched a movie.', 'Бид кино үзлээ.']], { emoji: '🎬' }),
      w('sport', 'spɔːrt', 'спорт', 'Noun', [['Basketball is my sport.', 'Сагсан бөмбөг миний спорт.']], { emoji: '🏀' }),
    ],
  },
  {
    id: 'travel', num: 19, name: 'Аялал', emoji: '✈️', color: '#60A5FA',
    desc: 'Аялал, онгоц, зочид буудалтай холбоотой үгс.',
    words: [
      w('airport', 'ˈeəpɔːrt', 'нисэх онгоцны буудал', 'Noun', [['The airport is far.', 'Буудал хол байна.']], { rel: ['plane'], emoji: '🛫' }),
      w('hotel', 'hoʊˈtel', 'зочид буудал', 'Noun', [['Our hotel is nice.', 'Манай буудал сайхан.']], { emoji: '🏨' }),
      w('passport', 'ˈpɑːspɔːrt', 'пасспорт', 'Noun', [['Show your passport.', 'Пасспортоо үзүүл.']], { emoji: '🛂' }),
      w('trip', 'trɪp', 'аялал', 'Noun', [['Have a good trip!', 'Сайхан аялаарай!']], { emoji: '🧳' }),
    ],
  },
  {
    id: 'emergency', num: 20, name: 'Яаралтай нөхцөл', emoji: '🚨', color: '#EF4444',
    desc: 'Яаралтай, аюултай нөхцөлд хэрэгтэй үгс.',
    words: [
      w('help', 'help', 'тусламж', 'Noun', [['Help me, please!', 'Туслаач!']], { emoji: '🆘' }),
      w('police', 'pəˈliːs', 'цагдаа', 'Noun', [['Call the police!', 'Цагдаа дуудаарай!']], { emoji: '👮' }),
      w('fire', 'ˈfaɪər', 'гал', 'Noun', [['There is a fire!', 'Гал гарлаа!']], { emoji: '🔥' }),
      w('danger', 'ˈdeɪndʒər', 'аюул', 'Noun', [['It is in danger.', 'Энэ аюултай байна.']], { ant: ['safe'], emoji: '⚠️' }),
    ],
  },
];

export default CATEGORIES;

export function findCategory(id) { return CATEGORIES.find(c => c.id === id); }
export function findWord(catId, wid) {
  const c = findCategory(catId);
  return c ? c.words.find(x => x.id === wid) : null;
}
