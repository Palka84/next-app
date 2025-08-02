import streamlit as st
import pandas as pd
import re
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
from dateutil import parser
import json

class ReviewAnalyzer:
    def __init__(self):
        self.reviews_data = []
    
    def parse_review_text(self, text):
        """
        Parse review text to extract information about rating, date, likes, and content
        """
        lines = text.strip().split('\n')
        reviews = []
        
        current_review = {}
        content_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_review and content_lines:
                    current_review['content'] = ' '.join(content_lines)
                    reviews.append(current_review.copy())
                    current_review = {}
                    content_lines = []
                continue
            
            # Check for rating (1-5 stars or gwiazdki)
            star_pattern = r'([1-5])\s*(?:gwiazdka|gwiazdki|gwiazda|star|stars|\*)'
            star_match = re.search(star_pattern, line, re.IGNORECASE)
            if star_match:
                current_review['rating'] = int(star_match.group(1))
                continue
            
            # Check for date patterns
            date_patterns = [
                r'(\d{1,2})\s*(stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\s*(\d{4})',
                r'(\d{1,2})[.-](\d{1,2})[.-](\d{4})',
                r'(\d{4})[.-](\d{1,2})[.-](\d{1,2})',
                r'(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})',
                r'(\d{1,2})\s*miesięcy?\s*temu',
                r'(\d{1,2})\s*tygodni?\s*temu',
                r'(\d{1,2})\s*dni?\s*temu'
            ]
            
            for pattern in date_patterns:
                date_match = re.search(pattern, line, re.IGNORECASE)
                if date_match:
                    current_review['date_text'] = line
                    current_review['parsed_date'] = self.parse_date(date_match.groups(), pattern)
                    continue
            
            # Check for likes/thumbs up
            likes_patterns = [
                r'(\d+)\s*(?:polubień|polubienia|likes?|👍)',
                r'(?:polubień|polubienia|likes?):\s*(\d+)',
                r'(\d+)\s*osób?\s*(?:polubiło|liked)'
            ]
            
            for pattern in likes_patterns:
                likes_match = re.search(pattern, line, re.IGNORECASE)
                if likes_match:
                    current_review['likes'] = int(likes_match.group(1))
                    continue
            
            # If no specific pattern matched, treat as content
            content_lines.append(line)
        
        # Handle last review
        if current_review and content_lines:
            current_review['content'] = ' '.join(content_lines)
            reviews.append(current_review)
        
        return reviews
    
    def parse_date(self, date_groups, pattern):
        """
        Parse date from regex groups
        """
        try:
            if 'miesięc' in pattern:
                months_ago = int(date_groups[0])
                return datetime.now() - timedelta(days=months_ago * 30)
            elif 'tydzień' in pattern:
                weeks_ago = int(date_groups[0])
                return datetime.now() - timedelta(weeks=weeks_ago)
            elif 'dni' in pattern:
                days_ago = int(date_groups[0])
                return datetime.now() - timedelta(days=days_ago)
            else:
                # Try to parse actual date
                if len(date_groups) == 3:
                    # Handle Polish month names
                    polish_months = {
                        'stycznia': 1, 'lutego': 2, 'marca': 3, 'kwietnia': 4,
                        'maja': 5, 'czerwca': 6, 'lipca': 7, 'sierpnia': 8,
                        'września': 9, 'października': 10, 'listopada': 11, 'grudnia': 12
                    }
                    
                    if date_groups[1].lower() in polish_months:
                        day = int(date_groups[0])
                        month = polish_months[date_groups[1].lower()]
                        year = int(date_groups[2])
                        return datetime(year, month, day)
                    else:
                        # Try different date formats
                        for fmt in ['%d-%m-%Y', '%Y-%m-%d', '%d.%m.%Y']:
                            try:
                                date_str = f"{date_groups[0]}-{date_groups[1]}-{date_groups[2]}"
                                return datetime.strptime(date_str, fmt)
                            except:
                                continue
        except:
            pass
        
        return datetime.now()  # Default to now if parsing fails
    
    def analyze_reviews(self, reviews):
        """
        Analyze the parsed reviews and generate statistics
        """
        if not reviews:
            return {}
        
        df = pd.DataFrame(reviews)
        
        # Ensure all reviews have default values
        df['rating'] = df.get('rating', 1)
        df['likes'] = df.get('likes', 0)
        df['parsed_date'] = df.get('parsed_date', datetime.now())
        
        # Filter for 1-2 star reviews
        low_rating_reviews = df[df['rating'].isin([1, 2])]
        
        now = datetime.now()
        three_months_ago = now - timedelta(days=90)
        six_months_ago = now - timedelta(days=180)
        
        # Time-based analysis
        recent_3m = low_rating_reviews[low_rating_reviews['parsed_date'] >= three_months_ago]
        recent_6m = low_rating_reviews[low_rating_reviews['parsed_date'] >= six_months_ago]
        
        analysis = {
            'total_reviews': len(df),
            'low_rating_reviews': len(low_rating_reviews),
            'one_star': len(low_rating_reviews[low_rating_reviews['rating'] == 1]),
            'two_star': len(low_rating_reviews[low_rating_reviews['rating'] == 2]),
            'recent_3_months': len(recent_3m),
            'recent_6_months': len(recent_6m),
            'total_likes': low_rating_reviews['likes'].sum(),
            'avg_likes': low_rating_reviews['likes'].mean(),
            'max_likes': low_rating_reviews['likes'].max(),
            'reviews_with_likes': len(low_rating_reviews[low_rating_reviews['likes'] > 0]),
            'percentage_low_rating': (len(low_rating_reviews) / len(df)) * 100 if len(df) > 0 else 0
        }
        
        return analysis, low_rating_reviews

