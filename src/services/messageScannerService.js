const urlRegex = /(https?:\/\/[^\s]+)/g;

const urgencyWords = ['urgent', 'immediately', 'now', 'today', '24 hours', 'action required', 'expires'];
const fearWords = ['suspended', 'locked', 'hacked', 'compromised', 'unauthorized', 'disabled', 'violation'];
const greedWords = ['won', 'prize', 'free', 'discount', 'reward', 'lottery', 'exclusive', 'bonus'];
const authorityWords = ['bank', 'irs', 'police', 'government', 'tax', 'administrator', 'support desk'];
const trustWords = ['dear customer', 'valued member', 'billing department', 'dear user'];

exports.scanMessage = (text) => {
    const urlsText = text.match(urlRegex) || [];
    let score = 0;
    
    let scores = {
        urgency: 0,
        fear: 0,
        greed: 0,
        authority: 0,
        trust: 0
    };

    let tricksDetected = [];
    const lowerText = text.toLowerCase();

    // Helper to check counts
    const calculateCategory = (keywords, categoryName) => {
        keywords.forEach(word => {
            if (lowerText.includes(word)) {
                scores[categoryName] += 20;
                tricksDetected.push({
                    trick: categoryName,
                    keyword: word,
                    explanation: `Uses the word '${word}' to create a sense of ${categoryName}.`
                });
            }
        });
    };

    calculateCategory(urgencyWords, 'urgency');
    calculateCategory(fearWords, 'fear');
    calculateCategory(greedWords, 'greed');
    calculateCategory(authorityWords, 'authority');
    calculateCategory(trustWords, 'trust');

    // Cap at 100 for each category
    for (let key in scores) {
        scores[key] = Math.min(scores[key], 100);
    }

    // Average psychological score
    const avgScore = (scores.urgency + scores.fear + scores.greed + scores.authority + scores.trust) / 5;
    
    // Total Risk adjustment
    let totalRisk = avgScore;
    if (urlsText.length > 0) {
        totalRisk += 15; // presence of URLs increases danger
    }
    totalRisk = Math.min(totalRisk, 100);

    return {
        text: text,
        urlsExtracted: urlsText,
        manipulationScore: totalRisk,
        tricksBreakdown: scores,
        detectedPatterns: tricksDetected,
    };
};
