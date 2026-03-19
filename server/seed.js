const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('🌱 Seeding SL-GOVCHAT database...');

// Clear existing data
db.exec('DELETE FROM users; DELETE FROM news; DELETE FROM officials; DELETE FROM projects; DELETE FROM chatbot_knowledge; DELETE FROM publications; DELETE FROM analytics_events;');

// --- Users ---
const passwordHash = bcrypt.hashSync('admin123', 10);
db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'admin@govchat.gov.sl', passwordHash, 'System Administrator', 'admin'
);
console.log('  ✅ Admin user created (admin@govchat.gov.sl / admin123)');

// --- News ---
const newsItems = [
    { title: 'President Bio Launches Free Quality Education Phase II', summary: 'The Government expands its flagship education programme to cover senior secondary schools across all 16 districts.', content: 'President Julius Maada Bio has officially launched the second phase of the Free Quality School Education (FQSE) programme. The expanded initiative now covers senior secondary schools, providing free tuition, textbooks, and learning materials to over 2 million students nationwide. The programme, funded through the national budget and international partners, aims to increase enrollment rates and reduce educational inequality across Sierra Leone.', category: 'Education', author: 'Ministry of Information', image_url: '' },
    { title: 'National Revenue Authority Reports Record Tax Collection', summary: 'NRA exceeds quarterly targets with innovative digital tax collection systems.', content: 'The National Revenue Authority (NRA) has announced a record-breaking quarter, collecting over 2.5 trillion Leones in domestic revenue. Commissioner General Dr. Samuel Turner attributed the success to the implementation of the Electronic Cash Register (ECR) system and the Integrated Tax Administration System (ITAS). The NRA plans to expand its digital infrastructure to all provincial headquarters by the end of the fiscal year.', category: 'Economy', author: 'NRA Communications', image_url: '' },
    { title: 'Sierra Leone Roads Authority Completes Freetown-Bo Highway Rehabilitation', summary: 'SLRA finishes the 200km highway rehabilitation project ahead of schedule.', content: 'The Sierra Leone Roads Authority (SLRA) has completed the rehabilitation of the Freetown-Bo Highway, a critical arterial road connecting the capital to the southern region. The project, valued at $180 million and funded by the World Bank and African Development Bank, includes dual carriageway sections, modern drainage systems, and pedestrian walkways. The improved road is expected to reduce travel time by 40% and boost economic activity in the southern and eastern provinces.', category: 'Infrastructure', author: 'SLRA Public Affairs', image_url: '' },
    { title: 'Cabinet Approves National Cybersecurity Policy', summary: 'Government moves to strengthen digital security frameworks across all MDAs.', content: 'The Cabinet has approved Sierra Leone\'s first comprehensive National Cybersecurity Policy, developed by the Ministry of Information and Communications in collaboration with international partners. The policy establishes a National Computer Emergency Response Team (CERT-SL), mandates cybersecurity audits for all government systems, and creates a framework for protecting critical digital infrastructure. Implementation will begin in Q1 of the next fiscal year.', category: 'Technology', author: 'Ministry of Information and Communications', image_url: '' },
    { title: 'Ministry of Health Launches National Health Insurance Scheme', summary: 'Universal health coverage initiative aims to cover 80% of the population within 5 years.', content: 'The Ministry of Health and Sanitation has officially launched SaloneCare, the National Health Insurance Scheme designed to provide affordable healthcare to all Sierra Leoneans. The scheme will initially cover primary healthcare services, maternal care, and emergency treatments. Registration centers have been established in all district headquarters, with mobile registration teams deployed to remote communities.', category: 'Health', author: 'Ministry of Health', image_url: '' },
    { title: 'Government Signs MOU with China for Freetown Port Expansion', summary: 'The $500 million project will modernize the Queen Elizabeth II Quay and build a new container terminal.', content: 'The Government of Sierra Leone has signed a Memorandum of Understanding with the China Harbour Engineering Company for the expansion and modernization of the Freetown Port. The project includes the construction of a new deep-water container terminal, rehabilitation of existing berths, and installation of modern cargo handling equipment. The expanded port is expected to handle 500,000 TEUs annually, positioning Sierra Leone as a regional maritime hub.', category: 'Infrastructure', author: 'Ministry of Transport', image_url: '' },
    { title: 'Sierra Leone Teachers Union Reaches Agreement on New Pay Scale', summary: 'Teachers to receive 30% salary increase effective next academic year.', content: 'The Sierra Leone Teachers Union (SLTU) and the Government have reached a landmark agreement on a new pay scale for public school teachers. The agreement includes a 30% salary increase, improved housing allowances for rural teachers, and a teacher professional development fund. President Bio called the agreement a testament to the government\'s commitment to the teaching profession and quality education.', category: 'Education', author: 'SLTU Secretariat', image_url: '' },
    { title: 'Local Content Agency Registers 5,000 New Local Businesses', summary: 'SLLCA drives economic inclusion through its Local Content Certification programme.', content: 'The Sierra Leone Local Content Agency (SLLCA) has registered over 5,000 new local businesses under its Local Content Certification programme. The initiative ensures that Sierra Leonean businesses receive preferential treatment in government contracts and procurement. Director General Dr. Haja Ramatulai Wurie stated that the programme has created over 15,000 direct jobs and generated $50 million in local economic activity.', category: 'Economy', author: 'SLLCA Communications', image_url: '' },
];

