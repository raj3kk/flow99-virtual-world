// Virtual World 3D (external, PlayCanvas) — content CONFIG.
// Standalone demo only. No real Flow99 connection, no network save, no payment, no OTP.
// NOTE: There is deliberately NO collectable currency system in this build.
// Progress = quests + badges only, stored in the visitor's browser (localStorage).
window.VW = window.VW || {};
window.VW.CONFIG = {
  gateCode: 'flow99',
  languages: ['hinglish', 'hindi', 'english'],
  zones: [
    { id: 'plaza', name: 'Intro Plaza', x: 0, z: 0, desc: 'Entry, gate, Robo-Prime HQ desk' },
    { id: 'park', name: 'Features Park', x: -28, z: -18, desc: 'Flow99 features as working demo stalls' },
    { id: 'bridge', name: 'How-it-Works Bridge', x: 24, z: -14, desc: 'Bridge over the river, steps of automation' },
    { id: 'bazaar', name: 'Pricing Bazaar', x: -26, z: 22, desc: 'Demo pricing stalls, monthly / yearly toggle' },
    { id: 'garden', name: 'Reviews Garden', x: 28, z: 24, desc: 'Demo customer reviews, garden seating' },
    { id: 'tower', name: 'FAQ Tower', x: 0, z: -34, desc: 'FAQ tower, answers in-world' },
    { id: 'castle', name: 'Contact Castle + Secret Room', x: 0, z: 34, desc: 'Contact hall, hidden secret room behind the hall' }
  ],
  // 13 workers + 8 guards = 21 robot agents. No human NPCs. Visitor is the only human.
  agents: [
    { id: 'robo-prime', name: 'Robo-Prime', job: 'Flow99 Assistant', guard: false, color: [0.1, 0.75, 0.9], x: 3, z: 3, pitch: 0.7, rate: 0.95, story: 'Main Flow99 ka main assistant hoon. Poori duniya ki automation meri zimmedari hai.', lines: ['Namaste! Main Robo-Prime hoon.', 'Flow99 ka subscription kar lijiye, main fully aapke WhatsApp ko automation kar dunga.', 'Teleport, tour, ya koi sawaal — main hazir hoon.'] },
    { id: 'chai-bot', name: 'Chai-Bot', job: 'Chai Stall', guard: false, color: [0.9, 0.55, 0.15], x: -22, z: -14, pitch: 1.0, rate: 1.0, story: 'Main chai stall chalata hoon. Har visitor ko garam chai, bina ruke.', lines: ['Chai piyoge? Automation ke saath chai bhi on time milti hai.'] },
    { id: 'shop-bot', name: 'Shop-Bot', job: 'Demo Shop', guard: false, color: [0.85, 0.2, 0.4], x: -26, z: 22, pitch: 1.1, rate: 1.0, story: 'Main Pricing Bazaar ki dukaan chalata hoon. Demo plans dikhata hoon, asli payment nahi leta.', lines: ['Demo plan dekhna hai? Yahan sab demo hai, asli payment nahi.'] },
    { id: 'study-bot', name: 'Study-Bot', job: 'FAQ Tower Guide', guard: false, color: [0.3, 0.5, 0.95], x: 0, z: -30, pitch: 1.0, rate: 0.95, story: 'Main FAQ Tower me sawaalon ke jawab deta hoon.', lines: ['Koi sawaal ho to poochho, main jawab dunga.'] },
    { id: 'delivery-bot', name: 'Delivery-Bot', job: 'Delivery Loop', guard: false, color: [0.95, 0.75, 0.1], x: -10, z: 0, pitch: 0.9, rate: 1.0, story: 'Main parcel lekar poori duniya me loop me chalta hoon, kabhi rukta nahi.', lines: ['Delivery on the way! Automation rukti nahi.'] },
    { id: 'medi-bot', name: 'Medi-Bot', job: 'Help Desk', guard: false, color: [0.2, 0.9, 0.5], x: 20, z: 20, pitch: 1.0, rate: 1.0, story: 'Main help desk par hoon. Koi atak jaye to main rasta batata hoon.', lines: ['Atak gaye ho? Home button dabao ya mujhse poochho.'] },
    { id: 'phool-bot', name: 'Phool-Bot', job: 'Garden', guard: false, color: [0.9, 0.3, 0.7], x: 28, z: 24, pitch: 1.2, rate: 1.0, story: 'Main garden ke phool sambhalta hoon.', lines: ['Phool dekh lo, par todna demo me hi allowed hai.'] },
    { id: 'chintu-bot', name: 'Chintu-Bot', job: 'Meme Agent', guard: false, color: [1.0, 0.6, 0.2], x: -14, z: 10, pitch: 1.3, rate: 1.1, story: 'Main duniya ka sabse chill robot hoon. Kaam itna fast hua ki customer bola — bhai, magic kar diya kya?', lines: ['Automation itna smooth, ki neend me bhi dukaan chalti hai!'] },
    { id: 'bablu-bot', name: 'Bablu-Bot', job: 'Meme Agent', guard: false, color: [0.5, 0.3, 0.9], x: 14, z: -8, pitch: 1.2, rate: 1.05, story: 'Main joke ke saath kaam karta hoon, par kaam kabhi late nahi karta.', lines: ['Main robot hoon, par mood human se kam nahi!'] },
    { id: 'guide-bot', name: 'Guide-Bot', job: 'Tour Guide', guard: false, color: [0.1, 0.8, 0.8], x: 6, z: -6, pitch: 1.0, rate: 1.0, story: 'Main guided tour karata hoon, 7 zones ghumata hoon.', lines: ['Tour chahiye? Top bar se Tour dabao.'] },
    { id: 'papa-bot', name: 'Papa-Bot', job: 'AI Robot Parivaar', guard: false, color: [0.4, 0.4, 0.9], x: -8, z: 28, pitch: 0.8, rate: 0.9, story: 'Subah main kaam par jata hoon. Shaam ko aaunga — tab tak AI grahakon ko jawab deta rahega.', lines: ['Haan, le liya! Shaam ko aaunga — tab tak AI grahakon ko jawab deta rahega.'] },
    { id: 'mummy-bot', name: 'Mummy-Bot', job: 'AI Robot Parivaar', guard: false, color: [0.9, 0.4, 0.6], x: -6, z: 28, pitch: 1.1, rate: 1.0, story: 'Main ghar ki automation sambhalti hoon.', lines: ['Ghar ka har kaam automated hai.'] },
    { id: 'gudiya-bot', name: 'Gudiya-Bot', job: 'AI Robot Parivaar', guard: false, color: [1.0, 0.7, 0.8], x: -7, z: 26, pitch: 1.4, rate: 1.1, story: 'Main chhoti robot hoon, khelna aur seekhna mera kaam hai.', lines: ['Mujhse khelo, main seekhti rehti hoon!'] },
    { id: 'rakshak-1', name: 'Rakshak-1', job: 'Gate Guard', guard: true, color: [0.8, 0.1, 0.1], x: 0, z: 6, pitch: 0.7, rate: 0.9, story: 'Main gate ki suraksha karta hoon.', lines: ['Gate se entry sirf flow99 code se hoti hai.'] },
    { id: 'rakshak-2', name: 'Rakshak-2', job: 'Plaza Guard', guard: true, color: [0.8, 0.1, 0.1], x: 8, z: 0, pitch: 0.7, rate: 0.9, story: 'Main plaza par duty karta hoon.', lines: ['Plaza surakshit hai, aaram se ghumo.'] },
    { id: 'rakshak-3', name: 'Rakshak-3', job: 'Park Guard', guard: true, color: [0.8, 0.1, 0.1], x: -28, z: -14, pitch: 0.7, rate: 0.9, story: 'Main park ki dekhbhal karta hoon.', lines: ['Park me koi pareshani nahi honi chahiye.'] },
    { id: 'rakshak-4', name: 'Rakshak-4', job: 'Bridge Guard', guard: true, color: [0.8, 0.1, 0.1], x: 24, z: -10, pitch: 0.7, rate: 0.9, story: 'Main bridge par duty karta hoon.', lines: ['Bridge par aaram se chalo.'] },
    { id: 'rakshak-5', name: 'Rakshak-5', job: 'Bazaar Guard', guard: true, color: [0.8, 0.1, 0.1], x: -22, z: 18, pitch: 0.7, rate: 0.9, story: 'Main bazaar ki suraksha karta hoon.', lines: ['Bazaar me sab demo hai, chori ka sawaal hi nahi.'] },
    { id: 'rakshak-6', name: 'Rakshak-6', job: 'Garden Guard', guard: true, color: [0.8, 0.1, 0.1], x: 24, z: 20, pitch: 0.7, rate: 0.9, story: 'Main garden par nazar rakhta hoon.', lines: ['Garden shaant hai.'] },
    { id: 'rakshak-7', name: 'Rakshak-7', job: 'Tower Guard', guard: true, color: [0.8, 0.1, 0.1], x: 4, z: -30, pitch: 0.7, rate: 0.9, story: 'Main tower ki suraksha karta hoon.', lines: ['Tower me koi bina permission nahi jata.'] },
    { id: 'rakshak-8', name: 'Rakshak-8', job: 'Castle Captain', guard: true, color: [0.9, 0.6, 0.0], x: 0, z: 30, pitch: 0.6, rate: 0.9, story: 'Main castle ka captain hoon. Rogue unit ko main hi pakadta hoon.', lines: ['Koi rogue unit bhag nahi sakta. Guards use containment se wapas le aate hain.'] }
  ],
  quests: [
    { id: 'q1', title: 'Gate Entry', desc: 'Gate se entry karo', done: false },
    { id: 'q2', title: '7 Zones Ghumo', desc: 'Saare 7 zones visit karo', done: false },
    { id: 'q3', title: 'Robo-Prime se Baat', desc: 'Robo-Prime ke paas jao aur baat karo', done: false },
    { id: 'q4', title: 'WhatsApp Demo Dekho', desc: 'Demo dukaan me auto-reply dekho', done: false },
    { id: 'q5', title: 'Secret Room Dhoondho', desc: 'Castle ke peeche secret room kholo', done: false }
  ],
  sideQuests: [
    { id: 's1', title: 'Boat Sair', desc: 'Nadi me boat par baitho' },
    { id: 's2', title: 'Fishing Demo', desc: 'Fishing button se demo catch karo' },
    { id: 's3', title: 'Photo Mode', desc: 'Robo selfie lo' }
  ],
  dailyQuests: [
    { id: 'd1', title: 'Daily: Guard se Milo', desc: 'Kisi guard se baat karo' }
  ]
};
window.VW.emotionFor = function (hour, weather) {
  if (weather === 'rain') return 'caring';
  if (hour < 10) return 'friendly';
  if (hour >= 20 || hour < 6) return 'alert';
  return 'serious';
};
