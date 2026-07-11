// IELTS бэлтгэлийн хичээлийн агуулга

export const IELTS_OVERVIEW = {
  desc: 'IELTS (International English Language Testing System) нь англи хэлний түвшинг 4 ур чадвараар (Сонсох, Унших, Бичих, Ярих) хэмждэг олон улсын шалгалт. Оноо 1–9 band-аар үнэлэгдэнэ.',
  bands: [
    { band: '9', label: 'Expert', desc: 'Бүрэн төгс эзэмшсэн' },
    { band: '8', label: 'Very Good', desc: 'Бараг төгс, ховор алдаатай' },
    { band: '7', label: 'Good', desc: 'Сайн, зарим алдаатай' },
    { band: '6', label: 'Competent', desc: 'Хангалттай, тодорхой нөхцөлд алдаатай' },
    { band: '5', label: 'Modest', desc: 'Дунд зэрэг, олон алдаатай' },
    { band: '4', label: 'Limited', desc: 'Хязгаарлагдмал' },
  ],
};

// ── Listening lessons ─────────────────────────────────────────
// type: 'gap' (текст бөглөх) | 'mc' (олон сонголт) | 'match' (тааруулах)
const LISTENING_LESSONS = [
  {
    id: 'l-part1', title: 'Part 1 · Өдөр тутмын харилцан яриа', tag: 'Form completion',
    intro: 'Хоёр хүний өдөр тутмын яриа (жишээ нь захиалга, бүртгэл хийх). Дасгал: дуудлагаар сонсоод хоосон зайг бөглө.',
    script: `Woman: Good morning, Riverside Leisure Centre, how can I help you?
Man: Hi, I'd like to sign up for a gym membership, please.
Woman: Sure. Can I take your full name first?
Man: Yes, it's Daniel Whitfield. That's W-H-I-T-F-I-E-L-D.
Woman: Thanks, Daniel. And what's the best contact number for you?
Man: You can reach me on 0741 226 305.
Woman: Great. We have three membership types: Standard, which is thirty-two pounds a month, Premium at forty-five pounds, and a Student rate of twenty-five pounds if you have valid ID.
Man: I'll go with the Premium one, please. Does that include the swimming pool?
Woman: Yes, Premium includes the pool, all fitness classes, and free parking. Standard doesn't include classes.
Man: Perfect. When can I start?
Woman: We can set your start date for the first of next month. Would you like a locker as well? That's an extra five pounds a month.
Man: Yes, please, I'll take a locker too.
Woman: No problem. One last thing — could I get your email address for the confirmation?
Man: It's d dot whitfield at mailbox dot com.
Woman: Got it. You're all set, Daniel. Welcome to Riverside!`,
    questions: [
      { type: 'gap', q: 'Customer\'s surname: ____________', answer: 'Whitfield' },
      { type: 'gap', q: 'Contact number: ____________', answer: '0741 226 305' },
      { type: 'mc', q: 'Which membership does the man choose?', options: ['Standard', 'Premium', 'Student'], answer: 1 },
      { type: 'gap', q: 'Extra monthly cost for a locker: £____________', answer: '5' },
      { type: 'mc', q: 'What does the Standard membership NOT include?', options: ['The swimming pool', 'Fitness classes', 'Parking'], answer: 1 },
    ],
  },
  {
    id: 'l-part2', title: 'Part 2 · Мэдээллийн монолог', tag: 'Multiple choice + Matching',
    intro: 'Нэг хүний ярих мэдээлэл (жуулчны газрын тайлбар г.м.). Museum tour-ийн танилцуулга сонсоод асуултад хариул.',
    script: `Welcome to Bramwell City Museum. Before we begin the tour, let me give you a quick overview of the building. We're currently standing in the Main Hall, which houses our permanent collection of Roman artefacts found right here in Bramwell. This gallery is open every day of the week.

If you head up the stairs to the first floor, you'll find the Natural History Gallery, home to our famous dinosaur skeleton — that gallery is closed on Mondays for cleaning, so plan around that if you can. Also on the first floor is the Art Gallery, featuring local painters from the last two centuries; it's open every day except Tuesday.

On the second floor, we have the Temporary Exhibition space, which currently features a photography exhibition about the city's industrial history — that runs until the end of next month. There's also a small café on the second floor, open from nine in the morning until four in the afternoon.

Please note that photography without flash is allowed everywhere except the Temporary Exhibition space, where no photography is permitted at all. If you need any assistance during your visit, staff wearing blue jackets are always happy to help.`,
    questions: [
      { type: 'mc', q: 'Which gallery is closed on Mondays?', options: ['Main Hall', 'Natural History Gallery', 'Art Gallery'], answer: 1 },
      { type: 'mc', q: 'The Art Gallery is closed on:', options: ['Monday', 'Tuesday', 'Wednesday'], answer: 1 },
      { type: 'mc', q: 'What is currently showing in the Temporary Exhibition?', options: ['Roman artefacts', 'A dinosaur skeleton', 'A photography exhibition'], answer: 2 },
      { type: 'gap', q: 'The café closes at ____________ in the afternoon.', answer: '4' },
      { type: 'mc', q: 'Photography is completely banned in:', options: ['The Main Hall', 'The Art Gallery', 'The Temporary Exhibition space'], answer: 2 },
    ],
  },
  {
    id: 'l-part34', title: 'Part 3–4 · Эрдэм шинжилгээний яриа', tag: 'Sentence completion',
    intro: 'Их сургуулийн лекц/академик яриа сонсоод өгүүлбэр гүйцээх дадлага. Сэдэв: сэргээгдэх эрчим хүч.',
    script: `Today I want to talk about the growth of renewable energy over the past decade. Solar power has seen the fastest growth of all renewable sources, largely because the cost of solar panels has fallen by more than eighty percent since two thousand ten. Wind energy has also grown significantly, particularly offshore wind farms, which produce more consistent power than onshore turbines because wind speeds at sea are higher and steadier.

One major challenge for renewable energy is storage. Because solar and wind power depend on weather conditions, energy companies need effective ways to store electricity for use when the sun isn't shining or the wind isn't blowing. Battery technology, especially lithium-ion batteries, has improved rapidly, but researchers are also exploring alternatives such as pumped hydro storage, which uses excess electricity to pump water uphill, then releases it through turbines when power is needed.

Government policy plays a crucial role too. Countries that offer subsidies or tax incentives for renewable energy installations tend to see much faster adoption rates. Denmark, for example, now generates over fifty percent of its electricity from wind power, largely due to decades of consistent government support.`,
    questions: [
      { type: 'gap', q: 'The cost of solar panels has fallen by more than ____________ percent since 2010.', answer: '80' },
      { type: 'gap', q: 'Offshore wind farms produce more consistent power because wind speeds at sea are higher and ____________.', answer: 'steadier' },
      { type: 'mc', q: 'What is described as a major challenge for renewable energy?', options: ['Cost of panels', 'Storage', 'Government policy'], answer: 1 },
      { type: 'gap', q: 'Pumped hydro storage releases water through ____________ when power is needed.', answer: 'turbines' },
      { type: 'gap', q: 'Denmark generates over ____________ percent of its electricity from wind power.', answer: '50' },
    ],
  },
];

