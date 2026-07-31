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

            // 우측 'LOW RATE': 데스크톱 +5%, 모바일 0% (중앙 안착)
            const targetRight = isMobile ? 0 : 5;
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
        const applyForms = document.querySelectorAll('form[action="/apply"], #fixedBottomForm, #mainLoanForm');
    
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

        // 3.5초마다 자동으로 알아서 다음 카드로 넘어가기 (Auto-Play)
        const startAutoSlide = () => {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(() => {
                const firstCard = reviewsGrid.querySelector('.review-card');
                if (!firstCard) return;
                const cardWidth = firstCard.offsetWidth + 16;
                const totalCards = dots.length;
                
                currentReviewIndex = (currentReviewIndex + 1) % totalCards;
                reviewsGrid.scrollTo({
                    left: currentReviewIndex * cardWidth,
                    behavior: 'smooth'
                });
            }, 3500);
        };

        // 모바일 터치 중일 때는 자동 넘김 잠시 멈춤(Pause) -> 손 떼면 재개(Resume)
        reviewsGrid.addEventListener('touchstart', () => {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
        }, { passive: true });

        reviewsGrid.addEventListener('touchend', () => {
            startAutoSlide();
        }, { passive: true });

        // 모바일 접속 시 자동 슬라이드 구동
        if (window.innerWidth <= 768) {
            startAutoSlide();
        }
    }
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
});

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
