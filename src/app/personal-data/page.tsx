export const metadata = { title: 'Согласие на обработку персональных данных — АвтоЗапчасти' }

const S = {
  h2: { fontSize: 15, fontWeight: 700, color: '#0F2744', marginTop: 28, marginBottom: 8 } as const,
  p:  { fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 10 } as const,
  ul: { fontSize: 14, color: '#374151', lineHeight: 1.75, paddingLeft: 20, marginBottom: 10 } as const,
}

export default function PersonalDataPage() {
  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ background: '#0F2744', borderRadius: '20px 20px 0 0', padding: '32px 40px 24px' }}>
          <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>Документы</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>Согласие на обработку персональных данных</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>При оформлении заказа на сайте · ООО «АвтоЗапчасти»</p>
        </div>

        <div style={{ background: 'white', borderRadius: '0 0 20px 20px', padding: '32px 40px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

          <p style={S.p}>Настоящим, нажимая кнопку «Оформить заказ», «Отправить заявку» или «Зарегистрироваться» (далее — «Акцепт»), я выражаю своё <strong>добровольное, конкретное, осознанное и однозначное согласие</strong> ООО «АвтоЗапчасти», ОГРН 0000000000000, ИНН 0000000000, адрес: г. Москва (далее — «Оператор») на обработку моих персональных данных.</p>

          <h2 style={S.h2}>Состав персональных данных</h2>
          <ul style={S.ul}>
            <li>ФИО;</li>
            <li>номер телефона;</li>
            <li>адрес электронной почты;</li>
            <li>адрес доставки;</li>
            <li>данные для оплаты (без сохранения номеров карт).</li>
          </ul>

          <h2 style={S.h2}>Цели обработки</h2>
          <ul style={S.ul}>
            <li>Идентификация и регистрация на Сайте;</li>
            <li>оформление, подтверждение и исполнение Заказа;</li>
            <li>организация доставки Товара;</li>
            <li>обработка платежей;</li>
            <li>связь по вопросам Заказа (телефон, email, мессенджеры);</li>
            <li>формирование истории заказов в Личном кабинете;</li>
            <li>направление сервисных уведомлений по Заказу;</li>
            <li>предотвращение мошенничества.</li>
          </ul>

          <h2 style={S.h2}>Действия с персональными данными</h2>
          <p style={S.p}>Сбор, запись, систематизация, накопление, хранение, уточнение, использование, передача (предоставление доступа), обезличивание, удаление, уничтожение ПДн с использованием средств автоматизации.</p>

          <h2 style={S.h2}>Передача третьим лицам</h2>
          <ul style={S.ul}>
            <li>платёжным организациям и банкам (для оплаты);</li>
            <li>службам доставки (СДЭК и др.);</li>
            <li>CRM-системам и сервисам телефонии (для обработки заявок);</li>
            <li>в объёме, необходимом для исполнения Заказа.</li>
          </ul>

          <h2 style={S.h2}>Срок действия согласия</h2>
          <p style={S.p}>До исполнения Заказа и истечения сроков исковой давности (3 года) или до отзыва согласия.</p>

          <h2 style={S.h2}>Отзыв согласия</h2>
          <p style={S.p}>Письменным уведомлением на email: <a href="mailto:info@example.ru" style={{ color: '#FF6B00' }}>info@example.ru</a> или почтовым отправлением по адресу Оператора. Срок ответа — 30 дней.</p>

          <p style={{ ...S.p, marginTop: 24, padding: '16px 20px', background: '#F0F2F5', borderRadius: 12, borderLeft: '4px solid #FF6B00' }}>
            Я ознакомлен(а) с <a href="/privacy" style={{ color: '#FF6B00' }}>Политикой конфиденциальности</a>. Дата акцепта фиксируется автоматически при нажатии соответствующей кнопки на Сайте.
          </p>

          <h2 style={S.h2}>Реквизиты Оператора</h2>
          <p style={S.p}>ООО «АвтоЗапчасти» · ОГРН 0000000000000 · ИНН 0000000000<br />
          Email: <a href="mailto:info@example.ru" style={{ color: '#FF6B00' }}>info@example.ru</a> · Тел.: <a href="tel:+70000000000" style={{ color: '#FF6B00' }}>+7 (000) 000-00-00</a></p>

        </div>
      </div>
    </div>
  )
}