// ── Reading lessons ────────────────────────────────────────────
const READING_LESSONS = [
  {
    id: 'r-tfng', title: 'True / False / Not Given дадлага', tag: 'T/F/NG',
    passageTitle: 'The Story of Coffee',
    passage: `Coffee is believed to have originated in the highlands of Ethiopia, where legend says a goatherd named Kaldi noticed his goats became unusually energetic after eating berries from a certain shrub. Curious, Kaldi tried the berries himself and experienced a similar burst of energy. He reportedly shared his discovery with a local monastery, where monks began using the berries to stay alert during long hours of prayer.

From Ethiopia, coffee cultivation spread to the Arabian Peninsula by the fifteenth century, where it was first grown on plantations and traded commercially. Yemen, in particular, became a major centre for coffee cultivation, and the port city of Mocha gave its name to a coffee variety still known today. Coffee houses began appearing across the Arab world, becoming important social spaces where people gathered to talk, listen to music, and play chess.

By the seventeenth century, coffee had reached Europe, where it was initially met with suspicion by some religious leaders who considered it a dangerous foreign substance. However, once Pope Clement VIII reportedly tasted and approved of the drink, its popularity spread rapidly across the continent. Coffee houses opened in cities such as Venice, London, and Paris, and quickly became centres of intellectual and political discussion — London's coffee houses were even nicknamed "penny universities" because, for the price of a cup of coffee, customers could sit and engage in stimulating conversation with other patrons.

Today, coffee is one of the most widely consumed beverages in the world, and its cultivation supports the livelihoods of millions of farmers, primarily in tropical regions of Latin America, Africa, and Asia. Brazil alone produces roughly a third of the world's coffee supply, a position it has held for over a hundred and fifty years.`,
    questions: [
      { q: 'Kaldi discovered coffee by eating berries himself before noticing an effect on his goats.', answer: 'F' },
      { q: 'Coffee cultivation began on plantations in Ethiopia.', answer: 'F' },
      { q: 'The coffee variety "Mocha" is named after a port city in Yemen.', answer: 'T' },
      { q: 'All religious leaders in Europe welcomed coffee immediately.', answer: 'F' },
      { q: 'London coffee houses charged a fixed annual membership fee.', answer: 'NG' },
      { q: 'Brazil has been the world\'s largest coffee producer for more than a century.', answer: 'T' },
    ],
  },
  {
    id: 'r-headings', title: 'Гарчиг тааруулах (Matching Headings)', tag: 'Matching headings',
    passageTitle: 'The Rise of Urban Gardening',
    passageParagraphs: [
      { label: 'A', text: 'In cities around the world, a growing number of residents are turning unused spaces — rooftops, balconies, and vacant lots — into small gardens. This movement, often called urban gardening, has expanded rapidly over the last two decades as city dwellers seek closer connections to food production and green space.' },
      { label: 'B', text: 'One of the main motivations behind urban gardening is food security. As cities grow and agricultural land near urban centres shrinks, some residents worry about their reliance on food transported from distant regions. Growing even a small amount of food locally can reduce this dependence and provide fresher produce.' },
      { label: 'C', text: 'Beyond food, urban gardens offer measurable environmental benefits. Plants absorb carbon dioxide and release oxygen, while green roofs can reduce a building\'s energy consumption by providing natural insulation. Gardens also help manage stormwater runoff, reducing pressure on city drainage systems during heavy rain.' },
      { label: 'D', text: 'Community gardens, in particular, have become valued social spaces. Neighbours who might otherwise never interact are brought together by shared gardening responsibilities, and studies have shown that participation in community gardens can reduce feelings of isolation, particularly among older residents living alone.' },
      { label: 'E', text: 'Despite these benefits, urban gardening faces real obstacles. Soil in former industrial areas is sometimes contaminated with heavy metals, making it unsafe for growing edible plants without expensive remediation. Access to land is another persistent challenge, as suitable plots are often claimed for housing development before gardening groups can secure them.' },
    ],
    headingOptions: [
      'The environmental advantages of green spaces in cities',
      'How gardening builds connections between neighbours',
      'Concerns about where food comes from',
      'Barriers that limit the growth of city gardens',
      'A global trend transforming empty urban spaces',
    ],
    questions: [
      { q: 'Paragraph A', answer: 4 },
      { q: 'Paragraph B', answer: 2 },
      { q: 'Paragraph C', answer: 0 },
      { q: 'Paragraph D', answer: 1 },
      { q: 'Paragraph E', answer: 3 },
    ],
  },
  {
    id: 'r-mc', title: 'Олон сонголт & Өгүүлбэр гүйцээх', tag: 'Multiple choice',
    passageTitle: 'The Science of Sleep',
    passage: `For much of the twentieth century, sleep was viewed by scientists as a largely passive state — a period when the brain simply switched off. Modern research has overturned this view entirely, revealing sleep to be an active and highly organised process essential to memory, learning, and physical health.

Sleep occurs in cycles, each lasting roughly ninety minutes and consisting of several distinct stages. During the deepest stages of non-REM sleep, the brain produces slow, synchronised waves associated with physical restoration; the body repairs tissue, strengthens the immune system, and releases growth hormone during this period. Later in each cycle, the brain enters REM (rapid eye movement) sleep, during which most vivid dreaming occurs and the brain becomes almost as active as when awake, despite the body remaining largely paralysed.

Researchers have found that sleep plays a critical role in consolidating memories. During sleep, particularly during deep non-REM stages, the brain appears to replay and strengthen neural connections formed during the day, effectively transferring information from short-term to long-term storage. Students who sleep well after studying consistently outperform sleep-deprived peers on memory tests, even when both groups spent equal time studying.

Chronic sleep deprivation, meanwhile, has been linked to a wide range of negative health outcomes, including impaired immune function, weight gain, and an increased risk of cardiovascular disease. Some researchers argue that modern society's declining average sleep duration — driven by factors such as artificial lighting, screen use before bed, and demanding work schedules — represents a significant, if underappreciated, public health concern.`,
    questions: [
      { type: 'mc', q: 'According to the passage, how was sleep traditionally viewed by scientists?', options: ['As an active, organised process', 'As a passive state where the brain switches off', 'As a period of memory consolidation'], answer: 1 },
      { type: 'mc', q: 'During which stage does most vivid dreaming occur?', options: ['Deep non-REM sleep', 'REM sleep', 'The transition between cycles'], answer: 1 },
      { type: 'mc', q: 'What happens to the body during REM sleep?', options: ['It repairs tissue', 'It remains largely paralysed', 'It releases growth hormone'], answer: 1 },
      { type: 'gap', q: 'Each sleep cycle lasts roughly ____________ minutes.', answer: '90' },
      { type: 'gap', q: 'During sleep, the brain transfers information from short-term to ____________ storage.', answer: 'long-term' },
      { type: 'mc', q: 'What does the passage suggest about modern society?', options: ['People sleep more than in the past', 'Average sleep duration is declining', 'Screen use improves sleep quality'], answer: 1 },
    ],
  },
];

