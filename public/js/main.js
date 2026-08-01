/* ==========================================================================
   마마트레이딩 (MAMA TRADING) - Main Client JavaScript Logic
   ========================================================================== */

// 1. Interactive Quiz Wizard (3초 승인 진단기)
let quizData = {
    job: '',
    amount: ''
};

function nextQuizStep(currentStep, value) {
    if (currentStep === 1) {
        quizData.job = value;
        document.getElementById('qStep1').classList.remove('active');
        document.getElementById('qStep2').classList.add('active');
    } else if (currentStep === 2) {
        quizData.amount = value;
        document.getElementById('qStep2').classList.remove('active');
        document.getElementById('qStep3').classList.add('active');

        // Animate Circle Gauge Rate
        let rateValEl = document.getElementById('gaugeVal');
        let currentRate = 0;
        let targetRate = 96.4;
        let interval = setInterval(() => {
            currentRate += 3.2;
            if (currentRate >= targetRate) {
                currentRate = targetRate;
                clearInterval(interval);
            }
            rateValEl.innerText = currentRate.toFixed(1) + '%';
        }, 30);
    }
}

// 2. Realtime Loan Calculator (실시간 대출 계산기)
function updateCalculator() {
    const amountSlider = document.getElementById('calcAmountSlider');
    const periodSlider = document.getElementById('calcPeriodSlider');
    const rateSlider = document.getElementById('calcRateSlider');

    if (!amountSlider || !periodSlider || !rateSlider) return;

    const amountTenThousand = parseFloat(amountSlider.value); // 만원 단위
    const principal = amountTenThousand * 10000; // 원 단위
    const months = parseInt(periodSlider.value);
    const annualRate = parseFloat(rateSlider.value);
    const monthlyRate = annualRate / 12 / 100;

    // Format Text Displays
    document.getElementById('calcAmountText').innerText = amountTenThousand.toLocaleString() + ' 만원';
    document.getElementById('calcPeriodText').innerText = months + ' 개월';
    document.getElementById('calcRateText').innerText = '연 ' + annualRate.toFixed(1) + ' %';

    // Calculate Equal Principal and Interest Repayment (원리금균등상환)
    let monthlyPayment = 0;
    if (monthlyRate === 0) {
        monthlyPayment = principal / months;
    } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    // Render Results
    document.getElementById('calcMonthlyPayment').innerText = Math.round(monthlyPayment).toLocaleString() + ' 원';
    document.getElementById('calcTotalPayment').innerText = Math.round(totalPayment).toLocaleString() + ' 원';
    document.getElementById('calcTotalInterest').innerText = Math.round(totalInterest).toLocaleString() + ' 원';

    // Update Visual Chip Comparison
    const dailyCost = Math.round(monthlyPayment / 30);
    const chipTextEl = document.getElementById('chipText');
    if (dailyCost <= 15000) {
        chipTextEl.innerText = `☕ 하루 커피 한 잔 값(약 ${dailyCost.toLocaleString()}원)으로 부담 없이 해결!`;
    } else if (dailyCost <= 30000) {
        chipTextEl.innerText = `🍔 하루 햄버거 세트 한 번 비용(약 ${dailyCost.toLocaleString()}원)으로 준비!`;
    } else {
        chipTextEl.innerText = `🍕 하루 맛있는 음식 한 번 비용(약 ${dailyCost.toLocaleString()}원)으로 든든 해결!`;
    }
}

// 3. Smooth Scroll to Form & Auto Data Filling
function scrollToForm() {
    const formArea = document.getElementById('applicationFormArea');
    if (formArea) {
        formArea.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToFormWithData() {
    const amountVal = document.getElementById('calcAmountText').innerText;
    const selectEl = document.getElementById('userAmount');
    
    if (selectEl) {
        selectEl.value = '3,000만원 이상'; // fallback
        for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].text.includes(amountVal.replace(' 만원', '만'))) {
                selectEl.selectedIndex = i;
                break;
            }
        }
    }
    scrollToForm();
}

// 4. AJAX Form Submission Handler (3분 안심 한도조회 제출)
function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const userName = (form.userName?.value || '').trim();
    const userPhone = (form.userPhone?.value || '').trim();
    const userAmount = form.userAmount?.value || '미지정';
    const agreeChk = form.agreeChk?.checked ? true : false;

    if (!userName || !userPhone) {
        alert('필수 항목(성함, 연락처)을 입력해 주세요.');
        return;
    }

    if (userPhone.length < 10) {
        alert('올바른 연락처 10~11자리를 입력해 주세요.');
        return;
    }

    // Submit via Fetch API to /api/apply
    fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, userPhone, userAmount, agreeChk })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            form.reset();
        } else {
            alert(data.message || '접수 중 오류가 발생했습니다.');
        }
    })
    .catch(err => {
        alert('상담 신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        console.error(err);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    updateCalculator();
});
