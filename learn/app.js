// =====================================================
//  app.js  —  Ravionus Learn Platform Engine
//  Handles: catalog page, topic reader, quiz engine,
//  progress persistence via localStorage + Firebase
// =====================================================

import {
    signInWithGoogle,
    signOutUser,
    onAuthChange,
    loadProgressFromCloud,
    syncProgressToCloud,
    saveCompletion,
    getCurrentUser
} from './firebase.js';

import { generateCertificate } from './certificate.js';

const STORAGE_KEY = 'ravionus_learn_progress';
let USER = null;

// ────────────────────────────────────────────────────
//  Auth & UI Sync
// ────────────────────────────────────────────────────

function initAuthUI() {
    const signInBtn = document.getElementById('signInBtn');
    const userChip = document.getElementById('userChip');
    const userAvatar = document.getElementById('userAvatar');
    const userNameEl = document.getElementById('userName');
    const signOutBtn = document.getElementById('signOutBtn');

    if (signInBtn) signInBtn.onclick = signInWithGoogle;
    if (signOutBtn) signOutBtn.onclick = signOutUser;

    onAuthChange(async (user) => {
        USER = user;
        if (user) {
            // Logged In
            if (signInBtn) signInBtn.classList.add('hidden');
            if (userChip) userChip.classList.remove('hidden');
            if (userAvatar) userAvatar.src = user.photoURL || '';
            if (userNameEl) userNameEl.textContent = user.displayName?.split(' ')[0] || 'User';

            // Sync: Cloud -> Local (on login)
            const cloudProgress = await loadProgressFromCloud(user.uid);
            if (cloudProgress) {
                const local = loadProgress();
                const merged = { ...local, ...cloudProgress };
                saveProgress(merged, false); // don't sync back up yet

                // Refresh UI if on catalog
                if (document.getElementById('topicsGrid')) initCatalog();
            }
        } else {
            // Logged Out
            if (signInBtn) signInBtn.classList.remove('hidden');
            if (userChip) userChip.classList.add('hidden');
            USER = null;
        }
    });
}

// ────────────────────────────────────────────────────
//  Progress Helpers
// ────────────────────────────────────────────────────

function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

async function saveProgress(data, syncToCloud = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (syncToCloud && USER) {
        await syncProgressToCloud(USER.uid, data);
    }
}

function getTopicProgress(topicId) {
    const all = loadProgress();
    return all[topicId] || { completedSections: [], quizScores: {}, finished: false };
}

function markSectionComplete(topicId, sectionIndex) {
    const all = loadProgress();
    if (!all[topicId]) all[topicId] = { completedSections: [], quizScores: {}, finished: false };
    if (!all[topicId].completedSections.includes(sectionIndex)) {
        all[topicId].completedSections.push(sectionIndex);
    }
    saveProgress(all);
}

function saveQuizScore(topicId, sectionIndex, score, total) {
    const all = loadProgress();
    if (!all[topicId]) all[topicId] = { completedSections: [], quizScores: {}, finished: false };
    all[topicId].quizScores[sectionIndex] = { score, total };
    saveProgress(all);
}

function markTopicFinished(topicId) {
    const all = loadProgress();
    if (!all[topicId]) all[topicId] = { completedSections: [], quizScores: {}, finished: false };
    all[topicId].finished = true;
    saveProgress(all);

    // If logged in, save completion record for certificate
    if (USER) {
        const topic = TOPICS.find(t => t.id === topicId);
        const prog = all[topicId];
        const total = Object.values(prog.quizScores).reduce((s, q) => s + q.score, 0);
        const max = Object.values(prog.quizScores).reduce((s, q) => s + q.total, 0);
        saveCompletion(USER.uid, topicId, topic.title, total, max);
    }
}

// ────────────────────────────────────────────────────
//  CATALOG PAGE  (index.html)
// ────────────────────────────────────────────────────

