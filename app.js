// Check for dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

// Mock data for campaigns
const mockCampaigns = [
    {
        id: 1,
        name: "Campanha de Verão",
        status: "active",
        objective: "sales",
        budget: 3500,
        spent: 2100,
        platforms: ["facebook", "instagram"],
        impressions: 35280,
        clicks: 1240,
        conversions: 145,
        ctr: 3.5,
        createdAt: new Date(2023, 6, 15)
    },
    {
        id: 2,
        name: "Promoção de Fim de Ano",
        status: "active",
        objective: "conversions",
        budget: 2800,
        spent: 1980,
        platforms: ["google", "facebook"],
        impressions: 28500,
        clicks: 980,
        conversions: 85,
        ctr: 3.4,
        createdAt: new Date(2023, 10, 5)
    },
    {
        id: 3,
        name: "Lançamento de Produto",
        status: "active",
        objective: "awareness",
        budget: 2000,
        spent: 1100,
        platforms: ["instagram", "youtube"],
        impressions: 42000,
        clicks: 1580,
        conversions: 120,
        ctr: 3.8,
        createdAt: new Date(2023, 11, 20)
    },
    {
        id: 4,
        name: "Campanha Institucional",
        status: "paused",
        objective: "awareness",
        budget: 1500,
        spent: 1200,
        platforms: ["facebook"],
        impressions: 18500,
        clicks: 620,
        conversions: 45,
        ctr: 3.3,
        createdAt: new Date(2023, 9, 10)
    }
];

let campaigns = [...mockCampaigns];
let currentCampaignId = 5; // For generating new IDs

// DOM elements
const campaignsList = document.getElementById('campaignsList');
const newCampaignBtn = document.getElementById('newCampaignBtn');
const newCampaignModal = document.getElementById('newCampaignModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const newCampaignForm = document.getElementById('newCampaignForm');
const campaignFilter = document.getElementById('campaignFilter');
const sortCampaigns = document.getElementById('sortCampaigns');

const campaignDetailModal = document.getElementById('campaignDetailModal');
const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
const getAiSuggestions = document.getElementById('getAiSuggestions');
const aiSuggestionsLoading = document.getElementById('aiSuggestionsLoading');
const aiSuggestionsContent = document.getElementById('aiSuggestionsContent');
const detailEditBtn = document.getElementById('detailEditBtn');
const detailToggleStatusBtn = document.getElementById('detailToggleStatusBtn');

// Initialize performance chart
const ctx = document.getElementById('performanceChart').getContext('2d');
const performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'CTR (%)',
                data: [2.1, 2.3, 2.5, 2.8, 3.0, 3.2, 3.5],
                borderColor: '#5D5CDE',
                backgroundColor: 'rgba(93, 92, 222, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Taxa de Conversão (%)',
                data: [1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2],
                borderColor: '#38B2AC',
                backgroundColor: 'rgba(56, 178, 172, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Event listeners
newCampaignBtn.addEventListener('click', () => {
    newCampaignModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    newCampaignModal.classList.add('hidden');
    newCampaignForm.reset();
});

closeDetailModalBtn.addEventListener('click', () => {
    campaignDetailModal.classList.add('hidden');
});

campaignFilter.addEventListener('change', renderCampaigns);
sortCampaigns.addEventListener('change', renderCampaigns);

newCampaignForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('campaignName').value;
    const objective = document.getElementById('campaignObjective').value;
    const budget = parseFloat(document.getElementById('campaignBudget').value);
    const platformCheckboxes = document.querySelectorAll('input[name="platforms"]:checked');
    const platforms = Array.from(platformCheckboxes).map(checkbox => checkbox.value);
    
    // Create new campaign
    const newCampaign = {
        id: currentCampaignId++,
        name,
        status: 'active',
        objective,
        budget,
        spent: 0,
        platforms,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        createdAt: new Date()
    };
    
    campaigns.unshift(newCampaign);
    renderCampaigns();
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Close modal and reset form
    newCampaignModal.classList.add('hidden');
    newCampaignForm.reset();
});