// ── Writing model answers ───────────────────────────────────────
const WRITING_TASK2 = [
  {
    id: 'w2-opinion', title: 'Opinion Essay (Agree / Disagree)',
    prompt: 'Some people believe that the government should invest more money in public transport rather than building new roads. To what extent do you agree or disagree?',
    structure: [
      'Оршил: Сэдвийг товч дурьдаад, өөрийн байр суурийг (agree/disagree) тодорхой мэдэгд.',
      'Бие 1: Эхний гол шалтгаан + жишээ/тайлбар',
      'Бие 2: Хоёр дахь гол шалтгаан (эсрэг талыг товч хүлээн зөвшөөрч болно) + жишээ',
      'Дүгнэлт: Байр сууриа дахин баталгаажуулж, товч хураангуйла',
    ],
    model: `In many major cities, traffic congestion has become a serious problem, leading some to argue that governments should prioritise public transport funding over road construction. I strongly agree with this view, primarily because of its environmental and economic advantages.

To begin with, investing in public transport significantly reduces air pollution and carbon emissions. Buses and trains can carry far more passengers per vehicle than private cars, meaning that a well-funded transport network directly lowers the number of individual vehicles on the road. For example, cities like Copenhagen have seen measurable improvements in air quality after expanding their metro and cycling infrastructure, demonstrating that public transport investment produces tangible environmental benefits.

Furthermore, public transport offers a more cost-effective long-term solution than road expansion. Building new roads is extremely expensive and, counterintuitively, often fails to solve congestion, since wider roads tend to attract more traffic over time — a phenomenon known as induced demand. By contrast, money spent on buses, trams, and railways tends to deliver more passengers moved per dollar spent, while also benefiting lower-income citizens who may not own private vehicles.

Admittedly, some road investment remains necessary, particularly in rural areas with limited access to public transport. However, in densely populated urban areas, the case for prioritising public transport is considerably stronger.

In conclusion, I firmly believe governments should direct more funding toward public transport rather than new roads, given the clear environmental and economic benefits this approach offers.`,
    band: 9, words: 246,
  },
  {
    id: 'w2-discussion', title: 'Discussion Essay (Both Views)',
    prompt: 'Some people think that university students should study whatever they like. Others believe they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both views and give your own opinion.',
    structure: [
      'Оршил: Хоёр талын үзлийг товч танилцуулж, өөрийн байр сууриа зааж өг',
      'Бие 1: Эхний үзэл (сонирхлоороо суралцах) + тайлбар',
      'Бие 2: Хоёр дахь үзэл (ирээдүйд хэрэгтэй мэргэжил) + тайлбар',
      'Дүгнэлт: Аль үзлийг илүү дэмждэгээ тодорхой хэлж дүгнэ',
    ],
    model: `The question of what university students should be permitted to study divides opinion. While some argue that students should be free to pursue any subject that interests them, others believe university education should be limited to fields considered practically useful, such as science and technology. This essay will examine both perspectives before presenting my own view.

Those who favour freedom of choice argue that students perform best, and remain most motivated, when studying subjects they are genuinely passionate about. A student forced into an engineering degree despite having no interest in the subject is unlikely to excel, whereas the same student might thrive studying literature or history. Moreover, many careers today did not exist a decade ago, making it difficult to predict which fields will prove genuinely "useful" in the future.

On the other hand, proponents of restricting subject choice point to pressing societal needs. Many countries currently face shortages of qualified engineers, doctors, and technology specialists, while humanities graduates sometimes struggle to find relevant employment. From this perspective, directing more students toward science and technology could address skills gaps and boost economic growth.

In my view, while practical considerations matter, restricting student choice is ultimately counterproductive. Motivation and genuine interest are strong predictors of academic success and long-term career satisfaction, and a diverse, well-rounded education system benefits society in ways that are not always immediately measurable, such as through innovation in the arts and social sciences.

In conclusion, although there are valid economic arguments for encouraging practical subjects, I believe students should retain the freedom to choose what they study.`,
    band: 9, words: 253,
  },
  {
    id: 'w2-problem', title: 'Problem–Solution Essay',
    prompt: 'Traffic congestion is becoming a growing problem in many major cities. What problems does this cause, and what measures could be taken to solve them?',
    structure: [
      'Оршил: Асуудлыг товч танилцуулна',
      'Бие 1: Асуудлын үр дагавар (problems) — 2-3 тодорхой жишээ',
      'Бие 2: Шийдэл (solutions) — 2-3 практик санал',
      'Дүгнэлт: Товч хураангуйла',
    ],
    model: `Traffic congestion has become an increasingly common feature of urban life, particularly in rapidly growing cities. This essay will outline the main problems caused by heavy traffic before suggesting several practical solutions.

The most immediate consequence of traffic congestion is lost time and productivity. Commuters trapped in daily traffic jams spend hours each week simply sitting in stationary vehicles, time that could otherwise be used productively. Beyond this economic cost, congestion contributes significantly to air pollution, as idling engines release large quantities of carbon dioxide and other harmful emissions, worsening respiratory health in densely populated areas. Additionally, heavy traffic increases stress levels among drivers, which can, in turn, contribute to a higher frequency of road accidents.

Several measures could help address this growing problem. First, expanding and improving public transport networks would give commuters a genuine alternative to private car use, particularly if services are made faster, more frequent, and more affordable than driving. Second, city authorities could introduce congestion charges in busy central areas, as London and Singapore have successfully done, discouraging unnecessary car journeys during peak hours. Finally, encouraging remote working arrangements, where practical, would reduce the total number of daily commuters, easing pressure on road networks during rush hour.

In conclusion, while traffic congestion causes serious economic, environmental, and health-related problems, a combination of improved public transport, congestion pricing, and flexible working arrangements could substantially reduce its impact on modern cities.`,
    band: 9, words: 241,
  },
  {
    id: 'w2-adv-disadv', title: 'Advantage–Disadvantage Essay',
    prompt: 'More and more people are choosing to work from home rather than in a traditional office. What are the advantages and disadvantages of this trend?',
    structure: [
      'Оршил: Сэдвийг товч танилцуулна',
      'Бие 1: Давуу тал (advantages) — 2-3 жишээтэй',
      'Бие 2: Сул тал (disadvantages) — 2-3 жишээтэй',
      'Дүгнэлт: Ерөнхий үнэлгээ (аль тал давамгайлж байгааг товч)',
    ],
    model: `Remote working has grown substantially in recent years, with an increasing number of employees choosing to work from home instead of commuting to a traditional office. This shift brings both notable advantages and significant drawbacks.

One of the clearest benefits of remote work is the time and money saved by eliminating daily commutes, which allows employees to dedicate more hours to work, family, or personal wellbeing. Remote work also offers greater flexibility, enabling people to structure their day around personal responsibilities, such as childcare, which can improve overall job satisfaction and work-life balance. For employers, remote work can reduce overhead costs associated with maintaining large office spaces.

However, working from home also presents real challenges. Many employees report feelings of isolation, as the lack of face-to-face interaction with colleagues can weaken workplace relationships and reduce opportunities for spontaneous collaboration. Furthermore, the boundary between work and personal life often becomes blurred when working from home, leading some employees to work longer hours than they would in an office, ultimately contributing to burnout. Younger or newer employees may also miss out on valuable mentorship opportunities that typically arise more naturally in a shared office environment.

On balance, while remote working offers genuine benefits in terms of flexibility and reduced commuting, organisations should remain mindful of its potential downsides, particularly regarding employee wellbeing and professional development, and consider hybrid arrangements where appropriate.`,
    band: 9, words: 232,
  },
];

