import React, { useState, useMemo } from "react";

// Все цифры взяты из ранее согласованной оценки.
// low = стартовая (местная студия / сжатый скоуп), high = дорогая (полный объём с запасом).
const PHASES = [
  {
    id: "p1",
    title: "Фаза 1 — MVP (рабочее ядро)",
    subtitle: "Без этого система не запускается",
    accent: "#4f46e5",
    blocks: [
      { id: "b0", name: "Аналитика, ТЗ, схема БД, дизайн-макеты", q: "1,2,4,20,32", low: 4000, high: 7000, dLow: 15, dHigh: 20, def: true },
      { id: "b1", name: "Каркас Laravel + аутентификация + RBAC + категории дилеров", q: "7,8,9", low: 3000, high: 5500, dLow: 12, dHigh: 16, def: true },
      { id: "b2", name: "Номенклатура + мультивалюта (CNY/KZT) + прайсы по категориям", q: "10,12,13", low: 3500, high: 6500, dLow: 15, dHigh: 20, def: true },
      { id: "b3", name: "Закупочно-импортный контур + landed cost + приёмка", q: "11,18", low: 4500, high: 8000, dLow: 18, dHigh: 24, def: true },
      { id: "b4", name: "Склад: остатки, резервирование, движения", q: "17,19", low: 3000, high: 5500, dLow: 12, dHigh: 16, def: true },
      { id: "b5", name: "Калькулятор изделий", q: "1,3,6", low: 4500, high: 9000, dLow: 18, dHigh: 26, def: true, engine: true },
      { id: "b6", name: "Расчёты → заказы покупателя + статусы (workflow)", q: "20,21,22", low: 3500, high: 6500, dLow: 14, dHigh: 18, def: true },
      { id: "b7", name: "Генерация документов (КП/спец — PDF, договор/счёт — шаблоны)", q: "14,15,16", low: 2500, high: 5000, dLow: 10, dHigh: 15, def: true },
      { id: "b8", name: "Финансы: оплаты + кредитные лимиты/задолженность", q: "23,24", low: 2000, high: 4000, dLow: 8, dHigh: 12, def: true },
      { id: "b9", name: "Отчёты (задолженность, остатки, продажи, договоры)", q: "Отчёты", low: 2500, high: 5000, dLow: 10, dHigh: 15, def: true },
      { id: "b10", name: "Интеграция с 1С (ежедневная выгрузка файлом)", q: "25,26,27,28", low: 2000, high: 4500, dLow: 8, dHigh: 12, def: true },
      { id: "b11", name: "Тестирование, развёртывание, обучение, гарантия", q: "29,30,31", low: 4000, high: 7000, dLow: 18, dHigh: 25, def: true },
      { id: "b12", name: "Управление проектом (PM, координация, демо)", q: "33", low: 3000, high: 6000, dLow: 10, dHigh: 18, def: true },
    ],
  },
  {
    id: "p2",
    title: "Фаза 2 — Расширение",
    subtitle: "После запуска ядра, по мере роста",
    accent: "#0891b2",
    blocks: [
      { id: "c1", name: "Субдилеры (многоуровневая сеть, права, цены)", q: "7", low: 4000, high: 7000, dLow: 12, dHigh: 18 },
      { id: "c2", name: "Встраиваемый JS-калькулятор на сайты дилеров (виджет)", q: "6", low: 5000, high: 9000, dLow: 15, dHigh: 22 },
      { id: "c3", name: "Автозапуск заказов дилером + кредитные линии", q: "21", low: 3000, high: 6000, dLow: 10, dHigh: 15 },
      { id: "c4", name: "Запись на отгрузку по слотам (расписание склада)", q: "22", low: 2500, high: 5000, dLow: 8, dHigh: 12 },
      { id: "c5", name: "Расширенные отчёты и бонусы", q: "—", low: 3000, high: 6000, dLow: 10, dHigh: 15 },
      { id: "c6", name: "Мультиязычность (казахский)", q: "30", low: 3000, high: 6000, dLow: 10, dHigh: 14 },
      { id: "c7", name: "B2C-витрина (розничный магазин) — опционально", q: "5", low: 4500, high: 6000, dLow: 15, dHigh: 22 },
    ],
  },
  {
    id: "p3",
    title: "Фаза 3 — Тяжёлые блоки",
    subtitle: "Если войдут в скоуп",
    accent: "#9333ea",
    blocks: [
      { id: "d1", name: "Рекламации с фотофиксацией", q: "4", low: 5000, high: 9000, dLow: 15, dHigh: 22 },
      { id: "d2", name: "Фотоконтроль монтажа (роль «Мастер монтажа», оценка)", q: "4", low: 6000, high: 11000, dLow: 18, dHigh: 26 },
      { id: "d3", name: "Воронка замеров с автоподбором монтажников", q: "4", low: 6000, high: 12000, dLow: 18, dHigh: 28 },
      { id: "d4", name: "СДО — система обучения (видео, тесты)", q: "4", low: 6000, high: 12000, dLow: 18, dHigh: 28 },
      { id: "d5", name: "Строительные проекты / домокомплекты", q: "4", low: 7000, high: 16000, dLow: 22, dHigh: 35 },
    ],
  },
];

// Альтернатива по калькулятору: параметрический движок вместо калькулятора по SKU
const ENGINE = { low: 9000, high: 18000, dLow: 35, dHigh: 60 };

const fmt = (n) => "$" + n.toLocaleString("ru-RU");