getAiSuggestions.addEventListener('click', async () => {
    const campaignId = getAiSuggestions.dataset.campaignId;
    const campaign = campaigns.find(c => c.id == campaignId);
    
    if (!campaign) return;
    
    // Show loading state
    aiSuggestionsLoading.classList.remove('hidden');
    aiSuggestionsContent.classList.add('hidden');
    
    try {
        // Generate mock optimization suggestions
        generateMockSuggestions(campaign);
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        aiSuggestionsContent.innerHTML = `<p class="text-red-500">Erro ao gerar sugestões. Por favor, tente novamente.</p>`;
        aiSuggestionsLoading.classList.add('hidden');
        aiSuggestionsContent.classList.remove('hidden');
    }
});

// Functions
function renderCampaigns() {
    const filterValue = campaignFilter.value;
    const sortValue = sortCampaigns.value;
    
    // Filter campaigns
    let filteredCampaigns = [...campaigns];
    if (filterValue !== 'all') {
        filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === filterValue);
    }
    
    // Sort campaigns
    if (sortValue === 'date') {
        filteredCampaigns.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortValue === 'performance') {
        filteredCampaigns.sort((a, b) => b.conversions - a.conversions);
    } else if (sortValue === 'budget') {
        filteredCampaigns.sort((a, b) => b.budget - a.budget);
    }
    
    // Render campaigns
    campaignsList.innerHTML = '';
    filteredCampaigns.forEach(campaign => {
        const campaignCard = document.createElement('div');
        campaignCard.className = 'bg-light-card dark:bg-dark-card rounded-lg shadow-md p-4 fade-in';
        
        const statusClass = campaign.status === 'active' ? 'bg-green-500' : 'bg-yellow-500';
        const statusText = campaign.status === 'active' ? 'Ativa' : 'Pausada';
        
        const objectiveMap = {
            'conversions': 'Conversões',
            'awareness': 'Reconhecimento de Marca',
            'traffic': 'Tráfego',
            'leads': 'Geração de Leads',
            'sales': 'Vendas'
        };
        
        const platformIcons = {
            'facebook': `<svg class="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>`,
            'instagram': `<svg class="w-5 h-5 text-pink-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>`,
            'google': `<svg class="w-5 h-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" fill="currentColor"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>`,
            'youtube': `<svg class="w-5 h-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>`
        };
        
        const platformsHtml = campaign.platforms.map(p => platformIcons[p] || '').join('');
        
        campaignCard.innerHTML = `
            <div class="flex justify-between">
                <div>
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold">${campaign.name}</h3>
                        <span class="${statusClass} text-white text-xs rounded-full px-2 py-1 ml-2">${statusText}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${objectiveMap[campaign.objective] || campaign.objective}</p>
                </div>
                <div class="flex flex-col items-end">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Orçamento</p>
                    <p class="font-bold">R$ ${campaign.budget.toLocaleString('pt-BR')}</p>
                </div>
            </div>
            <div class="flex justify-between items-center mt-4">
                <div class="flex space-x-2">
                    ${platformsHtml}
                </div>
                <button class="view-campaign-btn text-primary hover:text-opacity-80 transition-colors duration-200" data-id="${campaign.id}">
                    Ver Detalhes
                </button>
            </div>
        `;
        
        campaignsList.appendChild(campaignCard);
        
        // Add click event to view campaign button
        campaignCard.querySelector('.view-campaign-btn').addEventListener('click', () => {
            viewCampaignDetails(campaign.id);
        });
    });
    
    if (filteredCampaigns.length === 0) {
        campaignsList.innerHTML = `
            <div class="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-8 text-center">
                <p>Nenhuma campanha encontrada.</p>
            </div>
        `;
    }
}

