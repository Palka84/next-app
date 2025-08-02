class ReviewAnalyzer {
    constructor() {
        this.reviews = [];
        this.datePatterns = {
            today: /dziś|today/i,
            yesterday: /wczoraj|yesterday/i,
            daysAgo: /(\d+)\s*(dni?|days?)\s*temu/i,
            weeksAgo: /(\d+)\s*(tygodni?e?|weeks?)\s*temu/i,
            monthsAgo: /(\d+)\s*(miesiąc[ye]?|months?)\s*temu/i,
            yearsAgo: /(\d+)\s*(lat?a?|years?)\s*temu/i,
            isoDate: /(\d{4}-\d{2}-\d{2})/,
            polishDate: /(\d{1,2})\.(\d{1,2})\.(\d{4})/
        };
        
        this.starPatterns = {
            stars: /[⭐★]/g,
            oneStarText: /1\s*(gwiazdka|gwiazdki|star|stars?|\/5)/i,
            twoStarText: /2\s*(gwiazdki|stars?|\/5)/i,
            threeStarText: /3\s*(gwiazdki|stars?|\/5)/i,
            fourStarText: /4\s*(gwiazdki|stars?|\/5)/i,
            fiveStarText: /5\s*(gwiazdek|gwiazdki|stars?|\/5)/i
        };
        
        this.likesPatterns = {
            thumbsUp: /👍\s*(\d+)/,
            helpfulText: /(pomocne|helpful)[\s:]*(\d+)/i,
            likesText: /(\d+)\s*(polubień|likes?)/i,
            likesNumber: /likes?\s*[\s:]*(\d+)/i
        };
    }

    parseReviews(text) {
        if (!text || text.trim() === '') {
            throw new Error('Proszę wkleić tekst z opiniami do analizy.');
        }

        this.reviews = [];
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        let currentReview = {
            author: '',
            stars: 0,
            dateText: '',
            content: '',
            likes: 0,
            parsedDate: null
        };
        
        let reviewStarted = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Detect stars rating
            const stars = this.parseStars(line);
            if (stars > 0) {
                if (reviewStarted) {
                    // Save previous review if it was 1-2 stars
                    if (currentReview.stars <= 2 && currentReview.stars > 0) {
                        this.reviews.push({...currentReview});
                    }
                }
                
                // Start new review
                currentReview = {
                    author: i > 0 ? lines[i-1] : 'Nieznany autor',
                    stars: stars,
                    dateText: '',
                    content: '',
                    likes: 0,
                    parsedDate: null
                };
                reviewStarted = true;
                continue;
            }
            
            // Parse date
            const dateInfo = this.parseDate(line);
            if (dateInfo.found && reviewStarted) {
                currentReview.dateText = line;
                currentReview.parsedDate = dateInfo.date;
                continue;
            }
            
            // Parse likes
            const likes = this.parseLikes(line);
            if (likes > 0 && reviewStarted) {
                currentReview.likes = likes;
                continue;
            }
            
            // Everything else is content (if review started and not author line)
            if (reviewStarted && line !== currentReview.author) {
                if (currentReview.content) {
                    currentReview.content += ' ';
                }
                currentReview.content += line;
            }
        }
        
        // Don't forget the last review
        if (reviewStarted && currentReview.stars <= 2 && currentReview.stars > 0) {
            this.reviews.push({...currentReview});
        }
        
        if (this.reviews.length === 0) {
            throw new Error('Nie znaleziono żadnych opinii 1-2 gwiazdki. Sprawdź format danych.');
        }
        
        return this.reviews;
    }

    parseStars(text) {
        // Count star symbols
        const starSymbols = text.match(this.starPatterns.stars);
        if (starSymbols) {
            return Math.min(starSymbols.length, 5);
        }
        
        // Check text patterns
        if (this.starPatterns.oneStarText.test(text)) return 1;
        if (this.starPatterns.twoStarText.test(text)) return 2;
        if (this.starPatterns.threeStarText.test(text)) return 3;
        if (this.starPatterns.fourStarText.test(text)) return 4;
        if (this.starPatterns.fiveStarText.test(text)) return 5;
        
        return 0;
    }

    parseDate(text) {
        const now = new Date();
        
        // Today
        if (this.datePatterns.today.test(text)) {
            return { found: true, date: new Date(now) };
        }
        
        // Yesterday
        if (this.datePatterns.yesterday.test(text)) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            return { found: true, date: yesterday };
        }
        
        // Days ago
        let match = text.match(this.datePatterns.daysAgo);
        if (match) {
            const daysAgo = parseInt(match[1]);
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);
            return { found: true, date };
        }
        
        // Weeks ago
        match = text.match(this.datePatterns.weeksAgo);
        if (match) {
            const weeksAgo = parseInt(match[1]);
            const date = new Date(now);
            date.setDate(date.getDate() - (weeksAgo * 7));
            return { found: true, date };
        }
        
        // Months ago
        match = text.match(this.datePatterns.monthsAgo);
        if (match) {
            const monthsAgo = parseInt(match[1]);
            const date = new Date(now);
            date.setMonth(date.getMonth() - monthsAgo);
            return { found: true, date };
        }
        
        // Years ago
        match = text.match(this.datePatterns.yearsAgo);
        if (match) {
            const yearsAgo = parseInt(match[1]);
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - yearsAgo);
            return { found: true, date };
        }
        
        // ISO date format
        match = text.match(this.datePatterns.isoDate);
        if (match) {
            return { found: true, date: new Date(match[1]) };
        }
        
        // Polish date format (DD.MM.YYYY)
        match = text.match(this.datePatterns.polishDate);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JavaScript months are 0-based
            const year = parseInt(match[3]);
            return { found: true, date: new Date(year, month, day) };
        }
        
        return { found: false, date: null };
    }

    parseLikes(text) {
        // Thumbs up emoji with number
        let match = text.match(this.likesPatterns.thumbsUp);
        if (match) {
            return parseInt(match[1]);
        }
        
        // "Pomocne: X" or "Helpful: X"
        match = text.match(this.likesPatterns.helpfulText);
        if (match) {
            return parseInt(match[2]);
        }
        
        // "X polubień" or "X likes"
        match = text.match(this.likesPatterns.likesText);
        if (match) {
            return parseInt(match[1]);
        }
        
        // "likes: X"
        match = text.match(this.likesPatterns.likesNumber);
        if (match) {
            return parseInt(match[1]);
        }
        
        return 0;
    }

    analyzeByDatePeriods() {
        const now = new Date();
        const periods = {
            last7Days: { count: 0, label: 'Ostatnie 7 dni' },
            last30Days: { count: 0, label: 'Ostatnie 30 dni' },
            last3Months: { count: 0, label: 'Ostatnie 3 miesiące' },
            last6Months: { count: 0, label: 'Ostatnie 6 miesięcy' },
            last12Months: { count: 0, label: 'Ostatni rok' },
            older: { count: 0, label: 'Starsze niż rok' },
            unknown: { count: 0, label: 'Nieznana data' }
        };

        this.reviews.forEach(review => {
            if (!review.parsedDate) {
                periods.unknown.count++;
                return;
            }

            const daysDiff = Math.floor((now - review.parsedDate) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 7) {
                periods.last7Days.count++;
            } else if (daysDiff <= 30) {
                periods.last30Days.count++;
            } else if (daysDiff <= 90) {
                periods.last3Months.count++;
            } else if (daysDiff <= 180) {
                periods.last6Months.count++;
            } else if (daysDiff <= 365) {
                periods.last12Months.count++;
            } else {
                periods.older.count++;
            }
        });

        return periods;
    }

    analyzeLikes() {
        const totalLikes = this.reviews.reduce((sum, review) => sum + review.likes, 0);
        const reviewsWithLikes = this.reviews.filter(review => review.likes > 0);
        const avgLikes = reviewsWithLikes.length > 0 ? 
            (totalLikes / reviewsWithLikes.length).toFixed(1) : 0;

        // Find most liked review
        const mostLiked = this.reviews.reduce((max, review) => 
            review.likes > max.likes ? review : max, { likes: 0 });

        // Group by likes ranges
        const likesRanges = {
            noLikes: this.reviews.filter(r => r.likes === 0).length,
            likes1to5: this.reviews.filter(r => r.likes >= 1 && r.likes <= 5).length,
            likes6to15: this.reviews.filter(r => r.likes >= 6 && r.likes <= 15).length,
            likes16plus: this.reviews.filter(r => r.likes >= 16).length
        };

        return {
            total: totalLikes,
            average: avgLikes,
            mostLiked: mostLiked,
            ranges: likesRanges,
            withLikes: reviewsWithLikes.length,
            withoutLikes: this.reviews.length - reviewsWithLikes.length
        };
    }

    getStats() {
        const oneStarReviews = this.reviews.filter(r => r.stars === 1);
        const twoStarReviews = this.reviews.filter(r => r.stars === 2);
        
        return {
            total: this.reviews.length,
            oneStar: oneStarReviews.length,
            twoStar: twoStarReviews.length,
            dateAnalysis: this.analyzeByDatePeriods(),
            likesAnalysis: this.analyzeLikes(),
            reviews: this.reviews
        };
    }
}

