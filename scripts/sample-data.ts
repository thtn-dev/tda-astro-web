export interface SamplePhotoDef {
  filename: string;
  seed: string;
  width: number;
  height: number;
  caption: string;
  tags: string[];
  date: string;
}

export const SAMPLE_LIST: SamplePhotoDef[] = [
  // 1. Square & Soft Portraits (1:1)
  { filename: 'photo-01.jpg', seed: 'may-latte', width: 700, height: 700, caption: 'Tách matcha latte ấm áp đầu ngày 🍵', tags: ['matcha', 'morning', 'cozy'], date: '2026-03-01' },
  { filename: 'photo-02.jpg', seed: 'may-tulip', width: 750, height: 750, caption: 'Bó tulip hồng đón ánh nắng sớm 🌷', tags: ['tulip', 'flowers', 'pink'], date: '2026-03-02' },
  { filename: 'photo-03.jpg', seed: 'may-bakery', width: 800, height: 800, caption: 'Tiệm bánh nhỏ thơm lừng mùi vani 🥐', tags: ['croissant', 'bakery', 'sweets'], date: '2026-03-03' },
  { filename: 'photo-04.jpg', seed: 'may-cat', width: 720, height: 720, caption: 'Bé mèo lười sưởi nắng bên bậu cửa sổ 🐱', tags: ['cat', 'cozy', 'sunshine'], date: '2026-03-04' },
  { filename: 'photo-05.jpg', seed: 'may-tea', width: 700, height: 700, caption: 'Tách trà hoa cúc chiều dịu êm 🌼', tags: ['tea', 'chill', 'peaceful'], date: '2026-03-05' },
  { filename: 'photo-06.jpg', seed: 'may-cake', width: 760, height: 760, caption: 'Chiếc bánh dâu tây kem sữa ngọt ngào 🍓', tags: ['strawberry', 'cake', 'sweet'], date: '2026-03-06' },
  { filename: 'photo-07.jpg', seed: 'may-plant', width: 700, height: 700, caption: 'Chậu sen đá xanh mướt mầm xinh 🪴', tags: ['plants', 'green', 'succulent'], date: '2026-03-07' },
  { filename: 'photo-08.jpg', seed: 'may-journal', width: 780, height: 780, caption: 'Trang nhật ký dán sticker pastel 🎀', tags: ['journal', 'stickers', 'cute'], date: '2026-03-08' },
  { filename: 'photo-09.jpg', seed: 'may-candle', width: 720, height: 720, caption: 'Nến thơm mùi gỗ ấm và hoa nhài 🕯️', tags: ['candle', 'scent', 'relax'], date: '2026-03-09' },
  { filename: 'photo-10.jpg', seed: 'may-coffee', width: 800, height: 800, caption: 'Ly cà phê kem béo một sáng thảnh thơi ☕', tags: ['coffee', 'cafe', 'gentle'], date: '2026-03-10' },
  { filename: 'photo-11.jpg', seed: 'may-knit', width: 700, height: 700, caption: 'Cuộn len màu phấn đan dở buổi chiều 🧶', tags: ['knitting', 'craft', 'hobby'], date: '2026-03-11' },
  { filename: 'photo-12.jpg', seed: 'may-macaron', width: 750, height: 750, caption: 'Hộp bánh macaron sắc màu xinh xắn 🍪', tags: ['macaron', 'pastel', 'yummy'], date: '2026-03-12' },

  // 2. Portrait (3:4 & 4:5)
  { filename: 'photo-13.jpg', seed: 'may-street-1', width: 600, height: 800, caption: 'Góc phố cũ rợp bóng cây xanh 🌿', tags: ['street', 'green', 'city'], date: '2026-03-13' },
  { filename: 'photo-14.jpg', seed: 'may-book-1', width: 600, height: 800, caption: 'Quyển sách đọc dở dưới ánh đèn vàng 📖', tags: ['book', 'reading', 'night'], date: '2026-03-14' },
  { filename: 'photo-15.jpg', seed: 'may-rose-1', width: 640, height: 800, caption: 'Những cánh hồng nhung e ấp trong sương 🌹', tags: ['rose', 'romantic', 'soft'], date: '2026-03-15' },
  { filename: 'photo-16.jpg', seed: 'may-window', width: 600, height: 750, caption: 'Ô cửa kính mờ hơi nước ngày mưa phùn 🌧️', tags: ['rain', 'window', 'mood'], date: '2026-03-16' },
  { filename: 'photo-17.jpg', seed: 'may-dessert', width: 640, height: 800, caption: 'Panna cotta mềm mịn sốt quả mọng 🍮', tags: ['dessert', 'berry', 'sweet'], date: '2026-03-17' },
  { filename: 'photo-18.jpg', seed: 'may-bicycle', width: 600, height: 800, caption: 'Chiếc xe đạp giỏ đầy hoa dại ven đường 🚲', tags: ['bike', 'vintage', 'wander'], date: '2026-03-18' },
  { filename: 'photo-19.jpg', seed: 'may-daisy', width: 640, height: 800, caption: 'Cúc hoạ mi trắng tinh khôi giữa phố 🌼', tags: ['daisy', 'white', 'pure'], date: '2026-03-19' },
  { filename: 'photo-20.jpg', seed: 'may-cafe-corner', width: 600, height: 750, caption: 'Góc bàn nhỏ thân thuộc nơi quán quen 🪑', tags: ['cafe', 'corner', 'chill'], date: '2026-03-20' },
  { filename: 'photo-21.jpg', seed: 'may-pottery', width: 600, height: 800, caption: 'Tự tay nặn một chiếc đĩa gốm mộc mạc 🏺', tags: ['pottery', 'craft', 'handmade'], date: '2026-03-21' },
  { filename: 'photo-22.jpg', seed: 'may-picnic', width: 640, height: 800, caption: 'Thảm picnic chiều chủ nhật ngập nắng 🧺', tags: ['picnic', 'weekend', 'happy'], date: '2026-03-22' },
  { filename: 'photo-23.jpg', seed: 'may-mirror', width: 600, height: 750, caption: 'Góc gương nhỏ phản chiếu nụ cười 🪞', tags: ['mirror', 'aesthetic', 'selfcare'], date: '2026-03-23' },
  { filename: 'photo-24.jpg', seed: 'may-sketch', width: 600, height: 800, caption: 'Bản vẽ màu nước còn ướt nét cọ 🎨', tags: ['art', 'watercolor', 'painting'], date: '2026-03-24' },

  // 3. Tall Portrait (2:3 & 9:16)
  { filename: 'photo-25.jpg', seed: 'may-tall-sunset', width: 600, height: 900, caption: 'Hoàng hôn nhuộm sắc tím mơ màng 🌆', tags: ['sunset', 'purple', 'twilight'], date: '2026-03-25' },
  { filename: 'photo-26.jpg', seed: 'may-tall-sky', width: 540, height: 960, caption: 'Đám mây hình trái tim trôi ngang trời ☁️', tags: ['clouds', 'heart', 'sky'], date: '2026-03-26' },
  { filename: 'photo-27.jpg', seed: 'may-tall-stairs', width: 600, height: 900, caption: 'Cầu thang xoắn ốc cổ điển tràn ngập nắng 🪜', tags: ['stairs', 'architecture', 'light'], date: '2026-03-27' },
  { filename: 'photo-28.jpg', seed: 'may-tall-shadow', width: 640, height: 960, caption: 'Bóng lá in trên bức tường vôi trắng 🍃', tags: ['shadow', 'minimal', 'aesthetic'], date: '2026-03-28' },
  { filename: 'photo-29.jpg', seed: 'may-tall-beach', width: 540, height: 960, caption: 'Bờ biển êm sóng vỗ về sớm bình minh 🌊', tags: ['sea', 'beach', 'morning'], date: '2026-03-29' },
  { filename: 'photo-30.jpg', seed: 'may-tall-forest', width: 600, height: 900, caption: 'Con đường mòn rợp bóng thông xanh 🌲', tags: ['nature', 'forest', 'calm'], date: '2026-03-30' },
  { filename: 'photo-31.jpg', seed: 'may-tall-curtain', width: 640, height: 960, caption: 'Tấm rèm voan trắng bay nhẹ theo gió 🎐', tags: ['breeze', 'soft', 'white'], date: '2026-03-31' },
  { filename: 'photo-32.jpg', seed: 'may-tall-guitar', width: 540, height: 960, caption: 'Cây đàn guitar gỗ tựa góc tường 🎸', tags: ['music', 'guitar', 'acoustic'], date: '2026-04-01' },
  { filename: 'photo-33.jpg', seed: 'may-tall-flowerstand', width: 600, height: 900, caption: 'Ghé tiệm hoa mua chút yêu thương 💐', tags: ['flowershop', 'blossom', 'sweet'], date: '2026-04-02' },
  { filename: 'photo-34.jpg', seed: 'may-tall-lighthouse', width: 540, height: 960, caption: 'Ngọn hải đăng đứng lặng giữa biển trời 🗼', tags: ['lighthouse', 'ocean', 'peace'], date: '2026-04-03' },
  { filename: 'photo-35.jpg', seed: 'may-tall-balcony', width: 600, height: 900, caption: 'Ban công nhỏ ngắm nhìn thành phố lên đèn 🌃', tags: ['citylights', 'night', 'balcony'], date: '2026-04-04' },
  { filename: 'photo-36.jpg', seed: 'may-tall-garden', width: 600, height: 900, caption: 'Lối nhỏ dẫn vào khu vườn cổ tích 🌸', tags: ['garden', 'fairy', 'flowers'], date: '2026-04-05' },

  // 4. Landscape (4:3 & 3:2)
  { filename: 'photo-37.jpg', seed: 'may-land-cafe', width: 800, height: 600, caption: 'Bữa brunch nhẹ nhàng cùng người thương 🥞', tags: ['brunch', 'pancake', 'weekend'], date: '2026-04-06' },
  { filename: 'photo-38.jpg', seed: 'may-land-desk', width: 900, height: 600, caption: 'Bàn làm việc ngăn nắp ấm cúng 💻', tags: ['workspace', 'desksetup', 'cozy'], date: '2026-04-07' },
  { filename: 'photo-39.jpg', seed: 'may-land-lake', width: 900, height: 600, caption: 'Mặt hồ phẳng lặng phản chiếu bầu trời xanh 🏞️', tags: ['lake', 'nature', 'reflections'], date: '2026-04-08' },
  { filename: 'photo-40.jpg', seed: 'may-land-park', width: 800, height: 600, caption: 'Thảm cỏ xanh công viên sớm mai 🍀', tags: ['park', 'fresh', 'morning'], date: '2026-04-09' },
  { filename: 'photo-41.jpg', seed: 'may-land-baking', width: 900, height: 600, caption: 'Mẻ bánh quy yến mạch vừa ra lò thơm phức 🍪', tags: ['cookies', 'baking', 'homemade'], date: '2026-04-10' },
  { filename: 'photo-42.jpg', seed: 'may-land-tea-table', width: 800, height: 600, caption: 'Bàn trà nhỏ bày biện ấm áp đón bạn thân 🫖', tags: ['teatime', 'friends', 'cozy'], date: '2026-04-11' },
  { filename: 'photo-43.jpg', seed: 'may-land-library', width: 900, height: 600, caption: 'Kệ sách gỗ phủ đầy những cuốn tiểu thuyết 📚', tags: ['books', 'library', 'silence'], date: '2026-04-12' },
  { filename: 'photo-44.jpg', seed: 'may-land-cottage', width: 800, height: 600, caption: 'Ngôi nhà nhỏ ven bìa rừng yên tĩnh 🏡', tags: ['cottage', 'peace', 'warmth'], date: '2026-04-13' },
  { filename: 'photo-45.jpg', seed: 'may-land-sunset-sea', width: 900, height: 600, caption: 'Mặt trời lặn chậm rãi trên mặt biển 🌅', tags: ['sunset', 'seaside', 'golden'], date: '2026-04-14' },
  { filename: 'photo-46.jpg', seed: 'may-land-train', width: 900, height: 600, caption: 'Chuyến tàu sớm đưa mình đi xa 🚂', tags: ['travel', 'train', 'journey'], date: '2026-04-15' },
  { filename: 'photo-47.jpg', seed: 'may-land-meadow', width: 800, height: 600, caption: 'Cánh đồng cỏ lau đung đưa trong gió chiều 🌾', tags: ['meadow', 'wind', 'autumn'], date: '2026-04-16' },
  { filename: 'photo-48.jpg', seed: 'may-land-art', width: 900, height: 600, caption: 'Góc phòng triển lãm tranh tĩnh lặng 🖼️', tags: ['gallery', 'art', 'museum'], date: '2026-04-17' },

  // 5. Wide & Cinematic (16:9 & Panoramas)
  { filename: 'photo-49.jpg', seed: 'may-wide-horizon', width: 960, height: 540, caption: 'Chân trời rực rỡ sắc cầu vồng sau cơn mưa 🌈', tags: ['rainbow', 'horizon', 'hope'], date: '2026-04-18' },
  { filename: 'photo-50.jpg', seed: 'may-wide-mountain', width: 960, height: 540, caption: 'Dãy núi trập trùng ẩn hiện giữa làn sương mây ⛰️', tags: ['mountains', 'fog', 'nature'], date: '2026-04-19' },
  { filename: 'photo-51.jpg', seed: 'may-wide-stars', width: 960, height: 540, caption: 'Bầu trời đêm đầy sao lấp lánh như ngàn điều ước ✨', tags: ['stars', 'nightsky', 'dream'], date: '2026-04-20' },
  { filename: 'photo-52.jpg', seed: 'may-wide-coastal', width: 960, height: 540, caption: 'Cung đường ven biển lộng gió 🌊', tags: ['roadtrip', 'coastal', 'freedom'], date: '2026-04-21' },
  { filename: 'photo-53.jpg', seed: 'may-wide-bridge', width: 960, height: 540, caption: 'Cây cầu gỗ bắc qua dòng suối nhỏ trong veo 🪵', tags: ['stream', 'bridge', 'peace'], date: '2026-04-22' },
  { filename: 'photo-54.jpg', seed: 'may-wide-sunflowers', width: 960, height: 540, caption: 'Vườn hoa hướng dương ngập tràn năng lượng 🌻', tags: ['sunflower', 'bright', 'energy'], date: '2026-04-23' },
  { filename: 'photo-55.jpg', seed: 'may-wide-fog', width: 960, height: 540, caption: 'Thung lũng ngập tràn sương sớm thơ mộng 🌫️', tags: ['valley', 'mist', 'calm'], date: '2026-04-24' },
  { filename: 'photo-56.jpg', seed: 'may-wide-autumn', width: 960, height: 540, caption: 'Hàng cây ngân hạnh lá vàng rực rỡ 🍂', tags: ['autumn', 'yellow', 'leaves'], date: '2026-04-25' },
  { filename: 'photo-57.jpg', seed: 'may-wide-camping', width: 960, height: 540, caption: 'Lều trại bên đống lửa sưởi ấm đêm lạnh ⛺', tags: ['camping', 'campfire', 'cozy'], date: '2026-04-26' },
  { filename: 'photo-58.jpg', seed: 'may-wide-flowerfield', width: 960, height: 540, caption: 'Cánh đồng hoa oải hương tím biếc bát ngát 🪻', tags: ['lavender', 'purple', 'field'], date: '2026-04-27' },
  { filename: 'photo-59.jpg', seed: 'may-wide-cloudsea', width: 960, height: 540, caption: 'Biển mây bồng bềnh lúc bình minh trên đỉnh núi ☁️', tags: ['clouds', 'sunrise', 'magical'], date: '2026-04-28' },
  { filename: 'photo-60.jpg', seed: 'may-wide-twilight', width: 960, height: 540, caption: 'Ánh chiều tà dần buông xuống con phố nhỏ 🌆', tags: ['twilight', 'evening', 'peaceful'], date: '2026-04-29' }
];

export const SAMPLE_MAP: Record<string, SamplePhotoDef> = {};
for (const s of SAMPLE_LIST) {
  const id = s.filename.replace(/\.[^.]+$/, '');
  SAMPLE_MAP[id] = s;
}