const insertNews = db.prepare('INSERT INTO news (title, summary, content, category, author, image_url) VALUES (?, ?, ?, ?, ?, ?)');
for (const n of newsItems) {
    insertNews.run(n.title, n.summary, n.content, n.category, n.author, n.image_url);
}
console.log(`  ✅ ${newsItems.length} news articles created`);

// --- Officials ---
const officials = [
    { name: 'Brig. (Rtd.) Julius Maada Bio', title: 'President of Sierra Leone', category: 'Executive', office: 'State House', institution: 'Office of the President', bio: 'His Excellency Brig. (Rtd.) Julius Maada Bio is the President of the Republic of Sierra Leone, serving since 2018.', tenure_start: '2018-04-04' },
    { name: 'Dr. Mohamed Juldeh Jalloh', title: 'Vice President', category: 'Executive', office: 'State House', institution: 'Office of the Vice President', bio: 'Dr. Mohamed Juldeh Jalloh serves as the Vice President of Sierra Leone.', tenure_start: '2018-04-04' },
    { name: 'Hon. David Moinina Sengeh', title: 'Minister of Education', category: 'Minister', office: 'New England', institution: 'Ministry of Education', bio: 'Chief Innovation Officer and Minister of Education, known for advancing the Free Quality Education programme.', tenure_start: '2018-05-01' },
    { name: 'Hon. Rado Yokie', title: 'Minister of Information and Communications', category: 'Minister', office: 'Youyi Building', institution: 'Ministry of Information and Communications', bio: 'Leads the national digital transformation strategy and oversees government communications.', tenure_start: '2023-08-01' },
    { name: 'Hon. Mohamed Alie', title: 'Minister of Finance', category: 'Minister', office: 'George Street', institution: 'Ministry of Finance', bio: 'Oversees national fiscal policy, budget management, and economic planning.', tenure_start: '2023-08-01' },
    { name: 'Dr. Austin Demby', title: 'Minister of Health', category: 'Minister', office: 'Youyi Building', institution: 'Ministry of Health and Sanitation', bio: 'Leading the SaloneCare National Health Insurance Scheme and healthcare reform.', tenure_start: '2018-05-01' },
    { name: 'Hon. Chernor Bah', title: 'Speaker of Parliament', category: 'Parliament', office: 'Parliament Building, Tower Hill', institution: 'Parliament of Sierra Leone', bio: 'Presides over legislative sessions and ensures orderly conduct of parliamentary business.', tenure_start: '2023-07-01' },
    { name: 'Hon. Mathew Nyuma', title: 'Deputy Speaker', category: 'Parliament', office: 'Parliament Building, Tower Hill', institution: 'Parliament of Sierra Leone', bio: 'Serves as Deputy Speaker and assists in the management of parliamentary proceedings.', tenure_start: '2023-07-01' },
    { name: 'Justice Babatunde Edwards', title: 'Chief Justice', category: 'Judiciary', office: 'Law Courts Building', institution: 'The Judiciary of Sierra Leone', bio: 'Head of the Judicial Branch, presiding over the Supreme Court and ensuring the administration of justice.', tenure_start: '2021-01-01' },
    { name: 'Dr. Samuel Turner', title: 'Commissioner General', category: 'MDA Head', office: 'Kissy Road', institution: 'National Revenue Authority (NRA)', bio: 'Leads the NRA in modernizing tax collection and revenue generation.', tenure_start: '2020-01-01' },
    { name: 'Eng. Amara Kanneh', title: 'Director General', category: 'MDA Head', office: 'Goderich Street', institution: 'Sierra Leone Roads Authority (SLRA)', bio: 'Oversees the construction and maintenance of national road infrastructure.', tenure_start: '2019-06-01' },
    { name: 'Dr. Haja Ramatulai Wurie', title: 'Director General', category: 'MDA Head', office: 'Wilberforce', institution: 'Sierra Leone Local Content Agency (SLLCA)', bio: 'Leads efforts to promote local business participation in the national economy.', tenure_start: '2020-03-01' },
    { name: 'Hon. Alpha Timbo', title: 'Minister of Labour', category: 'Minister', office: 'New England', institution: 'Ministry of Labour and Social Security', bio: 'Oversees labour policies, worker protections, and social security programmes.', tenure_start: '2018-05-01' },
    { name: 'Hon. Francess Piagie Alghali', title: 'Minister of Marine Resources', category: 'Minister', office: 'Youyi Building', institution: 'Ministry of Marine Resources', bio: 'Manages fisheries and marine resources for economic development.', tenure_start: '2023-08-01' },
    { name: 'Justice Desmond Babatunde Luke', title: 'Justice of the Supreme Court', category: 'Judiciary', office: 'Law Courts Building', institution: 'The Judiciary of Sierra Leone', bio: 'Serves as a Justice of the Supreme Court of Sierra Leone.', tenure_start: '2019-01-01' },
    { name: 'Hon. Kandeh Yumkella', title: 'Member of Parliament - Kambia', category: 'Parliament', office: 'Parliament Building', institution: 'Parliament of Sierra Leone', bio: 'Represents Kambia District and serves on the Energy and Finance committees.', tenure_start: '2023-07-01' },
];

