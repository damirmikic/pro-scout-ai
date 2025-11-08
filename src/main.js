import { renderSafeContent, sanitizeHtmlContent } from './utils/sanitizer.js';
import { callGeminiApi, invokeGemini } from './api/geminiClient.js';

// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
} else {
    console.error("Lucide icons script not loaded.");
}

// Get global variables from environment (if they exist)
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-pro-scout-ai';

// --- DOM Elements ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Modals
const howToUseBtn = document.getElementById('howToUseBtn');
const howToUseModal = document.getElementById('howToUseModal');
const closeHowToUseBtn = document.getElementById('closeHowToUseBtn');
const errorModal = document.getElementById('errorModal');
const closeErrorBtn = document.getElementById('closeErrorBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const loadingText = document.getElementById('loadingText');
const loadOpponentModal = document.getElementById('loadOpponentModal');
const closeLoadOpponentModalBtn = document.getElementById('closeLoadOpponentModalBtn');
const loadOpponentList = document.getElementById('loadOpponentList');
const loadReportModal = document.getElementById('loadReportModal');
const closeLoadReportModalBtn = document.getElementById('closeLoadReportModalBtn');
const savedReportsList = document.getElementById('savedReportsList');
const savedReportsGrid = document.getElementById('savedReportsGrid');
const savedReportsEmptyState = document.getElementById('savedReportsEmptyState');
const openLoadReportModalBtn = document.getElementById('openLoadReportModalBtn');
const floatingGenerateBtn = document.getElementById('floatingGenerateBtn');
const analysisViewControls = document.getElementById('analysisViewControls');
const analysisDataView = document.getElementById('analysisDataView');
const analysisSummary = document.getElementById('analysisSummary');
const analysisVisuals = document.getElementById('analysisVisuals');
const analysisContainer = document.querySelector('.analysis-theme');
const reportTheme = document.getElementById('reportTheme');
const saveReportBtn = document.getElementById('saveReportBtn');
const loadReportBtn = document.getElementById('loadReportBtn');
const narrativeBuilders = {
    player: {
        tone: document.getElementById('playerNarrativeTone'),
        duration: document.getElementById('playerNarrativeDuration'),
        voice: document.getElementById('playerNarrativeVoice'),
        script: document.getElementById('playerNarrativeScript'),
        storyboard: document.getElementById('playerNarrativeStoryboard'),
        generateBtn: document.getElementById('playerGenerateNarrativeBtn'),
        stopBtn: document.getElementById('playerStopNarrativeBtn'),
        context: 'player'
    },
    opponent: {
        tone: document.getElementById('opponentNarrativeTone'),
        duration: document.getElementById('opponentNarrativeDuration'),
        voice: document.getElementById('opponentNarrativeVoice'),
        script: document.getElementById('opponentNarrativeScript'),
        storyboard: document.getElementById('opponentNarrativeStoryboard'),
        generateBtn: document.getElementById('opponentGenerateNarrativeBtn'),
        stopBtn: document.getElementById('opponentStopNarrativeBtn'),
        context: 'opponent'
    }
};
const loadingProgressBar = document.getElementById('loadingProgressBar');
const loadingStageLabel = document.getElementById('loadingStageLabel');
const loadingProgressLabels = document.querySelectorAll('[data-loading-label]');
const quickActionButtons = document.querySelectorAll('[data-open-tab]');

// PDF Modal
const pdfBtn = document.getElementById('pdfBtn');
const pdfPreviewModal = document.getElementById('pdfPreviewModal');
const closePdfPreviewBtn = document.getElementById('closePdfPreviewBtn');
const pdfPreviewFrame = document.getElementById('pdfPreviewFrame');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const pdfContent = document.getElementById('pdfContent');
let generatedPdfBlobUrl = null;

// Export Buttons
const exportButtons = document.getElementById('exportButtons');
const copyBtn = document.getElementById('copyBtn');
const videoBtn = document.getElementById('videoBtn');

// --- Single Player Tab ---
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const playerName = document.getElementById('playerName');
const playerAge = document.getElementById('playerAge');
const playerClub = document.getElementById('playerClub');
const playerLeague = document.getElementById('playerLeague');
const playerPositions = document.getElementById('playerPositions');
const matchContext = document.getElementById('matchContext');
const reportType = document.getElementById('reportType');
const dropZoneSingle = document.getElementById('dropZoneSingle');
const fileUploadSingle = document.getElementById('fileUploadSingle');
const imagePreviewSingle = document.getElementById('imagePreviewSingle');
const textStatsSingle = document.getElementById('textStatsSingle');
const analysisOutput = document.getElementById('analysisOutput');
const scanStatsBtn = document.getElementById('scanStatsBtn');
const visualizeStatsBtn = document.getElementById('visualizeStatsBtn');
const statsChartCanvas = document.getElementById('statsChart');
let statsChart = null;
let singlePlayerImages = []; // Store base64 images

// --- Comparison Tab ---
const analyzeCompareBtn = document.getElementById('analyzeCompareBtn');
const clearCompareBtn = document.getElementById('clearCompareBtn');
const dropZoneCompare1 = document.getElementById('dropZoneCompare1');
const fileUploadCompare1 = document.getElementById('fileUploadCompare1');
const imagePreviewCompare1 = document.getElementById('imagePreviewCompare1');
const textStatsCompare1 = document.getElementById('textStatsCompare1');
const p1Name = document.getElementById('p1Name');
const p1Age = document.getElementById('p1Age');
const p1Club = document.getElementById('p1Club');
const p1League = document.getElementById('p1League');
let compare1Images = [];

const dropZoneCompare2 = document.getElementById('dropZoneCompare2');
const fileUploadCompare2 = document.getElementById('fileUploadCompare2');
const imagePreviewCompare2 = document.getElementById('imagePreviewCompare2');
const textStatsCompare2 = document.getElementById('textStatsCompare2');
const p2Name = document.getElementById('p2Name');
const p2Age = document.getElementById('p2Age');
const p2Club = document.getElementById('p2Club');
const p2League = document.getElementById('p2League');
let compare2Images = [];
const analysisOutputCompare = document.getElementById('analysisOutputCompare');

// --- Opposition Tab ---
const analyzeOpponentBtn = document.getElementById('analyzeOpponentBtn');
const clearOpponentBtn = document.getElementById('clearOpponentBtn');
const saveOpponentAnalysisBtn = document.getElementById('saveOpponentAnalysisBtn');
const loadOpponentAnalysisBtn = document.getElementById('loadOpponentAnalysisBtn');
const opponentName = document.getElementById('opponentName');
const dropZoneOpponent = document.getElementById('dropZoneOpponent');
const fileUploadOpponent = document.getElementById('fileUploadOpponent');
const imagePreviewOpponent = document.getElementById('imagePreviewOpponent');
const textStatsOpponent = document.getElementById('textStatsOpponent');
const analysisOutputOpponent = document.getElementById('analysisOutputOpponent');
let opponentImages = [];

// --- Search Tab ---
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const searchError = document.getElementById('searchError');
const searchPosition = document.getElementById('searchPosition');
const searchAge = document.getElementById('searchAge');
const searchNationality = document.getElementById('searchNationality');
const searchMarketValue = document.getElementById('searchMarketValue');
const searchContract = document.getElementById('searchContract');
const searchMatches = document.getElementById('searchMatches');
const searchLeague = document.getElementById('searchLeague');
const searchClub = document.getElementById('searchClub');
const searchSimilar = document.getElementById('searchSimilar');
const searchStats = document.getElementById('searchStats');
const suggestStatsBtn = document.getElementById('suggestStatsBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
let csvContent = "";

// --- Chatbot Tab ---
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const newChatBtn = document.getElementById('newChatBtn');
let chatHistory = [];

// --- State ---
let currentTab = 'dashboard';
const LS_REPORT_KEY = 'proScoutSingleReports';
const STAGE_ORDER = ['upload', 'analysis', 'summary', 'download'];
const STAGE_TITLES = {
    upload: 'Preparing Assets',
    analysis: 'Running Analysis',
    summary: 'Building Summary',
    download: 'Finalizing Export'
};
let savedReports = [];
let analysisViews = { summary: '', detailed: '', tactical: '', data: '' };
let currentAnalysisView = 'summary';
let speechUtterance = null;
const funnyLoadingMessages = [
    "Brewing some tactical tea...",
    "Analyzing... Did he really just try that flick?",
    "Asking the VAR... just kidding.",
    "Calculating xG (Expected Genius)...",
    "Polishing the heatmap...",
    "Finding similar players... not just his cousin.",
    "Scouting for hidden gems...",
    "Checking contract clauses... mostly the buyout one.",
    "Re-watching the match... at 2x speed."
];

// --- Utility Functions ---

function showLoading(text, stage) {
    if (text) {
        loadingText.textContent = text;
    } else {
        loadingText.textContent = funnyLoadingMessages[Math.floor(Math.random() * funnyLoadingMessages.length)];
    }
    updateWorkflowStage(stage || 'upload');
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    if (loadingProgressBar) {
        loadingProgressBar.style.width = '0%';
    }
    if (loadingStageLabel) {
        loadingStageLabel.textContent = STAGE_TITLES.upload;
    }
    if (loadingProgressLabels && loadingProgressLabels.length) {
        loadingProgressLabels.forEach(label => label.classList.remove('active'));
    }
}

function updateWorkflowStage(stage) {
    const stageIndex = STAGE_ORDER.indexOf(stage);
    if (stageIndex === -1) return;

    if (loadingProgressBar) {
        const progress = STAGE_ORDER.length > 1
            ? (stageIndex / (STAGE_ORDER.length - 1)) * 100
            : 100;
        loadingProgressBar.style.width = `${Math.max(progress, 0)}%`;
    }

    if (loadingStageLabel) {
        loadingStageLabel.textContent = STAGE_TITLES[stage] || stage.toUpperCase();
    }

    if (loadingProgressLabels && loadingProgressLabels.length) {
        loadingProgressLabels.forEach(label => {
            const labelStage = label.dataset.loadingLabel;
            const labelIndex = STAGE_ORDER.indexOf(labelStage);
            if (labelIndex === -1) return;
            label.classList.toggle('active', labelIndex <= stageIndex);
        });
    }

}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
    hideLoading();
}

function closeError() {
    errorModal.classList.add('hidden');
}

function showHowToUse() {
    howToUseModal.classList.remove('hidden');
}

function closeHowToUse() {
    howToUseModal.classList.add('hidden');
}

function showPdfPreview() {
    pdfPreviewModal.classList.remove('hidden');
}

function closePdfPreview() {
    pdfPreviewModal.classList.add('hidden');
    if (generatedPdfBlobUrl) {
        URL.revokeObjectURL(generatedPdfBlobUrl);
        generatedPdfBlobUrl = null;
    }
    pdfPreviewFrame.src = 'about:blank';
}

function showLoadOpponentModal() {
    loadOpponentAnalyses(); // Populate list
    loadOpponentModal.classList.remove('hidden');
}

function closeLoadOpponentModal() {
    loadOpponentModal.classList.add('hidden');
}

function showTab(tabId) {
    // Hide all content
    tabContents.forEach(content => content.classList.add('hidden'));

    // Deactivate all buttons
    tabButtons.forEach(button => {
        button.classList.remove('border-sky-400', 'text-white');
        button.classList.add('border-transparent', 'text-slate-400', 'hover:text-white');
    });

    // Show selected content
    const contentToShow = document.getElementById(tabId + 'Tab');
    if (contentToShow) {
        contentToShow.classList.remove('hidden');
    }

    // Activate selected button
    const buttonToActivate = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (buttonToActivate) {
        buttonToActivate.classList.add('border-sky-400', 'text-white');
        buttonToActivate.classList.remove('border-transparent', 'text-slate-400');
    }

    currentTab = tabId;
}

function getAnalysisViewButtons() {
    return analysisViewControls ? analysisViewControls.querySelectorAll('.analysis-view-btn') : [];
}

function updateViewButtons(activeView) {
    const buttons = getAnalysisViewButtons();
    buttons.forEach(button => {
        if (button.dataset.view === activeView) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function applyReportTheme(theme) {
    if (!analysisContainer) return;
    analysisContainer.classList.remove('theme-default', 'theme-club', 'theme-agency', 'theme-academy');
    const themeClass = theme && theme !== 'default' ? `theme-${theme}` : 'theme-default';
    analysisContainer.classList.add(themeClass);
}

function renderAnalysisVisuals() {
    if (!analysisVisuals) return;
    analysisVisuals.innerHTML = '';
    if (!singlePlayerImages.length) {
        analysisVisuals.innerHTML = '<p class="text-xs text-slate-500">Upload heatmaps or stat boards to preview them alongside the report.</p>';
        return;
    }

    singlePlayerImages.forEach((img, index) => {
        const card = document.createElement('div');
        card.classList.add('relative', 'overflow-hidden', 'rounded-lg', 'border', 'border-slate-800', 'bg-slate-900/80');

        const image = document.createElement('img');
        image.src = img.preview || `data:${img.mimeType};base64,${img.base64}`;
        image.classList.add('w-full', 'h-28', 'object-cover', 'transition', 'duration-200', 'hover:scale-105');
        card.appendChild(image);

        const caption = document.createElement('div');
        caption.classList.add('absolute', 'bottom-0', 'left-0', 'right-0', 'bg-slate-900/75', 'text-[0.65rem]', 'text-slate-100', 'py-1', 'text-center', 'tracking-wide');
        caption.textContent = `Asset ${index + 1}`;
        card.appendChild(caption);

        analysisVisuals.appendChild(card);
    });
}

function prepareAnalysisViews(html, markdown) {
    analysisViews = buildAnalysisSections(html, markdown);
    if (analysisDataView) {
        const dataHtml = analysisViews.data || '<p class="text-slate-500">No structured data tables detected.</p>';
        renderSafeContent(analysisDataView, dataHtml);
    }
    showAnalysisView('summary');
    updateHighlights();
}

function getSectionPalette(title = '') {
    const lower = title.toLowerCase();
    if (lower.includes('strength')) {
        return { accent: '#14b8a6', text: '#5eead4', icon: '✅' };
    }
    if (lower.includes('weak')) {
        return { accent: '#f87171', text: '#fca5a5', icon: '⚠️' };
    }
    if (lower.includes('tactic')) {
        return { accent: '#6366f1', text: '#c7d2fe', icon: '♟️' };
    }
    if (lower.includes('position')) {
        return { accent: '#0ea5e9', text: '#bae6fd', icon: '📍' };
    }
    if (lower.includes('action')) {
        return { accent: '#a855f7', text: '#e9d5ff', icon: '🎯' };
    }
    if (lower.includes('mentality')) {
        return { accent: '#f97316', text: '#fed7aa', icon: '🧠' };
    }
    if (lower.includes('conclusion') || lower.includes('recommend')) {
        return { accent: '#22d3ee', text: '#bae6fd', icon: '📌' };
    }
    if (lower.includes('similar')) {
        return { accent: '#22c55e', text: '#bbf7d0', icon: '🤝' };
    }
    if (lower.includes('development') || lower.includes('plan')) {
        return { accent: '#38bdf8', text: '#bae6fd', icon: '📈' };
    }
    if (lower.includes('rating')) {
        return { accent: '#38bdf8', text: '#bae6fd', icon: '⭐' };
    }
    if (lower.includes('summary') || lower.includes('overview')) {
        return { accent: '#0ea5e9', text: '#bae6fd', icon: '📝' };
    }
    return { accent: '#7dd3fc', text: '#e0f2fe', icon: '📊' };
}

function buildAnalysisSections(html) {
    const sanitizedHtml = sanitizeHtmlContent(html);
    const views = { summary: '', detailed: sanitizedHtml, tactical: '', data: '' };
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${sanitizedHtml}</div>`, 'text/html');
    const container = doc.body.firstElementChild;
    if (!container) {
        views.summary = sanitizedHtml;
        views.tactical = sanitizedHtml;
        views.data = '<p class="text-slate-500">No structured data tables detected.</p>';
        return views;
    }

    const sections = [];
    const headings = container.querySelectorAll('h3');
    headings.forEach(heading => {
        const sectionContent = document.createElement('div');
        let next = heading.nextElementSibling;
        while (next && next.tagName !== 'H3') {
            sectionContent.appendChild(next.cloneNode(true));
            next = next.nextElementSibling;
        }
        sections.push({
            title: heading.textContent || '',
            html: sanitizeHtmlContent(sectionContent.innerHTML.trim())
        });
    });

    const tables = container.querySelectorAll('table');
    if (tables.length) {
        const tablesHtml = Array.from(tables).map(table => sanitizeHtmlContent(table.outerHTML)).join('');
        views.data = tablesHtml || '<p class="text-slate-500">No structured data tables detected.</p>';
    } else {
        views.data = '<p class="text-slate-500">No structured data tables detected.</p>';
    }

    const renderCard = (section) => {
        const palette = getSectionPalette(section.title);
        const safeTitle = escapeHtml(section.title || 'Untitled Section');
        const body = section.html && section.html.trim()
            ? sanitizeHtmlContent(section.html)
            : '<p class="text-slate-500 text-sm">No insights provided.</p>';
        return `
            <article class="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg shadow-slate-900/30">
                <span class="absolute inset-y-0 left-0 w-1.5" data-accent-color="${palette.accent}"></span>
                <div class="pl-4">
                    <div class="flex items-center gap-2">
                        <span class="text-base">${palette.icon || '📊'}</span>
                        <h4 class="text-lg font-semibold" data-text-color="${palette.text}">${safeTitle}</h4>
                    </div>
                    <div class="mt-3 prose prose-sm prose-invert max-w-none leading-relaxed space-y-3">${body}</div>
                </div>
            </article>
        `;
    };

    const renderGrid = (list) => {
        if (!list.length) return '';
        const gridHtml = `<div class="grid gap-4 lg:grid-cols-2 auto-rows-fr">${list.map(renderCard).join('')}</div>`;
        return sanitizeHtmlContent(gridHtml, { ALLOWED_TAGS: ['article'] });
    };

    const summarySections = sections.filter(section => /summary|overview|highlights|rating|conclusion|recommendation/i.test(section.title));
    const tacticalSections = sections.filter(section => /tactic|position|positional|phase|action|mentality|role|structure/i.test(section.title));

    const summarySelection = summarySections.length ? summarySections : sections.slice(0, Math.min(sections.length, 3));
    const tacticalSelection = tacticalSections.length ? tacticalSections : sections.filter(section => /tactic|position|action|mentality|phase/i.test(section.title)).slice(0, 4);

    views.summary = summarySelection.length ? renderGrid(summarySelection) : sanitizedHtml;
    views.tactical = tacticalSelection.length ? renderGrid(tacticalSelection) : (sections.length ? renderGrid(sections.slice(1, Math.min(sections.length, 4))) : sanitizedHtml);
    views.detailed = sections.length ? renderGrid(sections) : sanitizedHtml;

    return views;
}

function showAnalysisView(view) {
    currentAnalysisView = view;
    updateViewButtons(view);

    if (!analysisOutput) return;

    if (view === 'data') {
        analysisOutput.classList.add('hidden');
        if (analysisDataView) {
            const dataContent = analysisViews.data || '<p class="text-slate-500 text-sm">No structured data tables detected.</p>';
            renderSafeContent(analysisDataView, dataContent);
            analysisDataView.classList.remove('hidden');
        }
    } else {
        analysisOutput.classList.remove('hidden');
        if (analysisDataView) analysisDataView.classList.add('hidden');
        const content = analysisViews[view] || '<p class="text-slate-400">Run an analysis to populate this view.</p>';
        renderSafeContent(analysisOutput, content, { applyAccents: true });
    }
}

function updateHighlights() {
    if (!analysisSummary) return;
    const summaryHtml = analysisViews.summary;
    if (!summaryHtml) {
        renderSafeContent(analysisSummary, '<p class="text-xs text-slate-500">Generate a scouting report to see instant highlights.</p>');
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${summaryHtml}</div>`, 'text/html');
    doc.querySelectorAll('[data-highlight-ignore]').forEach(node => node.remove());
    const bullets = Array.from(doc.querySelectorAll('li')).map(li => li.textContent.trim()).filter(Boolean);
    const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean);

    if (bullets.length) {
        const list = document.createElement('ul');
        list.classList.add('list-disc', 'pl-4', 'space-y-1');
        bullets.slice(0, 4).forEach(text => {
            const item = document.createElement('li');
            item.textContent = text;
            list.appendChild(item);
        });
        analysisSummary.innerHTML = '';
        analysisSummary.appendChild(list);
    } else if (paragraphs.length) {
        const paragraphHtml = paragraphs.slice(0, 3).map(text => `<p>${escapeHtml(text)}</p>`).join('');
        renderSafeContent(analysisSummary, paragraphHtml);
    } else {
        renderSafeContent(analysisSummary, '<p class="text-xs text-slate-500">Highlights will appear once the AI generates a report.</p>');
    }
}

function resetAnalysisViews() {
    analysisViews = { summary: '', detailed: '', tactical: '', data: '' };
    if (analysisOutput) {
        renderSafeContent(analysisOutput, '<p class="text-slate-400">Your analysis will appear here. Start by filling out the fields on the left and click "Analyze Player".</p>');
        analysisOutput.classList.remove('hidden');
    }
    if (analysisDataView) {
        renderSafeContent(analysisDataView, '<p class="text-slate-500 text-sm">Switch back after running an analysis to view data tables here.</p>');
        analysisDataView.classList.add('hidden');
    }
    if (analysisSummary) {
        renderSafeContent(analysisSummary, '<p class="text-xs text-slate-500">Highlights will appear once the AI generates a report.</p>');
    }
    updateViewButtons('summary');
    currentAnalysisView = 'summary';
}

function loadSavedReports() {
    if (typeof localStorage === 'undefined') {
        savedReports = [];
        renderSavedReports();
        return;
    }
    try {
        const stored = localStorage.getItem(LS_REPORT_KEY);
        savedReports = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load saved reports', error);
        savedReports = [];
    }
    renderSavedReports();
}

function renderSavedReports() {
    if (!savedReportsList) return;

    savedReportsList.innerHTML = '';
    if (savedReportsGrid) savedReportsGrid.innerHTML = '';
    if (savedReportsEmptyState) savedReportsEmptyState.classList.add('hidden');

    if (!savedReports.length) {
        renderSafeContent(savedReportsList, '<p class="text-slate-400">No saved reports yet.</p>');
        if (savedReportsGrid) savedReportsGrid.innerHTML = '';
        if (savedReportsEmptyState) savedReportsEmptyState.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    savedReports.forEach(report => {
        const card = document.createElement('div');
        card.classList.add('bg-slate-900/80', 'border', 'border-slate-700', 'rounded-xl', 'p-4', 'flex', 'flex-col', 'gap-3');

        const header = document.createElement('div');
        header.classList.add('flex', 'items-center', 'justify-between');
        const title = document.createElement('p');
        title.classList.add('text-sm', 'font-semibold', 'text-white');
        title.textContent = report.playerName || 'Unnamed Player';
        const meta = document.createElement('span');
        meta.classList.add('text-xs', 'uppercase', 'tracking-wide', 'text-slate-500');
        meta.textContent = new Date(report.timestamp).toLocaleString();
        header.appendChild(title);
        header.appendChild(meta);

        const details = document.createElement('p');
        details.classList.add('text-xs', 'text-slate-400');
        details.textContent = `${report.reportType === 'pro' ? 'Pro Report' : 'Quick Report'} • Theme: ${report.theme || 'default'}`;

        const actions = document.createElement('div');
        actions.classList.add('flex', 'items-center', 'gap-2');

        const loadBtn = document.createElement('button');
        loadBtn.classList.add('flex-1', 'bg-sky-500/90', 'hover:bg-sky-400', 'text-slate-900', 'font-semibold', 'px-3', 'py-2', 'rounded-lg', 'transition');
        loadBtn.dataset.loadReport = report.id;
        loadBtn.textContent = 'Load';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('flex-1', 'bg-slate-700', 'hover:bg-slate-600', 'text-white', 'font-semibold', 'px-3', 'py-2', 'rounded-lg', 'transition');
        deleteBtn.dataset.deleteReport = report.id;
        deleteBtn.textContent = 'Delete';

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(header);
        card.appendChild(details);
        if (report.notes) {
            const notes = document.createElement('p');
            notes.classList.add('text-xs', 'text-slate-300');
            notes.textContent = report.notes;
            card.appendChild(notes);
        }
        card.appendChild(actions);

        savedReportsList.appendChild(card);

        if (savedReportsGrid) {
            const gridCard = document.createElement('article');
            gridCard.className = 'bg-slate-800/80 border border-slate-700 rounded-2xl shadow-lg p-5 flex flex-col gap-4 hover:border-sky-500/70 transition';

            const gridHeader = document.createElement('div');
            gridHeader.className = 'flex items-center justify-between';
            const gridTitle = document.createElement('h3');
            gridTitle.className = 'text-lg font-semibold text-white truncate';
            gridTitle.textContent = report.playerName || 'Unnamed Player';
            const gridBadge = document.createElement('span');
            gridBadge.className = 'text-xs uppercase tracking-[0.2em] text-slate-500';
            gridBadge.textContent = report.reportType === 'pro' ? 'Pro Report' : 'Quick Report';
            gridHeader.appendChild(gridTitle);
            gridHeader.appendChild(gridBadge);

            const gridMeta = document.createElement('p');
            gridMeta.className = 'text-xs text-slate-400';
            gridMeta.textContent = `${new Date(report.timestamp).toLocaleString()} • Theme: ${report.theme || 'default'}`;

            const gridFooter = document.createElement('div');
            gridFooter.className = 'flex items-center justify-between gap-2';

            const loadAction = document.createElement('button');
            loadAction.className = 'flex-1 inline-flex items-center justify-center gap-2 bg-sky-500/90 hover:bg-sky-400 text-slate-900 font-semibold px-3 py-2 rounded-xl transition';
            loadAction.dataset.loadReport = report.id;
            loadAction.innerHTML = '<i data-lucide="download" class="h-4 w-4"></i>Load';

            const deleteAction = document.createElement('button');
            deleteAction.className = 'flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:border-red-500 hover:text-red-300 text-slate-200 px-3 py-2 rounded-xl transition';
            deleteAction.dataset.deleteReport = report.id;
            deleteAction.innerHTML = '<i data-lucide="trash-2" class="h-4 w-4"></i>';

            gridFooter.appendChild(loadAction);
            gridFooter.appendChild(deleteAction);

            gridCard.appendChild(gridHeader);
            gridCard.appendChild(gridMeta);
            gridCard.appendChild(gridFooter);

            savedReportsGrid.appendChild(gridCard);
        }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function saveCurrentReport() {
    if (!analysisOutput || !analysisOutput.dataset.rawMarkdown) {
        showError('Generate a scouting report before saving.');
        return;
    }

    if (typeof localStorage === 'undefined') {
        showError('Saving reports is not supported in this environment.');
        return;
    }

    const report = {
        id: Date.now().toString(),
        playerName: playerName?.value?.trim() || 'Unnamed Player',
        age: playerAge?.value?.trim() || '',
        club: playerClub?.value?.trim() || '',
        league: playerLeague?.value?.trim() || '',
        positions: playerPositions?.value?.trim() || '',
        reportType: reportType?.value || 'quick',
        theme: reportTheme?.value || 'default',
        markdown: analysisOutput.dataset.rawMarkdown,
        timestamp: new Date().toISOString()
    };

    savedReports.unshift(report);
    localStorage.setItem(LS_REPORT_KEY, JSON.stringify(savedReports));
    renderSavedReports();

    if (saveReportBtn) {
        const original = saveReportBtn.innerHTML;
        saveReportBtn.innerHTML = '<i data-lucide="check" class="h-5 w-5"></i>Saved';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => {
            saveReportBtn.innerHTML = original;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 2000);
    }
}

function loadReportById(id) {
    const report = savedReports.find(item => item.id === id);
    if (!report) return;

    if (playerName) playerName.value = report.playerName || '';
    if (playerAge) playerAge.value = report.age || '';
    if (playerClub) playerClub.value = report.club || '';
    if (playerLeague) playerLeague.value = report.league || '';
    if (playerPositions) playerPositions.value = report.positions || '';
    if (reportType) reportType.value = report.reportType || 'quick';
    if (reportTheme) reportTheme.value = report.theme || 'default';
    applyReportTheme(reportTheme.value);

    analysisOutput.dataset.rawMarkdown = report.markdown;
    displayResults(report.markdown, analysisOutput);
    updateWorkflowStage('summary');
    closeReportModal();
    showTab('singlePlayer');
}

function deleteReportById(id) {
    savedReports = savedReports.filter(report => report.id !== id);
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LS_REPORT_KEY, JSON.stringify(savedReports));
    }
    renderSavedReports();
}

function openReportModal() {
    if (loadReportModal) loadReportModal.classList.remove('hidden');
}

function closeReportModal() {
    if (loadReportModal) loadReportModal.classList.add('hidden');
}

let activeNarrativeKey = null;

function populateNarrativeVoices() {
    const voices = typeof window.speechSynthesis !== 'undefined'
        ? window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'))
        : [];

    Object.values(narrativeBuilders).forEach(builder => {
        if (!builder?.voice) return;
        if (!voices.length) {
            builder.voice.innerHTML = '<option value="">System Default</option>';
            return;
        }
        builder.voice.innerHTML = voices.map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`).join('');
    });
}

function stopNarrativePlayback(builderKey = activeNarrativeKey) {
    if (typeof window.speechSynthesis !== 'undefined') {
        window.speechSynthesis.cancel();
    }
    speechUtterance = null;
    const builder = builderKey ? narrativeBuilders[builderKey] : null;
    if (builder?.stopBtn) {
        builder.stopBtn.classList.add('hidden');
    }
    activeNarrativeKey = null;
}

function speakNarrative(text, builderKey) {
    if (typeof window.speechSynthesis === 'undefined') return;
    stopNarrativePlayback();
    const builder = narrativeBuilders[builderKey];
    if (!builder) return;

    activeNarrativeKey = builderKey;
    speechUtterance = new SpeechSynthesisUtterance(text.replace(/[*_`]/g, ''));
    const duration = parseInt(builder.duration?.value || '60', 10);
    speechUtterance.rate = duration <= 45 ? 1.2 : duration >= 90 ? 0.9 : 1;

    if (builder.voice && builder.voice.value) {
        const targetVoice = window.speechSynthesis.getVoices().find(voice => voice.name === builder.voice.value);
        if (targetVoice) speechUtterance.voice = targetVoice;
    }

    speechUtterance.onend = () => {
        if (builder?.stopBtn) builder.stopBtn.classList.add('hidden');
        activeNarrativeKey = null;
    };

    window.speechSynthesis.speak(speechUtterance);
    if (builder?.stopBtn) builder.stopBtn.classList.remove('hidden');
}

function renderNarrativeStoryboard(rawText = '', builderKey) {
    const builder = narrativeBuilders[builderKey];
    if (!builder?.storyboard) return;

    const config = builderKey === 'player'
        ? {
            voice: 'Voice-Over Script',
            prompts: 'On-Screen Prompts',
            visuals: 'Recommended B-Roll',
            labels: ['Voice-Over Beats', 'On-Screen Prompts', 'B-Roll Ideas']
        }
        : {
            voice: 'Briefing Script',
            prompts: 'Key Slides',
            visuals: 'Final Reminder',
            labels: ['Briefing Beats', 'Slide Prompts', 'Closing Reminders']
        };

    const extractSection = (heading) => {
        if (!rawText) return '';
        const regex = new RegExp(`##\\s*${heading}[\\s\\S]*?(?=\\n##|$)`, 'i');
        const match = rawText.match(regex);
        if (!match) return '';
        return match[0].replace(/##[^\n]*\n?/, '').trim();
    };

    const cleanLine = (line) => escapeHtml(line.replace(/^[*-]\s*/, '').replace(/[*_`]/g, '').trim());
    const toItems = (block) => block
        .split(/\n+/)
        .map(cleanLine)
        .filter(Boolean);

    const voiceItems = toItems(extractSection(config.voice));
    const promptItems = toItems(extractSection(config.prompts));
    const visualItems = toItems(extractSection(config.visuals));

    const buildList = (items, ordered = false) => {
        if (!items.length) {
            return '<p class="text-xs text-slate-500">Will populate after generation.</p>';
        }
        const listTag = ordered ? 'ol' : 'ul';
        const listClass = ordered ? 'list-decimal' : 'list-disc';
        return `<${listTag} class="${listClass} pl-4 space-y-2 text-sm text-slate-200">${items.map(item => `<li>${item}</li>`).join('')}</${listTag}>`;
    };

    renderSafeContent(builder.storyboard, `
        <div class="grid gap-3 lg:grid-cols-3">
            <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <h4 class="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">${config.labels[0]}</h4>
                ${buildList(voiceItems, true)}
            </div>
            <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <h4 class="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">${config.labels[1]}</h4>
                ${buildList(promptItems)}
            </div>
            <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <h4 class="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">${config.labels[2]}</h4>
                ${buildList(visualItems)}
            </div>
        </div>
    `);
}

async function generateNarrativeVideo(builderKey) {
    const builder = narrativeBuilders[builderKey];
    if (!builder) return;

    const duration = builder.duration?.value || '60';
    const tone = builder.tone?.value || 'analytical';

    if (builderKey === 'player') {
        if (!analysisOutput || !analysisOutput.dataset.rawMarkdown) {
            showError('Generate a scouting report before building the narrative.');
            return;
        }

        const theme = reportTheme?.value || 'default';
        showLoading('Generating narrative storyboard...', 'analysis');
        if (builder.storyboard) {
            renderSafeContent(builder.storyboard, '<p class="text-xs text-slate-500">Drafting storyboard beats...</p>');
        }

        const prompt = `You are a creative football storyteller. Using the following scouting report, craft a ${duration}-second voice-over script with scene cues. Tone: ${tone}. Theme: ${theme}.\n\nReport:\n${analysisOutput.dataset.rawMarkdown}\n\nReturn Markdown with sections: \n## Voice-Over Script (2-3 paragraphs)\n## On-Screen Prompts (bullet list)\n## Recommended B-Roll (bullet list).`;

        try {
            const narrative = await callGeminiApi([{ text: prompt }], false);
            const formatted = formatChatText(narrative);
            if (builder.script) {
                renderSafeContent(builder.script, formatted);
            }
            renderNarrativeStoryboard(narrative, builderKey);
            speakNarrative(narrative, builderKey);
            updateWorkflowStage('summary');
        } catch (error) {
            showError(`Failed to build narrative: ${error.message}`);
        } finally {
            hideLoading();
        }
    } else if (builderKey === 'opponent') {
        const opponentContent = analysisOutputOpponent?.innerText?.trim();
        if (!opponentContent) {
            showError('Generate an opposition report before building the briefing.');
            return;
        }

        showLoading('Drafting opposition briefing...', 'analysis');
        if (builder.storyboard) {
            renderSafeContent(builder.storyboard, '<p class="text-xs text-slate-500">Drafting storyboard beats...</p>');
        }

        const prompt = `You are an elite tactical presenter. Summarize the following opposition scouting report into a ${duration}-second voice-over script with actionable cues. Tone: ${tone}.\n\nReport:\n${opponentContent}\n\nReturn Markdown with sections: \n## Briefing Script (2-3 paragraphs)\n## Key Slides (bullet list)\n## Final Reminder (1-2 bullet points).`;

        try {
            const narrative = await callGeminiApi([{ text: prompt }], false);
            const formatted = formatChatText(narrative);
            if (builder.script) {
                renderSafeContent(builder.script, formatted);
            }
            renderNarrativeStoryboard(narrative, builderKey);
            speakNarrative(narrative, builderKey);
            updateWorkflowStage('summary');
        } catch (error) {
            showError(`Failed to build briefing narrative: ${error.message}`);
        } finally {
            hideLoading();
        }
    }
}

// --- Image Upload Handling ---

function setupUploadListeners(dropZone, fileInput, previewEl, imageArray) {
    if (!dropZone || !fileInput) return;

    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-sky-500', 'bg-slate-700');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-sky-500', 'bg-slate-700');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-sky-500', 'bg-slate-700');
        handleFiles(e.dataTransfer.files, previewEl, imageArray);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files, previewEl, imageArray);
    });

    // Paste
    dropZone.addEventListener('paste', (e) => {
        handlePaste(e, previewEl, imageArray);
    });
}

function handlePaste(e, previewEl, imageArray) {
    e.preventDefault(); // Prevent browser from opening pasted image
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                processFile(blob, previewEl, imageArray);
            }
        }
    }
}