def main():
    st.set_page_config(
        page_title="Analizator Opinii Google Maps",
        page_icon="⭐",
        layout="wide"
    )
    
    st.title("🗺️ Analizator Opinii Google Maps")
    st.markdown("### Analiza opinii o niskich ocenach (1-2 gwiazdki)")
    
    analyzer = ReviewAnalyzer()
    
    # Input section
    st.header("📝 Wklej Opinie")
    review_text = st.text_area(
        "Wklej tutaj opinie z Google Maps (każda opinia w nowej linii):",
        height=300,
        placeholder="""Przykład formatu:
Jan Kowalski
1 gwiazdka
15 grudnia 2023
Bardzo słaba obsługa...
3 polubienia

Anna Nowak
2 gwiazdki
2 miesiące temu
Jedzenie zimne...
1 polubienie"""
    )
    
    if st.button("🔍 Analizuj Opinie", type="primary"):
        if review_text:
            with st.spinner("Analizuję opinie..."):
                # Parse reviews
                reviews = analyzer.parse_review_text(review_text)
                
                if reviews:
                    # Analyze reviews
                    analysis, low_rating_df = analyzer.analyze_reviews(reviews)
                    
                    # Display results
                    st.success(f"Przeanalizowano {len(reviews)} opinii!")
                    
                    # Main statistics
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.metric(
                            "Opinie 1-2 ⭐",
                            analysis['low_rating_reviews'],
                            f"{analysis['percentage_low_rating']:.1f}% wszystkich"
                        )
                    
                    with col2:
                        st.metric(
                            "Ostatnie 3 miesiące",
                            analysis['recent_3_months']
                        )
                    
                    with col3:
                        st.metric(
                            "Ostatnie 6 miesięcy", 
                            analysis['recent_6_months']
                        )
                    
                    with col4:
                        st.metric(
                            "Całkowite polubienia",
                            analysis['total_likes']
                        )
                    
                    # Detailed breakdown
                    st.header("📊 Szczegółowa Analiza")
                    
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.subheader("🌟 Rozkład Ocen")
                        rating_data = {
                            'Ocena': ['1 gwiazdka', '2 gwiazdki'],
                            'Liczba': [analysis['one_star'], analysis['two_star']]
                        }
                        
                        fig_rating = px.bar(
                            rating_data, 
                            x='Ocena', 
                            y='Liczba',
                            title="Liczba opinii według oceny",
                            color='Ocena',
                            color_discrete_map={'1 gwiazdka': '#ff4444', '2 gwiazdki': '#ff8844'}
                        )
                        st.plotly_chart(fig_rating, use_container_width=True)
                    
                    with col2:
                        st.subheader("👍 Analiza Polubień")
                        st.write(f"**Średnia polubień na opinię:** {analysis['avg_likes']:.1f}")
                        st.write(f"**Maksymalne polubienia:** {analysis['max_likes']}")
                        st.write(f"**Opinie z polubieniami:** {analysis['reviews_with_likes']} z {analysis['low_rating_reviews']}")
                        
                        # Likes distribution
                        if not low_rating_df.empty:
                            likes_dist = low_rating_df['likes'].value_counts().sort_index()
                            fig_likes = px.histogram(
                                low_rating_df, 
                                x='likes',
                                title="Rozkład liczby polubień",
                                nbins=max(10, len(likes_dist))
                            )
                            st.plotly_chart(fig_likes, use_container_width=True)
                    
                    # Time analysis
                    st.subheader("📅 Analiza Czasowa")
                    if not low_rating_df.empty:
                        # Group by month
                        low_rating_df['month_year'] = low_rating_df['parsed_date'].dt.to_period('M')
                        monthly_counts = low_rating_df.groupby('month_year').size().reset_index(name='count')
                        monthly_counts['month_year_str'] = monthly_counts['month_year'].astype(str)
                        
                        fig_time = px.line(
                            monthly_counts,
                            x='month_year_str',
                            y='count',
                            title="Liczba opinii 1-2 ⭐ w czasie",
                            markers=True
                        )
                        fig_time.update_xaxes(title="Miesiąc")
                        fig_time.update_yaxes(title="Liczba opinii")
                        st.plotly_chart(fig_time, use_container_width=True)
                    
                    # Raw data
                    st.subheader("📋 Szczegóły Opinii")
                    if not low_rating_df.empty:
                        display_df = low_rating_df[['rating', 'parsed_date', 'likes', 'content']].copy()
                        display_df.columns = ['Ocena', 'Data', 'Polubienia', 'Treść']
                        display_df['Data'] = display_df['Data'].dt.strftime('%Y-%m-%d')
                        st.dataframe(display_df, use_container_width=True)
                        
                        # Download option
                        csv = display_df.to_csv(index=False, encoding='utf-8')
                        st.download_button(
                            label="📥 Pobierz dane jako CSV",
                            data=csv,
                            file_name=f"analiza_opinii_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                            mime="text/csv"
                        )
                
                else:
                    st.error("Nie udało się sparsować opinii. Sprawdź format danych.")
        else:
            st.warning("Proszę wkleić opinie do analizy.")
    
    # Instructions
    st.header("💡 Instrukcje")
    st.markdown("""
    **Jak używać:**
    1. Skopiuj opinie z Google Maps
    2. Wklej je w polu tekstowym powyżej
    3. Kliknij "Analizuj Opinie"
    
    **Obsługiwane formaty:**
    - Oceny: "1 gwiazdka", "2 gwiazdki", "1 star", "2 stars"
    - Daty: "15 grudnia 2023", "2 miesiące temu", "3 tygodnie temu"
    - Polubienia: "5 polubień", "3 likes", "2 👍"
    
    **Analiza obejmuje:**
    - Liczba opinii 1-2 gwiazdki
    - Rozkład w czasie (ostatnie 3-6 miesięcy)
    - Statystyki polubień
    - Wizualizacje i wykresy
    """)

if __name__ == "__main__":
    main()