const insertOfficial = db.prepare('INSERT INTO officials (name, title, category, office, institution, tenure_start, bio) VALUES (?, ?, ?, ?, ?, ?, ?)');
for (const o of officials) {
    insertOfficial.run(o.name, o.title, o.category, o.office, o.institution, o.tenure_start, o.bio);
}
console.log(`  ✅ ${officials.length} officials created`);

// --- Projects ---
const projects = [
    { name: 'Free Quality School Education (FQSE) Programme', description: 'Comprehensive programme providing free primary and secondary education to all Sierra Leonean children, including free tuition, textbooks, and school feeding.', status: 'ongoing', ministry: 'Ministry of Education', budget: '$200 million', start_date: '2018-08-20', progress: 75, location: 'Nationwide' },
    { name: 'Freetown-Bo Highway Rehabilitation', description: 'Complete rehabilitation of the 200km highway connecting Freetown to Bo, including dual carriageway sections and modern drainage.', status: 'completed', ministry: 'SLRA', budget: '$180 million', start_date: '2020-01-15', end_date: '2024-12-30', progress: 100, location: 'Western Area - Southern Province' },
    { name: 'National Fibre Optic Backbone Network', description: 'Installation of a nationwide fibre optic network connecting all 16 district headquarter towns to improve internet connectivity.', status: 'ongoing', ministry: 'Ministry of Information and Communications', budget: '$150 million', start_date: '2022-03-01', progress: 60, location: 'Nationwide' },
    { name: 'SaloneCare Health Insurance Scheme', description: 'Universal health insurance programme providing affordable healthcare coverage to all Sierra Leoneans.', status: 'ongoing', ministry: 'Ministry of Health', budget: '$120 million', start_date: '2023-06-01', progress: 35, location: 'Nationwide' },
    { name: 'Lungi International Airport Modernization', description: 'Expansion and modernization of Lungi International Airport to increase capacity and improve passenger experience.', status: 'ongoing', ministry: 'Ministry of Transport', budget: '$300 million', start_date: '2021-09-01', progress: 50, location: 'Port Loko District' },
    { name: 'Integrated Tax Administration System (ITAS)', description: 'Digital system for tax registration, filing, and payment, improving revenue collection efficiency.', status: 'completed', ministry: 'National Revenue Authority', budget: '$25 million', start_date: '2019-04-01', end_date: '2022-12-31', progress: 100, location: 'Freetown' },
    { name: 'Tombo-Tokeh Road Construction', description: 'Construction of a new 45km coastal road connecting Tombo to Tokeh, opening the tourism corridor.', status: 'ongoing', ministry: 'SLRA', budget: '$85 million', start_date: '2023-01-15', progress: 40, location: 'Western Area Rural' },
    { name: 'National Youth Service Corps', description: 'Programme deploying graduates to underserved communities for skills transfer and community development.', status: 'past', ministry: 'Ministry of Youth Affairs', budget: '$15 million', start_date: '2016-01-01', end_date: '2019-12-31', progress: 100, location: 'Nationwide' },
    { name: 'Electricity Access Expansion Project', description: 'Expanding electricity access to rural communities through solar mini-grids and grid extension.', status: 'ongoing', ministry: 'Ministry of Energy', budget: '$250 million', start_date: '2022-07-01', progress: 30, location: 'Eastern & Northern Provinces' },
    { name: 'Electronic Cash Register (ECR) Deployment', description: 'Nationwide deployment of electronic cash registers to capture sales tax at point of sale.', status: 'completed', ministry: 'National Revenue Authority', budget: '$10 million', start_date: '2020-06-01', end_date: '2023-03-31', progress: 100, location: 'Nationwide' },
];