function handleFiles(files, previewEl, imageArray) {
    if (!files) return;
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            processFile(file, previewEl, imageArray);
        }
    }
}

function processFile(file, previewEl, imageArray) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        const mimeType = file.type;

        // Store base64 string without data prefix for the API
        const apiData = {
            base64: base64.split(',')[1],
            mimeType: mimeType,
            preview: base64
        };
        imageArray.push(apiData);

        // Update preview
        updateImagePreviews(previewEl, imageArray);
    };
    reader.readAsDataURL(file);
}

function updateImagePreviews(previewEl, imageArray) {
    if (!previewEl) return;
    previewEl.innerHTML = '';

    imageArray.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('relative', 'group');

        const img = document.createElement('img');
        const src = item.preview || `data:${item.mimeType};base64,${item.base64}`;
        img.src = src;
        img.classList.add('w-full', 'h-24', 'object-cover', 'rounded-lg', 'shadow-md');
        div.appendChild(img);

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.classList.add('absolute', 'top-1', 'right-1', 'bg-red-600', 'text-white', 'rounded-full', 'w-5', 'h-5', 'flex', 'items-center', 'justify-center', 'text-xs', 'font-bold', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity');
        removeBtn.onclick = () => {
            imageArray.splice(index, 1);
            updateImagePreviews(previewEl, imageArray);
        };
        div.appendChild(removeBtn);

        previewEl.appendChild(div);
    });

    if (previewEl === imagePreviewSingle) {
        renderAnalysisVisuals();
    }
}


