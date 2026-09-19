(function () {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animateCounter(counter) {
        if (counter.dataset.animated === "true") {
            return;
        }

        counter.dataset.animated = "true";

        const target = Number(counter.dataset.count || 0);

        if (prefersReducedMotion) {
            counter.textContent = String(target);
            return;
        }

        const duration = 1100;
        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = String(Math.round(target * eased));

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    function revealElement(element) {
        element.classList.add("is-visible");

        element.querySelectorAll(".success-bar-fill").forEach(function (bar) {
            const value = Number(bar.dataset.value || 0);
            bar.style.width = Math.max(0, Math.min(value, 100)) + "%";
        });

        element.querySelectorAll(".counter").forEach(animateCounter);
    }

    function boot() {
        const revealTargets = document.querySelectorAll(".stats, .success-lab");

        if (!("IntersectionObserver" in window)) {
            revealTargets.forEach(revealElement);
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    revealElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.22
        });

        revealTargets.forEach(function (target) {
            observer.observe(target);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
}());