const WRITING_TASK1 = [
  {
    id: 'w1-linegraph', title: 'Academic Task 1 · Line Graph',
    prompt: 'The graph below shows the number of visitors to three museums in a European city between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    structure: [
      'Оршил: Графикийг өөрийн үгээр товч тайлбарла (paraphrase)',
      'Ерөнхий тойм (overview): Хамгийн гол чиг хандлагыг 1-2 өгүүлбэрээр',
      'Бие 1-2: Тодорхой тоо, харьцуулалт баримт бүхий дэлгэрэнгүй тайлбар',
    ],
    model: `The line graph illustrates how visitor numbers changed at three museums in a European city over a twenty-year period, from 2000 to 2020.

Overall, the History Museum consistently attracted the most visitors throughout the period, while the Science Museum experienced the most dramatic growth, eventually overtaking the Art Gallery by the end of the period.

In 2000, the History Museum welcomed approximately 400,000 visitors, considerably more than both the Science Museum and the Art Gallery, which started at roughly 150,000 and 200,000 respectively. Over the following decade, visitor numbers at the History Museum rose steadily, reaching around 550,000 by 2010, before levelling off for the remainder of the period.

The Science Museum, by contrast, showed relatively modest growth until 2010, after which numbers increased sharply, more than doubling from 200,000 to approximately 480,000 by 2020. This rapid rise meant that, by the end of the period, the Science Museum had almost caught up with the History Museum and had clearly overtaken the Art Gallery, whose visitor numbers grew only gradually throughout, reaching just 320,000 by 2020.

In summary, while the History Museum remained the most popular attraction overall, the Science Museum's rapid growth after 2010 was the most striking trend in the data.`,
    band: 9, words: 198,
  },
  {
    id: 'w1-letter', title: 'General Task 1 · Formal Letter (Complaint)',
    prompt: 'You recently bought a piece of furniture online, but it arrived damaged. Write a letter to the company. In your letter: describe the item you bought, explain what is wrong with it, say what you would like the company to do.',
    structure: [
      'Хаяг (шаардлагагүй, IELTS дээр биш)',
      'Мэндчилгээ: Dear Sir/Madam,',
      'Бие 1: Юу захиалсанаа тайлбарла',
      'Бие 2: Ямар асуудал байгааг тодорхой хэл',
      'Бие 3: Юу хүсэж байгаагаа тодорхой шаард (солих/мөнгө буцаах)',
      'Төгсгөл: Yours faithfully, (нэр мэдэхгүй бол)',
    ],
    model: `Dear Sir or Madam,

I am writing to complain about a dining table I ordered from your website on the 3rd of March, which arrived in an unacceptable condition.

The item in question is the "Oakwood" six-seater dining table, order number 48213. When the package arrived, I noticed that the tabletop had a large crack running across one corner, and one of the legs was visibly bent, making the table unstable and unsafe to use.

I was naturally very disappointed, especially considering the table cost a significant amount of money and I had been looking forward to using it for a family gathering this weekend. I have attached photographs of the damage for your reference.

Given the circumstances, I would like to request a full replacement of the table at no additional cost, along with assurance that the new item will be properly inspected before dispatch. Alternatively, if a prompt replacement is not possible, I would appreciate a full refund.

I trust you will handle this matter quickly, and I look forward to your response within the next few days.

Yours faithfully,
A. Batbayar`,
    band: 9, words: 189,
  },
];

