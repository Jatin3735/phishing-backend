const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'update', 'banking', 'confirm', 'wallet'];
const brands = ['paypal', 'amazon', 'google', 'facebook', 'microsoft', 'apple', 'netflix', 'chase', 'bankofamerica'];

exports.scanUrl = async (url) => {
    let score = 0;
    let reasons = [];

    // Parse URL
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        return {
            url,
            score: 100,
            riskLevel: 'dangerous',
            reasons: ['Invalid URL format']
        };
    }

    const { hostname, pathname, search } = parsedUrl;
    const fullUrlString = url.toLowerCase();

    // 1. Check IP-based URLs
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(hostname)) {
        score += 40;
        reasons.push('Uses an IP address instead of a domain name');
    }

    // 2. Length of URL
    if (fullUrlString.length > 75) {
        score += 10;
        reasons.push('URL is unusually long');
    }

    // 3. Count of Dots in Domain
    const dotCount = hostname.split('.').length - 1;
    if (dotCount > 3) {
        score += 20;
        reasons.push('Too many subdomains detected');
    }

    // 4. Hyphens in domain
    if (hostname.includes('-')) {
        score += 10;
        reasons.push('Domain contains hyphens (common in phishing)');
    }

    // 5. Suspicious Keywords
    suspiciousKeywords.forEach(keyword => {
        if (fullUrlString.includes(keyword)) {
            score += 15;
            reasons.push(`Contains suspicious keyword: ${keyword}`);
        }
    });

    // 6. Brand impersonation
    brands.forEach(brand => {
        if (fullUrlString.includes(brand)) {
             if (!hostname.endsWith(`${brand}.com`)) {
                 score += 30;
                 reasons.push(`Potential brand impersonation: ${brand}`);
             }
        }
    });

    // 7. SSL verification (mocking)
    if (parsedUrl.protocol !== 'https:') {
        score += 15;
        reasons.push('Does not use HTTPS');
    }

    // Determine Risk Level
    score = Math.min(score, 100);
    let riskLevel = 'safe';
    if (score >= 60) riskLevel = 'dangerous';
    else if (score >= 30) riskLevel = 'suspicious';

    return {
        url,
        score,
        riskLevel,
        reasons
    };
};
