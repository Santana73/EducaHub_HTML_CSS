// EducaHub - Static Dashboard
// All six sections fully functional with localStorage persistence.

const LS = {
  xp: 'educahub-xp',
  coins: 'educahub-coins',
  streak: 'educahub-streak',
  lastVisit: 'educahub-last-visit',
  completed: 'educahub-completed-lessons',
  purchased: 'educahub-purchased-items',
  username: 'educahub-username',
  bio: 'educahub-bio',
  avatar: 'educahub-avatar',
  dark: 'educahub-darkmode',
  fontSize: 'educahub-fontsize',
  push: 'educahub-push',
  emailN: 'educahub-emailnotif',
  twoFA: 'educahub-2fa',
  publicProf: 'educahub-public',
  autoSave: 'educahub-autosave',
};

const XP_PER_LEVEL = 100;
const COINS_PER_LEVEL = 25;

const state = {
  xp: Number(localStorage.getItem(LS.xp) || 0),
  coins: Number(localStorage.getItem(LS.coins) || 0),
  streak: Number(localStorage.getItem(LS.streak) || 0),
  completed: JSON.parse(localStorage.getItem(LS.completed) || '[]'),
  purchased: JSON.parse(localStorage.getItem(LS.purchased) || '[]'),
  username: localStorage.getItem(LS.username) || 'Usuário',
  bio: localStorage.getItem(LS.bio) || 'Estudante apaixonado por tecnologia e meio ambiente 🌱',
  avatar: localStorage.getItem(LS.avatar) || '',
};

function save() {
  localStorage.setItem(LS.xp, state.xp);
  localStorage.setItem(LS.coins, state.coins);
  localStorage.setItem(LS.streak, state.streak);
  localStorage.setItem(LS.completed, JSON.stringify(state.completed));
  localStorage.setItem(LS.purchased, JSON.stringify(state.purchased));
  localStorage.setItem(LS.username, state.username);
  localStorage.setItem(LS.bio, state.bio);
  if (state.avatar) localStorage.setItem(LS.avatar, state.avatar); else localStorage.removeItem(LS.avatar);
  refreshTopbar();
}

function refreshTopbar() {
  document.getElementById('stat-streak').textContent = state.streak;
  document.getElementById('stat-xp').textContent = state.xp;
  document.getElementById('stat-coins').textContent = state.coins;
  document.getElementById('topbar-username').textContent = state.username;
  document.getElementById('topbar-avatar').textContent = (state.username || 'U').charAt(0).toUpperCase();
}

// Streak tracking on load
(function trackStreak() {
  const today = new Date().toDateString();
  const last = localStorage.getItem(LS.lastVisit);
  if (last !== today) {
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    if (last === yest.toDateString()) state.streak = (state.streak || 0) + 1;
    else state.streak = 1;
    localStorage.setItem(LS.lastVisit, today);
  }
})();