function initCatalog() {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;

    const progress = loadProgress();

    function renderCards(filter = '') {
        grid.innerHTML = '';
        const filtered = TOPICS.filter(t =>
            filter === '' ||
            t.title.toLowerCase().includes(filter) ||
            t.description.toLowerCase().includes(filter) ||
            t.tags.some(tag => tag.toLowerCase().includes(filter))
        );

        if (filtered.length === 0) {
            grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">🔍</div>
          <p>No topics match "<strong>${filter}</strong>". Try a different search.</p>
        </div>`;
            return;
        }

        filtered.forEach(topic => {
            const prog = progress[topic.id] || { completedSections: [], finished: false };
            const total = topic.sections.length;
            const done = prog.completedSections.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            const card = document.createElement('a');
            card.className = 'topic-card';
            card.href = `topic.html?id=${topic.id}`;
            card.style.setProperty('--card-color', topic.color);

            card.innerHTML = `
        <div class="card-header">
          <div class="card-icon">${topic.icon}</div>
          <div class="card-badges">
            <span class="badge badge-difficulty-${topic.difficulty}">${topic.difficulty}</span>
            <span class="badge badge-time">⏱ ${topic.estimatedTime}</span>
            ${prog.finished ? '<span class="badge badge-completed">✓ Done</span>' : ''}
          </div>
        </div>
        <div>
          <div class="card-title">${topic.title}</div>
          <p class="card-desc">${topic.description}</p>
        </div>
        <div class="card-tags">
          ${topic.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="card-footer">
          <div class="progress-wrap">
            <div class="progress-label">${done} / ${total} sections</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          </div>
          <span class="card-arrow">→</span>
        </div>`;

            grid.appendChild(card);
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });

        const statsTopics = document.getElementById('statTopics');
        const statsLessons = document.getElementById('statLessons');
        const statsQuizzes = document.getElementById('statQuizzes');
        if (statsTopics) statsTopics.textContent = TOPICS.length;
        if (statsLessons) statsLessons.textContent = TOPICS.reduce((s, t) => s + t.sections.filter(s => s.type === 'lesson').length, 0);
        if (statsQuizzes) statsQuizzes.textContent = TOPICS.reduce((s, t) => s + t.sections.filter(s => s.type === 'quiz').length, 0);
    }

    renderCards();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderCards(e.target.value.toLowerCase().trim());
        });
    }
}

// ────────────────────────────────────────────────────
//  TOPIC READER  (topic.html)
// ────────────────────────────────────────────────────

let currentSectionIndex = 0;
let quizState = {};

function initTopicPage() {
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('id');
    if (!topicId) { window.location.href = './'; return; }

    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) { window.location.href = './'; return; }

    document.title = `${topic.title} — Ravionus Learn`;
    document.getElementById('topicIcon').textContent = topic.icon;
    document.getElementById('topicTitleEl').textContent = topic.title;
    document.getElementById('topicDescEl').textContent = topic.description;
    document.getElementById('topicDiff').textContent = topic.difficulty;
    document.getElementById('topicTime').textContent = '⏱ ' + topic.estimatedTime;
    document.getElementById('topicDiff').className = `badge badge-difficulty-${topic.difficulty}`;

    const prog = getTopicProgress(topicId);

    buildSidebar(topic, prog);

    currentSectionIndex = 0;
    for (let i = 0; i < topic.sections.length; i++) {
        if (!prog.completedSections.includes(i)) {
            currentSectionIndex = i;
            break;
        }
        if (i === topic.sections.length - 1) {
            currentSectionIndex = i;
        }
    }

    if (prog.finished) {
        showCompletionScreen(topic, prog);
    } else {
        showSection(topic, topicId, currentSectionIndex);
    }
}

function buildSidebar(topic, prog) {
    const container = document.getElementById('sectionSteps');
    if (!container) return;
    container.innerHTML = '';
    topic.sections.forEach((section, i) => {
        const item = document.createElement('div');
        const isCompleted = prog.completedSections.includes(i);
        const isQuiz = section.type === 'quiz';
        item.className = `step-item ${isCompleted ? 'completed' : ''} ${isQuiz ? 'quiz-type' : ''}`;
        item.dataset.index = i;
        item.innerHTML = `
      <div class="step-dot"></div>
      <span class="step-label">
        ${isQuiz ? '⚡ ' : ''}${section.title}
      </span>`;
        if (isCompleted) {
            item.addEventListener('click', () => {
                showSection(topic, topic.id, i);
            });
        }
        container.appendChild(item);
    });
}

function updateSidebar(activeIndex, prog) {
    document.querySelectorAll('.step-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === activeIndex) item.classList.add('active');
        if (prog.completedSections.includes(i)) item.classList.add('completed');
    });
}

function showSection(topic, topicId, index) {
    currentSectionIndex = index;
    const section = topic.sections[index];
    const prog = getTopicProgress(topicId);
    updateSidebar(index, prog);

    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '';

    if (section.type === 'lesson') {
        renderLesson(topic, topicId, section, index);
    } else if (section.type === 'quiz') {
        renderQuiz(topic, topicId, section, index);
    }
}

function renderLesson(topic, topicId, section, index) {
    const contentArea = document.getElementById('contentArea');
    const hasNext = index < topic.sections.length - 1;

    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML = `
    <div class="section-card-header">
      <span class="section-type-badge type-lesson">Lesson</span>
      <span class="section-card-title">${section.title}</span>
    </div>
    <div class="lesson-body">${section.content}</div>
    <div class="action-row">
      ${index > 0 ? '<button class="btn btn-secondary" id="prevBtn">← Back</button>' : ''}
      <button class="btn btn-primary" id="continueBtn">
        ${hasNext ? 'Continue →' : '🎉 Finish Topic'}
      </button>
    </div>`;

    contentArea.appendChild(card);
    contentArea.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('continueBtn').addEventListener('click', () => {
        markSectionComplete(topicId, index);
        const updatedProg = getTopicProgress(topicId);
        buildSidebar(topic, updatedProg);
        if (hasNext) {
            showSection(topic, topicId, index + 1);
        } else {
            markTopicFinished(topicId);
            showCompletionScreen(topic, updatedProg);
        }
    });

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSection(topic, topicId, index - 1));
    }
}

function renderQuiz(topic, topicId, section, sectionIndex) {
    quizState = { current: 0, score: 0, answers: [] };
    showQuestion(topic, topicId, section, sectionIndex);
}

function showQuestion(topic, topicId, section, sectionIndex) {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '';

    const { current } = quizState;
    const questions = section.questions;
    const q = questions[current];
    const isLastQ = current === questions.length - 1;

    const dots = questions.map((_, i) => {
        let cls = '';
        if (i < current) {
            cls = quizState.answers[i] === questions[i].answer ? 'correct' : 'wrong';
        } else if (i === current) cls = 'active';
        return `<div class="q-dot ${cls}"></div>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML = `
    <div class="section-card-header">
      <span class="section-type-badge type-quiz">Quiz</span>
      <span class="section-card-title">${section.title}</span>
    </div>
    <div class="quiz-body">
      <div class="quiz-progress">
        <span class="quiz-progress-text">Question ${current + 1} of ${questions.length}</span>
        <div class="quiz-progress-dots">${dots}</div>
      </div>
      <div class="quiz-question">${q.q}</div>
      <div class="options-grid" id="optionsGrid">
        ${q.options.map((opt, i) => `
          <button class="option-btn" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
      <div class="explanation-box" id="explanationBox"></div>
    </div>
    <div class="action-row">
      <button class="btn btn-primary" id="nextBtn" style="display:none">
        ${isLastQ ? 'See Results 🏆' : 'Next Question →'}
      </button>
    </div>`;

    contentArea.appendChild(card);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const optionsGrid = document.getElementById('optionsGrid');
    const explanationBox = document.getElementById('explanationBox');
    const nextBtn = document.getElementById('nextBtn');

    optionsGrid.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosen = parseInt(btn.dataset.index);
            const correct = q.answer;
            const isCorrect = chosen === correct;

            quizState.answers[current] = chosen;
            if (isCorrect) quizState.score++;

            optionsGrid.querySelectorAll('.option-btn').forEach((b, i) => {
                b.disabled = true;
                if (i === correct) b.classList.add('correct');
                if (i === chosen && !isCorrect) b.classList.add('wrong');
            });

            explanationBox.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Not quite!'}</strong> ${q.explanation}`;
            explanationBox.className = `explanation-box show ${isCorrect ? 'good' : 'bad'}`;
            nextBtn.style.display = 'inline-flex';
        });
    });

    nextBtn.addEventListener('click', () => {
        if (current < questions.length - 1) {
            quizState.current++;
            showQuestion(topic, topicId, section, sectionIndex);
        } else {
            saveQuizScore(topicId, sectionIndex, quizState.score, questions.length);
            markSectionComplete(topicId, sectionIndex);
            buildSidebar(topic, getTopicProgress(topicId));
            showQuizScore(topic, topicId, section, sectionIndex, quizState.score, questions.length);
        }
    });
}