// --- Clear Inputs Functions ---
function clearSinglePlayerInputs() {
    if(playerName) playerName.value = '';
    if(playerAge) playerAge.value = '';
    if(playerClub) playerClub.value = '';
    if(playerLeague) playerLeague.value = '';
    if(playerPositions) playerPositions.value = '';
    if(matchContext) matchContext.value = '';
    if(reportType) reportType.value = 'quick';
    if(reportTheme) {
        reportTheme.value = 'default';
        applyReportTheme('default');
    }
    if(imagePreviewSingle) imagePreviewSingle.innerHTML = '';
    singlePlayerImages = [];
    if(textStatsSingle) textStatsSingle.value = '';
    if(analysisOutput) delete analysisOutput.dataset.rawMarkdown;
    resetAnalysisViews();
    renderAnalysisVisuals();
    stopNarrativePlayback();
    if(narrativeScript) renderSafeContent(narrativeScript, '<p class="text-xs text-slate-500">Run a report to generate a narrative storyboard.</p>');
    if (statsChart) {
        statsChart.destroy();
        statsChart = null;
    }
    if(visualizeStatsBtn) visualizeStatsBtn.disabled = true;
    if(exportButtons) exportButtons.classList.add('hidden');
    updateWorkflowStage('upload');
}

function clearCompareInputs() {
    if(p1Name) p1Name.value = '';
    if(p1Age) p1Age.value = '';
    if(p1Club) p1Club.value = '';
    if(p1League) p1League.value = '';
    if(p2Name) p2Name.value = '';
    if(p2Age) p2Age.value = '';
    if(p2Club) p2Club.value = '';
    if(p2League) p2League.value = '';
    if(imagePreviewCompare1) imagePreviewCompare1.innerHTML = '';
    compare1Images = [];
    if(textStatsCompare1) textStatsCompare1.value = '';
    if(imagePreviewCompare2) imagePreviewCompare2.innerHTML = '';
    compare2Images = [];
    if(textStatsCompare2) textStatsCompare2.value = '';
    if(analysisOutputCompare) renderSafeContent(analysisOutputCompare, '<p class="text-slate-400">Comparison cleared.</p>');
}