// ── Speaking content ────────────────────────────────────────────
const SPEAKING_PART1 = [
  { q: 'Do you work or are you a student?', a: 'I\'m currently a student — I\'m studying business administration at university, and I\'m in my second year.' },
  { q: 'What do you like about your hometown?', a: 'What I like most is probably the pace of life. It\'s a fairly small city, so it never feels overwhelming, and everyone tends to know their neighbours.' },
  { q: 'Do you enjoy cooking?', a: 'Not particularly, to be honest. I can manage the basics, but I find it a bit time-consuming, so I usually stick to simple meals.' },
  { q: 'How do you usually spend your weekends?', a: 'It really depends, but I typically try to catch up with friends, or if the weather\'s nice, I\'ll go for a hike somewhere just outside the city.' },
  { q: 'Is reading important to you?', a: 'Yes, definitely. I try to read every night before bed — it helps me relax, and I feel like it\'s expanded my vocabulary a lot over the years.' },
  { q: 'What kind of weather do you prefer?', a: 'I much prefer cooler weather, actually. I find really hot days quite draining, whereas a crisp autumn day makes me want to be outside.' },
];

const SPEAKING_PART2 = [
  {
    id: 'sp2-person', title: 'Describe a person who has influenced you',
    cue: ['Who this person is', 'How you know them', 'What they have done', 'And explain why they have influenced you'],
    model: `I'd like to talk about my high school English teacher, Ms. Delgado, who had a big influence on the way I think about learning in general.

I first met her when I was about fifteen, and she taught my class for two years. What made her stand out wasn't just her knowledge of the subject, but the way she pushed us to think critically rather than just memorise facts for exams. She used to say that making mistakes was actually the fastest way to improve, which completely changed how I approached studying — instead of being afraid of getting things wrong, I started seeing mistakes as useful feedback.

She also encouraged me to enter a national essay competition, which I never would have done on my own, since I wasn't particularly confident back then. I ended up winning second place, and that experience gave me a huge boost in confidence that carried over into other areas of my life, not just academics.

Looking back, I think she influenced me because she genuinely cared whether we understood things properly, not just whether we passed our tests. Even now, whenever I'm learning something difficult, I still remember her advice about mistakes being part of the process, and it helps me stay patient with myself.`,
  },
  {
    id: 'sp2-experience', title: 'Describe a memorable trip you have taken',
    cue: ['Where you went', 'Who you went with', 'What you did there', 'And explain why it was memorable'],
    model: `I'd like to describe a trip I took to the countryside with a few close friends about two years ago, right after we finished our final exams at university.

We rented a small cabin near a lake, about three hours outside the city, and stayed there for five days. None of us had really planned anything in detail — we just wanted somewhere quiet to relax after months of stress. During the day, we did a bit of hiking around the lake, and in the evenings, we mostly just sat outside, cooked simple meals together, and talked for hours without really checking our phones.

What made it particularly memorable was actually how unstructured it was. We hadn't been away together like that before, without any real schedule or obligations, and it ended up being exactly what we needed. There was one evening in particular where we watched a really spectacular sunset over the lake, and I remember thinking that it was probably the most relaxed I'd felt in years.

Even now, whenever things get stressful, that trip is something I think back to. It reminded me that sometimes doing very little, with the right people, is more valuable than an elaborately planned holiday.`,
  },
  {
    id: 'sp2-object', title: 'Describe an object that is important to you',
    cue: ['What the object is', 'Where you got it', 'What you use it for', 'And explain why it is important to you'],
    model: `The object I'd like to talk about is an old wristwatch that belonged to my grandfather, which he gave to me shortly before he passed away.

It's a fairly simple mechanical watch, nothing particularly expensive or fancy, but he'd worn it for almost forty years, so it has a lot of small scratches and marks on it that tell a story in a way. I don't actually wear it every day, mostly because I'm worried about damaging it further, but I keep it on my desk where I can see it.

I don't really use it for telling the time, if I'm honest — I just check my phone for that like everyone else. But I do wind it up occasionally, just so it keeps working properly.

It's important to me mainly because of the memories attached to it rather than the object itself. My grandfather was someone who valued patience and taking care of things properly, and whenever I look at the watch, it reminds me of conversations we used to have. I suppose it's become a kind of symbol for me, a way of holding onto a connection with him even though he's no longer around.`,
  },
];