export default function App() {
  const initial = {};
  PHASES.forEach((p) => p.blocks.forEach((b) => (initial[b.id] = !!b.def)));
  const [checked, setChecked] = useState(initial);
  const [engineMode, setEngineMode] = useState(false); // false = SKU-калькулятор, true = движок

  const toggle = (id) => setChecked((s) => ({ ...s, [id]: !s[id] }));
  const setPhase = (phase, val) =>
    setChecked((s) => {
      const n = { ...s };
      phase.blocks.forEach((b) => (n[b.id] = val));
      return n;
    });

  const blockVals = (b) => {
    if (b.engine && engineMode) return ENGINE;
    return { low: b.low, high: b.high, dLow: b.dLow, dHigh: b.dHigh };
  };

  const totals = useMemo(() => {
    let low = 0, high = 0, dLow = 0, dHigh = 0, count = 0;
    PHASES.forEach((p) =>
      p.blocks.forEach((b) => {
        if (checked[b.id]) {
          const v = blockVals(b);
          low += v.low; high += v.high; dLow += v.dLow; dHigh += v.dHigh; count++;
        }
      })
    );
    // Календарь ≈ человеко-дни с учётом параллельной работы команды ~2.4 чел., 5-дн. неделя
    const team = 2.4;
    const moLow = dLow / team / 22;
    const moHigh = dHigh / team / 22;
    return { low, high, dLow, dHigh, count, moLow, moHigh };
  }, [checked, engineMode]);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, sans-serif", color: "#0f172a", paddingBottom: 180 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 14px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 2px" }}>DoorNur ERP — калькулятор оценки</h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px" }}>
          Отмечай блоки — стоимость и сроки внизу пересчитываются. Две колонки: <b>стартовая</b> и <b>дорогая</b> оценка. Цены ориентировочные, для подрядчика-компании, в USD.
        </p>

        {/* Переключатель конфигуратора */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Тип конфигуратора (влияет на блок «Калькулятор изделий»)</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setEngineMode(false)}
              style={tabStyle(!engineMode)}
            >
              Калькулятор по SKU<br /><span style={{ fontSize: 11, opacity: 0.8 }}>готовое из Китая · дешевле</span>
            </button>
            <button
              onClick={() => setEngineMode(true)}
              style={tabStyle(engineMode)}
            >
              Движок на правилах<br /><span style={{ fontSize: 11, opacity: 0.8 }}>сборка под размер · дороже</span>
            </button>
          </div>
        </div>

        {PHASES.map((p) => {
          const all = p.blocks.every((b) => checked[b.id]);
          return (
            <div key={p.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: p.accent }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{p.subtitle}</div>
                </div>
                <button
                  onClick={() => setPhase(p, !all)}
                  style={{ fontSize: 12, color: p.accent, background: "transparent", border: "1px solid " + p.accent, borderRadius: 8, padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {all ? "Снять все" : "Выбрать все"}
                </button>
              </div>

              {p.blocks.map((b) => {
                const on = checked[b.id];
                const v = blockVals(b);
                return (
                  <div
                    key={b.id}
                    onClick={() => toggle(b.id)}
                    style={{
                      display: "flex", gap: 10, alignItems: "flex-start",
                      background: on ? "#fff" : "#f8fafc",
                      border: "1px solid " + (on ? p.accent + "55" : "#e2e8f0"),
                      borderLeft: "4px solid " + (on ? p.accent : "#e2e8f0"),
                      borderRadius: 10, padding: "10px 12px", marginBottom: 8, cursor: "pointer",
                      transition: "all .12s",
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: "2px solid " + (on ? p.accent : "#cbd5e1"),
                      background: on ? p.accent : "#fff",
                      color: "#fff", fontSize: 13, lineHeight: "16px", textAlign: "center", fontWeight: 700,
                    }}>{on ? "✓" : ""}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>
                        {b.name}
                        {b.engine && engineMode && <span style={{ color: "#9333ea", fontWeight: 700 }}> · движок</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>вопросы брифа: {b.q}</div>
                      <div style={{ fontSize: 12.5, color: "#475569", marginTop: 4 }}>
                        <b>{fmt(v.low)} – {fmt(v.high)}</b>
                        <span style={{ color: "#94a3b8" }}>  ·  {v.dLow}–{v.dHigh} чел-дней</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
          Календарный срок ≈ человеко-дни ÷ команда (~2,4 чел.) — не линейная сумма, блоки идут параллельно. Цены — рамка для сверки с реальным подрядчиком, не КП.
        </p>
      </div>

      {/* Sticky summary */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#0f172a", color: "#fff", padding: "12px 14px",
        boxShadow: "0 -4px 20px rgba(0,0,0,.25)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            Выбрано блоков: <b style={{ color: "#fff" }}>{totals.count}</b>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={sumCard("#1e293b")}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>СТАРТОВАЯ</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80" }}>{fmt(totals.low)}</div>
            </div>
            <div style={sumCard("#1e293b")}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>ДОРОГАЯ</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24" }}>{fmt(totals.high)}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span>⏱ {totals.dLow}–{totals.dHigh} чел-дней</span>
            <span>📅 ≈ {totals.moLow.toFixed(1)}–{totals.moHigh.toFixed(1)} мес.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function tabStyle(active) {
  return {
    flex: 1, padding: "8px 6px", borderRadius: 8, cursor: "pointer",
    border: "1px solid " + (active ? "#4f46e5" : "#e2e8f0"),
    background: active ? "#eef2ff" : "#fff",
    color: active ? "#4f46e5" : "#64748b",
    fontWeight: 700, fontSize: 12.5, lineHeight: 1.3, textAlign: "center",
  };
}
function sumCard(bg) {
  return { flex: 1, background: bg, borderRadius: 10, padding: "8px 12px" };
}
