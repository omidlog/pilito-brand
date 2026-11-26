# Bir yapay zekâ asistanını markanıza bağlayın (sahip rehberi)

Diğer diller: [English](AGENT_ONBOARDING.md) · [فارسی](AGENT_ONBOARDING.fa.md)

Bu rehber marka sahibi içindir. Programlama bilmeniz gerekmez. Her komutu sırayla bir terminale kopyalarsınız. Sonunda
bir yapay zekâ asistanı (örneğin Claude Code) onaylanmış marka bilgilerinizi yalnızca **okuyabilir**, fazlasını değil.
Onu istediğiniz zaman kapatabilirsiniz.

Aşağıdaki Brand OS komutları otomatik olarak test edilir (`tests/fresh-agent-setup.test.ts`); `claude mcp` ve `read -rs`
adımları Claude Code ve kabuk komutlarıdır, test bunları çalıştırmaz. Teknik başvuru:
[AI_CONNECTORS.md](AI_CONNECTORS.md).

## Ne elde edersiniz, ne etmezsiniz

- Asistan yalnızca **onaylanmış** bilgileri okur ve yalnızca "profilinin" izin verdiği marka bölümünü.
- Asistan onaylayamaz, yayımlayamaz, bilgileri değiştiremez, anahtar oluşturamaz ve kısıtlı değerleri (para, bütçe, özel notlar) göremez.
- Her şey kendi bilgisayarınızda çalışır. Web sitesi girişi ve bulut sunucusu yoktur. Brand Studio salt okunur bir
  görüntüleyici olarak kalır; anahtar oluşturamaz, asistan bağlayamaz.
- Barındırılan (çevrimiçi) bağlantı yapılmadı. Bkz. [AGENT_ONBOARDING_HOSTED.md](AGENT_ONBOARDING_HOSTED.md).

## Burada kullanılan kelimeler

- **Terminal**: komut yazdığınız pencere (macOS ve Linux: Terminal; Windows: WSL veya Git Bash).
- **Marka klasörü**: bilgisayarınızdaki marka deponuzun klasörü.
- **Onay sırrı (approval secret)**: `brand/.private/approval-secret` konumundaki özel parola dosyası. İşlemi *sizin*, yani sahibin yaptığını kanıtlar. Asla paylaşmayın.
- **Asistan belirteci (agent token)**: tek bir asistanın anahtarı. `bos_at_` ile başlar ve yalnızca bir kez gösterilir. Parola gibi davranın.
- **Profil**: belirtecin neyi okuyabileceği; örneğin `design` (marka görünümü ve sesi) veya `content-read` (gönderiler ve içerik planları).

## Başlamadan önce (bir kez)

1. Node.js 22 veya üstü ve Claude Code kurulu olmalı.
2. **Marka klasöründe** bir terminal açın ve araçları kurun:

   ```sh
   npm install
   ```

## Adım 1. Onay sırrınızı oluşturun (bir kez)

```sh
npm run -s brand:doctor -- --create-approval-secret
```

`Approval secret is at brand/.private/approval-secret` mesajını görmelisiniz. Sırrın kendisi asla yazdırılmaz. Dosya
zaten varsa korunur. Doctor düzeltilecek başka şeyler de listeleyebilir; bu rehber için yalnızca onay sırrı önemlidir.

## Adım 2. Bir asistan için belirteç oluşturun

İşe yeten en küçük profili seçin. Görsel işlerin çoğu `design`, gönderiler `content-read` kullanır.

```sh
npm run -s brand:agent-token -- issue --profile design --label "claude-code design" < brand/.private/approval-secret
```

`< brand/.private/approval-secret` kısmı sırrınızı yazmadan ve göstermeden komuta verir. Yazdırılan son satır
belirteçtir (`bos_at_…`). Şimdi kopyalayın: yalnızca bir kez gösterilir. Sohbete, e-postaya, istem metnine veya depodaki
herhangi bir dosyaya yapıştırmayın.

## Adım 3. Asistanı bağlayın (Claude Code)

Bu üç satırı marka klasöründe çalıştırın. İlk satır belirteci yapıştırmanızı bekler; yapıştırırken hiçbir şey görünmez.
Enter'a basın.

```sh
read -rs BOS_TOKEN
claude mcp add brand-os --scope local -e BRAND_OS_AGENT_TOKEN="$BOS_TOKEN" -- npm run -s mcp:serve
unset BOS_TOKEN
```

Bu, belirteci yalnızca bu klasör için Claude Code'un kendi ayarlarına kaydeder (`--scope local`). Depoya yazılmaz.
Belirteci asla depoya eklenen bir `.mcp.json` dosyasına koymayın.

## Adım 4. Çalıştığını kontrol edin

Terminalde hızlı kontrol (isteğe bağlı); sorulduğunda belirteci yine yapıştırın:

```sh
read -rs BOS_TOKEN
BRAND_OS_AGENT_TOKEN="$BOS_TOKEN" npm run -s brand:query -- --tool get_brand_status
unset BOS_TOKEN
```

`"status": "approved"` görmelisiniz. Sonra Claude Code içinde:

