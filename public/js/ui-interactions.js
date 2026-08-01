/* ==========================================================================
   마마트레이딩 (MAMA TRADING) - UI Interactions & Scroll Animation JavaScript
   ========================================================================== */

// 1. Sticky Pinned Scroll-Driven Slide & Bottom Bar Visibility
document.addEventListener('DOMContentLoaded', () => {
    const leftText = document.getElementById('giantLeftText');
    const rightText = document.getElementById('giantRightText');
    const stickyWrapper = document.querySelector('.hero-sticky-wrapper');
    const fixedBottomBar = document.getElementById('fixedBottomBar') || document.querySelector('.fixed-bottom-bar-wrapper');
    const secondSection = document.querySelector('.why-us-section');

    if (leftText && rightText && stickyWrapper) {
        const updateStickySlide = () => {
            const rect = stickyWrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const totalScrollableDistance = stickyWrapper.offsetHeight - windowHeight;
            
            // stickyWrapper 상단이 top 0에 도달했을 때부터 스크롤 진행도 계산 (0.0 ~ 1.0)
            let scrolled = -rect.top;
            let progress = Math.min(Math.max(scrolled / totalScrollableDistance, 0), 1);
            
            // 0.0 ~ 0.75 구간 동안 글자 결합 진행 (Ease-out 커브)
            let slideProgress = Math.min(progress / 0.75, 1);
            let easeProgress = 1 - Math.pow(1 - slideProgress, 3);

            const isMobile = window.innerWidth <= 768;

            // 좌측 'SPEED LOAN': 데스크톱 +1%, 모바일 0% (중앙 안착)
            const targetLeft = isMobile ? 0 : 1;
            const leftOffset = -100 + (easeProgress * (100 + targetLeft));
            leftText.style.transform = `translateX(${leftOffset}%)`;
            leftText.style.opacity = `${0.1 + (easeProgress * 0.9)}`;

            // 우측 'LOW RATE': 데스크톱 +1%, 모바일 0% (중앙 안착)
            const targetRight = isMobile ? 0 : 1;
            const rightOffset = 100 - (easeProgress * (100 - targetRight));
            rightText.style.transform = `translateX(${rightOffset}%)`;
            rightText.style.opacity = `${0.1 + (easeProgress * 0.9)}`;

            // 2번째 섹션(.why-us-section) 진입 시 하단 고정 바 노출
            if (fixedBottomBar && secondSection) {
                const secondSecTop = secondSection.getBoundingClientRect().top;
                if (secondSecTop <= windowHeight * 0.75 || progress >= 0.9) {
                    fixedBottomBar.classList.add('show-bar');
                } else {
                    fixedBottomBar.classList.remove('show-bar');
                }
            }
        };

        window.addEventListener('scroll', updateStickySlide, { passive: true });
        updateStickySlide(); // 초기 실행
    }

    // 2. Mobile Review Slider Scroll & Dot Indicator & Auto-Play Synchronization
    const reviewsGrid = document.getElementById('reviewsGrid');
    const dots = document.querySelectorAll('#reviewDots .dot');
    let autoSlideTimer = null;
    let currentReviewIndex = 0;

    if (reviewsGrid && dots.length > 0) {
        // 스크롤 시 dot 불빛 반영
        reviewsGrid.addEventListener('scroll', () => {
            const firstCard = reviewsGrid.querySelector('.review-card');
            if (!firstCard) return;
            const cardWidth = firstCard.offsetWidth + 16;
            const scrollLeft = reviewsGrid.scrollLeft;
            currentReviewIndex = Math.round(scrollLeft / cardWidth);

            dots.forEach((dot, idx) => {
                if (idx === currentReviewIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }, { passive: true });

        // 4. 대출 신청 폼 AJAX 비동기 DB 전송 연동
        const applyForms = document.querySelectorAll('form[action="/api/apply"], form[action="/apply"], #fixedLoanApplyForm, #fixedBottomForm, #mainLoanForm');
    
        applyForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(form);
                const dataObj = {
                    userName: formData.get('userName') || '',
                    userPhone: formData.get('userPhone') || '',
                    userAmount: formData.get('userAmount') || '',
                    loanType: formData.get('loanType') || '일반대출',
                    agreeChk: formData.get('agreeChk') ? true : false
                };

                const submitBtn = form.querySelector('button[type="submit"]');
                const origText = submitBtn ? submitBtn.innerHTML : '';

                try {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> 접수 중...`;
                    }

                    const response = await fetch('/api/apply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataObj)
                    });

                    const resData = await response.json();

                    if (resData.success) {
                        alert(resData.message);
                        form.reset();
                    } else {
                        alert(resData.message || '접수 중 오류가 발생했습니다.');
                    }

                } catch (err) {
                    console.error('Submit Error:', err);
                    alert('서버와 통신 중 에러가 발생했습니다.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = origText;
                    }
                }
            });
        });

        // Dot 클릭 시 해당 위치로 부드럽게 스크롤
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                const firstCard = reviewsGrid.querySelector('.review-card');
                if (!firstCard) return;
                const cardWidth = firstCard.offsetWidth + 16;
                reviewsGrid.scrollTo({
                    left: idx * cardWidth,
                    behavior: 'smooth'
                });
            });
        });

        // 2-1. Desktop & Mobile Review Slider Arrow Navigation (3개씩 슬라이딩)
        const prevBtn = document.getElementById('reviewPrevBtn');
        const nextBtn = document.getElementById('reviewNextBtn');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const firstCard = reviewsGrid.querySelector('.review-card');
                if (!firstCard) return;
                const isMobile = window.innerWidth <= 768;
                const scrollStep = isMobile ? (firstCard.offsetWidth + 16) : (firstCard.offsetWidth + 24) * 3;
                reviewsGrid.scrollBy({ left: -scrollStep, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                const firstCard = reviewsGrid.querySelector('.review-card');
                if (!firstCard) return;
                const isMobile = window.innerWidth <= 768;
                const scrollStep = isMobile ? (firstCard.offsetWidth + 16) : (firstCard.offsetWidth + 24) * 3;
                reviewsGrid.scrollBy({ left: scrollStep, behavior: 'smooth' });
            });
        }

        // 3.5초마다 자동으로 알아서 다음 카드로 넘어가기 (Auto-Play)
        const startAutoSlide = () => {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(() => {
                const firstCard = reviewsGrid.querySelector('.review-card');
                if (!firstCard) return;
                const isMobile = window.innerWidth <= 768;
                const cardWidth = firstCard.offsetWidth + (isMobile ? 16 : 24);
                const step = isMobile ? 1 : 3;
                const totalCards = reviewsGrid.querySelectorAll('.review-card').length;
                
                currentReviewIndex = (currentReviewIndex + step) % totalCards;
                reviewsGrid.scrollTo({
                    left: currentReviewIndex * cardWidth,
                    behavior: 'smooth'
                });
            }, 3500);
        };

        // 마우스 호버 및 터치 시 일시정지 (Pause) -> 마우스 이탈 및 터치 종료 시 재개 (Resume)
        reviewsGrid.addEventListener('mouseenter', () => {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
        });

        reviewsGrid.addEventListener('mouseleave', () => {
            startAutoSlide();
        });

        reviewsGrid.addEventListener('touchstart', () => {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
        }, { passive: true });

        reviewsGrid.addEventListener('touchend', () => {
            startAutoSlide();
        }, { passive: true });

        // 슬라이드 자동 구동 시작
        startAutoSlide();
    }

    // 1-1. 실시간 이용현황 롤링 티커 (JS 기반 100% 겹침 없는 무이음 롤링)
    const tickerList = document.querySelector('.f-ticker-list');
    if (tickerList) {
        let currentTickerIdx = 0;
        const totalTickerItems = tickerList.querySelectorAll('li').length; // 5개 (복사본 포함)

        setInterval(() => {
            currentTickerIdx++;
            tickerList.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            tickerList.style.transform = `translateY(-${currentTickerIdx * 30}px)`;

            // 4번(마지막) -> 5번(복사본)으로 이동 후 0으로 티 안 나게 원위치 복귀
            if (currentTickerIdx === totalTickerItems - 1) {
                setTimeout(() => {
                    tickerList.style.transition = 'none';
                    tickerList.style.transform = 'translateY(0)';
                    currentTickerIdx = 0;
                }, 400);
            }
        }, 2800);
    }

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
    }
});

// 5. 계산기 조건 연동 스무스 스크롤 이동 헬퍼 함수
function scrollToFormWithData() {
    const calcAmount = document.getElementById('calcAmountSlider');
    const fixedAmountSelect = document.querySelector('select[name="userAmount"]');
    const bottomForm = document.getElementById('fixedBottomForm') || document.getElementById('mainLoanForm') || document.querySelector('.fixed-bottom-bar-wrapper');

    if (calcAmount && fixedAmountSelect) {
        const val = parseInt(calcAmount.value, 10);
        let optVal = '100만원 이하';

        if (val <= 100) optVal = '100만원 이하';
        else if (val <= 300) optVal = '300만원';
        else if (val <= 500) optVal = '500만원';
        else if (val <= 1000) optVal = '1,000만원';
        else if (val <= 2000) optVal = '2,000만원';
        else optVal = '3,000만원 이상';

        fixedAmountSelect.value = optVal;
    }

    if (bottomForm) {
        bottomForm.scrollIntoView({ behavior: 'smooth' });
    }
}
window.scrollToFormWithData = scrollToFormWithData;

// 2. FAQ Accordion Toggle
function toggleFaq(buttonEl) {
    const itemEl = buttonEl.parentElement;
    const isOpen = itemEl.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
    });

    if (!isOpen) {
        itemEl.classList.add('open');
    }
}

// 3. Modal Controls
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
});

// 4. Mobile Navigation Drawer Toggle
function toggleMobileNav() {
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileOverlay');

    if (drawer && overlay) {
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');

        if (drawer.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}
