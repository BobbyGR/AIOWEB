(function () {
    'use strict';

    const COINS = {
        bitcoin: {
            id: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            algorithm: 'SHA-256',
            hashrateUnit: 'TH/s',
            hashrateMultiplier: 1e12,
            defaultHashrate: 100,
            defaultPower: 3000,
            blockReward: 3.125,
            blockTime: 600,
            networkHashrate: 750e18,
        },
        'ethereum-classic': {
            id: 'ethereum-classic',
            symbol: 'ETC',
            name: 'Ethereum Classic',
            algorithm: 'Etchash',
            hashrateUnit: 'MH/s',
            hashrateMultiplier: 1e6,
            defaultHashrate: 500,
            defaultPower: 1000,
            blockReward: 2.048,
            blockTime: 13,
            networkHashrate: 200e12,
        },
        litecoin: {
            id: 'litecoin',
            symbol: 'LTC',
            name: 'Litecoin',
            algorithm: 'Scrypt',
            hashrateUnit: 'GH/s',
            hashrateMultiplier: 1e9,
            defaultHashrate: 9.5,
            defaultPower: 3500,
            blockReward: 6.25,
            blockTime: 150,
            networkHashrate: 1.2e15,
        },
        monero: {
            id: 'monero',
            symbol: 'XMR',
            name: 'Monero',
            algorithm: 'RandomX',
            hashrateUnit: 'KH/s',
            hashrateMultiplier: 1e3,
            defaultHashrate: 20,
            defaultPower: 300,
            blockReward: 0.6,
            blockTime: 120,
            networkHashrate: 2.5e9,
        },
        kaspa: {
            id: 'kaspa',
            symbol: 'KAS',
            name: 'Kaspa',
            algorithm: 'kHeavyHash',
            hashrateUnit: 'TH/s',
            hashrateMultiplier: 1e12,
            defaultHashrate: 12,
            defaultPower: 3000,
            blockReward: 78.12,
            blockTime: 1,
            networkHashrate: 1.2e18,
        },
        ravencoin: {
            id: 'ravencoin',
            symbol: 'RVN',
            name: 'Ravencoin',
            algorithm: 'KawPow',
            hashrateUnit: 'MH/s',
            hashrateMultiplier: 1e6,
            defaultHashrate: 30,
            defaultPower: 200,
            blockReward: 2500,
            blockTime: 60,
            networkHashrate: 5e12,
        },
        zcash: {
            id: 'zcash',
            symbol: 'ZEC',
            name: 'Zcash',
            algorithm: 'Equihash',
            hashrateUnit: 'KSol/s',
            hashrateMultiplier: 1e3,
            defaultHashrate: 400,
            defaultPower: 1500,
            blockReward: 1.5625,
            blockTime: 75,
            networkHashrate: 9e9,
        },
        dogecoin: {
            id: 'dogecoin',
            symbol: 'DOGE',
            name: 'Dogecoin',
            algorithm: 'Scrypt',
            hashrateUnit: 'GH/s',
            hashrateMultiplier: 1e9,
            defaultHashrate: 9.5,
            defaultPower: 3500,
            blockReward: 10000,
            blockTime: 60,
            networkHashrate: 1.5e15,
        },
    };

    let prices = {};
    let selectedCoin = 'bitcoin';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ── Price Fetching ──
    async function fetchPrices() {
        const ids = Object.keys(COINS).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            prices = await res.json();
            updateCoinPrice();
            renderCoinCards();
        } catch (err) {
            console.warn('Price fetch failed, using fallback prices:', err);
            prices = {
                bitcoin: { usd: 84000, usd_24h_change: 1.2 },
                'ethereum-classic': { usd: 18, usd_24h_change: -0.5 },
                litecoin: { usd: 85, usd_24h_change: 0.8 },
                monero: { usd: 215, usd_24h_change: 2.1 },
                kaspa: { usd: 0.095, usd_24h_change: 3.4 },
                ravencoin: { usd: 0.018, usd_24h_change: -1.2 },
                zcash: { usd: 38, usd_24h_change: 0.3 },
                dogecoin: { usd: 0.16, usd_24h_change: 1.5 },
            };
            updateCoinPrice();
            renderCoinCards();
        }
    }

    function getCoinPrice(coinId) {
        return prices[coinId]?.usd || 0;
    }

    function getCoinChange(coinId) {
        return prices[coinId]?.usd_24h_change || 0;
    }

    // ── Formatting ──
    function formatUSD(val) {
        if (Math.abs(val) >= 1) {
            return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }

    function formatCoinAmount(val, symbol) {
        let decimals = 8;
        if (val > 1000) decimals = 2;
        else if (val > 1) decimals = 4;
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals }) + ' ' + symbol;
    }

    function formatHashrate(hashrate) {
        const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
        let i = 0;
        while (hashrate >= 1000 && i < units.length - 1) {
            hashrate /= 1000;
            i++;
        }
        return hashrate.toFixed(2) + ' ' + units[i];
    }

    // ── Calculator Logic ──
    function calculateProfit(coinId, hashrate, power, electricityCost, poolFee) {
        const coin = COINS[coinId];
        const price = getCoinPrice(coinId);
        const userHashrateRaw = hashrate * coin.hashrateMultiplier;
        const shareOfNetwork = userHashrateRaw / coin.networkHashrate;
        const blocksPerDay = 86400 / coin.blockTime;
        const dailyCoins = shareOfNetwork * blocksPerDay * coin.blockReward * (1 - poolFee / 100);
        const dailyRevenue = dailyCoins * price;
        const dailyPowerCost = (power / 1000) * 24 * electricityCost;
        const dailyProfit = dailyRevenue - dailyPowerCost;

        return {
            daily: { coins: dailyCoins, revenue: dailyRevenue, cost: dailyPowerCost, profit: dailyProfit },
            monthly: { coins: dailyCoins * 30, revenue: dailyRevenue * 30, cost: dailyPowerCost * 30, profit: dailyProfit * 30 },
            yearly: { coins: dailyCoins * 365, revenue: dailyRevenue * 365, cost: dailyPowerCost * 365, profit: dailyProfit * 365 },
        };
    }

    // ── UI Updates ──
    function updateCoinPrice() {
        const price = getCoinPrice(selectedCoin);
        const priceEl = $('#coinPrice');
        if (price > 0) {
            priceEl.textContent = formatUSD(price);
        } else {
            priceEl.innerHTML = '<span class="spinner"></span>';
        }
    }

    function selectCoin(coinId) {
        selectedCoin = coinId;
        const coin = COINS[coinId];

        $$('.coin-tab').forEach((tab) => tab.classList.remove('active'));
        $(`.coin-tab[data-coin="${coinId}"]`).classList.add('active');

        $('#hashrateUnit').textContent = coin.hashrateUnit;
        $('#hashrate').placeholder = coin.defaultHashrate;
        $('#power').placeholder = coin.defaultPower;
        $('#algorithm').textContent = coin.algorithm;
        updateCoinPrice();

        $('#resultsPanel').style.display = 'none';
    }

    function displayResults(results) {
        const coin = COINS[selectedCoin];
        const panel = $('#resultsPanel');
        panel.style.display = 'block';

        const periods = ['daily', 'monthly', 'yearly'];
        periods.forEach((period) => {
            const data = results[period];
            $(`#${period}Coins`).textContent = formatCoinAmount(data.coins, coin.symbol);
            $(`#${period}Revenue`).textContent = formatUSD(data.revenue);
            $(`#${period}Cost`).textContent = '-' + formatUSD(data.cost) + ' power';
            const profitEl = $(`#${period}Profit`);
            profitEl.textContent = (data.profit >= 0 ? '+' : '') + formatUSD(data.profit);
            profitEl.className = 'result-profit ' + (data.profit >= 0 ? 'positive' : 'negative');
        });

        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ── Coin Cards ──
    function renderCoinCards() {
        const grid = $('#coinsGrid');
        grid.innerHTML = '';

        Object.values(COINS).forEach((coin) => {
            const price = getCoinPrice(coin.id);
            const change = getCoinChange(coin.id);
            const changeDir = change >= 0 ? 'up' : 'down';
            const changeSign = change >= 0 ? '+' : '';

            const card = document.createElement('div');
            card.className = 'coin-card';
            card.addEventListener('click', () => {
                selectCoin(coin.id);
                $('#calculator').scrollIntoView({ behavior: 'smooth' });
            });

            card.innerHTML = `
                <div class="coin-card-header">
                    <div class="coin-card-name">
                        <span class="symbol">${coin.symbol}</span>
                        <span class="name">${coin.name}</span>
                    </div>
                    <span class="coin-card-algo">${coin.algorithm}</span>
                </div>
                <div class="coin-card-price">${formatUSD(price)}</div>
                <div class="coin-card-change ${changeDir}">${changeSign}${change.toFixed(2)}% (24h)</div>
                <div class="coin-card-stats">
                    <div class="coin-stat">
                        <span class="coin-stat-label">Network Hashrate</span>
                        <span class="coin-stat-value">${formatHashrate(coin.networkHashrate)}</span>
                    </div>
                    <div class="coin-stat">
                        <span class="coin-stat-label">Block Reward</span>
                        <span class="coin-stat-value">${coin.blockReward} ${coin.symbol}</span>
                    </div>
                    <div class="coin-stat">
                        <span class="coin-stat-label">Block Time</span>
                        <span class="coin-stat-value">${coin.blockTime}s</span>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    // ── Event Handlers ──
    function initEvents() {
        $$('.coin-tab').forEach((tab) => {
            tab.addEventListener('click', () => selectCoin(tab.dataset.coin));
        });

        $('#calcForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const coin = COINS[selectedCoin];
            const hashrate = parseFloat($('#hashrate').value) || coin.defaultHashrate;
            const power = parseFloat($('#power').value) || coin.defaultPower;
            const electricityCost = parseFloat($('#electricityCost').value) || 0.10;
            const poolFee = parseFloat($('#poolFee').value) || 1;

            if (!$('#hashrate').value) $('#hashrate').value = coin.defaultHashrate;
            if (!$('#power').value) $('#power').value = coin.defaultPower;

            const results = calculateProfit(selectedCoin, hashrate, power, electricityCost, poolFee);
            displayResults(results);
        });

        const navToggle = $('#navToggle');
        const navLinks = $('#navLinks');
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        $$('.nav-links a').forEach((link) => {
            link.addEventListener('click', () => navLinks.classList.remove('open'));
        });

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const navbar = $('#navbar');
            const scrollY = window.scrollY;
            if (scrollY > 100) {
                navbar.style.background = 'rgba(8, 8, 15, 0.95)';
            } else {
                navbar.style.background = 'rgba(8, 8, 15, 0.85)';
            }
            lastScroll = scrollY;
        });
    }

    // ── Init ──
    function init() {
        initEvents();
        fetchPrices();
        setInterval(fetchPrices, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