function clearOpponentInputs() {
    if(opponentName) opponentName.value = '';
    if(imagePreviewOpponent) imagePreviewOpponent.innerHTML = '';
    opponentImages = [];
    if(textStatsOpponent) textStatsOpponent.value = '';
    if(analysisOutputOpponent) renderSafeContent(analysisOutputOpponent, '<p class="text-slate-400">Opposition analysis cleared.</p>');
}

function clearSearchInputs() {
     if(searchPosition) searchPosition.value = '';
    if(searchAge) searchAge.value = '';
    if(searchNationality) searchNationality.value = '';
    if(searchMarketValue) searchMarketValue.value = '';
    if(searchContract) searchContract.value = '';
    if(searchMatches) searchMatches.value = '';
    if(searchLeague) searchLeague.value = '';
    if(searchClub) searchClub.value = '';
    if(searchStats) searchStats.value = '';
    if(searchSimilar) searchSimilar.value = '';
    if(suggestStatsBtn) suggestStatsBtn.disabled = true;
    if(searchResults) renderSafeContent(searchResults, '<p class="text-slate-400">Your search results will appear here.</p>');
    if(searchError) searchError.classList.add('hidden');
    if(downloadCsvBtn) downloadCsvBtn.classList.add('hidden');
}

// --- Main Analysis Logic ---

// callGeminiApi and invokeGemini are imported from ./api/geminiClient.js

async function scanStatsFromImage() {
    if (singlePlayerImages.length === 0) {
        showError("Please upload at least one image to scan for stats.");
        return;
    }

    showLoading("Scanning images for stats...");

    const parts = [
        { text: "Analyze the provided image(s). Extract any player statistics visible (e.g., Goals, Assists, Tackles, Pass Accuracy, etc.). Format them as a simple key-value list, like 'Goals: 1\nTackles: 3/4\nPass Accuracy: 88%'. Only return the extracted stats." }
    ];

    singlePlayerImages.forEach(img => {
        parts.push({
            inlineData: {
                mimeType: img.mimeType,
                data: img.base64
            }
        });
    });

    try {
        const extractedStats = await callGeminiApi(parts);
        textStatsSingle.value += (textStatsSingle.value ? '\n' : '') + extractedStats;
        if(visualizeStatsBtn) visualizeStatsBtn.disabled = false; // Enable visualization
    } catch (error) {
        showError(`Failed to scan stats: ${error.message}`);
    } finally {
        hideLoading();
    }
}