const SPEAKING_PART3 = [
  { q: 'Do you think older people and younger people are influenced by different role models?', a: 'I think so, yes. Younger people are probably more influenced by public figures they encounter through social media, whereas older generations may look up to people they actually know personally, like teachers or family members, simply because they didn\'t grow up with the same level of exposure to celebrities online.' },
  { q: 'Is it important for children to have good role models?', a: 'Absolutely — I think children are naturally very impressionable, so the people around them, whether that\'s parents, teachers, or older siblings, tend to shape their values quite significantly, often more than children themselves realise at the time.' },
  { q: 'Do you think technology has changed the way people travel?', a: 'Definitely. Booking flights and accommodation used to require a travel agent, but now people can plan an entire trip from their phone in an afternoon. I\'d also say technology has made travel feel less spontaneous in some ways, since everything tends to get researched and reviewed in advance.' },
  { q: 'What are the benefits of travelling to other countries?', a: 'I think the biggest benefit is gaining perspective — experiencing a different culture firsthand tends to challenge assumptions you didn\'t even realise you had. It also tends to make people more adaptable, since travelling often means dealing with unfamiliar situations.' },
  { q: 'Do you think future generations will travel differently than we do now?', a: 'I imagine so, particularly with growing awareness of environmental concerns. I wouldn\'t be surprised if future travellers rely more on trains than short-haul flights, at least in regions where that\'s a realistic option, simply because of the environmental impact of air travel.' },
];