function showQuizScore(topic, topicId, section, sectionIndex, score, total) {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '';

    const pct = Math.round((score / total) * 100);
    const hasNext = sectionIndex < topic.sections.length - 1;

    let circleClass = pct >= 80 ? 'excellent' : pct >= 50 ? 'good' : 'poor';
    let message = pct >= 80 ? '🎉 Excellent work!' : pct >= 50 ? '👍 Good effort!' : '💪 Keep practising!';
    let sub = pct >= 80 ? 'You have a solid understanding.' : pct >= 50 ? 'Review and try again!' : 'Go back through the lesson!';

    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML = `
    <div class="section-card-header">
      <span class="section-type-badge type-quiz">Quiz Results</span>
      <span class="section-card-title">${section.title}</span>
    </div>
    <div class="quiz-score-screen">
      <div class="score-circle ${circleClass}">
        ${score}/${total}
        <span class="score-label">${pct}%</span>
      </div>
      <div class="score-message">${message}</div>
      <div class="score-sub">${sub}</div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-secondary" id="retryQuizBtn">↺ Retry Quiz</button>
        ${hasNext
            ? `<button class="btn btn-primary" id="nextSectionBtn">Continue →</button>`
            : `<button class="btn btn-primary" id="finishBtn">🎉 Complete Topic</button>`}
      </div>
    </div>`;

    contentArea.appendChild(card);
    document.getElementById('retryQuizBtn')?.addEventListener('click', () => renderQuiz(topic, topicId, section, sectionIndex));
    document.getElementById('nextSectionBtn')?.addEventListener('click', () => showSection(topic, topicId, sectionIndex + 1));
    document.getElementById('finishBtn')?.addEventListener('click', () => {
        markTopicFinished(topicId);
        showCompletionScreen(topic, getTopicProgress(topicId));
    });
}