// Global analyzer instance
const analyzer = new ReviewAnalyzer();

function analyzeReviews() {
    const input = document.getElementById('reviewsInput');
    const errorContainer = document.getElementById('errorContainer');
    const resultsSection = document.getElementById('resultsSection');
    
    // Clear previous errors
    errorContainer.innerHTML = '';
    
    try {
        const text = input.value.trim();
        analyzer.parseReviews(text);
        const stats = analyzer.getStats();
        
        displayResults(stats);
        resultsSection.style.display = 'block';
        
    } catch (error) {
        errorContainer.innerHTML = `
            <div class="error-message">
                <strong>Błąd:</strong> ${error.message}
            </div>
        `;
        resultsSection.style.display = 'none';
    }
}

function displayResults(stats) {
    // Update main stats
    document.getElementById('totalReviews').textContent = stats.total;
    document.getElementById('oneStarCount').textContent = stats.oneStar;
    document.getElementById('twoStarCount').textContent = stats.twoStar;
    document.getElementById('totalLikes').textContent = stats.likesAnalysis.total;
    
    // Display date breakdown
    displayDateBreakdown(stats.dateAnalysis);
    
    // Display likes breakdown
    displayLikesBreakdown(stats.likesAnalysis);
}

function displayDateBreakdown(dateAnalysis) {
    const container = document.getElementById('dateBreakdown');
    container.innerHTML = '';
    
    Object.values(dateAnalysis).forEach(period => {
        if (period.count > 0) {
            const item = document.createElement('div');
            item.className = 'date-item';
            item.innerHTML = `
                <strong>${period.count}</strong> opinii<br>
                <small>${period.label}</small>
            `;
            container.appendChild(item);
        }
    });
}