// Dark mode init
if (localStorage.getItem(LS.dark) === 'true') document.documentElement.classList.add('dark');
const fs = localStorage.getItem(LS.fontSize);
if (fs) document.documentElement.style.fontSize = fs === 'Pequeno' ? '14px' : fs === 'Grande' ? '18px' : '16px';

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// =============== TAB SWITCHING ===============
function switchTab(tab) {
  document.querySelectorAll('.dash-sidebar button, .bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
  renderViews[tab]();
}
document.querySelectorAll('.dash-sidebar button, .bottom-nav button').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// =============== TRILHA ===============
const sectionColors = ['s0', 's1', 's2'];
const bannerColors = ['b0', 'b1', 'b2'];
const offsetPattern = [0, 40, 60, 40, 0, -40, -60, -40];

function isCompleted(s, l) { return state.completed.includes(`${s}-${l}`); }
function isAvailable(s, l) {
  if (s === 0 && l === 0) return true;
  if (l > 0) return isCompleted(s, l - 1);
  const prev = LESSONS_SECTIONS[s - 1];
  return prev ? isCompleted(s - 1, prev.lessons.length - 1) : true;
}

function renderTrilha() {
  const container = document.getElementById('view-trilha');
  const total = LESSONS_SECTIONS.reduce((a, sec) => a + sec.lessons.length, 0);
  const done = state.completed.length;
  let html = `<div class="trilha animate-reveal-up">
    <div class="progress-block">
      <p class="label">Progresso geral</p>
      <p class="count">${done}/${total} lições</p>
      <div class="progress-bar"><div class="fill" style="width:${(done/total)*100}%"></div></div>
    </div>`;

  LESSONS_SECTIONS.forEach((sec, sIdx) => {
    const secDone = sec.lessons.filter((_, lIdx) => isCompleted(sIdx, lIdx)).length;
    html += `<div style="margin-bottom:1.5rem">
      <div class="section-banner ${bannerColors[sIdx % 3]}">
        <div>
          <p class="tag">Seção ${sIdx + 1}</p>
          <h2>${sec.title}</h2>
          <p class="sdesc">${sec.description}</p>
        </div>
        <div class="actions">
          <span class="pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>${secDone}/${sec.lessons.length}</span>
        </div>
      </div>
      <div class="lessons-zigzag">`;
    sec.lessons.forEach((lesson, lIdx) => {
      const completed = isCompleted(sIdx, lIdx);
      const available = isAvailable(sIdx, lIdx);
      const offset = offsetPattern[lIdx % offsetPattern.length];
      const cls = completed ? 'completed' : available ? sectionColors[sIdx % 3] : 'locked';
      const icon = completed
        ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"/></svg>'
        : available
        ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" style="margin-left:2px"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      const crown = available && !completed ? '<span class="crown"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg></span>' : '';
      html += `<div class="lesson-node" style="transform:translateX(${offset}px)">
        <button class="lesson-circle ${cls}" ${available ? '' : 'disabled'} data-s="${sIdx}" data-l="${lIdx}">${icon}${crown}</button>
        ${available ? `<button class="start-btn ${completed ? 'completed' : ''}" data-s="${sIdx}" data-l="${lIdx}">${completed ? 'REFAZER' : (sIdx===0&&lIdx===0?'COMEÇAR':'INICIAR')}</button>` : ''}
        <p class="lesson-title">${lesson.title}</p>
      </div>`;
    });
    html += `</div></div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
  container.querySelectorAll('[data-s]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = +btn.dataset.s, l = +btn.dataset.l;
      if (isAvailable(s, l)) startLesson(s, l);
    });
  });
}

// =============== LESSON / QUIZ ===============
function startLesson(sIdx, lIdx) {
  const lesson = LESSONS_SECTIONS[sIdx].lessons[lIdx];
  const root = document.getElementById('lesson-overlay-root');
  let qIdx = 0, hearts = 3, correct = 0, selected = null, checked = false;
  const total = lesson.questions.length;

  function render() {
    if (qIdx >= total || hearts <= 0) return finish();
    const q = lesson.questions[qIdx];
    const progress = (qIdx / total) * 100;
    root.innerHTML = `<div class="lesson-overlay">
      <div class="lesson-header">
        <button class="close" id="lesson-close"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div class="progress-wrap"><div class="fill" style="width:${progress}%"></div></div>
        <div class="hearts"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${hearts}</div>
      </div>
      <div class="quiz-card animate-reveal-up">
        <p class="cat">${q.category}</p>
        <h2 class="question">${q.question}</h2>
        <div class="options">
          ${q.options.map(o => `<button class="opt" data-v="${o.value}"><span class="letter">${o.value.toUpperCase()}</span>${o.label}</button>`).join('')}
        </div>
        <div class="quiz-actions"><button class="btn-check" id="check-btn" disabled>Verificar</button></div>
      </div>
    </div>`;
    document.getElementById('lesson-close').onclick = () => { root.innerHTML = ''; renderTrilha(); };
    root.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (checked) return;
      selected = b.dataset.v;
      root.querySelectorAll('.opt').forEach(x => x.classList.toggle('selected', x === b));
      document.getElementById('check-btn').disabled = false;
    });
    document.getElementById('check-btn').onclick = () => {
      if (checked) {
        qIdx++; selected = null; checked = false; render(); return;
      }
      checked = true;
      const isRight = selected === q.correct;
      root.querySelectorAll('.opt').forEach(b => {
        if (b.dataset.v === q.correct) b.classList.add('correct');
        else if (b.dataset.v === selected) b.classList.add('wrong');
      });
      if (isRight) correct++; else hearts--;
      document.getElementById('check-btn').textContent = qIdx + 1 >= total || hearts <= 0 ? 'Concluir' : 'Próxima';
    };
  }

  function finish() {
    const passed = hearts > 0 && correct >= Math.ceil(total * 0.6);
    const xpEarned = passed ? 20 + correct * 2 : 5;
    const coinsEarned = passed ? 10 : 2;
    if (passed) {
      const key = `${sIdx}-${lIdx}`;
      if (!state.completed.includes(key)) state.completed.push(key);
      const prevLevel = Math.floor(state.xp / XP_PER_LEVEL);
      state.xp += xpEarned;
      const newLevel = Math.floor(state.xp / XP_PER_LEVEL);
      const bonus = (newLevel - prevLevel) * COINS_PER_LEVEL;
      state.coins += coinsEarned + bonus;
      if (bonus) toast(`Subiu de nível! +${bonus} moedas`, 'success');
    } else {
      state.xp += xpEarned;
      state.coins += coinsEarned;
    }
    save();
    root.innerHTML = `<div class="lesson-overlay">
      <div class="lesson-result animate-reveal-up">
        <h2>${passed ? '🎉 Lição completa!' : '😕 Tente novamente'}</h2>
        <p style="color:hsl(var(--muted-foreground))">Acertou ${correct} de ${total} questões</p>
        <div class="reward">
          <span><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> +${xpEarned} XP</span>
          <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg> +${coinsEarned} moedas</span>
        </div>
        <button class="btn-check" id="finish-btn">Voltar à trilha</button>
      </div>
    </div>`;
    document.getElementById('finish-btn').onclick = () => { root.innerHTML = ''; renderTrilha(); };
  }
  render();
}

// =============== MATERIAL ===============
const MATERIAL = [
  { section: 'Seção 1 — Matemática Básica', cls: 'bg-prim10', lessons: [
    { title: 'Números e Representações', summary: 'Números inteiros, naturais e negativos e sua representação na reta numérica.', topics: ['Valor absoluto e comparação de números','Números naturais, inteiros e negativos','Localização e ordenação na reta numérica','Notação e leitura de números com sinal'] },
    { title: 'Adição e Subtração', summary: 'Algoritmos de soma com transporte e subtração com empréstimo, propriedades comutativa e associativa.', topics: ['Soma com reagrupamento (transporte)','Subtração com empréstimo','Propriedade comutativa: a+b = b+a','Propriedade associativa: (a+b)+c = a+(b+c)','Problemas do cotidiano'] },
    { title: 'Multiplicação e Divisão', summary: 'Tabuada, multiplicação por dois dígitos, divisão exata e com resto, propriedade distributiva.', topics: ['Tabuada do 1 ao 12','Multiplicação por dois dígitos','Divisão exata e com resto','Propriedade distributiva','Relação inversa: multiplicação ↔ divisão'] },
    { title: 'Ordem de Operações', summary: 'Parênteses, expoentes simples e a regra PEMDAS aplicada na resolução de expressões.', topics: ['Parênteses e colchetes','Expoentes simples (potências)','Regra PEMDAS/MDAS','Simplificação passo a passo','Expressões progressivas'] },
    { title: 'Propriedades dos Operadores', summary: 'Comutativa, associativa e distributiva aplicadas para facilitar cálculos.', topics: ['Propriedade comutativa na soma e multiplicação','Propriedade associativa','Propriedade distributiva na prática','Elemento neutro da adição e multiplicação','Reescrever expressões para simplificar'] },
    { title: 'Estimativa e Arredondamento', summary: 'Regras de arredondamento e uso de estimativas para verificação rápida de resultados.', topics: ['Regras de arredondamento','Arredondamento para dezena, centena e milhar','Casas decimais','Estimativa para checagem de cálculos','Erro absoluto aproximado'] },
    { title: 'Problemas Verbais Básicos', summary: 'Traduzir enunciados em operações matemáticas e resolver com estratégias organizadas.', topics: ['Identificar dados e incógnitas','Escolher a operação correta','Resolver passo a passo','Modelagem de situações cotidianas','Verificar a resposta'] },
    { title: 'Revisão e Mini-Projeto', summary: 'Revisão integrada com aplicação prática: elaborar um orçamento simples usando as habilidades aprendidas.', topics: ['Revisão de todas as operações','Arredondamento e estimativa','Projeto prático: orçamento mensal','Síntese de habilidades','Apresentação de solução'] },
  ]},
  { section: 'Seção 2 — Frações, Decimais e Porcentagens', cls: 'bg-sec10', lessons: [
    { title: 'Conceito de Fração', summary: 'Numerador, denominador, frações próprias, impróprias e equivalentes com representação visual.', topics: ['Numerador e denominador','Frações próprias e impróprias','Frações equivalentes','Simplificação de frações','Representação visual (modelos)'] },
    { title: 'Operações com Frações', summary: 'Soma, subtração com MMC, multiplicação e divisão de frações, simplificação e inverso multiplicativo.', topics: ['Soma e subtração com mesmo denominador','MMC para denominadores diferentes','Multiplicação de frações','Divisão (inverso multiplicativo)','Simplificação de resultados'] },
    { title: 'Decimais e Operações', summary: 'Leitura, escrita e operações com números decimais, conversão para frações.', topics: ['Leitura e escrita de decimais','Soma e subtração com alinhamento de casas','Multiplicação e divisão com decimais','Conversão decimal ↔ fração','Aplicações: dinheiro e medidas'] },
    { title: 'Conversões Fração ↔ Decimal ↔ Porcentagem', summary: 'Transformar entre as três representações e interpretar resultados em contextos variados.', topics: ['Fração para decimal (dividir)','Decimal para porcentagem (×100)','Porcentagem para fração','Tabela de conversões comuns','Problemas de interpretação'] },
    { title: 'Porcentagens Aplicadas', summary: 'Descontos, acréscimos e juros simples em situações práticas de finanças pessoais.', topics: ['Cálculo de desconto','Cálculo de acréscimo/aumento','Juros simples básicos','Variação percentual','Simulações de compras'] },
    { title: 'Problemas Combinados e Projeto', summary: 'Resolver casos reais integrando frações, decimais e porcentagens em um projeto prático.', topics: ['Integração dos três formatos','Receita ajustada por porções','Cálculo de custos com desconto','Verificação por conversões alternativas','Projeto prático com explicação'] },
  ]},
  { section: 'Seção 3 — Introdução à Álgebra', cls: 'bg-acc10', lessons: [
    { title: 'Conceito de Variável e Expressões', summary: 'Símbolos para números desconhecidos, escrever e avaliar expressões algébricas.', topics: ['O que é uma variável','Termos, coeficientes e constantes','Traduzir frases em expressões','Avaliar expressões substituindo valores','Expressões com mais de uma variável'] },
    { title: 'Simplificação de Expressões', summary: 'Combinar termos semelhantes e aplicar a propriedade distributiva em expressões algébricas.', topics: ['Termos semelhantes','Combinar termos semelhantes','Propriedade distributiva com variáveis','Expandir e simplificar','Expressões com parênteses aninhados'] },
    { title: 'Equações Lineares Simples', summary: 'Resolver equações do tipo ax + b = c usando operações inversas e verificação.', topics: ['Isolar a variável','Operações inversas','Verificação por substituição','Equações com adição/subtração','Equações com multiplicação/divisão'] },
    { title: 'Equações com Termos em Ambos os Lados', summary: 'Transpor termos, simplificar e resolver equações com variáveis nos dois lados.', topics: ['Transpor termos com variáveis','Simplificar ambos os lados','Manter a igualdade','Checagem final','Equações com parênteses'] },
    { title: 'Equações com Frações e Decimais', summary: 'Eliminar denominadores usando MMC e manipular equações com valores decimais.', topics: ['Multiplicar ambos os lados pelo MMC','Eliminar denominadores','Equações com decimais','Comparar métodos de resolução','Precisão nos cálculos'] },
    { title: 'Problemas Verbais — Modelagem', summary: 'Transformar enunciados do cotidiano em equações, resolver e interpretar a solução.', topics: ['Definir a variável','Montar a equação a partir do texto','Resolver e verificar','Interpretar a solução no contexto','Problemas com números consecutivos, idades, geometria'] },
    { title: 'Revisão e Mini-Projeto de Modelagem', summary: 'Projeto integrador: montar e resolver equações para um caso real, apresentando o raciocínio completo.', topics: ['Revisão de simplificação e resolução','Comparação de lojas/preços','Modelagem de problemas complexos','Apresentação do raciocínio','Rubrica: correção, método, clareza, verificação, aplicação'] },
  ]},
];

function renderMaterial() {
  const container = document.getElementById('view-material');
  let html = `<div class="material animate-reveal-up">
    <h2 class="title">Material Didático</h2>
    <p class="subtitle">Teoria, exemplos e exercícios complementares</p>`;
  MATERIAL.forEach((sec, sIdx) => {
    html += `<div class="sec">
      <div class="sec-head">
        <div class="ico ${sec.cls}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
        <h3>${sec.section}</h3>
      </div>`;
    sec.lessons.forEach((l, lIdx) => {
      html += `<div class="acc-item" data-key="${sIdx}-${lIdx}">
        <button class="acc-trigger">
          <span class="num">${lIdx + 1}</span>
          <span class="ttl">${l.title}</span>
          <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="acc-content">
          <p class="summary">${l.summary}</p>
          <h4>Tópicos abordados</h4>
          <ul>${l.topics.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
  container.querySelectorAll('.acc-trigger').forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));
}

// =============== CALCULADORA ===============
const calcButtons = [
  ['Deg','Rad','x!','(',')','%','AC'],
  ['Inv','sin','ln','7','8','9','÷'],
  ['π','cos','log','4','5','6','×'],
  ['e','tan','√','1','2','3','-'],
  ['Ans','EXP','xʸ','0','.','=','+'],
];
const calcState = { display: '0', mode: 'rad', ans: 0, history: [], showHist: false, base: '', waitingExp: false };
function factorial(n) { if (n<0||!Number.isInteger(n)) return NaN; let r=1; for(let i=2;i<=n;i++)r*=i; return r; }
function calcBtnClass(l, mode) {
  if (l === (mode === 'deg' ? 'Deg' : 'Rad')) return 'mode-on';
  if (l === 'AC') return 'ac';
  if (l === '=') return 'eq';
  if (['÷','×','+','-'].includes(l)) return '';
  if (['Deg','Rad','x!','(',')','%'].includes(l)) return 'fn2';
  if (['Inv','sin','cos','tan','ln','log','√','π','e','Ans','EXP','xʸ'].includes(l)) return 'fn';
  return '';
}
function calcEval() {
  try {
    let expr = calcState.display;
    if (calcState.waitingExp && calcState.base) {
      const r = Math.pow(parseFloat(calcState.base), parseFloat(expr));
      const s = Number.isFinite(r) ? String(parseFloat(r.toPrecision(12))) : 'Erro';
      calcState.history.push(`${calcState.base}^${expr} = ${s}`);
      calcState.display = s; calcState.ans = parseFloat(s)||0; calcState.waitingExp = false; calcState.base = ''; return;
    }
    expr = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/π/g,String(Math.PI)).replace(/e(?!xp)/g,String(Math.E));
    const r = Function(`"use strict"; return (${expr})`)();
    const s = Number.isFinite(r) ? String(parseFloat(Number(r).toPrecision(12))) : 'Erro';
    calcState.history.push(`${calcState.display} = ${s}`);
    calcState.display = s; calcState.ans = parseFloat(s) || 0;
  } catch { calcState.display = 'Erro'; }
}
function calcBtn(l) {
  const d = calcState.display;
  switch(l) {
    case 'AC': calcState.display='0'; calcState.waitingExp=false; calcState.base=''; break;
    case 'Deg': calcState.mode='deg'; break;
    case 'Rad': calcState.mode='rad'; break;
    case '=': calcEval(); break;
    case 'Ans': calcState.display = d==='0'?String(calcState.ans):d+String(calcState.ans); break;
    case 'sin': case 'cos': case 'tan': {
      const v = parseFloat(d); if(!isNaN(v)){const rad=calcState.mode==='deg'?v*Math.PI/180:v; const r=Math[l](rad); calcState.display=String(parseFloat(r.toPrecision(12)));} break;
    }
    case 'ln': { const v=parseFloat(d); calcState.display=(!isNaN(v)&&v>0)?String(parseFloat(Math.log(v).toPrecision(12))):'Erro'; break; }
    case 'log': { const v=parseFloat(d); calcState.display=(!isNaN(v)&&v>0)?String(parseFloat(Math.log10(v).toPrecision(12))):'Erro'; break; }
    case '√': { const v=parseFloat(d); calcState.display=(!isNaN(v)&&v>=0)?String(parseFloat(Math.sqrt(v).toPrecision(12))):'Erro'; break; }
    case 'x!': { const v=parseFloat(d); const r=factorial(v); calcState.display=isNaN(r)?'Erro':String(r); break; }
    case '%': { const v=parseFloat(d); if(!isNaN(v)) calcState.display=String(v/100); break; }
    case 'EXP': calcState.display = d==='0'?'1e':d+'e'; break;
    case 'xʸ': calcState.base=d; calcState.display='0'; calcState.waitingExp=true; break;
    case 'Inv': { const v=parseFloat(d); calcState.display=(!isNaN(v)&&v!==0)?String(parseFloat((1/v).toPrecision(12))):'Erro'; break; }
    case 'π': calcState.display = d==='0'?String(Math.PI):d+'*'+String(Math.PI); break;
    case 'e': calcState.display = d==='0'?String(Math.E):d+'*'+String(Math.E); break;
    case '(': case ')': calcState.display = d==='0'?l:d+l; break;
    default:
      if (['÷','×','+','-'].includes(l)) calcState.display = d+l;
      else calcState.display = (d==='0'||d==='Erro')?l:d+l;
  }
  renderCalc();
}
function renderCalc() {
  const c = document.getElementById('view-calculadora');
  c.innerHTML = `<div class="calc animate-reveal-up">
    <h2>Calculadora Científica</h2>
    <div class="calc-display">
      <button type="button" class="hist-btn" id="hist-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg></button>
      ${calcState.waitingExp ? `<div class="base">${calcState.base}^</div>` : ''}
      <div class="val">${calcState.display}</div>
    </div>
    ${calcState.showHist ? `<div class="calc-history">${calcState.history.length === 0 ? '<p class="empty">Sem histórico</p>' : calcState.history.map(h => `<div class="h">${h}</div>`).join('')}</div>` : ''}
    <div class="calc-mode"><span>${calcState.mode === 'deg' ? 'Graus' : 'Radianos'}</span></div>
    <div class="calc-grid">
      ${calcButtons.map(row => `<div class="calc-row">${row.map(l => `<button type="button" class="calc-btn ${calcBtnClass(l, calcState.mode)}" data-l="${l}">${l}</button>`).join('')}</div>`).join('')}
    </div>
  </div>`;
  document.getElementById('hist-btn').onclick = () => { calcState.showHist = !calcState.showHist; renderCalc(); };
  c.querySelectorAll('.calc-btn').forEach(b => b.onclick = () => calcBtn(b.dataset.l));
}

// =============== LOJA ===============
const SHOP_ITEMS = [
  { id:'avatar-rosa', name:'Avatar Rosa', price:50, cat:'perfil', visual:{type:'avatar',cls:'bg-pink',l:'R'} },
  { id:'avatar-roxo', name:'Avatar Roxo', price:50, cat:'perfil', visual:{type:'avatar',cls:'bg-purple',l:'P'} },
  { id:'avatar-verde', name:'Avatar Verde', price:50, cat:'perfil', visual:{type:'avatar',cls:'bg-emerald',l:'V'} },
  { id:'avatar-azul', name:'Avatar Azul', price:50, cat:'perfil', visual:{type:'avatar',cls:'bg-teal',l:'A'} },
  { id:'avatar-laranja', name:'Avatar Laranja', price:50, cat:'perfil', visual:{type:'avatar',cls:'bg-pink2',l:'L'} },
  { id:'avatar-dourado', name:'Avatar Dourado', price:50, cat:'perfil', visual:{type:'avatar',cls:'bg-yellow-bg',l:'D'} },
  { id:'tema-noturno', name:'Tema Noturno', price:150, cat:'skins', visual:{type:'theme',cls:'bg-grad-night',e:'🌙'} },
  { id:'tema-oceano', name:'Tema Oceano', price:150, cat:'skins', visual:{type:'theme',cls:'bg-grad-ocean',e:'🐋'} },
  { id:'tema-porsol', name:'Tema Pôr do Sol', price:150, cat:'skins', visual:{type:'theme',cls:'bg-grad-sunset',e:'🌅'} },
  { id:'tema-floresta', name:'Tema Floresta', price:200, cat:'skins', visual:{type:'theme',cls:'bg-grad-forest',e:'🌲'} },
  { id:'tema-arcoiris', name:'Tema Arco-íris', price:250, cat:'skins', visual:{type:'theme',cls:'bg-grad-rainbow',e:'🌈'} },
  { id:'dobro-xp', name:'Dobro de XP', price:250, cat:'powerups', visual:{type:'power',cls:'bg-orange-power',e:'⚡'} },
  { id:'protecao', name:'Proteção de Ofensiva', price:200, cat:'powerups', visual:{type:'power',cls:'bg-teal-power',e:'🛡️'} },
  { id:'multi-2x', name:'Multiplicador 2x', price:200, cat:'powerups', visual:{type:'power',cls:'bg-orange-power2',e:'✨'} },
  { id:'super-estrela', name:'Super Estrela', price:300, cat:'powerups', visual:{type:'power',cls:'bg-yellow-power',e:'⭐'} },
];
const lojaState = { tab: 'todos' };
function renderLoja() {
  const c = document.getElementById('view-loja');
  const tabs = [['todos','Todos'],['perfil','Fotos de Perfil'],['skins','Skins/Temas'],['powerups','Power-ups']];
  const filtered = lojaState.tab === 'todos' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.cat === lojaState.tab);
  c.innerHTML = `<div class="loja animate-reveal-up">
    <h2>Loja EducaHub</h2>
    <p class="desc">Use suas moedas para personalizar seu perfil e ganhar power-ups</p>
    <p class="coins-pill"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg> ${state.coins} moedas</span></p>
    <div class="loja-tabs">${tabs.map(([id,l]) => `<button class="${lojaState.tab===id?'active':''}" data-tab="${id}">${l}</button>`).join('')}</div>
    <div class="loja-grid">
      ${filtered.map(item => {
        const owned = state.purchased.includes(item.id);
        const canAfford = state.coins >= item.price;
        let visual = '';
        if (item.visual.type === 'avatar') visual = `<div class="shop-visual ${item.visual.cls}">${item.visual.l}</div>`;
        else visual = `<div class="shop-visual ${item.visual.type} ${item.visual.cls}">${item.visual.e}</div>`;
        return `<div class="shop-item ${owned?'owned':''}">
          ${visual}
          <span class="name">${item.name}</span>
          ${owned ? `<span class="shop-owned">✓ Adquirido</span>` : `<button class="shop-buy ${canAfford?'':'disabled'}" data-id="${item.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg> ${item.price}</button>`}
        </div>`;
      }).join('')}
    </div>
  </div>`;
  c.querySelectorAll('.loja-tabs button').forEach(b => b.onclick = () => { lojaState.tab = b.dataset.tab; renderLoja(); });
  c.querySelectorAll('.shop-buy').forEach(b => b.onclick = () => buyItem(b.dataset.id));
}
function buyItem(id) {
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item) return;
  if (state.purchased.includes(id)) return toast('Você já tem esse item', 'info');
  if (state.coins < item.price) return toast('Moedas insuficientes', 'error');
  state.purchased.push(id);
  state.coins -= item.price;
  save();
  toast(`${item.name} adquirido!`);
  renderLoja();
}

