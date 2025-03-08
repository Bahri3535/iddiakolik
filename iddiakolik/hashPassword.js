const bcrypt = require('bcryptjs');

async function hashPassword() {
    const password = 'BURAYA_YENİ_ŞİFRENİZİ_YAZIN'; // Bu kısmı değiştirin
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Hash\'lenmiş şifre:', hashedPassword);
}

hashPassword(); 