// ── Completion Screen & Certificate ─────────────────

function showCompletionScreen(topic, prog) {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '';

    const quizCount = topic.sections.filter(s => s.type === 'quiz').length;
    const totalPoints = Object.values(prog.quizScores || {}).reduce((s, q) => s + q.score, 0);
    const maxPoints = Object.values(prog.quizScores || {}).reduce((s, q) => s + q.total, 0);

    const screen = document.createElement('div');
    screen.className = 'completion-screen';
    screen.innerHTML = `
    <span class="completion-icon">🏆</span>
    <div class="completion-title">Topic Complete!</div>
    <p class="completion-sub">You've finished <strong>${topic.title}</strong>. Great work!</p>
    <div class="completion-stats">
      <div class="comp-stat">
        <div class="comp-stat-val">${topic.sections.filter(s => s.type === 'lesson').length}</div>
        <div class="comp-stat-lbl">Lessons</div>
      </div>
      <div class="comp-stat">
        <div class="comp-stat-val">${quizCount}</div>
        <div class="comp-stat-lbl">Quizzes</div>
      </div>
      ${maxPoints > 0 ? `
      <div class="comp-stat">
        <div class="comp-stat-val">${totalPoints}/${maxPoints}</div>
        <div class="comp-stat-lbl">Quiz Score</div>
      </div>` : ''}
    </div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:24px">
        <button class="btn btn-primary" id="certBtn">🎓 Get Certificate</button>
        <a href="./" class="btn btn-secondary">← Back to Topics</a>
    </div>
    ${!USER ? `<p style="font-size:0.8rem;color:var(--text-muted)">Tip: Sign in with Google to get a verified certificate with your name.</p>` : ''}
    `;

    contentArea.appendChild(screen);

    document.getElementById('certBtn').onclick = () => {
        showCertModal(topic.title, `${totalPoints}/${maxPoints}`);
    };
}

function showCertModal(topicTitle, totalPoints) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
    <div class="modal-content">
        <span class="modal-icon">📜</span>
        <h2 class="modal-title">Course Certificate</h2>
        <p class="modal-desc">Enter the name you'd like to appear on your certificate for <strong>${topicTitle}</strong>.</p>
        <input type="text" id="certNameInput" class="modal-input" placeholder="Your Full Name" value="${USER?.displayName || ''}">
        <div class="modal-actions">
            <button class="btn btn-secondary" id="cancelModal">Cancel</button>
            <button class="btn btn-primary" id="downloadCert">Download PDF</button>
        </div>
    </div>`;

    document.body.appendChild(overlay);
    const input = document.getElementById('certNameInput');
    input.focus();

    document.getElementById('cancelModal').onclick = () => overlay.remove();
    document.getElementById('downloadCert').onclick = () => {
        const name = input.value.trim();
        if (!name) { alert('Please enter your name'); return; }

        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const certId = USER ? `${USER.uid.slice(0, 6)}-${Date.now()}` : `GUEST-${Date.now()}`;

        generateCertificate(name, topicTitle, date, certId);
        overlay.remove();
    };

    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// ────────────────────────────────────────────────────
//  Boot
// ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    if (document.getElementById('topicsGrid')) {
        initCatalog();
    }
    if (document.getElementById('topicTitleEl')) {
        initTopicPage();
    }
});