function viewCampaignDetails(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // Set campaign details
    document.getElementById('detailCampaignTitle').textContent = campaign.name;
    document.getElementById('detailImpressions').textContent = campaign.impressions.toLocaleString('pt-BR');
    document.getElementById('detailClicks').textContent = campaign.clicks.toLocaleString('pt-BR');
    document.getElementById('detailCTR').textContent = `${campaign.ctr.toFixed(2)}%`;
    document.getElementById('detailConversions').textContent = campaign.conversions.toLocaleString('pt-BR');
    
    const objectiveMap = {
        'conversions': 'Conversões',
        'awareness': 'Reconhecimento de Marca',
        'traffic': 'Tráfego',
        'leads': 'Geração de Leads',
        'sales': 'Vendas'
    };
    
    document.getElementById('detailObjective').textContent = objectiveMap[campaign.objective] || campaign.objective;
    document.getElementById('detailBudget').textContent = `R$ ${campaign.budget.toLocaleString('pt-BR')}`;
    
    const platformMap = {
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'google': 'Google Ads',
        'youtube': 'YouTube'
    };
    
    const platformNames = campaign.platforms.map(p => platformMap[p] || p).join(', ');
    document.getElementById('detailPlatforms').textContent = platformNames;
    
    const statusText = campaign.status === 'active' ? 'Ativa' : 'Pausada';
    document.getElementById('detailStatus').textContent = statusText;
    
    // Set button text based on status
    detailToggleStatusBtn.textContent = campaign.status === 'active' ? 'Pausar' : 'Ativar';
    detailToggleStatusBtn.classList.remove('bg-green-500', 'bg-yellow-500');
    detailToggleStatusBtn.classList.add(campaign.status === 'active' ? 'bg-yellow-500' : 'bg-green-500');
    
    // Set campaign ID for AI suggestions
    getAiSuggestions.dataset.campaignId = campaignId;
    
    // Reset AI suggestions content
    aiSuggestionsContent.innerHTML = '<p class="text-gray-600 dark:text-gray-400 text-sm italic">Clique em "Gerar Sugestões" para obter recomendações de otimização.</p>';
    
    // Add event listener to toggle status button
    detailToggleStatusBtn.onclick = () => {
        toggleCampaignStatus(campaignId);
    };
    
    // Show modal
    campaignDetailModal.classList.remove('hidden');
}

function toggleCampaignStatus(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    campaign.status = campaign.status === 'active' ? 'paused' : 'active';
    
    // Update button text
    detailToggleStatusBtn.textContent = campaign.status === 'active' ? 'Pausar' : 'Ativar';
    detailToggleStatusBtn.classList.remove('bg-green-500', 'bg-yellow-500');
    detailToggleStatusBtn.classList.add(campaign.status === 'active' ? 'bg-yellow-500' : 'bg-green-500');
    
    // Update status text
    const statusText = campaign.status === 'active' ? 'Ativa' : 'Pausada';
    document.getElementById('detailStatus').textContent = statusText;
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Re-render campaigns list
    renderCampaigns();
}

function generateMockSuggestions(campaign) {
    // Simulate loading delay
    setTimeout(() => {
        // Generate mock suggestions based on campaign data
        const suggestions = getMockSuggestions(campaign);
        
        // Display suggestions
        aiSuggestionsContent.innerHTML = marked.parse(suggestions);
        
        // Hide loading, show content
        aiSuggestionsLoading.classList.add('hidden');
        aiSuggestionsContent.classList.remove('hidden');
    }, 1500);
}