// =============== AJUSTES ===============
function getBool(k, def=true) { const v = localStorage.getItem(k); return v === null ? def : v === 'true'; }
function setBool(k, v) { localStorage.setItem(k, v ? 'true' : 'false'); }
function renderAjustes() {
  const c = document.getElementById('view-ajustes');
  const dark = document.documentElement.classList.contains('dark');
  const fontSize = localStorage.getItem(LS.fontSize) || 'Médio';
  const push = getBool(LS.push, true), email = getBool(LS.emailN, true);
  const tfa = getBool(LS.twoFA, false), pub = getBool(LS.publicProf, true);
  const auto = getBool(LS.autoSave, true);

  c.innerHTML = `<div class="ajustes animate-reveal-up">
    <h2>Ajustes</h2>

    <div class="set-card">
      <div class="head"><div class="ico bg-blue10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg></div><div><h3>Notificações</h3><p>Gerencie suas preferências de aviso</p></div></div>
      <div class="toggle-row"><div><p class="lbl">Notificações Push</p><p class="dsc">Receber alertas no navegador</p></div><button class="tsw ${push?'on':''}" data-key="${LS.push}"><div class="knob"></div></button></div>
      <div class="toggle-row"><div><p class="lbl">Notificações por E-mail</p><p class="dsc">Receber resumos no e-mail</p></div><button class="tsw ${email?'on':''}" data-key="${LS.emailN}"><div class="knob"></div></button></div>
    </div>

    <div class="set-card">
      <div class="head"><div class="ico bg-pink10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg></div><div><h3>Aparência</h3><p>Personalize a interface</p></div></div>
      <div class="toggle-row"><div><p class="lbl">Modo Escuro</p><p class="dsc">Ative o tema escuro</p></div><button class="tsw ${dark?'on':''}" id="dark-toggle"><div class="knob"></div></button></div>
      <div class="set-row"><p class="lbl-row">Idioma</p><select class="select-x" disabled><option>Português (Brasil)</option></select></div>
      <div class="set-row"><p class="lbl-row">Tamanho da Fonte</p>
        <select class="select-x" id="font-size-select">
          ${['Pequeno','Médio','Grande'].map(o => `<option ${fontSize===o?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="set-card">
      <div class="head"><div class="ico bg-red10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div><h3>Privacidade e Segurança</h3><p>Proteja sua conta</p></div></div>
      <div class="toggle-row"><div><p class="lbl">Autenticação em 2 fatores</p><p class="dsc">Mais segurança no login</p></div><button class="tsw ${tfa?'on':''}" data-key="${LS.twoFA}"><div class="knob"></div></button></div>
      <div class="toggle-row"><div><p class="lbl">Perfil público</p><p class="dsc">Outros usuários podem ver</p></div><button class="tsw ${pub?'on':''}" data-key="${LS.publicProf}"><div class="knob"></div></button></div>
      <div class="set-row"><p class="lbl-row">Alterar senha</p>
        <input class="input-x" type="password" placeholder="Senha atual" style="margin-bottom:.5rem"/>
        <input class="input-x" type="password" placeholder="Nova senha" style="margin-bottom:.5rem"/>
        <input class="input-x" type="password" placeholder="Confirmar nova senha"/>
      </div>
    </div>

    <div class="set-card">
      <div class="head"><div class="ico bg-blue20"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg></div><div><h3>Informações da conta</h3><p>Atualize seus dados</p></div></div>
      <div class="set-row"><p class="lbl-row">Nome de usuário</p><input class="input-x" id="aj-username" value="${state.username}"/></div>
      <div class="set-row"><p class="lbl-row">E-mail</p><input class="input-x" value="${localStorage.getItem('educahub-email')||'usuario@educahub.com'}"/></div>
    </div>

    <div class="set-card">
      <div class="head"><div class="ico bg-teal20"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div><h3>Sistema</h3><p>Configurações gerais</p></div></div>
      <div class="toggle-row"><div><p class="lbl">Salvamento Automático</p><p class="dsc">Salvar progresso automaticamente</p></div><button class="tsw ${auto?'on':''}" data-key="${LS.autoSave}"><div class="knob"></div></button></div>
    </div>

    <div style="display:flex;gap:.75rem;padding:.5rem 0 2rem">
      <button class="btn-check" id="aj-save">Salvar</button>
    </div>
  </div>`;

  c.querySelectorAll('.tsw[data-key]').forEach(b => b.onclick = () => {
    const on = !b.classList.contains('on');
    b.classList.toggle('on', on);
    setBool(b.dataset.key, on);
  });
  document.getElementById('dark-toggle').onclick = () => {
    const on = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', on);
    localStorage.setItem(LS.dark, on);
    document.getElementById('dark-toggle').classList.toggle('on', on);
  };
  document.getElementById('font-size-select').onchange = (e) => {
    const v = e.target.value;
    localStorage.setItem(LS.fontSize, v);
    document.documentElement.style.fontSize = v === 'Pequeno' ? '14px' : v === 'Grande' ? '18px' : '16px';
  };
  document.getElementById('aj-username').onchange = (e) => { state.username = e.target.value; save(); };
  document.getElementById('aj-save').onclick = () => toast('Configurações salvas!');
}

// =============== PERFIL ===============
const AVATARS = [
  { id:'avatar-rosa', cls:'bg-pink' }, { id:'avatar-roxo', cls:'bg-purple' },
  { id:'avatar-verde', cls:'bg-emerald' }, { id:'avatar-azul', cls:'bg-teal' },
  { id:'avatar-laranja', cls:'bg-pink2' }, { id:'avatar-dourado', cls:'bg-yellow-bg' },
];
function getLevelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const cur = xp % XP_PER_LEVEL;
  return { level, cur, prog: (cur / XP_PER_LEVEL) * 100 };
}
function getLevelTitle(l) {
  if (l >= 20) return 'Mestre'; if (l >= 15) return 'Especialista';
  if (l >= 10) return 'Avançado'; if (l >= 5) return 'Intermediário'; return 'Iniciante';
}
const perfilState = { showPicker: false, editName: false, editBio: false };
function renderPerfil() {
  const c = document.getElementById('view-perfil');
  const { level, cur, prog } = getLevelInfo(state.xp);
  const title = getLevelTitle(level);
  const ownedAvs = AVATARS.filter(a => state.purchased.includes(a.id));
  const curAv = AVATARS.find(a => a.id === state.avatar);
  const initial = (state.username || 'U').charAt(0).toUpperCase();
  const badges = [
    { id:'first', l:'Primeira Lição', cls:'bg-sec10', lvl:1, ico:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' },
    { id:'5l', l:'5 Lições', cls:'bg-yellow-power', lvl:3, ico:'<polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"/>' },
    { id:'10c', l:'10 Acertos', cls:'bg-prim10', lvl:5, ico:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' },
    { id:'7d', l:'Ofensiva 7d', cls:'bg-orange-power', lvl:7, ico:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>' },
    { id:'10x', l:'Nível 10', cls:'bg-purple', lvl:10, ico:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>' },
    { id:'mst', l:'Mestre', cls:'bg-pink2', lvl:20, ico:'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>' },
  ];

  c.innerHTML = `<div class="perfil animate-reveal-up">
    <div class="perfil-head">
      <div class="perfil-avatar-wrap">
        <div class="perfil-avatar">
          ${curAv ? `<div class="colored ${curAv.cls}">${initial}</div>` : `<svg class="placeholder" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></svg>`}
        </div>
        <button class="perfil-avatar-edit" id="picker-toggle"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></button>
      </div>
      ${perfilState.showPicker ? `<div class="avatar-picker">
        <p class="picker-title">Escolha sua foto de perfil</p>
        ${ownedAvs.length === 0 ? `<p class="empty">Você não tem avatares. Compre na <span style="color:hsl(var(--primary));font-weight:600">Loja</span>! 🛒</p>` : `<div class="grid">${ownedAvs.map(a => `<button class="av ${a.cls} ${state.avatar===a.id?'selected':''}" data-id="${a.id}">${initial}</button>`).join('')}</div>`}
        ${state.avatar ? `<button class="remove" id="remove-av">Remover foto</button>` : ''}
      </div>` : ''}
      <div class="perfil-name-row">
        ${perfilState.editName 
          ? `<input class="input-x" id="name-input" value="${state.username}" autofocus style="max-width:14rem;text-align:center;font-weight:700"/><button class="icon-btn" id="name-save"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>`
          : `<h2>${state.username}</h2><button class="icon-btn" id="name-edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>`}
      </div>
      ${perfilState.editBio
        ? `<div style="width:100%;max-width:28rem"><textarea class="input-x" id="bio-input" rows="2">${state.bio}</textarea><button class="icon-btn" id="bio-save" style="font-size:.75rem;color:hsl(var(--primary));font-weight:600">Salvar</button></div>`
        : `<p class="perfil-bio" id="bio-edit">${state.bio} ✏️</p>`}
      <span class="perfil-title">${title}</span>
    </div>

    <div class="xp-card">
      <div class="xp-head">
        <div class="ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div><h3>Progresso de Nível</h3><p>Continue ganhando XP para evoluir</p></div>
      </div>
      <div class="xp-row">
        <div><span class="level-num">${level}</span><span style="font-size:.875rem;color:hsl(var(--muted-foreground));margin-left:.5rem">Nível</span></div>
        <div style="text-align:right;font-size:.875rem"><span style="font-weight:700">${state.xp}</span><span style="color:hsl(var(--muted-foreground))"> XP total</span></div>
      </div>
      <div class="xp-bar"><div class="fill" style="width:${prog}%"></div></div>
      <p style="font-size:.75rem;color:hsl(var(--muted-foreground));margin-top:.5rem">${cur} / ${XP_PER_LEVEL} XP para nível ${level + 1}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="ico bg-prim10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><span class="v">${state.xp}</span><span class="l">XP Total</span></div>
      <div class="stat-card"><div class="ico" style="background:rgb(254 249 195);color:rgb(202 138 4)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div><span class="v">${state.coins}</span><span class="l">Moedas</span></div>
      <div class="stat-card"><div class="ico" style="background:rgb(243 232 255);color:rgb(147 51 234)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></div><span class="v">${level}</span><span class="l">Nível</span></div>
    </div>

    <div class="xp-card">
      <div class="xp-head">
        <div class="ico" style="background:rgb(254 249 195);color:rgb(202 138 4)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></div>
        <div><h3>Conquistas</h3><p>Desbloqueie ao subir de nível</p></div>
      </div>
      <div class="badges-grid">
        ${badges.map(b => {
          const unlocked = level >= b.lvl;
          return `<div class="badge-card ${unlocked?'':'locked'}">
            <div class="ico ${unlocked?b.cls:''}" style="${unlocked?'':'background:hsl(var(--muted));color:hsl(var(--muted-foreground))'}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${b.ico}</svg></div>
            <div><p class="lbl">${b.l}</p><p class="lvl">Nível ${b.lvl}</p></div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  document.getElementById('picker-toggle').onclick = () => { perfilState.showPicker = !perfilState.showPicker; renderPerfil(); };
  c.querySelectorAll('.av[data-id]').forEach(b => b.onclick = () => {
    state.avatar = b.dataset.id; save(); perfilState.showPicker = false; toast('Foto alterada!'); renderPerfil();
  });
  const removeBtn = document.getElementById('remove-av');
  if (removeBtn) removeBtn.onclick = () => { state.avatar = ''; save(); toast('Foto removida'); renderPerfil(); };
  const ne = document.getElementById('name-edit'); if (ne) ne.onclick = () => { perfilState.editName = true; renderPerfil(); };
  const ns = document.getElementById('name-save'); if (ns) ns.onclick = () => { state.username = document.getElementById('name-input').value || 'Usuário'; save(); perfilState.editName = false; renderPerfil(); };
  const be = document.getElementById('bio-edit'); if (be) be.onclick = () => { perfilState.editBio = true; renderPerfil(); };
  const bs = document.getElementById('bio-save'); if (bs) bs.onclick = () => { state.bio = document.getElementById('bio-input').value; save(); perfilState.editBio = false; renderPerfil(); };
}

const renderViews = {
  trilha: renderTrilha,
  material: renderMaterial,
  calculadora: renderCalc,
  loja: renderLoja,
  ajustes: renderAjustes,
  perfil: renderPerfil,
};

// Init
save();
renderTrilha();