function displayLikesBreakdown(likesAnalysis) {
    const container = document.getElementById('likesBreakdown');
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #0f9d58;">
                <strong>Średnia polubień:</strong> ${likesAnalysis.average}
            </div>
            <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #0f9d58;">
                <strong>Z polubieniami:</strong> ${likesAnalysis.withLikes} opinii
            </div>
            <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #0f9d58;">
                <strong>Bez polubień:</strong> ${likesAnalysis.withoutLikes} opinii
            </div>
            ${likesAnalysis.mostLiked.likes > 0 ? `
            <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #0f9d58;">
                <strong>Najbardziej polubiona:</strong> ${likesAnalysis.mostLiked.likes} 👍<br>
                <small>Autor: ${likesAnalysis.mostLiked.author}</small>
            </div>
            ` : ''}
        </div>
        
        <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 10px;">Rozkład polubień:</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                    <strong>${likesAnalysis.ranges.noLikes}</strong><br>
                    <small>0 polubień</small>
                </div>
                <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                    <strong>${likesAnalysis.ranges.likes1to5}</strong><br>
                    <small>1-5 polubień</small>
                </div>
                <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                    <strong>${likesAnalysis.ranges.likes6to15}</strong><br>
                    <small>6-15 polubień</small>
                </div>
                <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                    <strong>${likesAnalysis.ranges.likes16plus}</strong><br>
                    <small>16+ polubień</small>
                </div>
            </div>
        </div>
    `;
}

// Allow Enter key to trigger analysis (Ctrl+Enter)
document.getElementById('reviewsInput').addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        analyzeReviews();
    }
});

// Auto-resize textarea
document.getElementById('reviewsInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.max(200, this.scrollHeight) + 'px';
});