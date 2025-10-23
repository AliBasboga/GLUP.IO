# GLUP.IO

<p align="center">
  <img src="assets/icon.svg" alt="GLUP.IO logo" width="140" height="140">
</p>

> Havalı. Hızlı. Görsel.
> GLUP.IO — yaratıcı projeler, prototipler ve görsel deneyimler için minimal ama güçlü bir başlangıç noktası.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made by AliBasboga](https://img.shields.io/badge/made%20by-AliBasboga-ff69b4.svg)](https://github.com/AliBasboga)

GLUP.IO, modern web teknolojileriyle (WebGL / Canvas / JS Frameworkleri) oluşturulabilecek görsel projeler için hazırlanmış, esnek ve geliştirilmeye açık bir şablon/altyapıdır. Amacı: fikirlerinizi hızla prototiplemek, görsel denemeler yapmak ve projelerinize estetik bir başlangıç sunmaktır.

Özellikler
- Hafif ve performans odaklı yapı
- Modüler ve genişletilebilir mimari
- Hızlı prototipleme için örnek bileşenler
- Basit entegrasyon ile WebGL/Canvas tabanlı çizimler
- Geliştirici dostu dokümantasyon ve örnekler

Canlı Demo
- Demo: (varsa buraya ekleyin) — örnek: https://glup.io/demo

Hızlı Başlangıç

1. Depoyu klonlayın:
```bash
git clone https://github.com/AliBasboga/GLUP.IO.git
cd GLUP.IO
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn
```

3. Geliştirme sunucusunu çalıştırın:
```bash
npm run dev
# veya
yarn dev
```

Kullanım Örneği

- Basit bir sahne başlatmak için src klasöründeki örnekleri inceleyin.
- Yeni bir görsel modül eklemek için:
  1. src/components altına bir dosya oluşturun (ör. MyVisual.js)
  2. index veya app girişine import edip render edin.

Örnek kod (basit bir Canvas çizimi):
```js
// src/components/MyVisual.js
export default function MyVisual(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff3b3b';
  ctx.fillRect(20, 20, 120, 120);
}
```

Katkıda Bulunma
- Katkılar çok değerli! Yeni özellikler, hata düzeltmeleri ve geliştirme fikirleri için pull request açabilirsiniz.
- Lütfen önce bir issue açıp ne yapmak istediğinizi kısaca yazın. Büyük değişiklikler için tartışma başlatmak en doğrusu.

Lisans
- Bu proje MIT lisansı ile lisanslanmıştır — ayrıntılar için LICENSE dosyasına bakın.

İletişim
- Proje sahibi: @AliBasboga
- Her türlü soru, öneri veya işbirliği için issue açabilirsiniz.

Teşekkürler
- GLUP.IO'yu kullanmayı seçtiğiniz için teşekkürler — hadi projeyi havalı hale getirelim 🚀

Notlar / Gelecek Planları (opsiyonel)
- Şablon bileşen kütüphanesi
- Gerçek zamanlı işbirliği prototipi
- Örnek shader koleksiyonu