function getMockSuggestions(campaign) {
    // Basic template for suggestions based on campaign type
    const objectiveMap = {
        'conversions': ['taxa de conversão', 'custo por conversão', 'páginas de destino'],
        'awareness': ['alcance', 'impressões', 'frequência da exibição'],
        'traffic': ['taxa de cliques (CTR)', 'custo por clique (CPC)', 'qualidade do tráfego'],
        'leads': ['custo por lead', 'taxa de conversão de leads', 'qualificação de leads'],
        'sales': ['retorno sobre investimento (ROI)', 'valor médio de pedido', 'taxa de conversão de vendas']
    };
    
    const platformSuggestions = {
        'facebook': '### 1. Otimização de Segmentação\n**Benefício:** Aumento de 15-25% na relevância do público\n**Implementação:** Refine sua segmentação usando os dados de interesses e comportamentos mais recentes. Adicione segmentação com base em engajamento prévio para criar públicos semelhantes de alta qualidade.',
        'instagram': '### 1. Melhoria de Criativos\n**Benefício:** Aumento de 20-30% no engajamento\n**Implementação:** Utilize formatos mais imersivos como Reels e Stories com CTAs claros. Teste elementos visuais com alto contraste e mensagens diretas.',
        'google': '### 1. Otimização de Palavras-chave\n**Benefício:** Redução de 15-20% no CPC\n**Implementação:** Analise o desempenho atual das palavras-chave e ajuste as ofertas para aquelas com melhor conversão. Adicione palavras-chave negativas para eliminar tráfego irrelevante.',
        'youtube': '### 1. Otimização de Formato de Vídeo\n**Benefício:** Aumento de 25-35% na taxa de visualização completa\n**Implementação:** Produza vídeos mais curtos (15-30s) que capturam a atenção nos primeiros 5 segundos. Teste diferentes thumbnails para melhorar a taxa de cliques.'
    };
    
    // Generate suggestions based on campaign objective and platforms
    let suggestionText = `## Recomendações de Otimização\n\n`;
    
    // Add platform-specific suggestions
    campaign.platforms.forEach((platform, index) => {
        if (platformSuggestions[platform]) {
            suggestionText += platformSuggestions[platform] + '\n\n';
        }
    });
    
    // Add objective-specific suggestion
    const focusAreas = objectiveMap[campaign.objective] || ['desempenho geral', 'ROI', 'segmentação'];
    
    suggestionText += `### ${campaign.platforms.length + 1}. Ajuste de Orçamento\n`;
    suggestionText += `**Benefício:** Melhoria de 10-15% no ${focusAreas[0]}\n`;
    suggestionText += `**Implementação:** Redistribua o orçamento para os horários e dias da semana com melhor desempenho. Aumente gradualmente o investimento nos segmentos que apresentam melhor ${focusAreas[1]}.\n\n`;
    
    suggestionText += `### ${campaign.platforms.length + 2}. Testes A/B\n`;
    suggestionText += `**Benefício:** Identificação de oportunidades de otimização\n`;
    suggestionText += `**Implementação:** Implemente testes A/B para títulos, descrições e elementos visuais. Dedique 10-15% do orçamento para testar novas abordagens de ${focusAreas[2]}.`;
    
    return suggestionText;
}

// LocalStorage functions to persist data
function saveToLocalStorage() {
    try {
        const campaignsData = campaigns.map(campaign => ({
            ...campaign,
            createdAt: campaign.createdAt.toISOString() // Convert date to string for storage
        }));
        localStorage.setItem('adManagerCampaigns', JSON.stringify(campaignsData));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const savedCampaigns = localStorage.getItem('adManagerCampaigns');
        if (savedCampaigns) {
            // Parse and convert string dates back to Date objects
            campaigns = JSON.parse(savedCampaigns).map(campaign => ({
                ...campaign,
                createdAt: new Date(campaign.createdAt)
            }));
            
            // Find the highest campaign ID to continue the sequence
            if (campaigns.length > 0) {
                const maxId = Math.max(...campaigns.map(c => c.id));
                currentCampaignId = maxId + 1;
            }
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        campaigns = [...mockCampaigns]; // Fallback to mock data
    }
}

// Initialize the app
loadFromLocalStorage();
renderCampaigns();