async function analyzeSinglePlayer() {
    updateWorkflowStage('analysis');
    showLoading(null, 'analysis');
    if(analysisOutput) {
        analysisOutput.innerHTML = '';
        delete analysisOutput.dataset.rawMarkdown;
    }
    if(exportButtons) exportButtons.classList.add('hidden');

    const parts = [];
    const info = {
        name: playerName.value.trim(),
        age: playerAge.value.trim(),
        club: playerClub.value.trim(),
        league: playerLeague.value.trim(),
        positions: playerPositions.value.trim(),
        match: matchContext.value.trim(),
    };

    // --- Build the Prompt ---
    let prompt = "You are a world-class professional football scout. Analyze the provided data to create a scouting report.\n\n";
    prompt += "--- Player Information ---\n";
    prompt += `Name: ${info.name || 'N/A'}\n`;
    prompt += `Age: ${info.age || 'N/A'}\n`;
    prompt += `Club: ${info.club || 'N/A'}\n`;
    prompt += `League: ${info.league || 'N/A'}\n`;
    prompt += `Stated Position(s): ${info.positions || 'N/A'}\n`;
    prompt += `Match Context: ${info.match || 'N/A'}\n\n`;

    prompt += "--- Provided Stats (Text) ---\n";
    prompt += `${textStatsSingle.value.trim() || 'No text stats provided.'}\n\n`;

    prompt += "--- INSTRUCTIONS ---\n";
    prompt += "Analyze the heatmap images, stats images, and text data.\n";
    prompt += "Immediately after Section 1, include a markdown table with columns | Category | Grade | Comment | covering at minimum Defensive Ability, Attacking Impact, and Tactical Fit. Use letter grades (A+ to F).\n";

    if (reportType.value === 'quick') {
        prompt += "Generate a 'Quick Report' using the following 7-point template. Be detailed and insightful for each section. Use markdown headers (e.g., '## 1. Title') and '---' separators.\n";
        prompt += "## 1. AI-Calculated Performance Rating\n(Provide a rating (e.g., B+, 7.5/10) and 1-2 sentences justifying it based on the data. Follow this section with the required Category/Grade/Comment table.)\n\n---\n\n";
        prompt += "## 2. Likely Position(s) & Role\n(Based on the heatmap and stats, what is their most likely position and tactical role? e.g., 'Deep-Lying Playmaker', 'Inverted Winger')\n\n---\n\n";
        prompt += "## 3. Key Duties & Playstyle\n(Describe their main actions and style. e.g., 'Controls tempo, progressive passer, avoids 1v1 duels.')\n\n---\n\n";
        prompt += "## 4. Key Strengths (Pros)\n(List 3-4 bullet points based on the data.)\n\n---\n\n";
        prompt += "## 5. Key Weaknesses (Cons)\n(List 2-3 bullet points based on the data.)\n\n---\n\n";
        prompt += "## 6. Suggested Similar Player\n(Suggest ONE well-known player with a similar playstyle and justify it.)\n\n---\n\n";
        prompt += "## 7. Suggested Development Plan\n(Based on the 'Cons', suggest 2-3 actionable development points.)\n";
    } else {
        prompt += "Generate a 'Pro Scout Report' using the following 8-point professional template. Be extremely detailed, analytical, and use scouting terminology. Use markdown headers (e.g., '## 1. Title') and '---' separators between sections.\n\n";
        prompt += "## 1. AI-Calculated Performance Rating\n(Provide a rating (e.g., 'A-' or '8.0/10') and a 1-2 sentence justification based *only* on the provided match data. Follow this section with the required Category/Grade/Comment table.)\n\n---\n\n";
        prompt += "## 2. Summary (Overview)\n(A brief overview of the player's performance, role, key strengths, and areas for improvement.)\n\n---\n\n";
        prompt += "## 3. Positional Play\n(Analyze positioning in Offensive, Defensive, and Transition phases based on the heatmap and stats.)\n\n---\n\n";
        prompt += "## 4. Key Actions (PMDS Framework)\n(Break down their most critical actions using PMDS: Position, Moment, Direction, Speed. e.g., 'Pressing: Showed good speed to close down, but his direction was poor, opening a passing lane.')\n\n---\n\n";
        prompt += "## 5. Tactical Awareness (Four Phases)\n(Assess their decision-making. Communication: Did they scan? Decision (What): Pass, dribble, shoot? Decision (How): Type of pass/dribble? Execution: Technical outcome.)\n\n---\n\n";
        prompt += "## 6. Mentality\n(Infer qualities from the data. Work rate (from heatmap), Composure (from pass % under pressure), Leadership, etc.)\n\n---\n\n";
        prompt += "## 7. Conclusion & Recommendation\n(Summarize potential, system suitability (e.g., 'Suits a high-press system'), and a final recommendation (e.g., 'Monitor', 'Sign').)\n\n---\n\n";
        prompt += "## 8. Similar Player Matrix\n(Provide 4 player comparisons in a markdown table:\n- **Top 5 League:** [Player Name] (e.g., Premier League, La Liga)\n- **Mid-Tier League:** [Player Name] (e.g., Eredivisie, MLS, Championship)\n- **Current League:** [Player Name] (A top player in their *current* league)\n- **Historical:** [Player Name] (A retired player))\n";
    }

    parts.push({ text: prompt });

    // Add images
    if (singlePlayerImages.length === 0) {
        showError("Please upload at least one image for analysis.");
        hideLoading();
        return;
    }
    singlePlayerImages.forEach(img => {
        parts.push({
            inlineData: {
                mimeType: img.mimeType,
                data: img.base64
            }
        });
    });

    try {
        const resultText = await callGeminiApi(parts);
        displayResults(resultText, analysisOutput);
        if(exportButtons) exportButtons.classList.remove('hidden');
        updateWorkflowStage('summary');
    } catch (error) {
        showError(`Analysis failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function analyzeComparison() {
    showLoading(); // Show random funny message
    if(analysisOutputCompare) analysisOutputCompare.innerHTML = '';

    const parts = [];

    const p1Info = `Player 1: ${p1Name.value || 'P1'} (Age: ${p1Age.value || 'N/A'}, Club: ${p1Club.value || 'N/A'}, League: ${p1League.value || 'N/A'})`;
    const p2Info = `Player 2: ${p2Name.value || 'P2'} (Age: ${p2Age.value || 'N/A'}, Club: ${p2Club.value || 'N/A'}, League: ${p2League.value || 'N/A'})`;

    let prompt = `You are a professional scout. Create a Head-to-Head analysis of two players.\n\n${p1Info}\n${p2Info}\n\n--- INSTRUCTIONS ---\n`;
    prompt += "Analyze all the provided data for both players. Create a detailed comparison using the following template. Use markdown headers (e.g., '## 1. Title') and '---' separators.\n\n";
    prompt += "## 1. Role & Playstyle Comparison\n(Describe and contrast their tactical roles and style of play.)\n\n---\n\n";
    prompt += "## 2. Head-to-Head: Key Strengths\n(Compare their pros in a side-by-side manner.)\n\n---\n\n";
    prompt += "## 3. Head-to-Head: Key Weaknesses\n(Compare their cons in a side-by-side manner.)\n\n---\n\n";
    prompt += "## 4. Statistical Standout\n(Which player has the more impressive statistical profile and why?)\n\n---\n\n";
    prompt += "## 5. Verdict & Recommendation\n(Conclude with a final summary of who is the better prospect or a better fit for a specific tactical system.)\n\n";

    prompt += "--- Player 1 Data ---\n";
    prompt += `Stats: ${textStatsCompare1.value.trim() || 'N/A'}\n\n`;
    prompt += "Player 1 Images (Heatmaps, Stats):\n";

    parts.push({ text: prompt });
    if (compare1Images.length === 0) parts.push({ text: "No images provided for Player 1."});
    compare1Images.forEach(img => {
        parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
    });

    prompt = "\n--- Player 2 Data ---\n";
    prompt += `Stats: ${textStatsCompare2.value.trim() || 'N/A'}\n\n`;
    prompt += "Player 2 Images (Heatmaps, Stats):\n";

    parts.push({ text: prompt });
    if (compare2Images.length === 0) parts.push({ text: "No images provided for Player 2."});
    compare2Images.forEach(img => {
        parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
    });

    try {
        const resultText = await callGeminiApi(parts);
        displayResults(resultText, analysisOutputCompare);
    } catch (error) {
        showError(`Comparison failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function analyzeOpposition() {
    showLoading(); // Show random funny message
    if(analysisOutputOpponent) analysisOutputOpponent.innerHTML = '';

    const parts = [];
    const oppName = opponentName.value.trim();
    const oppStats = textStatsOpponent.value.trim();
    const nameOnly = oppName && !oppStats && opponentImages.length === 0;

    let prompt = `You are a professional tactical analyst. Create an opposition scouting report for ${oppName || 'the opponent'}.\n\n`;

    if (nameOnly) {
        prompt += "--- INSTRUCTIONS ---\n";
        prompt += "You have *only* been given the opponent's name. Use Google Search to find public information about their recent tactical setup, playstyle, strengths, and weaknesses.\n";
        prompt += "Then, generate a concise tactical report using this template. Use markdown headers (e.g., '## 1. Title') and '---' separators.\n\n";
        prompt += `If you cannot find *any* useful tactical information on "${oppName}", please return *only* a funny, lighthearted message. For example: 'Sorry, boss, my scouts came up empty on ${oppName}. They must be using invisible ink for their tactics!' or 'Couldn't find any data on ${oppName}. Are we sure they're not a U-12 team?'\n\n`;
    } else {
         prompt += "--- Provided Data ---\n";
        prompt += `Stats/Notes: ${oppStats || 'N/A'}\n\n`;
        prompt += "--- INSTRUCTIONS ---\n";
        prompt += "Analyze the provided images (formations, heatmaps) and text notes. \n";
    }

    prompt += "## 1. Tactical Setup & Playstyle\n(Describe their likely formation, style in possession, and defensive structure.)\n\n---\n\n";
    prompt += "## 2. Key Strengths & Threats\n(List 3-4 key tactical strengths or dangerous players.)\n\n---\n\n";
    prompt += "## 3. Key Weaknesses & Vulnerabilities\n(List 2-3 exploitable weaknesses in their system or personnel.)\n\n---\n\n";
    prompt += "## 4. Suggested Exploitation Plan\n(Provide actionable advice on how to beat this team. e.g., 'Exploit high press with balls over the top', 'Target their weak left-back in 2v1 situations'.)\n";

    parts.push({ text: prompt });

    if (!nameOnly) {
        if (opponentImages.length === 0) parts.push({ text: "No images provided."});
        opponentImages.forEach(img => {
            parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
        });
    }

    try {
        const resultText = await callGeminiApi(parts, nameOnly); // Use grounding if nameOnly is true
        displayResults(resultText, analysisOutputOpponent);
    } catch (error) {
        showError(`Opposition analysis failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function handleSearch() {
    showLoading("Searching for players...");
    if(searchError) searchError.classList.add('hidden');
    if(searchResults) renderSafeContent(searchResults, '<p class="text-slate-400">Searching...</p>');
    if(downloadCsvBtn) downloadCsvBtn.classList.add('hidden');

    const queryParts = [];
    if (searchPosition.value.trim()) queryParts.push(`Position: ${searchPosition.value.trim()}`);
    if (searchAge.value.trim()) queryParts.push(`Age: ${searchAge.value.trim()}`);
    if (searchNationality.value.trim()) queryParts.push(`Nationality/Passport: ${searchNationality.value.trim()}`);
    if (searchMarketValue.value.trim()) queryParts.push(`Market Value: ${searchMarketValue.value.trim()}`);
    if (searchContract.value.trim()) queryParts.push(`Contract Expires: ${searchContract.value.trim()}`);
    if (searchStats.value.trim()) queryParts.push(`Specific Stats: ${searchStats.value.trim()}`);
    if (searchMatches.value.trim()) queryParts.push(`Matches/Minutes: ${searchMatches.value.trim()}`);
    if (searchLeague.value.trim()) queryParts.push(`Has the potential quality or playstyle suitable for: ${searchLeague.value.trim()} (This is a scout assessment, they don't have to be playing in that league currently).`);
    if (searchClub.value.trim()) queryParts.push(`Has the potential quality or playstyle suitable for: ${searchClub.value.trim()} (This is a scout assessment of tactical fit).`);
    if (searchSimilar && searchSimilar.value.trim()) queryParts.push(`Search for players stylistically similar to: ${searchSimilar.value.trim()}`);

    if (queryParts.length === 0) {
        showSearchError("Please enter at least one search criterion.");
        return;
    }

    const fullQuery = `
Based on publicly available data and tactical analysis from Google Search, find up to 25 football players who match the following criteria:
- ${queryParts.join('\n- ')}

One key criterion is "Suitable for League/Club." This means you should assess if the player's *potential* and *playstyle* match that league/club, not just if they *currently* play in it.

For each player, find their latest news headline (e.g., transfer rumors, injury update, recent performance).

Format the result as a simple HTML table (no classes) with columns: 
Name, Age, Club, Nationality, Position, Market Value (Est.), Contract Expires, Latest News (1 Headline)

If a value is unknown, use "N/A".
Do not include any text before or after the HTML table.
`;

    if(searchButton) searchButton.disabled = true;
    try {
        const resultHtml = await callGeminiApi([{ text: fullQuery }], true); // Use grounding
        const sanitizedTable = sanitizeHtmlContent(resultHtml);

        // Style the HTML table with Tailwind
        let styledHtml = sanitizedTable
            .replace(/<table>/g, '<table class="w-full text-left border-collapse">')
            .replace(/<thead>/g, '<thead class="bg-slate-700">')
            .replace(/<th>/g, '<th class="p-3 border-b border-slate-600 text-sm font-semibold text-white">')
            .replace(/<tbody>/g, '<tbody class="divide-y divide-slate-700">')
            .replace(/<tr>/g, '<tr class="hover:bg-slate-800">')
            .replace(/<td>/g, '<td class="p-3 border-b border-slate-700 text-sm">');

        if(searchResults) renderSafeContent(searchResults, styledHtml);

        // Prepare CSV content
        csvContent = "Name,Age,Club,Nationality,Position,Market Value (Est.),Contract Expires,Latest News\n";
        const table = new DOMParser().parseFromString(sanitizedTable, 'text/html').querySelector('table');
        if (table) {
            table.querySelectorAll('tbody tr').forEach(row => {
                const rowData = [];
                row.querySelectorAll('td').forEach(cell => {
                    rowData.push(`"${cell.textContent.trim().replace(/"/g, '""')}"`);
                });
                csvContent += rowData.join(',') + '\n';
            });
            if(downloadCsvBtn) downloadCsvBtn.classList.remove('hidden');
        }

    } catch (error) {
        showSearchError(`Search failed: ${error.message}`);
    } finally {
        hideLoading();
        if(searchButton) searchButton.disabled = false;
    }
}

async function suggestStats() {
    const position = searchPosition.value.trim();
    if (!position) {
        showError("Please enter a position first to get stat suggestions.");
        return;
    }

    showLoading("Suggesting stats...");
    if(suggestStatsBtn) suggestStatsBtn.disabled = true;

    const prompt = `You are a professional football scout. Based on the position(s) "${position}", suggest 5-7 key statistics (both basic and advanced) a scout should look for.
    Format the answer as a simple, comma-separated list.
    Example: Goals, Assists, Pass Accuracy, Progressive Passes, Tackles Won

    Do not add any other text, just the comma-separated list.`;

    try {
        const statsList = await callGeminiApi([{ text: prompt }], false); // No grounding needed

        if (searchStats.value.trim().length > 0 && !searchStats.value.endsWith(',')) {
            searchStats.value += ', ';
        }
        searchStats.value += statsList.trim();

    } catch (error) {
        showError(`Failed to suggest stats: ${error.message}`);
    } finally {
        hideLoading();
        if(suggestStatsBtn) suggestStatsBtn.disabled = false;
    }
}

function showSearchError(message) {
    if(searchError) {
        searchError.textContent = message;
        searchError.classList.remove('hidden');
    }
    if(searchResults) renderSafeContent(searchResults, '<p class="text-slate-400">Search failed. Please try again.</p>');
    hideLoading();
}

function downloadCSV() {
    if (!csvContent) return;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'player_search_results.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

async function handleChat() {
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Add user message to UI
    addChatMessage('User', userText);
    chatInput.value = '';
    chatInput.disabled = true;
    chatSendBtn.disabled = true;

    // Add user message to history
    chatHistory.push({ role: 'user', parts: [{ text: userText }] });

    // Add loading indicator
    const loadingEl = addChatMessage('Scout AI', '...');

    try {
        const resultText = await callChatbotApi();

        // Add model message to history
        chatHistory.push({ role: 'model', parts: [{ text: resultText }] });

        // Update loading message with real response
        if(loadingEl) loadingEl.querySelector('.chat-content').innerHTML = formatChatText(resultText);

    } catch (error) {
        if (loadingEl) {
            const safeError = escapeHtml(error.message || 'An unexpected error occurred.');
            loadingEl.querySelector('.chat-content').innerHTML = `<p class="text-red-400">Error: ${safeError}</p>`;
        }
    } finally {
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.focus();
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

async function callChatbotApi() {
    const payload = {
        contents: chatHistory, // Send the whole history
        tools: [{ "google_search": {} }], // Use grounding
        systemInstruction: {
            parts: [{ text: "You are a professional football scout and tactical analyst. Answer the user's questions with this persona. Use Google Search to find up-to-date information. Format your answers clearly with headings, lists, and bold text." }]
        }
    };

    let result;
    try {
        result = await invokeGemini(payload);
    } catch (error) {
        console.error('Chatbot request failed:', error);
        throw new Error(error.message || 'Failed to contact the AI service.');
    }

    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
        return result.candidates[0].content.parts[0].text;
    } else if (result.candidates && result.candidates[0].finishReason === "SAFETY") {
        throw new Error("Response blocked by safety settings.");
    } else {
        console.warn("Unexpected API response structure:", result);
        throw new Error("Could not parse the AI's response.");
    }
}

function addChatMessage(sender, text) {
    const senderClass = sender === 'User' ? 'bg-slate-800 self-end' : 'bg-slate-700 self-start';
    const senderNameClass = sender === 'User' ? 'text-teal-300' : 'text-sky-300';

    const messageEl = document.createElement('div');
    messageEl.classList.add('p-3', 'rounded-lg', 'max-w-3/4', 'w-fit', ...senderClass.split(' '));
    messageEl.innerHTML = `
        <p class="font-semibold ${senderNameClass} mb-1">${sender}</p>
        <div class="chat-content prose prose-sm prose-invert max-w-none">${formatChatText(text)}</div>
    `;
    if(chatWindow) {
        chatWindow.appendChild(messageEl);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    return messageEl;
}

function formatChatText(text) {
     // Basic markdown-to-HTML
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
        .replace(/^# (.*)/gm, '<h3 class="text-xl font-semibold text-white mt-3 mb-2">$1</h3>') // H1 -> H3
        .replace(/^## (.*)/gm, '<h4 class="text-lg font-semibold text-white mt-3 mb-2">$1</h4>') // H2 -> H4
        .replace(/^### (.*)/gm, '<h5 class="text-md font-semibold text-white mt-3 mb-2">$1</h5>') // H3 -> H5
        .replace(/^- (.*)/gm, '<li class="ml-4">$1</li>') // List items
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>') // Wrap lists
        .replace(/\n/g, '<br>'); // Newlines

    return sanitizeHtmlContent(html);
}

function newChat() {
    chatHistory = [];
    if(chatWindow) chatWindow.innerHTML = '';
    addChatMessage('Scout AI', 'Hi! Ask me anything, like "What is the tactical style of Brighton?" or "Summarize Lamine Yamal\'s stats this season."');
}


// --- Output Formatting ---
function displayResults(text, element) {
    if (!element) return;

    const rawText = text;
    let processedText = rawText;

    // Handle markdown tables
    processedText = processedText.replace(/\|(.*?)\|/g, (match, content) => `|${content.trim()}|`); // Trim whitespace inside cells
    processedText = processedText.replace(/(\|(?:[^\r\n\|]+\|)+)\r?\n\|(?: *\:?\-+\:? *\|)+/g, (match, headerRow) => {
        let header = `<thead><tr class="bg-slate-700">`;
        headerRow.split('|').filter(Boolean).forEach(h => {
            header += `<th class="p-2 border border-slate-600">${h.trim()}</th>`;
        });
        header += `</tr></thead>`;
        return header;
    });
    processedText = processedText.replace(/^\|(.*?)\|$/gm, (match, rowContent) => {
        let row = `<tr>`;
        rowContent.split('|').filter(Boolean).forEach(cell => {
            row += `<td class="p-2 border border-slate-600">${cell.trim()}</td>`;
        });
        row += `</tr>`;
        return row;
    });
    processedText = processedText.replace(/(<thead>(?:.|\n)*?<\/thead>)((?:<tr>(?:.|\n)*?<\/tr>)+)/g, '<table class="w-full text-left border-collapse border border-slate-600 my-4">$1<tbody>$2</tbody></table>');


    let html = processedText
        .replace(/^#+ 1\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/^#+ 2\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/^#+ 3\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/^#+ 4\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/^#+ 5\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/^#+ 6\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/^#+ 7\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/^#+ 8\. (.*)/gm, '<h3 class="text-xl font-semibold text-sky-300 mt-4 mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*)/gm, '<li class="ml-4">$1</li>')
        .replace(/^(?!<h3|<li|<table|<thead|<tbody|<tr)(.*)/gm, '<p>$1</p>') // Wrap non-header/list/table lines in <p>
        .replace(/<p><\/p>/g, '') // Remove empty paragraphs
        .replace(/<\/li><p>/g, '</li>') // Fix spacing
        .replace(/<\/p><p>/g, '</p><p class="mt-2">')
        .replace(/---/g, '<hr class="border-slate-700 my-4">'); // Add horizontal rules

    if (element.id === 'analysisOutput') {
        element.dataset.rawMarkdown = rawText;
    }

    const safeHtml = sanitizeHtmlContent(html);

    if (element.id === 'analysisOutput') {
        prepareAnalysisViews(safeHtml, rawText);
    } else {
        renderSafeContent(element, safeHtml);
    }
}

function copyToClipboard() {
    if (!analysisOutput) return;
    const reportText = currentAnalysisView === 'data' && analysisDataView
        ? analysisDataView.innerText
        : analysisOutput.innerText;
    navigator.clipboard.writeText(reportText).then(() => {
        copyBtn.innerHTML = '<i data-lucide="check" class="h-5 w-5 mr-2"></i>Copied!';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => {
            copyBtn.innerHTML = '<i data-lucide="clipboard" class="h-5 w-5 mr-2"></i>Copy';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 2000);
    }).catch(err => {
        showError('Failed to copy to clipboard.');
    });
}

function findVideos() {
    const name = playerName.value.trim();
    if (!name) {
        showError("Please enter a player's name first.");
        return;
    }
    // Switch to chatbot tab
    showTab('chatbot');
    // Auto-fill and send query
    const query = `Find recent match highlights and performance videos for ${name}`;
    chatInput.value = query;
    handleChat();
}

// --- Stats Visualization ---
function visualizeStats() {
    if (!textStatsSingle) return;
    const text = textStatsSingle.value;
    const lines = text.split('\n');
    const data = {
        labels: [],
        values: []
    };

    const regex = /([\w\s\/]+):\s*([\d\.]+)[\/\s]*([\d\.]+)?/;

    lines.forEach(line => {
        const match = line.match(regex);
        if (match) {
            const label = match[1].trim();
            const value1 = parseFloat(match[2]);
            const value2 = parseFloat(match[3]);

            if (!isNaN(value2)) {
                // Handle fractional stats like "Tackles: 3/4"
                data.labels.push(`${label} (Success)`);
                data.values.push(value1);
                data.labels.push(`${label} (Failed)`);
                data.values.push(value2 - value1);
            } else if (!isNaN(value1)) {
                // Handle simple stats like "Goals: 1"
                data.labels.push(label);
                data.values.push(value1);
            }
        }
    });

    if (data.labels.length === 0) {
        showError("Could not find any stats to visualize. Make sure they are in 'Stat: Value' format (e.g., 'Goals: 1' or 'Tackles: 3/4').");
        return;
    }

    if (statsChart) {
        statsChart.destroy();
    }

    if (typeof Chart === 'undefined') {
        showError("Chart.js library is not loaded.");
        return;
    }

    statsChart = new Chart(statsChartCanvas, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Stats',
                data: data.values,
                backgroundColor: 'rgba(56, 189, 248, 0.6)', // sky-400
                borderColor: 'rgba(56, 189, 248, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Stats Visualization',
                    color: '#e2e8f0' // slate-200
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' }, // slate-400
                    grid: { color: '#334155' } // slate-700
                },
                y: {
                    ticks: { color: '#94a3b8' }, // slate-400
                    grid: { display: false }
                }
            }
        }
    });
}

// --- PDF Generation ---

function escapeHtml(str = '') {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function convertInlineMarkdown(text = '') {
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>');
}

function buildPdfTableHtml(lines) {
    if (!lines.length) return '';
    const headerCells = lines[0].split('|').filter(Boolean).map(cell => convertInlineMarkdown(cell.trim()));
    const bodyRows = [];
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row.startsWith('|')) break;
        if (/^\|\s*:?-+\s*:?(\|\s*:?-+\s*:?)*\|?$/.test(row)) continue;
        const cells = row.split('|').filter(Boolean).map(cell => convertInlineMarkdown(cell.trim()));
        if (cells.length) bodyRows.push(`<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`);
    }
    if (!bodyRows.length) return '';
    const headerHtml = `<thead><tr>${headerCells.map(cell => `<th>${cell}</th>`).join('')}</tr></thead>`;
    return `<table>${headerHtml}<tbody>${bodyRows.join('')}</tbody></table>`;
}

function formatMarkdownForPdf(markdown = '') {
    if (!markdown.trim()) return '<p class="pdf-empty">N/A</p>';
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const htmlParts = [];
    let buffer = [];

    const flushParagraph = () => {
        if (!buffer.length) return;
        htmlParts.push(`<p>${convertInlineMarkdown(buffer.join(' ').trim())}</p>`);
        buffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i].trim();
        if (!raw) {
            flushParagraph();
            continue;
        }

        if (raw === '---') {
            flushParagraph();
            htmlParts.push('<div class="pdf-divider"></div>');
            continue;
        }

        if (raw.startsWith('|')) {
            flushParagraph();
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i].trim());
                i++;
            }
            i--;
            const tableHtml = buildPdfTableHtml(tableLines);
            if (tableHtml) htmlParts.push(tableHtml);
            continue;
        }

        if (raw.startsWith('- ')) {
            flushParagraph();
            const listItems = [];
            while (i < lines.length && lines[i].trim().startsWith('- ')) {
                listItems.push(`<li>${convertInlineMarkdown(lines[i].trim().slice(2))}</li>`);
                i++;
            }
            i--;
            if (listItems.length) htmlParts.push(`<ul>${listItems.join('')}</ul>`);
            continue;
        }

        buffer.push(raw);
    }

    flushParagraph();
    return htmlParts.join('');
}

function extractCategoryGrades(markdown = '') {
    const rows = [];
    const lines = markdown.split('\n');
    let capture = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!capture && /\|\s*Category\s*\|\s*Grade\s*\|\s*Comment\s*\|/i.test(trimmed)) {
            capture = true;
            continue;
        }
        if (capture) {
            if (!trimmed.startsWith('|') || !trimmed.includes('|')) {
                capture = false;
                continue;
            }
            if (/^\|\s*:?-+\s*:?(\|\s*:?-+\s*:?)*\|?$/.test(trimmed)) {
                continue;
            }
            const cells = trimmed.split('|').map(cell => cell.trim()).filter(Boolean);
            if (cells.length >= 3) {
                rows.push({
                    category: cells[0],
                    grade: cells[1],
                    comment: cells.slice(2).join(' | ')
                });
            }
        }
    }
    return rows;
}

function gradeToScore(grade = '') {
    const scale = {
        'A+': 100, 'A': 95, 'A-': 90,
        'B+': 85, 'B': 80, 'B-': 75,
        'C+': 70, 'C': 65, 'C-': 60,
        'D+': 55, 'D': 50, 'D-': 45,
        'E': 40, 'F': 30
    };
    const cleaned = grade.trim().toUpperCase();
    if (scale[cleaned] !== undefined) return scale[cleaned];
    const numeric = parseFloat(cleaned);
    if (!Number.isNaN(numeric)) {
        return Math.max(0, Math.min(100, (numeric / 10) * 100));
    }
    return 60;
}

function parseKeyAttributes(statsText = '', ratingSection = '') {
    const base = [
        { icon: '⚽', label: 'Goals', value: '—' },
        { icon: '🎯', label: 'Assists', value: '—' },
        { icon: '🛡️', label: 'Tackles', value: '—' },
        { icon: '📈', label: 'Rating', value: '—' }
    ];

    const extractValue = (text, keywords) => {
        const pattern = new RegExp(`(?:${keywords.join('|')})\\s*[:\u2013\-]?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:/\\s*(\\d+(?:\\.\\d+)?))?`, 'i');
        const match = text.match(pattern);
        if (!match) return null;
        if (match[2]) {
            return `${match[1]} / ${match[2]}`;
        }
        return match[1];
    };

    const normalizedStats = statsText.replace(/,/g, '\n');
    const goals = extractValue(normalizedStats, ['goals?', 'scored']);
    const assists = extractValue(normalizedStats, ['assists?', 'created']);
    const tackles = extractValue(normalizedStats, ['tackles?', 'duels']);
    const ratingMatch = ratingSection.match(/([A-F][+\-]?|\d+(?:\.\d+)?\s*\/\s*10|\d+(?:\.\d+)?)/);

    if (goals) base[0].value = goals;
    if (assists) base[1].value = assists;
    if (tackles) base[2].value = tackles;
    if (ratingMatch) base[3].value = ratingMatch[0].replace(/\s+/g, '');

    return base;
}

async function generatePDF() {
    if (typeof window.jspdf === 'undefined') {
        showError("jsPDF library is not loaded.");
        return;
    }
    if (typeof html2canvas === 'undefined') {
        showError("html2canvas library is not loaded.");
        return;
    }
    if (!pdfContent) {
        showError("PDF export container is missing. Please refresh and try again.");
        return;
    }

    const { jsPDF } = window.jspdf;
    showLoading("Generating PDF preview...", 'download');

    let wasHidden = false;
    let previousInlineStyles = null;

    try {
        const rawReportText = analysisOutput?.dataset?.rawMarkdown || '';

        if (!rawReportText.trim()) {
            showError("Error generating PDF preview: No scouting report available to export. Please run an analysis first.");
            return;
        }

        const isProReport = reportType.value === 'pro';
        const reportData = isProReport ? parseProReport(rawReportText) : parseQuickReport(rawReportText);

        if (!reportData) {
            const errorCopy = isProReport
                ? "Error generating PDF preview: Could not parse Pro Scout Report. AI response was incomplete. Please try again."
                : "Error generating PDF preview: Could not parse Quick Report. AI response was incomplete. Please try again.";
            showError(errorCopy);
            return;
        }

        const categories = extractCategoryGrades(rawReportText);
        let developmentPlanContent = reportData.development;
        if ((!developmentPlanContent || developmentPlanContent === 'N/A') && categories.length) {
            const improvementAreas = categories
                .map(category => ({
                    ...category,
                    score: gradeToScore(category.grade)
                }))
                .filter(category => category.score < 85)
                .slice(0, 3)
                .map(category => {
                    const focus = category.comment && category.comment !== 'N/A'
                        ? category.comment
                        : `Elevate ${category.category.toLowerCase()} to lift the current ${category.grade || 'score'}.`;
                    return `- ${category.category}: ${focus}`;
                });
            if (improvementAreas.length) {
                developmentPlanContent = `Focus on the following development priorities:\n\n${improvementAreas.join('\n')}`;
            }
        }

        const hasDevelopmentPlan = Boolean(developmentPlanContent && developmentPlanContent.trim() !== '' && developmentPlanContent !== 'N/A');

        const attributes = parseKeyAttributes(textStatsSingle?.value || '', reportData.rating || rawReportText);
        const statsChartImage = statsChart ? statsChart.toBase64Image() : '';
        const galleryImages = singlePlayerImages.slice(0, 3).map((img, index) => {
            const src = img.preview || `data:${img.mimeType};base64,${img.base64}`;
            return `<figure class="pdf-visual"><img src="${src}" alt="Analysis visual ${index + 1}"><figcaption>Visual ${index + 1}</figcaption></figure>`;
        }).join('');

        const sections = isProReport ? [
            { title: 'AI Performance Rating', content: reportData.rating, accent: '#38bdf8' },
            { title: 'Summary', content: reportData.summary, accent: '#0ea5e9' },
            { title: 'Positional Play', content: reportData.positional, accent: '#6366f1' },
            { title: 'Key Actions (PMDS)', content: reportData.actions, accent: '#8b5cf6' },
            { title: 'Tactical Awareness (Four Phases)', content: reportData.tactical, accent: '#14b8a6' },
            { title: 'Mentality', content: reportData.mentality, accent: '#f97316' },
            ...(hasDevelopmentPlan ? [{ title: 'Suggested Development Plan', content: developmentPlanContent, accent: '#38bdf8' }] : []),
            { title: 'Conclusion & Recommendation', content: reportData.conclusion, accent: '#38bdf8' },
            { title: 'Similar Player Matrix', content: reportData.similar, accent: '#22d3ee' }
        ] : [
            { title: 'AI Performance Rating', content: reportData.rating, accent: '#38bdf8' },
            { title: 'Likely Position(s) & Role', content: reportData.position, accent: '#6366f1' },
            { title: 'Key Duties & Playstyle', content: reportData.playstyle, accent: '#14b8a6' },
            { title: 'Key Strengths (Pros)', content: reportData.pros, accent: '#0ea5e9' },
            { title: 'Key Weaknesses (Cons)', content: reportData.cons, accent: '#ef4444' },
            { title: 'Suggested Similar Player', content: reportData.similar, accent: '#f59e0b' },
            { title: 'Suggested Development Plan', content: hasDevelopmentPlan ? developmentPlanContent : 'No development plan was generated. Translate the identified weaknesses into 2-3 actionable steps before sharing.', accent: '#38bdf8' }
        ];

        const sectionsHtml = sections.map(section => {
            const isDevelopmentPlan = section.title.toLowerCase().includes('development plan');
            return `
            <section class="pdf-section${isDevelopmentPlan ? ' pdf-section--plan' : ''}" style="--accent:${section.accent}">
                <h3>${escapeHtml(section.title)}</h3>
                <div class="pdf-section-body">${formatMarkdownForPdf(section.content)}</div>
            </section>
        `;
        }).join('');

        const performanceHtml = categories.length ? categories.map(category => {
            const score = gradeToScore(category.grade);
            return `
                <div class="performance-row">
                    <div class="performance-label">${escapeHtml(category.category)}</div>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width:${score}%"></div>
                    </div>
                    <div class="performance-grade">${escapeHtml(category.grade || '—')}</div>
                </div>
                <p class="performance-comment">${escapeHtml(category.comment || '')}</p>
            `;
        }).join('') : '<p class="pdf-empty">No category grades supplied.</p>';

        const attributesHtml = attributes.map(attr => `
            <div class="attribute-chip">
                <span class="attribute-icon">${attr.icon}</span>
                <div class="attribute-text">
                    <span class="attribute-label">${escapeHtml(attr.label)}</span>
                    <span class="attribute-value">${escapeHtml(attr.value)}</span>
                </div>
            </div>
        `).join('');

        const heroImage = singlePlayerImages[0] ? (singlePlayerImages[0].preview || `data:${singlePlayerImages[0].mimeType};base64,${singlePlayerImages[0].base64}`) : '';

        const pdfHtml = `
            <style>
                * { box-sizing: border-box; }
                .pdf-wrapper { width: 100%; background: #f8fafc; padding: 32px; font-family: 'Inter', 'Poppins', sans-serif; color: #0f172a; }
                .pdf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .pdf-brand { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.25em; color: #38bdf8; }
                .pdf-title { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 600; color: #0b1120; margin: 0; }
                .pdf-meta { font-size: 12px; color: #334155; margin-top: 6px; }
                .pdf-columns { display: flex; flex-direction: column; gap: 20px; }
                .pdf-left { width: 100%; display: flex; flex-direction: column; gap: 16px; }
                .pdf-right { width: 100%; display: flex; flex-direction: column; gap: 16px; }
                .pdf-card { background: #ffffff; border-radius: 18px; padding: 18px; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08); }
                .pdf-card, .pdf-section { break-inside: avoid; page-break-inside: avoid; -webkit-column-break-inside: avoid; }
                .player-hero { width: 100%; border-radius: 14px; aspect-ratio: 4/3; object-fit: cover; border: 1px solid rgba(148, 163, 184, 0.25); }
                .player-hero--placeholder { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(148, 163, 184, 0.05)); color: #475569; font-weight: 500; }
                .player-info { display: grid; gap: 4px; font-size: 12px; margin-top: 12px; }
                .player-info span { display: block; }
                .attribute-board { display: grid; gap: 10px; }
                .attribute-chip { display: flex; gap: 12px; align-items: center; background: rgba(56, 189, 248, 0.08); border-radius: 14px; padding: 10px 12px; border: 1px solid rgba(14, 165, 233, 0.15); }
                .attribute-icon { font-size: 18px; }
                .attribute-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #475569; }
                .attribute-value { font-size: 14px; font-weight: 600; color: #0b1120; }
                .performance-board { display: flex; flex-direction: column; gap: 12px; }
                .performance-row { display: grid; grid-template-columns: 1fr 2fr auto; gap: 10px; align-items: center; }
                .performance-label { font-size: 12px; font-weight: 600; color: #0b1120; }
                .performance-bar { height: 8px; background: rgba(148, 163, 184, 0.25); border-radius: 999px; overflow: hidden; }
                .performance-fill { height: 100%; background: linear-gradient(90deg, #22d3ee, #0ea5e9); }
                .performance-grade { font-size: 12px; font-weight: 600; color: #0b1120; }
                .performance-comment { font-size: 11px; color: #475569; margin: 0 0 6px 0; }
                .pdf-visuals { display: flex; flex-direction: column; gap: 12px; }
                .pdf-visuals img { width: 100%; border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.25); }
                .pdf-visuals figure { margin: 0; }
                .pdf-visuals figcaption { margin-top: 4px; font-size: 11px; color: #475569; text-align: center; }
                .pdf-section { position: relative; padding: 20px 24px; border-radius: 18px; background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08); }
                .pdf-section--plan { background: #0ea5e9; color: #0f172a; border-color: rgba(14, 165, 233, 0.35); box-shadow: 0 20px 44px rgba(14, 165, 233, 0.25); }
                .pdf-section--plan::before { background: rgba(15, 23, 42, 0.2); }
                .pdf-section--plan h3 { color: #0f172a; }
                .pdf-section--plan .pdf-section-body p,
                .pdf-section--plan .pdf-section-body li,
                .pdf-section--plan .pdf-section-body ul,
                .pdf-section--plan .pdf-section-body strong,
                .pdf-section--plan .pdf-section-body a { color: #0f172a; }
                .pdf-section::before { content: ''; position: absolute; top: 0; left: 0; width: 8px; height: 100%; border-radius: 18px 0 0 18px; background: var(--accent, #38bdf8); }
                .pdf-section h3 { margin: 0 0 12px 0; font-size: 16px; font-family: 'Poppins', sans-serif; font-weight: 600; color: #0b1120; }
                .pdf-section-body p { margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #1e293b; }
                .pdf-section-body ul { margin: 0 0 10px 18px; padding: 0; color: #1e293b; font-size: 12px; }
                .pdf-section-body li { margin-bottom: 4px; }
                .pdf-section-body table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px; }
                .pdf-section-body thead th { background: rgba(14, 165, 233, 0.12); color: #0b1120; text-transform: uppercase; font-size: 11px; padding: 8px; }
                .pdf-section-body td { border: 1px solid rgba(148, 163, 184, 0.4); padding: 8px; color: #1e293b; }
                .pdf-section-body hr, .pdf-divider { border: none; height: 1px; background: rgba(148, 163, 184, 0.4); margin: 12px 0; }
                .pdf-empty { font-size: 12px; color: #94a3b8; margin: 0; }
            </style>
            <div class="pdf-wrapper">
                <div class="pdf-header">
                    <div>
                        <div class="pdf-brand">Pro Scout AI</div>
                        <h1 class="pdf-title">${escapeHtml(playerName?.value || 'Unnamed Player')}</h1>
                        <div class="pdf-meta">Age ${escapeHtml(playerAge?.value || 'N/A')} • ${escapeHtml(playerClub?.value || 'Club N/A')} • ${escapeHtml(playerLeague?.value || 'League N/A')}</div>
                    </div>
                    <div class="pdf-meta">
                        ${escapeHtml(new Date().toLocaleString())}
                    </div>
                </div>
                <div class="pdf-columns">
                    <aside class="pdf-left">
                        <div class="pdf-card">
                            ${heroImage ? `<img src="${heroImage}" alt="Player visual" class="player-hero">` : `<div class="player-hero player-hero--placeholder">Add visuals for richer exports</div>`}
                            <div class="player-info">
                                <span><strong>Positions:</strong> ${escapeHtml(playerPositions?.value || 'N/A')}</span>
                                <span><strong>Match Context:</strong> ${escapeHtml(matchContext?.value || 'N/A')}</span>
                                <span><strong>Report Type:</strong> ${reportType?.value === 'pro' ? 'Pro Scout' : 'Quick Report'}</span>
                            </div>
                        </div>
                        <div class="pdf-card attribute-board">
                            ${attributesHtml}
                        </div>
                        <div class="pdf-card">
                            <h3 style="font-size:14px;font-family:'Poppins',sans-serif;margin-top:0;margin-bottom:12px;color:#0b1120;">Performance Profile</h3>
                            <div class="performance-board">${performanceHtml}</div>
                        </div>
                        <div class="pdf-card pdf-visuals">
                            ${statsChartImage ? `<figure><img src="${statsChartImage}" alt="Stats visualization"><figcaption>Stats Breakdown</figcaption></figure>` : ''}
                            ${galleryImages || '<p class="pdf-empty">Upload heatmaps or stat boards to showcase visuals.</p>'}
                        </div>
                    </aside>
                    <section class="pdf-right">
                        ${sectionsHtml}
                    </section>
                </div>
            </div>
        `;

        wasHidden = pdfContent.classList.contains('hidden');
        const styleRef = pdfContent.style;
        previousInlineStyles = {
            position: styleRef.position,
            left: styleRef.left,
            top: styleRef.top,
            width: styleRef.width,
            maxWidth: styleRef.maxWidth,
            visibility: styleRef.visibility,
            pointerEvents: styleRef.pointerEvents,
            zIndex: styleRef.zIndex,
            display: styleRef.display,
            opacity: styleRef.opacity
        };

        if (wasHidden) {
            pdfContent.classList.remove('hidden');
        }

        Object.assign(styleRef, {
            position: 'fixed',
            top: '0',
            left: '-10000px',
            width: '794px',
            maxWidth: '794px',
            display: 'block',
            visibility: 'visible',
            opacity: '1',
            pointerEvents: 'none',
            zIndex: '-1'
        });

        pdfContent.innerHTML = pdfHtml;
        await new Promise(resolve => setTimeout(resolve, 50));

        const canvas = await html2canvas(pdfContent, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f8fafc'
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const usablePageWidth = Math.max(pageWidth - margin * 2, pageWidth * 0.8);
        const usablePageHeight = Math.max(pageHeight - margin * 2, pageHeight * 0.8);
        const imgWidth = usablePageWidth;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let pageIndex = 0;

        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
        heightLeft -= usablePageHeight;
        pageIndex++;

        while (heightLeft > 0) {
            const position = margin - pageIndex * usablePageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
            heightLeft -= usablePageHeight;
            pageIndex++;
        }

        const pdfBlob = pdf.output('blob');
        generatedPdfBlobUrl = URL.createObjectURL(pdfBlob);
        pdfPreviewFrame.src = generatedPdfBlobUrl;

        showPdfPreview();

    } catch (e) {
        console.error("PDF Generation Failed:", e);
        showError(`Error generating PDF: ${e.message}`);
    } finally {
        if (previousInlineStyles) {
            Object.assign(pdfContent.style, {
                position: previousInlineStyles.position,
                left: previousInlineStyles.left,
                top: previousInlineStyles.top,
                width: previousInlineStyles.width,
                maxWidth: previousInlineStyles.maxWidth,
                visibility: previousInlineStyles.visibility,
                pointerEvents: previousInlineStyles.pointerEvents,
            zIndex: previousInlineStyles.zIndex,
            display: previousInlineStyles.display,
            opacity: previousInlineStyles.opacity
        });
        }
        if (wasHidden) {
            pdfContent.classList.add('hidden');
        }
        pdfContent.innerHTML = '';
        hideLoading();
    }
}

function parseProReport(text) {
    try {
        if (!text) return null;

        const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const getSection = (regex) => {
            const match = normalized.match(regex);
            return match?.[1]?.trim() ?? 'N/A';
        };

        const report = {
            rating: getSection(/#+\s*1\. AI-Calculated Performance Rating[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*2\.|\n---\n|\n$)/),
            summary: getSection(/#+\s*2\. Summary[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*3\.|\n---\n|\n$)/),
            positional: getSection(/#+\s*3\. Positional Play[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*4\.|\n---\n|\n$)/),
            actions: getSection(/#+\s*4\. Key Actions[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*5\.|\n---\n|\n$)/),
            tactical: getSection(/#+\s*5\. Tactical Awareness[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*6\.|\n---\n|\n$)/),
            mentality: getSection(/#+\s*6\. Mentality[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*7\.|\n---\n|\n$)/),
            development: getSection(/#+\s*(?:\d+\.\s*)?Suggested Development Plan[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*\d+\.|\n---|\n$)/),
            conclusion: getSection(/#+\s*7\. Conclusion & Recommendation[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*8\.|\n---\n|\n$)/),
            similar: getSection(/#+\s*8\. Similar Player Matrix[\s\S]*?\n+([\s\S]*?)(?=\n---|\n$)/)
        };

        if (Object.values(report).every(val => val === 'N/A')) {
            throw new Error("All sections parsed as N/A.");
        }

        return report;
    } catch (e) {
        console.error("Failed to parse pro report:", e.message, "\nRaw text:", text);
        return null;
    }
}

function parseQuickReport(text) {
    try {
        if (!text) return null;

        const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const getSection = (regex) => {
            const match = normalized.match(regex);
            return match?.[1]?.trim() ?? 'N/A';
        };

        const report = {
            rating: getSection(/#+\s*1\. AI-Calculated Performance Rating[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*2\.|\n---\n|\n$)/),
            position: getSection(/#+\s*2\. Likely Position\(s\) & Role[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*3\.|\n---\n|\n$)/),
            playstyle: getSection(/#+\s*3\. Key Duties & Playstyle[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*4\.|\n---\n|\n$)/),
            pros: getSection(/#+\s*4\. Key Strengths \(Pros\)[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*5\.|\n---\n|\n$)/),
            cons: getSection(/#+\s*5\. Key Weaknesses \(Cons\)[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*6\.|\n---\n|\n$)/),
            similar: getSection(/#+\s*6\. Suggested Similar Player[\s\S]*?\n+([\s\S]*?)(?=\n#+\s*7\.|\n---\n|\n$)/),
            development: getSection(/#+\s*7\. Suggested Development Plan[\s\S]*?\n+([\s\S]*?)(?=\n---|\n$)/)
        };

        if (Object.values(report).every(val => val === 'N/A')) {
            throw new Error("All sections parsed as N/A.");
        }

        return report;
    } catch (e) {
        console.error("Failed to parse quick report:", e.message, "\nRaw text:", text);
        return null;
    }
}

// --- Opponent Analysis Save/Load ---
const LS_OPPONENT_KEY = 'savedOpponentAnalyses';

function getSavedOpponentAnalyses() {
    try {
        return JSON.parse(localStorage.getItem(LS_OPPONENT_KEY)) || [];
    } catch (e) {
        console.error("Could not parse saved analyses:", e);
        return [];
    }
}

function saveOpponentAnalysis() {
    const name = opponentName.value.trim();
    const content = sanitizeHtmlContent(analysisOutputOpponent.innerHTML);
    if (!name) {
        showError("Please enter an opponent name to save the analysis.");
        return;
    }
    if (!content || content.includes("Your opposition analysis will appear here")) {
        showError("There is no analysis to save.");
        return;
    }

    try {
        let analyses = getSavedOpponentAnalyses();
        const existingIndex = analyses.findIndex(a => a.name === name);

        const analysisData = { name, content, savedAt: new Date().toISOString() };

        if (existingIndex > -1) {
            // Update existing
            analyses[existingIndex] = analysisData;
        } else {
            // Add new
            analyses.push(analysisData);
        }

        localStorage.setItem(LS_OPPONENT_KEY, JSON.stringify(analyses));

        // Show simple feedback
        saveOpponentAnalysisBtn.innerHTML = '<i data-lucide="check" class="h-5 w-5 mr-2"></i>Saved!';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => {
            saveOpponentAnalysisBtn.innerHTML = '<i data-lucide="save" class="h-5 w-5 mr-2"></i>Save';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 2000);

    } catch (e) {
        console.error("Failed to save analysis to LocalStorage:", e);
        showError("Failed to save analysis. LocalStorage might be full or disabled.");
    }
}

function loadOpponentAnalyses() {
    const analyses = getSavedOpponentAnalyses();
    loadOpponentList.innerHTML = ''; // Clear list

    if (analyses.length === 0) {
        loadOpponentList.innerHTML = '<p class="text-slate-400">No saved analyses found.</p>';
        return;
    }

    analyses.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)); // Show newest first

    analyses.forEach(analysis => {
        const item = document.createElement('div');
        item.classList.add('flex', 'justify-between', 'items-center', 'p-3', 'bg-slate-700', 'rounded-lg', 'hover:bg-slate-600');

        const info = document.createElement('div');
        info.classList.add('flex-1', 'min-w-0'); // Fix for text overflow

        const nameEl = document.createElement('p');
        nameEl.classList.add('text-white', 'font-semibold', 'truncate');
        nameEl.textContent = analysis.name;
        info.appendChild(nameEl);

        const dateEl = document.createElement('p');
        dateEl.classList.add('text-xs', 'text-slate-400');
        dateEl.textContent = `Saved: ${new Date(analysis.savedAt).toLocaleString()}`;
        info.appendChild(dateEl);

        item.appendChild(info);

        const buttons = document.createElement('div');
        buttons.classList.add('flex', 'space-x-2', 'ml-2');

        const loadBtn = document.createElement('button');
        loadBtn.classList.add('p-2', 'bg-sky-500', 'hover:bg-sky-600', 'rounded-lg', 'text-white');
        loadBtn.innerHTML = '<i data-lucide="folder-down" class="h-5 w-5"></i>';
        loadBtn.title = `Load "${analysis.name}"`;
        loadBtn.onclick = () => renderOpponentAnalysis(analysis.name);
        buttons.appendChild(loadBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('p-2', 'bg-red-500', 'hover:bg-red-600', 'rounded-lg', 'text-white');
        deleteBtn.innerHTML = '<i data-lucide="trash-2" class="h-5 w-5"></i>';
        deleteBtn.title = `Delete "${analysis.name}"`;
        deleteBtn.onclick = () => deleteOpponentAnalysis(analysis.name);
        buttons.appendChild(deleteBtn);

        item.appendChild(buttons);
        loadOpponentList.appendChild(item);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
    showLoadOpponentModal();
}

function renderOpponentAnalysis(name) {
    const analyses = getSavedOpponentAnalyses();
    const analysis = analyses.find(a => a.name === name);
    if (analysis) {
        opponentName.value = analysis.name;
        renderSafeContent(analysisOutputOpponent, analysis.content);
        closeLoadOpponentModal();
    } else {
        showError("Could not find the saved analysis to load.");
    }
}

function deleteOpponentAnalysis(name) {
    try {
        let analyses = getSavedOpponentAnalyses();
        const filteredAnalyses = analyses.filter(a => a.name !== name);
        localStorage.setItem(LS_OPPONENT_KEY, JSON.stringify(filteredAnalyses));
        loadOpponentAnalyses(); // Refresh the list in the modal
    } catch (e) {
        showError("Failed to delete analysis.");
    }
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    updateWorkflowStage('upload');
    resetAnalysisViews();
    renderAnalysisVisuals();
    Object.values(narrativeBuilders).forEach(builder => {
        if (builder?.script) {
            renderSafeContent(builder.script, '<p class="text-xs text-slate-500">Run a report to generate a narrative storyboard.</p>');
        }
    });

    // Set default tab to dashboard
    showTab('dashboard');

    if (floatingGenerateBtn) {
        floatingGenerateBtn.classList.remove('hidden');
        floatingGenerateBtn.addEventListener('click', () => {
            showTab('singlePlayer');
            analyzeSinglePlayer();
        });
    }

    // Quick links to tabs
    quickActionButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.openTab) {
                showTab(button.dataset.openTab);
            }
        });
    });

    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.dataset.tab);
        });
    });

    // API Key management

    // --- Main Controls ---
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeSinglePlayer);
    if (clearBtn) clearBtn.addEventListener('click', clearSinglePlayerInputs);
    if (analysisViewControls) {
        getAnalysisViewButtons().forEach(button => {
            button.addEventListener('click', () => showAnalysisView(button.dataset.view));
        });
    }
    if (reportTheme) {
        applyReportTheme(reportTheme.value);
        reportTheme.addEventListener('change', () => applyReportTheme(reportTheme.value));
    }
    if (saveReportBtn) saveReportBtn.addEventListener('click', saveCurrentReport);
    if (loadReportBtn) loadReportBtn.addEventListener('click', () => {
        renderSavedReports();
        openReportModal();
    });
    if (openLoadReportModalBtn) {
        openLoadReportModalBtn.addEventListener('click', () => {
            renderSavedReports();
            openReportModal();
        });
    }
    if (closeLoadReportModalBtn) closeLoadReportModalBtn.addEventListener('click', closeReportModal);
    if (savedReportsList) {
        savedReportsList.addEventListener('click', (event) => {
            const loadTarget = event.target.closest('[data-load-report]');
            if (loadTarget) {
                loadReportById(loadTarget.dataset.loadReport);
                return;
            }
            const deleteTarget = event.target.closest('[data-delete-report]');
            if (deleteTarget) {
                deleteReportById(deleteTarget.dataset.deleteReport);
            }
        });
    }
    if (savedReportsGrid) {
        savedReportsGrid.addEventListener('click', (event) => {
            const loadTarget = event.target.closest('[data-load-report]');
            if (loadTarget) {
                loadReportById(loadTarget.dataset.loadReport);
                return;
            }
            const deleteTarget = event.target.closest('[data-delete-report]');
            if (deleteTarget) {
                deleteReportById(deleteTarget.dataset.deleteReport);
            }
        });
    }

    Object.entries(narrativeBuilders).forEach(([key, builder]) => {
        if (builder?.generateBtn) {
            builder.generateBtn.addEventListener('click', () => generateNarrativeVideo(key));
        }
        if (builder?.stopBtn) {
            builder.stopBtn.addEventListener('click', () => stopNarrativePlayback(key));
        }
    });

    if (typeof window.speechSynthesis !== 'undefined') {
        populateNarrativeVoices();
        window.speechSynthesis.onvoiceschanged = populateNarrativeVoices;
    } else {
        populateNarrativeVoices();
    }

    // Comparison
    if (analyzeCompareBtn) analyzeCompareBtn.addEventListener('click', analyzeComparison);
    if (clearCompareBtn) clearCompareBtn.addEventListener('click', clearCompareInputs);
    // Opposition
    if (analyzeOpponentBtn) analyzeOpponentBtn.addEventListener('click', analyzeOpposition);
    if (clearOpponentBtn) clearOpponentBtn.addEventListener('click', clearOpponentInputs);
    if (saveOpponentAnalysisBtn) saveOpponentAnalysisBtn.addEventListener('click', saveOpponentAnalysis);
    if (loadOpponentAnalysisBtn) loadOpponentAnalysisBtn.addEventListener('click', showLoadOpponentModal);

    // Modals
    if (howToUseBtn) howToUseBtn.addEventListener('click', showHowToUse);
    if (closeHowToUseBtn) closeHowToUseBtn.addEventListener('click', closeHowToUse);
    if (closeErrorBtn) closeErrorBtn.addEventListener('click', closeError);
    if (closeLoadOpponentModalBtn) closeLoadOpponentModalBtn.addEventListener('click', closeLoadOpponentModal);
    if (pdfBtn) pdfBtn.addEventListener('click', () => {
        updateWorkflowStage('download');
        generatePDF();
    });
    if (closePdfPreviewBtn) closePdfPreviewBtn.addEventListener('click', closePdfPreview);
    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', () => {
        if (generatedPdfBlobUrl) {
            const link = document.createElement('a');
            link.href = generatedPdfBlobUrl;
            link.download = `${playerName.value.trim() || 'player'}_scout_report.pdf`;
            link.click();
        }
    });

    // Export Buttons
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
    if (videoBtn) videoBtn.addEventListener('click', findVideos);

    // Upload listeners
    setupUploadListeners(dropZoneSingle, fileUploadSingle, imagePreviewSingle, singlePlayerImages);
    if (scanStatsBtn) scanStatsBtn.addEventListener('click', scanStatsFromImage);
    if (visualizeStatsBtn) visualizeStatsBtn.addEventListener('click', visualizeStats);
    if (textStatsSingle) textStatsSingle.addEventListener('input', () => {
        visualizeStatsBtn.disabled = textStatsSingle.value.trim().length === 0;
    });

    setupUploadListeners(dropZoneCompare1, fileUploadCompare1, imagePreviewCompare1, compare1Images);
    setupUploadListeners(dropZoneCompare2, fileUploadCompare2, imagePreviewCompare2, compare2Images);
    setupUploadListeners(dropZoneOpponent, fileUploadOpponent, imagePreviewOpponent, opponentImages);

    // Search Tab
    if (searchButton) searchButton.addEventListener('click', handleSearch);
    if (suggestStatsBtn) suggestStatsBtn.addEventListener('click', suggestStats);
    if (searchPosition) searchPosition.addEventListener('input', () => {
        if (suggestStatsBtn) {
            suggestStatsBtn.disabled = searchPosition.value.trim().length === 0;
        }
    });
    if (downloadCsvBtn) downloadCsvBtn.addEventListener('click', downloadCSV);

    // Chatbot Tab
    if (chatSendBtn) chatSendBtn.addEventListener('click', handleChat);
    if (chatInput) chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleChat();
        }
    });
    if (newChatBtn) newChatBtn.addEventListener('click', newChat);

    // Global Paste for Single Player Tab
    document.addEventListener('paste', (e) => {
        if (currentTab !== 'singlePlayer') return;
        const target = e.target;
        if (!target) return;
        const targetTag = target.tagName.toUpperCase();
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;
        if (target.id === 'dropZoneSingle' || target.closest('#dropZoneSingle')) return;
        handlePaste(e, imagePreviewSingle, singlePlayerImages);
    });

    loadSavedReports();

    // Initialize lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Load jspdf-autotable
    const autoTableScript = document.createElement('script');
    autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
    document.head.appendChild(autoTableScript);
});
