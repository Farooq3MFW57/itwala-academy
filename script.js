document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
        const target = Number(counter.dataset.count || 0);
        const duration = 900;
        const start = performance.now();

        const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(target * eased).toString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    });

    document.querySelectorAll(".success-bar-fill").forEach((bar) => {
        const value = Math.max(0, Math.min(100, Number(bar.dataset.value || 0)));

        requestAnimationFrame(() => {
            bar.style.width = `${value}%`;
        });
    });
});