const insertProject = db.prepare('INSERT INTO projects (name, description, status, ministry, budget, start_date, end_date, progress, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
for (const p of projects) {
    insertProject.run(p.name, p.description, p.status, p.ministry, p.budget, p.start_date, p.end_date || null, p.progress, p.location);
}
console.log(`  ✅ ${projects.length} projects created`);

// --- Chatbot Knowledge Base ---
const knowledge = [
    // Business Registration
    { question: 'How do I register a business in Sierra Leone?', answer: 'To register a business in Sierra Leone, you need to:\n\n1. Reserve a company name at the Corporate Affairs Commission (CAC)\n2. Complete the registration form (Form 1 for companies)\n3. Provide memorandum and articles of association\n4. Pay the registration fee (starting from Le 500,000 for sole proprietorships)\n5. Obtain your certificate of incorporation\n\nThe entire process takes 3-5 business days. You can visit the CAC office on Government Wharf in Freetown or contact them at +232 22 222000.', category: 'Business', mda_source: 'Corporate Affairs Commission', keywords: 'register,business,company,incorporation,CAC,start,enterprise,sole proprietorship' },

    // Tax Information
    { question: 'What are the current tax rates in Sierra Leone?', answer: 'Sierra Leone\'s current tax rates include:\n\n• Corporate Income Tax: 30%\n• Personal Income Tax: Progressive rates from 0% to 35%\n  - Up to Le 6,000,000: 0%\n  - Le 6,000,001 to Le 12,000,000: 15%\n  - Le 12,000,001 to Le 18,000,000: 20%\n  - Le 18,000,001 to Le 24,000,000: 25%\n  - Above Le 24,000,000: 35%\n• GST (Goods and Services Tax): 15%\n• Withholding Tax: 10% on dividends, 15% on interest\n\nFor more details, visit the NRA website or any NRA regional office.', category: 'Tax', mda_source: 'National Revenue Authority (NRA)', keywords: 'tax,rates,income,corporate,GST,NRA,withholding,revenue,payment' },

    { question: 'How do I file my taxes with the NRA?', answer: 'You can file your taxes with the National Revenue Authority through:\n\n1. **Online**: Use the Integrated Tax Administration System (ITAS) at taxes.nra.gov.sl\n2. **In Person**: Visit any NRA office with your TIN, financial records, and completed tax return forms\n3. **Filing Deadlines**:\n   - Individual returns: June 30th each year\n   - Corporate returns: Within 6 months of financial year end\n   - GST returns: 21st of each month\n\nLate filing attracts penalties of 25% of assessed tax plus 10% annual interest.', category: 'Tax', mda_source: 'National Revenue Authority (NRA)', keywords: 'file,taxes,NRA,return,TIN,ITAS,deadline,GST,filing' },

    // Labour Laws
    { question: 'What are my rights as a worker in Sierra Leone?', answer: 'Under the Regulation of Wages and Industrial Relations Act and the Employers and Employed Act, workers in Sierra Leone have the following rights:\n\n• **Minimum Wage**: Le 800,000 per month\n• **Working Hours**: Maximum 8 hours per day, 40 hours per week\n• **Overtime**: Paid at 1.5x regular rate\n• **Annual Leave**: Minimum 18 working days per year\n• **Sick Leave**: Up to 26 working days per year with medical certificate\n• **Maternity Leave**: 14 weeks (6 weeks before, 8 weeks after delivery)\n• **Protection from unfair dismissal**\n• **Right to join a trade union**\n\nFor complaints, contact the Ministry of Labour at +232 22 226 898.', category: 'Labour', mda_source: 'Ministry of Labour and Social Security', keywords: 'worker,rights,labour,minimum wage,hours,leave,maternity,overtime,employment,dismissal,union' },

    { question: 'How do I make a labour complaint?', answer: 'To file a labour complaint in Sierra Leone:\n\n1. Visit the Ministry of Labour and Social Security office nearest to you\n2. Request a complaint form from the Industrial Relations Division\n3. Provide details of your complaint including:\n   - Employer name and address\n   - Nature of the complaint\n   - Supporting documents (contract, pay slips, etc.)\n4. A labour officer will be assigned to mediate\n5. If mediation fails, the case may be referred to the Industrial Court\n\nThe Ministry has offices in Freetown, Bo, Kenema, and Makeni. Complaints can also be filed through the SLTU for education sector workers.', category: 'Labour', mda_source: 'Ministry of Labour and Social Security', keywords: 'labour,complaint,dispute,employer,worker,mediation,industrial court,SLTU' },

    // Education
    { question: 'How does the Free Quality Education programme work?', answer: 'The Free Quality School Education (FQSE) programme covers:\n\n• **Coverage**: All government-approved primary and secondary schools\n• **Benefits**:\n  - Free tuition fees\n  - Free textbooks and learning materials\n  - School feeding programme in select schools\n  - Teacher training and professional development\n• **Eligibility**: All Sierra Leonean children aged 6-18\n• **Registration**: Through the nearest school or District Education Office\n\nPhase I covered primary and junior secondary. Phase II now extends to senior secondary schools. Over 2 million children benefit from this programme.', category: 'Education', mda_source: 'Ministry of Education', keywords: 'education,school,free,FQSE,tuition,textbook,enrollment,primary,secondary,children' },

    // Roads & Infrastructure
    { question: 'What road projects are currently being built?', answer: 'Major ongoing road projects by the Sierra Leone Roads Authority (SLRA) include:\n\n1. **Tombo-Tokeh Coastal Road** (45km) - 40% complete, Western Area Rural\n2. **Pendembu-Kailahun Road** - Rehabilitation ongoing, Eastern Province  \n3. **Kambia-Pamelap Highway** - Northern corridor improvement\n4. **Freetown Urban Road Network** - Multiple township roads being rehabilitated\n5. **Mile 91-Yele Road** - Connecting central districts\n\nAll projects are funded through government budget, World Bank, AfDB, and bilateral partnerships. For project details, visit SLRA headquarters on Goderich Street, Freetown.', category: 'Infrastructure', mda_source: 'Sierra Leone Roads Authority (SLRA)', keywords: 'road,construction,highway,SLRA,infrastructure,bridge,project,rehabilitation' },

    // Local Content
    { question: 'What is the Sierra Leone Local Content policy?', answer: 'The Sierra Leone Local Content Agency (SLLCA) implements the Local Content Policy which requires:\n\n• **Government Procurement**: Minimum 30% of contract value must be subcontracted to local businesses\n• **Employment**: Projects must prioritize hiring Sierra Leonean workers (minimum 80% for unskilled, 60% for skilled)\n• **Local Content Certification**: Required for businesses bidding on government contracts\n• **How to Register**: Visit SLLCA at their Wilberforce office or apply online\n• **Benefits**: Priority in government tenders, capacity building support, networking opportunities\n\nThe SLLCA has registered over 5,000 local businesses and created 15,000+ jobs.', category: 'Business', mda_source: 'Sierra Leone Local Content Agency (SLLCA)', keywords: 'local content,SLLCA,procurement,certification,business,contract,employment,local' },

    // Health
    { question: 'How do I register for the National Health Insurance?', answer: 'To register for SaloneCare (National Health Insurance Scheme):\n\n1. Visit any SaloneCare registration center in your district\n2. Bring a valid national ID or voter registration card\n3. Complete the registration form\n4. Choose your premium tier:\n   - Basic: Le 50,000/month (primary care + emergencies)\n   - Standard: Le 100,000/month (adds specialist care)\n   - Premium: Le 200,000/month (comprehensive coverage)\n5. Receive your SaloneCare card\n\nVulnerable populations (under-5 children, pregnant women, elderly over 60) receive free basic coverage. Mobile registration teams visit remote communities regularly.', category: 'Health', mda_source: 'Ministry of Health and Sanitation', keywords: 'health,insurance,SaloneCare,register,hospital,clinic,coverage,medical,premium' },

    // Government Contact
    { question: 'How do I contact a government ministry?', answer: 'You can contact Government Ministries through the following channels:\n\n• **Ministry of Information**: +232 22 226 770 | Youyi Building, Freetown\n• **Ministry of Finance**: +232 22 222 211 | George Street, Freetown\n• **Ministry of Education**: +232 22 222 502 | New England, Freetown\n• **Ministry of Health**: +232 22 222 583 | Youyi Building, Freetown\n• **Ministry of Labour**: +232 22 226 898 | New England, Freetown\n• **NRA**: +232 22 228 978 | Kissy Road, Freetown\n• **SLRA**: +232 22 222 637 | Goderich Street, Freetown\n\nAll ministries are open Monday-Friday, 8:00 AM to 5:00 PM.', category: 'Government', mda_source: 'Ministry of Information and Communications', keywords: 'contact,ministry,phone,address,office,government,MDA,telephone' },

    // Digital Services
    { question: 'What digital government services are available?', answer: 'Sierra Leone now offers several digital government services:\n\n1. **ITAS (Tax Filing)**: Online tax registration and filing at taxes.nra.gov.sl\n2. **Business Registration**: Online company name search and reservation\n3. **Civil Registration**: Birth and death certificate applications\n4. **Passport Services**: Online appointment booking for passport applications\n5. **Land Registry**: Digital land title verification\n6. **SaloneCare**: Online health insurance registration\n7. **FQSE Portal**: School enrollment and information\n\nThe government is continuously expanding digital services under the National Digital Transformation Strategy. Visit www.gov.sl for more information.', category: 'Digital Services', mda_source: 'Ministry of Information and Communications', keywords: 'digital,services,online,portal,e-government,website,registration,appointment' },

    // Tourism
    { question: 'What are the main tourist attractions in Sierra Leone?', answer: 'Sierra Leone offers diverse tourist attractions:\n\n🏖️ **Beaches**: Lumley Beach, Tokeh Beach, River Number Two Beach, Bureh Beach\n🏔️ **Nature**: Mount Bintumani (highest peak), Tiwai Island Wildlife Sanctuary, Outamba-Kilimi National Park\n🏛️ **History**: Bunce Island (historic site), National Museum, Cotton Tree (historic landmark)\n🌊 **Islands**: Banana Islands, Turtle Islands\n🎭 **Culture**: Freetown cultural festivals, local markets\n\nThe National Tourist Board can be reached at +232 22 272 620 for visitor information and tour arrangements.', category: 'Tourism', mda_source: 'National Tourist Board', keywords: 'tourism,tourist,beach,attraction,visit,travel,hotel,island,nature,culture' },
];

const insertKnowledge = db.prepare('INSERT INTO chatbot_knowledge (question, answer, category, mda_source, keywords) VALUES (?, ?, ?, ?, ?)');
for (const k of knowledge) {
    insertKnowledge.run(k.question, k.answer, k.category, k.mda_source, k.keywords);
}
console.log(`  ✅ ${knowledge.length} chatbot knowledge entries created`);

// --- Publications ---
const publications = [
    { title: 'National Digital Transformation Strategy 2023-2028', description: 'Comprehensive framework for Sierra Leone\'s digital transformation across government, education, health, and commerce.', category: 'Strategy', document_url: '#' },
    { title: 'National Budget 2024 - Citizen\'s Guide', description: 'Simplified version of the national budget for public understanding and engagement.', category: 'Finance', document_url: '#' },
    { title: 'Sierra Leone Medium-Term National Development Plan', description: 'Five-year plan outlining development priorities including education, health, infrastructure, and governance.', category: 'Development', document_url: '#' },
    { title: 'Local Content Policy Document', description: 'Policy framework for promoting local business participation in government procurement and economic development.', category: 'Policy', document_url: '#' },
    { title: 'National Cybersecurity Policy 2024', description: 'Framework for protecting national digital infrastructure and establishing cybersecurity protocols.', category: 'Policy', document_url: '#' },
];

const insertPub = db.prepare('INSERT INTO publications (title, description, category, document_url) VALUES (?, ?, ?, ?)');
for (const p of publications) {
    insertPub.run(p.title, p.description, p.category, p.document_url);
}
console.log(`  ✅ ${publications.length} publications created`);

console.log('\n✅ Database seeding complete!');