// ── Section overview + lesson bundles ───────────────────────────
export const IELTS_SECTIONS = [
  {
    id: 'listening', name: 'Сонсох (Listening)', icon: '🎧', color: '#3B82F6',
    format: '4 хэсэг · 40 асуулт · 30 минут (+10 мин шилжүүлэх). Бичлэгийг ЗӨВХӨН нэг удаа сонсоно.',
    sections: ['Хэсэг 1: Өдөр тутмын яриа (2 хүн)', 'Хэсэг 2: Монолог (жуулчны мэдээлэл г.м.)', 'Хэсэг 3: Эрдэм шинжилгээний яриа (2–4 хүн)', 'Хэсэг 4: Их сургуулийн лекц'],
    tips: [
      'Бичлэг эхлэхээс өмнө асуултуудыг урьдчилан уншиж, түлхүүр үг тэмдэглэ.',
      'Хариултын үгийн тоо/хэлбэрийн заавар (NO MORE THAN TWO WORDS) -ийг анхаар.',
      'Гацвал тэр асуултыг орхиод дараагийнх руугаа шилж — буцаж болохгүй.',
      'Тоо, нэр, огноо, хаягийн зөв бичгийг (spelling) онцгойлон анхаар.',
      'Synonym (ижил утгат үг) сонсоно — яг тэр үг сонсогдохгүй байж болно.',
    ],
    qtypes: ['Олон сонголт (Multiple choice)', 'Маягт нөхөх (Form/Note completion)', 'Газрын зураг тэмдэглэх (Map labeling)', 'Тааруулах (Matching)', 'Өгүүлбэр гүйцээх (Sentence completion)'],
    phrases: [],
    practice: [
      { q: '"Write NO MORE THAN TWO WORDS" гэвэл хэдэн үг бичих вэ?', options: ['Яг 2 үг', '2 хүртэл үг', '3 үг'], answer: 1 },
      { q: 'Listening-д бичлэгийг хэдэн удаа сонсох вэ?', options: ['1 удаа', '2 удаа', 'Хүссэн удаагаа'], answer: 0 },
    ],
    lessons: LISTENING_LESSONS,
  },
  {
    id: 'reading', name: 'Унших (Reading)', icon: '📖', color: '#10B981',
    format: 'Academic: 3 өгүүлбэр (passage) · 40 асуулт · 60 минут. Цаг өөрөө хуваарилна.',
    sections: ['Богино хугацаанд их хэмжээний текст уншина', 'Бүх хариулт текст дотроос гарна', 'Хариулт шилжүүлэх нэмэлт цаг БАЙХГҮЙ'],
    tips: [
      'Skimming — текстийг хурдан гүйлгэж ерөнхий санааг ол.',
      'Scanning — тодорхой мэдээлэл (тоо, нэр) хайж хурдан ол.',
      'Бүх текстийг үг бүрчлэн уншиж цаг бүү алд.',
      'True/False/Not Given-д: текстэд эсрэгээр байвал False, огт дурдаагүй бол Not Given.',
      'Гарчиг тааруулах (Matching headings) асуултыг сүүлд хий.',
      'Нэг асуултад 1.5 минутаас илүү бүү зарцуул.',
    ],
    qtypes: ['True / False / Not Given', 'Гарчиг тааруулах (Matching headings)', 'Олон сонголт', 'Өгүүлбэр/хүснэгт гүйцээх', 'Догол мөр тааруулах', 'Богино хариулт'],
    phrases: [],
    practice: [
      { q: 'Текстэд огт дурдаагүй мэдээллийн хариулт юу вэ?', options: ['False', 'Not Given', 'True'], answer: 1 },
      { q: 'Reading-д хариулт шилжүүлэх нэмэлт цаг бий юу?', options: ['Тийм, 10 мин', 'Үгүй', 'Тийм, 5 мин'], answer: 1 },
    ],
    lessons: READING_LESSONS,
  },
  {
    id: 'writing', name: 'Бичих (Writing)', icon: '✍️', color: '#F59E0B',
    format: '2 даалгавар · 60 минут. Task 1 (≥150 үг, 20 мин), Task 2 (≥250 үг, 40 мин). Task 2 илүү өндөр жинтэй.',
    sections: [
      'Task 1 (Academic): График/хүснэгт/диаграм тайлбарлах',
      'Task 1 (General): Захидал бичих (албан/албан бус)',
      'Task 2: Эссэ — санал бодол, асуудал шийдэл, давуу/сул тал',
    ],
    tips: [
      'Task 2-т: Оршил → 2 үндсэн догол мөр → Дүгнэлт бүтэцтэй бич.',
      'Догол мөр бүр нэг гол санаа + тайлбар + жишээтэй байх.',
      'Холбоос үгс (Firstly, However, In addition, Therefore) ашигла.',
      'Task 1-д хамгийн чухал чиг хандлага (trend), өндөр/нам цэгийг онцол.',
      'Үгийн тоог хангах (Task 1 ≥150, Task 2 ≥250), эс бол оноо хасагдана.',
      'Цагаа хуваарилж, эцэст нь 2–3 минут шалгаж зас.',
    ],
    qtypes: ['Task 1: Line graph / Bar chart / Pie chart / Table / Process / Map / Letter', 'Task 2: Opinion / Discussion / Problem-Solution / Advantage-Disadvantage'],
    phrases: [
      ['Оршил', 'The graph illustrates… / This essay will discuss…'],
      ['Санал нэмэх', 'Furthermore, … / In addition, … / Moreover, …'],
      ['Эсрэг тал', 'However, … / On the other hand, … / Nevertheless, …'],
      ['Жишээ', 'For instance, … / For example, … / Such as …'],
      ['Дүгнэлт', 'In conclusion, … / To sum up, … / Overall, …'],
      ['Чиг хандлага', 'increased sharply / declined gradually / remained stable / peaked at'],
    ],
    practice: [
      { q: 'Task 2 эссэ хамгийн багадаа хэдэн үгтэй байх ёстой вэ?', options: ['150 үг', '250 үг', '200 үг'], answer: 1 },
      { q: 'Аль Task илүү өндөр оноотой вэ?', options: ['Task 1', 'Task 2', 'Тэнцүү'], answer: 1 },
    ],
    task1: WRITING_TASK1,
    task2: WRITING_TASK2,
  },
  {
    id: 'speaking', name: 'Ярих (Speaking)', icon: '🗣️', color: '#8B5CF6',
    format: '3 хэсэг · 11–14 минут · шалгагчтай нүүр тулан. Бичлэг хийгдэнэ.',
    sections: [
      'Part 1 (4–5 мин): Танилцах, өөрийн тухай энгийн асуулт',
      'Part 2 (3–4 мин): Cue card — 1 мин бэлдэж, 1–2 мин ярих',
      'Part 3 (4–5 мин): Part 2-той холбоотой гүнзгий хэлэлцүүлэг',
    ],
    tips: [
      'Богино "yes/no" хариулт бүү өг — тайлбар, жишээ нэмж дэлгэрүүл.',
      'Part 2-т 1 минутын бэлтгэлдээ түлхүүр санаа тэмдэглэ.',
      'Холбоос үгс (Well, Actually, To be honest, I mean) ашиглаж жам ёсоор ярь.',
      'Алдаа гаргахаас бүү ай — жам ёсны урсгал, баялаг үгсийн сан илүү чухал.',
      'Янз бүрийн цаг хэлбэр, нийлмэл өгүүлбэр ашигла.',
      'Дуудлага, өргөлт (intonation) -д анхаар.',
    ],
    qtypes: ['Part 1: Гэр бүл, ажил, хобби, төрсөн нутаг', 'Part 2: Хүн/газар/үйл явдал/эд зүйл тайлбарлах', 'Part 3: Хийсвэр, нийгмийн сэдвээр санал'],
    phrases: [
      ['Бодох цаг авах', "That's an interesting question… / Let me think…"],
      ['Санал илэрхийлэх', 'In my opinion, … / I believe that … / Personally, …'],
      ['Жишээ өгөх', 'For example, … / Like when I …'],
      ['Тодотгох', 'What I mean is … / In other words, …'],
    ],
    practice: [
      { q: 'Part 2-т бэлдэх хэдэн минут өгдөг вэ?', options: ['1 минут', '3 минут', 'Өгдөггүй'], answer: 0 },
      { q: 'Speaking хэдэн хэсэгтэй вэ?', options: ['2', '3', '4'], answer: 1 },
    ],
    part1: SPEAKING_PART1,
    part2: SPEAKING_PART2,
    part3: SPEAKING_PART3,
  },
];