1. `claude mcp list` çalıştırın. `brand-os` bağlı (connected) görünmelidir.
2. Claude Code'u marka klasöründe başlatın ve sorun: *"brand-os aracı get_brand_status'u kullan ve sonucu söyle."*
3. Gerçek bir iş isteyin, örneğin *"Bu marka için on Instagram gönderisi hazırla."* Asistan `task_context` aracını bir
   kez çağırmalı ve size yalnızca eksik bilgileri sormalıdır.

Asistan `denied` derse belirteç olmadan başlatılmıştır: Adım 3'ü tekrarlayın ve Claude Code'u yeniden başlatın.

## Adım 5. Asistanın yapamadıkları (ve bunu nasıl görürsünüz)

- Onaylayamaz veya yayımlayamaz: bir asistan belirteci ayarlıyken `brand:approve` ve `brand:publish` çalışmayı reddeder.
- Belirteç oluşturamaz, listeleyemez veya iptal edemez: bu komutlar onay sırrınızı ister.
- Profilinin dışını okuyamaz; kısıtlı değerler `withheld` (gizlendi) olarak döner.

Dürüst bir sınır: bilgisayarınızda her komutu çalıştırmasına izin verilen bir asistan `brand/.private/` klasörünü
kendisi açabilir. Asistanın o klasörü okumasına veya `brand:agent-token`, `brand:approve` ya da `brand:publish`
çalıştırmasına izin vermeyin. Claude Code bunun için izin istediğinde hayır deyin.

## Adım 6. Asistanı kapatın (iptal)

Belirteçlerinizi görün:

```sh
npm run -s brand:agent-token -- list < brand/.private/approval-secret
```

Birini kimliğiyle iptal edin (`agt_` ile başlar):

```sh
npm run -s brand:agent-token -- revoke --id agt_… < brand/.private/approval-secret
claude mcp remove brand-os --scope local
```

Sonra Claude Code'u kapatıp yeniden başlatın. İptal edilen belirteç, sunucu bir sonraki başlatılışında çalışmaz; daha
zayıf bir misafir moduna düşmez, sunucu hiç başlamaz.

Bir belirteç sızmış olabilirse (bir yere yapıştırdıysanız) hemen iptal edin ve yenisini oluşturun.

## Diğer uygulamalar: Claude Desktop, Cowork, ChatGPT, Grok, Claude Projects

- **Claude Desktop veya Cowork** aynı yerel sunucuyu başlatabilir. Belirteci `env` içinde olan bir `brand-os` girdisi
  ekleyin (örnek: [AI_CONNECTORS.md](AI_CONNECTORS.md#claude-desktop--cowork-via-local-mcp)): marka deposunda
  `node /path/to/brand/.brand-os/engine/brand-os.mjs mcp`, şablonda `npm run -s mcp:serve`.
- **ChatGPT, Grok veya Claude.ai Projects** onu başlatamaz. Salt okunur bir paket dışa aktarın ve dosyalarını proje
  bilgisi olarak yükleyin: `npm run brand:pack -- --profile content-read --lang tr`. Paket yalnızca onaylı bağlamı
  içerir, yüklemek onu o ürünle paylaşır ve eskir: bir şeyi onayladıktan sonra yeniden dışa aktarın.

## İyi alışkanlıklar

- Her asistan ve her iş için bir belirteç. İkinci asistan ikinci belirteci alır; bir belirteci genişletmeyin.
- En küçük profili seçin. Tam profil listesi [AI_CONNECTORS.md](AI_CONNECTORS.md#profiles) içindedir.
- Artık kullanmadığınız belirteçleri iptal edin (`list`, `active` veya `revoked` gösterir).
- Asistanın her okuması değerler olmadan `brand/.private/access-log.jsonl` dosyasına kaydedilir.

## Bir şey ters giderse

| Gördüğünüz | Anlamı | Ne yapmalı |
|---|---|---|
| `Approval proof rejected` | Sır eşleşmedi veya yanlış klasördesiniz. | Terminali marka klasöründe açın ve komutu tekrarlayın. |
| `… was revoked. Refusing to start.` veya `… does not match an issued token` | Belirteç iptal edildi veya yanlış kopyalandı. | Yeni belirteç oluşturun (Adım 2) ve yeniden bağlayın (Adım 3). |
| Her yanıtta `denied` | Sunucu belirteç olmadan başladı. | Adım 3'ü tekrarlayın, sonra Claude Code'u yeniden başlatın. |
| `refuses to run while BRAND_OS_AGENT_TOKEN is set` | Sahip komutunu asistan belirteci olan bir kabukta çalıştırdınız. | Yeni bir terminal açın ve tekrar çalıştırın. |
| `has more than one hard link` veya `appears to be synced by Google Drive` | Marka klasörü bulutla eşitlenen bir klasörde; onay sırrınız buluta yükleniyor. | Klasörü taşıyın (örneğin `~/Code`), `npm run brand:doctor -- --fix-links`, ardından `npm run brand:doctor -- --rotate-approval-secret` çalıştırın. |

Onaylanacak çok şey mi var? `npm run brand:pending -- --lang tr` hepsini sade bir dille listeler ve tek bir kanıtla hepsini
onaylayan tek komutu yazar. Asistan bunu asla sizin yerinize çalıştırmaz.
