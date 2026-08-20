(function () {
  'use strict';
  const T = window.Tools, $ = id => document.getElementById(id);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const W8 = [128, 64, 32, 16, 8, 4, 2, 1];
  let bits = [0, 0, 0, 0, 1, 1, 1, 0];

  /* ---------- STEP1 ---------- */
  function drawBits() {
    const box = $('bits'); box.innerHTML = '';
    bits.forEach((v, i) => {
      const c = document.createElement('div'); c.className = 'bcol';
      const b = document.createElement('button');
      b.className = 'b' + (v ? ' on' : '');
      b.textContent = v;
      b.addEventListener('click', () => { bits[i] = 1 - bits[i]; drawBits(); });
      const w = document.createElement('div');
      w.className = 'w' + (v ? ' on' : '');
      w.textContent = W8[i];
      c.appendChild(b); c.appendChild(w);
      box.appendChild(c);
    });
    const on = bits.map((v, i) => v ? W8[i] : 0).filter(x => x);
    const val = on.reduce((a, b) => a + b, 0);
    $('calc1').innerHTML = on.length
      ? on.join(' ＋ ') + ' ＝ <strong>' + val + '</strong>'
      : 'すべて0なので <strong>0</strong>';
    $('dec1').textContent = val;
    $('hex1').textContent = val.toString(16).toUpperCase().padStart(2, '0');
    drawHexMap();
  }

  /* ---------- STEP2 ---------- */
  function drawDiv() {
    const n = +$('decIn').value;
    $('decInV').textContent = n;
    let x = n; const steps = [], rems = [];
    if (x === 0) { steps.push('0 ÷ 2 ＝ 0 あまり <span class="r">0</span>'); rems.push(0); }
    while (x > 0) {
      const q = Math.floor(x / 2), r = x % 2;
      steps.push('<span class="q">' + x + ' ÷ 2 ＝ ' + q + '</span> あまり <span class="r">' + r + '</span>');
      rems.push(r); x = q;
    }
    $('divSteps').innerHTML = steps.join('<br>');
    const bin = rems.slice().reverse().join('');
    $('binOut').textContent = bin + '(2)';
    $('divNote').innerHTML = 'あまりを<strong>下から順に読む</strong>と <span class="mono">' + bin + '</span> になります。' +
      '検算：' + bin.split('').map((b, i) => b === '1' ? Math.pow(2, bin.length - 1 - i) : 0).filter(x => x).join(' ＋ ') +
      ' ＝ <strong>' + n + '</strong>';
  }

  /* ---------- STEP3 小数 ---------- */
  function drawFrac() {
    const f = parseFloat($('fracIn').value);
    $('fracInV').textContent = f;
    let x = f; const steps = [], digits = [];
    for (let i = 0; i < 12 && x > 0; i++) {
      const y = x * 2, d = Math.floor(y);
      steps.push('<span class="q">' + round(x) + ' × 2 ＝ ' + round(y) + '</span> → 整数部分 <span class="r">' + d + '</span>');
      digits.push(d); x = y - d;
    }
    if (!digits.length) { digits.push(0); steps.push('0 なので 0'); }
    $('fracSteps').innerHTML = steps.join('<br>');
    const bin = '0.' + digits.join('');
    $('fracOut').textContent = bin + '(2)';
    const terms = digits.map((d, i) => d ? '1/' + Math.pow(2, i + 1) + '(＝' + round(1 / Math.pow(2, i + 1)) + ')' : null).filter(Boolean);
    const val = digits.reduce((a, d, i) => a + d / Math.pow(2, i + 1), 0);
    $('fracCalc').innerHTML = terms.length ? terms.join(' ＋ ') + ' ＝ <strong>' + round(val) + '</strong>' : '0';
    const n = $('fracNote');
    if (x > 1e-9) {
      n.className = 'note warn';
      n.innerHTML = '<strong>12桁でも割り切れませんでした。</strong>10進法では簡単な小数でも、2進法では無限に続くことがあります。' +
        'コンピュータは途中で打ち切るので、<strong>わずかな誤差</strong>が生まれます（' + f + ' ≒ ' + round(val) + '）。これが演算誤差の原因です。';
    } else {
      n.className = 'note ok';
      n.innerHTML = '<strong>割り切れました。</strong>2進法の小数の位は 0.5・0.25・0.125… なので、これらの和で表せる数だけが正確に表せます。';
    }
  }
  const round = v => Math.round(v * 1e6) / 1e6;

  /* ---------- STEP4 16進法 ---------- */
  function drawHexMap() {
    const b = bits.join('');
    const g1 = b.slice(0, 4), g2 = b.slice(4);
    $('hexMap').innerHTML = [g1, g2].map(g =>
      '<div class="g"><div class="b4">' + g + '</div><div class="hx">' +
      parseInt(g, 2).toString(16).toUpperCase() + '</div></div>').join('');
    let h = '<thead><tr><th>10進法</th><th>2進法</th><th>16進法</th></tr></thead><tbody>';
    for (let i = 0; i < 16; i++) h += '<tr><td class="mono">' + i + '</td><td class="mono">' +
      i.toString(2).padStart(4, '0') + '</td><td class="mono">' + i.toString(16).toUpperCase() + '</td></tr>';
    $('hexTable').innerHTML = h + '</tbody>';
  }

  /* ---------- STEP5 ドリル ---------- */
  let dAns = '', dScore = 0, dTotal = 0;
  function newDrill() {
    const kind = Math.floor(Math.random() * 5);
    const n = Math.floor(Math.random() * 200) + 5;
    let q, choices;
    if (kind === 0) {
      dAns = n.toString(2);
      q = '10進法 ' + n + ' を2進法で表すと？';
      choices = [dAns, (n + 1).toString(2), (n - 1).toString(2), (n * 2).toString(2)];
    } else if (kind === 1) {
      const b = n.toString(2);
      dAns = String(n);
      q = '2進法 ' + b + '(2) を10進法で表すと？';
      choices = [dAns, String(n + 1), String(n - 2), String(Math.floor(n / 2))];
    } else if (kind === 2) {
      dAns = n.toString(16).toUpperCase();
      q = '2進法 ' + n.toString(2).padStart(8, '0') + '(2) を16進法で表すと？';
      choices = [dAns, (n + 1).toString(16).toUpperCase(), (n + 16).toString(16).toUpperCase(), (n - 3).toString(16).toUpperCase()];
    } else if (kind === 3) {
      const fr = [0.5, 0.25, 0.125, 0.375, 0.625, 0.75, 0.875][Math.floor(Math.random() * 7)];
      let x = fr, d = [];
      for (let i = 0; i < 6 && x > 0; i++) { const y = x * 2, k = Math.floor(y); d.push(k); x = y - k; }
      dAns = '0.' + d.join('');
      q = '10進法 ' + fr + ' を2進法で表すと？';
      choices = [dAns, '0.' + d.slice().reverse().join(''), '0.' + d.join('') + '1', '0.' + (d[0] ? '0' : '1') + d.slice(1).join('')];
    } else {
      const bits2 = [0.5, 0.25, 0.125].map(() => Math.random() < .5 ? 1 : 0);
      const v = bits2.reduce((a, b, i) => a + b / Math.pow(2, i + 1), 0);
      dAns = String(round(v));
      q = '2進法 0.' + bits2.join('') + '(2) を10進法で表すと？';
      choices = [dAns, String(round(v * 2)), String(round(v / 2)), String(round(v + 0.125))];
    }
    $('dText').textContent = q;
    const box = $('dChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle([...new Set(choices)]).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c; b.dataset.c = c; b.style.textAlign = 'center';
      b.addEventListener('click', () => answerDrill(c));
      box.appendChild(b);
    });
    $('dFb').hidden = true;
    $('dProgress').textContent = (dTotal + 1) + ' 問目';
  }
  function answerDrill(c) {
    const ok = c === dAns, box = $('dChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === dAns) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    dTotal++; if (ok) dScore++;
    $('dScore').textContent = dScore; $('dTotal').textContent = dTotal;
    const fb = $('dFb'); fb.hidden = false;
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = ok ? '正解です。' : '正解は <strong>' + dAns + '</strong>。上のSTEPにもどって手順を確かめましょう。';
  }

  function init() {
    document.querySelectorAll('[data-bin]').forEach(b => b.addEventListener('click', () => {
      bits = b.dataset.bin.split('').map(Number); drawBits();
    }));
    $('randBin').addEventListener('click', () => {
      bits = Array.from({ length: 8 }, () => Math.random() < .5 ? 1 : 0); drawBits();
    });
    $('decIn').addEventListener('input', drawDiv);
    $('fracIn').addEventListener('input', drawFrac);
    document.querySelectorAll('[data-frac]').forEach(b => b.addEventListener('click', () => {
      $('fracIn').value = b.dataset.frac; drawFrac();
    }));
    $('dNext').addEventListener('click', newDrill);
    window.Terms.glossary($('glossBox'), ['基数変換', '2進法', '16進法', 'デジタル', '演算誤差', '丸め誤差']);
    drawBits(); drawDiv(); drawFrac(); newDrill();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