export const IELTS_VOCAB = [
  ['analyze', 'ˈænəlaɪz', 'шинжлэх'], ['significant', 'sɪɡˈnɪfɪkənt', 'чухал, ихээхэн'],
  ['approximately', 'əˈprɒksɪmətli', 'ойролцоогоор'], ['fluctuate', 'ˈflʌktʃueɪt', 'хэлбэлзэх'],
  ['substantial', 'səbˈstænʃl', 'нэлээд их'], ['nevertheless', 'ˌnevəðəˈles', 'гэсэн ч'],
  ['consequently', 'ˈkɒnsɪkwəntli', 'үүний улмаас'], ['phenomenon', 'fəˈnɒmɪnən', 'үзэгдэл'],
  ['contemporary', 'kənˈtempərəri', 'орчин үеийн'], ['inevitable', 'ɪnˈevɪtəbl', 'зайлшгүй'],
  ['controversial', 'ˌkɒntrəˈvɜːʃl', 'маргаантай'], ['beneficial', 'ˌbenɪˈfɪʃl', 'ашигтай'],
  ['deteriorate', 'dɪˈtɪəriəreɪt', 'муудах, доройтох'], ['facilitate', 'fəˈsɪlɪteɪt', 'хөнгөвчлөх'],
  ['implement', 'ˈɪmplɪment', 'хэрэгжүүлэх'], ['mitigate', 'ˈmɪtɪɡeɪt', 'бууруулах, зөөлрүүлэх'],
  ['unprecedented', 'ʌnˈpresɪdentɪd', 'урьд өмнө байгаагүй'], ['comprehensive', 'ˌkɒmprɪˈhensɪv', 'иж бүрэн'],
  ['viable', 'ˈvaɪəbl', 'боломжтой, тохиромжтой'], ['sustainable', 'səˈsteɪnəbl', 'тогтвортой'],
];

export function findIelts(id) { return IELTS_SECTIONS.find(s => s.id === id); }
