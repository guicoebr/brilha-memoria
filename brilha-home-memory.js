(() => {
  'use strict';

  const STORAGE_KEY = 'brilha_home_student_v1';
  const DISMISS_KEY = 'brilha_home_student_prompt_dismissed';
  const CASA_PATH = '/casa';

  const readStored = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (!value) return null;
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed.accessUrl !== 'string') return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const storeStudent = (record) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  };

  const clearStudent = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(DISMISS_KEY);
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const studentNameFromPage = () => {
    const params = new URLSearchParams(location.search);
    for (const key of ['studentName', 'student', 'aluno', 'name']) {
      const value = params.get(key);
      if (value && value.trim().length >= 2 && value.trim().length <= 60) {
        return value.trim();
      }
    }

    const explicit = document.querySelector('[data-student-name]');
    if (explicit?.textContent?.trim()) return explicit.textContent.trim();

    const candidates = Array.from(document.querySelectorAll('h1,h2,h3,[role="heading"]'))
      .map((el) => el.textContent?.trim())
      .filter(Boolean);

    for (const text of candidates) {
      const match = text.match(/(?:olá|ola|bem[- ]?vindo(?:a)?|aluno(?:a)?|acesso de)\s*,?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-Za-zÁÀÂÃÉÊÍÓÔÕÚÜÇáàâãéêíóôõúüç' -]{1,40})/i);
      if (match?.[1]) return match[1].trim();
    }

    return '';
  };

  const looksLikeStudentPinPage = () => {
    const path = location.pathname.toLowerCase();
    if (path === CASA_PATH) return false;
    if (/\/(admin|professor|professora)(\/|$)/.test(path)) return false;

    const text = (document.body?.innerText || '').replace(/\s+/g, ' ').toLowerCase();
    if (!text) return false;
    const hasPin = /\bpin\b/.test(text);
    const hasStudentContext = text.includes('acesso em casa') || text.includes('modo aluno') || text.includes('aluno') || text.includes('atividade');
    return hasPin && hasStudentContext;
  };

  const styles = `
    #brilha-home-overlay{position:fixed;inset:0;z-index:2147483646;background:rgba(20,28,24,.54);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #brilha-home-card{width:min(430px,100%);background:#fff;border-radius:18px;padding:24px;box-shadow:0 22px 70px rgba(0,0,0,.24);color:#1d2821}
    #brilha-home-card h2{font-size:23px;line-height:1.18;margin:0 0 10px}
    #brilha-home-card p{font-size:16px;line-height:1.45;margin:0 0 18px;color:#47544b}
    #brilha-home-card .brilha-actions{display:grid;gap:10px}
    #brilha-home-card button,#brilha-casa button{appearance:none;border:0;border-radius:12px;padding:14px 16px;font-size:16px;font-weight:700;cursor:pointer}
    #brilha-home-yes,#brilha-casa-enter{background:#244d35;color:#fff}
    #brilha-home-no,#brilha-casa-switch{background:#edf2ee;color:#244d35}
    #brilha-casa{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:22px;background:#f3f5f1;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1d2821}
    #brilha-casa .card{width:min(430px,100%);background:#fff;border-radius:20px;padding:28px;box-shadow:0 18px 55px rgba(25,45,32,.12);text-align:center}
    #brilha-casa h1{font-size:27px;margin:0 0 8px}
    #brilha-casa p{font-size:16px;line-height:1.45;color:#526058;margin:0 0 22px}
    #brilha-casa .actions{display:grid;gap:10px}
    #brilha-casa .small{font-size:13px;color:#718078;margin-top:16px}
  `;

  const ensureStyle = () => {
    if (document.getElementById('brilha-home-memory-style')) return;
    const style = document.createElement('style');
    style.id = 'brilha-home-memory-style';
    style.textContent = styles;
    document.head.appendChild(style);
  };

  const renderCasa = () => {
    ensureStyle();
    const stored = readStored();
    document.body.innerHTML = '';
    const root = document.createElement('main');
    root.id = 'brilha-casa';

    if (stored) {
      const name = stored.studentName ? escapeHtml(stored.studentName) : 'este aluno';
      root.innerHTML = `
        <section class="card" aria-labelledby="brilha-casa-title">
          <h1 id="brilha-casa-title">Acesso em Casa</h1>
          <p>Este celular está vinculado a <strong>${name}</strong>.</p>
          <div class="actions">
            <button id="brilha-casa-enter" type="button">Entrar como ${name}</button>
            <button id="brilha-casa-switch" type="button">Trocar de aluno</button>
          </div>
          <p class="small">O PIN não é salvo neste aparelho.</p>
        </section>`;
      document.body.appendChild(root);
      document.getElementById('brilha-casa-enter').addEventListener('click', () => {
        location.assign(stored.accessUrl);
      });
      document.getElementById('brilha-casa-switch').addEventListener('click', () => {
        clearStudent();
        renderCasa();
      });
      return;
    }

    root.innerHTML = `
      <section class="card" aria-labelledby="brilha-casa-title">
        <h1 id="brilha-casa-title">Acesso em Casa</h1>
        <p>Este celular ainda não está vinculado a um aluno.</p>
        <p>Abra uma vez o link individual enviado pela professora. Depois disso, este endereço lembrará o aluno neste celular.</p>
        <p class="small">Nenhum PIN será salvo.</p>
      </section>`;
    document.body.appendChild(root);
  };

  const showRememberPrompt = () => {
    if (readStored() || sessionStorage.getItem(DISMISS_KEY) === '1') return;
    if (document.getElementById('brilha-home-overlay')) return;

    ensureStyle();
    const studentName = studentNameFromPage();
    const label = studentName || 'este aluno';
    const overlay = document.createElement('div');
    overlay.id = 'brilha-home-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <section id="brilha-home-card">
        <h2>Manter ${escapeHtml(label)} neste celular?</h2>
        <p>Nos próximos acessos, o Brilha lembrará qual aluno usa este aparelho. O PIN continuará sendo pedido e não será salvo.</p>
        <div class="brilha-actions">
          <button id="brilha-home-yes" type="button">Sim, manter neste celular</button>
          <button id="brilha-home-no" type="button">Agora não</button>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    document.getElementById('brilha-home-yes').addEventListener('click', () => {
      storeStudent({
        studentName,
        accessUrl: location.href,
        savedAt: new Date().toISOString()
      });
      overlay.remove();
    });
    document.getElementById('brilha-home-no').addEventListener('click', () => {
      sessionStorage.setItem(DISMISS_KEY, '1');
      overlay.remove();
    });
  };

  const boot = () => {
    if (location.pathname.replace(/\/+$/, '') === CASA_PATH) {
      renderCasa();
      return;
    }

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (looksLikeStudentPinPage()) {
        clearInterval(timer);
        showRememberPrompt();
      } else if (attempts >= 30) {
        clearInterval(timer);
      }
    }, 500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
